import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import TaskEditClient from "./TaskEditClient";

export default async function TaskEditPage({ params }) {
  const { id } = params;

  const cookieStore = cookies();
  const token = cookieStore.get("authToken")?.value;

  let userId = null;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
    } catch (err) {
      console.error("Invalid token:", err);
    }
  }

  if (!userId) {
    return (
      <div className="flex h-screen items-center justify-center text-red-600 text-xl">
        Unauthorized. Please log in.
      </div>
    );
  }

  return <TaskEditClient taskID={id} currentUserId={userId} />;
}