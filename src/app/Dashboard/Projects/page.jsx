import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";
import ProjectClient from "./ProjectClient"; // ← New client wrapper

export default async function DashboardPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("authToken")?.value;

  if (!token) redirect("/Login");

  try {
    jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.error("Invalid token:", err.message);
    redirect("/Login");
  }

  // Everything is secure → now pass control to client component
  return <ProjectClient />;
}