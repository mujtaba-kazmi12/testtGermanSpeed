import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  loading?: boolean;
  className?: string;
}

export function StatCard({ title, value, icon, loading = false, className }: StatCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-8 w-1/3" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
              <div className="h-8 w-8 rounded-full bg-primary/10 p-1.5">{icon}</div>
            </div>
            <div className="mt-2 text-2xl font-bold">{value}</div>
          </>
        )}
      </CardContent>
    </Card>
  )
} 