// 무대 스틸·막 고르기(빌드 때). /admin·노션이 대표 이미지를 바꾸거나 새 작품을 올려도 무대가 안전하게.
export const SAFE_SCRIM = 0.65; // 흰 바탕에서도 큰 제목 3:1(scripts/stage-scrim.py가 확인)
export const DEFAULT_FOCUS = '50% 40%';

// 이미지가 있으면 그것. 유튜브만 있으면 maxres(1280×720): optimize-assets.py가 받아 둔 것이면 webp 변형까지,
// 새로 올린 작품은 maxres를 그대로 쓰고 없을 때(4:3 회색 120px)만 hqdefault로 바꾼다(ResponsiveImage fallback).
/** @returns {{ src: string, width?: number, height?: number, fallback?: string }} */
export function stageStill(item, images) {
  if (item.image) return { src: item.image };
  const maxres = `https://i.ytimg.com/vi/${item.youtube}/maxresdefault.jpg`;
  return { src: maxres, width: 1280, height: 720, ...(!(maxres in images) && { fallback: `https://i.ytimg.com/vi/${item.youtube}/hqdefault.jpg` }) };
}

// 막 농도·초점은 그 이미지에서 잰 값일 때만 쓴다. 이미지가 바뀌었거나 잰 적 없으면 안전한 기본값.
export function stageLook(item, src, scrims) {
  const m = scrims[item.slug];
  return m && m.src === src ? { scrim: m.scrim, focus: item.focus ?? DEFAULT_FOCUS } : { scrim: SAFE_SCRIM, focus: DEFAULT_FOCUS };
}
