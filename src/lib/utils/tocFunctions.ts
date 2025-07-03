export interface TocItem {
  id: string;
  text: string;
  level: number;
  children?: TocItem[];
}

// 마크다운 콘텐츠에서 헤딩 추출
export function extractHeadings(content: string): TocItem[] {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: TocItem[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length; // # 개수로 레벨 결정
    const text = match[2].trim();
    const id = slugifyHeading(text);

    headings.push({
      id,
      text,
      level,
    });
  }

  return nestHeadings(headings);
}

// 텍스트를 URL-safe한 ID로 변환
function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // 특수문자 제거
    .replace(/\s+/g, '-') // 공백을 하이픈으로
    .replace(/-+/g, '-') // 연속 하이픈 제거
    .trim();
}

// 헤딩을 중첩 구조로 변환
function nestHeadings(headings: TocItem[]): TocItem[] {
  const nested: TocItem[] = [];
  const stack: TocItem[] = [];

  for (const heading of headings) {
    // 현재 헤딩보다 레벨이 높은 것들을 스택에서 제거
    while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
      stack.pop();
    }

    // 부모가 있으면 children에 추가, 없으면 최상위에 추가
    if (stack.length === 0) {
      nested.push(heading);
    } else {
      const parent = stack[stack.length - 1];
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(heading);
    }

    stack.push(heading);
  }

  return nested;
}

// 렌더링된 HTML에 ID 추가하는 함수
export function addHeadingIds(html: string): string {
  return html.replace(
    /<h([1-6])([^>]*)>([^<]+)<\/h[1-6]>/g,
    (match, level, attributes, text) => {
      const id = slugifyHeading(text.trim());
      // 이미 id가 있는지 확인
      if (attributes.includes('id=')) {
        return match;
      }
      return `<h${level}${attributes} id="${id}">${text}</h${level}>`;
    }
  );
}