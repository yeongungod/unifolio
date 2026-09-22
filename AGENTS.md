# unifolio — yeongungod.com (우니스튜디오 포트폴리오 사이트)

> 2026-09-20 Claude Code에서 Codex로 넘기며 쓴 인수인계. 이 파일이 이 저장소의 지침 정본이다.
> 사업자 전반(세무·계약·자금)은 다른 저장소 `C:\uniAI\uniBusiness\AGENTS.md`에 있다. 여기선 사이트만 다룬다.

## 1. 무엇인가

1인 사업자 「우니스튜디오」(영상 편집·사운드 믹싱, 대표 박영운)의 포트폴리오 사이트. 목적은 **거래처가 작업물과 연락처를 확인하고, A4 한 장 소개서를 받아 가는 것**이다. 공개 페이지는 정적이며, 09-23 `/admin` 포트폴리오 관리 기능을 배포했다. 블로그·문의 폼은 없다.

| 항목 | 값 |
|---|---|
| 주소 | https://yeongungod.com (www는 apex로 308) |
| 스택 | **Astro 5 정적 사이트.** 의존성은 `astro` 하나. 프레임워크·UI 라이브러리·Tailwind 없음 |
| 저장소 | `github.com/yeongungod/unifolio` · 기본 브랜치 `main` |
| 배포 | Vercel 프로젝트 `unifolio`. **`main`에 push하면 자동 배포** |
| 페이지 | `/` 원페이지(Hero·Services·Work 9건·About·Contact) · `/work` 전체 아카이브 표 117건 · `/intro` 소개서(A4 한 장, 인쇄용) · `/admin` Google 로그인 관리 |

2026-09-17에 기존 Next.js(once-ui) 템플릿을 통째로 걷어내고 교체했다(커밋 `dda47aa`). 작업 브랜치 `rebuild-astro`는 역사 보관용이다. 새 작업을 거기에 올리지 말 것.

## 2. 파일 지도

```
src/data/site.ts        연락처·히어로 문구·하는 일 4개·약력·수상·상영·툴   ← 문구 수정은 대부분 여기
src/data/featured.ts    대표작 9건 (유튜브 ID 또는 /images/work/ 이미지)
src/data/archive.json   전체 작업 117건 (노션 DB 내보내기. 손으로 고치지 않는다)
src/components/         Hero · Services · WorkGrid · VideoCard · About · Contact · ArchiveTable
src/pages/              index · work · intro · sitemap.xml.ts
src/pages/admin.astro · src/scripts/admin.js    Google 로그인·비공개 편집·미리보기
src/pages/admin/initial.json.ts    현재 공개 소스에서 관리자 초기 목록 생성
api/portfolio.js · src/lib/admin-portfolio.mjs  관리자 API·게시 검증
supabase/portfolio.sql · docs/admin-management.md  권한 정책·관리자 연결 안내
src/layouts/Base.astro  <head>·OG·폰트
src/styles/global.css   색 토큰 · 타이포 · 인쇄용 @media print
scripts/check.mjs       빌드 산출물 검사 (금지 문자열·내부 링크·description·OG)
scripts/portfolio.mjs   노션 로컬 미리보기·검토한 사본의 공개용 반영 (Git 동작 없음)
scripts/notion-portfolio.mjs   Notion API 읽기·변환·이미지 검증
docs/portfolio-management.md  노션 연결과 사용자 조작 안내
scripts/make-pdf.mjs    /intro → PDF. 출력 G:\91_uniStudio\소개서\
scripts/make-og.py      og.png 생성 · scripts/resize-work.py 작업 이미지 리사이즈
docs/superpowers/specs/2026-09-16-unistudio-site-design.md   설계 정본 (맨 끝 「구현 중 확정된 편차」 필독)
docs/superpowers/plans/2026-09-16-unistudio-site.md          구현 계획 (완료됨, 참고용)
```

## 3. 명령

