# Firebase 설정 가이드

개인회생 상담 데이터 관리를 위한 Firebase Firestore 설정 가이드입니다.

## 📋 목차

1. [Firebase 프로젝트 생성](#1-firebase-프로젝트-생성)
2. [Firestore 데이터베이스 활성화](#2-firestore-데이터베이스-활성화)
3. [Firebase 웹 앱 등록](#3-firebase-웹-앱-등록)
4. [Firebase Admin SDK 설정](#4-firebase-admin-sdk-설정)
5. [환경 변수 설정](#5-환경-변수-설정)
6. [Security Rules 설정](#6-security-rules-설정)
7. [테스트](#7-테스트)

---

## 1. Firebase 프로젝트 생성

### 1.1 Firebase Console 접속
1. [Firebase Console](https://console.firebase.google.com/) 접속
2. Google 계정으로 로그인

### 1.2 프로젝트 생성
1. "프로젝트 추가" 클릭
2. 프로젝트 이름 입력 (예: "hamshams-consultation")
3. Google Analytics 설정 (선택사항)
4. 프로젝트 생성 완료

---

## 2. Firestore 데이터베이스 활성화

### 2.1 Firestore 생성
1. 좌측 메뉴에서 **"Firestore Database"** 클릭
2. **"데이터베이스 만들기"** 클릭
3. 위치 선택:
   - 프로덕션 모드로 시작 (권장)
   - 위치: `asia-northeast3 (Seoul)` 선택
4. **"사용 설정"** 클릭

### 2.2 컬렉션 생성 (선택)
데이터베이스가 생성되면 자동으로 `consultations` 컬렉션이 생성됩니다.

---

## 3. Firebase 웹 앱 등록

### 3.1 웹 앱 추가
1. 프로젝트 개요 페이지에서 **"</>  웹"** 아이콘 클릭
2. 앱 닉네임 입력 (예: "hamshams-web")
3. Firebase Hosting 설정은 건너뛰기
4. **"앱 등록"** 클릭

### 3.2 Firebase SDK 구성 복사
앱 등록 후 표시되는 Firebase 구성 정보를 복사합니다:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

이 정보는 나중에 `.env.local` 파일에 입력합니다.

---

## 4. Firebase Admin SDK 설정

### 4.1 서비스 계정 키 생성
1. 프로젝트 설정 (⚙️ 아이콘) 클릭
2. **"서비스 계정"** 탭 선택
3. **"새 비공개 키 생성"** 클릭
4. **"키 생성"** 확인
5. JSON 파일 다운로드 (예: `hamshams-consultation-firebase-adminsdk.json`)

### 4.2 서비스 계정 키 저장
⚠️ **주의**: 이 파일은 절대 Git에 커밋하지 마세요!

다운로드한 JSON 파일 내용:
```json
{
  "type": "service_account",
  "project_id": "YOUR_PROJECT_ID",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@YOUR_PROJECT_ID.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

---

## 5. 환경 변수 설정

### 5.1 .env.local 파일 생성/수정
프로젝트 루트에 `.env.local` 파일을 생성하거나 기존 파일을 수정합니다.

```bash
# Kakao JavaScript Key (기존)
NEXT_PUBLIC_KAKAO_JS_KEY=d6dae6629fbc3d4b9ae79e086995c0f5

# Firebase Configuration (Firebase Console > 프로젝트 설정 > 일반 > 웹 앱에서 복사)
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT_ID.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT_ID.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID

# Firebase Admin SDK (Service Account Key - JSON 파일 내용을 한 줄로)
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"YOUR_PROJECT_ID","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}
```

### 5.2 JSON 한 줄로 변환하기
다운로드한 JSON 파일을 한 줄로 변환:

**방법 1: 온라인 도구 사용**
- https://jsonformatter.org/json-minify

**방법 2: Node.js 사용**
```bash
cat firebase-adminsdk.json | node -e "console.log(JSON.stringify(JSON.parse(require('fs').readFileSync(0, 'utf-8'))))"
```

**방법 3: VS Code 사용**
1. JSON 파일 열기
2. 전체 선택 (Cmd+A)
3. Format Document (Shift+Option+F)
4. 모든 줄바꿈 제거하고 한 줄로 만들기

---

## 6. Security Rules 설정

### 6.1 Firestore Security Rules 구성
Firebase Console > Firestore Database > 규칙 탭에서 다음 규칙을 설정합니다:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // 상담 데이터 컬렉션
    match /consultations/{consultationId} {
      // 읽기: 인증된 사용자만 가능 (관리자)
      allow read: if request.auth != null;

      // 쓰기: 모든 사용자 가능 (상담 신청)
      // 단, 생성 시에만 허용 (수정/삭제 불가)
      allow create: if true;

      // 수정/삭제: 인증된 사용자만 가능 (관리자)
      allow update, delete: if request.auth != null;

      // 관리자 노트 서브컬렉션
      match /notes/{noteId} {
        allow read, write: if request.auth != null;
      }
    }
  }
}
```

### 6.2 규칙 게시
1. 규칙을 입력한 후 **"게시"** 클릭
2. 규칙이 적용되기까지 몇 분 정도 소요될 수 있습니다

---

## 7. 테스트

### 7.1 개발 서버 재시작
환경 변수를 변경했으므로 개발 서버를 재시작합니다:

```bash
# 기존 서버 종료 (Ctrl+C)
# 서버 재시작
npm run dev
```

### 7.2 상담 신청 테스트
1. http://localhost:3000 접속
2. 계산 완료 후 "상담신청하기" 버튼 클릭
3. 이름, 연락처, 이메일(선택), 선호 시간(선택) 입력
4. 개인정보 동의 체크박스 선택
5. "확인" 버튼 클릭

### 7.3 Firestore 확인
1. Firebase Console > Firestore Database로 이동
2. `consultations` 컬렉션 확인
3. 새로 생성된 문서 확인

### 7.4 콘솔 로그 확인
브라우저 개발자 도구 (F12) > Console 탭에서 다음 로그 확인:
```
[Consultation] Successfully saved: CONSULTATION_ID
```

---

## 🔧 문제 해결

### 에러: "FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set"
- `.env.local` 파일에 `FIREBASE_SERVICE_ACCOUNT_KEY`가 올바르게 설정되었는지 확인
- 개발 서버를 재시작했는지 확인

### 에러: "Permission denied"
- Firestore Security Rules가 올바르게 설정되었는지 확인
- Firebase Console에서 규칙이 게시되었는지 확인

### 에러: "Failed to initialize Firebase Admin"
- `FIREBASE_SERVICE_ACCOUNT_KEY` 값이 올바른 JSON 형식인지 확인
- JSON 문자열에 이스케이프 문자(`\n`)가 제대로 포함되었는지 확인

---

## 📊 데이터 구조

### consultations 컬렉션
```javascript
{
  // 문서 ID: 자동 생성
  applicant: {
    name: "홍길동",
    phone: "010-1234-5678",
    email: "hong@example.com", // 선택
    preferredContactTime: "평일 오전", // 선택
    privacyConsent: true
  },
  input: {
    totalDebt: 50000000,
    monthlyIncome: 3000000,
    assetValue: 100000000,
    dependents: 2,
    homeAddress: "서울특별시 강남구...",
    workAddress: "서울특별시 강남구...",
    courtJurisdiction: "seoul",
    priorityRepaymentRegion: "서울특별시"
  },
  assetDetails: {
    housingType: "owned",
    kbPrice: 300000000,
    hasMortgage: true,
    mortgageAmount: 200000000
  },
  dependentDetails: {
    maritalStatus: "married",
    childrenCount: 2,
    hasNoSpouseIncome: false
  },
  result: {
    reductionRate: 45.5,
    repaymentAmount: 27250000,
    reductionAmount: 22750000,
    monthlyPayment: 500000,
    repaymentPeriod: 60,
    liquidationValueViolation: false,
    needsConsultation: false
  },
  metadata: {
    createdAt: "2025-11-06T12:00:00Z",
    updatedAt: "2025-11-06T12:00:00Z",
    status: "pending",
    source: "web",
    userAgent: "Mozilla/5.0..."
  },
  notes: []
}
```

---

## 🚀 다음 단계

1. **관리자 인증 구현** - Firebase Authentication 설정
2. **관리자 대시보드 개발** - 상담 목록 및 상세 페이지
3. **이메일 알림** - 새 상담 신청 시 이메일 발송
4. **신청서 자동작성** - PDF 생성 기능

---

## 📞 지원

문제가 발생하면 다음을 확인하세요:
- [Firebase 공식 문서](https://firebase.google.com/docs/firestore)
- [Next.js 환경 변수 가이드](https://nextjs.org/docs/basic-features/environment-variables)
- GitHub Issues

---

**최종 업데이트**: 2025년 11월 6일
**Firebase SDK 버전**: 10.x
