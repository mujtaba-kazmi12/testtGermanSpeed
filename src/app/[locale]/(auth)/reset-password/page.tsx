"use client";

import { useSearchParams } from "next/navigation";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function ResetPassword() {
  const searchParams = useSearchParams();
  const [params, setParams] = useState<{ token: string; email: string } | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (token && email) {
      setParams({ token, email });
    }
  }, [searchParams]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 bg-gray-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl"
      >
        {params ? (
          <ResetPasswordForm token={params.token} email={params.email} />
        ) : (
          <div className="text-center p-4">
            <h2 className="text-xl font-semibold text-red-600">Invalid Reset Link</h2>
            <p className="mt-2 text-gray-600">
              The password reset link is invalid or expired. Please request a new password reset link.
            </p>
          </div>
        )}
      </motion.div>
    </main>
  );
} 