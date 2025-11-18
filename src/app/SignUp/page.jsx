"use client";
import React, { useState } from "react";
import Image from "next/image";
import { FiUser } from "react-icons/fi";
import { MdOutlineMail } from "react-icons/md";
import { IoLockClosedOutline } from "react-icons/io5";
import { FaGithub } from "react-icons/fa";
import { FaGoogle } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";
import Link from "next/link";
import { MdMarkEmailRead } from "react-icons/md";

export default function page() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [exchange, setExchange] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const Validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim())
      newErrors.fullName = "First name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email.trim()))
      newErrors.email = "Invalid email format";
    if (!formData.password.trim()) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!Validate()) return;
    setIsLoading(true);

    try {
      const response = await axios.post("/api/user", formData);
      if (response.status === 200) {
        setIsLoading(false);
        // Handle success (e.g., show a success message, redirect, etc.)

        setExchange(true);
      }
    } catch (error) {
      setIsLoading(false);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message ||
          error.message ||
          "An error occurred while creating the account",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post("/api/resend-verification", {
        email: formData.email,
      });
      Swal.fire({
        icon: "success",
        title: "Verification Sent",
        text: response.data.message,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message ||
          error.message ||
          "Could not resend verification email.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center py-16 px-4 md:px-10">
      {/* <div className='w-1/2 h-full bg-gradient-to-br from-[#f2521e] via-[#f2521e]/90 to-[#9f00ff]'></div>
      <div className='w-1/2 h-full'></div> */}
      {exchange ? (
        <div className="max-w-sm w-full rounded-xl p-6 shadow-2xl space-y-4">
          <div className="mx-auto rounded-full w-18 h-18 bg-gradient-to-br from-[#9f00ff] to-[#f2521e] flex items-center justify-center">
            <MdMarkEmailRead className="text-4xl text-white" />
          </div>
          <div className="flex flex-col items-center text-center space-y-3 w-full">
            <h1 className="font-bold text-2xl">Check Your Email</h1>
            <p className="text-sm text-[#6b7280]">
              We've sent a password reset link to
            </p>
            <p className="font-bold text-base text-black">{formData.email}</p>
            <p className="text-xs text-[#6b7280] leading-relaxed">
              Click the link in the email to verify your account and get
              started. If you don't see it, check your spam folder.
            </p>
            <div className="mt-3 w-full flex flex-col gap-3">
              <>
                <button
                  onClick={handleResendVerification}
                  disabled={isLoading}
                  className={`text-xs w-full py-3 rounded-lg font-semibold flex items-center justify-center text-white bg-gradient-to-r from-[#9f00ff] to-[#f2521e] hover:from-[#9f00ff]/90 hover:to-[#f2521e]/90 transition-all duration-300 ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? "Resending..." : "Resend Verification Email"}
                </button>
              </>
              <Link href={"#"} className="w-full">
                <button className="text-xs w-full py-3 rounded-lg font-semibold flex items-center justify-center border-1 border-[#6b7280] hover:bg-[#7C3BEE] transition-all duration-300 hover:text-white">
                  Back To Sign Up
                </button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <form className="max-w-sm w-full shadow-2xl rounded-xl p-4 md:px-6 md:py-6 flex items-center justify-center flex-col">
          <div className="flex items-center justify-center w-full flex-col mb-6">
            <div className="w-full flex items-center justify-center mb-2">
              <Image
                src="/Copilot_20251014_120138.png"
                alt="logo"
                width={60}
                height={60}
              />
            </div>
            <div>
              <h1 className="font-bold text-3xl">Get Started</h1>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                Create your account in seconds
              </p>
            </div>
          </div>
          <div className="flex flex-col w-full space-y-4">
            <div className="flex flex-col space-y-1">
              <label className="text-sm">Full Name</label>
              <div className="relative text-sm">
                <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-base" />
                <input
                  name="fullName"
                  onChange={handleChange}
                  type="text"
                  placeholder="Enter your full name"
                  className="h-10 w-full rounded-lg border border-gray-300 pl-10 pr-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              {errors.fullName && (
                <div className="text-red-500 text-xs">{errors.fullName}</div>
              )}
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-sm">Email</label>
              <div className="relative text-sm">
                <MdOutlineMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-base" />
                <input
                  name="email"
                  onChange={handleChange}
                  type="email"
                  placeholder="Enter your email address"
                  className="h-10 w-full rounded-lg border border-gray-300 pl-10 pr-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              {errors.email && (
                <div className="text-red-500 text-xs">{errors.email}</div>
              )}
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-sm">Password</label>
              <div className="relative text-sm">
                <IoLockClosedOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-base" />
                <input
                  name="password"
                  onChange={handleChange}
                  type="password"
                  placeholder="Enter your password"
                  className="h-10 w-full rounded-lg border border-gray-300 pl-10 pr-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              {errors.password && (
                <div className="text-red-500 text-xs">{errors.password}</div>
              )}
            </div>
            <div className="mt-4 w-full">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className={`py-2.5 text-sm font-semibold px-6 w-full rounded-lg flex items-center justify-center gap-2 transition-all duration-500 
      ${
        isLoading
          ? "opacity-50 cursor-not-allowed bg-gray-300 text-gray-500"
          : "bg-gradient-to-r from-[#f2521e] to-[#9f00ff] text-white"
      }`}
              >
                {isLoading ? (
                  <div className="py-2">
                    <div className="custom-loader"></div>
                  </div>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>
            {/* <div className="w-full mt-4 relative flex items-center justify-center">
            <div className="w-full border-[0.1px] border-gray-200"></div>
            <p className="absolute text-xs bg-white px-4 text-gray-500">OR COUNTINUE WITH</p>
          </div>
          <div className="flex gap-4 w-full mt-4">
            <div className="w-full"><button className="text-sm rounded-lg flex gap-3 items-center justify-center w-full border-1 py-2.5 px-6"><FaGoogle/> Google</button></div>
            <div className="w-full"><button className="text-sm rounded-lg flex gap-3 items-center justify-center w-full border-1 py-2.5 px-6"><FaGithub/> GitHub</button></div>
          </div> */}
            <div className="w-full flex items-center justify-center mt-4">
              <p className="text-xs text-gray-400">
                Already have an account?{" "}
                <Link className="text-[#f2521e]" href={"/Login"}>
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
