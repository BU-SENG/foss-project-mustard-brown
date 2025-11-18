import { Suspense } from "react";
import VerifyOTPContent from "./VerifyOTPContent"; // We'll create this file in 5 seconds

export const dynamic = 'force-dynamic';

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      }
    >
      <VerifyOTPContent />
    </Suspense>
  );
}