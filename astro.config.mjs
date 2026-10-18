import { fileURLToPath } from 'node:url';
// 빌드 때 무대가 이미지 크기·루프 존재를 읽는 public 폴더: 작업 폴더(cwd)가 아니라 이 설정 파일 옆.
// 노션 미리보기 사본(tmp/portfolio-previews/<id>/site)도 원본 저장소에서 실행되므로 cwd를 쓰면 원본 public을 읽는다.
export const publicDir = fileURLToPath(new URL('./public/', import.meta.url));
// defineConfig는 타입 도우미일 뿐이라 쓰지 않는다(테스트가 이 파일을 node_modules 없는 임시 폴더에서 불러온다).
export default {
  site: 'https://yeongungod.com',
  output: 'static',
  build: { format: 'directory' },
  vite: { define: { __PUBLIC_DIR__: JSON.stringify(publicDir) } },
};
