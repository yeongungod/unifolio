// 화면 표시용 글자 정리. 원본 데이터(노션·관리자)는 그대로 두고 그릴 때만 쓴다.
// SUITE엔 대시(—·–·−)와 이모지 글리프가 없다(DESIGN.md The No Dash Rule).
export const displayText = (s) => s.replace(/\s*[—–−]\s*/g, ' - ').replace(/\s*[☀-➿\u{1F000}-\u{1FAFF}️]+/gu, '').trim();
// 「2025 -」(진행 중)은 뒤에 구분점이 붙으면 「2025 - ·」로 읽혀서 「2025~」로
export const displayYear = (s) => s.replace(/\s*-\s*$/, '~');
