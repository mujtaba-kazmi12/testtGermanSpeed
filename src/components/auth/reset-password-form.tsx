"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toast } from "@/components/toast/Toast";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useTranslations, useLocale } from 'next-intl';
import axios from "axios";

// Gradient text style
const gradientTextClass = "bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600";

interface ResetPasswordFormProps extends React.ComponentPropsWithoutRef<"form"> {
  token: string;
  email: string;
}

export function ResetPasswordForm({
  className,
  token,
  email,
  ...props
}: ResetPasswordFormProps) {
  const t = useTranslations('auth.resetPassword');
  const currentLocale = useLocale();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password validation schema with strong password requirements
  const formSchema = z.object({
    password: z
      .string()
      .min(8, { message: t('zodPasswordMinLength', { defaultMessage: 'Password must be at least 8 characters' }) })
      .refine((password) => /[A-Z]/.test(password), {
        message: t('zodPasswordUppercase', { defaultMessage: 'Password must contain at least one uppercase letter' }),
      })
      .refine((password) => /[a-z]/.test(password), {
        message: t('zodPasswordLowercase', { defaultMessage: 'Password must contain at least one lowercase letter' }),
      })
      .refine((password) => /[0-9]/.test(password), {
        message: t('zodPasswordNumber', { defaultMessage: 'Password must contain at least one number' }),
      })
      .refine((password) => /[^A-Za-z0-9]/.test(password), {
        message: t('zodPasswordSpecial', { defaultMessage: 'Password must contain at least one special character' }),
      }),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('zodPasswordMatch', { defaultMessage: 'Passwords must match' }),
    path: ["confirmPassword"],
  });

  // Initialize form with react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const payload = {
        email,
        token,
        newPassword: values.password,
      };

      const response = await fetch(`${API_BASE_URL}/v1/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        Toast.showSuccess(t('toastSuccessDescription', { 
          defaultMessage: 'Your password has been reset successfully' 
        }));
        // Redirect to login page after password reset
        setTimeout(() => {
          router.push(`/${currentLocale}/sign-in`);
        }, 2000);
      } else {
        throw new Error(data.message || 'Failed to reset password');
      }
    } catch (error: any) {
      // Show error toast
      let errorMsg = t('toastErrorDefault', { defaultMessage: 'Failed to reset your password' });
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          errorMsg = t('errorInvalidToken', { defaultMessage: 'Invalid or expired reset token' });
        } else if (error.response?.data?.message) {
          errorMsg = error.response.data.message;
        }
      } else if (error instanceof Error) {
        errorMsg = error.message;
      }
      
      Toast.showError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("flex flex-col gap-6", className)}
        {...props}
      >
        <motion.div
          variants={item}
          className="flex flex-col items-center gap-2 text-center"
        >
          <h1 className={`text-2xl font-bold ${gradientTextClass}`}>
            {t('title', { defaultMessage: 'Reset Your Password' })}
          </h1>
          <p className="text-balance text-sm text-gray-500">
            {t('subtitle', { 
              defaultMessage: 'Create a new strong password for your account' 
            })}
          </p>
        </motion.div>

        <div className="grid gap-4">
          <motion.div variants={item} className="grid gap-2">
            <Label htmlFor="password">{t('newPassword', { defaultMessage: 'New Password' })}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                className="border-gray-300 focus:border-violet-400 focus:ring-violet-100 pr-10"
                {...form.register("password")}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 text-gray-400"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? t('hidePassword', { defaultMessage: 'Hide password' }) : t('showPassword', { defaultMessage: 'Show password' })}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {form.formState.errors.password && (
              <p className="text-sm text-destructive">
                {form.formState.errors.password.message}
              </p>
            )}
          </motion.div>

          <motion.div variants={item} className="grid gap-2">
            <Label htmlFor="confirmPassword">{t('confirmPassword', { defaultMessage: 'Confirm Password' })}</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                className="border-gray-300 focus:border-violet-400 focus:ring-violet-100 pr-10"
                {...form.register("confirmPassword")}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 text-gray-400"
                onClick={toggleConfirmPasswordVisibility}
                aria-label={showConfirmPassword ? t('hidePassword', { defaultMessage: 'Hide password' }) : t('showPassword', { defaultMessage: 'Show password' })}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {form.formState.errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </motion.div>
        </div>

        <motion.div variants={item}>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 transition duration-200"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('buttonLoading', { defaultMessage: 'Resetting...' })}
              </>
            ) : (
              t('buttonText', { defaultMessage: 'Reset Password' })
            )}
          </Button>
        </motion.div>

        <motion.div variants={item} className="text-center">
          <Button
            type="button"
            variant="link"
            className="text-violet-600 hover:text-fuchsia-600 transition-colors duration-300"
            onClick={() => router.push(`/${currentLocale}/sign-in`)}
          >
            {t('backToLogin', { defaultMessage: 'Back to Login' })}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
} 