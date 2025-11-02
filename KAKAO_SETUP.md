# 카카오 로그인 설정 가이드

카카오 로그인을 실제로 사용하려면 Kakao Developers에서 앱을 등록하고 JavaScript 키를 발급받아야 합니다.

## 1. Kakao Developers 앱 등록

### 1.1 계정 생성 및 앱 등록
1. [Kakao Developers](https://developers.kakao.com/) 접속
2. 카카오 계정으로 로그인
3. 상단 메뉴에서 **"내 애플리케이션"** 클릭
4. **"애플리케이션 추가하기"** 버튼 클릭
5. 앱 정보 입력:
   - **앱 이름**: `개인회생 탕감률 조회` (원하는 이름)
   - **사업자명**: 개인 또는 회사명
6. **저장** 버튼 클릭

### 1.2 JavaScript 키 확인
1. 생성된 앱 선택
2. **"앱 키"** 메뉴에서 **"JavaScript 키"** 확인
3. JavaScript 키 복사 (예: `1234567890abcdef1234567890abcdef`)

## 2. 플랫폼 등록

### 2.1 Web 플랫폼 추가
1. 왼쪽 메뉴에서 **"플랫폼"** 클릭
2. **"Web 플랫폼 등록"** 버튼 클릭
3. **사이트 도메인** 입력:
   - 로컬 개발: `http://localhost:3000`
   - 배포 후: 실제 도메인 (예: `https://yourdomain.com`)
4. **저장** 버튼 클릭

### 2.2 Redirect URI 설정
1. **"카카오 로그인"** 메뉴 클릭
2. **"활성화 설정"** 상태를 **ON**으로 변경
3. **"Redirect URI 등록"** 버튼 클릭
4. Redirect URI 입력:
   - 로컬 개발: `http://localhost:3000`
   - 배포 후: 실제 도메인
5. **저장** 버튼 클릭

## 3. 동의 항목 설정

### 3.1 사용자 정보 접근 권한 설정
1. **"동의항목"** 메뉴 클릭
2. 필요한 항목 설정:
   - **닉네임**: 필수 동의
   - **프로필 사진**: 선택 동의 (필요 시)
   - **카카오계정(이메일)**: 필수 동의 (선택)
3. **저장** 버튼 클릭

## 4. 환경 변수 설정

### 4.1 .env.local 파일 수정
프로젝트 루트의 `.env.local` 파일을 열고 JavaScript 키를 입력:

```bash
NEXT_PUBLIC_KAKAO_JS_KEY=your_javascript_key_here
```

**예시:**
```bash
NEXT_PUBLIC_KAKAO_JS_KEY=1234567890abcdef1234567890abcdef
```

### 4.2 개발 서버 재시작
```bash
# 기존 서버 중지 (Ctrl + C)
# 서버 재시작
npm run dev
```

## 5. 테스트

### 5.1 로컬 테스트
1. 브라우저에서 `http://localhost:3000` 접속
2. 4단계까지 정보 입력
3. 로딩 완료 후 "카카오톡으로 인증하기" 버튼 클릭
4. 카카오 로그인 팝업 확인
5. 로그인 완료 후 결과 페이지 확인

### 5.2 문제 해결
- **SDK 초기화 실패**:
  - `.env.local` 파일의 키 값 확인
  - 개발 서버 재시작
  - 브라우저 콘솔에서 에러 메시지 확인

- **로그인 팝업이 뜨지 않음**:
  - 팝업 차단 해제
  - 플랫폼 도메인 등록 확인
  - Redirect URI 설정 확인

- **"Redirect URI mismatch" 에러**:
  - Kakao Developers에서 Redirect URI 재확인
  - 등록된 도메인과 현재 접속 도메인 일치 확인

## 6. 배포 시 추가 설정

### 6.1 프로덕션 환경
1. Kakao Developers에서 배포 도메인 추가
2. Vercel/AWS 등 배포 플랫폼의 환경 변수에 JavaScript 키 등록
3. HTTPS 사용 권장

### 6.2 보안 권장사항
- JavaScript 키는 클라이언트에 노출되므로 도메인 제한 필수
- 민감한 작업은 백엔드 서버에서 처리
- Admin 키는 절대 클라이언트 코드에 포함하지 말 것

## 참고 자료
- [Kakao Developers 가이드](https://developers.kakao.com/docs/latest/ko/kakaologin/common)
- [카카오 로그인 JavaScript SDK](https://developers.kakao.com/docs/latest/ko/kakaologin/js)
- [Next.js 환경 변수](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
