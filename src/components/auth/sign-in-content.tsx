"use client"

import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

import { useTranslations } from 'next-intl';

import { LoginForm } from "@/components/auth/login-form";

export function SignInContent() {
  const tHeader = useTranslations('Header');
  const tAuth = useTranslations('auth.login');

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10 bg-white">
        <motion.div
          className="flex justify-center gap-2 md:justify-start"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Link href="/" className="flex items-center gap-2 font-medium">
            <motion.div
              className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <MessageSquare className="size-4" />
            </motion.div>
            <span className="font-bold">{tHeader('logoText')}</span>
          </Link>
        </motion.div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden lg:block overflow-hidden">
        {/* Exactly match the button gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600"></div>
        
        {/* Light effects to add dimension */}
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.3),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.25),transparent_50%)]"></div>
        
        {/* Decorative image overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 0.7, scale: 1 }}
            transition={{ 
              duration: 1,
              delay: 0.3,
            }}
            className="w-4/5 h-4/5 relative"
          >
            {/* Abstract shapes */}
            <div className="absolute top-[20%] right-[10%] w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
            <div className="absolute bottom-[15%] left-[5%] w-40 h-40 bg-fuchsia-300/20 rounded-full blur-3xl"></div>
            
            {/* 3D floating dashboard mockup */}
            <motion.div 
              className="absolute inset-0 flex items-center justify-center"
              animate={{ 
                y: [0, -10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="w-[90%] max-w-md h-auto aspect-[16/9] rounded-xl bg-white/10 backdrop-blur-sm p-4 shadow-2xl border border-white/30 overflow-hidden transform rotate-3 perspective-1200">
                {/* Content marketplace mockup */}
                <div className="h-8 w-full rounded-lg bg-gradient-to-r from-violet-700/80 to-fuchsia-700/80 mb-3 flex items-center px-3">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-white/30"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-white/30"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-white/30"></div>
                  </div>
                  <div className="text-white/80 text-xs ml-auto">{tAuth('decorativeDashboardTitle')}</div>
                </div>
                
                {/* Search and filter bar */}
                <div className="bg-white/15 h-8 rounded-md mb-3 flex items-center px-3">
                  <div className="w-3 h-3 border-2 border-white/60 rounded-full mr-1"></div>
                  <div className="h-3 w-24 bg-white/30 rounded-full"></div>
                  <div className="ml-auto flex gap-2">
                    <div className="h-4 w-4 rounded-sm bg-white/30"></div>
                    <div className="h-4 w-4 rounded-sm bg-white/30"></div>
                  </div>
                </div>
                
                {/* Content listings */}
                <div className="space-y-2.5">
                  {/* Content item 1 */}
                  <div className="flex gap-3 bg-white/15 p-2 rounded-md">
                    <div className="h-10 w-10 rounded bg-fuchsia-400/30 flex items-center justify-center">
                      <div className="h-5 w-5 rounded-sm bg-white/40"></div>
                    </div>
                    <div className="flex-1">
                      <div className="h-2.5 w-28 bg-white/60 rounded-full mb-1.5"></div>
                      <div className="h-2 w-20 bg-white/30 rounded-full"></div>
                    </div>
                    <div className="flex flex-col items-end justify-center">
                      <div className="h-4 w-12 rounded-full bg-green-300/50"></div>
                    </div>
                  </div>
                  
                  {/* Content item 2 */}
                  <div className="flex gap-3 bg-white/10 p-2 rounded-md">
                    <div className="h-10 w-10 rounded bg-violet-400/30 flex items-center justify-center">
                      <div className="h-5 w-5 rounded-sm bg-white/40"></div>
                    </div>
                    <div className="flex-1">
                      <div className="h-2.5 w-32 bg-white/60 rounded-full mb-1.5"></div>
                      <div className="h-2 w-16 bg-white/30 rounded-full"></div>
                    </div>
                    <div className="flex flex-col items-end justify-center">
                      <div className="h-4 w-12 rounded-full bg-blue-300/50"></div>
                    </div>
                  </div>
                  
                  {/* Content item 3 */}
                  <div className="flex gap-3 bg-white/15 p-2 rounded-md">
                    <div className="h-10 w-10 rounded bg-pink-400/30 flex items-center justify-center">
                      <div className="h-5 w-5 rounded-sm bg-white/40"></div>
                    </div>
                    <div className="flex-1">
                      <div className="h-2.5 w-24 bg-white/60 rounded-full mb-1.5"></div>
                      <div className="h-2 w-18 bg-white/30 rounded-full"></div>
                    </div>
                    <div className="flex flex-col items-end justify-center">
                      <div className="h-4 w-12 rounded-full bg-yellow-300/50"></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Welcome card with glassmorphism */}
        <div className="absolute bottom-10 left-10 right-10 z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.8 }}
          >
            <h2 className="text-2xl font-bold mb-2 text-white">{tAuth('welcomeTitle')}</h2>
            <p className="text-sm text-white/90">
              {tAuth('welcomeSubtitle')}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 