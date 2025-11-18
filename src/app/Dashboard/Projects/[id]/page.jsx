// app/Dashboard/Projects/[id]/page.jsx
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import ProjectClient from "./ProjectPofileClient";

export default async function ProjectProfilePage({ params }) {
  const { id } = params;

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
    return <div className="flex h-screen items-center justify-center text-red-600">Please log in.</div>;
  }

  return <ProjectClient projectId={id} currentUserId={currentUserId} />;
}