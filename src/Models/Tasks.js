import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: ["To Do", "Pending", "Completed"], 
    default: "To Do", 
    },
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
    },
    dueDate: { type: Date },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    assignedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // reference to team members (users)
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // who created the task
      required: true,
    },
  },
  { timestamps: true }
);

const TaskModel =
  mongoose.models.Task || mongoose.model("Task", TaskSchema);
export default TaskModel;
