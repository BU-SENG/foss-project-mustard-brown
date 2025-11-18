import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  status: { type: String, enum: ["Active", "On Hold"], default: "Active" },
  priority: {
    type: String,
    enum: ["High", "Medium", "Low"],
    default: "Medium",
  },
  startDate: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  tasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tasks",
    },
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  teamMembers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
},
{ timestamps: true }
);
const ProjectModel =
  mongoose.models.Project || mongoose.model("Project", ProjectSchema);
export default ProjectModel;
