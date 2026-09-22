# 노션 포트폴리오 — 로컬 미리보기

2026-09-21 확정: 대외비를 이유로 GitHub PR 미리보기를 폐기한다. **로컬 미리보기 → 내용 확인 → 공개용 파일 반영 → 별도 요청 시 commit/push** 순서다.

## 사용 흐름

1. 기존 Notion Portfolio에서 작품 정보와 사이트 표시 설정을 편집한다.
2. `npm run portfolio:preview`로 선택한 작품을 가져와 `http://127.0.0.1:4322`에서 확인한다.
3. 미리보기 사본은 `tmp/portfolio-previews/<고유번호>/`에 데이터·이미지·사이트 소스를 함께 저장한다. Git 제외이며 공개용 public/ 밖이다.
4. 확인 후 사용자가 공개용 반영을 명시적으로 요청한다. `npm run portfolio:apply -- <번호>`는 그 사본만 공개용 파일로 옮긴다. 노션을 다시 읽지 않는다.
5. 검증 후 커밋·push는 사용자 요청 때만 한다. apply 자체는 배포가 아니다.

연결 전에는 `npm run portfolio:preview -- --current`로 현재 공개용 파일 사본을 확인한다. 노션 동기화로 표기하지 않는다. `--snapshot <번호>`로 이전 사본을 다시 연다.

## 정보 경계

- GitHub 브랜치·PR·Vercel preview·배포 훅을 만들지 않는다. 서버는 127.0.0.1에만 바인딩한다.
- `사이트 공개` 체크는 사이트 반영 후보라는 뜻이다. 새 항목은 기본 미체크. 대외비는 미체크로 두며 동기화에서도 제외한다.
- 체크해도 로컬 검토와 별도 공개용 반영 전에는 사이트가 바뀌지 않는다.
- 노션 본문·내부 메모·첨부 전체는 수집하지 않고 지정된 사이트용 필드만 변환한다.
- API 토큰은 Git 제외 `.env.notion.local`에 저장한다. 서버 사본에 복사하지 않고 서버 환경 변수에서도 제거한다. 토큰·서명 URL·원본 응답을 로그로 출력하지 않는다.
- 공개용 빌드는 기존 src/data/featured.ts, src/data/archive.json, public/만 사용한다. 미리보기 폴더는 읽지 않는다.
- 로컬 사본은 암호화 저장소가 아니며 이 PC의 파일 접근 권한을 따른다.

## 노션 데이터

기존 데이터 소스 `13c50bd8-fe2d-8105-9233-000b01a532cc`의 Name/Date/Platform/Process/Client를 재사용한다.

| 추가 필드 | 타입 / 의미 |
|---|---|
| 사이트 공개 | checkbox. 사이트 반영 후보 |
| 전체 작업 표시 | checkbox. /work에 넣을 개별 기록. 묶음 카드 미체크 |
| 대표작 순서 | number. 1~9, 비어 있으면 메인 제외 |
| 썸네일 | files. 대표작 이미지 한 개 |
| 영상 URL | url. 유튜브 또는 HTTPS 외부 링크 |
| 한 줄 소개 | rich text. 카드 설명 |
| 사이트 표시명 | rich text. 비어 있으면 Name |
| 사이트 연도 표기 | rich text. 비어 있으면 Date |
| 사이트 역할 표기 | rich text. 비어 있으면 Process 한글 매핑 |
| 사이트 클라이언트 표기 | rich text. 비어 있으면 Client |

기존 117개와 9개 대표작을 보존한다. 단일 대표작은 기존 행, 해군·공군/온사이드 묶음은 아카이브에서 제외한 대표 행으로 관리한다. 공개 설정 초기화는 현재 공개용 기록과 일치한 항목만 대상으로 한다. 미일치 작품은 자동 공개 처리하지 않는다.

## 구현 파일

- scripts/notion-portfolio.mjs: API 페이지네이션, 필드 변환·검증, 허용된 이미지 다운로드. Node 표준 기능만 사용.
- scripts/portfolio.mjs: 고유 폴더에 사이트 복사, 데이터 생성, 로컬 Astro 실행, 명시적 apply.
- scripts/portfolio.test.mjs: 비공개 제외, 잘못된 URL/순서, 실패 시 원본 유지, 사본 격리와 정확한 반영 테스트.
- .gitignore, .env.notion.example, package.json: 로컬 파일 제외, 인증 예제, 실행 명령.
- ArchiveTable.astro, VideoCard.astro, featured.ts: optional URL 타입과 외부 링크 표시. 현재 작품 내용 유지.
- docs/portfolio-management.md: 사용자 조작·최초 연결 안내.
- AGENTS.md 5절: 완료와 남은 일 기록.

기존 데이터 형태를 재사용해 통합 JSON/공개 데이터 어댑터는 만들지 않는다. 대표작 최대 9개, 소개서는 앞 6개다. Notion 이미지 임시 주소는 HTML에 남기지 않고 파일로 저장한다.

최초 이관은 기존 카드에 notionId를 연결해 포스터를 유지한다. 썸네일을 올리면 새 이미지가 우선한다. 영상 URL이 있는 목록에는 링크 열을 표시한다. `portfolio-preview.cmd`는 Windows에서 같은 미리보기 명령을 실행하는 바로가기다.

## 실패와 검증

필수 필드 누락, 순서 중복/범위 초과, 중복 페이지 ID, 잘못된 URL, API/이미지 실패, 빈 아카이브/대표작은 동기화를 중단한다. 사본 생성이 끝나야 완료 manifest를 쓰므로 불완전한 사본은 열거나 반영할 수 없다. 기존 파일은 유지한다.

apply 전 사본 데이터·이미지와 소스 해시, 생성 당시 공개용 파일 해시를 대조한다. 바뀌었다면 재미리보기를 요구한다. 원본은 로컬 사본 안에 백업하고 반영 실패 시 복구한다. apply는 네트워크를 호출하지 않는다.

사이트 자동화용 읽기 전용 Notion 연결과 로컬 토큰이 필요하다. 대화용 MCP와 별개이며, 실제 인증이 없으면 모의 응답 테스트와 기존 데이터 미리보기까지만 완료했다고 보고한다.

완료 기준: tests/build/check 통과, 신규/비공개/묶음 처리, 영상·이미지·외부 링크, 모바일 넘침 없음, 로컬 사본과 공개 빌드 격리, 재조회 없는 apply, 오류 시 원본 보존. 소개서 데이터가 바뀌면 기존 PDF 절차로 A4 한 장 확인.

## 공식 근거

- https://developers.notion.com/reference/filter-data-source-entries
- https://developers.notion.com/reference/file-object
- https://developers.notion.com/guides/get-started/authorization
- https://docs.astro.build/en/reference/cli-reference/
