'use client';

import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

export type ToastTone = 'success' | 'info' | 'warning';

export type ToastMessage = {
  id: string;
  tone: ToastTone;
  text: string;
};

const TONE_STYLES: Record<ToastTone, { wrap: string; icon: typeof Info }> = {
  success: { wrap: 'border-teal-500/30 bg-white text-ink', icon: CheckCircle2 },
  info: { wrap: 'border-brand-300 bg-white text-ink', icon: Info },
  warning: { wrap: 'border-danger-200 bg-danger-50 text-ink', icon: AlertTriangle },
};

const ICON_TONE: Record<ToastTone, string> = {
  success: 'text-teal-600',
  info: 'text-brand-600',
  warning: 'text-danger-600',
};

export function Toast({
  toast,
  onDismiss,
}: {
  toast: ToastMessage | null;
  onDismiss: () => void;
}) {
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(onDismiss, 4500);
    return () => window.clearTimeout(timer);
  }, [toast, onDismiss]);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="print-hide pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 sm:bottom-6"
    >
      {toast ? (
        <div
          className={cn(
            'pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-xl border px-4 py-3 shadow-card',
            TONE_STYLES[toast.tone].wrap
          )}
        >
          {(() => {
            const Icon = TONE_STYLES[toast.tone].icon;
            return (
              <Icon
                className={cn('mt-0.5 h-5 w-5 shrink-0', ICON_TONE[toast.tone])}
                aria-hidden="true"
              />
            );
          })()}
          <p className="flex-1 text-sm leading-snug">{toast.text}</p>
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-md p-1 text-muted transition-colors hover:bg-black/[0.05] hover:text-ink"
            aria-label="Dismiss message"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
