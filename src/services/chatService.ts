import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  arrayUnion,
  serverTimestamp,
  getDocs,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { User, Conversation, ChatMessage, FriendRequest } from '../types';

// Ensure user profile exists in Cloud Firestore
export async function syncUserProfile(user: User): Promise<void> {
  const userRef = doc(db, 'users', user.id);
  try {
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        id: user.id,
        name: user.name,
        username: user.username.toLowerCase(),
        avatar: user.avatar || '',
        bio: user.bio || 'مستخدم في شبكة A«»M للتواصل',
        isOnline: true,
        lastSeen: 'متصل الآن',
        friends: [],
        createdAt: new Date().toISOString(),
      });
      // Register username index for fast lookup
      await setDoc(doc(db, 'usernames', user.username.toLowerCase()), {
        userId: user.id,
        name: user.name,
        avatar: user.avatar || '',
      });
    } else {
      await updateDoc(userRef, {
        isOnline: true,
        lastSeen: 'متصل الآن',
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${user.id}`);
  }
}

// Search users in Cloud Firestore by username or name (No blocking/deletion)
export async function searchUsersInFirestore(searchTerm: string, currentUserId: string): Promise<User[]> {
  const term = searchTerm.trim().toLowerCase();
  if (!term) return [];

  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    const results: User[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.id !== currentUserId) {
        const uName = (data.name || '').toLowerCase();
        const uUsername = (data.username || '').toLowerCase();
        if (uName.includes(term) || uUsername.includes(term)) {
          results.push({
            id: data.id,
            name: data.name,
            username: data.username,
            avatar: data.avatar,
            bio: data.bio,
            isOnline: data.isOnline || false,
            lastSeen: data.lastSeen,
          });
        }
      }
    });

    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'users');
    return [];
  }
}

// Send real friend request in Firestore
export async function sendRealFriendRequest(sender: User, receiverId: string): Promise<void> {
  const requestId = `${sender.id}_${receiverId}`;
  const reqRef = doc(db, 'friendRequests', requestId);

  try {
    await setDoc(reqRef, {
      id: requestId,
      senderId: sender.id,
      senderName: sender.name,
      senderAvatar: sender.avatar,
      receiverId: receiverId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `friendRequests/${requestId}`);
  }
}

// Listen to incoming friend requests in real-time
export function subscribeToFriendRequests(userId: string, callback: (requests: FriendRequest[]) => void) {
  if (!auth.currentUser || !userId || auth.currentUser.uid !== userId) {
    return () => {};
  }

  const q = query(
    collection(db, 'friendRequests'),
    where('receiverId', '==', userId),
    where('status', '==', 'pending')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: FriendRequest[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        list.push({
          id: d.id,
          user: {
            id: d.senderId,
            name: d.senderName,
            username: d.senderId,
            avatar: d.senderAvatar,
            isOnline: true,
          },
          requestedAt: 'يرغب بإضافتك كصديق',
        });
      });
      callback(list);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, 'friendRequests');
    }
  );
}

// Accept friend request and link users mutually (No deletion/blocking)
export async function acceptRealFriendRequest(requestId: string, senderId: string, receiverId: string): Promise<void> {
  try {
    // 1. Update request status
    await updateDoc(doc(db, 'friendRequests', requestId), {
      status: 'accepted',
    });

    // 2. Add to sender's and receiver's friends array
    await updateDoc(doc(db, 'users', receiverId), {
      friends: arrayUnion(senderId),
    });
    await updateDoc(doc(db, 'users', senderId), {
      friends: arrayUnion(receiverId),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `friendRequests/${requestId}`);
  }
}

// Decline friend request
export async function declineRealFriendRequest(requestId: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'friendRequests', requestId), {
      status: 'declined',
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `friendRequests/${requestId}`);
  }
}

// Subscribe to friends details in Firestore
export function subscribeToFriends(friendIds: string[], callback: (friends: User[]) => void) {
  if (!friendIds || friendIds.length === 0) {
    callback([]);
    return () => {};
  }

  // Firestore allows up to 30 elements in an 'in' query
  const safeIds = friendIds.slice(0, 30);
  const q = query(collection(db, 'users'), where('id', 'in', safeIds));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: User[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        list.push({
          id: data.id,
          name: data.name,
          username: data.username,
          avatar: data.avatar,
          bio: data.bio,
          isOnline: data.isOnline || false,
          lastSeen: data.lastSeen,
        });
      });
      callback(list);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, 'users');
    }
  );
}

// Get or create conversation in Firestore
export async function getOrCreateRealConversation(
  currentUser: User,
  peerUser: User
): Promise<string> {
  const convId = [currentUser.id, peerUser.id].sort().join('_');
  const convRef = doc(db, 'conversations', convId);

  try {
    const snap = await getDoc(convRef);
    if (!snap.exists()) {
      await setDoc(convRef, {
        id: convId,
        participants: [currentUser.id, peerUser.id],
        participantData: {
          [currentUser.id]: { name: currentUser.name, avatar: currentUser.avatar },
          [peerUser.id]: { name: peerUser.name, avatar: peerUser.avatar },
        },
        lastMessage: 'بدء المحادثة في A«»M',
        lastMessageTime: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        lastMessageType: 'text',
        updatedAt: new Date().toISOString(),
      });
    }
    return convId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `conversations/${convId}`);
    return convId;
  }
}

// Send Real Message to Cloud Firestore
export async function sendRealChatMessage(
  convId: string,
  message: Partial<ChatMessage>
): Promise<void> {
  const msgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const msgRef = doc(db, 'conversations', convId, 'messages', msgId);

  const payload = {
    id: msgId,
    senderId: message.senderId || auth.currentUser?.uid || 'anon',
    text: message.text || '',
    type: message.type || 'text',
    mediaUrl: message.mediaUrl || '',
    audioDuration: message.audioDuration || '',
    timestamp: message.timestamp || new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(msgRef, payload);

    // Update parent conversation summary
    const convRef = doc(db, 'conversations', convId);
    await updateDoc(convRef, {
      lastMessage: payload.text || (payload.type === 'image' ? 'أرسل لك الصورة' : 'رسالة صوتية'),
      lastMessageTime: payload.timestamp,
      lastMessageType: payload.type,
      updatedAt: payload.createdAt,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `conversations/${convId}/messages/${msgId}`);
  }
}

// Subscribe to messages in a conversation in real-time
export function subscribeToMessages(convId: string, callback: (messages: ChatMessage[]) => void) {
  if (!auth.currentUser || !convId || convId.startsWith('conv_')) {
    return () => {};
  }

  const q = query(
    collection(db, 'conversations', convId, 'messages'),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const msgs: ChatMessage[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        msgs.push({
          id: d.id,
          senderId: d.senderId,
          text: d.text,
          type: d.type,
          mediaUrl: d.mediaUrl,
          audioDuration: d.audioDuration,
          timestamp: d.timestamp,
          status: 'read',
        });
      });
      callback(msgs);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, `conversations/${convId}/messages`);
    }
  );
}

// Subscribe to all conversations for user
export function subscribeToConversations(userId: string, callback: (conversations: Conversation[]) => void) {
  if (!auth.currentUser || !userId || auth.currentUser.uid !== userId) {
    return () => {};
  }

  const q = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const convs: Conversation[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        const otherId = (d.participants || []).find((p: string) => p !== userId) || userId;
        const otherData = d.participantData?.[otherId] || { name: 'مستخدم A«»M', avatar: '' };

        convs.push({
          id: d.id,
          peerUser: {
            id: otherId,
            name: otherData.name,
            username: otherId,
            avatar: otherData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
            isOnline: true,
          },
          lastMessage: d.lastMessage || '',
          lastMessageTime: d.lastMessageTime || '',
          unreadCount: 0,
          lastMessageType: d.lastMessageType || 'text',
          messages: [],
        });
      });
      callback(convs);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, 'conversations');
    }
  );
}
