// app/api/team/[id]/route.js
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import DBconnect from "@/Utils/DBconnect";
import ProjectModel from "@/Models/Projects";
import TaskModel from "@/Models/Tasks";
import UserModel from "@/Models/User";
import TeamMember from "@/Models/Team";
import jwt from "jsonwebtoken";

export async function GET(request, { params }) {
  try {
    await DBconnect();

    const memberId = params?.id;
    if (!memberId || !mongoose.Types.ObjectId.isValid(memberId)) {
      return NextResponse.json({ error: "Valid Member ID required" }, { status: 400 });
    }

    const memberObjectId = new mongoose.Types.ObjectId(memberId);

    // Get the logged-in user's ID from the token
    const token = request.cookies.get("authToken")?.value;
    let currentUserId = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        currentUserId = decoded.id;
      } catch (err) {
        console.error("Token decode error:", err);
      }
    }

    // 1. Get User (name, email)
    const user = await UserModel.findById(memberObjectId)
      .select("fullName email")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // 2. Get ALL TeamMember records → collect ALL roles + earliest join date + projects added by current user
    const teamMembers = await TeamMember.find({ userId: memberObjectId })
      .select("role createdAt projectId addedBy")
      .lean();

    // Filter to only projects where the CURRENT USER added this member
    const teamMembersAddedByCurrentUser = teamMembers
      .filter(tm => tm.addedBy && currentUserId && tm.addedBy.toString() === currentUserId);

    const projectIdsAddedByCurrentUser = teamMembersAddedByCurrentUser
      .map(tm => tm.projectId);

    // Get roles ONLY from projects where current user added this member
    const roles = teamMembersAddedByCurrentUser
      .map(tm => tm.role)
      .filter(role => role && typeof role === "string")
      .filter((role, index, self) => self.indexOf(role) === index); // unique

    const dateJoined = teamMembers.length > 0
      ? teamMembers.reduce((earliest, tm) => 
          (!earliest || new Date(tm.createdAt) < new Date(earliest.createdAt)) ? tm : earliest
        ).createdAt
      : new Date();

    // 3. Get Tasks (only from projects where current user added this member)
    const tasks = await TaskModel.find({ 
      assignedTo: memberObjectId,
      project: { $in: projectIdsAddedByCurrentUser }
    })
      .populate("project", "title")
      .lean();

    // 4. Get Projects - ONLY ones where current user added this member
    const projects = await ProjectModel.find({
      _id: { $in: projectIdsAddedByCurrentUser }
    })
      .select("title _id")
      .lean();

    const projectsForFrontend = projects.map(p => ({
      ...p,
      _id: p._id.toString(),
    }));

    // 5. Stats – HYBRID SCORE (50% Completion + 30% On-Time + 20% Project Diversity)
    const completedTasks = tasks.filter(t => t.status === "Completed").length;
    const totalTasks = tasks.length;

    const onTimeCompleted = tasks
      .filter(t => t.status === "Completed")
      .filter(t => {
        const due = new Date(t.dueDate);
        const done = new Date(t.updatedAt || t.createdAt);
        return done <= due;
      }).length;

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) : 0;
    const onTimeRate = completedTasks > 0 ? (onTimeCompleted / completedTasks) : 0;
    const projectDiversity = Math.min(projectsForFrontend.length / 5, 1);

    const activityScore = Math.round(
      completionRate * 50 +
      onTimeRate * 30 +
      projectDiversity * 20
    );

    // 6. Recent tasks (most recently updated first, max 10)
    const recentTasks = tasks
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 10)
      .map(t => ({
        id: t._id.toString(),
        title: t.title,
        projectTitle: t.project?.title || "Uncategorized",
        projectId: t.project?._id?.toString() || null,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate,
        updatedAt: t.updatedAt,
      }));

    // 7. Build member object
    const memberData = {
      ...user,
      id: memberObjectId.toString(),
      name: user.fullName,
      email: user.email,
      initials: user.fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2),
      roles: roles.length > 0 ? roles : [],
      dateJoined: dateJoined,
      taskCount: totalTasks,
      projectCount: projectsForFrontend.length,
    };

    return NextResponse.json({
      member: memberData,
      projects: projectsForFrontend,
      stats: {
        totalTasks,
        completedTasks,
        projectsInvolved: projectsForFrontend.length,
        activityScore,
      },
      recentTasks,
    });

  } catch (error) {
    console.error("Team member fetch error:", error);
    return NextResponse.json(
      { error: "Server error", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE – unchanged
export async function DELETE(req, { params }) {
  try {
    await DBconnect();

    const token = req.cookies.get("authToken")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const requesterId = decoded.id;

    const memberId = params.id;
    const memberObjectId = new mongoose.Types.ObjectId(memberId);

    const memberRecords = await TeamMember.find({
      userId: memberObjectId,
      addedBy: requesterId,
    }).lean();

    if (memberRecords.length === 0) {
      return NextResponse.json({ message: "No membership to remove" }, { status: 200 });
    }

    const projectIds = memberRecords.map(r => r.projectId);

    await TeamMember.deleteMany({ _id: { $in: memberRecords.map(r => r._id) } });

    await ProjectModel.updateMany(
      { _id: { $in: projectIds } },
      { $pull: { teamMembers: memberObjectId } }
    );

    const unassignResult = await TaskModel.updateMany(
      { assignedTo: memberObjectId },
      { $pull: { assignedTo: memberObjectId } }
    );

    return NextResponse.json({
      success: true,
      message: "Member removed and unassigned from all tasks",
      unassignedTasks: unassignResult.modifiedCount,
    }, { status: 200 });

  } catch (error) {
    console.error("Remove member error:", error);
    return NextResponse.json({ error: "Server error", details: error.message }, { status: 500 });
  }
}