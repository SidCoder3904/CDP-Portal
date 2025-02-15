"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

interface NavbarProps {
  menuItems: string[];
}

export default function Navbar({ menuItems }: NavbarProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoverStyle, setHoverStyle] = useState({});
  const [activeStyle, setActiveStyle] = useState({ left: "0px", width: "0px" });
  const tabRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Callback ref to manage refs dynamically
  const setTabRef = (index: number) => (el: HTMLDivElement | null) => {
    tabRefs.current[index] = el;
  };

  // Update hover style when hoveredIndex changes
  useEffect(() => {
    if (hoveredIndex !== null) {
      const hoveredElement = tabRefs.current[hoveredIndex];
      if (hoveredElement) {
        const { offsetLeft, offsetWidth } = hoveredElement;
        setHoverStyle({
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
        });
      }
    }
  }, [hoveredIndex]);

  // Update active style when activeIndex changes
  useEffect(() => {
    const activeElement = tabRefs.current[activeIndex];
    if (activeElement) {
      const { offsetLeft, offsetWidth } = activeElement;
      setActiveStyle({
        left: `${offsetLeft}px`,
        width: `${offsetWidth}px`,
      });
    }
  }, [activeIndex]);

  // Initialize active style on component mount
  useEffect(() => {
    requestAnimationFrame(() => {
      const firstTab = tabRefs.current[0];
      if (firstTab) {
        const { offsetLeft, offsetWidth } = firstTab;
        setActiveStyle({
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
        });
      }
    });
  }, []);

  return (
    <div className="flex flex-col w-full min-h-screen bg-white">
      {/* Top Header */}
      <div className="w-full bg-white py-4">
        <div className="max-w-[1400px] h-[60px] mx-auto flex justify-between items-center px-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <Image
                src="/cdpc_logo.png"
                alt="CDPC Logo"
                width={90}
                height={90}
                className="object-contain"
              />
              <div className="flex flex-col">
                <div className="text-template text-xl">
                  Career Development and Placement Portal
                </div>
                <div className="text-template text-2xl font-semibold">
                  Indian Institute of Technology Ropar
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="w-full bg-template">
        <Card className="w-full max-w-[1400px] h-[60px] border-none shadow-none relative flex items-center justify-between mx-auto bg-transparent">
          <CardContent className="p-0">
            <div className="relative">
              {/* Hover Highlight */}
              <div
                className="absolute h-[30px] transition-all duration-300 ease-out bg-white/10 rounded-[6px] flex items-center"
                style={{
                  ...hoverStyle,
                  opacity: hoveredIndex !== null ? 1 : 0,
                }}
              />

              {/* Active Indicator */}
              <div
                className="absolute bottom-[-6px] h-[2px] bg-white transition-all duration-300 ease-out"
                style={activeStyle}
              />

              {/* Tabs */}
              <div className="relative flex space-x-[6px] items-center">
                {menuItems.map((item, index) => (
                  <div
                    key={index}
                    ref={setTabRef(index)}
                    className={`px-3 py-2 cursor-pointer transition-colors duration-300 h-[30px] ${
                      index === activeIndex ? "text-white" : "text-white/80"
                    }`}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() => setActiveIndex(index)}
                  >
                    <div className="text-sm font-medium leading-5 whitespace-nowrap flex items-center justify-center h-full">
                      {item}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Page Content */}
      <div className="flex-1"></div>
    </div>
  );
}
