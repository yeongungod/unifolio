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
      <Text variant="body-default-m">
        더 자세한 정보는 노션 포트폴리오에 정리돼있습니다!
      </Text>
      <Link href="https://www.notion.so/your-portfolio-link" passHref>
        <Button as="a" target="_blank" rel="noopener noreferrer" variant="primary">
          노션 포트폴리오 보러가기
        </Button>
      </Link>
    </Column>
  );
}
