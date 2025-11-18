"use client";
import React, { useState } from "react";
import Select from "react-select";
import { IoIosClose } from "react-icons/io";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

export default function Projectform({ closeForm, onSuccess }) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    dueDate: "",
  });

  const [priority, setPriority] = useState(null);
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Priority & Status Options
  const priorityOptions = [
    { value: "Low", label: "Low" },
    { value: "Medium", label: "Medium" },
    { value: "High", label: "High" },
  ];

  const statusOptions = [
    { value: "Active", label: "Active" },
    { value: "On Hold", label: "On Hold" },
    { value: "Completed", label: "Completed" },
  ];

  // Handle text input changes
  const handleChanges = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handlePriorityChange = (selectedOption) => {
    setPriority(selectedOption);
    setErrors((prev) => ({ ...prev, priority: "" }));
  };

  const handleStatusChange = (selectedOption) => {
    setStatus(selectedOption);
    setErrors((prev) => ({ ...prev, status: "" }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const newErrors = {};

    // Validation
    if (!formData.title.trim()) newErrors.title = "Project title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!priority) newErrors.priority = "Please select a priority";
    if (!status) newErrors.status = "Please select a status";
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.dueDate) newErrors.dueDate = "End date is required";
    if (formData.startDate && formData.dueDate && formData.startDate > formData.dueDate) {
      newErrors.dueDate = "End date cannot be earlier than start date";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const projectData = {
        ...formData,
        priority: priority?.value || "",
        status: status?.value || "",
      };

      const res = await axios.post("/api/project", projectData, {
        withCredentials: true,
      });

      if (res.status === 200 || res.status === 201) {
        // Success Toast
        Swal.fire({
          icon: "success",
          title: "Project Created!",
          text: "Your project has been successfully added.",
          timer: 2000,
          showConfirmButton: false,
        });

        // Reset form
        setFormData({
          title: "",
          description: "",
          startDate: "",
          dueDate: "",
        });
        setPriority(null);
        setStatus(null);
        setErrors({});

        // Close modal
        closeForm();

        // Call parent success handler
        if (onSuccess) {
          onSuccess();
        }

        // Navigate to Tasks + Refresh
        router.push("/Dashboard/Tasks");
        router.refresh(); // This forces Tasks page to re-fetch projects
      }
    } catch (err) {
      console.error("Project creation error:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Failed to create project.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col w-full gap-2">
        {/* Header */}
        <div className="flex items-center justify-between w-full">
          <h1 className="font-bold text-base md:text-xl">Create New Project</h1>
          <button
            type="button"
            onClick={closeForm}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <IoIosClose className="text-2xl" />
          </button>
        </div>

        <p className="text-xs text-gray-400">
          Add a new project to organize your tasks and collaborate with your team.
        </p>

        {/* Project Name */}
        <div>
          <label className="text-xs font-semibold block mb-1">Project Name</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChanges}
            className="w-full h-10 rounded-lg border border-gray-300 px-4 text-xs outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            placeholder="e.g. Website Redesign"
          />
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-semibold block mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChanges}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-xs outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            placeholder="Describe project goals and objectives..."
            rows="4"
          />
          <p className="text-xs text-gray-400 mt-1">
            Provide a clear description of what this project aims to achieve.
          </p>
          {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
        </div>

        {/* Priority & Status */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-xs font-semibold block mb-1">Priority</label>
            <Select
              options={priorityOptions}
              value={priority}
              onChange={handlePriorityChange}
              placeholder="Select Priority"
              className="text-xs"
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: "40px",
                  borderRadius: "0.5rem",
                  borderColor: "#d1d5db",
                }),
                placeholder: (base) => ({
                  ...base,
                  color: "#9ca3af",
                }),
              }}
            />
            {errors.priority && <p className="text-xs text-red-500 mt-1">{errors.priority}</p>}
          </div>

          <div className="flex-1">
            <label className="text-xs font-semibold block mb-1">Status</label>
            <Select
              options={statusOptions}
              value={status}
              onChange={handleStatusChange}
              placeholder="Select Status"
              className="text-xs"
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: "40px",
                  borderRadius: "0.5rem",
                  borderColor: "#d1d5db",
                }),
                placeholder: (base) => ({
                  ...base,
                  color: "#9ca3af",
                }),
              }}
            />
            {errors.status && <p className="text-xs text-red-500 mt-1">{errors.status}</p>}
          </div>
        </div>

        {/* Start & End Date */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-xs font-semibold block mb-1">Start Date</label>
            <input
              type="date"
              min={new Date().toISOString().split("T")[0]}
              name="startDate"
              value={formData.startDate}
              onChange={handleChanges}
              className="w-full h-10 rounded-lg border border-gray-300 px-4 text-xs outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            />
            {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>}
          </div>

          <div className="flex-1">
            <label className="text-xs font-semibold block mb-1">End Date</label>
            <input
              type="date"
              min={formData.startDate || new Date().toISOString().split("T")[0]}
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChanges}
              className="w-full h-10 rounded-lg border border-gray-300 px-4 text-xs outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            />
            {errors.dueDate && <p className="text-xs text-red-500 mt-1">{errors.dueDate}</p>}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end mt-4">
          <button
            type="submit"
            disabled={isLoading}
            className={`px-6 py-3 rounded-lg text-xs font-semibold text-white transition-all duration-300 flex items-center gap-2
              ${isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-[#f2521e] to-[#9f00ff] hover:shadow-lg hover:scale-105"
              }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
                Creating...
              </>
            ) : (
              "Create Project"
            )}
          </button>
        </div>
      </div>
    </form>
  );
}