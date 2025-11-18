"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { FaEnvelopeOpenText } from "react-icons/fa";
import Link from "next/link";

export default function VerifyPage() {
  const [message, setMessage] = useState("Verifying...");
  const [status, setStatus] = useState(""); // ✅ new state
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    async function verifyEmail() {
      try {
        const res = await axios.get(`/api/verify?token=${token}`);
        setMessage(res.data.message);

        if (res.data.message === "Already verified") setStatus("already");
        else if (res.data.message === "Email verified successfully!")
          setStatus("new");
        else setStatus("invalid");
      } catch (error) {
        setMessage("Invalid or expired verification link.");
        setStatus("invalid");
      }
    }

    if (token) verifyEmail();
  }, [token]);

  return (
  <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#fafafa] to-[#f5f0ff] overflow-hidden px-6 text-gray-800">
    {/* Animated background glow */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-[#9F00FF]/20 rounded-full blur-3xl animate-pulse-slow" />
      <div
        className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-[#F2521E]/20 rounded-full blur-3xl animate-pulse-slow"
        style={{ animationDelay: "1s" }}
      />
    </div>

    {/* Card Container */}
    <div className="relative z-10 bg-white/70 backdrop-blur-xl border border-white/40 shadow-lg rounded-3xl max-w-lg w-full text-center px-10 py-12">
      <FaEnvelopeOpenText className="text-6xl mx-auto text-[#9F00FF]" />

      {/* Newly verified */}
      {status === "new" && (
        <div className="flex flex-col items-center justify-center gap-4 mt-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#9F00FF] to-[#F2521E] bg-clip-text text-transparent">
            Email Verified!
          </h1>
          <p className="text-base text-gray-700 leading-relaxed">
            Your email has been successfully verified. You can now access all
            features of your account.
          </p>
          <div className="flex items-center justify-center gap-2 text-[#2dab5c] bg-[#e4eae4] border border-[#2dab5c]/20 px-5 py-2 rounded-full mt-2">
            <span className="w-2 h-2 rounded-full bg-[#2dab5c] animate-pulse"></span>
            <p className="text-xs font-semibold uppercase tracking-wide">Account Activated</p>
          </div>
          <Link
            href="/Login"
            className="text-sm font-semibold mt-6 bg-gradient-to-r from-[#9F00FF] to-[#F2521E] text-white px-8 py-3 rounded-xl shadow hover:opacity-90 transition"
          >
            Go to Login
          </Link>
        </div>
      )}

      {/* Already verified */}
      {status === "already" && (
        <div className="flex flex-col items-center justify-center gap-4 mt-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#9F00FF] to-[#F2521E] bg-clip-text text-transparent">
            Already Verified!
          </h1>
          <p className="text-base text-gray-700 leading-relaxed">
            Already verified. Your email has been successfully verified. You can now access all features of your account.
          </p>
          <div className="flex items-center justify-center gap-2 text-[#2563eb] bg-[#e6def2] border border-[#2563eb]/20 px-5 py-2 rounded-full mt-2">
            <span className="w-2 h-2 rounded-full bg-[#2563eb] animate-pulse"></span>
            <p className="text-xs font-semibold uppercase tracking-wide">Account Active</p>
          </div>
          <Link
            href="/Login"
            className="text-sm font-semibold mt-6 bg-gradient-to-r from-[#9F00FF] to-[#F2521E] text-white px-8 py-3 rounded-xl shadow hover:opacity-90 transition"
          >
            Go to Login
          </Link>
        </div>
      )}

      {status === "invalid" && (
        <div className="flex flex-col items-center justify-center gap-4 mt-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#9F00FF] to-[#F2521E] bg-clip-text text-transparent">
            Invalid or Expired Link
          </h1>
          <p className="text-base text-gray-700 leading-relaxed">
            This verification link has expired or is invalid. Please request a new verification email to continue.
          </p>
          <div className="flex items-center justify-center gap-2 text-[#ea580c] bg-[#e6def2] border border-[#fadbd3]/20 px-5 py-2 rounded-full mt-2">
            <span className="w-2 h-2 rounded-full bg-[#ea580c] animate-pulse"></span>
            <p className="text-xs font-semibold uppercase tracking-wide">Verification Required</p>
          </div>
          <Link
            href="/resend-verification"
            className="mt-6 bg-white text-[#9F00FF] border border-[#9F00FF]/20 px-8 py-3 rounded-xl font-medium shadow hover:bg-[#f5f0ff] transition"
          >
            Resend Verification
          </Link>
        </div>
      )}

      {/* Loading state */}
      {status === "" && (
        <h1 className="text-xl font-semibold text-gray-600 mt-6">{message}</h1>
      )}
    </div>
  </div>
);

}
