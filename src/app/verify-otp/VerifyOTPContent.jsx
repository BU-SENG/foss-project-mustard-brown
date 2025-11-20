"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import axios from "axios";
import { IoShieldCheckmarkOutline } from "react-icons/io5";

export default function VerifyOTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const inputsRef = useRef([]);

  // ←←← NEW: Timer state
  const [timer, setTimer] = useState(60);           // 60 seconds countdown
  const [canResend, setCanResend] = useState(false); // Button disabled at first
  const intervalRef = useRef(null);

  useEffect(() => {
    const e = searchParams.get("email");
    if (e) setEmail(decodeURIComponent(e));
  }, [searchParams]);

  // ←←← NEW: Countdown effect
  useEffect(() => {
    // Start countdown immediately when page loads
    setCanResend(false);
    setTimer(60);

    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current); // Cleanup on unmount
  }, []);

  const handleChange = (e, index) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
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
      await axios.post("/api/verify-otp", { email, otp: code });
      Swal.fire({
        icon: "success",
        title: "Verified!",
        text: "OTP verified successfully. Redirecting...",
        confirmButtonColor: "#9F00FF",
      });
      setTimeout(() => router.push("/Dashboard"), 2000);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Invalid OTP",
        text: err.response?.data?.message || "Please try again.",
        confirmButtonColor: "#F2521E",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return; 

    setIsLoading(true);
    setCanResend(false); 
    setTimer(60);       

    try {
      await axios.post("/api/resend-otp", { email });
      Swal.fire({
        icon: "success",
        title: "OTP Sent!",
        text: "Check your email for the new code.",
        confirmButtonColor: "#9F00FF",
      });

      // Restart the 60-second countdown
      intervalRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Could not resend OTP. Try again later.",
        confirmButtonColor: "#F2521E",
      });
      setCanResend(true); // Allow retry if failed
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
            <span className="font-medium text-gray-700">
              {email || "your email"}
            </span>
          </p>
        </div>

        <div className="flex justify-center gap-2 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputsRef.current[index] = el)}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-12 h-12 border border-gray-300 rounded-lg text-center text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-[#9F00FF] transition-all"
            />
          ))}
        </div>

        <button
          onClick={handleVerify}
          disabled={isLoading || !email}
          className={`w-full py-3 rounded-lg text-white font-semibold transition-all mb-6 ${
            isLoading || !email
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-[#9F00FF] to-[#F2521E] hover:from-[#8700cc] hover:to-[#d14012]"
          }`}
        >
          {isLoading ? "Verifying..." : "Verify OTP"}
        </button>

        <p className="text-center text-sm text-gray-400">
          Didn’t get a code?{" "}
          <button
            type="button"
            onClick={handleResendOTP}
            disabled={!canResend || isLoading}
            className={`font-medium transition-all ${
              canResend
                ? "text-[#9F00FF] hover:underline cursor-pointer"
                : "text-gray-400 cursor-not-allowed"
            }`}
          >
            {canResend ? (
              "Resend OTP"
            ) : (
              <>Resend in {timer}s</>
            )}
          </button>
        </p>
      </div>
    </div>
  );
}