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

  return (
    <div className="flex flex-col w-full bg-white">
      <div className="w-full bg-white py-4">
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

          {mounted && isAuthenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {user?.email?.split("@")[0]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link
                    href={user?.role === "admin" ? "/admin" : "/student"}
                    className="w-full"
                  >
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link
                    href={
                      user?.role === "admin"
                        ? "/admin/profile"
                        : "/student/profile"
                    }
                    className="w-full"
                  >
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="text-red-600 cursor-pointer"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <div className="w-full bg-template">
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
        </Card>
      </div>
    </div>
  );
}
