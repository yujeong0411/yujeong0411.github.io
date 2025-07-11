import React, { useState, useEffect } from 'react';
import { IoMoon, IoSunny } from 'react-icons/io5';

const DarkModeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(false);

  // 초기 테마 설정
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

    setIsDark(shouldBeDark);
    updateTheme(shouldBeDark);
  }, []);

  // 시스템 테마 변경 감지
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setIsDark(e.matches);
        updateTheme(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const updateTheme = (dark: boolean) => {
    const html = document.documentElement;

    if (dark) {
      html.classList.add('dark');
      html.setAttribute('data-theme', 'dark');
    } else {
      html.classList.remove('dark');
      html.setAttribute('data-theme', 'light');
    }
  };

  const updateGiscusTheme = (dark: boolean) => {
    const giscusTheme = dark ? 'dark' : 'light';

    // 여러 선택자로 iframe 찾기
    const iframe =
      document.querySelector<HTMLIFrameElement>('iframe.giscus-frame') ||
      document.querySelector<HTMLIFrameElement>('iframe[title="Comments"]') ||
      document.querySelector<HTMLIFrameElement>('iframe[src*="giscus.app"]');

    if (iframe && iframe.contentWindow) {
      try {
        iframe.contentWindow.postMessage(
          { giscus: { setConfig: { theme: giscusTheme } } },
          'https://giscus.app'
        );
      } catch (error) {
        console.log('Giscus theme update failed:', error);
      }
    }

    // Comments.astro의 이벤트 리스너를 위한 커스텀 이벤트 dispatch
    const themeChangeEvent = new CustomEvent('theme-change', {
      detail: { theme: giscusTheme }
    });
    document.dispatchEvent(themeChangeEvent);
  };

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    updateTheme(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');

    // giscus 테마도 함께 변경
    updateGiscusTheme(newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-border dark:border-gray-600 bg-transparent hover:bg-light dark:hover:bg-gray-700 transition-colors duration-200"
      aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
      title={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
    >
      {isDark ? (
        <IoSunny className="w-4 h-4 text-yellow-500" />
      ) : (
        <IoMoon className="w-4 h-4 text-slate-600 dark:text-gray-400" />
      )}
    </button>
  );
};

export default DarkModeToggle;