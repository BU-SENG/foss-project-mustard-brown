"use client";

import React, { useState, useEffect, useMemo } from "react";
import { LuPlus } from "react-icons/lu";
import Loader from "./Loader";
import axios from "axios";
import Select from "react-select";
import Swal from "sweetalert2";
import { FiClock, FiMoreVertical, FiEdit3, FiTrash2 } from "react-icons/fi";
import { FaRegCircle, FaRegCircleCheck } from "react-icons/fa6";
import { LuListChecks } from "react-icons/lu";
import CountUp from "react-countup";
import { IoIosSearch } from "react-icons/io";
import { IoFilter } from "react-icons/io5";
import { BiSort } from "react-icons/bi";
import { CiCalendar } from "react-icons/ci";
import { LuFolderKanban } from "react-icons/lu";
import { useRouter } from "next/navigation";

export default function Tasks({ currentUserId }) {
  const router = useRouter();

  const [openForm, setOpenForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    todo: 0,
    pending: 0,
    completed: 0,
    total: 0,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage] = useState(5);

  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const [activeFilters, setActiveFilters] = useState({
    status: [],
    priority: [],
    project: null,
  });

  const [sortCriteria, setSortCriteria] = useState({
    key: "dueDate",
    order: "asc",
  });

  const [menuOpenFor, setMenuOpenFor] = useState(null);
  const [selectedProjectOption, setSelectedProjectOption] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/task");
        setStats(
          res.data.stats || { todo: 0, pending: 0, completed: 0, total: 0 }
        );
        setProjects(res.data.projects || []);
        setTasks(res.data.tasks || []);
      } catch (err) {
        console.error("Stats fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeFilters]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuOpenFor && !e.target.closest(".task-menu")) {
        setMenuOpenFor(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [menuOpenFor]);

  const getStatusKey = (status) => {
    if (!status && status !== "") return "";
    const s = String(status).toLowerCase().replace(/\s+/g, "");
    if (s.includes("todo")) return "todo";
    if (s.includes("pending")) return "pending";
    if (s.includes("completed")) return "completed";
    return s;
  };

  const getStatusStyles = (statusKey) => {
    switch (statusKey) {
      case "completed":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "pending":
        return "bg-[#eff6ff] text-blue-700 border border-blue-200";
      case "todo":
      default:
        return "bg-slate-100 text-slate-600 border border-slate-200";
    }
  };

  const formatStatusLabel = (statusKey) => {
    switch (statusKey) {
      case "completed":
        return "Completed";
      case "pending":
        return "In Progress";
      case "todo":
      default:
        return "To Do";
    }
  };

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-50 text-red-600 border border-red-200";
      case "Medium":
        return "bg-amber-50 text-amber-600 border border-amber-200";
      case "Low":
      default:
        return "bg-slate-100 text-slate-600 border border-slate-200";
    }
  };

  const getAvatarColor = (index) => {
    const colors = [
      "bg-blue-500",
      "bg-pink-500",
      "bg-emerald-500",
      "bg-amber-500",
      "bg-purple-500",
      "bg-cyan-500",
      "bg-rose-500",
      "bg-indigo-500",
    ];
    return colors[index % colors.length];
  };

  const handleSortChange = (key, order) => {
    setSortCriteria({ key, order });
    setShowSortDropdown(false);
  };

  const processedTasks = useMemo(() => {
    let tempTasks = [...tasks];

    if (searchQuery) {
      tempTasks = tempTasks.filter((task) => {
        const q = searchQuery.toLowerCase();
        return (
          task.title?.toLowerCase().includes(q) ||
          task.description?.toLowerCase().includes(q) ||
          task.priority?.toLowerCase().includes(q) ||
          (task.status || "").toLowerCase().includes(q)
        );
      });
    }

    if (activeFilters.status.length > 0) {
      tempTasks = tempTasks.filter((task) =>
        activeFilters.status.some(
          (f) => String(f).toLowerCase() === getStatusKey(task.status)
        )
      );
    }

    if (activeFilters.priority.length > 0) {
      tempTasks = tempTasks.filter((task) =>
        activeFilters.priority.includes(task.priority)
      );
    }

    if (activeFilters.project) {
      tempTasks = tempTasks.filter((task) => {
        const projId =
          task.project?._id?.toString() || task.project?.toString() || "";
        return projId === activeFilters.project?.toString();
      });
    }

    const { key, order } = sortCriteria;
    tempTasks.sort((a, b) => {
      let valA = a[key],
        valB = b[key];

      if (key === "priority") {
        const orderMap = { High: 3, Medium: 2, Low: 1 };
        valA = orderMap[a.priority] || 0;
        valB = orderMap[b.priority] || 0;
      } else if (key === "dueDate") {
        valA = a.dueDate ? new Date(a.dueDate) : 0;
        valB = b.dueDate ? new Date(b.dueDate) : 0;
        if (valA === 0) return 1;
        if (valB === 0) return -1;
      } else if (typeof valA === "string") {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      return (valA < valB ? -1 : 1) * (order === "asc" ? 1 : -1);
    });

    return tempTasks;
  }, [tasks, searchQuery, activeFilters, sortCriteria]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    dueDate: "",
    project: "",
    assignedTo: [],
    status: "todo",
  });

  const creatableProjects = projects.filter(
    (p) => p.createdBy?._id === currentUserId
  );

  const selectedProject = selectedProjectOption
    ? creatableProjects.find((p) => p._id === selectedProjectOption.value)
    : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("/api/task", formData);

      Swal.fire({
        icon: "success",
        title: "Task Created!",
        text: res.data.message || "Task created successfully.",
        showConfirmButton: false,
        timer: 2000,
      });

      setOpenForm(false);
      setFormData({
        title: "",
        description: "",
        priority: "Medium",
        dueDate: "",
        project: "",
        assignedTo: [],
        status: "todo",
      });
      setSelectedProjectOption(null);

      const updated = await axios.get("/api/task");
      setStats(updated.data.stats);
      setProjects(updated.data.projects);
      setTasks(updated.data.tasks);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed to Create Task",
        text: err.response?.data?.error || "Something went wrong.",
        confirmButtonColor: "#9f00ff",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (taskId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This task will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/api/task/${taskId}`);
        Swal.fire("Deleted!", "Task has been deleted.", "success");

        const updated = await axios.get("/api/task");
        setStats(updated.data.stats);
        setProjects(updated.data.projects);
        setTasks(updated.data.tasks);
      } catch (err) {
        Swal.fire("Error", "Failed to delete task.", "error");
      }
    }
    setMenuOpenFor(null);
  };

  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = processedTasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalPages = Math.ceil(processedTasks.length / tasksPerPage);

  const goToPrevPage = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const goToNextPage = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  const handleAddTaskClick = () => {
    if (creatableProjects.length === 0) {
      Swal.fire({
        icon: "info",
        title: "No Project Yet",
        text: "You need to create a project before you can add tasks.",
        confirmButtonText: "Got it",
        confirmButtonColor: "#9f00ff",
      });
    } else {
      setOpenForm(true);
    }
  };

  return (
    <div className="w-full min-h-full">
      {loading ? (
        <Loader />
      ) : (
        <div className="w-full h-full">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-2">
            <p className="text-xs text-gray-400">Task</p>
            <div className="w-full flex items-center justify-between border-b border-gray-300 pb-4">
              <h1 className="text-2xl font-bold w-1/2">All Tasks</h1>
              <button
                className="group transition-all duration-300 flex items-center justify-center gap-2 px-6 py-3 text-xs font-semibold text-white bg-gradient-to-r from-[#f2521e] to-[#9f00ff] rounded-lg hover:shadow-lg"
                onClick={handleAddTaskClick}
              >
                <LuPlus className="text-sm transform transition-transform duration-300 group-hover:rotate-90" />
                Add Task
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="border-l-3 border-[#e5e7eb] p-4 bg-white hover:shadow rounded-xl border flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-500">To Do</h2>
                <p className="text-2xl font-bold text-black mt-2">
                  <CountUp end={stats.todo} duration={1.5} />
                </p>
              </div>
              <div className="w-10 h-10 text-2xl rounded-full flex items-center justify-center text-[#667599]">
                <FaRegCircle />
              </div>
            </div>
            <div className="border-l-3 border-[#3b82f6] p-4 bg-white hover:shadow rounded-xl border flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-500">
                  In Progress
                </h2>
                <p className="text-2xl font-bold text-[#3b82f6] mt-2">
                  <CountUp end={stats.pending} duration={1.5} />
                </p>
              </div>
              <div className="w-10 h-10 text-2xl rounded-full flex items-center justify-center text-[#3b82f6]">
                <FiClock />
              </div>
            </div>
            <div className="border-l-3 border-[#22c55e] p-4 bg-white hover:shadow rounded-xl border flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-500">
                  Completed
                </h2>
                <p className="text-2xl font-bold text-[#22c55e] mt-2">
                  <CountUp end={stats.completed} duration={1.5} />
                </p>
              </div>
              <div className="w-10 h-10 text-2xl rounded-full flex items-center justify-center text-[#22c55e]">
                <FaRegCircleCheck />
              </div>
            </div>
            <div className="border-l-3 border-[#ab03ff] p-4 bg-white hover:shadow rounded-xl border flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-500">
                  Total Tasks
                </h2>
                <p className="text-2xl font-bold text-[#ab03ff] mt-2">
                  <CountUp end={stats.total} duration={1.5} />
                </p>
              </div>
              <div className="w-10 h-10 text-2xl rounded-full flex items-center justify-center text-[#ab03ff]">
                <LuListChecks />
              </div>
            </div>
          </div>

          {/* Search + Filters */}
          <div className="mt-10 w-full h-10 flex gap-6 items-center justify-between">
            <div className="w-full border border-[#e5e7eb] h-full rounded-lg relative">
              <input
                type="search"
                className="w-full h-full px-10 text-xs outline-none"
                placeholder="Search for task here..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute top-0 left-0 h-full w-10 flex items-center justify-center text-gray-400">
                <IoIosSearch className="text-lg" />
              </div>
            </div>
            <div className="w-fit h-full items-center justify-end gap-6 text-gray-600 flex">
              <div className="relative">
                <IoFilter
                  className={`text-xl cursor-pointer ${
                    showFilterPanel ||
                    activeFilters.status.length > 0 ||
                    activeFilters.priority.length > 0 ||
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
                      {
                        key: "dueDate",
                        order: "asc",
                        label: "Due Date (Soonest)",
                      },
                      {
                        key: "dueDate",
                        order: "desc",
                        label: "Due Date (Latest)",
                      },
                      { key: "title", order: "asc", label: "Title (A-Z)" },
                      { key: "title", order: "desc", label: "Title (Z-A)" },
                      {
                        key: "priority",
                        order: "desc",
                        label: "Priority (High-Low)",
                      },
                      {
                        key: "priority",
                        order: "asc",
                        label: "Priority (Low-High)",
                      },
                    ].map((opt) => (
                      <button
                        key={`${opt.key}-${opt.order}`}
                        onClick={() => handleSortChange(opt.key, opt.order)}
                        className={`block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 ${
                          sortCriteria.key === opt.key &&
                          sortCriteria.order === opt.order
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

          {/* Filter Panel */}
          {showFilterPanel && (
            <div className="mt-4 p-4 bg-white border border-slate-200 rounded-lg shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-xs flex flex-col">
                <label className="text-xs font-semibold mb-1 block">
                  Status
                </label>
                <Select
                  isMulti
                  options={[
                    { value: "todo", label: "To Do" },
                    { value: "pending", label: "In Progress" },
                    { value: "completed", label: "Completed" },
                  ]}
                  value={[
                    { value: "todo", label: "To Do" },
                    { value: "pending", label: "In Progress" },
                    { value: "completed", label: "Completed" },
                  ].filter((opt) => activeFilters.status.includes(opt.value))}
                  onChange={(selected) =>
                    setActiveFilters((prev) => ({
                      ...prev,
                      status: selected.map((s) => s.value),
                    }))
                  }
                  className="text-black"
                  placeholder="Filter by status..."
                />
              </div>
              <div className="text-xs flex flex-col">
                <label className="text-xs font-semibold mb-1 block">
                  Priority
                </label>
                <Select
                  isMulti
                  options={[
                    { value: "High", label: "High" },
                    { value: "Medium", label: "Medium" },
                    { value: "Low", label: "Low" },
                  ]}
                  value={[
                    { value: "High", label: "High" },
                    { value: "Medium", label: "Medium" },
                    { value: "Low", label: "Low" },
                  ].filter((opt) => activeFilters.priority.includes(opt.value))}
                  onChange={(selected) =>
                    setActiveFilters((prev) => ({
                      ...prev,
                      priority: selected.map((s) => s.value),
                    }))
                  }
                  className="text-black"
                  placeholder="Filter by priority..."
                />
              </div>
              <div className="text-xs flex flex-col">
                <label className="text-xs font-semibold mb-1 block">
                  Project
                </label>
                <Select
                  isClearable
                  options={projects.map((p) => ({
                    value: p._id,
                    label: p.title,
                  }))}
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
                  onClick={() =>
                    setActiveFilters({
                      status: [],
                      priority: [],
                      project: null,
                    })
                  }
                  className="w-full h-10 px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}

          {/* Task List */}
          <div className="space-y-3 mt-10">
            {processedTasks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400 text-sm">
                  {searchQuery ||
                  activeFilters.status.length > 0 ||
                  activeFilters.priority.length > 0 ||
                  activeFilters.project
                    ? "No tasks match your filters."
                    : "No tasks yet. Create one to get started."}
                </p>
              </div>
            ) : (
              currentTasks.map((task) => (
                <div
                  key={task._id}
                  className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 relative"
                >
                  {/* Mobile View */}
                  <div className="flex flex-col sm:hidden gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base font-bold text-slate-900 flex-1">
                        {task.title?.toUpperCase() || "UNTITLED TASK"}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenFor(
                            menuOpenFor === task._id ? null : task._id
                          );
                        }}
                        className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors task-menu"
                      >
                        <FiMoreVertical className="w-5 h-5" />
                      </button>
                    </div>

                    <p className="text-sm text-slate-600 line-clamp-2">
                      {task.description || "No description provided."}
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${getStatusStyles(
                          getStatusKey(task.status)
                        )}`}
                      >
                        {formatStatusLabel(getStatusKey(task.status))}
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${getPriorityStyles(
                          task.priority
                        )}`}
                      >
                        {task.priority || "Medium"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      {task.project && (
                        <div className="flex items-center gap-2">
                          <LuFolderKanban />
                          <span>
                            {typeof task.project === "string"
                              ? projects.find((p) => p._id === task.project)
                                  ?.title || "Unknown"
                              : task.project.title || "Unknown"}
                          </span>
                        </div>
                      )}
                      {task.dueDate && (
                        <div className="flex items-center gap-1.5">
                          <CiCalendar className="w-3.5 h-3.5" />
                          <span>
                            {new Date(task.dueDate).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      {task.assignedTo?.length > 0 ? (
                        <div className="flex -space-x-2">
                          {task.assignedTo.slice(0, 4).map((user, i) => (
                            <div
                              key={user._id}
                              className="group/avatar relative"
                            >
                              <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-sm ${getAvatarColor(
                                  i
                                )}`}
                                title={user.fullName}
                              >
                                {user.fullName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </div>
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg opacity-0 group-hover/avatar:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                                {user.fullName}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">
                          Unassigned
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Desktop View */}
                  <div className="hidden sm:flex items-center gap-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-base font-bold text-slate-900">
                          {task.title?.toUpperCase() || "UNTITLED TASK"}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${getStatusStyles(
                              getStatusKey(task.status)
                            )}`}
                          >
                            {formatStatusLabel(getStatusKey(task.status))}
                          </span>
                          <span
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${getPriorityStyles(
                              task.priority
                            )}`}
                          >
                            {task.priority || "Medium"}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-slate-600 mb-2.5 line-clamp-1">
                        {task.description || "No description provided."}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        {task.project && (
                          <div className="flex items-center gap-2">
                            <LuFolderKanban />
                            <span>
                              {typeof task.project === "string"
                                ? projects.find((p) => p._id === task.project)
                                    ?.title || "Unknown"
                                : task.project.title || "Unknown"}
                            </span>
                          </div>
                        )}
                        {task.dueDate && (
                          <div className="flex items-center gap-1.5">
                            <CiCalendar className="w-3.5 h-3.5" />
                            <span>
                              Due{" "}
                              {new Date(task.dueDate).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="flex items-center gap-2">
                        {task.assignedTo?.length > 0 ? (
                          <div className="flex -space-x-2">
                            {task.assignedTo.slice(0, 4).map((user, i) => (
                              <div
                                key={user._id}
                                className="group/avatar relative"
                              >
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-sm hover:scale-110 hover:z-10 transition-transform cursor-pointer ${getAvatarColor(
                                    i
                                  )}`}
                                  title={user.fullName}
                                >
                                  {user.fullName
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()}
                                </div>
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg opacity-0 group-hover/avatar:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                                  {user.fullName}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            Unassigned
                          </span>
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenFor(
                            menuOpenFor === task._id ? null : task._id
                          );
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors task-menu"
                      >
                        <FiMoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Dropdown Menu - Works perfectly on ALL devices */}
                  {menuOpenFor === task._id && (
                    <div className="absolute right-4 top-20 mt-2 w-40 bg-white border border-slate-200 rounded-lg shadow-lg z-50 task-menu">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/Dashboard/Tasks/${task._id}/edit`);
                          setMenuOpenFor(null);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <FiEdit3 className="w-4 h-4" /> Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(task._id);
                        }}
                        disabled={task.createdBy?._id !== currentUserId}
                        className={`w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 ${
                          task.createdBy?._id === currentUserId
                            ? ""
                            : "opacity-50 pointer-events-none cursor-not-allowed"
                        }`}
                      >
                        <FiTrash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-10 mb-6 gap-4">
              <p className="text-xs text-gray-500">
                Showing{" "}
                <span className="font-semibold">{indexOfFirstTask + 1}</span>–
                <span className="font-semibold">
                  {Math.min(indexOfLastTask, processedTasks.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold">{processedTasks.length}</span>{" "}
                tasks
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg text-xs font-medium transition-all duration-300 flex items-center gap-2 ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-[#f2521e] to-[#9f00ff] text-white hover:shadow-md hover:opacity-90"
                  }`}
                >
                  Prev
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 rounded-md text-xs font-semibold flex items-center justify-center transition-all duration-300 ${
                        currentPage === i + 1
                          ? "bg-gradient-to-r from-[#f2521e] to-[#9f00ff] text-white shadow-md"
                          : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg text-xs font-medium transition-all duration-300 flex items-center gap-2 ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-[#9f00ff] to-[#f2521e] text-white hover:shadow-md hover:opacity-90"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Task Modal */}
      {openForm && (
        <div
          onClick={() => {
            setOpenForm(false);
            setSelectedProjectOption(null);
          }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg shadow-lg w-[90%] max-w-lg p-6 max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-lg font-semibold mb-4">Create Task</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* All form fields - unchanged */}
              <div className="flex flex-col text-xs">
                <label className="text-xs font-semibold mb-1 block">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  placeholder="Enter a title for the task"
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, title: e.target.value }))
                  }
                  className="border h-10 border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div className="flex flex-col text-xs">
                <label className="text-xs mb-1 block font-semibold">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  placeholder="Enter a description for the task"
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, description: e.target.value }))
                  }
                  className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div className="text-xs flex flex-col">
                <label className="text-xs mb-1 block font-semibold">
                  Project
                </label>
                <Select
                  options={creatableProjects.map((p) => ({
                    value: p._id,
                    label: p.title,
                    startDate: p.startDate,
                    dueDate: p.dueDate,
                  }))}
                  value={selectedProjectOption}
                  onChange={(opt) => {
                    setSelectedProjectOption(opt);
                    setFormData((p) => ({
                      ...p,
                      project: opt?.value || "",
                      assignedTo: [],
                      dueDate: "",
                    }));
                  }}
                  placeholder="Select compositions project"
                  isDisabled={creatableProjects.length === 0}
                  className="text-black"
                />
              </div>

              {selectedProject && (
                <div className="mt-2 p-2 bg-purple-50 rounded text-xs text-purple-800 flex items-center gap-1">
                  <strong>Project dates:</strong>
                  {new Date(
                    selectedProject.startDate
                  ).toLocaleDateString()} –{" "}
                  {new Date(selectedProject.dueDate).toLocaleDateString()}
                </div>
              )}

              <div className="text-xs flex flex-col">
                <label className="text-xs font-semibold mb-1 block">
                  Assigned To
                </label>
                <Select
                  isMulti
                  isDisabled={!selectedProject}
                  options={
                    selectedProject?.teamMembers?.map((m) => ({
                      value: m._id,
                      label: m.fullName,
                    })) || []
                  }
                  onChange={(opts) =>
                    setFormData({
                      ...formData,
                      assignedTo: opts.map((o) => o.value),
                    })
                  }
                  placeholder={
                    selectedProject
                      ? "Select team members"
                      : "Select a project first"
                  }
                />
              </div>

              <div className="w-full flex flex-col sm:flex-row gap-4">
                <div className="text-xs flex flex-col w-full">
                  <label className="text-sm mb-1 block font-semibold">
                    Priority
                  </label>
                  <Select
                    options={[
                      { value: "High", label: "High" },
                      { value: "Medium", label: "Medium" },
                      { value: "Low", label: "Low" },
                    ]}
                    value={{
                      value: formData.priority,
                      label: formData.priority,
                    }}
                    onChange={(opt) =>
                      setFormData((p) => ({ ...p, priority: opt.value }))
                    }
                    className="text-black"
                  />
                </div>
                <div className="text-xs flex flex-col w-full">
                  <label className="text-sm mb-1 block font-semibold">
                    Status
                  </label>
                  <Select
                    options={[
                      { value: "todo", label: "To Do" },
                      { value: "pending", label: "In Progress" },
                      { value: "completed", label: "Completed" },
                    ]}
                    value={{
                      value: formData.status,
                      label:
                        formData.status === "todo"
                          ? "To Do"
                          : formData.status === "pending"
                          ? "In Progress"
                          : "Completed",
                    }}
                    onChange={(opt) =>
                      setFormData((p) => ({ ...p, status: opt.value }))
                    }
                    className="text-black"
                  />
                </div>
              </div>

              <div className="text-xs flex flex-col">
                <label className="text-xs mb-1 block font-semibold">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, dueDate: e.target.value }))
                  }
                  min={selectedProject?.startDate?.split("T")[0]}
                  max={selectedProject?.dueDate?.split("T")[0]}
                  disabled={!selectedProject}
                  className={`
                    border h-10 rounded-md p-2 outline-none w-full transition-all
                    ${
                      !selectedProject
                        ? "bg-gray-100 border-gray-300 cursor-not-allowed text-gray-400"
                        : "border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    }
                  `}
                />
                {selectedProject && (
                  <p className="text-[10px] text-gray-500 mt-1">
                    Must be between project start and end dates
                  </p>
                )}
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setOpenForm(false);
                    setFormData({
                      title: "",
                      description: "",
                      priority: "Medium",
                      dueDate: "",
                      project: "",
                      assignedTo: [],
                      status: "todo",
                    });
                    setSelectedProjectOption(null);
                  }}
                  className="flex-1 px-4 py-2.5 text-xs font-semibold text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !selectedProject}
                  className={`flex-1 text-xs px-6 py-2.5 text-white font-semibold rounded-md ${
                    loading || !selectedProject
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-[#f2521e] to-[#9f00ff] hover:opacity-90"
                  }`}
                >
                  {loading ? "Creating..." : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
