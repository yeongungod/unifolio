# 포트폴리오 관리자

## 현재 상태

2026-09-22~23: 로컬 코드와 화면 구현. `/admin`에서 Google 로그인, 비공개 초안 저장, 이미지 업로드, 게시 전 미리보기, 직접 게시를 제공하는 구성이다. **사용자가 Supabase 무료 프로젝트 `uniStudio_WEB`을 만들었고 SQL 설정 실행은 성공했다. Google OAuth·Vercel 환경변수 연결과 실제 권한 검증은 아직 진행 중이다. 공개 배포하지 않았다.** 연결 전에는 로그인·저장·게시가 차단된다. 로컬 주소에서만 기존 공개 자료를 사용한 화면 체험 버튼이 보인다. 체험은 저장·업로드·게시하지 않는다.

대표작은 사용자 확정 순서: 해보자시리즈 → 살아지다 → 날치 → 침묵 → PD님이 책임지세요 → 대한민국 해군·공군 웹콘텐츠(사용자가 레이븐어스로 지칭한 기존 카드) → 넥슨 카잔 → 온사이드 팬미팅 → Deepshower·펀치넬로 라이브 클립. PD 포스터와 마지막 영상 `https://youtu.be/9DyECX8JTNg`는 해당 노션 작업 기록에서 확인했다. 전체 작업 117개는 유지한다.

## 사용 순서

1. `/admin`에서 `unistudio@yeongungod.com` Google 계정으로 로그인한다.
2. 기존 작업을 선택하거나 새 작업을 만든다. 새 작업은 비공개다. 전체 작업 표시 여부와 대표작 순서(1~9)를 별도로 정한다.
3. 이미지가 필요하면 JPG·PNG·WebP를 올린다. 파일은 비공개 버킷에만 저장된다. 영상 원본 업로드는 없으며 공개 영상 URL을 입력한다.
4. **초안 저장**을 누른다. 공개 사이트는 그대로다.
5. **저장된 초안 미리보기**에서 대표작·전체 목록·목록에서 빠질 작품을 확인한다. 비공개 작업은 제외된다.
6. 확인 체크 후 **게시**를 누르면 검토한 내용만 GitHub main에 기록하고 기존 Vercel Git 연동 배포를 요청한다. 화면의 요청 성공과 실제 배포 완료는 구분한다.

노션 자동 동기화는 없다. 관리자가 운영을 시작하면 새 작업의 정본은 관리자 초안이다. 기존 노션 `portfolio:apply`를 함께 실행하면 공개 원본이 충돌할 수 있으므로, 두 입력 경로를 동시에 사용하지 않는다. 노션 원본은 삭제하지 않는다.

초안은 작업 500개·2 MiB까지, 이미지는 개별 8 MiB·한 번의 게시에 새 이미지 합계 24 MiB까지다. 대표작은 정확히 9개다. 한 계정·한 초안으로 운용하며 여러 탭이 동시에 저장하면 늦은 저장을 거부한다. 로그인은 해당 탭의 세션에만 보관하며 만료 시 다시 로그인한다.

**초안 내려받기**는 JSON 백업이며 이미지 원본은 포함하지 않는다. 게시 원본이 개발자 변경으로 달라졌다면 먼저 초안을 내려받고 최신 공개본으로 다시 시작한다. 이미 공개했던 파일·Git 기록은 비공개 전환으로 소급 삭제되지 않는다. 민감 자료는 처음부터 비공개로 유지한다.

## 연결 절차

### Supabase

무료 조직의 전용 프로젝트를 사용한다. Data API는 켜고, 새 테이블 자동 공개는 끈다. 자동 RLS는 켠다. 데이터베이스 비밀번호는 비밀번호 관리자에 보관하고 채팅·Git에 넣지 않는다.

1. SQL Editor에서 `supabase/portfolio.sql`을 실행한다. owner 목록은 비어 있으므로 처음에는 누구도 초안·파일을 읽을 수 없다. 다른 프로젝트의 기존 공개 정책과 섞지 않는다.
2. Authentication에서 Google 공급자만 구성한다. 이메일/비밀번호·익명 로그인은 비활성화한다. Google 동의 화면은 Workspace 내부용 또는 해당 계정만 테스트 사용자로 지정한다.
3. Google Cloud의 기존 적합한 프로젝트에 웹 OAuth 클라이언트를 만든다. Supabase가 표시하는 callback URI를 Google의 승인된 리디렉션 URI에 그대로 등록한다. Client ID·Secret은 Supabase의 Google 공급자 설정에 입력한다. Scope는 openid/email/profile뿐이다.
4. Supabase Site URL은 `https://yeongungod.com`, redirect 허용 목록에는 `https://yeongungod.com/admin`만 등록한다. 로컬 실제 연결을 검증할 때만 해당 loopback 주소를 추가하고 종료 후 제거한다. 와일드카드 허용은 사용하지 않는다.
5. 관리자 본인이 한 번 Google 로그인한 뒤 Supabase Authentication Users에서 이메일·Google identity가 맞는 사용자의 UUID를 확인한다. SQL Editor에서 아래 조건부 등록문을 실행한다. `<확인한 UUID>`만 교체한다.

```sql
insert into public.portfolio_owners(user_id)
select u.id from auth.users u
where u.id = '<확인한 UUID>'::uuid
  and u.email = 'unistudio@yeongungod.com'
  and u.email_confirmed_at is not null
  and exists (select 1 from auth.identities i where i.user_id = u.id
    and i.provider = 'google'
    and i.identity_data->>'email' = 'unistudio@yeongungod.com'
    and i.identity_data->>'email_verified' = 'true')
on conflict do nothing;
```

