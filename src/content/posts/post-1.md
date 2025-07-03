---
title: "GitHub Pages와 Astro로 블로그 만들기 가이드"
meta_title: "GitHub Pages Astro 블로그 만들기"
description: "GitHub Pages와 Astro를 사용해서 무료로 개인 블로그를 만드는 방법을 단계별로 설명합니다. 저장소 생성부터 배포, 테마 적용까지 완벽 가이드."
date: 2025-07-04
image: "/images/posts/01.jpg"
categories: ["development", "tutorial"]
tags: ["github-pages", "astro", "blog", "tutorial", "deployment"]
draft: false
---

개발자라면 누구나 한 번쯤 개인 블로그를 만들어보고 싶어합니다. GitHub Pages와 Astro를 사용하면 **완전 무료**로 빠르고 현대적인 블로그를 만들 수 있습니다. 이 가이드를 따라하면 30분 안에 여러분만의 블로그가 완성됩니다.
## 왜 GitHub Pages와 Astro인가?

### GitHub Pages의 장점
- ✅ **완전 무료** 호스팅
- ✅ **자동 배포** (코드 푸시 시 자동 업데이트)
- ✅ **HTTPS** 자동 제공
- ✅ **커스텀 도메인** 지원

### Astro의 장점  
- ⚡ **빠른 성능** (정적 사이트 생성)
- 🎨 **다양한 템플릿** 제공
- 📱 **반응형 디자인** 기본 제공
- 🔍 **SEO 최적화**

---

## 1단계: GitHub 저장소 생성

먼저 GitHub에서 블로그용 저장소를 만들어야 합니다.

1. **GitHub**에 로그인 후 **New repository** 클릭
2. **저장소 이름**: `{본인아이디}.github.io` 
   > 예: `yujeong0411.github.io`
3. **Public**으로 설정 (필수!)
4. **Add a README file** 체크
5. **Create repository** 클릭

> ⚠️ **중요**: 저장소 이름을 정확히 `{본인아이디}.github.io` 형태로 만들어야 `https://{본인아이디}.github.io`로 접속할 수 있습니다.

---

## 2단계: 로컬에 Astro 프로젝트 생성

### 저장소 클론 및 Astro 설치

```bash
// 저장소 클론
git clone https://github.com/{본인아이디}/{본인아이디}.github.io.git
cd {본인아이디}.github.io

// 현재 폴더에 Astro 블로그 생성
npm create astro@latest . -- --template blog
```

### 설치 과정에서 선택사항

```bash
tmpl   How would you like to start your new project?
         — A basic, helpful starter project    
       > — Use blog template          ← 이걸 선택!
         — Use docs (Starlight) template    
         — Use minimal (empty) template  
         
deps   Install dependencies?  yes ← yes 선택
```

### blog 템플릿에 포함된 기능들

- 📝 **블로그 포스트 예시**들
- 🏷️ **태그 기능**
- 📡 **RSS 피드**
- 📱 **반응형 디자인**
- 🌙 **다크모드**
- 🔍 **검색 기능**

---

## 3단계: 로컬에서 테스트

설치가 완료되면 로컬에서 블로그가 제대로 작동하는지 확인해봅시다.

```bash
npm run dev
```

성공하면 다음과 같은 메시지가 나타납니다:

```bash
🚀 astro v4.x.x started in 123ms

  ┃ Local    http://localhost:4321/
  ┃ Network  use --host to expose
```

브라우저에서 **http://localhost:4321/**로 접속해서 블로그가 정상적으로 표시되는지 확인하세요.

---

## 4단계: GitHub에 코드 업로드

```bash
git add .
git commit -m "Add Astro blog"
git push origin main
```

> 💡 **팁**: 브랜치 이름이 `master`인 경우 `git push origin master`를 사용하세요.

---

## 5단계: 배포 설정

### astro.config.mjs 수정

