"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";

export interface SlideTabItem {
  label: string;
  href?: string;
  onClick?: () => void;
  id?: string;
  badge?: string;
}

export interface SlideTabsProps {
  items?: SlideTabItem[];
  activeId?: string;
  onChange?: (id: string, index: number) => void;
  className?: string;
  pillColor?: string;
  textColor?: string;
  activeTextColor?: string;
  borderColor?: string;
}

const DEFAULT_ITEMS: SlideTabItem[] = [
  { label: "Home", href: "/" },
  { label: "Pricing", href: "/pricing" },
  { label: "Features", href: "/features" },
  { label: "Docs", href: "/docs" },
  { label: "Blog", href: "/blog" },
];

export const SlideTabs: React.FC<SlideTabsProps> = ({
  items = DEFAULT_ITEMS,
  activeId,
  onChange,
  className = "",
  pillColor = "bg-black",
  textColor = "text-black",
  activeTextColor = "text-white",
  borderColor = "border-black",
}) => {
  const location = useLocation();
  const [position, setPosition] = useState<{
    left: number;
    width: number;
    opacity: number;
  }>({
    left: 0,
    width: 0,
    opacity: 0,
  });

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLUListElement>(null);
  const tabRefs = useRef<(HTMLLIElement | null)[]>([]);

  // Find active item index based on activeId prop or current pathname
  const activeIndex = items.findIndex((item) => {
    if (activeId) return item.id === activeId || item.label.toLowerCase() === activeId.toLowerCase();
    if (item.href) {
      if (item.href === "/" && location.pathname === "/") return true;
      if (item.href !== "/" && location.pathname.startsWith(item.href)) return true;
    }
    return false;
  });

  const currentHighlightIndex = hoveredIndex !== null ? hoveredIndex : (activeIndex >= 0 ? activeIndex : null);

  const updatePosition = (index: number) => {
    const el = tabRefs.current[index];
    if (el) {
      setPosition({
        left: el.offsetLeft,
        width: el.offsetWidth,
        opacity: 1,
      });
    }
  };

  useEffect(() => {
    if (activeIndex >= 0) {
      updatePosition(activeIndex);
    } else if (hoveredIndex === null) {
      setPosition((prev) => ({ ...prev, opacity: 0 }));
    }
  }, [activeIndex, location.pathname]);

  return (
    <ul
      ref={containerRef}
      onMouseLeave={() => {
        setHoveredIndex(null);
        if (activeIndex >= 0) {
          updatePosition(activeIndex);
        } else {
          setPosition((prev) => ({ ...prev, opacity: 0 }));
        }
      }}
      className={`relative mx-auto flex w-fit items-center rounded-full border-2 ${borderColor} bg-white p-1 shadow-sm select-none ${className}`}
    >
      {items.map((item, index) => {
        const isHoveredOrActive = currentHighlightIndex === index;

        const content = (
          <span className="relative z-10 flex items-center gap-1.5 whitespace-nowrap">
            <span>{item.label}</span>
            {item.badge && (
              <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-wider transition-colors ${isHoveredOrActive ? "bg-white text-black" : "bg-black text-white"}`}>
                {item.badge}
              </span>
            )}
          </span>
        );

        return (
          <li
            key={item.label + index}
            ref={(el) => { tabRefs.current[index] = el; }}
            onMouseEnter={() => {
              setHoveredIndex(index);
              updatePosition(index);
            }}
            onClick={() => {
              onChange?.(item.id || item.label, index);
              item.onClick?.();
            }}
            className={`relative z-10 block cursor-pointer px-4 py-2 text-xs font-black uppercase tracking-wider transition-colors duration-200 md:px-5 md:py-2.5 md:text-sm ${
              isHoveredOrActive ? activeTextColor : textColor
            }`}
          >
            {item.href ? (
              <Link to={item.href} className="outline-none">
                {content}
              </Link>
            ) : (
              content
            )}
          </li>
        );
      })}

      <Cursor position={position} pillColor={pillColor} />
    </ul>
  );
};

const Cursor = ({
  position,
  pillColor = "bg-black",
}: {
  position: { left: number; width: number; opacity: number };
  pillColor?: string;
}) => {
  return (
    <motion.li
      animate={{
        left: position.left,
        width: position.width,
        opacity: position.opacity,
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 32,
      }}
      className={`pointer-events-none absolute z-0 h-[calc(100%-8px)] rounded-full ${pillColor}`}
      style={{
        top: 4,
      }}
    />
  );
};

export default SlideTabs;
