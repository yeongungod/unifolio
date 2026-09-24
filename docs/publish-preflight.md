# 커밋·푸시 전 관리자 게시 동기화

관리자 '게시'는 GitHub main에 커밋한다. 공개 페이지 HTML을 역으로 복사하지 않고 그 정본을 확인한다. 저장만 한 비공개 초안은 대상이 아니다.

1. 작업 시작 전 및 커밋 전 `npm run preflight:publish` 실행.
2. origin/main을 새로 fetch한다. 새 변경이 있고 로컬이 깨끗하며 분기되지 않았으면 fast-forward로 동기화한다.
3. 미커밋 수정·미추적 파일·로컬 분기가 있으면 중단한다. 파일을 버리거나 자동 stash하지 않는다. 작업을 백업한 뒤 원격 변경과 로컬 변경을 함께 검토·병합하고 재실행한다. 관리자 게시가 바꾼 featured.ts·archive.json을 이전 로컬본으로 통째 덮지 않는다.
4. 동기화 후 build/check와 해당 테스트, 로컬 미리보기 검수. 사용자 요청이 있을 때만 커밋·푸시한다.
5. 커밋·푸시 순간에도 `.githooks/pre-commit`과 `pre-push`가 원격을 다시 확인한다. 원격 변경 또는 네트워크 오류면 중단한다. 확인 후 관리자 게시가 다시 발생하는 경쟁 상황은 일반 Git push의 non-fast-forward 거부로 보호한다. force push는 사용하지 않는다.

이 체크아웃은 `git config core.hooksPath .githooks`로 연결했다. 새 체크아웃에서도 같은 명령이 필요하다. 훅은 `--no-verify`로 우회할 수 있으므로 사용하지 않는다. `npm run preflight:check`는 동기화 없이 검사만 한다.

검증: 임시 로컬 Git 원격에서 최신 상태·관리자 추가 커밋·미추적 파일 보존·동기화·네트워크 실패를 테스트한다. 공개 배포는 실행하지 않는다.
