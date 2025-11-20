import { Suspense } from "react";
import ResetPasswordClient from "./ResetPasswordClient";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    }>
      <ResetPasswordClient />
    </Suspense>
  );
}