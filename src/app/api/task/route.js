import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import DBconnect from "@/Utils/DBconnect";
import TaskModel from "@/Models/Tasks";
import ProjectModel from "@/Models/Projects";
import UserModel from "@/Models/User";
import { updateProjectProgress } from "@/Utils/updateProjectProgress";

// Helper: Normalize status values
function normalizeStatus(status) {
  if (!status) return "To Do";

  const normalized = status.trim().toLowerCase();
  const map = {
    todo: "To Do",
    "to do": "To Do",
    "in progress": "Pending",
    pending: "Pending",
    done: "Completed",
    completed: "Completed",
  };

  return map[normalized] || "To Do";
}

// GET: Fetch Projects and Task Stats
export async function GET(req) {
  try {
    await DBconnect();

    const token = req.cookies.get("authToken")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Fetch projects where user is creator OR team member
    // **POPULATE startDate & dueDate**
    const projects = await ProjectModel.find({
      $or: [{ createdBy: userId }, { teamMembers: userId }],
    })
      .populate("teamMembers", "fullName email _id")
      .populate("createdBy", "fullName email _id")
      .select("title teamMembers createdBy startDate dueDate") // <-- ADD THESE
      .lean();

    const projectIds = projects.map((p) => p._id);

    // Fetch all tasks in these projects
    const tasks = await TaskModel.find({ project: { $in: projectIds } })
      .populate("assignedTo", "fullName email _id")
      .populate("project", "title")
      .populate("createdBy", "fullName email _id")
      .sort({ createdAt: -1 })
      .lean();

    // Stats
    const todo = tasks.filter((t) => t.status === "To Do").length;
    const pending = tasks.filter((t) => t.status === "Pending").length;
    const completed = tasks.filter((t) => t.status === "Completed").length;
    const total = tasks.length;

    return NextResponse.json(
      {
        success: true,
        projects,
        tasks,
        stats: { todo, pending, completed, total },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Task Fetch Error:", error);
    return NextResponse.json(
      { error: "Server Error", details: error.message },
      { status: 500 }
    );
  }
}

// POST: Create a new task
export async function POST(req) {
  let userId = null;
  try {
    await DBconnect();
    const token = req.cookies.get("authToken")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.id;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const body = await req.json();
  const { title, description, project, status, priority, dueDate, assignedTo } =
    body;

  // ---- validation ----
  if (
    !title?.trim() ||
    !description?.trim() ||
    !project ||
    !priority ||
    !dueDate ||
    !Array.isArray(assignedTo) ||
    assignedTo.length === 0
  ) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }

  // ---- project must belong to creator ----
  const projectDoc = await ProjectModel.findOne({
    _id: project,
    createdBy: userId,
  })
    .select("teamMembers startDate dueDate")
    .populate("teamMembers", "_id") // <-- only need ID
    .lean();

  if (!projectDoc) {
    return NextResponse.json(
      { error: "You are not the creator of this project" },
      { status: 403 }
    );
  }

  // ---- assigned users must be in the project team ----
  const teamIds = projectDoc.teamMembers.map((m) => m._id.toString());
  const invalid = assignedTo.filter((id) => !teamIds.includes(id));
  if (invalid.length) {
    return NextResponse.json(
      { error: "Can only assign to project team members" },
      { status: 400 }
    );
  }

  // ---- due-date inside project range (start-of-day) ----
  const toStart = (d) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  };
  const due = toStart(dueDate);
  const start = toStart(projectDoc.startDate);
  const end = toStart(projectDoc.dueDate);
  if (due < start || due > end) {
    return NextResponse.json(
      {
        error: `Due date must be between ${start.toLocaleDateString()} and ${end.toLocaleDateString()}`,
      },
      { status: 400 }
    );
  }

  const normalizedStatus = normalizeStatus(status);

  // ---- create task ----
  const newTask = await TaskModel.create({
    title: title.trim(),
    description: description.trim(),
    project,
    priority,
    dueDate: due,
    assignedTo,
    createdBy: userId,
    status: normalizedStatus,
  });

  // add reference to project
  await ProjectModel.updateOne(
    { _id: project },
    { $push: { tasks: newTask._id } }
  );
  await updateProjectProgress(project);

  // return populated task
  const populated = await TaskModel.findById(newTask._id)
    .populate("project", "title")
    .populate("assignedTo", "fullName email _id")
    .populate("createdBy", "fullName email _id")
    .lean();

  return NextResponse.json({ success: true, task: populated }, { status: 201 });
}
