import * as React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export interface PublicInlineAlertProps {
  type?: 'error' | 'success' | 'info';
  title?: string;
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export const PublicInlineAlert: React.FC<PublicInlineAlertProps> = ({
  type = 'error',
  title,
  message,
  onDismiss,
  className = '',
}) => {
  const styles = {
    error: {
      bg: 'bg-rose-50 border-rose-200 text-rose-950',
      icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />,
    },
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-950',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
    },
    info: {
      bg: 'bg-[#edf2ff] border-[#cbd6f0] text-[#0f1b37]',
      icon: <Info className="w-5 h-5 text-[#1b2545] shrink-0 mt-0.5" />,
    },
  }[type];

  return (
    <div
      role="alert"
      className={`rounded-2xl border p-4 flex items-start gap-3.5 text-xs sm:text-sm animate-in fade-in slide-in-from-top-1 duration-200 shadow-sm ${styles.bg} ${className}`}
    >
      {styles.icon}
      <div className="flex-1 space-y-0.5">
        {title && <p className="font-semibold tracking-wide">{title}</p>}
        <p className="leading-relaxed opacity-90">{message}</p>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="p-1 rounded-full hover:bg-black/5 text-black/60 hover:text-black transition-colors"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default PublicInlineAlert;
