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
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useTranslations, useLocale } from 'next-intl';
import axios from "axios";

// Gradient text style
const gradientTextClass = "bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const t = useTranslations('auth.forgotPassword');
  const currentLocale = useLocale();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [successState, setSuccessState] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string>("");

  // Form validation schema
  const formSchema = z.object({
    email: z.string().email({ message: t('zodEmail', { defaultMessage: 'Please enter a valid email address' }) }),
  });

  // Initialize form with react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setSuccessState(null);
    setErrorMessage(null);
    setSubmittedEmail(values.email);

    try {
      const payload = {
        email: values.email,
        lan: currentLocale || "en"
      };

      const response = await fetch(`${API_BASE_URL}/v1/auth/forget-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessState(true);
        Toast.showSuccess(t('toastSuccessDescription', { 
          defaultMessage: 'Password reset instructions have been sent to your email' 
        }));
        // No redirect - just show success message
      } else {
        setSuccessState(false);
        throw new Error(data.message || 'Something went wrong');
      }
    } catch (error: any) {
      // Show error toast and set error state
      let errorMsg = t('toastErrorDefault', { defaultMessage: 'Failed to process your request' });
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          errorMsg = t('errorEmailNotFound', { defaultMessage: 'Email address not found' });
        } else if (error.response?.data?.message) {
          errorMsg = error.response.data.message;
        }
      } else if (error instanceof Error) {
        errorMsg = error.message;
      }
      
      setErrorMessage(errorMsg);
      Toast.showError(errorMsg);
      setSuccessState(false);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSuccessState(null);
    setErrorMessage(null);
    form.reset();
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

  // Success message component
  if (successState === true) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-6 py-4"
      >
        <CheckCircle2 className="h-16 w-16 text-green-500" strokeWidth={1.5} />
        
        <h2 className={`text-2xl font-bold text-center ${gradientTextClass}`}>
          {t('successTitle', { defaultMessage: 'Check Your Email' })}
        </h2>
        
        <div className="text-center space-y-3">
          <p className="text-gray-600">
            {t('successMessage', { 
              defaultMessage: 'Password reset instructions have been sent to' 
            })}
          </p>
          <p className="font-medium text-gray-800">{submittedEmail}</p>
          <p className="text-sm text-gray-500 mt-2">
            {t('checkSpamFolder', { defaultMessage: 'If you don\'t see the email, please check your spam folder.' })}
          </p>
        </div>
        
        <div className="flex gap-4 mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={resetForm}
            className="border-violet-200 hover:border-violet-300 text-violet-600"
          >
            {t('tryDifferentEmail', { defaultMessage: 'Try Different Email' })}
          </Button>
          
          <Button
            type="button"
            onClick={() => router.push(`/${currentLocale}/sign-in`)}
            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700"
          >
            {t('backToLogin', { defaultMessage: 'Back to Login' })}
          </Button>
        </div>
      </motion.div>
    );
  }

  // Error message component
  if (successState === false && errorMessage) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-6 py-4"
      >
        <AlertCircle className="h-16 w-16 text-red-500" strokeWidth={1.5} />
        
        <h2 className="text-2xl font-bold text-center text-red-600">
          {t('errorTitle', { defaultMessage: 'Something Went Wrong' })}
        </h2>
        
        <p className="text-gray-600 text-center">
          {errorMessage}
        </p>
        
        <div className="flex gap-4 mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={resetForm}
            className="border-red-200 hover:border-red-300 text-red-600"
          >
            {t('tryAgain', { defaultMessage: 'Try Again' })}
          </Button>
          
          <Button
            type="button"
            onClick={() => router.push(`/${currentLocale}/sign-in`)}
            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700"
          >
            {t('backToLogin', { defaultMessage: 'Back to Login' })}
          </Button>
        </div>
      </motion.div>
    );
  }

  // Regular form component
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
            {t('title', { defaultMessage: 'Forgot Your Password?' })}
          </h1>
          <p className="text-balance text-sm text-gray-500">
            {t('subtitle', { 
              defaultMessage: 'Enter your email address below and we\'ll send you instructions to reset your password.' 
            })}
          </p>
        </motion.div>

        <div className="grid gap-6">
          <motion.div variants={item} className="grid gap-2">
            <Label htmlFor="email">{t('email', { defaultMessage: 'Email' })}</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              className="border-gray-300 focus:border-violet-400 focus:ring-violet-100"
              {...form.register("email")}
              disabled={isLoading}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">
                {form.formState.errors.email.message}
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
                {t('buttonLoading', { defaultMessage: 'Sending...' })}
              </>
            ) : (
              t('buttonText', { defaultMessage: 'Send Reset Instructions' })
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