```bash
npm run dev                        # 로컬 http://localhost:4321
npm run build && npm run check     # 검증. push 전에 반드시 통과
npm run pdf                        # 소개서 PDF 재생성 (G: 드라이브가 있어야 한다)
npm run portfolio:preview          # 노션 → 로컬 사본 → 127.0.0.1:4322 (연결 토큰 필요)
npm run portfolio:preview -- --current  # 연결 전 기존 파일 사본으로 확인
npm run portfolio:apply -- <번호>   # 사용자 요청한 사본만 공개용 파일 반영. 배포 아님
npm test                           # 포트폴리오 동기화·격리·반영 테스트
```

`check`가 막는 것: 산출물에 `pyu0205`·`Selene`·`once-ui`·`TODO`·`TBD`가 있으면 실패, 내부 링크·자산이 없으면 실패, description·OG 태그가 없으면 실패.

## 4. 규칙

**배포**
- 🔴 **배포는 `git push origin main` 하나뿐이다. `vercel` CLI로 배포하지 말 것.** CLI 배포는 커밋 작성자 미인증으로 `BLOCKED` 된다(09-16에 겪음). Vercel API로 상태를 볼 일이 있으면 `readyStateReason`을 확인.
- **09-22 사용자 결정으로 추가된 경로:** 관리자 본인이 비공개 미리보기를 확인하고 `게시`를 누르면, 선택된 공개 데이터만 GitHub main에 기록하여 기존 Git 연동 배포를 요청한다. 관리자의 이 클릭은 해당 스냅샷 게시 승인이다. 개발 작업의 commit/push나 시험 게시를 상시 승인한 것은 아니다. Vercel CLI 금지는 유지한다.
- 프리뷰 URL은 Vercel SSO 보호라 로그인 없이는 302가 난다. 고장이 아니다.
- push는 곧 공개 배포다. **push 전에 바뀐 내용을 사용자에게 보여 주고 확인받는다.** 커밋도 사용자가 요청할 때만.

**내용**
- 🔴 연락처는 `unistudio@yeongungod.com` / `010-5925-6367`만. 개인 메일(`pyu0205…`)은 어디에도 넣지 않는다.
- ❌ **얼굴 사진을 넣자고 제안하지 말 것**(사용자 결정).
- 대표작은 사용자 확정 9건이며 최신 순서는 5절을 따른다. 관리자 운영 전에는 로컬 검토 후 반영한다. 관리자 연결 완료 후 새 작업은 관리자 초안에서 관리하고 노션 apply와 동시에 사용하지 않는다. 노션 원본은 보존한다.
- 수상·경력·수치는 `site.ts`·`archive.json`에 있는 것만 쓴다. 지어내지 않는다. 가격은 사이트에 적지 않는다(「견적은 작업 범위를 듣고」).

**디자인**
- 서체 **SUITE**(TTF 3종, `public/fonts/`). 강조색 **Aquamarine `#9CC3D5`** + 먹색. 브랜드 원본은 `G:\91_uniStudio\브랜드\`.
- 종이(밝은) 배경의 제목은 `--ink`, 보조 글자는 `--muted-on-paper #665f58`을 쓴다(대비 약 5.98:1). 아쿠아마린은 구분선·마크에 쓴다. 기존 `#4f8aa3` 작은 제목은 대비 부족으로 09-20 교체.
- 색은 `global.css`의 토큰만 쓴다. 컴포넌트에 색을 직접 박지 않는다.
- `/intro`는 A4 한 장이다. 여백이 8mm/3mm로 빠듯해서 **내용을 더하면 두 장으로 넘어간다.** 더할 땐 썸네일 수를 줄이거나 항목을 뺀다. 고친 뒤 `npm run pdf`로 한 장인지 확인.
- `/work`는 영상 URL이 있는 데이터에만 링크 열을 표시한다. 09-22 사용자 배포 요청으로 검토한 사본을 반영해 공개용 archive.json에도 영상 링크 3개가 있다.

**코드**
- 의존성을 늘리지 않는다. CSS로 되는 걸 JS로 하지 않는다. 가장 짧게 동작하는 쪽으로.
- 이 PC는 Windows 11 + Git Bash + PowerShell 5.1. 파이썬은 `PYTHONUTF8=1`. bash heredoc 안 백슬래시 경로는 깨지니 경로가 든 스크립트는 파일로 쓴 뒤 실행.
- `.superpowers/`·`tmp/`·`dist/`·`.vercel/`과 `.env*`는 gitignore(빈 설정 예시 `.env.notion.example`·`.env.admin.example`만 예외). **노션 미리보기 사본·백업·토큰 파일을 commit/push하거나 Vercel/Drive에 올리지 않는다.** 관리자의 서비스 키는 사용자 승인된 Vercel 서버 환경변수에만 등록한다. `portfolio:apply`는 공개용 파일을 만들므로 별도 사용자 요청 때만 실행한다.

