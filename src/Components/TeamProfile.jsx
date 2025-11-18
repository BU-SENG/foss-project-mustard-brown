// Components/TeamProfile.jsx
"use client";

import React, { useState, useEffect } from "react";
import { IoArrowBack } from "react-icons/io5";
import { FiCalendar } from "react-icons/fi";
import { HiOutlineMail } from "react-icons/hi";
import axios from "axios";
import Swal from "sweetalert2";
import Select from "react-select";
import { LuFolderOpen, LuClipboardList, LuTrendingUp } from "react-icons/lu";
import { FiCheckCircle } from "react-icons/fi";
import { useMediaQuery } from "react-responsive";

// RECHARTS IMPORTS
import {
  LineChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function TeamProfile({ member: initialMember, onBack }) {
  const isSmall = useMediaQuery({ maxWidth: 767 });
  const [member, setMember] = useState(null);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    projectsInvolved: 0,
    activityScore: 0,
  });
  const [memberProjects, setMemberProjects] = useState([]);
  const [dailyCompletions, setDailyCompletions] = useState([]);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [recentTasks, setRecentTasks] = useState([]);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    project: "",
    priority: "Medium",
    dueDate: "",
    status: "todo",
  });

  // Load member and stats
  useEffect(() => {
    if (!initialMember?.id) return;
    const load = async () => {
      try {
        const { data } = await axios.get(`/api/team/${initialMember.id}`);
        setMember(data.member);
        setStats(data.stats);
        setMemberProjects(Array.isArray(data.projects) ? data.projects : []);
        setRecentTasks(data.recentTasks || []);
        console.log("Recent tasks:", data.recentTasks);

        const dailyRes = await axios.get(
          `/api/team/${initialMember.id}/daily-completions`
        );
        setDailyCompletions(dailyRes.data.daily || []);
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Could not load member profile", "error");
      }
    };
    load();
  }, [initialMember?.id]);

  if (!member) return null;

  const formatDate = (dateInput) => {
    if (!dateInput) return "Not set";
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const memberSince = formatDate(member.dateJoined);

  // Prepare data for Recharts
  const chartData = (() => {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      days.push(d.toISOString().split("T")[0]);
    }
    return days.map((date) => {
      const found = dailyCompletions.find((c) => c._id === date);
      const day = new Date(date);
      return {
        date: isSmall
          ? day.toLocaleDateString("en-US", { weekday: "short" }) // Mon, Tue, etc.
          : day.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            }), // Mon Nov 12
        "Completed Tasks": found ? found.count : 0,
      };
    });
  })();

  const openAssignModal = () => setAssignModalOpen(true);

  const handleAssignTask = async (e) => {
    e.preventDefault();
    if (!taskForm.project) {
      Swal.fire("Oops", "Please select a project", "warning");
      return;
    }
    setAssignLoading(true);
    try {
      await axios.post("/api/task", {
        title: taskForm.title,
        description: taskForm.description || "",
        project: taskForm.project,
        status: taskForm.status,
        priority: taskForm.priority,
        dueDate: taskForm.dueDate,
        assignedTo: [member.id],
      });
      Swal.fire({
        title: "Task Assigned!",
        text: `${member.name} has a new task`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
      setAssignModalOpen(false);
      setTaskForm({
        title: "",
        description: "",
        project: "",
        priority: "Medium",
        dueDate: "",
        status: "todo",
      });
      window.location.reload();
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.error || "Failed to assign task",
        "error"
      );
    } finally {
      setAssignLoading(false);
    }
  };

  const handleRemoveMember = async () => {
    const result = await Swal.fire({
      title: "Remove Member?",
      text: `${member.name} will be removed from all projects`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f2521e",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, remove",
    });
    if (!result.isConfirmed) return;
    setRemoveLoading(true);
    try {
      await axios.delete(`/api/team/${member.id}`);
      Swal.fire({
        title: "Member Removed",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      onBack();
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to remove member",
        "error"
      );
    } finally {
      setRemoveLoading(false);
    }
  };

  const selectStyles = {
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  };

  return (
    <div className="">
      {/* Back Button */}
      <div
        onClick={onBack}
        className="w-fit px-3 py-2 mb-6 rounded-xl hover:cursor-pointer hover:bg-[#9f00ff]/10 flex items-center gap-2 text-xs font-semibold"
      >
        <IoArrowBack size={18} />
        Back to Team
      </div>

      {/* Profile Header */}
      <div className="w-full py-4 px-5 rounded-xl border-2 border-gray-200 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 w-full flex-wrap md:flex-nowrap">
          <div className="w-20 h-20 flex-shrink-0 rounded-full bg-gradient-to-r from-orange-500 to-purple-600 text-white text-3xl font-bold shadow-lg flex items-center justify-center">
            {member.initials}
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 truncate">
              {member.name}
            </h1>
            <div className="flex flex-wrap gap-2 text-xs">
              {member.roles.length > 0 ? (
                member.roles.map((role, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 text-purple-700 bg-purple-100 rounded-full whitespace-nowrap text-xs"
                  >
                    {role}
                  </span>
                ))
              ) : (
                <span className="px-3 py-1 text-gray-500 bg-gray-100 rounded-full text-xs">
                  No roles
                </span>
              )}
            </div>
            <div className="flex flex-col md:flex-row gap-3 md:items-center mt-1 text-gray-600 text-xs">
              <div className="flex gap-2 items-center truncate">
                <HiOutlineMail />
                <p className="truncate">{member.email}</p>
              </div>
              <div className="flex gap-2 items-center">
                <FiCalendar />
                <p>{memberSince}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-5 md:mt-0 w-fit md:w-50">
          <button
            onClick={openAssignModal}
            className="w-full px-6 py-2.5 text-xs font-semibold text-white bg-[#9f00ff] rounded-lg hover:shadow-lg"
          >
            Assign Task
          </button>
          <button
            onClick={handleRemoveMember}
            disabled={removeLoading}
            className={`w-full px-6 py-2.5 text-xs font-semibold rounded-lg transition border ${
              removeLoading
                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                : "border-red-500 text-red-600 hover:bg-red-100"
            }`}
          >
            {removeLoading ? "Removing..." : "Remove Member"}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Total Tasks */}
        <div className="border-l-4 border-[#4f46e5] p-4 bg-white rounded-xl flex items-center justify-between hover:shadow-xl shadow-lg">
          <div>
            <h2 className="text-sm font-semibold text-gray-500">Total Tasks</h2>
            <p className="text-2xl font-bold text-[#4f46e5] mt-1">
              {stats.totalTasks}
            </p>
          </div>
          <div className="w-11 h-11 bg-gradient-to-br from-[#4f46e5]/10 to-[#4f46e5]/5 rounded-full flex items-center justify-center text-[#4f46e5]">
            <LuClipboardList className="w-6 h-6" />
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="border-l-4 border-[#ec4899] p-4 bg-white rounded-xl flex items-center justify-between hover:shadow-xl shadow-lg">
          <div>
            <h2 className="text-sm font-semibold text-gray-500">
              Completed Tasks
            </h2>
            <p className="text-2xl font-bold text-[#ec4899] mt-1">
              {stats.completedTasks}
            </p>
          </div>
          <div className="w-11 h-11 bg-gradient-to-br from-[#ec4899]/10 to-[#ec4899]/5 rounded-full flex items-center justify-center text-[#ec4899]">
            <FiCheckCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Projects Involved */}
        <div className="border-l-4 border-[#10b981] p-4 bg-white rounded-xl flex items-center justify-between hover:shadow-xl shadow-lg">
          <div>
            <h2 className="text-sm font-semibold text-gray-500">
              Projects Involved
            </h2>
            <p className="text-2xl font-bold text-[#10b981] mt-1">
              {stats.projectsInvolved}
            </p>
          </div>
          <div className="w-11 h-11 bg-gradient-to-br from-[#10b981]/10 to-[#10b981]/5 rounded-full flex items-center justify-center text-[#10b981]">
            <LuFolderOpen className="w-6 h-6" />
          </div>
        </div>

        {/* Activity Score */}
        <div className="border-l-4 border-[#f59e0b] p-4 bg-white rounded-xl flex items-center justify-between hover:shadow-xl shadow-lg">
          <div>
            <h2 className="text-sm font-semibold text-gray-500">
              Activity Score
            </h2>
            <p className="text-2xl font-bold text-[#f59e0b] mt-1">
              {stats.activityScore}
            </p>
          </div>
          <div className="w-11 h-11 bg-gradient-to-br from-[#f59e0b]/10 to-[#f59e0b]/5 rounded-full flex items-center justify-center text-[#f59e0b]">
            <LuTrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Line Chart using Recharts */}
      <div className="bg-white rounded-xl shadow-md border border-gray-300 mb-6 mt-12 overflow-hidden w-full h-80 md:h-120 p-4 text-xs">
        <h1 className="mb-2 text-2xl font-bold flex gap-2 items-center">
          <LuTrendingUp />
          Task Completion Rate
        </h1>
        <p className="text-xs text-gray-400">Daily Performance Overview</p>
        <ResponsiveContainer width="100%" height="100%">
          {isSmall ? (
            <LineChart
              data={chartData}
              margin={{ top: 50, right: 30, left: -30, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="Completed Tasks"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 5, fill: "#10b981" }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          ) : (
            <LineChart
              data={chartData}
              margin={{ top: 50, right: 30, left: 0, bottom: 50 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="Completed Tasks"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 5, fill: "#10b981" }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="mt-12">
        <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
          <LuClipboardList className="text-purple-600" />
          Recent Tasks
        </h3>

        {recentTasks.length > 0 ? (
          <div className="flex flex-col gap-4">
            {/* Mobile View: stacked cards */}
            <div className="md:hidden flex flex-col gap-4">
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white p-4 rounded-xl flex flex-col gap-2 shadow-md border border-gray-200"
                >
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">
                    {task.title.toUpperCase()}
                  </h4>
                  <p className="text-xs text-gray-500 mb-1">
                    <span className="font-medium">Project:</span>{" "}
                    {task.projectTitle}
                  </p>
                  <p className="text-xs mb-1">
                    <span className="font-medium">Status: </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        task.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : task.status === "Pending" ||
                            task.status === "In Progress"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {task.status === "To Do" ? "To Do" : task.status}
                    </span>
                  </p>
                  <p className="text-xs mb-1">
                    <span className="font-medium">Priority: </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        task.priority === "High"
                          ? "bg-red-100 text-red-800"
                          : task.priority === "Medium"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {task.priority}
                    </span>
                  </p>
                  <p className="text-xs">
                    <span className="font-medium">Due: </span>
                    {formatDate(task.dueDate)}
                  </p>
                </div>
              ))}
            </div>

            {/* Desktop/Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Task
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {task.title.toUpperCase()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {task.projectTitle}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            task.status === "Completed"
                              ? "bg-green-100 text-green-800"
                              : task.status === "Pending" ||
                                task.status === "In Progress"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {task.status === "To Do" ? "To Do" : task.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            task.priority === "High"
                              ? "bg-red-100 text-red-800"
                              : task.priority === "Medium"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(task.dueDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            No tasks assigned yet.
          </p>
        )}
      </div>

      {/* Assign Task Modal */}
      {assignModalOpen && (
        <div
          onClick={() => setAssignModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/50 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-bold mb-4">
              Assign New Task to {member.name}
            </h2>
            <form onSubmit={handleAssignTask} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1">
                  Project
                </label>
                <Select
                  menuPortalTarget={document.body}
                  styles={selectStyles}
                  options={memberProjects.map((p) => ({
                    value: p._id,
                    label: p.title,
                  }))}
                  onChange={(opt) =>
                    setTaskForm((prev) => ({ ...prev, project: opt.value }))
                  }
                  placeholder={
                    memberProjects.length === 0
                      ? "No projects"
                      : "Select project..."
                  }
                  isDisabled={memberProjects.length === 0}
                  className="text-xs"
                  isSearchable
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) =>
                    setTaskForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full px-3 py-2 border rounded-sm border-gray-300 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="Enter task title..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  Description (optional)
                </label>
                <textarea
                  rows={3}
                  value={taskForm.description}
                  onChange={(e) =>
                    setTaskForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-sm border-gray-300 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="Task description..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Priority
                  </label>
                  <Select
                    menuPortalTarget={document.body}
                    styles={selectStyles}
                    options={[
                      { value: "High", label: "High" },
                      { value: "Medium", label: "Medium" },
                      { value: "Low", label: "Low" },
                    ]}
                    value={{
                      value: taskForm.priority,
                      label: taskForm.priority,
                    }}
                    onChange={(opt) =>
                      setTaskForm((prev) => ({ ...prev, priority: opt.value }))
                    }
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Status
                  </label>
                  <Select
                    menuPortalTarget={document.body}
                    styles={selectStyles}
                    options={[
                      { value: "todo", label: "To Do" },
                      { value: "pending", label: "In Progress" },
                      { value: "Completed", label: "Completed" },
                    ]}
                    value={{
                      value: taskForm.status,
                      label:
                        taskForm.status === "todo"
                          ? "To Do"
                          : taskForm.status === "pending"
                          ? "In Progress"
                          : "Completed",
                    }}
                    onChange={(opt) =>
                      setTaskForm((prev) => ({ ...prev, status: opt.value }))
                    }
                    className="text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  required
                  value={taskForm.dueDate}
                  onChange={(e) =>
                    setTaskForm((prev) => ({
                      ...prev,
                      dueDate: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-sm border-gray-300 text-xs"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="px-5 py-2 text-xs border rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignLoading || memberProjects.length === 0}
                  className="px-6 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#f2521e] to-[#9f00ff] rounded-lg hover:shadow-lg disabled:opacity-60"
                >
                  {assignLoading ? "Assigning..." : "Assign Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
