"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import TeamProfile from "@/Components/TeamProfile";
import { RotatingLines } from "react-loader-spinner";
import CollasableSidebar from "@/Components/CollasableSidebar";
import { HiOutlineMenuAlt2 } from "react-icons/hi";

export default function TeamProfileClient({ memberId }) {
  const router = useRouter();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!memberId) return;

    const fetchMember = async () => {
      try {
        const { data } = await axios.get("/api/team");
        const foundMember = data.members.find((m) => m.id === memberId);

        if (!foundMember) throw new Error("Member not found");

        setMember(foundMember);
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.message || err.message || "Failed to load member"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, [memberId]);

  const handleBack = () => router.push("/Dashboard/Team");

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <RotatingLines strokeColor="#9f00ff" width="40" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p className="text-red-600">{error}</p>
        <button
          onClick={handleBack}
          className="px-6 py-3 bg-gradient-to-r from-[#f2521e] to-[#9f00ff] text-white rounded-lg"
        >
          Back to Team
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen w-full overflow-hidden">
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

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className="flex flex-1 flex-col">
        <header className="flex h-[56.5px] items-center justify-between border-b border-gray-300 bg-white px-6 md:px-6">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="text-2xl md:hidden"
          >
            <HiOutlineMenuAlt2 />
          </button>
          <h1 className="text-2xl font-bold">Team Profile</h1>
          <div className="w-10 md:hidden" />
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50 p-6 scrollbar-thin scrollbar-thumb-gray-300">
          <TeamProfile member={member} onBack={handleBack} />
        </main>
      </div>
    </div>
  );
}
