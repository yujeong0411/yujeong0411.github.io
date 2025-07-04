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


## 왜 GitHub Pages와 Astro인가?
- GitHub Pages: 무료 호스팅 + 자동 배포 + HTTPS 제공 
- Astro: 빠른 성능 + 다양한 테마 + SEO 최적화

---
## 시작하기
### 1단계: GitHub 저장소 생성

먼저 GitHub에서 블로그용 저장소를 만들어야 합니다.

1. **GitHub**에 로그인 후 **New repository** 클릭
2. **저장소 이름**: `{본인아이디}.github.io`  *(예: yujeong0411.github.io)*
3. **Public**으로 설정 (필수!)
4. **Add a README file** 체크
5. **Create repository** 클릭

> ⚠️ 저장소 이름을 정확히 `{본인아이디}.github.io` 형태로 만들어야 `https://{본인아이디}.github.io`로 접속할 수 있습니다.

---

### 2단계: 로컬에 Astro 프로젝트 생성

<h5>1. 저장소 클론 및 Astro 설치</h5>

```bash
# 저장소 클론
git clone https://github.com/{본인아이디}/{본인아이디}.github.io.git
cd {본인아이디}.github.io

# 현재 폴더에 Astro 블로그 생성
npm create astro@latest . -- --template blog
```

<h5>2. 설치 과정에서 선택사항</h5>

```bash
tmpl   How would you like to start your new project?
         — A basic, helpful starter project    
       > — Use blog template          ← 이걸 선택!
         — Use docs (Starlight) template    
         — Use minimal (empty) template  
         
deps   Install dependencies?  yes ← yes 선택
```
<br/>

***blog 템플릿에 포함된 기능들***
- 📝 **블로그 포스트 예시**들
- 🏷️ **태그 기능**
- 📡 **RSS 피드**
- 📱 **반응형 디자인**
- 🌙 **다크모드**
- 🔍 **검색 기능**

---

### 3단계: 로컬에서 테스트

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

브라우저에서 ***http://localhost:4321/*** 로 접속해서 블로그가 정상적으로 표시되는지 확인하세요.

---

### 4단계: 배포 설정

<h5> astro.config.mjs 수정 </h5>

[공식문서](https://docs.astro.build/ko/guides/deploy/github/)

- site
    - https://<사용자명>.github.io (github에서 제공하는 블로그 url)
- base
    - url/base로 접속 시 해당 블로그가 실행
    - 저장소명이<사용자명>.github.io인 경우는 설정이 불필요
    - 값 지정 시 **/** 로 시작 필요

저는 저장소명을 사용자명으로 지정하였기 때문에 base는 적지 않았습니다. 

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

<h5> GitHub Actions 워크플로우 추가 </h5>

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

### 5단계: GitHub에 업로드하고 배포하기

```bash
git add .
git commit -m "Add Astro blog"
git push origin main
```

<h5> GitHub Pages 활성화 </h5>
<img src="/images/posts/post-1-1.png" alt="GitHub Pages 설정" width="800">

1. **GitHub 저장소**로 이동
2. **Settings** → **Pages** 클릭
3. **Source**에서 **GitHub Actions** 선택
   > ⚠️ "Deploy from a branch"가 아닌 **GitHub Actions**를 선택해야 합니다!


<h5> 배포 확인 </h5>
<img src="/images/posts/post-1-2.png" alt="GitHub Pages 설정" width="800">

1. 저장소의 **Actions** 탭 클릭
2. "Deploy to GitHub Pages" 워크플로우 상태 확인:
   - 🟡 **노란색**: 실행 중
   - ✅ **초록색**: 성공
   - ❌ **빨간색**: 실패

3. 초록색 체크가 뜨면 `https://{본인아이디}.github.io`에 접속해서 확인!

---

### 6단계: 테마 변경하기 (선택사항)

기본 테마가 마음에 들지 않는다면 [Astro 테마 갤러리](https://astro.build/themes/)에서 마음에 드는 테마를 선택할 수 있습니다.
테마를 적용하려면 해당 테마의 GitHub 저장소를 클론해서 파일들을 교체하면 됩니다. 단, .github과 .git 폴더는 보존해야 합니다.

<h5> 테마 적용 방법 </h5>

1. 원하는 테마 클론:
```bash
git clone https://github.com/themefisher/bookworm-light-astro.git temp-theme
```

2. 기존 파일 백업 후 교체:
```bash
# 중요한 폴더들 제외하고 기존 파일 삭제
# .github, .git 폴더는 보존

# 테마 파일 복사
cp -r temp-theme/* ./
cp -r temp-theme/.* ./ 2>/dev/null || true
```

3. config 파일 수정:
   - `src/config/config.json`에서 사이트 정보 수정
   - `astro.config.mjs`에서 site URL 확인

---

## 마무리
이제 블로그의 기본 바탕이 완성되었어요. 저도 처음에는 복잡해 보였지만, 막상 해보니 생각보다 어렵지 않더라고요.

앞으로 필요한 기능들을 하나씩 추가하면서 본인만의 블로그로 만들어가면 됩니다. 저도 아직 초보 블로거지만, 꾸준히 포스팅하면서 같이 성장해보려고 합니다.
