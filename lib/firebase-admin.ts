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
  // 환경 변수에서 service account key 읽기
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccount) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set');
  }

  try {
    // 환경 변수에서 \n이 실제 줄바꿈으로 변환되도록 처리
    const serviceAccountParsed = serviceAccount.replace(/\\n/g, '\n');
    const serviceAccountKey = JSON.parse(serviceAccountParsed);

    app = initializeApp({
      credential: cert(serviceAccountKey),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
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
