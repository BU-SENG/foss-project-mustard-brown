"use client";
import React, { useState } from "react";
import Image from "next/image";
import { MdOutlineMail } from "react-icons/md";
import {
  IoLockClosedOutline,
  IoEyeOutline,
  IoEyeOffOutline,
} from "react-icons/io5";
import axios from "axios";
import Swal from "sweetalert2";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // ← NEW

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Validate form
  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email.trim()))
      newErrors.email = "Invalid email format";
    if (!formData.password.trim()) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Resend verification
  const handleResendVerification = async (email) => {
    if (!email) {
      Swal.fire({
        icon: "warning",
        title: "Missing Email",
        text: "Please enter your email before resending the verification link.",
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post("/api/resend-verification", { email });

      Swal.fire({
        icon: "success",
        title: "Verification Email Sent",
        text:
          response.data.message ||
          "A new verification email has been sent. Check your inbox!",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message ||
          "Could not resend verification email.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Login submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);

    try {
      const response = await axios.post("/api/login", formData);
      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Login Successful",
          text: response.data.message,
          timer: 1500,
          showConfirmButton: false,
          timerProgressBar: true,
        });

        setTimeout(() => {
          router.push(`/verify-otp?email=${formData.email}`);
        }, 1600);
      }
    } catch (error) {
      const message = error.response?.data?.message;

      if (message === "Account Email Unverified") {
        Swal.fire({
          icon: "warning",
          title: "Email Not Verified",
          html: `
            <p class="text-sm text-gray-700">Your email hasn’t been verified yet.</p>
            <p class="text-sm text-gray-500 mt-2">Resend verification email?</p>
          `,
          showCancelButton: true,
          confirmButtonText: "Resend Email",
          cancelButtonText: "Cancel",
          confirmButtonColor: "#9f00ff",
          cancelButtonColor: "#f2521e",
        }).then(async (result) => {
          if (result.isConfirmed) {
            await handleResendVerification(formData.email);
          }
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: message || "Invalid credentials. Please try again.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center py-16 px-4 md:px-10">
      <form
        className="max-w-sm w-full shadow-2xl rounded-xl p-4 md:px-6 md:py-6 flex items-center justify-center flex-col"
        onSubmit={handleSubmit}
      >
        {/* Logo & Header */}
        <div className="flex items-center justify-center w-full flex-col mb-6">
          <div className="w-full flex items-center justify-center mb-2">
            <Image
              src="/Copilot_20251014_120138.png"
              alt="logo"
              width={60}
              height={60}
              className="rounded-lg"
            />
          </div>
          <h1 className="font-bold text-3xl">Welcome Back</h1>
          <p className="text-sm text-gray-600">
            Sign in to continue to OpenTask
          </p>
        </div>

        {/* Inputs */}
        <div className="flex flex-col w-full space-y-4">
          {/* Email */}
          <div className="flex flex-col space-y-1">
            <label className="text-sm">Email</label>
            <div className="relative">
              <MdOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                className="h-10 text-sm w-full rounded-lg border border-gray-300 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-[#9f00ff]/50"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col space-y-1">
            <label className="text-sm">Password</label>
            <div className="relative">
              <IoLockClosedOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="h-10 text-sm w-full rounded-lg border border-gray-300 pl-10 pr-12 focus:outline-none focus:ring-2 focus:ring-[#9f00ff]/50"
              />
              {/* Show/Hide Password Toggle */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
              >
                {showPassword ? (
                  <IoEyeOffOutline size={20} />
                ) : (
                  <IoEyeOutline size={20} />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs">{errors.password}</p>
            )}
          </div>

          <div className="flex w-full items-center justify-end">
            <Link href={"/forgot-password"} className="text-xs text-blue-500 underline cursor-pointer">Forgot Password?</Link>
          </div>

          {/* Submit Button */}
          <div className="mt-2 w-full">
            <button
              type="submit"
              disabled={isLoading}
              className={`py-2.5 cursor-pointer text-sm font-semibold px-6 w-full rounded-lg flex items-center justify-center gap-2 transition-all duration-500 
                ${
                  isLoading
                    ? "opacity-50 cursor-not-allowed bg-gray-300 text-gray-500"
                    : "bg-gradient-to-r from-[#f2521e] to-[#9f00ff] text-white hover:shadow-lg"
                }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Login"
              )}
            </button>
          </div>

          <div className="w-full text-center mt-2">
            <button
              type="button"
              className="py-2.5 text-sm font-semibold px-6 w-full rounded-lg flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 transition-all
             bg-gradient-to-r from-[#f2521e] to-[#9f00ff] bg-clip-text text-transparent cursor-pointer"
              onClick={() => (window.location.href = "/api/login/google")}
            >
              <img
                src="/google-logo.png"
                alt="Google logo"
                className="w-5 h-5 mr-2"
              />
              Sign in with Google
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="w-full text-center mt-4">
            <p className="text-xs text-gray-400">
              Don't have an account?{" "}
              <Link
                href="/SignUp"
                className="text-[#f2521e] font-medium hover:underline"
              >
                {" "}
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
