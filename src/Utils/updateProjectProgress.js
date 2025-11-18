import TaskModel from "@/Models/Tasks";
import ProjectModel from "@/Models/Projects";

export async function updateProjectProgress(projectId) {
  try {
    const [totalTasks, completedTasks] = await Promise.all([
      TaskModel.countDocuments({ project: projectId }),
      TaskModel.countDocuments({ project: projectId, status: "Completed" }),
    ]);

    const progress = totalTasks > 0 
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;

    await ProjectModel.findByIdAndUpdate(projectId, { progress });

    return progress;
  } catch (error) {
    console.error("Failed to update project progress:", error);
    return null;
  }
}