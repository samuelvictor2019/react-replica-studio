import * as React from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface PublicSuccessViewProps {
  title?: string;
  subtitle?: string;
  description: string;
  actionLabel?: string;
  actionText?: string;
  onAction?: () => void;
  homeLink?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export const PublicSuccessView: React.FC<PublicSuccessViewProps> = ({
  title = 'Thank You',
  subtitle = 'Submission Received',
  description,
  actionLabel,
  actionText,
  onAction,
  homeLink = true,
  children,
  className = '',
}) => {
  const resolvedActionLabel = actionText ?? actionLabel ?? 'SEND ANOTHER MESSAGE';
  return (
    <div
      role="status"
      className={`w-full max-w-2xl mx-auto rounded-[28px] bg-[#edf2ff] p-8 md:p-12 text-center shadow-sm border border-black/5 animate-in zoom-in-95 duration-300 ${className}`}
    >
      <div className="w-16 h-16 rounded-full bg-[#0f1b37] text-white flex items-center justify-center mx-auto mb-6 shadow-md">
        <Check className="w-8 h-8 stroke-[2.5]" />
      </div>
      {subtitle && (
        <p className="text-xs uppercase tracking-[0.2em] font-medium text-black/60 mb-2">
          {subtitle}
        </p>
      )}
      <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-medium text-black mb-4">
        {title}
      </h2>
      <p className="text-xs sm:text-sm text-black/75 max-w-lg mx-auto leading-relaxed">
        {description}
      </p>

      {children && <div className="mt-6">{children}</div>}

      <div className="mt-8 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3">
        {onAction && (
          <Button
            type="button"
            onClick={onAction}
            className="h-11 shrink-0 whitespace-nowrap px-7 rounded-full bg-[#0f1b37] text-white hover:bg-[#17284f] text-[12px] tracking-widest font-medium"
          >
            {resolvedActionLabel}
          </Button>
        )}
        {homeLink && (
          <a
            href="/"
            className="h-11 shrink-0 whitespace-nowrap px-6 rounded-full border border-black/15 bg-white/60 hover:bg-white text-black text-[12px] tracking-widest font-medium inline-flex items-center justify-center transition-colors"
          >
            RETURN HOME
          </a>
        )}
      </div>
    </div>
  );
};

export default PublicSuccessView;