## 5. 현재 상태와 열려 있는 일 (2026-09-22)

**관리자 게시 요청 (2026-09-22T15:58:35.364Z)**: 저장된 초안 1에서 공개 선택한 전체 작업 117건·대표작 9건을 반영했다. 비공개 초안과 미선택 업로드는 제외했다. GitHub 변경 반영 후 Vercel 배포 완료 확인은 별도다.


**09-23 관리자·대표작·수상 열 공개 배포 완료**: 사용자 승인으로 `a02962e`를 commit 후 `git push origin main`했고 Vercel `Deployment has completed` 성공 상태 확인. 실제 `https://yeongungod.com`의 대표작 9개 순서·이미지, `/work` 117개·수상/상영 열, `/intro`, `/admin`을 확인했다. 1440/375/320px × 4페이지 가로 넘침·페이지 오류 없음. 운영 관리자 API 설정값 일치·no-store/noindex/CSP·미인증 401·외부 Origin 403·환경 파일 경로 404 확인. 관리자 초기 데이터 해시는 커밋한 소스와 일치한다.

실제 Google 인증 세션으로 **운영 Vercel API**의 `load`와 `prepare` HTTP 200 확인: 저장 초안 revision 1, 대표작 9개·아카이브 117개·삭제 0개. 이 검사는 읽기·게시 준비만 실행했으며 관리자 `publish`는 누르지 않았다. 운영 도메인에서의 사용자 직접 Google 로그인, 실제 게시 클릭에 따른 후속 배포, 다른 실제 Google 계정 로그인 거부는 별도 확인 항목이다. `http://127.0.0.1:4423/admin` 테스트 redirect는 아직 등록돼 있으므로 운영 로그인 확인 후 제거한다. 아래 미배포·미연결 표기는 당시 기록이다.

**09-23 공개 배포 승인**: 사용자가 대표작 9개 순서·전체 작업 수상/상영 열·Google 로그인 관리자 기능의 commit/push를 승인했다(`푸시하자`). 검증한 코드와 문서·공개 이미지가 대상이며 환경 파일·비공개 초안·테스트 사본은 제외한다. 이 기록 시점은 push 전이며 운영 검증은 배포 후 진행한다.

**09-23 배포 전 별도 코드 검토 완료**: `requesting-code-review` 스킬에 따라 관리자 인증·RLS·공개 데이터 변환·미리보기와 게시·공개 렌더링 경로를 별도 읽기 전용 검토했다. Critical/Important 차단 문제 없음, 관리자 테스트 15개 재통과. 아래 연결·검증 결과와 함께 사용자에게 최초 commit/push 여부를 확인할 단계다. 운영 배포가 완료됐다는 뜻은 아니다.

