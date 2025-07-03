import React from "react";
import config from "@/config/config.json";
import dateFormat from "@/lib/utils/dateFormat";
import { humanize, slugify } from "@/lib/utils/textConverter";
import Fuse from "fuse.js";
import { useEffect, useRef, useState } from "react";
import { BiCalendarEdit, BiCategoryAlt } from "react-icons/bi";
const { summary_length } = config.settings;

export type SearchItem = {
  slug: string;
  data: any;
  content: any;
};

interface Props {
  searchList: SearchItem[];
}

interface SearchResult {
  item: SearchItem;
  refIndex: number;
}

export default function SearchBar({ searchList }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputVal, setInputVal] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(
    null,
  );
  const [fuse, setFuse] = useState<Fuse<SearchItem> | null>(null);

  const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
    setInputVal(e.currentTarget.value);
  };

  // Fuse.js 초기화
  useEffect(() => {
    const fuseInstance = new Fuse(searchList, {
      keys: ["data.title", "data.categories", "data.tags", "content"],
      includeMatches: true,
      minMatchCharLength: 2,
      threshold: 0.5,
    });
    setFuse(fuseInstance);
  }, [searchList]);

  // URL에서 쿼리 파라미터 읽기 (클라이언트 사이드)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const queryParam = urlParams.get("q");
      if (queryParam) {
        setInputVal(queryParam);

        // 포커스 설정을 지연시켜 DOM이 준비된 후 실행
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.selectionStart = inputRef.current.selectionEnd = queryParam.length;
          }
        }, 50);
      }
    }
  }, []);

  // 검색 실행
  useEffect(() => {
    if (!fuse) return;

    let inputResult = inputVal.length > 2 ? fuse.search(inputVal) : [];
    setSearchResults(inputResult);

    // URL 업데이트
    if (typeof window !== 'undefined') {
      if (inputVal.length > 0) {
        const searchParams = new URLSearchParams(window.location.search);
        searchParams.set("q", inputVal);
        const newRelativePathQuery =
          window.location.pathname + "?" + searchParams.toString();
        window.history.pushState(null, "", newRelativePathQuery);
      } else {
        window.history.pushState(null, "", window.location.pathname);
      }
    }
  }, [inputVal, fuse]);

  return (
    <div className="min-h-[45vh]">
      <input
        className="form-input w-full text-center focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary focus:shadow-md transition-all duration-200"
        placeholder="검색어를 입력하세요..."
        type="text"
        name="search"
        value={inputVal}
        onChange={handleChange}
        autoComplete="off"
        autoFocus
        ref={inputRef}
      />

      {inputVal.length > 1 && (
        <div className="my-6 text-center">
          <p className="text-gray-600">
            '<span className="font-semibold text-primary">{inputVal}</span>'에 대한{" "}
            <span className="font-semibold">{searchResults?.length || 0}</span>개의 결과
          </p>
        </div>
      )}

      <div className="row">
        {searchResults?.map(({ item }) => (
          <div key={item.slug} className={"col-12 mb-8 sm:col-6"}>
            {item.data.image && (
              <a
                href={`/${item.slug}`}
                className="rounded-lg block hover:text-primary overflow-hidden group"
              >
                <img
                  className="group-hover:scale-[1.03] transition duration-300 w-full"
                  src={item.data.image}
                  alt={item.data.title}
                  width={445}
                  height={230}
                />
              </a>
            )}

            <ul className="mt-6 mb-4 flex flex-wrap items-center text-text">
              <li className="mr-5 flex items-center flex-wrap font-medium">
                <BiCalendarEdit className="mr-1 h-5 w-5 text-gray-600" />
                <>{dateFormat(item.data.date)}</>
              </li>
              <li className="mr-5 flex items-center flex-wrap">
                <BiCategoryAlt className="mr-1 h-[18px] w-[18px] text-gray-600" />
                <>
                  <ul>
                    {item.data.categories.map((category: string, i: number) => (
                      <li key={i} className="inline-block">
                        <a
                          href={`/categories/${slugify(category)}`}
                          className="mr-2 hover:text-primary font-medium"
                        >
                          {humanize(category)}
                          {i !== item.data.categories.length - 1 && ","}
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              </li>
            </ul>

            <h3 className="mb-2">
              <a
                href={`/${item.slug}`}
                className="block hover:text-primary transition duration-300"
              >
                {item.data.title}
              </a>
            </h3>
            <p className="text-text">
              {item.content?.slice(0, Number(summary_length))}...
            </p>
          </div>
        ))}
      </div>

      {inputVal.length > 1 && (!searchResults || searchResults.length === 0) && (
        <div className="text-center py-16">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            검색 결과가 없습니다
          </h3>
          <p className="text-gray-500">
            다른 검색어를 시도해보세요
          </p>
        </div>
      )}
    </div>
  );
}
