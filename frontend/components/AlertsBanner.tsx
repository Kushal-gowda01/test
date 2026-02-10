import React from 'react';
import { AlertTriangle, Info, ShieldAlert, XCircle } from 'lucide-react';
import { cn } from '@both/utils';
import { relativeTime } from '@both/utils';
import { motion } from 'framer-motion';

interface Alert {
  id: string;
  type: string;
  severity: string;
  message: string;
  isActive: boolean;
  startedAt: string;
  city?: { name: string; state?: string };
}

interface AlertsBannerProps {
  alerts: Alert[];
  maxVisible?: number;
}

const severityConfig: Record<string, { icon: React.ElementType; bg: string; border: string; text: string }> = {
  LOW: { icon: Info, bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400' },
  MEDIUM: { icon: AlertTriangle, bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-400' },
  HIGH: { icon: ShieldAlert, bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400' },
  CRITICAL: { icon: XCircle, bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400' },
};

export default function AlertsBanner({ alerts, maxVisible = 3 }: AlertsBannerProps) {
  if (!alerts || alerts.length === 0) return null;

  const visibleAlerts = alerts.slice(0, maxVisible);
  const remaining = alerts.length - maxVisible;

  return (
    <div className="space-y-3">
      {visibleAlerts.map((alert, index) => {
        const config = severityConfig[alert.severity] || severityConfig.MEDIUM;
        const Icon = config.icon;

        return (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              'flex items-start gap-3 p-4 rounded-xl border',
              config.bg,
              config.border
            )}
          >
            <Icon className={cn('w-5 h-5 mt-0.5 shrink-0', config.text)} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                {alert.city && (
                  <span className={cn('text-sm font-semibold', config.text)}>
                    {alert.city.name}
                  </span>
                )}
                <span className={cn(
                  'text-[10px] font-medium px-1.5 py-0.5 rounded-full uppercase tracking-wider',
                  config.text,
                  alert.severity === 'CRITICAL' ? 'bg-red-500/20' : 'bg-white/5'
                )}>
                  {alert.severity}
                </span>
              </div>
              <p className="text-sm text-gray-300">{alert.message}</p>
              <p className="text-xs text-gray-400 mt-1">{relativeTime(alert.startedAt)}</p>
            </div>
          </motion.div>
        );
      })}
      {remaining > 0 && (
        <p className="text-sm text-gray-500 text-center">
          +{remaining} more active alert{remaining > 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
