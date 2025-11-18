import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import TasksClient from "./TasksClient";

export default async function TasksPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("authToken")?.value;

  let currentUserId = null;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      currentUserId = decoded.id;
    } catch (err) {
      console.error("Invalid token:", err);
    }
  }

  if (!currentUserId) {
    return (
      <div className="flex h-screen items-center justify-center text-red-600 text-xl">
        Please log in to view tasks.
      </div>
    );
  }

  return <TasksClient currentUserId={currentUserId} />;
}