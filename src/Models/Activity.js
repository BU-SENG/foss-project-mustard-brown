// /Models/Activity.js
import mongoose, { Schema } from "mongoose";

const ActivitySchema = new Schema(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User", // Assuming your user model is named 'User'
      required: true,
    },
    // The type of action performed
    action: {
      type: String,
      required: true,
      enum: [
        "TASK_CREATE",
        "STATUS_CHANGE",
        "FIELD_UPDATE",
        "MEMBER_ASSIGN",
        "MEMBER_UNASSIGN",
        "COMMENT_ADD",
        "COMMENT_EDIT",
        "COMMENT_DELETE",
        "TASK_DELETE",
      ],
    },
    // Extra details about the action
    details: {
      type: Schema.Types.Mixed, // Allows storing flexible objects
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // We only care about when it was created
  }
);

export default mongoose.models.Activity ||
  mongoose.model("Activity", ActivitySchema);