**09-23 배포 전 연결·검증 최신 상태**: Vercel 화면에서 `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `ADMIN_ORIGIN`, `PORTFOLIO_GITHUB_TOKEN` 네 항목 모두 Production 등록 확인. 실제 로그인 세션으로 Supabase 검증 12개 통과: 저장 초안 재조회, 소유자 RPC, 오래된 revision 저장 거부와 원본 revision 유지, 익명 초안 조회 거부, 본인 이미지 업로드·동일 바이트 읽기, 공개 URL·익명 이미지 읽기·익명 업로드·다른 소유자 폴더 업로드·기존 이미지 덮어쓰기 거부. 초안은 revision 1 그대로이며 기존 공개 PD 포스터 사본 1개만 비공개 테스트 파일로 남겼다(초안 연결 없음, 위치·결과는 Git 제외 `tmp/admin-live-result.json`). 다른 실제 Google 계정으로 로그인하는 검증은 하지 않았다.

최종 Node 테스트 30개·build·check(4페이지)·diff check 통과. 운영 CSP를 적용한 로컬 관리자 화면은 1440/375/320px에서 미인증 잠금·로그인 버튼·noindex·가로 넘침 없음·페이지 오류 없음 확인. 환경 파일은 Git 제외이며 값은 출력하지 않았다. 아직 커밋·push·공개 게시하지 않았고, 실제 Vercel 함수 배치·운영 도메인 로그인·게시 미리보기는 최초 배포 후 확인해야 한다. 로컬 초안의 원본 해시는 이번 변경본 기준이므로 최초 배포 전 GitHub main과 비교하면 불일치하는 것이 정상이다. 로컬 임시 서버는 공개 게시를 계속 차단한다.

**09-23 Vercel 환경변수 연결 진행**: 사용자가 `PORTFOLIO_GITHUB_TOKEN`을 Production 환경변수로 저장 완료했다고 알렸고, Vercel 화면에서 환경변수 추가 성공 알림을 확인했다. 나머지 `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, 운영용 `ADMIN_ORIGIN`을 Git 제외 `.env.vercel.local`에 준비했다. 이 가져오기 파일에는 GitHub 토큰을 넣지 않았다. 나머지 3개 등록·새 배포에서의 실제 적용 확인은 아직 남아 있다.

**09-23 GitHub 게시 키 로컬 연결**: 사용자가 생성·복사한 fine-grained PAT를 Git 제외 `.env.admin.local`의 `PORTFOLIO_GITHUB_TOKEN`에 저장했다(값 출력 안 함). 인증된 GitHub API로 `yeongungod/unifolio` 조회 및 main ref 조회 HTTP 200, 원격 HEAD `650032c` 확인. 이 검사는 읽기 검증이며 토큰 쓰기 권한의 실제 실행 검증은 아니다. 로컬 임시 서버는 여전히 게시 강제 차단 상태다. Vercel 서버 환경변수 연결·공개 배포는 아직 하지 않았다.

**09-23 로그인 공급자 제한 확인**: 사용자 설정 후 실제 Auth settings HTTP 200에서 Google 켜짐·Email 꺼짐·익명 로그인 꺼짐 확인. Google 로그인·관리자 진입·비공개 초안 1 저장 완료. 다음 단계는 이 저장소에 한정한 GitHub 게시 토큰과 Vercel 서버 환경변수 연결이며, 아직 커밋·push·공개 게시하지 않았다.

**09-22 대표작 재선정·관리자 구현 (로컬, 미커밋·미배포)**: 요청한 순서로 `featured.ts`를 변경했다. 해보자시리즈 → 살아지다 → 날치 → 침묵 → PD님이 책임지세요 → 대한민국 해군·공군 웹콘텐츠 → 넥슨 카잔 → 온사이드 팬미팅 → Deepshower·펀치넬로 「조금 돌아왔어」. 사용자 확정: 6번 레이븐어스는 기존 해군·공군 카드다. PD 포스터와 마지막 영상은 해당 노션 작업 본문에서 확인했으며, 전체 작업 117개는 유지했다. `public/images/work/pd.jpg` 추가.

관리자 로그인은 Google `unistudio@yeongungod.com` 한 계정, 초안·이미지는 비공개, 본인의 미리보기 확인 후 직접 `게시`로 공개한다. `src/pages/admin.astro`·`src/scripts/admin.js`·`src/pages/admin/initial.json.ts`·`src/lib/admin-portfolio.mjs`·`api/portfolio.js`·`supabase/portfolio.sql`·`.env.admin.example`·`docs/admin-management.md`를 추가했다. npm 의존성 추가 없음. 연결 전에는 저장·게시 차단, loopback에서만 기존 공개 데이터로 화면 체험 가능. GitHub 변경은 고정 데이터 파일·선택한 이미지·이 절 상태 기록에 한정한다.

