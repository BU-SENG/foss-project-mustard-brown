import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = cookies();
  
  cookieStore.delete("authToken");

  cookieStore.set("authToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: -1,
  });

  return NextResponse.json({ message: "Logged out successfully" });
}