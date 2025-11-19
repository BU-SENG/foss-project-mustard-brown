// Handles user logout and clears auth cookie
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * POST handler to log out a user.
 * Deletes and expires the authToken cookie.
 * Returns a JSON response confirming logout.
 */
export async function POST() {
  // Access the cookies store
  const cookieStore = cookies();

  // Remove the authentication token
  cookieStore.delete("authToken");

  // Expire the authToken cookie
  cookieStore.set("authToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: -1, // Immediately expire
  });

  // Respond with logout success message
  return NextResponse.json({ message: "Logged out successfully" });
}
