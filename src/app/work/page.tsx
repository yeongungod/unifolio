import { getPosts } from "@/app/utils/utils";
import { Button, Column, Text } from "@/once-ui/components";
import { Projects } from "@/components/work/Projects";
import { baseURL } from "@/app/resources";
import { person, work } from "@/app/resources/content";
import Link from "next/link"; // Notion 링크를 위해 추가


export async function generateMetadata() {
  const title = work.title;
  const description = work.description;
  const ogImage = `https://${baseURL}/og?title=${encodeURIComponent(title)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://${baseURL}/work/`,
      images: [
        {
          url: ogImage,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default function Work() {
  let allProjects = getPosts(["src", "app", "work", "projects"]);

  return (
    <Column maxWidth="m">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            headline: work.title,
            description: work.description,
            url: `https://${baseURL}/projects`,
            image: `${baseURL}/og?title=Design%20Projects`,
            author: {
              "@type": "Person",
              name: person.name,
            },
            hasPart: allProjects.map((project) => ({
              "@type": "CreativeWork",
              headline: project.metadata.title,
              description: project.metadata.summary,
              url: `https://${baseURL}/projects/${project.slug}`,
              image: `${baseURL}/${project.metadata.image}`,
            })),
          }),
        }}
      />
      <Projects />
            {/* ───────── Notion 링크 섹션 추가 ───────── */}
            <Column
        horizontal="center"
        gap="m"
        style={{
          marginTop: "2rem",
          paddingTop: "2rem",
          borderTop: "1px solid #eaeaea",
        }}
      >
        <Text variant="heading-strong-l">
         자세한 내용은 Notion에서 확인 가능합니다.
        </Text>
        <Link href="https://www.notion.so/your-portfolio-link" passHref>
          <Button as="a" target="_blank" rel="noopener noreferrer" variant="primary">
            Notion 보러가기
          </Button>
        </Link>
      </Column>
      {/* ───────── Notion 링크 섹션 끝 ───────── */}
    </Column>
  );
}
