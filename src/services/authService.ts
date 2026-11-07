import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from './firebase';
import { User } from '../types';

export interface RegisterUserParams {
  fullName: string;
  username: string;
  email: string;
  password: string;
  phoneNumber?: string;
  avatar?: string;
  bio?: string;
}

export interface AuthErrorDetails {
  message: string;
  code?: string;
  isProviderRestricted?: boolean;
}

// Convert Firebase Authentication errors to clear, friendly Arabic messages
export function parseAuthError(error: unknown): AuthErrorDetails {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = (error as { code: string }).code;
    switch (code) {
      case 'auth/admin-restricted-operation':
      case 'auth/operation-not-allowed':
        return {
          code,
          isProviderRestricted: true,
          message:
            'يتطلب تفعيل موفر (Email/Password) في لوحة تحكم مشروع Firebase أولاً لتسجيل الحسابات بالبريد. يرجى تفعيله من الرابط بالأسفل، أو استخدام الدخول عبر Google.',
        };
      case 'auth/email-already-in-use':
        return {
          code,
          message: 'هذا البريد الإلكتروني مسجل مسبقاً في A«»M. يرجى تسجيل الدخول أو استخدام بريد آخر.',
        };
      case 'auth/weak-password':
        return {
          code,
          message: 'كلمة المرور ضعيفة جداً. يجب أن تحتوي على 6 خانات أو أحرف على الأقل.',
        };
      case 'auth/invalid-email':
        return {
          code,
          message: 'صيغة البريد الإلكتروني غير صالحة. يرجى إدخال بريد صالح (مثال: name@example.com).',
        };
      case 'auth/user-not-found':
        return {
          code,
          message: 'لا يوجد حساب مسجل بهذه البيانات. يرجى التأكد من البريد أو إنشاء حساب جديد.',
        };
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return {
          code,
          message: 'بيانات الدخول غير صحيحة. يرجى التحقق من اسم المستخدم أو كلمة المرور.',
        };
      case 'auth/popup-closed-by-user':
        return {
          code,
          message: 'تم إلغاء نافذة المصادقة عبر Google. يرجى المحاولة مجدداً.',
        };
      case 'auth/network-request-failed':
        return {
          code,
          message: 'تعذر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.',
        };
      default:
        return {
          code,
          message: `خطأ في المصادقة: ${code}`,
        };
    }
  }
  return {
    message: error instanceof Error ? error.message : 'حدث خطأ غير متوقع أثناء المصادقة.',
  };
}

/**
 * Register a new user using Firebase Authentication and save profile to Cloud Firestore
 */
