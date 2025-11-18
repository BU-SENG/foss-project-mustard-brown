import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import DBconnect from "@/Utils/DBconnect";
import TeamMember from "@/Models/Team";
import User from "@/Models/User";
import ProjectModel from "@/Models/Projects";

// ADD TEAM MEMBER
export async function POST(req) {
  try {
    await DBconnect();

    const token = req.cookies.get("authToken")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const addedBy = decoded.id;

    const { userId, role, projectId } = await req.json();

    if (!userId || !role || !projectId) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Prevent duplicate (same user in same project)
    const alreadyMember = await TeamMember.findOne({ userId, projectId });
    if (alreadyMember) {
      return NextResponse.json(
        { message: "This user is already part of the project" },
        { status: 400 }
      );
    }

    // Create the team member record
    const newMember = await TeamMember.create({
      userId,
      role,
      status: "Active",
      projectId,
      addedBy,
    });

    // Add to project’s team list
    await ProjectModel.findByIdAndUpdate(
      projectId,
      { $addToSet: { teamMembers: userId } },
      { new: true }
    );

    return NextResponse.json(
      { message: "Team member added successfully", member: newMember },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding member:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

// GET TEAM MEMBERS + STATS (grouped by user)
export async function GET(req) {
  try {
    await DBconnect();

    // Auth
    const token = req.cookies.get("authToken")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const addedBy = decoded.id; // logged-in user’s ID

    // Fetch only team members added by this user
    const members = await TeamMember.find({ addedBy })
      .populate("userId", "fullName email")
      .populate("projectId", "title")
      .sort({ createdAt: -1 });

    // Group by user
    const grouped = {};
    for (const member of members) {
      const user = member.userId;
      if (!user) continue;

      const initials = user?.fullName
        ? user.fullName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase()
        : "NA";

      if (!grouped[user._id]) {
        grouped[user._id] = {
          id: user._id,
          name: user.fullName,
          email: user.email,
          initials,
          roles: [],
          projects: [],
          dateJoined: member.createdAt,
          projectCount: 0,
          taskCount: 0,
        };
      }

      // Collect role + project title
      grouped[user._id].roles.push(member.role);
      if (member.projectId && member.projectId.title) {
        grouped[user._id].projects.push(member.projectId.title);
      } else {
        grouped[user._id].projects.push("N/A");
      }
    }

    // Load Task model
    const TaskModel = (await import("@/Models/Tasks")).default;

    // Get all project IDs created by the logged-in user
    const userProjectIds = await ProjectModel.find({ createdBy: addedBy })
      .distinct("_id")
      .lean();

    // Count tasks per user (only in user's projects)
    for (const userId in grouped) {
      const userGroup = grouped[userId];
      userGroup.projectCount = userGroup.projects.length;

      try {
        userGroup.taskCount = await TaskModel.countDocuments({
          assignedTo: { $in: [userId] },
          project: { $in: userProjectIds },
        });
      } catch (err) {
        console.error("Error counting tasks for user", userId, err);
        userGroup.taskCount = 0;
      }
    }

    const formattedMembers = Object.values(grouped);

    // COMPUTE AGGREGATE STATS
    const totalMembers = formattedMembers.length;
    const totalTasks = formattedMembers.reduce((sum, m) => sum + m.taskCount, 0);
    const uniqueProjectsSet = new Set();
    formattedMembers.forEach(m => m.projects.forEach(p => uniqueProjectsSet.add(p)));
    const uniqueProjects = uniqueProjectsSet.size;
    const avgTasks = totalMembers > 0 ? Math.round(totalTasks / totalMembers) : 0;

    // Return both members and stats
    return NextResponse.json(
      {
        members: formattedMembers,
        stats: {
          totalMembers,
          uniqueProjects,
          totalTasks,
          avgTasks,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching team members:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
