export interface TocItem {
  id: string;
  text: string;
  level: number;
  children?: TocItem[];
}

// 마크다운 콘텐츠에서 헤딩 추출
export function extractHeadings(content: string): TocItem[] {
  // 1. 코드 블록 제거 (```로 감싸진 부분)
  const contentWithoutCodeBlocks = content.replace(/```[\s\S]*?```/g, '');

  // 2. 인라인 코드 제거 (`로 감싸진 부분)  
  const contentWithoutInlineCode = contentWithoutCodeBlocks.replace(/`[^`]*`/g, '');

  // 3. 헤딩 추출
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: TocItem[] = [];
  let match;

  while ((match = headingRegex.exec(contentWithoutInlineCode)) !== null) {
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

// 텍스트를 URL-safe한 ID로 변환 (한글 지원)
function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // 한글, 영문, 숫자, 공백, 하이픈만 남기기 (한글 범위: 가-힣)
    .replace(/[^\w\s가-힣-]/g, '')
    // 공백을 하이픈으로 변경
    .replace(/\s+/g, '-')
    // 연속된 하이픈을 하나로 변경
    .replace(/-+/g, '-')
    // 앞뒤 하이픈 제거
    .replace(/^-+|-+$/g, '')
    // URL 인코딩 (한글 처리)
    .split('')
    .map(char => {
      // 한글이면 URL 인코딩
      if (/[가-힣]/.test(char)) {
        return encodeURIComponent(char);
      }
      return char;
    })
    .join('');
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