export async function registerNewUser(params: RegisterUserParams): Promise<User> {
  const cleanEmail = params.email.trim().toLowerCase();
  const cleanUsername = params.username.trim().toLowerCase();
  const cleanName = params.fullName.trim();

  // 1. Check if username is already taken in Cloud Firestore
  try {
    const usernameDoc = await getDoc(doc(db, 'usernames', cleanUsername));
    if (usernameDoc.exists()) {
      throw {
        code: 'auth/username-taken',
        message: 'اسم المستخدم هذا محجوز مسبقاً، يرجى اختيار اسم مستخدم آخر.',
      };
    }
  } catch (err: unknown) {
    if (typeof err === 'object' && err !== null && 'code' in err && (err as { code: string }).code === 'auth/username-taken') {
      throw err;
    }
    // Proceed if collection is empty or fresh
  }

  // 2. Create user in Firebase Authentication
  const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, params.password);
  const firebaseUser = userCredential.user;

  // 3. Update Firebase Auth Profile displayName
  try {
    await updateProfile(firebaseUser, {
      displayName: cleanName,
      photoURL: params.avatar || '',
    });
  } catch (err) {
    console.warn('Could not update Auth profile displayName:', err);
  }

  // 4. Construct complete User profile
  const newUser: User = {
    id: firebaseUser.uid,
    name: cleanName,
    username: cleanUsername,
    email: cleanEmail,
    phone: params.phoneNumber?.trim() || '',
    avatar:
      params.avatar ||
      firebaseUser.photoURL ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bio: params.bio?.trim() || 'مستخدم جديد في شبكة A«»M للتواصل',
    isOnline: true,
    lastSeen: 'متصل الآن',
    postsCount: 0,
    followersCount: 0,
    friendsCount: 0,
  };

  // 5. Store user document in Cloud Firestore (users collection)
  const userRef = doc(db, 'users', firebaseUser.uid);
  try {
    await setDoc(userRef, {
      id: newUser.id,
      name: newUser.name,
      username: newUser.username,
      email: newUser.email,
      phone: newUser.phone,
      avatar: newUser.avatar,
      bio: newUser.bio,
      isOnline: true,
      lastSeen: 'متصل الآن',
      friends: [],
      createdAt: new Date().toISOString(),
    });

    // 6. Index username in Firestore for fast, unique lookup
    await setDoc(doc(db, 'usernames', cleanUsername), {
      userId: firebaseUser.uid,
      name: newUser.name,
      avatar: newUser.avatar,
      registeredAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${firebaseUser.uid}`);
  }

  return newUser;
}

/**
 * Sign in existing user with Email or Username and Password
 */
export async function loginWithEmail(identifier: string, password: string): Promise<User> {
  let emailToUse = identifier.trim().toLowerCase();

  // If user entered a username instead of email, check usernames index in Firestore
  if (!emailToUse.includes('@')) {
    try {
      const usernameSnap = await getDoc(doc(db, 'usernames', emailToUse));
      if (usernameSnap.exists()) {
        const uData = usernameSnap.data();
        const userDoc = await getDoc(doc(db, 'users', uData.userId));
        if (userDoc.exists() && userDoc.data().email) {
          emailToUse = userDoc.data().email;
        } else {
          emailToUse = `${emailToUse}@am-app.com`;
        }
      } else {
        emailToUse = `${emailToUse}@am-app.com`;
      }
    } catch {
      emailToUse = `${emailToUse}@am-app.com`;
    }
  }

  // Sign in via Firebase Authentication
  const credential = await signInWithEmailAndPassword(auth, emailToUse, password);
  const fUser = credential.user;

  // Retrieve or sync profile from Cloud Firestore
  const userRef = doc(db, 'users', fUser.uid);
  let appUser: User;

  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const d = snap.data();
      appUser = {
        id: fUser.uid,
        name: d.name || fUser.displayName || 'مستخدم A«»M',
        username: d.username || fUser.email?.split('@')[0] || 'user',
        avatar: d.avatar || fUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        email: d.email || fUser.email || '',
        phone: d.phone || '',
        bio: d.bio || '',
        isOnline: true,
        lastSeen: 'متصل الآن',
      };
      await updateDoc(userRef, { isOnline: true, lastSeen: 'متصل الآن' });
    } else {
      appUser = {
        id: fUser.uid,
        name: fUser.displayName || 'مستخدم A«»M',
        username: fUser.email ? fUser.email.split('@')[0] : 'user',
        avatar: fUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        email: fUser.email || '',
        isOnline: true,
        lastSeen: 'متصل الآن',
      };
      await setDoc(userRef, {
        id: appUser.id,
        name: appUser.name,
        username: appUser.username,
        email: appUser.email,
        avatar: appUser.avatar,
        bio: 'مستخدم في شبكة A«»M للتواصل',
        isOnline: true,
        lastSeen: 'متصل الآن',
        friends: [],
        createdAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${fUser.uid}`);
    appUser = {
      id: fUser.uid,
      name: fUser.displayName || 'مستخدم A«»M',
      username: fUser.email ? fUser.email.split('@')[0] : 'user',
      avatar: fUser.photoURL || '',
      email: fUser.email || '',
      isOnline: true,
    };
  }

  return appUser;
}

/**
 * Sign in using Google OAuth Popup (pre-configured & active)
 */
export async function loginWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  const fUser = result.user;

  const userRef = doc(db, 'users', fUser.uid);
  const usernameClean = (fUser.email ? fUser.email.split('@')[0] : 'user').toLowerCase();

  const appUser: User = {
    id: fUser.uid,
    name: fUser.displayName || 'مستخدم A«»M',
    username: usernameClean,
    avatar: fUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    email: fUser.email || '',
    isOnline: true,
    lastSeen: 'متصل الآن',
  };

  try {
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        id: appUser.id,
        name: appUser.name,
        username: appUser.username,
        email: appUser.email,
        avatar: appUser.avatar,
        bio: 'مستخدم في شبكة A«»M للتواصل',
        isOnline: true,
        lastSeen: 'متصل الآن',
        friends: [],
        createdAt: new Date().toISOString(),
      });
      await setDoc(doc(db, 'usernames', usernameClean), {
        userId: appUser.id,
        name: appUser.name,
        avatar: appUser.avatar,
        registeredAt: new Date().toISOString(),
      });
    } else {
      await updateDoc(userRef, { isOnline: true, lastSeen: 'متصل الآن' });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${fUser.uid}`);
  }

  return appUser;
}

/**
 * Sign out user
 */
export async function logoutUser(userId?: string): Promise<void> {
  if (userId) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        isOnline: false,
        lastSeen: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      });
    } catch {
      // Ignore if offline
    }
  }
  await signOut(auth);
}