SQL은 서버가 검증한 Google identity와 등록 UUID를 매 요청에 확인한다. 초안은 인증된 관리자만 읽고 저장할 수 있다. 이미지 버킷은 private이며 관리자 UUID 폴더에만 추가·읽기를 허용한다. 업데이트·삭제 권한은 주지 않아 미리보기 뒤에 파일 내용이 몰래 바뀌지 않는다. 불필요한 업로드 정리는 관리자 콘솔에서 사용 여부를 확인한 후 따로 한다.

### Vercel과 GitHub

Vercel 프로젝트의 서버 환경변수에 `.env.admin.example`의 키를 설정한다. `SUPABASE_PUBLISHABLE_KEY`는 `sb_publishable_`로 시작하는 공개 키만 허용하며 secret/service-role 키를 사용하지 않는다. `PORTFOLIO_GITHUB_TOKEN`은 이 저장소 하나에만 Contents read/write 권한을 가진 fine-grained 토큰이다. 토큰 값은 브라우저로 보내거나 Git에 기록하지 않는다. 프로젝트 설정과 환경변수 변경만 하고, 최초 코드 배포는 사용자 push 요청을 받은 뒤 기존 Git 연동으로 한다. Vercel CLI는 쓰지 않는다.

`api/portfolio.js`는 Supabase `/auth/v1/user`에 세션을 검증받고 DB의 owner 등록을 다시 확인한다. 저장된 초안의 revision·해시, 현재 Git main head, 마지막 공개 원본 해시를 모두 대조한다. 선택한 공개 필드만 새 데이터 파일로 만들고, 선택된 이미지 파일만 공개 경로에 복사한다. 고정된 데이터 경로와 AGENTS 5절을 한 Git tree로 작성한다. main 갱신은 `force:false`라 다른 변경을 덮어쓰지 않는다.

Git 변경 뒤의 Vercel 배포 실패는 자동 롤백하지 않는다. 실패가 나면 해당 커밋과 배포 로그를 확인하고 기존 정상 공개 사이트를 보존한다. UI는 성공을 ‘GitHub 반영·배포 확인 필요’로 표시한다.

## 검증과 미완료 항목

- 로컬 Node 검사: 공개 필드 allowlist, 비공개 제외, 타계정/미인증 차단, 잘못된 키 노출 차단, URL·경로·파일 형식, 중복 순서, 오래된 초안/원본 거절, Git branch 충돌과 비강제 갱신. 외부 요청은 테스트 응답으로 대체했다.
- 브라우저: 미인증 편집 잠금, 공개 자료 체험, 비공개 표식 미리보기 제외, 로그아웃 후 편집 내용 제거. 1440/980/375/320px의 `/`, `/work`, `/intro`, `/admin` 가로 넘침 없음. 소개서 A4 한 장. 기존 G: PDF는 갱신하지 않았다.
- **09-23 실제 연결 확인:** Google 로그인·등록한 관리자 화면 진입·비공개 초안 revision 1 저장 성공. Google만 활성화하고 Email·익명 로그인은 비활성화했다. Vercel의 Production 환경변수 네 항목 등록 확인. GitHub 토큰은 인증된 저장소/main 조회 HTTP 200 확인(쓰기 동작은 실행하지 않음).
- **실제 Supabase 검사 12개 통과:** 저장 초안 재조회·소유자 RPC·오래된 revision 저장 거부·revision 유지·익명 초안 거부·본인 비공개 이미지 업로드와 동일 바이트 읽기·공개 이미지 URL 거부·익명 이미지 읽기와 업로드 거부·다른 소유자 폴더 업로드 거부·기존 이미지 덮어쓰기 거부. 기존 공개 포스터 사본으로만 시험했고 초안은 바꾸지 않았다. 테스트 파일 위치는 Git 제외 `tmp/admin-live-result.json`에 기록했다.
- **남은 실서비스 검증:** 다른 실제 Google 계정 로그인 거부, 업로드한 이미지의 화면 미리보기, Vercel Function 배치·응답 헤더·운영 도메인 로그인, GitHub 게시 준비 및 쓰기 권한. 공개 게시 시험은 사용자 요청 시에만 한다. 설정 완료가 공개 배포 완료를 뜻하지 않는다.
- Supabase 프로젝트는 `gzbedcgtmdtctejllkta`(Tokyo). `npm run dev`/`preview`는 정적 화면만 제공한다. 실제 API 테스트는 Git 제외 `tmp/admin-local.mjs`로 4422 정적 미리보기를 127.0.0.1:4423에 연결했다. 이 임시 서버는 게시를 강제 차단한다. 로컬 초안은 변경된 소스를 기준으로 시작했으므로 최초 코드 배포 전에는 GitHub main과 원본 해시가 다르다.

공식 근거: [Google OAuth](https://supabase.com/docs/guides/auth/social-login/auth-google), [PKCE](https://supabase.com/docs/guides/auth/sessions/pkce-flow), [Auth REST API](https://github.com/supabase/auth/blob/master/openapi.yaml), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Storage 권한](https://supabase.com/docs/guides/storage/security/access-control), [Vercel Node Functions](https://vercel.com/docs/functions/runtimes/node-js), [Git trees](https://docs.github.com/en/rest/git/trees).
