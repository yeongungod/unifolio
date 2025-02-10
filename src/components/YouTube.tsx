"use client";  // ✅ 반드시 추가해야 함 (Client Component)

export default function YouTube({ id }: { id: string }) {
  return (
    <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
      <iframe
        className="w-full aspect-video"
        src={`https://www.youtube.com/embed/${id}`}
        title="YouTube Video"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen  // ✅ 전체 화면 지원
      ></iframe>
    </div>
  );
}
