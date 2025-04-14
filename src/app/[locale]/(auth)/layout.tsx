"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

 //you would check if the user is already authenticated
  // and redirect them to their dashboard if they are
  useEffect(() => {
    // Example of checking for authentication
    // const isAuthenticated = localStorage.getItem('isAuthenticated');
    // if (isAuthenticated === 'true') {
    //   router.push('/dashboard');
    // }
  }, [router]);

  return children;
} 