**연결 진행 중 (09-23 갱신)**: 사용자가 Supabase 무료 프로젝트 `uniStudio_WEB` (`gzbedcgtmdtctejllkta`, Tokyo)을 생성했고 Healthy 화면 확인. Chrome SQL Editor에서 `supabase/portfolio.sql` 실행 성공(`Success. No rows returned`). Google Cloud 기존 uniStorage 프로젝트에 내부용 `uniStudio Portfolio Admin` 웹 OAuth 클라이언트를 사용자가 생성하고 Supabase Google 공급자에 연결했다. 실제 Auth settings 응답 HTTP 200에서 `google: true`, `email: true`, `anonymous_users: false` 확인. 다음 단계는 redirect 주소 설정·이메일 로그인 비활성화·실제 Google 로그인·관리자 UUID 등록이다. 관리자 허용 목록은 아직 비어 있다. 익명 REST 요청은 초안·허용 목록·RPC에서 401/42501로 거부됨을 확인했으며, 로그인 후 권한·비공개 파일 검증·Vercel 환경변수·GitHub 게시 토큰 연결은 미완료다. Supabase 플러그인은 제안했지만 설치·연결 확인 안 됨. UI 입력은 사용자 직접 진행으로 전환했다. PowerShell 파이프 입력은 BOM이 붙고 editor SetValue는 덧붙이므로 SQL 편집기 자동 입력 재시도를 피한다.

**09-23 실제 Google 로그인·관리자 등록·최초 저장 확인**: 최초 로그인 후 허용 목록이 비어 있어 `허용된 Google 계정으로 로그인하세요.`로 차단됐다. 사용자가 검증된 Google identity·확인된 이메일이 `unistudio@yeongungod.com`인 계정만 등록하는 조건부 SQL을 실행하고 다시 로그인했다. 사용자가 전달한 실제 `http://127.0.0.1:4423/admin` 화면에서 로그아웃 버튼·편집 폼·공개 자료 119개·`현재 공개 작업으로 시작합니다. 수정 후 초안을 저장하세요.`를 확인했다. 이어 초안 저장을 눌러 `비공개 초안 1 저장 완료. 공개 사이트는 아직 바뀌지 않았습니다.` 응답을 사용자가 확인했다. 실제 Google 인증·관리자 API load·초안 최초 저장 성공. 업로드·로그아웃 후 재조회·저장 충돌·게시 연결 검증은 아직 남아 있다.

**09-23 로그인 테스트 준비**: 사용자가 Supabase Site URL·정확한 운영/로컬 admin redirect 저장 완료를 알렸다. Git 제외 `tmp/admin-local.mjs`로 기존 API와 정적 미리보기를 `http://127.0.0.1:4423/admin`에 연결했다(정적 원본 4422 필요). loopback 바인딩·Host 제한·게시 요청 강제 차단. 화면/config 정상, 미인증 401·외부 Origin 403·게시 403·환경 파일 경로 404 등 6개 확인. Google 활성화 재확인, 이메일 로그인은 아직 켜져 있어 비활성화 필요. 관리자 등록은 위 최신 기록에서 완료됐다.

로컬 검증: 관리자 Node 테스트 15개(외부 서비스 응답은 대체), 기존 포트폴리오 테스트 15개, 최종 코드 build/check 통과(09-23). 1440/980/375/320px × 4페이지 가로 넘침 없음, 대표작 순서·관리자 미인증 잠금·화면 체험의 비공개 표식 제외·로그아웃 제거 확인, `/intro` A4 한 장. G: PDF는 갱신하지 않았다. 실제 로그인 후 Supabase RLS·OAuth·Vercel 함수·게시 성공은 아직 검증 완료로 표시하지 않는다.

**09-22 수상 내역 표기 간소화 (로컬, 미커밋·미배포)**: 사용자 요청으로 `/work` 각 수상 기록 앞의 `수상 ·` 접두어를 제거했다. `수상·상영` 열 제목과 행사 연도·영화제명·상 이름은 유지한다.

**09-22 전체 작업 수상·상영 열 (로컬, 미커밋·미배포)**: 사용자 요청으로 `ArchiveTable.astro`에 수상·상영 열을 추가했다. 기존 `site.ts` 수상 5편은 작품 ID로 연결하고, 웹 확인으로 날치의 선정·상영 4건과 침묵의 BIFAN 상영 1건을 추가했다. 총 5편·10개 기록이며 새 웹 기록에는 출처 링크를 표시한다. 근거·연도 대조·보류 사항은 `docs/festival-sources.md`. 기존 수상작 5편 중심 검색이며 영화 38편 전수 조사는 아니다. 작업 연도·archive.json·대표작은 변경하지 않았다.

