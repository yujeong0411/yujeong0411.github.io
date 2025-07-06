import React, { useState, useEffect } from "react";
import { BiChevronUp } from "react-icons/bi";
import { IoArrowUpOutline } from "react-icons/io5";

interface ScrollToTopButtonProps {
  variant?: "circle" | "rounded" | "minimal" | "pill";
  position?: "bottom-right" | "bottom-left" | "bottom-center" | "responsive-left-center" | "responsive-right-center";
  showAfter?: number;
}

const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({
  variant = "circle",
  position = "bottom-right",
  showAfter = 300,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > showAfter) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, [showAfter]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // 반응형 Position 클래스 
  const positionClasses = {
    "bottom-right": "bottom-4 right-4 md:bottom-8 md:right-8",
    "bottom-left": "bottom-4 left-4 md:bottom-8 md:left-8",
    "bottom-center": "bottom-4 left-1/2 md:bottom-8 transform -translate-x-1/2",
    "responsive-left-center": "bottom-4 left-1/2 transform -translate-x-1/2 lg:left-4 lg:translate-x-0 md:bottom-8 lg:left-8",
    "responsive-right-center": "bottom-4 left-1/2 transform -translate-x-1/2 lg:right-4 lg:left-auto lg:translate-x-0 md:bottom-8 lg:right-8",
  };

  // 반응형 Variant 스타일
  const variantClasses = {
    circle: "h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 hover:scale-110",
    rounded: "h-8 px-3 md:h-10 md:px-4 rounded-lg bg-primary text-white shadow-md hover:bg-primary/90 hover:shadow-lg",
    minimal: "h-8 w-8 md:h-10 md:w-10 rounded-md bg-white/90 backdrop-blur-sm text-primary border border-primary/20 shadow-sm hover:bg-primary hover:text-white",
    pill: "h-10 px-4 md:h-12 md:px-6 rounded-full bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg hover:shadow-xl hover:scale-105",
  };

  const getIcon = () => {
    switch (variant) {
      case "circle":
      case "minimal":
        return <BiChevronUp className="h-4 w-4 md:h-6 md:w-6" />;
      case "rounded":
        return <IoArrowUpOutline className="h-3 w-3 md:h-5 md:w-5" />;
      case "pill":
        return (
          <div className="flex items-center gap-1 md:gap-2">
            <IoArrowUpOutline className="h-3 w-3 md:h-5 md:w-5" />
            <span className="text-xs md:text-sm font-medium">Top</span>
          </div>
        );
      default:
        return <BiChevronUp className="h-4 w-4 md:h-6 md:w-6" />;
    }
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className={`fixed z-50 flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${positionClasses[position]} ${variantClasses[variant]}`}
          aria-label="맨 위로 가기"
        >
          {getIcon()}
        </button>
      )}
    </>
  );
};

export default ScrollToTopButton;