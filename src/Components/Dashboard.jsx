"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "./Loader";
import { LuPlus } from "react-icons/lu";
import { CiFolderOn } from "react-icons/ci";
import {
  LuFolderKanban,
  LuListTodo,
  LuUsers,
  LuAlarmClock,
} from "react-icons/lu";
import { MdAutoGraph } from "react-icons/md";
import Projectform from "./Projectform";
import Link from "next/link";
import { FaRegCalendar } from "react-icons/fa";
import Swal from "sweetalert2";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [upcomingTasks, setUpcomingTasks] = useState([]); // ← NEW STATE

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get("/api/dashboard");
        if (res.data.success) {
          setStats({
            ...res.data.stats,
            teamOverview: res.data.teamOverview || [],
            recentProjects: res.data.recentProjects || [],
          });
          setUser(res.data.user);
          setUpcomingTasks(res.data.upcomingTasks || []); // ← POPULATE TASKS
        }
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Failed to load dashboard",
          text: err.response?.data?.error || "Something went wrong.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // Helper to refresh after creating project
  const refreshDashboard = async () => {
    try {
      const res = await axios.get("/api/dashboard");
      if (res.data.success) {
        setStats({
          ...res.data.stats,
          teamOverview: res.data.teamOverview || [],
          recentProjects: res.data.recentProjects || [],
        });
        setUpcomingTasks(res.data.upcomingTasks || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full h-full ">
      {loading ? (
        <Loader />
      ) : (
        <div className="h-full">
          {/* === HEADER === */}
          <div className="mb-6 flex flex-col gap-2">
            <p className="text-xs text-gray-400">Dashboard</p>
            <div className="w-full flex items-center justify-between border-b-1 border-gray-300 pb-4">
              <h1 className="text-2xl font-bold w-1/2">
                {user?.isFirstLogin ? (
                  <>
                    Welcome,{" "}
                    <span className="text-purple-600">{user?.name}</span>
                  </>
                ) : (
                  <>
                    Welcome back,{" "}
                    <span className="text-purple-600">{user?.name}</span>
                  </>
                )}
              </h1>
              <button
                className="group transition-all duration-300 flex items-center justify-center gap-2 px-6 py-3 text-xs font-semibold text-white bg-gradient-to-r from-[#f2521e] to-[#9f00ff] rounded-lg hover:shadow-lg"
                onClick={() => setOpenForm(true)}
              >
                <LuPlus className="text-sm transform transition-transform duration-300 group-hover:rotate-90" />
                New Project
              </button>
            </div>
          </div>

          {/* === STATS CARDS === */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Projects */}
            <div className="border-l-3 border-[#b31cff] p-4 bg-white hover:shadow rounded-xl border flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-500">
                  Total Projects
                </h2>
                <p className="text-2xl font-bold text-[#b31cff] mt-2">
                  {stats?.totalProjects}
                </p>
              </div>
              <div className="w-10 h-10 text-xl bg-[#f6e5ff] rounded-full flex items-center justify-center text-[#b31cff]">
                <LuFolderKanban />
              </div>
            </div>

            {/* Total Tasks */}
            <div className="border-l-3 border-[#f1591e] p-4 bg-white hover:shadow rounded-xl border flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-500">
                  Total Tasks
                </h2>
                <p className="text-2xl font-bold text-[#f1591e] mt-2">
                  {stats?.totalTasks}
                </p>
              </div>
              <div className="w-10 h-10 text-xl bg-[#fdeee8] rounded-full flex items-center justify-center text-[#f1591e]">
                <LuListTodo />
              </div>
            </div>

            {/* Team Members */}
            <div className="border-l-3 border-[#5dc081] p-4 bg-white hover:shadow rounded-xl border flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-500">
                  Team Members
                </h2>
                <p className="text-2xl font-bold text-[#5dc081] mt-2">
                  {stats?.totalTeamMembers}
                </p>
              </div>
              <div className="w-10 h-10 text-xl bg-[#e8f9ef] rounded-full flex items-center justify-center text-[#5dc081]">
                <LuUsers />
              </div>
            </div>

            {/* Avg Completion */}
            <div className="border-l-3 border-[#2563eb] p-4 bg-white hover:shadow rounded-xl border flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-500">
                  Avg Completion
                </h2>
                <p className="text-2xl font-bold text-[#2563eb] mt-2">
                  {stats?.avgCompletion}
                </p>
              </div>
              <div className="w-10 h-10 text-xl bg-[#ebf2fe] rounded-full flex items-center justify-center text-[#2563eb]">
                <MdAutoGraph />
              </div>
            </div>
          </div>

          {/* === TEAM OVERVIEW + UPCOMING DEADLINES (2-column on md) === */}
          <div className="w-full mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Team Overview (spans 2 columns) */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <h1 className="font-semibold text-xl">Team Overview</h1>
                <Link className="text-xs text-blue-600" href="/Dashboard/Team">
                  View All
                </Link>
              </div>
              <div className="rounded-xl min-h-[300px] border border-gray-200/60 bg-white overflow-hidden shadow-sm">
                <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent px-3 py-2">
                  {stats?.teamOverview.length > 0 ? (
                    <div className="space-y-1.5">
                      {stats.teamOverview.map((member, index) => (
                        <div
                          key={index}
                          className="group relative flex items-center gap-3 p-2.5 rounded-lg bg-gradient-to-r from-gray-50/50 to-transparent hover:from-purple-50/70 hover:to-pink-50/30 border border-transparent hover:border-purple-100 transition-all duration-300 cursor-pointer overflow-hidden"
                        >
                          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#9f00ff] to-[#f2521e] transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top"></div>
                          <div className="relative flex-shrink-0">
                            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gradient-to-br from-[#9f00ff] via-purple-600 to-[#f2521e] text-white font-semibold text-sm shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
                              {member.initials}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="text-sm font-semibold text-gray-800 group-hover:text-gray-900 truncate transition-colors">
                                {member.name}
                              </p>
                              <span className="line-clamp-1 px-2 py-0.5 rounded-full bg-purple-100/80 text-purple-700 text-[10px] font-medium tracking-wide uppercase">
                                {member.role}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-500 truncate flex items-center gap-1">
                              <svg
                                className="w-3 h-3 opacity-50"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                              </svg>
                              {member.email}
                            </p>
                          </div>
                          {member.projectName && (
                            <div className="flex-shrink-0">
                              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-gray-200 group-hover:border-purple-200 group-hover:bg-purple-50/50 shadow-sm transition-all duration-300">
                                <svg
                                  className="w-3 h-3 text-gray-400 group-hover:text-purple-500 transition-colors"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                                  />
                                </svg>
                                <p className="text-[10px] text-gray-600 group-hover:text-purple-700 font-medium truncate max-w-[90px] transition-colors">
                                  {member.projectName}
                                </p>
                              </div>
                            </div>
                          )}
                          <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                            <svg
                              className="w-4 h-4 text-purple-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                        <LuUsers className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-400 text-sm font-medium">
                        No team members yet
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        Invite your team to get started
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h1 className="font-semibold text-xl line-clamp-1">Upcoming Deadlines</h1>
                <span className="text-xs text-gray-500 line-clamp-1">
                  {upcomingTasks.length} upcoming
                </span>
              </div>

              <div className="rounded-xl min-h-[300px] border border-gray-200/60 bg-white overflow-hidden shadow-sm">
                <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 p-4">
                  {upcomingTasks.length > 0 ? (
                    <div className="space-y-3">
                      {upcomingTasks.map((task) => (
                        <div
                          key={task._id}
                          className={`relative p-4 rounded-lg border transition-all hover:shadow-md ${
                            task.isCritical
                              ? "border-red-300 bg-red-50/70"
                              : "border-gray-200 bg-gray-50"
                          }`}
                        >
                          {/* Critical badge */}
                          {task.isCritical && (
                            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[11px] px-2 py-0.5 rounded-full font-bold animate-pulse">
                              Urgent
                            </div>
                          )}

                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold text-xs text-gray-900">
                                {task.title.toUpperCase()}
                              </h3>
                              <p className="text-xs text-gray-500 mt-1">
                                {task.projectTitle}
                              </p>
                            </div>
                            <span
                              className={`ml-3 px-2.5 py-1 rounded-full text-xs lg:text-xs font-semibold ${
                                task.priority === "High"
                                  ? "bg-red-100 text-red-700"
                                  : task.priority === "Medium"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {task.priority}
                            </span>
                          </div>

                          <div className="mt-3 flex items-center justify-between text-xs">
                            <span
                              className={`font-bold ${
                                task.isCritical
                                  ? "text-red-600"
                                  : "text-gray-700"
                              }`}
                            >
                              {task.daysLeft === 0
                                ? "Due today"
                                : task.daysLeft === 1
                                ? "Tomorrow"
                                : `${task.daysLeft} days left`}
                            </span>
                            <span className="text-gray-500 flex text-xs items-center gap-1">
                              <FaRegCalendar className="text-xs" />
                              {new Date(task.dueDate).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                      <LuAlarmClock className="text-6xl mb-4 opacity-20" />
                      <p className="font-medium text-lg">All caught up!</p>
                      <p className="text-sm">No pending deadlines</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* === RECENT PROJECTS === */}
          <div className="w-full mt-12">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h1 className="font-semibold text-xl">Recent Projects</h1>
                <Link className="text-xs text-blue-600" href="/Dashboard/Projects">
                  View All
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 py-5 px-0.5">
                {stats?.recentProjects?.length > 0 ? (
                  stats.recentProjects.map((project, index) => {
                    const accentColors = [
                      "border-t-4 border-pink-500",
                      "border-t-4 border-purple-500",
                      "border-t-4 border-blue-500",
                      "border-t-4 border-orange-500",
                      "border-t-4 border-green-500",
                    ];
                    const color = accentColors[index % accentColors.length];

                    const priorityColors = {
                      High: "bg-red-100 text-red-600",
                      Medium: "bg-yellow-100 text-yellow-700",
                      Low: "bg-green-100 text-green-700",
                    };
                    const statusColors = {
                      Active: "bg-blue-100 text-blue-700",
                      Completed: "bg-green-100 text-green-700",
                      "On Hold": "bg-gray-200 text-gray-700",
                    };

                    return (
                      <div
                        key={index}
                        className={`relative bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${color} p-4`}
                      >
                        <div className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-purple-100 rounded-xl">
                          <CiFolderOn className="text-purple-600 text-lg" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                          {project.title || "Untitled Project"}
                        </h2>
                        <p
                          className="text-xs text-gray-500 mb-4 pr-10 line-clamp-2"
                          title={project.description}
                        >
                          {project.description || "No description available."}
                        </p>
                        <div className="flex items-center gap-3 mb-5">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              statusColors[project.status] ||
                              "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {project.status || "Unknown"}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              priorityColors[project.priority] ||
                              "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {project.priority || "Normal"}
                          </span>
                        </div>
                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 grid grid-cols-2 gap-4 text-xs mb-5">
                          <div>
                            <p className="flex items-center gap-2 text-gray-500 text-xs">
                              <FaRegCalendar /> START
                            </p>
                            <p className="font-semibold text-gray-800 mt-1">
                              {project.startDate
                                ? new Date(
                                    project.startDate
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "2-digit",
                                  })
                                : "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="flex items-center justify-end gap-2 text-gray-500 text-xs">
                              <LuAlarmClock /> DUE
                            </p>
                            <p className="font-semibold flex items-center justify-end text-gray-800 mt-1">
                              {project.dueDate
                                ? new Date(project.dueDate).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      year: "2-digit",
                                    }
                                  )
                                : "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="border-t border-gray-200 pt-4 mt-2 flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              Progress
                            </p>
                            <p className="font-semibold text-xs text-gray-800 mt-1">
                              {project.progress != null
                                ? `${project.progress}% Complete`
                                : "0% Complete"}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-purple-50 text-purple-700 px-3 py-1 rounded-lg">
                              <LuListTodo className="text-xs" />
                              <span className="font-semibold text-xs">
                                {project.taskCount ?? 0}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 bg-pink-50 text-pink-700 px-3 py-1 rounded-lg">
                              <LuUsers className="text-xs" />
                              <span className="font-semibold text-xs">
                                {project.teamCount ?? 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full h-[280px] flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-xl text-gray-400">
                    <CiFolderOn className="text-4xl mb-2" />
                    <p className="text-sm">No recent projects yet</p>
                    <p className="text-xs">Start by creating a new project</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === CREATE PROJECT MODAL === */}
      {openForm && (
        <div
          onClick={() => setOpenForm(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg shadow-lg w-[90%] max-w-lg p-6"
          >
            <Projectform
              closeForm={() => setOpenForm(false)}
              onSuccess={refreshDashboard} // ← Now refreshes upcoming tasks too
            />
          </div>
        </div>
      )}
    </div>
  );
}
