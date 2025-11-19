// projects/route.js – API route handlers for creating and fetching projects
// Edited by [Your Name] – Nov 19, 2025

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import DBconnect from "@/Utils/DBconnect";
import ProjectModel from "@/Models/Projects";
import TaskModel from "@/Models/Tasks";

// POST - Create a New Project
export async function POST(req) {
  try {
    await DBconnect();

    // Extract and verify token from cookies
    const token = req.cookies.get("authToken")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const body = await req.json();
    const { title, description, status, priority, startDate, dueDate } = body;

    if (!title || !description || !startDate || !dueDate) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Create the new project in the database
    const newProject = await ProjectModel.create({
      title,
      description,
      status,
      priority,
      startDate,
      dueDate,
      createdBy: userId,
      teamMembers: [userId],
    });

    // Successful project creation response
    return NextResponse.json(
      {
        success: true,
        message: "Project created successfully",
        project: newProject,
      },
      { status: 201 }
    );
  } catch (error) {
    // Log and return internal error
    console.error("Project creation error:", error);
    return NextResponse.json(
      { error: "Server error", details: error.message },
      { status: 500 }
    );
  }
}

// GET - Retrieve all projects for user (simple and detailed formats)
export async function GET(req) {
  try {
    await DBconnect();

    // Extract token from cookies for authentication
    const token = req.cookies.get("authToken")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Check for "simple" query parameter for dropdowns, etc.
    const { searchParams } = new URL(req.url);
    const simple = searchParams.get("simple") === "true";

    if (simple) {
      // Simple response: only title and _id
      const projects = await ProjectModel.find({ createdBy: userId }).select(
        "title _id"
      );
      return NextResponse.json(projects, { status: 200 });
    }

    // Detailed view: all projects where user is creator or team member
    const projects = await ProjectModel.find({
      $or: [{ createdBy: userId }, { teamMembers: userId }],
    })
      .sort({ createdAt: -1 })
      .select(
        "title description status startDate dueDate progress priority teamMembers createdBy"
      )
      .populate("teamMembers", "fullName email _id")
      .lean();

    // Calculate task and team statistics for each project
    for (let project of projects) {
      const total = await TaskModel.countDocuments({ project: project._id });
      const completed = await TaskModel.countDocuments({
        project: project._id,
        status: "Completed",
      });
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

      project.progress = progress;
      project.taskCount = total;

      // Update DB for progress consistency
      await ProjectModel.findByIdAndUpdate(project._id, { progress });

      // Exclude current user from team count
      const filteredTeam =
        project.teamMembers?.filter(
          (m) => m._id.toString() !== userId.toString()
        ) || [];
      const includeCreator =
        project.createdBy?.toString() === userId.toString() ? 0 : 1;
      project.teamCount = filteredTeam.length + includeCreator;
    }

    // Return fetched projects with calculated stats
    return NextResponse.json(
      {
        success: true,
        projects,
      },
      { status: 200 }
    );
  } catch (error) {
    // Log and handle fetch errors
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects", details: error.message },
      { status: 500 }
    );
  }
}
