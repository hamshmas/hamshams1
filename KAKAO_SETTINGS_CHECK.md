# 카카오 Developers 설정 확인 체크리스트

## 현재 설정 정보
- **JavaScript 키**: `d6dae6629fbc3d4b9ae79e086995c0f5`
- **로컬 URL**: `http://localhost:3000`

## ✅ 필수 설정 체크리스트

### 1. 앱 생성 확인
- [ ] [Kakao Developers](https://developers.kakao.com/) 로그인
- [ ] "내 애플리케이션" 페이지에서 앱 생성 여부 확인
- [ ] JavaScript 키가 `d6dae6629fbc3d4b9ae79e086995c0f5`인 앱 찾기

### 2. 플랫폼 설정 ⭐ 중요!
1. 왼쪽 메뉴에서 **"플랫폼"** 클릭
2. **"Web 플랫폼 등록"** 버튼이 보이면 클릭
3. 사이트 도메인 입력:
   ```
   http://localhost:3000
   ```
   ⚠️ 주의: `https`가 아닌 `http`입니다!
   ⚠️ 주의: 뒤에 `/`를 붙이지 마세요!
4. **저장** 버튼 클릭
5. 등록된 도메인 확인

**확인 사항:**
- [ ] Web 플랫폼이 등록되어 있음
- [ ] `http://localhost:3000`이 정확히 등록됨
- [ ] 포트 번호(3000)가 일치함

### 3. 카카오 로그인 활성화 ⭐ 중요!
1. 왼쪽 메뉴에서 **"카카오 로그인"** 클릭
2. **"활성화 설정"**의 상태를 확인
   - 현재 OFF라면 → **ON**으로 변경
3. 아래로 스크롤하여 **"Redirect URI"** 섹션 찾기
4. **"Redirect URI 등록"** 버튼 클릭
5. Redirect URI 입력:
   ```
   http://localhost:3000
   ```
   ⚠️ 주의: `https`가 아닌 `http`입니다!
6. **저장** 버튼 클릭

**확인 사항:**
- [ ] 카카오 로그인이 **ON** 상태
- [ ] Redirect URI에 `http://localhost:3000`이 등록됨
- [ ] 등록된 URI가 정확히 일치함 (포트 번호 포함)

### 4. 동의항목 설정 (선택사항)
1. 왼쪽 메뉴에서 **"동의항목"** 클릭
2. 기본적으로 설정된 항목 확인
   - 닉네임 (선택 동의)
   - 프로필 사진 (선택 동의)

## 🔍 문제 해결

### "SDK가 로드되지 않았습니다" 에러
**원인:**
- Kakao SDK 스크립트가 로드되지 않음
- 네트워크 문제 또는 브라우저 캐시 문제

**해결 방법:**
1. 브라우저 캐시 완전 삭제 (`Ctrl + Shift + Delete`)
2. 페이지 강력 새로고침 (`Ctrl + Shift + R`)
3. 브라우저 개발자 도구(F12) → Console 탭에서 에러 확인
4. Network 탭에서 `kakao.min.js` 로드 확인

### "Redirect URI mismatch" 에러
**원인:**
- Kakao Developers에 등록된 Redirect URI와 실제 사이트 URL이 다름

**확인 사항:**
- 등록된 URI: `http://localhost:3000`
- 현재 접속 URL: `http://localhost:3000`
- 프로토콜(`http` vs `https`)이 일치하는지
- 포트 번호가 일치하는지
- 마지막에 `/`가 없는지

### "Invalid app key" 에러
**원인:**
- JavaScript 키가 잘못됨
- 키가 제대로 설정되지 않음

**해결 방법:**
1. `.env.local` 파일 확인
2. `NEXT_PUBLIC_KAKAO_JS_KEY=d6dae6629fbc3d4b9ae79e086995c0f5`
3. 키 값에 공백이나 따옴표가 없는지 확인
4. 개발 서버 재시작

### SDK는 로드되었지만 로그인 팝업이 안 뜸
**원인:**
- 팝업 차단
- 카카오 로그인이 활성화되지 않음
- Redirect URI가 등록되지 않음

**해결 방법:**
1. 브라우저 팝업 차단 해제
2. 카카오 로그인 활성화 확인
3. Redirect URI 등록 확인

## 📱 테스트 순서

1. **디버그 정보 확인**
   - 카카오 인증 화면에서 "🔍 디버그 정보" 섹션 확인
   - "✅ SDK 준비 완료" 메시지 확인

2. **브라우저 콘솔 확인** (F12)
   ```
   ✅ Kakao SDK 초기화 완료
   SDK 버전: 2.7.2
   ```

3. **카카오 로그인 시도**
   - "카카오톡으로 인증하기" 버튼 클릭
   - 팝업창 확인
   - 로그인 진행

4. **에러 발생 시**
   - 콘솔에 표시된 에러 메시지 확인
   - 위의 문제 해결 방법 참고

## 🚨 긴급 연락처
- Kakao Developers 고객센터: https://devtalk.kakao.com/
- 카카오 로그인 가이드: https://developers.kakao.com/docs/latest/ko/kakaologin/common
