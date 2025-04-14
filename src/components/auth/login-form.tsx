"use client";
import axios from "axios";
import Cookies from "js-cookie";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuthResponse } from "@/types/auth";
import { Toast } from "@/components/toast/Toast";
import { Eye, EyeOff } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { cookies } from "next/headers";

// Gradient text style
const gradientTextClass =
  "bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const t = useTranslations("auth.login");
  const currentLocale = useLocale();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Generate locale-prefixed link
  const localePrefixed = (path: string) => `/${currentLocale}${path}`;

  // Form validation schema defined inside to use t()
  const formSchema = z.object({
    email: z.string().email({ message: t("zodEmail") }),
    password: z.string().min(6, { message: t("zodPassword") }),
  });

  // Initialize form with react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const { data } = await axios.post<AuthResponse>(
        `${API_BASE_URL}/v1/auth/login`,
        values
      );
  
      // Store token & role in cookies (expires in 1 day)
      Cookies.set("token", data.token, { expires: 1 });
      Cookies.set("role", data.data.role, { expires: 1 });
      Cookies.set("userId", data.data.id, { expires: 1 });
      Cookies.set("firstName", data.data.firstName, { expires: 1, path: "/" });
      Cookies.set("permissions", JSON.stringify(data.data.permissions), {
        expires: 1,
        path: "/",
      });
  
      const permissions = Cookies.get("permissions")
        ? JSON.parse(Cookies.get("permissions") as string)
        : [];
  
      console.log(permissions);
  
      // Navigate based on user role
      switch (data.data.role) {
        case "superadmin":
          router.push("/admin/dashboard");
          break;
        case "moderator":
          router.push("/moderator/dashboard");
          break;
        case "publisher":
          router.push("/publisher/dashboard");
          break;
        default:
          router.push("/");
      }
  
      Toast.showSuccess(t("toastSuccessDescription"));
    } catch (error: any) {
      let errorMsg = t("toastErrorDefault");
      if (error.response?.status === 404) {
        errorMsg = t("errorUserNotFound");
      } else if (error.response?.status === 400) {
        errorMsg = t("errorInvalidCredentials");
      } else if (error.response?.status === 403) {
        errorMsg = t("errorNotVerified");
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      Toast.showError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };
  

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
            {t("title")}
          </h1>
          <p className="text-balance text-sm text-gray-500">{t("subtitle")}</p>
        </motion.div>
        <div className="grid gap-6">
          <motion.div variants={item} className="grid gap-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              className="border-gray-300 focus:border-violet-400 focus:ring-violet-100"
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </motion.div>
          <motion.div variants={item} className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">{t("password")}</Label>
              <Link
                href={`/${currentLocale}/forgot-password`}
                className="ml-auto text-sm text-violet-600 hover:text-fuchsia-600 transition-colors duration-300"
              >
                {t("forgot_password")}
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                className="border-gray-300 focus:border-violet-400 focus:ring-violet-100 pr-10"
                {...form.register("password")}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 text-gray-400"
                onClick={togglePasswordVisibility}
                aria-label={
                  showPassword ? t("hidePassword") : t("showPassword")
                }
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
          <motion.div
            variants={item}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? t("loading") : t("submit")}
            </Button>
          </motion.div>
          <motion.div variants={item} className="text-center text-sm">
            {t("no_account")}{" "}
            <Link
              href="/sign-up"
              className="font-medium text-violet-600 hover:text-fuchsia-600 transition-colors duration-300"
            >
              {t("register")}
            </Link>
          </motion.div>
        </div>
      </form>
    </motion.div>
  );
}
