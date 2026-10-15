import { defineConfig } from 'astro/config';
export default defineConfig({
  site: 'https://yeongungod.com',
  output: 'static',
  build: { format: 'directory', inlineStylesheets: 'always' }, // CSS 약 7KB를 HTML에 넣어 렌더 막는 요청 0개
});
