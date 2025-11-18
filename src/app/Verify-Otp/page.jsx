"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import axios from "axios";
import { IoShieldCheckmarkOutline } from "react-icons/io5";

export default function VerifyOTPPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email"); // auto from login page

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const inputsRef = useRef([]);

  // Handle typing in OTP boxes
  const handleChange = (e, index) => {
    const value = e.target.value.replace(/\D/, ""); // allow only numbers
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // move to next input automatically
    if (value && index < 5) inputsRef.current[index + 1].focus();
  };

  // Handle backspace navigation
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete OTP",
        text: "Please enter all 6 digits.",
        confirmButtonColor: "#9F00FF",
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post("/api/verify-otp", { email, otp: code });
      Swal.fire({
        icon: "success",
        title: "Verified!",
        text: res.data.message || "OTP verified successfully.",
        confirmButtonColor: "#9F00FF",
      });
      setTimeout(() => router.push("/Dashboard"), 2000);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Verification Failed",
        text:
          err.response?.data?.message ||
          "Invalid or expired OTP. Please try again.",
        confirmButtonColor: "#F2521E",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 relative px-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-lg relative z-10">
        <div className="flex flex-col items-center mb-6">
          <IoShieldCheckmarkOutline className="text-5xl text-[#9F00FF] mb-2" />
          <h1 className="text-2xl font-bold text-gray-800">Verify OTP</h1>
          <p className="text-gray-500 text-sm text-center mt-1">
            Enter the 6-digit code sent to <br />
            <span className="font-medium text-gray-700">{email}</span>
          </p>
        </div>

        <div className="flex justify-center gap-2 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputsRef.current[index] = el)}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-12 h-12 border border-gray-300 rounded-lg text-center text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-[#9F00FF] transition-all"
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleVerify}
          disabled={isLoading}
          className={`w-full py-3 rounded-lg text-white font-semibold transition-all duration-500 ${
            isLoading
              ? "opacity-50 cursor-not-allowed bg-gray-300 text-gray-600"
              : "bg-gradient-to-r from-[#9F00FF] to-[#F2521E] hover:opacity-90"
          }`}
        >
          {isLoading ? "Verifying..." : "Verify OTP"}
        </button>

        <p className="text-center text-sm text-gray-400 mt-6">
          Didn’t get a code?{" "}
          <a
            href="#"
            className="text-[#9F00FF] font-medium hover:underline"
          >
            Resend OTP
          </a>
        </p>
      </div>
    </div>
  );
}
