import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { User, ActiveCallState } from '../types';

const rtcConfig: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

let localStream: MediaStream | null = null;
let peerConnection: RTCPeerConnection | null = null;

// Get actual user media (Microphone / Camera) with resilient fallback
export async function getMediaStream(callType: 'audio' | 'video'): Promise<MediaStream> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: callType === 'video',
    });
    localStream = stream;
    return stream;
  } catch (err) {
    console.warn('Microphone/Camera access not permitted or unavailable; generating Web Audio stream:', err);
    // Create silent/synthetic audio track so WebRTC call still works seamlessly
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const dst = ctx.createMediaStreamDestination();
    osc.connect(dst);
    osc.start();
    localStream = dst.stream;
    return dst.stream;
  }
}

// Initiate Real WebRTC Call via Cloud Firestore
export async function initiateRealCall(
  caller: User,
  receiver: User,
  callType: 'audio' | 'video'
): Promise<string> {
  const callId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const callDocRef = doc(db, 'calls', callId);

  // Initialize peer connection
  peerConnection = new RTCPeerConnection(rtcConfig);
  const stream = await getMediaStream(callType);
  stream.getTracks().forEach((track) => peerConnection?.addTrack(track, stream));

  // Collect ICE candidates and save to Firestore
  const callerCandidatesCollection = collection(callDocRef, 'callerCandidates');
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      addDoc(callerCandidatesCollection, event.candidate.toJSON()).catch((err) =>
        console.error('Error adding ICE candidate:', err)
      );
    }
  };

  // Create WebRTC Offer
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);

  const callData = {
    id: callId,
    roomId: `AM-ROOM-${Math.floor(1000 + Math.random() * 9000)}`,
    callerId: caller.id,
    callerName: caller.name,
    callerAvatar: caller.avatar || '',
    receiverId: receiver.id,
    receiverName: receiver.name,
    receiverAvatar: receiver.avatar || '',
    callType,
    status: 'incoming',
    startedAt: Date.now(),
    disconnectedAt: 0,
    gracePeriodExpiresAt: Date.now() + 60 * 60 * 1000, // 60 minutes
    offer: {
      type: offer.type,
      sdp: offer.sdp,
    },
    answer: null,
  };

  try {
    await setDoc(callDocRef, callData);

    // Listen for receiver's answer
    onSnapshot(callDocRef, (snapshot) => {
      const data = snapshot.data();
      if (peerConnection && !peerConnection.currentRemoteDescription && data?.answer) {
        const answerDesc = new RTCSessionDescription(data.answer);
        peerConnection.setRemoteDescription(answerDesc).catch((e) => console.error(e));
      }
    });

    // Listen for receiver's ICE candidates
    const receiverCandidatesCollection = collection(callDocRef, 'receiverCandidates');
    onSnapshot(receiverCandidatesCollection, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const candidate = new RTCIceCandidate(change.doc.data());
          peerConnection?.addIceCandidate(candidate).catch((e) => console.error(e));
        }
      });
    });

    return callId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `calls/${callId}`);
    return callId;
  }
}

// Answer incoming WebRTC call
export async function answerRealCall(callId: string, callType: 'audio' | 'video'): Promise<void> {
  const callDocRef = doc(db, 'calls', callId);
  const callDoc = await getDoc(callDocRef);
  const callData = callDoc.data();

  if (!callData) return;

  peerConnection = new RTCPeerConnection(rtcConfig);
  const stream = await getMediaStream(callType);
  stream.getTracks().forEach((track) => peerConnection?.addTrack(track, stream));

  // Collect ICE candidates from receiver
  const receiverCandidatesCollection = collection(callDocRef, 'receiverCandidates');
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      addDoc(receiverCandidatesCollection, event.candidate.toJSON()).catch((e) => console.error(e));
    }
  };

  // Set remote description from caller offer
  const offerDesc = new RTCSessionDescription(callData.offer);
  await peerConnection.setRemoteDescription(offerDesc);

  // Create and set local answer
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);

  try {
    await updateDoc(callDocRef, {
      answer: {
        type: answer.type,
        sdp: answer.sdp,
      },
      status: 'connected',
    });

    // Listen for caller's candidates
    const callerCandidatesCollection = collection(callDocRef, 'callerCandidates');
    onSnapshot(callerCandidatesCollection, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const candidate = new RTCIceCandidate(change.doc.data());
          peerConnection?.addIceCandidate(candidate).catch((e) => console.error(e));
        }
      });
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `calls/${callId}`);
  }
}

// Subscribe to incoming calls for current user
export function subscribeToIncomingCalls(
  currentUserId: string,
  callback: (call: ActiveCallState | null) => void
) {
  if (!auth.currentUser || !currentUserId || auth.currentUser.uid !== currentUserId) {
    return () => {};
  }

  const q = query(
    collection(db, 'calls'),
    where('receiverId', '==', currentUserId),
    where('status', '==', 'incoming')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        callback(null);
        return;
      }
      const docSnap = snapshot.docs[0];
      const d = docSnap.data();
      callback({
        id: d.id,
        roomId: d.roomId,
        peerUser: {
          id: d.callerId,
          name: d.callerName,
          username: d.callerId,
          avatar: d.callerAvatar,
          isOnline: true,
        },
        callType: d.callType,
        status: 'incoming',
        startedAt: d.startedAt,
        durationSeconds: 0,
        isMuted: false,
        isSpeaker: true,
        isVideoEnabled: d.callType === 'video',
        isFrontCamera: true,
        gracePeriodExpiresAt: d.gracePeriodExpiresAt,
        isMinimized: false,
      });
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, 'calls');
    }
  );
}

// Report internet disconnect and mark call as waiting for up to 60 minutes
export async function reportRealDisconnect(callId: string): Promise<void> {
  const callDocRef = doc(db, 'calls', callId);
  try {
    await updateDoc(callDocRef, {
      status: 'disconnected_waiting',
      disconnectedAt: Date.now(),
      gracePeriodExpiresAt: Date.now() + 60 * 60 * 1000, // 60 minutes server deadline
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `calls/${callId}`);
  }
}

// Restore Call Session during the 60-Minute Grace Period
export async function restoreRealCallSession(callId: string): Promise<boolean> {
  const callDocRef = doc(db, 'calls', callId);
  try {
    const snap = await getDoc(callDocRef);
    if (!snap.exists()) return false;

    const d = snap.data();
    // Validate that 60 minutes have not expired
    if (Date.now() > (d.gracePeriodExpiresAt || 0)) {
      console.warn('Call grace period of 60 minutes has expired.');
      return false;
    }

    // Restore call connection status
    await updateDoc(callDocRef, {
      status: 'connected',
      reconnectedAt: Date.now(),
    });

    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `calls/${callId}`);
    return false;
  }
}

// End call for everyone and release media tracks
export async function endRealCall(callId: string): Promise<void> {
  if (localStream) {
    localStream.getTracks().forEach((t) => t.stop());
    localStream = null;
  }
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }

  const callDocRef = doc(db, 'calls', callId);
  try {
    await updateDoc(callDocRef, {
      status: 'ended',
      endedAt: Date.now(),
    });
  } catch (error) {
    // If call was already ended, ignore
  }
}
