"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut } from "lucide-react";

interface NavbarProps {
  menuItems: { label: string; href: string }[];
}

export default function Navbar({ menuItems }: NavbarProps) {
  const { isAuthenticated, user, logout } = useAuth();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoverStyle, setHoverStyle] = useState({});
  const [activeStyle, setActiveStyle] = useState({ left: "0px", width: "0px" });
  const tabRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const headerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  // Avoid hydration mismatch for auth-based UI
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update activeIndex on route change
  useEffect(() => {
    // Find the menu item with the longest matching prefix
    const matchingItems = menuItems
      .map((item, index) => ({ href: item.href, index }))
      .filter((item) => pathname.startsWith(item.href))
      .sort((a, b) => b.href.length - a.href.length);

    if (matchingItems.length > 0) {
      setActiveIndex(matchingItems[0].index);
    }
  }, [pathname, menuItems]);

  // Measure hover underline
  useEffect(() => {
    if (hoveredIndex !== null) {
      const el = tabRefs.current[hoveredIndex];
      if (el) {
        const { offsetLeft, offsetWidth } = el;
        setHoverStyle({ left: `${offsetLeft}px`, width: `${offsetWidth}px` });
      }
    }
  }, [hoveredIndex]);

  // Measure active underline after layout
  useLayoutEffect(() => {
    const el = tabRefs.current[activeIndex];
    if (el) {
      const { offsetLeft, offsetWidth } = el;
      setActiveStyle({ left: `${offsetLeft}px`, width: `${offsetWidth}px` });
    }
  }, [activeIndex, menuItems]);

  const setTabRef = (i: number) => (el: HTMLDivElement | null) => {
    tabRefs.current[i] = el;
  };

  // --- Sticky Navbar and Header Scroll Logic ---
  // Persist sticky/header state across tab switches
  useEffect(() => {
    if (!headerRef.current || !navRef.current) return;
    const navRect = navRef.current.getBoundingClientRect();
    const scrollY = window.scrollY;
    if (navRect.top <= 0) {
      setIsSticky(true);
      setShowHeader(false);
    } else {
      setIsSticky(false);
      setShowHeader(true);
    }
    lastScrollY.current = scrollY;
  }, [pathname]);

  useEffect(() => {
    let navOffsetTop = 0;
    if (navRef.current) {
      navOffsetTop = navRef.current.offsetTop;
    }
    const handleScroll = () => {
      if (!headerRef.current || !navRef.current) return;
      const scrollY = window.scrollY;
      const scrollDelta = scrollY - lastScrollY.current;
      // Nav bar should always be visible, only header hides/shows
      if (scrollY >= navOffsetTop) {
        setIsSticky(true);
        // Hide header when scrolling down, show only at very top
        if (scrollDelta > 0) {
          setShowHeader(false);
        } else if (scrollDelta < 0 && scrollY === 0) {
          setShowHeader(true);
        }
      } else {
        setIsSticky(false);
        setShowHeader(true);
      }
      lastScrollY.current = scrollY;
      ticking.current = false;
    };
    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(handleScroll);
        ticking.current = true;
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="flex flex-col w-full bg-white">
      <div
        ref={headerRef}
        className={`w-full bg-white py-4 transition-all duration-300 ease-in-out ${
          showHeader ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        } overflow-hidden`}
        style={{
          zIndex: isSticky ? 41 : 30,
          position: isSticky && showHeader ? 'fixed' : 'static',
          top: isSticky && showHeader ? 0 : undefined,
          left: 0,
          right: 0,
        }}
      >
        <div className="max-w-[1400px] h-[60px] mx-auto flex justify-between items-center px-4">
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
      <div
        ref={navRef}
        className={`w-full bg-template transition-all duration-300 ease-in-out ${
          isSticky ? 'fixed top-0 left-0 right-0 shadow-lg z-40' : ''
        }`}
        style={{
          marginTop: isSticky && !showHeader ? 0 : undefined,
          top: isSticky && showHeader ? headerRef.current?.offsetHeight || 0 : undefined,
        }}
      >
        <Card className="w-full max-w-[1400px] h-[60px] border-none shadow-none relative flex items-center justify-between mx-auto bg-transparent">
          <CardContent className="p-0">
            <div className="relative">
              <div
                className="absolute h-[30px] transition-all duration-300 ease-out bg-white/10 rounded-[6px] flex items-center"
                style={{
                  ...hoverStyle,
                  opacity: hoveredIndex !== null ? 1 : 0,
                }}
              />
              <div
                className="absolute bottom-[-6px] h-[2px] bg-white transition-all duration-300 ease-out"
                style={activeStyle}
              />
              <div className="relative flex space-x-[6px] items-center">
                {menuItems.map((item, idx) => {
                  // Find all matching prefixes and sort by length to get the longest match
                  const matchingItems = menuItems
                    .map((menuItem) => menuItem.href)
                    .filter((href) => pathname.startsWith(href))
                    .sort((a, b) => b.length - a.length);
                  const isActive =
                    matchingItems.length > 0 && matchingItems[0] === item.href;
                  return (
                    <Link key={idx} href={item.href} passHref>
                      <div
                        ref={setTabRef(idx)}
                        className={`px-3 py-2 cursor-pointer transition-colors duration-300 h-[30px] ${
                          isActive ? "text-white" : "text-white/80"
                        }`}
                        onMouseEnter={() => setHoveredIndex(idx)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      >
                        <div className="text-sm font-medium leading-5 whitespace-nowrap flex items-center justify-center h-full">
                          {item.label}
                        </div>
                      </div>
                    </Link>
                  );
                })}
                
              </div>
              
            </div>
          </CardContent>
          <div className="">
                  {mounted && isAuthenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 rounded-full"
                >
                  <User className="h-4 w-4 text-template " />
                  <div className="font-bold text-template">
                    {user?.email?.split("@")[0]}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="rounded-full">
                <DropdownMenuItem
                  onClick={logout}
                  className="text-red-600 font-bold cursor-pointer rounded-full"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}</div>
        </Card>
      </div>
      {/* Spacer to prevent content jump when nav is sticky */}
      {isSticky && <div style={{ height: 60 }} aria-hidden="true" />} 
    </div>
  );
}
