"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "./Loader";
import Swal from "sweetalert2";
import {
  LuSave,
  LuPencilLine,
  LuUser,
  LuMessageSquare,
  LuPencil,
} from "react-icons/lu";
import { LuActivity } from "react-icons/lu";
import { FiMoreVertical } from "react-icons/fi";
import { FaRegTrashCan } from "react-icons/fa6";
import Select from "react-select";
import { useRouter } from "next/navigation";

const Avatar = ({ name }) => {
  const initials = (name || "")
    .split(" ")
    .map((n) => n[0] || "")
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#f2521e] to-[#9f00ff] flex items-center justify-center text-white text-xs font-semibold shadow-md">
      {initials}
    </div>
  );
};

// +++ HELPER COMPONENT FOR ACTIVITY TIMELINE +++
// Helper function to find user name from team list
const getUserNameFromTeam = (team, userId) => {
  if (!team || !userId) return "a member";
  const member = team.find((m) => String(m.userId._id) === String(userId));
  return member?.userId?.fullName || "a member";
};

// --- ActivityItem Component ---
const ActivityItem = ({ activity, team }) => {
  const userName = <b>{activity.userId?.fullName || "Someone"}</b>;
  let message = "";

  switch (activity.action) {
    case "TASK_CREATE":
      message = "created the task";
      break;
    case "STATUS_CHANGE":
      message = (
        <>
          changed status from <b>{activity.details?.from}</b> to{" "}
          <b>{activity.details?.to}</b>
        </>
      );
      break;
    case "FIELD_UPDATE":
      message = (
        <>
          updated the <b>{activity.details?.field}</b>
        </>
      );
      break;
    case "MEMBER_ASSIGN":
      message = (
        <>
          assigned{" "}
          <b>{getUserNameFromTeam(team, activity.details?.assignedUserId)}</b>
        </>
      );
      break;
    case "MEMBER_UNASSIGN":
      message = (
        <>
          unassigned{" "}
          <b>{getUserNameFromTeam(team, activity.details?.unassignedUserId)}</b>
        </>
      );
      break;
    case "COMMENT_ADD":
      message = "added a comment";
      break;
    case "COMMENT_EDIT":
      message = "edited a comment";
      break;
    case "COMMENT_DELETE":
      message = "deleted a comment";
      break;
    default:
      message = "made an update";
  }

  return (
    <div className="flex gap-3">
      <div>
        <Avatar name={activity.userId?.fullName || "User"} />
      </div>
      <div className="flex-1 pt-1">
        <p className="text-xs text-gray-700 leading-relaxed">
          {userName} {message}
        </p>
        <p className="text-[10px] text-gray-400 mt-0.5">
          {new Date(activity.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default function TaskEdit({ taskID, currentUserId }) {
  const router = useRouter();

  const [taskEdit, setTaskEdit] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [projects, setProjects] = useState([]);
  const [team, setTeam] = useState([]);
  const [comments, setComments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingComment, setIsSendingComment] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [isTeamMember, setIsTeamMember] = useState(false);
const [projectDateRange, setProjectDateRange] = useState({ start: "", end: "" });


  const canEdit = isCreator || isTeamMember;

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(`/api/task/${taskID}`);
      const {
        task,
        projects: allUserProjects,
        team: apiTeam,
        comments,
        activities: apiActivities,
      } = data;

      if (task.project && typeof task.project === "object") {
        task.project = task.project._id;
      }

      if (Array.isArray(task.assignedTo)) {
        task.assignedTo = task.assignedTo.map((a) =>
          typeof a === "object" ? a._id : a
        );
      } else {
        task.assignedTo = [];
      }

      setTaskEdit(task);
      setTeam(apiTeam || []);
      setComments(comments || []);
      setActivities(apiActivities || []);
      setProjects(
        Array.isArray(allUserProjects)
          ? allUserProjects.filter(
              (p) => String(p.createdBy) === String(currentUserId)
            )
          : []
      );

      setIsCreator(
        String(task.createdBy._id || task.createdBy) === String(currentUserId)
      );
      setIsTeamMember(
        Array.isArray(task.assignedTo) &&
          task.assignedTo.some((id) => String(id) === String(currentUserId))
      );
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to load task data. Please refresh.",
        icon: "error",
        confirmButtonColor: "#f2521e",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (taskID && currentUserId) {
      fetchData();
    }
  }, [taskID, currentUserId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader />
      </div>
    );
  }
  if (!taskEdit) {
    return (
      <div className="text-center text-gray-500 mt-10">No task data found.</div>
    );
  }

  const handleChange = (e) => {
    if (!isCreator) return;
    const { name, value } = e.target;
    setTaskEdit((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = async (selected) => {
    if (!selected || !canEdit) return;
    const newStatus = selected.value;
    setTaskEdit((prev) => ({ ...prev, status: newStatus }));

    if (isTeamMember && !isCreator) {
      try {
        await axios.put(`/api/task/${taskID}`, { status: newStatus });
        await fetchData();
        Swal.fire({
          title: "Status updated!",
          text: `Task is now "${newStatus}"`,
          icon: "success",
          timer: 1200,
          showConfirmButton: false,
        });
      } catch (err) {
        console.error("Auto-save failed:", err);
        Swal.fire({
          title: "Error",
          text: "Failed to update status.",
          icon: "error",
        });
      }
    }
  };

  const handleProjectChange = (selected) => {
    if (!isCreator) return;
    setTaskEdit((prev) => ({
      ...prev,
      project: selected ? selected.value : null,
    }));
  };

  const handleAssignedChange = (selectedOptions) => {
    if (!isCreator) return;
    const assignedTo = selectedOptions
      ? selectedOptions.map((opt) => opt.value)
      : [];
    setTaskEdit((prev) => ({ ...prev, assignedTo }));
  };

  const handleSave = async () => {
    if (!canEdit) return;
    try {
      const payload = {
        ...taskEdit,
        assignedTo: Array.isArray(taskEdit.assignedTo)
          ? taskEdit.assignedTo
          : [],
      };
      await axios.put(`/api/task/${taskID}`, payload);
      Swal.fire({
        title: "Saved!",
        text: "Task updated successfully.",
        icon: "success",
        confirmButtonColor: "#9f00ff",
      });
      await fetchData();
    } catch (error) {
      console.error("Error updating task:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to save changes.",
        icon: "error",
        confirmButtonColor: "#f2521e",
      });
    }
  };

  const handleDelete = async () => {
    if (!isCreator) return;
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the task.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f2521e",
      cancelButtonColor: "#9f00ff",
      confirmButtonText: "Yes, delete it!",
    });
    if (!confirm.isConfirmed) return;
    try {
      await axios.delete(`/api/task/${taskID}`);
      await Swal.fire({
        title: "Deleted!",
        text: "Task has been deleted.",
        icon: "success",
        timer: 1200,
        showConfirmButton: false,
      });
      router.push("/Dashboard/Tasks");
    } catch (error) {
      console.error("Error deleting task:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to delete task.",
        icon: "error",
        confirmButtonColor: "#f2521e",
      });
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || isSendingComment) return;

    setIsSendingComment(true);
    try {
      await axios.put(`/api/task/${taskID}`, {
        comment: newComment.trim(),
      });
      setNewComment("");
      await fetchData();
    } catch (err) {
      console.error("Add comment error:", err);
      Swal.fire({
        title: "Error",
        text: "Failed to add comment.",
        icon: "error",
        confirmButtonColor: "#f2521e",
      });
    } finally {
      setIsSendingComment(false);
    }
  };

  const handleEditComment = (comment) => {
    setEditingCommentId(comment._id);
    setEditingText(comment.text);
  };

  const handleSaveEdit = async (commentId) => {
    if (!editingText.trim()) return;

    try {
      await axios.put(`/api/task/${taskID}`, {
        commentId,
        comment: editingText.trim(),
      });
      setEditingCommentId(null);
      setEditingText("");
      await fetchData();
    } catch (err) {
      console.error("Edit comment error:", err);
      Swal.fire({
        title: "Error",
        text: "Failed to update comment.",
        icon: "error",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingText("");
  };

  const handleDeleteComment = async (commentId) => {
    const result = await Swal.fire({
      title: "Delete comment?",
      text: "This cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f2521e",
      cancelButtonColor: "#9f00ff",
      confirmButtonText: "Yes, delete",
    });
    if (!result.isConfirmed) return;

    try {
      await axios.delete(`/api/task/${taskID}?commentId=${commentId}`);
      await fetchData();
    } catch (err) {
      console.error("Delete comment error:", err);
      Swal.fire({
        title: "Error",
        text: "Failed to delete comment.",
        icon: "error",
      });
    }
  };

  const statusOptions = [
    { value: "To Do", label: "To Do" },
    { value: "Pending", label: "Pending" },
    { value: "Completed", label: "Completed" },
  ];
  const priorityOptions = [
    { value: "High", label: "High" },
    { value: "Medium", label: "Medium" },
    { value: "Low", label: "Low" },
  ];

  const projectOptions = projects.map((p) => ({
    value: p._id,
    label: p.title,
  }));

  const assignedOptions = team.map((member) => ({
    value: String(member.userId._id),
    label: member.userId.fullName || "Unknown",
  }));

  const selectedAssigned = assignedOptions.filter((opt) =>
    taskEdit.assignedTo?.map(String).includes(opt.value)
  );

  const selectedProjectOption = projectOptions.find(
    (opt) => String(opt.value) === String(taskEdit.project)
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-2">
        <p className="text-xs text-gray-400">Task</p>
        <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-300 pb-4">
          <h1 className="text-2xl font-bold w-1/2">Edit Task</h1>
          <div className="flex gap-3 md:items-center md:justify-center mt-3 md:mt-0">
            <button
              onClick={handleDelete}
              disabled={!isCreator}
              className="w-2/3 md:w-fit group transition-all duration-300 flex items-center justify-center gap-2 px-4 py-3 text-xs font-semibold text-white bg-gradient-to-r from-[#9f00ff] to-[#f2521e] rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaRegTrashCan className="text-sm transform transition-transform duration-300 group-hover:rotate-90" />
              Delete
            </button>
            <button
              onClick={handleSave}
              disabled={!canEdit}
              className="w-full md:w-fit group transition-all duration-300 flex items-center justify-center gap-2 px-4 py-3 text-xs font-semibold text-white bg-gradient-to-r from-[#f2521e] to-[#9f00ff] rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LuSave className="text-sm transform transition-transform duration-300 group-hover:rotate-90" />
              Save Changes
            </button>
          </div>
        </div>
      </div>


      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[80vh]">
  
        <div className="flex flex-col gap-4">
          <form
            className="w-full bg-white shadow-2xl rounded-xl p-4 flex flex-col gap-4 h-full"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="flex flex-col">
              <h1 className="text-xl font-bold flex gap-2 items-center">
                <LuPencilLine />
                Task Information
              </h1>
              <p className="text-xs text-gray-400">
                Edit the main details of this task
              </p>
            </div>

            {/* Title */}
            <div className="flex flex-col text-xs">
              <label className="text-xs font-semibold mb-1 block">Title</label>
              <input
                name="title"
                type="text"
                required
                value={taskEdit.title || ""}
                onChange={handleChange}
                disabled={!isCreator}
                placeholder="Enter a title for the task"
                className="border h-10 border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-purple-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* Description */}
            <div className="flex flex-col text-xs">
              <label className="text-xs font-semibold mb-1 block">
                Description
              </label>
              <textarea
                name="description"
                value={taskEdit.description || ""}
                onChange={handleChange}
                disabled={!isCreator}
                placeholder="Enter task description"
                className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-purple-500 outline-none h-24 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div className="flex gap-4 w-full">
              <div className="flex flex-col text-xs w-full">
                <label className="text-xs font-semibold mb-1 block">
                  Status
                </label>
                <Select
                  options={statusOptions}
                  value={statusOptions.find(
                    (opt) => opt.value === taskEdit.status
                  )}
                  onChange={handleStatusChange}
                  isDisabled={!canEdit}
                  className="text-xs"
                  placeholder="Select status"
                />
                {isTeamMember && !isCreator && (
                  <p className="text-xs text-green-600 mt-1 italic">
                    Status changes are saved automatically
                  </p>
                )}
              </div>

              <div className="flex flex-col text-xs w-full">
                <label className="text-xs font-semibold mb-1 block">
                  Priority
                </label>
                <Select
                  options={priorityOptions}
                  value={priorityOptions.find(
                    (opt) => opt.value === taskEdit.priority
                  )}
                  onChange={(selected) =>
                    isCreator &&
                    setTaskEdit((p) => ({ ...p, priority: selected.value }))
                  }
                  isDisabled={!isCreator}
                  className="text-xs"
                  placeholder="Select priority"
                />
              </div>
            </div>

            <div className="flex flex-col text-xs">
              <label className="text-xs font-semibold mb-1 block">
                Project
              </label>
              <Select
                options={projectOptions}
                value={selectedProjectOption}
                onChange={handleProjectChange}
                isDisabled={!isCreator}
                className="text-xs"
                placeholder={
                  projectOptions.length === 0 ? "No projects" : "Select project"
                }
                isClearable
              />
            </div>

            <div className="flex flex-col text-xs">
              <label className="text-xs font-semibold mb-1 block">
                Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                value={
                  taskEdit.dueDate
                    ? new Date(taskEdit.dueDate).toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  isCreator &&
                  setTaskEdit((p) => ({ ...p, dueDate: e.target.value }))
                }
                disabled={!isCreator}
                className="border h-10 border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-purple-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div className="mt-6 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-purple-100">
                    {/* Purple Icon Background */}
                    <LuUser className="text-purple-600 h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-gray-800">
                      Team Assignment
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Manage task members
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-purple-50 border border-purple-200">
                  <span className="text-xs text-purple-700">
                    {/* Purple text for member count */}
                    {selectedAssigned.length} Members
                  </span>
                </div>
              </div>

              {/* Add Members Selector */}
              {isCreator && (
                <div className="relative">
                  <Select
                    isMulti
                    options={assignedOptions}
                    value={selectedAssigned}
                    onChange={handleAssignedChange}
                    placeholder="Search and add members..."
                    className="text-sm"
                    classNamePrefix="react-select-monopurple"
                    isDisabled={!isCreator}
                    styles={{
                      control: (base) => ({
                        ...base,
                        borderColor: "#e5e7eb", // gray-200
                        borderWidth: "1px",
                        borderRadius: "0.45rem",
                        padding: "0.25rem",
                        minHeight: "40px",
                        fontSize: "0.775rem",
                        boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.05)",
                        transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
                        background: "#ffffff",
                        "&:hover": {
                          borderColor: "#d8b4fe", // purple-300
                        },
                        "&:focus-within": {
                          borderColor: "#a855f7", // purple-500
                          boxShadow: "0 0 0 2px rgba(168, 85, 247, 0.2)",
                        },
                      }),
                      multiValue: (base) => ({
                        ...base,
                        // Solid purple-100 for multi-value
                        background: "#f3e8ff",
                        borderRadius: "0.5rem",
                        padding: "0 0.5rem",
                      }),
                      multiValueLabel: (base) => ({
                        ...base,
                        color: "#6d28d9", // purple-700
                        fontWeight: "600",
                        fontSize: "0.813rem",
                      }),
                      multiValueRemove: (base) => ({
                        ...base,
                        color: "#a855f7", // purple-500
                        borderRadius: "0.375rem",
                        transition: "all 150ms ease",
                        "&:hover": {
                          backgroundColor: "#d8b4fe", // purple-300
                          color: "#ffffff",
                        },
                      }),
                    }}
                  />
                </div>
              )}

              {/* Assigned Members Grid */}
              <div className="bg-white rounded-lg border border-purple-100 shadow-sm overflow-hidden">
                {selectedAssigned.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 px-4 bg-purple-50/50">
                    <div className="relative mb-4">
                      <div className="relative rounded-lg bg-white p-4 shadow-inner border border-purple-200">
                        <LuUser className="h-6 w-6 text-purple-500" />
                      </div>
                    </div>
                    <p className="text-base font-semibold text-gray-700 mb-1">
                      No members assigned
                    </p>
                    {isCreator && (
                      <p className="text-sm text-gray-500 text-center max-w-xs">
                        Add team members using the search bar above.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-purple-50">
                    {selectedAssigned.map((option) => {
                      const member = team.find(
                        (m) => String(m.userId._id) === String(option.value)
                      );
                      if (!member) return null;
                      const user = member.userId;

                      return (
                        <div
                          key={option.value}
                          className="group relative flex items-center justify-between p-3.5 hover:bg-purple-50 transition-all duration-300"
                        >
                          {/* Accent line on hover - solid purple */}
                          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-purple-500 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 rounded-r" />

                          <div className="flex items-center gap-3 flex-1 min-w-0 pl-1">
                            <div className="relative flex-shrink-0">
                              <Avatar name={user.fullName} size="small" />
                              {/* Removed Active Indicator */}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-gray-800 truncate mb-0.5">
                                {user.fullName}
                              </p>
                              <span className="inline-flex items-center text-xs font-medium capitalize px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                                {member.role.toLowerCase()}
                              </span>
                            </div>
                          </div>

                          {isCreator && (
                            <button
                              onClick={async () => {
                                const result = await Swal.fire({
                                  title: "Remove member?",
                                  text: `Remove ${user.fullName} from this task?`,
                                  icon: "question",
                                  showCancelButton: true,
                                  confirmButtonColor: "#dc2626", // red-600 (kept red for removal action)
                                  cancelButtonColor: "#9333ea", // purple-600
                                  confirmButtonText: "Yes, remove",
                                  reverseButtons: true,
                                });

                                if (!result.isConfirmed) return;

                                const newAssigned = taskEdit.assignedTo.filter(
                                  (id) => String(id) !== String(user._id)
                                );

                                setTaskEdit((prev) => ({
                                  ...prev,
                                  assignedTo: newAssigned,
                                }));

                                try {
                                  await axios.put(`/api/task/${taskID}`, {
                                    ...taskEdit,
                                    assignedTo: newAssigned,
                                  });
                                  await fetchData();
                                  Swal.fire({
                                    title: "Removed!",
                                    text: `${user.fullName} is no longer assigned.`,
                                    icon: "success",
                                    timer: 1500,
                                    showConfirmButton: false,
                                  });
                                } catch (err) {
                                  console.error("Error removing member:", err);
                                  Swal.fire({
                                    title: "Error",
                                    text: "Failed to remove member.",
                                    icon: "error",
                                  });
                                }
                              }}
                              className="group-hover:opacity-100 transition-all duration-300 text-xs px-3 py-1.5 bg-purple-500 text-white rounded-lg hover:shadow-lg hover:shadow-red-500/30 hover:-translate-y-0.5 font-medium"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Available Members - Premium Design */}
              {isCreator && team.length > selectedAssigned.length && (
                <div className="relative overflow-hidden rounded-xl bg-purple-50/70 border border-purple-200 shadow-inner p-4">
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1 rounded-md bg-purple-600 shadow-md">
                        <LuUser className="h-3 w-3 text-white" />
                      </div>
                      <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Available Team Members
                      </h3>
                      <div className="flex-1 h-px bg-purple-200" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {team
                        .filter(
                          (m) =>
                            !taskEdit.assignedTo
                              .map(String)
                              .includes(String(m.userId._id))
                        )
                        .map((member) => (
                          <div
                            key={member.userId._id}
                            className="group relative flex items-center gap-2 bg-white p-3 rounded-lg border border-gray-200 hover:border-purple-400 hover:shadow-md transition-all duration-300 cursor-pointer hover:-translate-y-0.5"
                          >
                            {/* Subtle purple hover background */}
                            <div className="absolute inset-0 bg-purple-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            <div className="relative flex items-center gap-2 w-full">
                              <div className="flex-shrink-0">
                                <Avatar
                                  name={member.userId.fullName}
                                  size="small"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm text-gray-800 truncate">
                                  {member.userId.fullName}
                                </p>
                                <p className="text-xs text-gray-500 capitalize">
                                  {member.role.toLowerCase()}
                                </p>
                              </div>
                              {/* Subtle hover indicator dot - purple */}
                              <div className="flex-shrink-0 w-2 h-2 rounded-full bg-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* RIGHT: COMMENTS & ACTIVITY CONTAINER */}
        <div className="flex flex-col gap-4">
          {/* 🎯 RIGHT COLUMN WRAPPER: Takes full height of the grid cell and enables vertical flexing */}
          <div className="flex flex-col flex-1 gap-4">
            {/* 🎯 COMMENTS CONTAINER: flex-[0.6] for 60% height */}
            <div className="bg-white shadow-2xl rounded-xl p-4 flex flex-col flex-[0.6]">
              <div className="mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <LuMessageSquare className="text-xl" />
                  Comments
                </h3>
                <p className="text-xs text-gray-400">
                  Discuss this task with your team
                </p>
              </div>

              {/* Comments List: flex-1 ensures it takes all remaining space before the input, and overflow-y-auto enables scrolling */}
              <div className="flex-1 overflow-y-auto max-h-100 space-y-3 mb-4 pr-1">
                {comments.length === 0 ? (
                  <div className="flex flex-col h-full items-center justify-center py-10 text-center">
                    {/* ---------- Illustration ---------- */}
                    <div className="relative mb-4">
                      {/* A simple "speech bubble" made with Tailwind */}
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center animate-pulse">
                        <svg
                          className="w-10 h-10 text-purple-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                      </div>

                      {/* Tiny floating dots for extra flair */}
                      <div className="absolute -top-1 -left-1 w-3 h-3 bg-purple-300 rounded-full animate-ping" />
                      <div className="absolute -bottom-2 -right-2 w-2 h-2 bg-purple-400 rounded-full animate-ping delay-300" />
                    </div>

                    {/* ---------- Text ---------- */}
                    <p className="text-xs text-gray-400 mb-1">
                      No comments yet
                    </p>
                    <p className="text-xs text-gray-500">
                      Be the first to share your thoughts!
                    </p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div
                      key={comment._id}
                      className="group flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-all"
                    >
                      <Avatar name={comment.userId?.fullName || "User"} />

                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <p className="text-xs font-semibold text-gray-900">
                              {comment.userId?.fullName || "Unknown User"}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {new Date(comment.createdAt).toLocaleString()}
                            </p>
                          </div>

                          {/* Mobile-friendly edit/delete menu */}
                          {String(comment.userId?._id) === currentUserId && (
                            <div className="relative">
                              <button
                                onClick={() =>
                                  setOpenMenuId(
                                    openMenuId === comment._id
                                      ? null
                                      : comment._id
                                  )
                                }
                                className="p-1 rounded-md hover:bg-gray-200 transition"
                              >
                                <FiMoreVertical className="w-4 h-4 text-gray-600" />
                              </button>

                              {openMenuId === comment._id && (
                                <div className="absolute right-0 bg-white shadow-md rounded-md py-1 text-xs w-24 z-50 border border-gray-200">
                                  <button
                                    onClick={() => {
                                      handleEditComment(comment);
                                      setOpenMenuId(null);
                                    }}
                                    className="w-full text-left px-3 py-1 hover:bg-gray-50 text-purple-600 flex items-center gap-2"
                                  >
                                    <LuPencil /> Edit
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleDeleteComment(comment._id);
                                      setOpenMenuId(null);
                                    }}
                                    className="w-full text-left px-3 py-1 hover:bg-gray-50 text-red-600 flex items-center gap-2"
                                  >
                                    <FaRegTrashCan /> Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {editingCommentId === comment._id ? (
                          <div className="mt-2">
                            <textarea
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSaveEdit(comment._id);
                                }
                                if (e.key === "Escape") handleCancelEdit();
                              }}
                              className="w-full text-xs border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                              rows={3}
                              autoFocus
                            />
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => handleSaveEdit(comment._id)}
                                className="text-xs px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700"
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="text-xs px-3 py-1.5 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-700 leading-relaxed break-words whitespace-pre-wrap mt-1">
                            {comment.text}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* COMMENT INPUT */}
              {(isCreator || isTeamMember) && (
                <div className="flex gap-2 mt-auto">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        newComment.trim() &&
                        !isSendingComment
                      ) {
                        handleAddComment();
                      }
                    }}
                    disabled={isSendingComment}
                    placeholder="Add a comment..."
                    className="h-10 flex-1 text-xs border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || isSendingComment}
                    className="relative h-10 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#f2521e] to-[#9f00ff] rounded-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {isSendingComment ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      "Send"
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* 🎯 ACTIVITY TIMELINE CONTAINER: flex-[0.4] for 40% height */}
            <div className="w-full rounded-xl bg-white shadow-2xl p-4 flex flex-col flex-[0.4]">
              <div className="mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <LuActivity className="text-xl" />
                  Activity Timeline
                </h3>
                <p className="text-xs text-gray-400">
                  Recent updates and changes
                </p>
              </div>

              {/* Activity List: flex-1 ensures it takes all remaining space after the header, and overflow-y-auto enables scrolling */}
              <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                {activities.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-10 text-gray-400">
                    <LuActivity className="mx-auto text-4xl mb-3 opacity-40" />
                    <p className="text-sm font-medium">No activity yet</p>
                    <p className="text-xs mt-1">
                      Changes to the task will appear here.
                    </p>
                  </div>
                ) : (
                  activities.map((activity) => (
                    <ActivityItem
                      key={activity._id}
                      activity={activity}
                      team={team}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
