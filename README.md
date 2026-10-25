# uniStudio — yeongungod.com

Astro 정적 사이트. 내용은 `src/data/` 세 파일만 고치면 된다.

- `site.ts` 연락처·하는 일·약력 · `featured.ts` 대표작 8건 · `archive.json` 전체 작업(노션 내보내기)
- `npm run dev` 로컬 · `npm run build && npm run check` 검증 · `npm run pdf` 소개서 PDF → `G:\91_uniStudio\소개서\`
- main에 push하면 Cloudflare Pages가 배포한다. 설계는 `docs/superpowers/specs/`.
- 대표작 무대 루프: `node scripts/make-loop.mjs <원본 영상> <시작 초> <6~8> <slug> [--webm]` → `public/video/loops/<slug>.mp4·.webm·.jpg`, `featured.ts`의 작품에 `"loop": "/video/loops/<slug>.mp4"`. 🔴 남의 작품 장면이라 감독·권리자 사용 허락 필수. 원본 영상은 저장소에 넣지 않는다.
  - ⚠️ **임시 자산(2026-10-16)**: 루프 `saraji-tmp`·`haboja-tmp`·`navy-tmp`, 가로 스틸 `images/work/nalchi_wide_tmp.jpg`·`pd_wide_tmp.jpg`(포스터에서 16:9로 자른 것). 이름의 `tmp`가 붙은 파일은 정식 클립·스틸로 바꿀 것.
