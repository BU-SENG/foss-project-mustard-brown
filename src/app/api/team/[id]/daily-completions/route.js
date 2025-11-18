// app/api/team/[id]/daily-completions/route.js
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import DBconnect from "@/Utils/DBconnect";
import TaskModel from "@/Models/Tasks";
import TeamMember from "@/Models/Team";
import jwt from "jsonwebtoken";

export async function GET(request, { params }) {
  try {
    await DBconnect();

    const memberId = params?.id;
    if (!memberId || !mongoose.Types.ObjectId.isValid(memberId)) {
      return NextResponse.json(
        { error: "Valid Member ID required" },
        { status: 400 }
      );
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

    // Get team member records to filter by current user's projects
    const teamMembers = await TeamMember.find({ userId: memberObjectId })
      .select("projectId addedBy")
      .lean();

    // Filter to only projects where the CURRENT USER added this member
    const projectIdsAddedByCurrentUser = teamMembers
      .filter(tm => tm.addedBy && currentUserId && tm.addedBy.toString() === currentUserId)
      .map(tm => tm.projectId);

    // Last 7 days (inclusive)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const pipeline = [
      {
        $match: {
          assignedTo: memberObjectId,
          status: "Completed",
          updatedAt: { $gte: sevenDaysAgo },
          project: { $in: projectIdsAddedByCurrentUser }, // ADDED: Filter by current user's projects
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ];

    const result = await TaskModel.aggregate(pipeline);

    return NextResponse.json({ daily: result }, { status: 200 });
  } catch (error) {
    console.error("Daily completions error:", error);
    return NextResponse.json(
      { error: "Server error", details: error.message },
      { status: 500 }
    );
  }
}