프로젝트 루트의 `astro.config.mjs` 파일을 다음과 같이 수정합니다:

```javascript
// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://{본인아이디}.github.io',
  integrations: [mdx(), sitemap()],
});
```

### GitHub Actions 워크플로우 추가

`.github/workflows/deploy.yml` 파일을 생성하고 다음 내용을 추가합니다:

```yaml
name: Deploy to GitHub Pages

on:
  # main 브랜치로 푸시할 때마다 워크플로를 트리거
  push:
    branches: [ main ]
  # Actions 탭에서 수동으로 실행 가능
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout your repository using git
        uses: actions/checkout@v4
      - name: Install, build, and upload your site
        uses: withastro/action@v3

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

## 6단계: GitHub Pages 활성화

1. **GitHub 저장소**로 이동
2. **Settings** → **Pages** 클릭
3. **Source**에서 **GitHub Actions** 선택
   > ⚠️ "Deploy from a branch"가 아닌 **GitHub Actions**를 선택해야 합니다!

### 배포 확인

1. 저장소의 **Actions** 탭 클릭
2. "Deploy to GitHub Pages" 워크플로우 상태 확인:
   - 🟡 **노란색**: 실행 중
   - ✅ **초록색**: 성공
   - ❌ **빨간색**: 실패

3. 초록색 체크가 뜨면 `https://{본인아이디}.github.io`에 접속해서 확인!

---

## 7단계: 테마 변경하기 (선택사항)

기본 테마가 마음에 들지 않는다면 [Astro 테마 갤러리](https://astro.build/themes/)에서 마음에 드는 테마를 선택할 수 있습니다.

### 테마 적용 방법

1. **원하는 테마 클론**:
```bash
git clone https://github.com/themefisher/bookworm-light-astro.git temp-theme
```

2. **기존 파일 백업 후 교체**:
```bash
# 중요한 폴더들 제외하고 기존 파일 삭제
# .github, .git 폴더는 보존

# 테마 파일 복사
cp -r temp-theme/* ./
cp -r temp-theme/.* ./ 2>/dev/null || true
```

3. **config 파일 수정**:
   - `src/config/config.json`에서 사이트 정보 수정
   - `astro.config.mjs`에서 site URL 확인

---

## 블로그 포스트 작성하기

이제 여러분만의 첫 번째 포스트를 작성해보세요!

### 포스트 파일 생성

`src/content/posts/` 폴더에 새 `.md` 파일을 만들고:

```markdown
---
title: "나의 첫 번째 블로그 포스트"
description: "GitHub Pages와 Astro로 만든 블로그의 첫 포스트입니다"
date: 2025-01-04T10:00:00Z
image: "/images/posts/my-first-post.jpg"
categories: ["development"]
tags: ["blog", "astro"]
draft: false
---

# 안녕하세요!

이것은 저의 첫 번째 블로그 포스트입니다.
```

### 변경사항 배포

```bash
git add .
git commit -m "Add my first blog post"
git push origin main
```

몇 분 후 블로그에 새 포스트가 자동으로 배포됩니다!

---

## 마무리

축하합니다! 🎉 이제 여러분만의 무료 블로그가 완성되었습니다. 

### 다음 단계들

- 📝 **꾸준한 포스팅**으로 콘텐츠 채우기
- 🎨 **CSS 커스터마이징**으로 개성 표현하기  
- 🔍 **Google Analytics** 연동하기
- 🌐 **커스텀 도메인** 연결하기

블로그 운영 중 궁금한 점이 생기면 [Astro 공식 문서](https://docs.astro.build/)를 참고하세요. 여러분의 블로그가 성공적으로 운영되기를 응원합니다!

> 💡 **팁**: 이 블로그도 GitHub Pages와 Astro로 만들어졌습니다. 소스 코드는 [여기](https://github.com/yujeong0411/yujeong0411.github.io)에서 확인할 수 있어요!
