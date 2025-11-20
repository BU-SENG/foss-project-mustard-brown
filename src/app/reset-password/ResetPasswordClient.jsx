"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  IoLockClosedOutline,
  IoEyeOutline,
  IoEyeOffOutline,
} from "react-icons/io5";
import axios from "axios";
import Swal from "sweetalert2";
import Link from "next/link";

export default function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);

  useEffect(() => {
    if (!token) setIsValidToken(false);
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      Swal.fire({
        icon: "error",
        title: "Password Too Short",
        text: "Password must be at least 6 characters long.",
      });
      return;
    }

    if (password !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Passwords Don't Match",
        text: "Please make sure both passwords are identical.",
      });
      return;
    }

    setIsLoading(true);
    try {
      await axios.post("/api/reset-password", { token, password });

      Swal.fire({
        icon: "success",
        title: "Password Reset Successful! 🎉",
        text: "You can now log in with your new password.",
        timer: 3000,
        showConfirmButton: false,
      }).then(() => {
        router.push("/Login");
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Link Expired or Invalid",
        text: err.response?.data?.message || "Please request a new reset link.",
        confirmButtonText: "Go to Forgot Password",
      }).then((result) => {
        if (result.isConfirmed) {
          router.push("/forgot-password");
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-orange-50 px-4">
        <div className="text-center bg-white p-10 rounded-xl shadow-2xl max-w-md">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Invalid Link</h1>
          <p className="text-gray-600 mb-6">
            This password reset link is missing or invalid.
          </p>
          <Link
            href="/forgot-password"
            className="inline-block bg-gradient-to-r from-[#f2521e] to-[#9f00ff] text-white font-bold py-3 px-8 rounded-lg hover:shadow-xl transition"
          >
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    // ←←← Your beautiful form (copy everything from return below)
    <div className="h-screen w-full flex items-center justify-center py-16 px-4 bg-gradient-to-br from-purple-50 to-orange-50">
      <form
        onSubmit={handleSubmit}
        className="max-w-sm w-full shadow-2xl rounded-xl p-8 bg-white"
      >
        <div className="flex justify-center mb-8">
          <Image
            src="/Copilot_20251014_120138.png"
            alt="OpenTask Logo"
            width={80}
            height={80}
          />
        </div>

        <h1 className="text-3xl font-bold text-center mb-2">
          Create New Password
        </h1>
        <p className="text-center text-gray-600 text-sm mb-8">
          Your new password must be different from the previous one.
        </p>

        <div className="relative mb-5">
          <IoLockClosedOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password (min. 6 characters)"
            className="w-full pl-12 pr-12 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#9f00ff]/50 transition text-sm"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? (
              <IoEyeOffOutline size={20} />
            ) : (
              <IoEyeOutline size={20} />
            )}
          </button>
        </div>

        <div className="relative mb-8">
          <IoLockClosedOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
          <input
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#9f00ff]/50 transition text-sm"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 rounded-lg font-bold text-white transition-all duration-300 flex items-center justify-center gap-3
            ${isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-[#f2521e] to-[#9f00ff] hover:shadow-xl transform hover:scale-[1.02]"}`}
        >
          {isLoading ? (
            <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            "Update Password"
          )}
        </button>

        <div className="text-center mt-6">
          <Link
            href="/Login"
            className="text-xs text-[#f2521e] hover:underline font-medium"
          >
            ← Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
}
