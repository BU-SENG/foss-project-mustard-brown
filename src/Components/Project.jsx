"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "./Loader";
import { LuPlus, LuListTodo, LuUsers, LuAlarmClock } from "react-icons/lu";
import { CiFolderOn } from "react-icons/ci";
import { FaRegCalendar } from "react-icons/fa";
import Swal from "sweetalert2";
import Projectform from "./Projectform";
import Link from "next/link";

export default function Project() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [filter, setFilter] = useState("all"); // all, active, onhold

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/project");
      if (res.data.success) {
        setProjects(res.data.projects || []);
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Failed to load projects",
        text: err.response?.data?.error || "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter((project) => {
    if (filter === "all") return true;
    if (filter === "active") return project.status === "Active";
    if (filter === "onhold") return project.status === "On Hold";
    return true;
  });

  const accentColors = [
    "border-t-4 border-pink-500",
    "border-t-4 border-purple-500",
    "border-t-4 border-blue-500",
    "border-t-4 border-orange-500",
    "border-t-4 border-green-500",
  ];

  const priorityColors = {
    High: "bg-red-100 text-red-600",
    Medium: "bg-yellow-100 text-yellow-700",
    Low: "bg-green-100 text-green-700",
  };

  const statusColors = {
    Active: "bg-blue-100 text-blue-700",
    Completed: "bg-green-100 text-green-700",
    Pending: "bg-yellow-100 text-yellow-700",
    "On Hold": "bg-gray-200 text-gray-700",
  };

  return (
    <div className="w-full h-full">
      {loading ? (
        <Loader />
      ) : (
        <div className="h-full">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-2">
            <p className="text-xs text-gray-400">Projects</p>
            <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-1 border-gray-300 pb-4">
              <div>
                <h1 className="text-2xl font-bold">All Projects</h1>
                <p className="text-sm text-gray-500 mt-1">
                  {filteredProjects.length} project
                  {filteredProjects.length !== 1 ? "s" : ""} found
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* Filter Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilter("all")}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
                      filter === "all"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter("active")}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
                      filter === "active"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setFilter("onhold")}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
                      filter === "onhold"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    On Hold
                  </button>
                </div>

                {/* New Project Button */}
                <button
                  className="group transition-all duration-300 flex items-center justify-center gap-2 px-6 py-3 text-xs font-semibold text-white bg-gradient-to-r from-[#f2521e] to-[#9f00ff] rounded-lg hover:shadow-lg"
                  onClick={() => setOpenForm(true)}
                >
                  <LuPlus className="text-sm transform transition-transform duration-300 group-hover:rotate-90" />
                  New Project
                </button>
              </div>
            </div>
          </div>

          {/* Projects Grid */}
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 py-5 px-0.5">
              {filteredProjects.map((project, index) => {
                const color = accentColors[index % accentColors.length];

                return (
                  <Link
                    key={project._id}
                    href={`/Dashboard/Projects/${project._id}`}
                    className={`relative bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${color} p-4 cursor-pointer`}
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
                          <span>
                            <FaRegCalendar />
                          </span>{" "}
                          START
                        </p>
                        <p className="font-semibold text-gray-800 mt-1">
                          {project.startDate
                            ? new Date(project.startDate).toLocaleDateString(
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
                      <div>
                        <p className="flex items-center justify-end gap-2 text-gray-500 text-xs">
                          <span>
                            <LuAlarmClock />
                          </span>{" "}
                          DUE
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
                          <span className="text-purple-500">〰</span> Progress
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
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="col-span-full h-[400px] flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-xl text-gray-400">
              <CiFolderOn className="text-6xl mb-4" />
              <p className="text-lg font-semibold">No projects found</p>
              <p className="text-sm mt-1">
                {filter === "all"
                  ? "Start by creating a new project"
                  : `No ${filter} projects available`}
              </p>
              <button
                onClick={() => setOpenForm(true)}
                className="mt-4 px-6 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#f2521e] to-[#9f00ff] rounded-lg hover:shadow-lg"
              >
                Create Project
              </button>
            </div>
          )}
        </div>
      )}

      {/* Project Form Modal */}
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
              onSuccess={() => {
                fetchProjects(); // Refresh projects list
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}