노션 변환기는 선택 텍스트 `수상·상영`을 읽는다. 현재 원격 DB에는 이 속성이 없으며 이번에 추가하지 않았다. 속성 부재·빈칸이면 기존 수상·상영 기록 유지, 입력하면 해당 작품의 전체 표시 내역을 대체한다. 사용법은 `docs/portfolio-management.md`. 노션 본문·내부 메모를 수집하거나 새 사본을 공개용 apply하지 않았다. 테스트 15개·build/check 통과. 1967/980/701/700/375/320px `/work` 가로 넘침 없음, 영화 필터 38편·다른 분야의 수상 기록 숨김 확인. 로컬 미리보기 `http://127.0.0.1:4422/work`.

**09-22 로고 교체 공개 배포 완료**: 사용자 push 요청에 따라 `24b80a4`를 `git push origin main`으로 배포했다. 직전 build/check 통과. 실제 `https://yeongungod.com/` HTTP 200·로고 9개 로딩·반전 필터 제거를 브라우저에서 확인했다. 변경 자산 5개 모두 HTTP 200이며 PNG 2개는 SHA-256 일치, SVG 3개는 Git 줄바꿈 정규화 차이를 제외한 내용 일치를 확인했다. 아래 로컬 표기는 배포 전 기록이다.

**09-22 툴 로고 재확인·교체 (로컬, 미커밋·미배포)**: 사용자 요청으로 웹 검색 후 Adobe 3종을 현재 공식 제품 페이지 SVG로, Pro Tools를 Avid 2026.4 릴리스 노트의 컬러 PNG로 바꿨다. Cubase에 잘못 쓰던 Steinberg 회사 마크는 현재 Splice Cubase Pro 15 판매 페이지의 제품 마크로 교체했다. 원본 비율·색을 유지하고 흑백 반전 CSS를 제거했다. 출처는 `docs/tool-logo-sources.md`. build/check 통과, 1440/375/320px 메인 가로 넘침 없음 및 로고 9개 디코딩 확인. 나머지 4개 로고와 포트폴리오 데이터는 변경하지 않았다.

**09-22 공개 배포 완료**: 사용자 요청에 따라 `c37386d`를 커밋하고 `git push origin main`으로 배포했다. `https://yeongungod.com/`에서 Studio 제목·Process 제거·툴 로고 9개·대표작 9개, `/work`에서 새 설명·117개·영상 링크 3개, `/intro`에서 전화번호·이미지 6개를 실제 브라우저로 확인했다. 토큰과 비공개 사본은 커밋·빌드 산출물 검사에서 제외됨을 확인했다. Vercel CLI는 사용하지 않았다.

**09-22 사용자 공개 배포 요청·검증 완료**: `/work` 설명은 「2019년부터 지금까지 이어온 작업들입니다.」로 수정했다. 메인 Services의 Process 제목·단계·안내 문구를 삭제하고, Studio 제목은 「우니스튜디오」만 남겼다. 메인의 사용 툴 9개에는 로컬 로고와 공식 제품 링크를 추가했다(`public/images/tools/`, 출처 `docs/tool-logo-sources.md`). 소개서의 진행·대표 정보는 유지했다. Process 표 아이디어는 사용자 삭제 결정으로 종료하며 다시 제안하지 않는다.

사용자가 보던 사본 `165578d8-3568-4719-9cf6-37c6f43a890d`을 요청 범위에 따라 공개용 데이터에 반영했다. 작업 117개·대표작 9개·영상 링크 3개, 새 노션 조회 없음. 기존 09-20 화면 보완과 09-21 로컬 관리 도구를 함께 공개 배포할 범위다. 토큰·tmp 사본·백업은 제외한다. Node 테스트 14개, build/check 통과. 1967/980/375/320px × 3페이지 넘침 없음, 로고 9개 디코딩·영화 필터 38개·소개서 PDF 한 장 확인. G: PDF는 이번에 수정하지 않았다.

