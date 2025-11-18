"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  LuPlus,
  LuUsers,
  LuFolderOpen,
  LuClipboardList,
  LuTrendingUp,
} from "react-icons/lu";
import { IoIosSearch } from "react-icons/io";
import { IoFilter } from "react-icons/io5";
import { BiSort } from "react-icons/bi";
import Select from "react-select";
import axios from "axios";
import Swal from "sweetalert2";
import { RotatingLines } from "react-loader-spinner";
import { FiMail, FiCalendar, FiFolder, FiClipboard } from "react-icons/fi";
import { TEAM_ROLES } from "@/Constants/roles";
import { useRouter } from "next/navigation";

export default function Team() {
  const [openForm, setOpenForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);

  // Stats
  const [totalMembers, setTotalMembers] = useState(0);
  const [uniqueProjects, setUniqueProjects] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);
  const [avgTasks, setAvgTasks] = useState(0);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    role: [],
    project: null,
  });

  // Sort
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  const router = useRouter();

  const [formData, setFormData] = useState({
    userId: "",
    projectId: "",
    role: "",
  });

  const [errors, setErrors] = useState({});

  // Fetch all data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [projectsRes, usersRes, teamRes] = await Promise.all([
        axios.get("/api/project?simple=true"),
        axios.get("/api/user"),
        axios.get("/api/team"),
      ]);

      const { members, stats } = teamRes.data;
      setProjects(projectsRes.data);
      setUsers(usersRes.data);
      setTeamMembers(members);

      // Set stats
      setTotalMembers(stats.totalMembers);
      setUniqueProjects(stats.uniqueProjects);
      setTotalTasks(stats.totalTasks);
      setAvgTasks(stats.avgTasks);
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to load data. Please refresh.",
        icon: "error",
        confirmButtonColor: "#f2521e",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle sort change
  const handleSortChange = (key, order) => {
    setSortBy(key);
    setSortOrder(order);
    setShowSortDropdown(false);
  };

  // Clear all filters
  const clearFilters = () => {
    setActiveFilters({ role: [], project: null });
    setShowFilterPanel(false);
  };

  const handleSelectChange = (selectedOption, name) => {
    setFormData((prev) => ({
      ...prev,
      [name]: selectedOption?.value || "",
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.userId) newErrors.userId = "Select a user";
    if (!formData.projectId) newErrors.projectId = "Select a project";
    if (!formData.role) newErrors.role = "Role is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await axios.post("/api/team", formData);
      Swal.fire({
        title: "Success!",
        text: "Team member added/updated",
        icon: "success",
        confirmButtonColor: "#9f00ff",
        timer: 2000,
      });
      setFormData({ userId: "", projectId: "", role: "" });
      setOpenForm(false);
      await fetchData();
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to add member",
        icon: "error",
        confirmButtonColor: "#f2521e",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered & Sorted Members
  const filteredMembers = useMemo(() => {
    return teamMembers
      .filter((member) => {
        const matchesSearch =
          member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRole =
          activeFilters.role.length === 0 ||
          activeFilters.role.some((r) => member.roles.includes(r));

        const matchesProject =
          !activeFilters.project ||
          member.projects.some((title) => {
            const project = projects.find(
              (p) => p._id === activeFilters.project
            );
            return (
              project && project.title.toLowerCase() === title.toLowerCase()
            );
          });

        return matchesSearch && matchesRole && matchesProject;
      })
      .sort((a, b) => {
        let aVal, bVal;

        switch (sortBy) {
          case "name":
            aVal = a.name;
            bVal = b.name;
            break;
          case "dateJoined":
            aVal = new Date(a.dateJoined);
            bVal = new Date(b.dateJoined);
            break;
          case "projectCount":
            aVal = a.projectCount;
            bVal = b.projectCount;
            break;
          case "taskCount":
            aVal = a.taskCount;
            bVal = b.taskCount;
            break;
          default:
            return 0;
        }

        return sortOrder === "asc"
          ? aVal > bVal
            ? 1
            : -1
          : aVal < bVal
          ? 1
          : -1;
      });
  }, [teamMembers, searchTerm, activeFilters, sortBy, sortOrder, projects]);

  // Skeleton Card
  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-14 h-14 rounded-xl bg-gray-200" />
        <div className="flex-1">
          <div className="h-5 bg-gray-200 rounded w-32 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-20" />
        </div>
      </div>
      <div className="mt-4 h-4 bg-gray-200 rounded w-40" />
      <div className="grid grid-cols-2 gap-3 mt-5">
        <div className="bg-gray-100 rounded-xl p-3">
          <div className="h-6 bg-gray-200 rounded w-8 mx-auto" />
          <div className="h-3 bg-gray-200 rounded w-16 mx-auto mt-1" />
        </div>
        <div className="bg-gray-100 rounded-xl p-3">
          <div className="h-6 bg-gray-200 rounded w-8 mx-auto" />
          <div className="h-3 bg-gray-200 rounded w-16 mx-auto mt-1" />
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-2">
        <p className="text-xs text-gray-400">Team</p>
        <div className="w-full flex items-center justify-between border-b border-gray-300 pb-4">
          <h1 className="text-2xl font-bold w-1/2">Team Members</h1>
          <button
            className="group transition-all duration-300 flex items-center justify-center gap-2 px-6 py-3 text-xs font-semibold text-white bg-gradient-to-r from-[#f2521e] to-[#9f00ff] rounded-lg hover:shadow-lg"
            onClick={() => setOpenForm(true)}
            disabled={isLoading}
          >
            <LuPlus className="text-sm transform transition-transform duration-300 group-hover:rotate-90" />
            Invite Member
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="border-l-3 border-gray-300 p-4 bg-white rounded-xl border animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
              <div className="h-8 bg-gray-200 rounded w-12" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Active Projects */}
          <div className="border-l-3 border-[#4f46e5] p-4 bg-white hover:shadow-lg rounded-xl border flex items-center justify-between transition-shadow">
            <div>
              <h2 className="text-sm font-semibold text-gray-500">
                Active Projects
              </h2>
              <p className="text-2xl font-bold text-[#4f46e5] mt-1">
                {uniqueProjects}
              </p>
            </div>
            <div className="w-11 h-11 text-xl bg-gradient-to-br from-[#4f46e5]/10 to-[#4f46e5]/5 rounded-full flex items-center justify-center text-[#4f46e5]">
              <LuFolderOpen className="w-6 h-6" />
            </div>
          </div>

          {/* Total Tasks */}
          <div className="border-l-3 border-[#ec4899] p-4 bg-white hover:shadow-lg rounded-xl border flex items-center justify-between transition-shadow">
            <div>
              <h2 className="text-sm font-semibold text-gray-500">
                Tasks Assigned
              </h2>
              <p className="text-2xl font-bold text-[#ec4899] mt-1">
                {totalTasks}
              </p>
            </div>
            <div className="w-11 h-11 text-xl bg-gradient-to-br from-[#ec4899]/10 to-[#ec4899]/5 rounded-full flex items-center justify-center text-[#ec4899]">
              <LuClipboardList className="w-6 h-6" />
            </div>
          </div>

          {/* Team Members */}
          <div className="border-l-3 border-[#10b981] p-4 bg-white hover:shadow-lg rounded-xl border flex items-center justify-between transition-shadow">
            <div>
              <h2 className="text-sm font-semibold text-gray-500">
                Total Team Members
              </h2>
              <p className="text-2xl font-bold text-[#10b981] mt-1">
                {totalMembers}
              </p>
            </div>
            <div className="w-11 h-11 text-xl bg-gradient-to-br from-[#10b981]/10 to-[#10b981]/5 rounded-full flex items-center justify-center text-[#10b981]">
              <LuUsers className="w-6 h-6" />
            </div>
          </div>

          {/* Avg Tasks per Member */}
          <div className="border-l-3 border-[#f59e0b] p-4 bg-white hover:shadow-lg rounded-xl border flex items-center justify-between transition-shadow">
            <div>
              <h2 className="text-sm font-semibold text-gray-500">
                Avg. Tasks/Member
              </h2>
              <p className="text-2xl font-bold text-[#f59e0b] mt-1">
                {avgTasks}
              </p>
            </div>
            <div className="w-11 h-11 text-xl bg-gradient-to-br from-[#f59e0b]/10 to-[#f59e0b]/5 rounded-full flex items-center justify-center text-[#f59e0b]">
              <LuTrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>
      )}

      {/* SEARCH + FILTER + SORT BAR */}
      <div className="w-full h-10 flex gap-6 items-center justify-between mb-4">
        {/* Search Input */}
        <div className="w-full border border-[#e5e7eb] h-full rounded-lg relative">
          <input
            type="search"
            className="w-full h-full px-10 text-xs outline-none"
            placeholder="Search for member here..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute top-0 left-0 h-full w-10 flex items-center justify-center text-gray-400">
            <IoIosSearch className="text-lg" />
          </div>
        </div>

        {/* Filter & Sort Icons */}
        <div className="w-fit h-full flex items-center gap-6 text-gray-600">
          <div className="relative">
            <IoFilter
              className={`text-xl cursor-pointer ${
                showFilterPanel ||
                activeFilters.role.length > 0 ||
                activeFilters.project
                  ? "text-purple-600"
                  : ""
              }`}
              onClick={() => setShowFilterPanel((prev) => !prev)}
            />
          </div>

          <div className="relative">
            <BiSort
              className={`text-xl cursor-pointer ${
                showSortDropdown ? "text-purple-600" : ""
              }`}
              onClick={() => setShowSortDropdown((prev) => !prev)}
            />
            {showSortDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1">
                {[
                  { key: "name", order: "asc", label: "Name (A-Z)" },
                  { key: "name", order: "desc", label: "Name (Z-A)" },
                  { key: "dateJoined", order: "asc", label: "Joined (Oldest)" },
                  {
                    key: "dateJoined",
                    order: "desc",
                    label: "Joined (Newest)",
                  },
                  {
                    key: "projectCount",
                    order: "desc",
                    label: "Projects (High-Low)",
                  },
                  {
                    key: "taskCount",
                    order: "desc",
                    label: "Tasks (High-Low)",
                  },
                ].map((opt) => (
                  <button
                    key={`${opt.key}-${opt.order}`}
                    onClick={() => handleSortChange(opt.key, opt.order)}
                    className={`block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 ${
                      sortBy === opt.key && sortOrder === opt.order
                        ? "font-bold text-purple-600"
                        : ""
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FILTER PANEL */}
      {showFilterPanel && (
        <div className="mt-4 p-4 bg-white border border-slate-200 rounded-lg shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-xs flex flex-col">
            <label className="text-xs font-semibold mb-1 block">Role</label>
            <Select
              isMulti
              options={TEAM_ROLES.map((r) => ({ value: r, label: r }))}
              value={TEAM_ROLES.filter((r) =>
                activeFilters.role.includes(r)
              ).map((r) => ({
                value: r,
                label: r,
              }))}
              onChange={(selected) =>
                setActiveFilters((prev) => ({
                  ...prev,
                  role: selected.map((s) => s.value),
                }))
              }
              className="text-black"
              placeholder="Filter by role..."
            />
          </div>

          <div className="text-xs flex flex-col">
            <label className="text-xs font-semibold mb-1 block">Project</label>
            <Select
              isClearable
              options={projects.map((p) => ({ value: p._id, label: p.title }))}
              value={
                activeFilters.project
                  ? {
                      value: activeFilters.project,
                      label: projects.find(
                        (p) => p._id === activeFilters.project
                      )?.title,
                    }
                  : null
              }
              onChange={(selected) =>
                setActiveFilters((prev) => ({
                  ...prev,
                  project: selected?.value || null,
                }))
              }
              className="text-black"
              placeholder="Filter by project..."
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full h-10 px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        Showing <span className="font-medium">{filteredMembers.length}</span> of{" "}
        <span className="font-medium">{teamMembers.length}</span> members
      </div>

      {/* Loading / Empty / Members */}
      {isLoading ? (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-[#f2521e] to-[#9f00ff] blur-3xl opacity-20 rounded-full w-32 h-32"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-gray-100">
              <IoIosSearch className="w-12 h-12 text-gray-400" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            No team members found
          </h3>
          <p className="text-sm text-gray-500 max-w-xs mb-5">
            Try adjusting your search or filters to see more results.
          </p>
          <button
            onClick={clearFilters}
            className="group flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#f2521e] to-[#9f00ff] rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            <IoFilter className="w-4 h-4 transition-transform group-hover:rotate-12" />
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => {
            const initials = member.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            const memberSince = new Date(member.dateJoined).toLocaleDateString(
              "en-US",
              {
                day: "numeric",
                month: "short",
                year: "numeric",
              }
            );

            return (
              <div
                key={member.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:max-w-sm w-full hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-3">
                  {/* Initials Box */}
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg shadow-md flex-shrink-0">
                    {initials}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Name */}
                    <h3 className="font-semibold text-gray-900 text-lg truncate">
                      {member.name}
                    </h3>

                    {/* ROLES WITH PERFECT MARQUEE */}
                    <div className="relative mt-1 h-6 overflow-hidden">
                      <div
                        className={`absolute left-0 top-0 flex gap-2 whitespace-nowrap ${
                          member.roles?.length > 1 ? "animate-scroll" : ""
                        }`}
                      >
                        {member.roles?.map((role, index) => (
                          <span
                            key={index}
                            className="text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-full font-medium"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 text-gray-600">
                  <FiMail size={16} />
                  <span className="text-xs line-clamp-1">{member.email}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-5">
                  <div className="bg-purple-50 rounded-xl p-3 text-center flex items-center justify-between">
                    <div>
                      <p className="text-xl font-bold text-gray-900">
                        {member.projectCount}
                      </p>
                      <p className="text-xs text-gray-600">Projects</p>
                    </div>
                    <FiFolder className="text-purple-600" size={20} />
                  </div>
                  <div className="bg-pink-50 rounded-xl p-3 text-center flex items-center justify-between">
                    <div>
                      <p className="text-xl font-bold text-gray-900">
                        {member.taskCount}
                      </p>
                      <p className="text-xs text-gray-600">Tasks</p>
                    </div>
                    <FiClipboard className="text-orange-600" size={20} />
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 text-gray-600 text-xs">
                  <FiCalendar size={16} />
                  <span>Member since {memberSince}</span>
                </div>

                <button
                  onClick={() => router.push(`/Dashboard/Team/${member.id}`)}
                  className="mt-5 w-full text-xs bg-gradient-to-r from-orange-500 to-purple-600 text-white font-medium py-3 rounded-lg hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
                >
                  View Profile
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL FORM */}
      {openForm && (
        <div
          onClick={() => setOpenForm(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg shadow-lg w-[90%] max-w-lg p-6"
          >
            <h2 className="text-lg font-semibold mb-4">Add Team Member</h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">User</label>
                <Select
                  options={users.map((u) => ({
                    value: u._id,
                    label: `${u.fullName} (${u.email})`,
                  }))}
                  onChange={(option) => handleSelectChange(option, "userId")}
                  placeholder="Select user..."
                  className="text-sm"
                  isDisabled={isSubmitting}
                />
                {errors.userId && (
                  <p className="text-red-500 text-xs mt-1">{errors.userId}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Project
                </label>
                <Select
                  options={projects.map((p) => ({
                    value: p._id,
                    label: p.title,
                  }))}
                  onChange={(option) => handleSelectChange(option, "projectId")}
                  placeholder="Select project..."
                  className="text-sm"
                  isDisabled={isSubmitting}
                />
                {errors.projectId && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.projectId}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <Select
                  options={TEAM_ROLES.map((role) => ({
                    value: role,
                    label: role,
                  }))}
                  onChange={(option) => handleSelectChange(option, "role")}
                  value={
                    formData.role
                      ? { value: formData.role, label: formData.role }
                      : null
                  }
                  placeholder="Select role..."
                  className="text-sm"
                  isSearchable
                  isDisabled={isSubmitting}
                />
                {errors.role && (
                  <p className="text-red-500 text-xs mt-1">{errors.role}</p>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100"
                  onClick={() => setOpenForm(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-4 py-2 text-sm font-semibold text-white rounded-md transition-all duration-300 flex items-center gap-2 ${
                    isSubmitting
                      ? "opacity-50 cursor-not-allowed bg-gray-400"
                      : "bg-gradient-to-r from-[#f2521e] to-[#9f00ff] hover:shadow-lg"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <RotatingLines
                        strokeColor="white"
                        strokeWidth="4"
                        width="20"
                      />
                      Adding...
                    </>
                  ) : (
                    "Add Member"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
