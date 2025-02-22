import fs from "fs";
import path from "path";
import matter from "gray-matter";

type Team = {
  name: string;
  role: string;
  avatar: string;
  linkedIn: string;
};

type Metadata = {
  title: string;
  publishedAt: string;
  summary: string;
  image?: string;
  images: string[];
  tag?: string;
  team: Team[];
  link?: string;
  order?: number;
};

import { notFound } from 'next/navigation';

function getMDXFiles(dir: string) {
  if (!fs.existsSync(dir)) {
    notFound();
  }

  return fs.readdirSync(dir).filter((file) => path.extname(file) === ".mdx");
}

function readMDXFile(filePath: string) {
    if (!fs.existsSync(filePath)) {
        notFound();
    }

  const rawContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(rawContent);

  const metadata: Metadata = {
    title: data.title || "",
    publishedAt: data.publishedAt,
    summary: data.summary || "",
    image: data.image || "",
    images: data.images || [],
    tag: data.tag || [],
    team: data.team || [],
    link: data.link || "",
    order: data.order || 0,
  };

  return { metadata, content };
}

function getMDXData(dir: string) {
  const mdxFiles = getMDXFiles(dir);
  return mdxFiles.map((file) => {
    const { metadata, content } = readMDXFile(path.join(dir, file));
    const slug = path.basename(file, path.extname(file));

    return {
      metadata,
      slug,
      content,
    };
  });
}

// postsDir에서 MDX 데이터를 읽어오고, order 값을 기준으로 오름차순 정렬하여 반환
export function getPosts(customPath = ["", "", "", ""]) {
  const postsDir = path.join(process.cwd(), ...customPath);
  const posts = getMDXData(postsDir);

  // order 필드 기준 오름차순 정렬 (order가 없으면 0으로 간주)
  return posts.sort((a, b) => (b.metadata.order || 0) - (a.metadata.order || 0));
}