import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import DBconnect from "@/Utils/DBconnect";
import ProjectModel from "@/Models/Projects";
import TaskModel from "@/Models/Tasks";

export async function POST(req) {
  try {
    await DBconnect();

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

    return NextResponse.json(
      {
        success: true,
        message: "Project created successfully",
        project: newProject,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Project creation error:", error);
    return NextResponse.json(
      { error: "Server error", details: error.message },
      { status: 500 }
    );
  }
}

// ✅ GET all projects (supports both simple list and full details)
export async function GET(req) {
  try {
    await DBconnect();

    const token = req.cookies.get("authToken")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Check if simple format is requested (for dropdowns, etc.)
    const { searchParams } = new URL(req.url);
    const simple = searchParams.get("simple") === "true";

    if (simple) {
      // Return simple format (title and _id only) - For backward compatibility
      const projects = await ProjectModel.find({ createdBy: userId }).select(
        "title _id"
      );
      return NextResponse.json(projects, { status: 200 });
    }

    // Get all projects with full details (created by user OR user is a team member)
    const projects = await ProjectModel.find({
      $or: [{ createdBy: userId }, { teamMembers: userId }],
    })
      .sort({ createdAt: -1 })
      .select(
        "title description status startDate dueDate progress priority teamMembers createdBy"
      )
      .populate("teamMembers", "fullName email _id")
      .lean();

    // Calculate progress, taskCount, and teamCount for each project
    for (let project of projects) {
      const total = await TaskModel.countDocuments({ project: project._id });
      const completed = await TaskModel.countDocuments({
        project: project._id,
        status: "Completed",
      });
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

      project.progress = progress;
      project.taskCount = total;

      // Update DB for consistency
      await ProjectModel.findByIdAndUpdate(project._id, { progress });

      // Calculate team count (exclude current user from team members)
      const filteredTeam =
        project.teamMembers?.filter(
          (m) => m._id.toString() !== userId.toString()
        ) || [];
      const includeCreator =
        project.createdBy?.toString() === userId.toString() ? 0 : 1;
      project.teamCount = filteredTeam.length + includeCreator;
    }

    return NextResponse.json(
      {
        success: true,
        projects,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects", details: error.message },
      { status: 500 }
    );
  }
}