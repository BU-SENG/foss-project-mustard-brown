// route.js – Project API handlers | Edited by [Your Name], Nov 19, 2025

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import DBconnect from "@/Utils/DBconnect";
import ProjectModel from "@/Models/Projects";
import TaskModel from "@/Models/Tasks";
import UserModel from "@/Models/User";
import TeamMember from "@/Models/Team";

// GET - Fetch single project details
export async function GET(req, { params }) {
  // BEGIN EDIT: Comment explaining function
  // Returns all details for a single project, including tasks and members.
  try {
    await DBconnect();

    // Retrieve and verify authentication token
    const token = req.cookies.get("authToken")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Decode user information from JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const projectId = params.id;

    // Query project details and populate team information
    const project = await ProjectModel.findById(projectId)
      .populate("teamMembers", "fullName email _id")
      .populate("createdBy", "fullName email _id")
      .lean();

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Access check: user must be creator or team member
    const hasAccess =
      project.createdBy._id.toString() === userId ||
      project.teamMembers.some((m) => m._id.toString() === userId);

    if (!hasAccess) {
      return NextResponse.json(
        { error: "You don't have access to this project" },
        { status: 403 }
      );
    }

    // Retrieve project tasks
    const tasks = await TaskModel.find({ project: projectId })
      .populate("assignedTo", "fullName email _id")
      .populate("createdBy", "fullName email _id")
      .sort({ createdAt: -1 })
      .lean();

    // Calculate progress for display
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "Completed").length;
    const progress =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Update project progress in the database (non-blocking)
    await ProjectModel.findByIdAndUpdate(projectId, { progress });
    project.progress = progress;

    // Successful project summary response
    return NextResponse.json(
      {
        success: true,
        project,
        tasks,
        teamMembers: project.teamMembers,
      },
      { status: 200 }
    );
  } catch (error) {
    // Log and handle server error
    console.error("Fetch project error:", error);
    return NextResponse.json(
      { error: "Server error", details: error.message },
      { status: 500 }
    );
  }
}

// TODO: Add more granular access control in the future.

// PUT - Update project [Leave rest unchanged, only adjust/add comments or blanks as above]
// DELETE - Delete project [Same: minor comments, blank lines, etc as desired]

// PUT - Update project
export async function PUT(req, { params }) {
  try {
    await DBconnect();

    const token = req.cookies.get("authToken")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const projectId = params.id;
    const body = await req.json();

    // Check if user is the creator
    const project = await ProjectModel.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    if (project.createdBy.toString() !== userId) {
      return NextResponse.json(
        { error: "Only the project creator can edit this project" },
        { status: 403 }
      );
    }

    // Update project
    const updatedProject = await ProjectModel.findByIdAndUpdate(
      projectId,
      {
        title: body.title,
        description: body.description,
        status: body.status,
        priority: body.priority,
        startDate: body.startDate,
        dueDate: body.dueDate,
      },
      { new: true }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Project updated successfully",
        project: updatedProject,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update project error:", error);
    return NextResponse.json(
      { error: "Server error", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete project
export async function DELETE(req, { params }) {
  try {
    await DBconnect();

    const token = req.cookies.get("authToken")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const projectId = params.id;

    // Find project
    const project = await ProjectModel.findById(projectId);
    if (!project)
      return NextResponse.json({ error: "Project not found" }, { status: 404 });

    if (project.createdBy.toString() !== userId)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // 1. Delete all tasks
    await TaskModel.deleteMany({ project: projectId });

    // 2. Delete all team members linked to this project
    await TeamMember.deleteMany({ projectId });

    // 3. Delete the project itself
    await ProjectModel.findByIdAndDelete(projectId);

    return NextResponse.json(
      { message: "Project, tasks, and team members deleted" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Project delete error:", error);
    return NextResponse.json(
      { error: "Server error", details: error.message },
      { status: 500 }
    );
  }
}