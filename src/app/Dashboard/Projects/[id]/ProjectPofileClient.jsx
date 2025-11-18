"use client";

import { useState } from "react";
import CollasableSidebar from "@/Components/CollasableSidebar";
import ProjectProfile from "@/Components/ProjectProfile";
import { HiOutlineMenuAlt2 } from "react-icons/hi";

export default function ProjectClient({ projectId, currentUserId }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="relative flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-300
          transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          md:relative md:translate-x-0
        `}
      >
        <CollasableSidebar />
      </aside>

      {/* Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-gray-300 bg-white px-6 md:px-6">
          <button onClick={() => setMobileMenuOpen(true)} className="text-2xl md:hidden">
            <HiOutlineMenuAlt2 />
          </button>
          <h1 className="text-2xl font-bold">Project Profile</h1>
          <div className="w-10 md:hidden" />
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50 p-6 scrollbar-thin scrollbar-thumb-gray-300">
          <ProjectProfile projectId={projectId} currentUserId={currentUserId} />
        </main>
      </div>
    </div>
  );
}