/**
 * Firebase Admin SDK 초기화
 * 서버사이드에서 사용되는 Firebase Admin SDK 설정
 */

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

let app: App | undefined;
let adminDb: Firestore | undefined;
let adminAuth: Auth | undefined;

// Firebase Admin 초기화 (중복 초기화 방지)
if (!getApps().length) {
  try {
    // 방법 1: 개별 환경 변수 사용 (권장 - Vercel에서 사용)
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (projectId && clientEmail && privateKey) {
      // private key의 \n을 실제 줄바꿈으로 변환
      const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');

      app = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey: formattedPrivateKey,
        }),
        projectId,
      });

      adminDb = getFirestore(app);
      adminAuth = getAuth(app);

      console.log('Firebase Admin initialized with individual credentials');
    } else {
      console.warn('Firebase Admin credentials not configured. Some features may not work.');
      console.warn('Please set FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY environment variables.');
    }
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    // 개발 환경에서는 에러를 던지지 않고 경고만 표시
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
  }
} else {
  app = getApps()[0];
  if (app) {
    adminDb = getFirestore(app);
    adminAuth = getAuth(app);
  }
}

// Safe exports - undefined일 수 있음을 명시
export { adminDb, adminAuth };
export default app;