**09-22 미리보기 재실행**: 기존 사본 `165578d8-3568-4719-9cf6-37c6f43a890d`을 Orca 브라우저에서 다시 열었다. Windows TCP 제외 범위 4309~4408 때문에 기본 4322가 `listen EACCES: permission denied 127.0.0.1:4322`로 실패해 이번 실행만 **127.0.0.1:4422**를 사용했다. 기본 스크립트는 변경하지 않았고 같은 로컬 호스트·파일 접근 제한을 유지했다. 노션 재동기화·공개용 반영·배포는 하지 않았다.

**09-21 노션 로컬 미리보기 구현·사이트용 API 연결·검증 완료**: 사용자는 대외비를 이유로 **로컬 미리보기 후 직접 게시**를 선택했다. GitHub PR/Vercel 미리보기 안은 폐기한다. 설계는 `docs/superpowers/specs/2026-09-21-notion-portfolio-design.md`, 계획은 `docs/superpowers/plans/2026-09-21-notion-portfolio.md`. 선택한 콘텐츠를 `tmp/portfolio-previews/` 아래 Git 제외 사본으로 만들고 127.0.0.1:4322에서만 검토한다. 공개용 반영과 commit/push는 별도 사용자 요청이 필요하다.

노션 Portfolio에 사이트 표시 속성과 `사이트 관리`·`사이트 대표작`·`사이트 제외` 보기를 추가했다. 기존 사이트와 대조한 117개에만 사이트 공개/전체 작업 표시를 초기화했고 기존 본문·이름·원래 속성 값은 보존했다. 사이트 문구 차이는 표시용 속성으로 분리했다. 해군·공군 및 온사이드 묶음 카드 2개를 추가해 노션 전체는 123개, 사이트 후보 119개(아카이브 117개 + 묶음 2개), 대표작 9개다. 기존 사이트에 없던 4개는 제외 상태다. 초기 대표작 포스터는 notionId로 기존 로컬 이미지와 연결했다.

사용자 로그인 후 사이트용 연결 **uniStudio Portfolio Local**(`3e150bd8-fe2d-8153-b78d-00274f77f33d`)을 만들었다. Portfolio 데이터베이스만 연결하고 콘텐츠 읽기만 허용했다. 업데이트·삽입·댓글·사용자 정보·에이전트 권한은 껐으며 새로고침 후 유지됨을 확인했다. 토큰은 채팅에 출력하지 않고 Git 제외 `.env.notion.local`에 저장했다. `npm run portfolio:preview`로 **실제 Notion REST API**에서 읽은 사본 `165578d8-3568-4719-9cf6-37c6f43a890d`을 생성해 작업 117개·대표작 9개·영상 링크 3개를 확인했다. 노션 수정 후 이 명령을 다시 실행해야 새 사본에 반영된다. 기존 MCP 검증 사본은 `f7c834a8-de11-4867-b802-111963906a63`이다.

검증: Node 테스트 14개·build/check·diff check 통과. 실제 노션 사본에서 980/375/320px × `/`·`/work`·`/intro` 가로 넘침 없음, 작업 117개·카드 9개·영상 링크 3개, 소개서 이미지 6개 및 인쇄 PDF 한 장 확인. 비공개 가상 표식을 별도 로컬 사본에 넣고 공개용 dist에 없음을 확인했다. 4322 리스너가 127.0.0.1만 사용하는 것도 확인. 동시 apply 잠금, 변경 충돌 거부, 미사용 동기화 이미지의 공개 경로 제거·로컬 백업을 검증했다. 실제 사이트에 apply·commit·push·배포하지 않았다. G: PDF는 이번 작업에서 갱신하지 않았다.

09-22 작업 시작 시 로컬 `main` 및 `origin/main`은 `dda47aa`였다. `AGENTS.md`는 점검 시작부터 미추적 파일이었다. 아래 09-20·09-21의 미커밋·미배포 표기는 당시 기록이다. 최신 배포 상태는 이 절 상단을 따른다.

**09-20 보완**: 브랜드 원본의 흰 락업을 상단에 적용(`public/lockup-white.svg`, G: 원본 그대로 복사). 한글 제목·아카이브 분야 줄바꿈, 소개서 801px 가로 넘침, 종이 위 작은 글자 대비를 수정했다. 본문 바로가기·키보드 포커스·메뉴 터치 영역·동작 줄이기·`/work` 대표 제목을 보완하고, 소개서 연락처 링크·사이트 복귀 링크를 추가했다. 정적 카드의 손모양 커서를 없애고 영상 재생 후 포커스를 재생기로 옮긴다. `check`에 문서상 명시돼 있었지만 빠져 있던 OG 5항목 검사를 추가했다.

