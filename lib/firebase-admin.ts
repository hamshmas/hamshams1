/**
 * Firebase Admin SDK 초기화
 * 서버사이드에서 사용되는 Firebase Admin SDK 설정
 */

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

let app: App;

// Firebase Admin 초기화 (중복 초기화 방지)
if (!getApps().length) {
  try {
    // 방법 1: 개별 환경 변수 사용 (권장)
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
    }
    // 방법 2: JSON 문자열 사용 (백업)
    else {
      const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

      if (!serviceAccount) {
        throw new Error('Firebase Admin credentials not set. Please set either individual variables (FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY) or FIREBASE_SERVICE_ACCOUNT_KEY');
      }

      const serviceAccountParsed = serviceAccount.replace(/\\n/g, '\n');
      const serviceAccountKey = JSON.parse(serviceAccountParsed);

      app = initializeApp({
        credential: cert(serviceAccountKey),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    }
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    throw error;
  }
} else {
  app = getApps()[0];
}

// Firestore 및 Auth 인스턴스 (Admin)
export const adminDb: Firestore = getFirestore(app);
export const adminAuth: Auth = getAuth(app);

export default app;
