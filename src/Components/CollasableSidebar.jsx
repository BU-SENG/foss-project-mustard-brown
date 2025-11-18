"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IoChevronBack, IoSettingsOutline } from "react-icons/io5";
import { FiHome, FiLogOut } from "react-icons/fi";
import axios from "axios";
import { LuFolderKanban, LuListTodo, LuUsers } from "react-icons/lu";
import { motion, AnimatePresence } from "framer-motion";

export default function CollasableSidebar() {
  // ✅ Persist collapsed state across reloads
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sidebar-collapsed") === "true";
    }
    return false;
  });

  const [showContent, setShowContent] = useState(!collapsed);
  const pathname = usePathname();

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", collapsed.toString());
    if (collapsed) {
      setShowContent(false);
    } else {
      const timeout = setTimeout(() => setShowContent(true), 300);
      return () => clearTimeout(timeout);
    }
  }, [collapsed]);

  const navItems = [
    { icon: FiHome, label: "Dashboard", path: "/Dashboard" },
    { icon: LuFolderKanban, label: "Projects", path: "/Dashboard/Projects" },
    { icon: LuListTodo, label: "Tasks", path: "/Dashboard/Tasks" },
    { icon: LuUsers, label: "Team", path: "/Dashboard/Team" },
  ];

  // const handleLogout = () => {
  //   localStorage.removeItem("authToken");
  //   window.location.href = "/Login";
  // };

  return (
    <div
      className={`h-screen border-r border-gray-300 overflow-y-auto flex flex-col transition-all justify-between duration-500 ease-in-out bg-white ${
        collapsed ? "w-[70px]" : "w-[250px]"
      }`}
    >
      <div>
        <div className="w-full flex items-center justify-between p-3 border-b border-gray-300">
          {showContent && (
            <div className="flex gap-2 items-center transition-opacity duration-300">
              <Image
                src="/Copilot_20251014_120138.png"
                alt="logo"
                width={35}
                height={35}
                className="rounded-md"
              />
              <h1 className="font-semibold text-base">OpenTask</h1>
            </div>
          )}
          <button
            className="w-10 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-all"
            onClick={() => setCollapsed(!collapsed)}
          >
            <IoChevronBack
              className={`text-lg transition-transform duration-500 ${
                collapsed ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        <div className="flex flex-col gap-2 p-3">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`relative flex items-center gap-4 p-2 rounded-md overflow-hidden transition-all ${
                  isActive
                    ? "bg-[#9f00ff]/10 text-[#9f00ff] font-semibold"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -10, opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                      }}
                      className="absolute left-0 top-0 h-full w-[3px] bg-[#9f00ff] rounded-r-md"
                    />
                  )}
                </AnimatePresence>

                <item.icon className="text-[22px] flex-shrink-0 z-10" />
                {!collapsed && showContent && (
                  <motion.span
                    transition={{ duration: 0.3 }}
                    className="text-sm z-10"
                  >
                    {item.label}
                  </motion.span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="w-full p-3">
        <button
          onClick={async () => {
            try {
              await axios.post("/api/logout");
              localStorage.removeItem("sidebar-collapsed");
              window.location.href = "/Login";
            } catch (error) {
              console.error("Logout failed:", error);
              window.location.href = "/Login";
            }
          }}
          className="w-full relative overflow-hidden flex items-center gap-4 p-2 rounded-md bg-red-100 text-red-600 font-semibold hover:bg-red-200 transition-all cursor-pointer"
        >
          <div className="absolute left-0 top-0 h-full w-[3px] bg-red-500 rounded-r-md"></div>

          <FiLogOut className="text-[22px] flex-shrink-0 z-10" />

          {!collapsed && showContent && (
            <motion.span
              transition={{ duration: 0.3 }}
              className="text-sm z-10"
            >
              Logout
            </motion.span>
          )}
        </button>
      </div>
    </div>
  );
}
