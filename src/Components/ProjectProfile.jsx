// app/Dashboard/Projects/[id]/page.jsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import Swal from "sweetalert2";
import Loader from "@/Components/Loader";
import {
  IoArrowBack,
  IoCalendarOutline,
} from "react-icons/io5";
import {
  LuClipboardList,
  LuTrendingUp,
  LuTrash2,
  LuPlus,
  LuUsers,
  LuListTodo,
} from "react-icons/lu";
import { FiClock, FiEdit, FiCheckCircle } from "react-icons/fi";
import { FaRegCircle } from "react-icons/fa6";
import Select from "react-select";

export default function ProjectDetailPage({ currentUserId }) {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const projectId = params.id;

  // ---------- Resolve user id ----------
  const userIdFromQuery = searchParams.get("userId");
  const finalUserId = currentUserId || userIdFromQuery;

  // ---------- State ----------
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [openTaskForm, setOpenTaskForm] = useState(false);

  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    status: "",
    priority: "",
    startDate: "",
    dueDate: "",
  });

  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    priority: "Medium",
    dueDate: "",
    assignedTo: [],
    status: "todo",
  });

  // ---------- Load project ----------
  useEffect(() => {
    if (projectId) fetchProjectDetails();
  }, [projectId]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/project/${projectId}`);
      setProject(data.project);
      setTasks(data.tasks || []);
      setTeamMembers(data.teamMembers || []);

      setEditForm({
        title: data.project.title,
        description: data.project.description,
        status: data.project.status,
        priority: data.project.priority,
        startDate: data.project.startDate?.split("T")[0] ?? "",
        dueDate: data.project.dueDate?.split("T")[0] ?? "",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed to load project",
        text: err.response?.data?.error || "Something went wrong.",
      });
      router.push("/Dashboard/Projects");
    } finally {
      setLoading(false);
    }
  };

  // ---------- CRUD ----------
  const handleEditProject = async () => {
    try {
      await axios.put(`/api/project/${projectId}`, editForm);
      Swal.fire({ icon: "success", title: "Project Updated!", timer: 1500 });
      setIsEditing(false);
      fetchProjectDetails();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: err.response?.data?.error || "Something went wrong.",
      });
    }
  };

  const handleDeleteProject = async () => {
    const result = await Swal.fire({
      title: "Delete Project?",
      text: "All tasks will be removed permanently.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/api/project/${projectId}`);
        Swal.fire({ icon: "success", title: "Deleted!", timer: 1500 });
        router.push("/Dashboard/Projects");
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Delete Failed",
          text: err.response?.data?.error || "Something went wrong.",
        });
      }
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/task", { ...taskForm, project: projectId });
      Swal.fire({ icon: "success", title: "Task Created!", timer: 1500 });
      setOpenTaskForm(false);
      setTaskForm({
        title: "",
        description: "",
        priority: "Medium",
        dueDate: "",
        assignedTo: [],
        status: "todo",
      });
      fetchProjectDetails();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed to create task",
        text: err.response?.data?.error || "Something went wrong.",
      });
    }
  };

  // ---------- Guard ----------
  if (loading || !project || !finalUserId) return <Loader />;

  const isCreator = project.createdBy?._id === finalUserId;
  const canEditDelete = isCreator;
  const canView =
    isCreator || teamMembers.some((m) => m._id === finalUserId);

  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <h2 className="text-2xl font-bold text-red-600 mb-2">
          Access Denied
        </h2>
        <p className="text-gray-600 mb-4">
          You are not allowed to view this project.
        </p>
        <button
          onClick={() => router.push("/Dashboard/Projects")}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  // ---------- Stats ----------
  const completedTasks = tasks.filter((t) => t.status === "Completed").length;
  const pendingTasks = tasks.filter((t) => t.status === "Pending").length;
  const todoTasks = tasks.filter((t) => t.status === "To Do").length;

  const statusColors = {
    Active: "bg-emerald-500 text-white",
    "On Hold": "bg-amber-500 text-white",
    Completed: "bg-purple-600 text-white",
  };
  const priorityColors = {
    High: "bg-orange-500 text-white",
    Medium: "bg-purple-500 text-white",
    Low: "bg-sky-500 text-white",
  };
  const getStatusStyles = (s) => {
    if (s === "Completed") return "bg-emerald-100 text-emerald-800 border-emerald-300";
    if (s === "Pending") return "bg-amber-100 text-amber-800 border-amber-300";
    return "bg-gray-100 text-gray-800 border-gray-300";
  };
  const getPriorityStyles = (p) => {
    if (p === "High") return "bg-orange-100 text-orange-800 border-orange-300";
    if (p === "Medium") return "bg-purple-100 text-purple-800 border-purple-300";
    return "bg-sky-100 text-sky-800 border-sky-300";
  };

  // ---------- Render ----------
  return (
    <div className="min-h-screen">
      {/* ---------- Header ---------- */}
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => router.push("/Dashboard/Projects")}
          className="flex items-center gap-2 mb-6 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          <IoArrowBack className="w-5 h-5" />
          Back to Projects
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            {/* Title & Meta */}
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  className="w-full text-3xl mb-6 font-bold border-b-2 border-orange-400 focus:outline-none focus:border-purple-600 transition-colors"
                />
              ) : (
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {project.title}
                </h1>
              )}

              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[project.status]}`}
                >
                  {project.status}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${priorityColors[project.priority]}`}
                >
                  {project.priority}
                </span>
              </div>

              {!isEditing && (
                <p className="text-gray-600 max-w-3xl text-xs">{project.description}</p>
              )}
            </div>

            {/* Action Buttons (creator only) */}
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditProject}
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-purple-600 rounded-lg hover:from-orange-600 hover:to-purple-700 transition"
                  >
                    Save
                  </button>
                </>
              ) : (
                <>
                  {canEditDelete && (
                    <>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition"
                      >
                        <FiEdit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={handleDeleteProject}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition"
                      >
                        <LuTrash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* ---------- Edit Form (inline) ---------- */}
        {isEditing && canEditDelete && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
            <h3 className="text-lg font-semibold mb-5 text-gray-800">Edit Project Details</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left column */}
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={5}
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                    className="text-xs w-full rounded-sm border border-gray-300 p-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition resize-none"
                    placeholder="Describe the project..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Status
                  </label>
                  <Select
                    options={[
                      { value: "Active", label: "Active" },
                      { value: "On Hold", label: "On Hold" },
                      { value: "Completed", label: "Completed" },
                    ]}
                    value={{ value: editForm.status, label: editForm.status }}
                    onChange={(opt) =>
                      setEditForm({ ...editForm, status: opt.value })
                    }
                    className="text-xs"
                    classNamePrefix="react-select"
                  />
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Priority
                  </label>
                  <Select
                    options={[
                      { value: "High", label: "High" },
                      { value: "Medium", label: "Medium" },
                      { value: "Low", label: "Low" },
                    ]}
                    value={{ value: editForm.priority, label: editForm.priority }}
                    onChange={(opt) =>
                      setEditForm({ ...editForm, priority: opt.value })
                    }
                    className="text-xs"
                    classNamePrefix="react-select"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={editForm.startDate}
                    onChange={(e) =>
                      setEditForm({ ...editForm, startDate: e.target.value })
                    }
                    className="w-full text-xs rounded-sm border border-gray-300 p-2.5 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={editForm.dueDate}
                    onChange={(e) =>
                      setEditForm({ ...editForm, dueDate: e.target.value })
                    }
                    className="w-full rounded-sm text-xs border border-gray-300 p-2.5 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------- Stats Cards ---------- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* To‑Do */}
          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-orange-400 hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-2">
              <FaRegCircle className="w-6 h-6 text-orange-500" />
              <span className="text-2xl font-bold text-gray-900">{todoTasks}</span>
            </div>
            <p className="text-sm text-gray-600">To Do</p>
          </div>

          {/* In Progress */}
          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-purple-500 hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-2">
              <FiClock className="w-6 h-6 text-purple-600" />
              <span className="text-2xl font-bold text-purple-600">{pendingTasks}</span>
            </div>
            <p className="text-sm text-gray-600">In Progress</p>
          </div>

          {/* Completed */}
          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-emerald-500 hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-2">
              <FiCheckCircle className="w-6 h-6 text-emerald-600" />
              <span className="text-2xl font-bold text-emerald-600">{completedTasks}</span>
            </div>
            <p className="text-sm text-gray-600">Completed</p>
          </div>

          {/* Progress */}
          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-purple-500 hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-2">
              <LuTrendingUp className="w-6 h-6 text-purple-600" />
              <span className="text-2xl font-bold text-purple-600">{project.progress}%</span>
            </div>
            <p className="text-sm text-gray-600">Progress</p>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-orange-500 to-purple-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* ---------- Main Grid (Tasks + Sidebar) ---------- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tasks – 2 columns */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center text-white">
                    <LuListTodo className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Tasks</h2>
                    <p className="text-sm text-gray-500">{tasks.length} total</p>
                  </div>
                </div>
                <button
                  onClick={() => setOpenTaskForm(true)}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-orange-500 to-purple-600 rounded-lg hover:shadow-md transition"
                >
                  <LuPlus className="w-4 h-4" />
                  Add Task
                </button>
              </div>

              {tasks.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <LuClipboardList className="mx-auto w-16 h-16 mb-3 opacity-40" />
                  <p className="font-medium">No tasks yet</p>
                  <p className="text-sm">Create your first task to get started.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[560px] overflow-y-auto pr-2">
                  {tasks.map((task) => (
                    <div
                      key={task._id}
                      onClick={() =>
                        router.push(`/Dashboard/Tasks/${task._id}/edit`)
                      }
                      className="group p-4 border border-gray-200 rounded-xl hover:border-orange-300 hover:shadow-sm transition cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-xs text-gray-900 group-hover:text-orange-600 transition">
                            {task.title.toUpperCase()}
                          </h3>
                          {task.description && (
                            <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                            <span
                              className={`px-2.5 py-0.5 rounded-full font-medium border ${getStatusStyles(
                                task.status
                              )}`}
                            >
                              {task.status}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full font-medium border ${getPriorityStyles(
                                task.priority
                              )}`}
                            >
                              {task.priority}
                            </span>
                            {task.dueDate && (
                              <span className="flex items-center gap-1 text-gray-500">
                                <IoCalendarOutline className="w-3.5 h-3.5" />
                                {new Date(task.dueDate).toLocaleDateString(
                                  "en-US",
                                  { month: "short", day: "numeric" }
                                )}
                              </span>
                            )}
                          </div>
                        </div>

                        {task.assignedTo?.length > 0 && (
                          <div className="flex -space-x-2">
                            {task.assignedTo.slice(0, 3).map((u) => (
                              <div
                                key={u._id}
                                title={u.fullName}
                                className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold border-2 border-white"
                              >
                                {u.fullName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </div>
                            ))}
                            {task.assignedTo.length > 3 && (
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600 font-semibold border-2 border-white">
                                +{task.assignedTo.length - 3}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar – Timeline + Team */}
          <div className="space-y-6">
            {/* Timeline */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center text-white">
                  <IoCalendarOutline className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Timeline</h3>
                  <p className="text-xs text-gray-500">Project schedule</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                    <IoCalendarOutline className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Start</p>
                    <p className="font-medium text-xs">
                      {new Date(project.startDate).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <FiClock className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Due</p>
                    <p className="font-medium text-xs">
                      {new Date(project.dueDate).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Team */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center text-white">
                  <LuUsers className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Team</h3>
                  <p className="text-xs text-gray-500">
                    {teamMembers.length} member{teamMembers.length !== 1 && "s"}
                  </p>
                </div>
              </div>

              {teamMembers.length === 0 ? (
                <p className="text-center text-gray-400 py-4 text-sm">
                  No team members yet
                </p>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                  {teamMembers.map((m) => {
                    const initials = m.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2);
                    const isOwner = m._id === project.createdBy?._id;
                    return (
                      <div
                        key={m._id}
                        className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-orange-300 transition"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {m.fullName}
                            {isOwner && (
                              <span className="ml-1 text-xs font-semibold text-orange-600">
                                (Owner)
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{m.email}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Create Task Modal ---------- */}
      {openTaskForm && (
        <div
          onClick={() => setOpenTaskForm(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold mb-5 bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">
              Create New Task
            </h2>
            <form onSubmit={handleCreateTask} className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, title: e.target.value })
                  }
                  className="w-full rounded-sm border text-xs border-gray-300 p-2.5 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
                  placeholder="Enter task title..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={taskForm.description}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, description: e.target.value })
                  }
                  className="w-full rounded-sm text-xs border border-gray-300 p-2.5 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition resize-none"
                  placeholder="Optional description..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Assign To
                </label>
                <Select
                  isMulti
                  options={teamMembers.map((m) => ({
                    value: m._id,
                    label: m.fullName,
                  }))}
                  onChange={(opts) =>
                    setTaskForm({
                      ...taskForm,
                      assignedTo: opts.map((o) => o.value),
                    })
                  }
                  placeholder="Select members..."
                  className="text-xs"
                  classNamePrefix="react-select"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Priority
                  </label>
                  <Select
                    options={[
                      { value: "High", label: "High" },
                      { value: "Medium", label: "Medium" },
                      { value: "Low", label: "Low" },
                    ]}
                    value={{ value: taskForm.priority, label: taskForm.priority }}
                    onChange={(opt) =>
                      setTaskForm({ ...taskForm, priority: opt.value })
                    }
                    classNamePrefix="react-select"
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Due Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    min={project.startDate?.split("T")[0]}
                    max={project.dueDate?.split("T")[0]}
                    value={taskForm.dueDate}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, dueDate: e.target.value })
                    }
                    className="w-full rounded-sm h-9.5 text-xs border border-gray-300 p-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setOpenTaskForm(false)}
                  className="flex-1 px-4 py-2.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 text-xs font-medium text-white bg-gradient-to-r from-orange-500 to-purple-600 rounded-lg hover:from-orange-600 hover:to-purple-700 transition"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}