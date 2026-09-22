# Notion Local Portfolio Implementation Plan

**Goal:** 노션 작품을 로컬 사본에서 검토하고 지정한 사본만 공개용 파일에 반영한다.
**Architecture:** Node 내장 fetch/fs/test + 기존 Astro. src/public 사본의 데이터만 교체. GitHub/Vercel 작업 없음.
**Constraints:** 의존성 추가·commit/push 없음. 현재 사용자가 지정한 저장소의 미커밋 작업 보존. 대외비 사본은 Git 제외 tmp/ 안에만 생성.

## 1. 데이터와 실패 경계

- [x] tests: 미체크 행 제외, 묶음 카드 제외, 순서/URL 거부, 페이지네이션, 이미지 실패를 먼저 확인.
- [x] `convertPages(pages)` → `{archive, featured, downloads}`; `fetchPortfolio({token,dataSourceId,fetcher})` 구현.
- [x] 필수 값, 중복 ID, HTTP 타임아웃, 이미지 형식·크기 검증. 민감 응답 미출력.
- [x] `node --test scripts/portfolio.test.mjs` 통과.

## 2. 격리 사본과 반영

- [x] 임시 루트에서 `createSnapshot(root,data)` 전후 공개 파일 불변, `applySnapshot(root,id)`의 수정 충돌 거부 테스트부터 작성.
- [x] 허용된 파일만 복사, 고유 ID와 완료 manifest, 해시 대조·원본 백업 구현.
- [x] CLI `preview --current`, `preview --snapshot ID`, `preview`, `apply ID`. Astro는 127.0.0.1:4322 strictPort. 서버에 Notion token을 전달하지 않음.
- [x] tmp/·.env* Git 제외, 설정 예제·사용 안내·npm 명령 추가.

## 3. 화면과 검증

- [x] optional URL 타입, 아카이브 이름 링크·대표 카드 외부 링크 추가.
- [x] 현재 117개/9개로 localhost 사본 실행. 인증 전에는 동기화 완료로 표기하지 않음.
- [x] tests/build/check, 데스크톱·모바일 대표작·링크·넘침·intro 확인.
- [x] 비밀 가상 작품을 사본에 넣어 공개 build에 없는지 검사.
- [x] 실제 Notion 연결 설정 안내와 AGENTS 5절 상태 기록.

## 남은 외부 연결

- [x] 사용자 Notion 로그인 후 사이트용 읽기 전용 연결 생성과 로컬 토큰 설정, 실제 API 재동기화 확인. Portfolio만 연결, 117개/대표작 9개 사본 검증.
