// app/api/dashboard/route.js   

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import DBconnect from "@/Utils/DBconnect";
import ProjectModel from "@/Models/Projects";
import UserModel from "@/Models/User";
import TaskModel from "@/Models/Tasks";
import TeamMemberModel from "@/Models/Team";

export async function GET(req) {
  try {
    await DBconnect();

    const token = req.cookies.get("authToken")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const user = await UserModel.findById(userId).select("fullName email lastLogin");
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // === ALL PROJECTS ===
    const createdProjects = await ProjectModel.find({ createdBy: userId }).lean();
    const joinedProjects = await ProjectModel.find({ teamMembers: userId, createdBy: { $ne: userId } }).lean();
    const allProjects = [...createdProjects, ...joinedProjects];
    const projectIds = allProjects.map(p => p._id);

    // === STATS ===
    const totalProjects = allProjects.length;
    const totalTasks = await TaskModel.countDocuments({ project: { $in: projectIds } });

    const uniqueTeamMembers = new Set();
    allProjects.forEach(p => p.teamMembers?.forEach(m => {
      if (m.toString() !== userId.toString()) uniqueTeamMembers.add(m.toString());
    }));
    const totalTeamMembers = uniqueTeamMembers.size;

    // === RECENT PROJECTS ===
    const recentProjectsRaw = await ProjectModel.find({
      $or: [{ createdBy: userId }, { teamMembers: userId }],
    })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate("teamMembers", "fullName")
      .lean();

    const recentProjects = [];
    for (const proj of recentProjectsRaw) {
      const total = await TaskModel.countDocuments({ project: proj._id });
      const completed = await TaskModel.countDocuments({ project: proj._id, status: "Completed" });
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

      await ProjectModel.findByIdAndUpdate(proj._id, { progress });

      recentProjects.push({
        ...proj,
        progress,
        taskCount: total,
        teamCount: (proj.teamMembers?.filter(m => m._id.toString() !== userId.toString()).length || 0) +
                   (proj.createdBy.toString() !== userId.toString() ? 1 : 0),
      });
    }

    // === UPCOMING TASKS – THIS ONE WORKS 100% ===
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(today.getDate() + 7);
    sevenDaysLater.setHours(23, 59, 59, 999);

    const upcomingTasksRaw = await TaskModel.find({
      $and: [
        {
          $or: [
            { assignedTo: userId },                    // if someone saved as single ID (old bug)
            { assignedTo: { $in: [userId] } },          // correct array way
            // { createdBy: userId }             
          ]
        },
        { status: { $ne: "Completed" } },
        { dueDate: { $exists: true, $ne: null } },
        { dueDate: { $gte: today, $lte: sevenDaysLater } }
      ]
    })
      .populate("project", "title")
      .sort({ dueDate: 1 })
      .limit(15)
      .lean();

    const upcomingTasks = upcomingTasksRaw.map(task => {
      const due = new Date(task.dueDate);
      const diffTime = due - new Date();
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        _id: task._id,
        title: task.title,
        projectTitle: task.project?.title || "No Project",
        dueDate: task.dueDate,
        priority: task.priority || "Medium",
        daysLeft: daysLeft < 0 ? 0 : daysLeft,  // never show negative
        isCritical: daysLeft >= 0 && daysLeft <= 2,
      };
    });

    // === TEAM OVERVIEW ===
    const teamMembers = await TeamMemberModel.find({ addedBy: userId })
      .populate("userId", "fullName email")
      .populate("projectId", "title")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const teamOverview = teamMembers.map(m => ({
      name: m.userId?.fullName || "Unknown",
      email: m.userId?.email || "",
      role: m.role || "Member",
      projectName: m.projectId?.title || "No Project",
      initials: m.userId?.fullName?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2) || "NA",
    }));

    const avgCompletion = createdProjects.length > 0
      ? Math.round(createdProjects.reduce((s, p) => s + (p.progress || 0), 0) / createdProjects.length) + "%"
      : "0%";

    return NextResponse.json({
      success: true,
      user: { name: user.fullName, email: user.email, isFirstLogin: !user.lastLogin },
      stats: { totalProjects, totalTasks, totalTeamMembers, avgCompletion },
      teamOverview,
      recentProjects,
      upcomingTasks,
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

