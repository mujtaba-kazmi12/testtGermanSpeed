"use client";

import { Toaster, toast } from "sonner";

const formatDate = (date: any) => {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

const todayFormatted = formatDate(new Date());

const Toast = {
  showToast: (message: string) => {
    toast(message, {
      description: todayFormatted,
    });
  },
  showSuccess: (message: string) => {
    toast.success(message, {
      description: todayFormatted,
    });
  },
  showError: (message: string) => {
    toast.error(message, {
      description: todayFormatted,
    });
  },
  showInfo: (message: string) => {
    toast(message, {
      description: todayFormatted,
    });
  },
};

const ToastContainer = () => {
  return <Toaster 
    position="top-right" 
    richColors 
    closeButton={false} 
  />;
};

export { Toast, ToastContainer };