**검증**: build/check 통과, 320·375·600·601·700·701·800·801·1024·1440px × 3페이지에서 가로 넘침 없음. 본문 바로가기·키보드 영상 전환·분야 필터 동작 확인. OG 누락 시 실패하고 복원 후 통과하는 재현 확인. 대표작·사업자 사실·의존성은 변경하지 않았다. 새 자산 추가 시 Windows 파일 감시 `EBUSY`가 한 번 발생해 dev 서버를 재시작했으며 이후 자산 로딩 정상.

| 열려 있는 일 | 메모 |
|---|---|
| 대표작 9건 구성·재선정 | ✅ 09-23 사용자 지정 9개 순서 공개 배포. 6번 레이븐어스는 해군·공군 기존 카드 |
| 로그인 가능한 관리자 페이지 | ✅ 09-23 `/admin` 배포. 실제 Google 로그인·비공개 저장·권한 검사·운영 API load/prepare 확인. 운영 도메인 로그인과 실제 게시 후속 배포는 남음. `docs/admin-management.md` |
| `/work`에 영상 링크 열 | ✅ 노션 URL 필드와 조건부 링크 열 구현. 09-22 사용자 배포 요청으로 검토한 링크 3개를 공개용 데이터에 반영 |
| 노션으로 포트폴리오 관리 | ✅ 로컬 도구·노션 관리 보기·초기 이관·읽기 전용 API 연결 완료. 실제 API로 117개/대표작 9개 미리보기 확인. 위 09-21 기록 및 docs/portfolio-management.md 참고 |
| 소개서 PDF 최신화 | ✅ 09-20 디자인 보완본 `G:\91_uniStudio\소개서\260920_우니스튜디오_소개서.pdf` 생성. A4 한 장·썸네일 6개 확인. 이후 문구·대표작 변경 시 다시 생성 |
| 포트폴리오 카드 틀 통일 | 아이디어 단계. 썸네일 + 작업 범위 라벨 + 길이 + 결과 숫자 하나 |
| 제작 프로세스 표 | ❌ 09-22 사용자가 메인 Process 삭제 결정. 표 추가 아이디어 종료, 재제안하지 않음 |

무엇부터 할지는 사용자가 정한다. 위 표는 순서가 아니다.

**09-20 화면 피드백 반영**: 히어로 문의·작업 버튼 제거, 라벨은 `uniStudio`만 표시(양평 제거). 제목은 「장면의 흐름부터, 소리의 디테일까지.」, 설명은 「유튜브 편집부터 영화·웹콘텐츠 사운드까지. 보고 듣는 경험을 다듬습니다.」로 시안 반영. 「하는 일」은 메인에서 「편집부터 사운드까지」로 변경. 자기소개식 연혁 문장은 작업 방식 중심으로 교체했고 기존 학력·수상 정보는 유지했다. 전체 작업 버튼은 「전체 작업 보기」. 메인 툴은 한 줄에 하나씩, Ableton Live 추가·Vrew 제외(사용자 확인). 소개서는 A4 구성 때문에 툴을 기존 한 문단 형식으로 유지한다.

메인 문의 전화 버튼은 삭제했다. **사용자 확정: 전화번호는 메인 문의 버튼에서만 삭제하며 `/intro`·PDF에는 유지한다.** 공유 이미지 `og.png`와 생성 스크립트의 제목도 맞췄다. 소개서 PDF는 기존본을 `260920_우니스튜디오_소개서_문구수정전_225553.pdf`로 보존 후 갱신. build/check, 980·375·320px 메인 화면, 소개서 A4 한 장·썸네일 6개·Ableton Live 포함·Vrew 제외를 확인했다. 「날치」는 목록 마지막에 추가해 소개서의 앞 6작품은 유지한다. 포스터·작업 범위 출처: 노션 `13c50bd8-fe2d-8088-a6c3-d5c4005aa5f1`. 미커밋·미배포.
