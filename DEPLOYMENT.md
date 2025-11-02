# 배포 가이드

개인회생 예상 탕감률 조회 서비스 배포 가이드입니다.

## 📋 배포 전 체크리스트

### 1. 환경 변수 설정
배포 플랫폼에 다음 환경 변수를 설정해야 합니다:

```bash
# 현재 프로젝트에서 사용 중인 카카오 JavaScript Key
NEXT_PUBLIC_KAKAO_JS_KEY=d6dae6629fbc3d4b9ae79e086995c0f5
```

**현재 사용 중인 카카오 앱:**
- JavaScript Key: `d6dae6629fbc3d4b9ae79e086995c0f5`
- 이미 설정된 키이므로 위 값을 그대로 사용하면 됩니다

**새로운 카카오 JavaScript Key 발급 방법:**
1. [Kakao Developers](https://developers.kakao.com/) 접속
2. 애플리케이션 추가하기
3. 내 애플리케이션 > 앱 설정 > 요약 정보에서 JavaScript 키 복사
4. 자세한 내용은 `KAKAO_SETUP.md` 참조

### 2. 빌드 테스트
배포 전 로컬에서 프로덕션 빌드가 성공하는지 확인:

```bash
npm run build
```

### 3. 환경 설정 확인
- ✅ Node.js 버전: 18.x 이상
- ✅ Next.js 버전: 15.5.6
- ✅ 의존성 설치 완료

## 🚀 Vercel 배포 (권장)

### 빠른 배포
1. [Vercel](https://vercel.com) 가입 및 로그인
2. GitHub 계정 연동
3. 저장소 선택: `hamshmas/hamshams1`
4. 환경 변수 설정:
   - Key: `NEXT_PUBLIC_KAKAO_JS_KEY`
   - Value: `d6dae6629fbc3d4b9ae79e086995c0f5`
5. Deploy 버튼 클릭

### CLI를 통한 배포
```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

### 환경 변수 설정 (Vercel)
```bash
# 웹 대시보드에서 설정하거나 CLI 사용
vercel env add NEXT_PUBLIC_KAKAO_JS_KEY
```

## 🐳 Docker 배포

### Dockerfile 생성
```dockerfile
FROM node:18-alpine AS base

# 의존성 설치
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
RUN npm ci

# 빌드
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# 실행
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### Docker 빌드 및 실행
```bash
# 빌드
docker build -t hamshams1 .

# 실행
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_KAKAO_JS_KEY=d6dae6629fbc3d4b9ae79e086995c0f5 \
  hamshams1
```

## ☁️ 기타 플랫폼

### Netlify
1. [Netlify](https://netlify.com) 가입
2. GitHub 저장소 연동
3. Build command: `npm run build`
4. Publish directory: `.next`
5. 환경 변수 설정

### Railway
1. [Railway](https://railway.app) 가입
2. GitHub 저장소 연동
3. 환경 변수 설정
4. 자동 배포

### AWS Amplify
1. [AWS Amplify Console](https://console.aws.amazon.com/amplify/) 접속
2. GitHub 저장소 연동
3. Build settings 확인
4. 환경 변수 설정

## 🔧 배포 후 확인사항

### 1. 기능 테스트
- [ ] 메인 페이지 로딩
- [ ] 부채액/소득 입력
- [ ] 자산 계산 (자가/전세/월세/무상거주)
- [ ] 부양가족 계산
- [ ] 결과 페이지 표시
- [ ] 카카오톡 상담 신청 기능
- [ ] 클립보드 복사 기능

### 2. 성능 확인
- [ ] Lighthouse 점수 확인 (Performance > 90)
- [ ] Core Web Vitals 확인
- [ ] 모바일 반응형 확인

### 3. 보안 확인
- [ ] HTTPS 적용 확인
- [ ] 환경 변수 노출 여부 확인
- [ ] API 보안 헤더 확인

## 📊 모니터링

### Vercel Analytics
Vercel 대시보드에서 실시간 트래픽과 성능을 모니터링할 수 있습니다.

### 로그 확인
```bash
# Vercel CLI로 로그 확인
vercel logs
```

## 🐛 트러블슈팅

### 빌드 실패
```bash
# 캐시 삭제 후 재빌드
rm -rf .next
npm run build
```

### 환경 변수 문제
- Vercel: Settings > Environment Variables 확인
- 환경 변수는 `NEXT_PUBLIC_` 접두사 필요 (클라이언트 사이드에서 접근 시)

### 카카오톡 주소 검색 안됨
- `NEXT_PUBLIC_KAKAO_JS_KEY` 환경 변수 확인
- 카카오 개발자 콘솔에서 플랫폼 등록 확인 (Web 플랫폼 추가)

## 📝 업데이트 배포

### 자동 배포 (Vercel)
GitHub main 브랜치에 push하면 자동으로 배포됩니다:

```bash
git add .
git commit -m "Update: feature description"
git push origin main
```

### 수동 배포
```bash
# Vercel CLI 사용
vercel --prod
```

## 🔒 환경별 설정

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## 📱 도메인 연결

### Vercel에서 커스텀 도메인 설정
1. Vercel 대시보드 > Settings > Domains
2. 도메인 추가
3. DNS 레코드 설정
4. SSL 인증서 자동 발급

## 🎯 성능 최적화

배포 후 다음 사항을 확인하세요:

- [x] 이미지 최적화 (Next.js Image 컴포넌트)
- [x] 코드 스플리팅
- [x] 정적 생성 (Static Generation)
- [x] 서버 사이드 렌더링 최적화
- [x] 캐싱 전략

## 📞 지원

문제가 발생하면 다음을 확인하세요:
- GitHub Issues
- Next.js 공식 문서
- Vercel 문서

---

**최종 업데이트**: 2025년 11월 3일
**Next.js 버전**: 15.5.6
**Node.js 버전**: 18.x 이상 권장
