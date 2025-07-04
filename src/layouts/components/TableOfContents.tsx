import React, { useState, useEffect } from 'react';
import type { TocItem } from '@/lib/utils/tocFunctions';
import { BiMenu, BiX, BiBookOpen, BiChevronRight, BiChevronLeft, BiMinus } from 'react-icons/bi';

interface TableOfContentsProps {
  headings: TocItem[];
  className?: string;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ headings, className = '' }) => {
  const [activeId, setActiveId] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false); // 모바일용
  const [isDesktopMinimized, setIsDesktopMinimized] = useState<boolean>(false); // 데스크톱 최소화
  const [isDesktopHidden, setIsDesktopHidden] = useState<boolean>(false); // 데스크톱 완전 숨기기
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [readingProgress, setReadingProgress] = useState<number>(0);

  // 중첩된 헤딩에서 모든 ID 추출
  const getAllHeadingIds = (heading: TocItem): string[] => {
    const ids = [heading.id];
    if (heading.children) {
      heading.children.forEach(child => {
        ids.push(...getAllHeadingIds(child));
      });
    }
    return ids;
  };

  // 스크롤 감지
  useEffect(() => {
    const handleScroll = () => {
      // 읽기 진행률 계산
      const scrollTop = window.scrollY;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      const progress = Math.min((scrollTop / docHeight) * 100, 100) || 0;
      setReadingProgress(progress);

      // 활성 헤딩 찾기
      const allIds = headings.flatMap(heading => getAllHeadingIds(heading));
      const headingElements = allIds.map(id =>
        document.getElementById(id)
      ).filter(Boolean) as HTMLElement[];

      let current = '';
      const scrollPosition = window.scrollY + 100;

      for (const element of headingElements) {
        if (element.offsetTop <= scrollPosition) {
          current = element.id;
        } else {
          break;
        }
      }

      setActiveId(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  // 헤딩 클릭 시 스무스 스크롤
  const scrollToHeading = (id: string) => {
    console.log('Trying to scroll to ID:', id);

    const decodedId = decodeURIComponent(id);
    const element = document.getElementById(decodedId);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({
        top: y,
        behavior: 'smooth'
      });
      console.log('Successfully scrolled to:', element.textContent);
    } else {
      console.warn('Element not found for ID:', decodedId);
    }
    setIsOpen(false);
  };

  // 확장/축소 토글
  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  // 헤딩 렌더링
  const renderHeading = (heading: TocItem, level: number = 0) => {
    const isActive = activeId === heading.id;
    const hasChildren = heading.children && heading.children.length > 0;
    const isExpanded = expandedItems.has(heading.id) || level === 0;
    const paddingLeft = level * 16;

    return (
      <li key={heading.id} className="mb-1">
        <div className="flex items-center">
          {hasChildren && level > 0 && (
            <button
              onClick={() => toggleExpanded(heading.id)}
              className="p-1 hover:bg-gray-100 rounded transition-colors mr-1 flex-shrink-0"
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              <BiChevronRight
                className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
              />
            </button>
          )}
          <a
            href={`#${heading.id}`}
            onClick={(e) => {
              e.preventDefault();
              scrollToHeading(heading.id);
            }}
            className={`toc-item flex-1 py-2 px-2 rounded-lg text-sm transition-all duration-200 ${isActive
              ? 'bg-primary text-white font-medium shadow-sm'
              : 'text-gray-600 hover:text-primary hover:bg-gray-50'
              }`}
            style={{ paddingLeft: `${12 + paddingLeft}px` }}
          >
            <span className={`${heading.level === 1 ? 'font-semibold' : ''}`}>
              {heading.text}
            </span>
          </a>
        </div>

        {hasChildren && isExpanded && (
          <ul className="mt-1">
            {heading.children!.map(child => renderHeading(child, level + 1))}
          </ul>
        )}
      </li>
    );
  };

  if (!headings.length) {
    return null;
  }

  return (
    <>
      {/* 모바일 플로팅 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 bg-primary text-white shadow-xl rounded-full p-4 border-4 border-white hover:scale-110 transition-transform duration-300"
        aria-label="Toggle Table of Contents"
      >
        {isOpen ? <BiX className="w-5 h-5" /> : <BiBookOpen className="w-5 h-5" />}
      </button>

      {/* 데스크톱 숨기기 상태일 때 나타나는 작은 버튼 */}
      {isDesktopHidden && (
        <button
          onClick={() => setIsDesktopHidden(false)}
          className="hidden lg:block fixed right-4 top-1/2 transform -translate-y-1/2 z-50 bg-primary text-white shadow-lg rounded-l-lg p-3 hover:pr-4 transition-all duration-300 group"
          aria-label="Show Table of Contents"
        >
          <BiChevronLeft className="w-4 h-4 group-hover:w-5 group-hover:h-5 transition-all" />
        </button>
      )}

      {/* 데스크톱 사이드바 TOC */}
      {!isDesktopHidden && (
        <aside
          className={`hidden lg:block fixed right-6 top-1/2 transform -translate-y-1/2 z-40 transition-all duration-300 ${isDesktopMinimized
            ? 'w-16'
            : 'w-72'
            } max-h-[60vh] bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-xl p-5 ${className}`}
        >
          {/* TOC 헤더 */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
            {!isDesktopMinimized && (
              <div className="flex items-center">
                <BiBookOpen className="w-5 h-5 text-primary mr-2" />
                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">
                  Table of Contents
                </h3>
              </div>
            )}

            {/* 컨트롤 버튼들 */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsDesktopMinimized(!isDesktopMinimized)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                title={isDesktopMinimized ? "Expand TOC" : "Minimize TOC"}
              >
                {isDesktopMinimized ? (
                  <BiChevronLeft className="w-4 h-4 rotate-180" />
                ) : (
                  <BiMinus className="w-4 h-4" />
                )}
              </button>
              {/* 최소화 상태에서는 X 버튼 숨김 - 확장하면 다시 보임 */}
              {!isDesktopMinimized && (
                <button
                  onClick={() => setIsDesktopHidden(true)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Hide TOC"
                >
                  <BiX className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* 최소화되지 않았을 때만 내용 표시 */}
          {!isDesktopMinimized && (
            <>
              {/* 목차 리스트 */}
              <div className="overflow-y-auto max-h-[30vh] pr-2 -mr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                <ul className="space-y-1">
                  {headings.map(heading => renderHeading(heading))}
                </ul>
              </div>

              {/* 읽기 진행률 */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span>Reading Progress</span>
                  <span>{Math.round(readingProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-primary h-1.5 rounded-full toc-progress-bar"
                    style={{ width: `${readingProgress}%` }}
                  />
                </div>
              </div>
            </>
          )}

          {/* 최소화 상태일 때 간단한 진행률만 표시 */}
          {isDesktopMinimized && (
            <div className="flex flex-col items-center space-y-3">
              <BiBookOpen className="w-6 h-6 text-primary" />
              <div className="w-2 h-20 bg-gray-200 rounded-full relative">
                <div
                  className="w-2 bg-primary rounded-full toc-progress-bar absolute bottom-0"
                  style={{ height: `${readingProgress}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 font-medium">
                {Math.round(readingProgress)}%
              </span>
            </div>
          )}
        </aside>
      )}

      {/* 모바일 슬라이드 패널 */}
      {isOpen && (
        <>
          {/* 오버레이 */}
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40 toc-overlay"
            onClick={() => setIsOpen(false)}
          />

          {/* 슬라이드 패널 */}
          <aside className="lg:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 max-h-[70vh] animate-slide-up">
            <div className="p-6">
              {/* 핸들 */}
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />

              {/* 헤더 */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <BiBookOpen className="w-6 h-6 text-primary mr-3" />
                  <h3 className="font-bold text-gray-900 text-lg">Table of Contents</h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <BiX className="w-5 h-5" />
                </button>
              </div>

              {/* 진행률 */}
              <div className="mb-4 pb-4 border-b border-gray-100">
                <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                  <span>Reading Progress</span>
                  <span>{Math.round(readingProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full toc-progress-bar"
                    style={{ width: `${readingProgress}%` }}
                  />
                </div>
              </div>

              {/* 목차 리스트 */}
              <div className="overflow-y-auto max-h-[40vh]">
                <ul className="space-y-1">
                  {headings.map(heading => renderHeading(heading))}
                </ul>
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
};

export default TableOfContents;