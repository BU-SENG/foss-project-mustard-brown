import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  // Check for authentication token in cookies
  const cookieStore = cookies();
  const token = cookieStore.get("authToken")?.value;

  if (!token) redirect("/Login");

  try {
    jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.error("Invalid token:", err.message);
    redirect("/Login");
  }

  return <DashboardClient />;
}