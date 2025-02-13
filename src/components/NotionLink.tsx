import Link from "next/link";
import { Column, Text, Button } from "@/once-ui/components";

export default function NotionLink() {
  return (
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
        <Button target="_blank" rel="noopener noreferrer" variant="primary">
          Notion 보러가기
        </Button>
      </Link>
    </Column>
  );
}
