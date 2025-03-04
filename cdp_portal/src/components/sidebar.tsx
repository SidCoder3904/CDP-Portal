"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

const navItems = [
  { name: "Basic Details", href: "/student/profile", icon: ChevronRight },
  {
    name: "Education/Academic",
    href: "/student/profile/education",
    icon: ChevronRight,
  },
  {
    name: "Experience",
    href: "/student/profile/experience",
    icon: ChevronRight,
  },
  {
    name: "Positions of Responsibility",
    href: "/student/profile/positions",
    icon: ChevronRight,
  },
  { name: "Projects", href: "/student/profile/projects", icon: ChevronRight },
  { name: "Resume", href: "/student/profile/resume", icon: ChevronRight },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <motion.nav
      initial={{ width: 64 }}
      animate={{ width: isOpen ? 240 : 64 }}
      className="bg-secondary min-h-screen overflow-hidden"
    >
      <div className="p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isOpen ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-2xl text-template font-bold mb-6"
        >
          Student Profile
        </motion.div>
        <ul>
          {navItems.map((item) => (
            <li key={item.name} className="mb-2">
              <Link href={item.href} passHref>
                <motion.div
                  className={`flex items-center p-2 rounded-lg cursor-pointer ${
                    pathname === item.href
                      ? "bg-template text-primary-foreground"
                      : "hover:bg-secondary-foreground/10"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isOpen ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.name}
                  </motion.span>
                </motion.div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      {/* <motion.button
        className="absolute bottom-4 right-4 p-2 rounded-full bg-primary text-primary-foreground"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <ChevronRight
          className={`w-6 h-6 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </motion.button> */}
    </motion.nav>
  );
}
