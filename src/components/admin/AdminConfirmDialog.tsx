import * as React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';

export interface AdminConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'destructive' | 'default';
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
}

export const AdminConfirmDialog: React.FC<AdminConfirmDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'destructive',
  loading = false,
  onConfirm,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={(val) => !loading && onOpenChange(val)}>
      <AlertDialogContent className="rounded-2xl max-w-[440px] p-6 border-border shadow-xl">
        <AlertDialogHeader className="space-y-2">
          <AlertDialogTitle className="text-lg font-semibold tracking-tight text-foreground">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6 flex items-center gap-2 sm:justify-end">
          <AlertDialogCancel
            disabled={loading}
            className="rounded-[10px] h-10 px-4 text-xs font-medium"
          >
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            onClick={(e) => {
              e.preventDefault();
              void onConfirm();
            }}
            className={`rounded-[10px] h-10 px-5 text-xs font-medium inline-flex items-center gap-2 ${
              variant === 'destructive'
                ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AdminConfirmDialog;
