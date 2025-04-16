"use client";

import { ForgetPasswordContent } from "@/components/auth/forget-password-context";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { motion } from "framer-motion";

export default function ForgotPassword() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full bg-white rounded-lg shadow-xl"
    >
      <ForgetPasswordContent />
    </motion.div>
  );
}
