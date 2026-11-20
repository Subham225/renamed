import React, { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ScrollLeftHint from "./ScrollLeftHint";

interface HorizontalScrollRowProps {
  children: React.ReactNode;
  className?: string;
  wrapperClassName?: string;
  hintClassName?: string;
  tone?: "light" | "dark";
  showHint?: boolean;
  arrowSize?: "sm" | "xs";
  scrollStep?: number;
}

export default function HorizontalScrollRow({
  children,
  className = "",
  wrapperClassName = "",
  hintClassName = "",
  tone = "light",
  showHint = true,
  arrowSize = "sm",
  scrollStep,
}: HorizontalScrollRowProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollState();

    const onScroll = () => updateScrollState();
    el.addEventListener("scroll", onScroll, { passive: true });

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => updateScrollState());
      resizeObserver.observe(el);
      if (el.firstElementChild) {
        resizeObserver.observe(el.firstElementChild);
      }
    }

    const onWinResize = () => updateScrollState();
    window.addEventListener("resize", onWinResize);

    const timer = window.setTimeout(updateScrollState, 150);

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onWinResize);
      resizeObserver?.disconnect();
      window.clearTimeout(timer);
    };
  }, [updateScrollState, children]);

  const handleScroll = (direction: "left" | "right", e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const el = scrollRef.current;
    if (!el) return;
    const distance =
      scrollStep || Math.max(220, Math.round(el.clientWidth * 0.72));
    el.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth",
    });
  };

  const isDark = tone === "dark";
  const btnSizeClass = arrowSize === "xs" ? "w-6 h-6" : "w-7 h-7";
  const iconSizeClass = arrowSize === "xs" ? "w-3.5 h-3.5" : "w-4 h-4";
  const themeBtnClass = isDark
    ? "bg-slate-800/95 hover:bg-pink-600 text-slate-200 hover:text-white border-slate-700/90 hover:border-pink-500 shadow-md"
    : "bg-white/95 hover:bg-pink-50 text-slate-700 hover:text-pink-600 border-slate-200/90 hover:border-pink-300 shadow-md";

  return (
    <div className={`relative group/scroll ${wrapperClassName}`}>
      {/* Left Scroll Arrow for PC */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={(e) => handleScroll("left", e)}
          aria-label="Scroll left"
          title="Scroll Left"
          className={`hidden md:flex items-center justify-center rounded-full border backdrop-blur-xs absolute left-1.5 top-1/2 -translate-y-1/2 z-20 transition-all duration-150 active:scale-90 cursor-pointer ${btnSizeClass} ${themeBtnClass}`}
        >
          <ChevronLeft className={iconSizeClass} />
        </button>
      )}

      {/* Horizontally Scrollable Container */}
      <div ref={scrollRef} className={className}>
        {children}
      </div>

      {/* Right Scroll Arrow for PC */}
      {canScrollRight && (
        <button
          type="button"
          onClick={(e) => handleScroll("right", e)}
          aria-label="Scroll right"
          title="Scroll Right"
          className={`hidden md:flex items-center justify-center rounded-full border backdrop-blur-xs absolute right-1.5 top-1/2 -translate-y-1/2 z-20 transition-all duration-150 active:scale-90 cursor-pointer ${btnSizeClass} ${themeBtnClass}`}
        >
          <ChevronRight className={iconSizeClass} />
        </button>
      )}

      {showHint && (canScrollLeft || canScrollRight) && (
        <ScrollLeftHint tone={tone} className={hintClassName} />
      )}
    </div>
  );
}
