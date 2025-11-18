import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import DBconnect from "@/Utils/DBconnect";
import TaskModel from "@/Models/Tasks";
import ProjectModel from "@/Models/Projects";
import TeamMemberModel from "@/Models/Team";
import CommentModel from "@/Models/Comment";
import ActivityModel from "@/Models/Activity"; // <-- IMPORTED
import mongoose from "mongoose";
import UserModel from "@/Models/User";
import { updateProjectProgress } from "@/Utils/updateProjectProgress";

export async function GET(request, context) {
  const { params } = context;
  const { id } = await params;

  const token = request.cookies.get("authToken")?.value;
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!mongoose.Types.ObjectId.isValid(id))
    return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });

  await DBconnect();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const task = await TaskModel.findById(id)
      .populate("project", "title")
      .populate("assignedTo", "_id fullName")
      .populate("createdBy", "_id")
      .lean();

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const userProjects = await ProjectModel.find({ createdBy: userId })
      .select("title _id createdBy")
      .lean();

    const team = await TeamMemberModel.find({ projectId: task.project?._id })
      .populate("userId", "_id fullName")
      .select("userId role")
      .lean();

    const comments = await CommentModel.find({ taskId: id })
      .populate("userId", "fullName")
      .sort({ createdAt: 1 })
      .lean();

    // FETCH ACTIVITIES: Sort by newest first, then limit to 5
    const activities = await ActivityModel.find({ taskId: id })
      .populate("userId", "fullName")
      .sort({ createdAt: -1 }) // Newest first
      .limit(5) // <-- LIMIT APPLIED HERE
      .lean();

    return NextResponse.json(
      {
        task,
        projects: userProjects,
        team,
        comments,
        activities, // <-- INCLUDED
        isCreator: String(task.createdBy._id) === userId,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET task error:", err);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

export async function PUT(request, context) {
  const { params } = context;
  const { id } = await params;
  const body = await request.json();

  const token = request.cookies.get("authToken")?.value;
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!mongoose.Types.ObjectId.isValid(id))
    return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });

  await DBconnect();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Get task BEFORE update for comparison
    const taskBeforeUpdate = await TaskModel.findById(id).lean();
    if (!taskBeforeUpdate)
      return NextResponse.json({ error: "Task not found" }, { status: 404 });

    // Check permissions
    const isCreator = String(taskBeforeUpdate.createdBy) === userId;
    const isTeamMember = taskBeforeUpdate.assignedTo?.some(
      (uid) => String(uid) === userId
    );

    if (!isCreator && !isTeamMember)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    let updatedTask = taskBeforeUpdate;
    const updateFields = { ...body };
    let shouldRefetch = false;

    // === 1. STATUS CHANGE ===
    if (body.status && body.status !== taskBeforeUpdate.status) {
      const oldStatus = taskBeforeUpdate.status;
      const newStatus = body.status;

      updatedTask = await TaskModel.findByIdAndUpdate(
        id,
        { $set: { status: newStatus } },
        { new: true }
      ).lean();

      await ActivityModel.create({
        taskId: id,
        userId,
        action: "STATUS_CHANGE",
        details: { from: oldStatus, to: newStatus },
      });

      if (taskBeforeUpdate.project) {
        await updateProjectProgress(taskBeforeUpdate.project);
      }

      shouldRefetch = true;
    }

    // === 2. COMMENT ADD / EDIT ===
    if (body.comment !== undefined) {
      if (body.commentId) {
        // EDIT COMMENT
        const comment = await CommentModel.findById(body.commentId);
        if (!comment) {
          return NextResponse.json({ error: "Comment not found" }, { status: 404 });
        }
        if (String(comment.userId) !== userId) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const oldText = comment.text;
        comment.text = body.comment.trim();
        await comment.save();

        await ActivityModel.create({
          taskId: id,
          userId,
          action: "COMMENT_EDIT",
          details: { commentId: body.commentId },
        });
      } else {
        // ADD NEW COMMENT
        const newComment = await CommentModel.create({
          taskId: id,
          userId,
          text: body.comment.trim(),
        });

        await ActivityModel.create({
          taskId: id,
          userId,
          action: "COMMENT_ADD",
          details: { commentId: newComment._id },
        });
      }

      shouldRefetch = true;
    }

    // === 3. ASSIGNEE CHANGES ===
    if (body.assignedTo) {
      const oldAssignees = (taskBeforeUpdate.assignedTo || []).map(String);
      const newAssignees = Array.isArray(body.assignedTo)
        ? body.assignedTo.map(String)
        : [];

      const added = newAssignees.filter((uid) => !oldAssignees.includes(uid));
      const removed = oldAssignees.filter((uid) => !newAssignees.includes(uid));

      // Update task
      updatedTask = await TaskModel.findByIdAndUpdate(
        id,
        { $set: { assignedTo: newAssignees } },
        { new: true }
      ).lean();

      // Log activities
      for (const uid of added) {
        await ActivityModel.create({
          taskId: id,
          userId,
          action: "MEMBER_ASSIGN",
          details: { assignedUserId: uid },
        });
      }

      for (const uid of removed) {
        await ActivityModel.create({
          taskId: id,
          userId,
          action: "MEMBER_UNASSIGN",
          details: { unassignedUserId: uid },
        });
      }

      // Auto-add to project team
      const projectId = updatedTask.project || taskBeforeUpdate.project;
      if (projectId) {
        for (const uid of added) {
          const exists = await TeamMemberModel.findOne({
            userId: uid,
            projectId,
          });
          if (!exists) {
            await TeamMemberModel.create({
              userId: uid,
              projectId,
              role: "Member",
              addedBy: userId,
            });
          }
        }
      }

      shouldRefetch = true;
    }

    // === 4. OTHER FIELD UPDATES (title, description, etc.) ===
    const fieldUpdates = {};
    const allowedFields = [
      "title",
      "description",
      "priority",
      "dueDate",
      "project",
    ];

    allowedFields.forEach((field) => {
      if (body[field] !== undefined && body[field] !== taskBeforeUpdate[field]) {
        fieldUpdates[field] = body[field];
      }
    });

    if (Object.keys(fieldUpdates).length > 0) {
      updatedTask = await TaskModel.findByIdAndUpdate(
        id,
        { $set: fieldUpdates },
        { new: true }
      ).lean();

      for (const [field, value] of Object.entries(fieldUpdates)) {
        await ActivityModel.create({
          taskId: id,
          userId,
          action: "FIELD_UPDATE",
          details: { field, from: taskBeforeUpdate[field], to: value },
        });
      }

      shouldRefetch = true;
    }

    // === 5. REFETCH DATA IF ANYTHING CHANGED ===
    if (shouldRefetch || body.comment !== undefined || body.assignedTo || body.status) {
      const populatedTask = await TaskModel.findById(id)
        .populate("project", "title")
        .populate("assignedTo", "_id fullName")
        .populate("createdBy", "_id")
        .lean();

      const team = populatedTask.project?._id
        ? await TeamMemberModel.find({ projectId: populatedTask.project._id })
            .populate("userId", "_id fullName")
            .select("userId role")
            .lean()
        : [];

      const comments = await CommentModel.find({ taskId: id })
        .populate("userId", "fullName")
        .sort({ createdAt: 1 })
        .lean();

      const activities = await ActivityModel.find({ taskId: id })
        .populate("userId", "fullName")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

      return NextResponse.json(
        {
          task: populatedTask,
          team,
          comments,
          activities,
        },
        { status: 200 }
      );
    }

    // === 6. NO CHANGES (optional early return) ===
    return NextResponse.json(
      {
        task: updatedTask,
        team: [],
        message: "No changes detected",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("PUT task error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update task" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, context) {
  const { params } = context;
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const commentId = searchParams.get("commentId");

  const token = request.cookies.get("authToken")?.value;
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!mongoose.Types.ObjectId.isValid(id))
    return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });

  await DBconnect();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // === DELETE COMMENT ===
    if (commentId) {
      const comment = await CommentModel.findById(commentId);
      if (!comment)
        return NextResponse.json(
          { error: "Comment not found" },
          { status: 404 }
        );
      if (String(comment.userId) !== userId)
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });

      // LOG ACTIVITY
      await ActivityModel.create({
        taskId: id,
        userId,
        action: "COMMENT_DELETE",
        details: {
          commentText: comment.text.substring(0, 50) + "...",
        },
      });

      await CommentModel.findByIdAndDelete(commentId);
      return NextResponse.json({ success: true });
    }

    // === DELETE TASK ===
    const task = await TaskModel.findOne({ _id: id, createdBy: userId }).lean();
    if (!task) {
      return NextResponse.json(
        { error: "Task not found or you are not the creator" },
        { status: 403 }
      );
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    await TaskModel.deleteOne({ _id: id }).session(session);
    await CommentModel.deleteMany({ taskId: id }).session(session);
    await ActivityModel.deleteMany({ taskId: id }).session(session); // <-- DELETE ACTIVITIES

    if (task.project) {
      await ProjectModel.updateOne(
        { _id: task.project },
        { $pull: { tasks: id } }
      ).session(session);
    }

    await session.commitTransaction();
    return NextResponse.json(
      { message: "Task deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("DELETE error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete" },
      { status: 500 }
    );
  }
}
