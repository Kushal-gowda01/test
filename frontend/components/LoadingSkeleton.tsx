import React from 'react';
import { cn } from '@both/utils';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'card' | 'chart' | 'text' | 'circle';
  count?: number;
}

function SkeletonPulse({ className }: { className?: string }) {
  return <div className={cn('animate-pulse bg-white/10 rounded-lg', className)} />;
}

export default function LoadingSkeleton({ className, variant = 'card', count = 1 }: LoadingSkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => i);

  if (variant === 'chart') {
    return (
      <div className={cn('glass-card p-6', className)}>
        <SkeletonPulse className="h-5 w-40 mb-4" />
        <div className="flex items-end gap-2 h-[250px]">
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonPulse
              key={i}
              className="flex-1 rounded-t-md"
              style={{ height: `${Math.random() * 60 + 20}%` } as React.CSSProperties}
            />
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'circle') {
    return (
      <div className="flex items-center justify-center">
        <SkeletonPulse className={cn('rounded-full w-32 h-32', className)} />
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {items.map((i) => (
        <div key={i} className="glass-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <SkeletonPulse className="w-10 h-10 rounded-xl" />
            <div className="flex-1">
              <SkeletonPulse className="h-4 w-32 mb-2" />
              <SkeletonPulse className="h-3 w-20" />
            </div>
          </div>
          <SkeletonPulse className="h-8 w-24 mb-1" />
          <SkeletonPulse className="h-3 w-40" />
        </div>
      ))}
    </div>
  );
}
