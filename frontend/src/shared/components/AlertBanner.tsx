import { AlertCircle, CheckCircle2, X } from 'lucide-react';

interface AlertBannerProps {
  type: 'success' | 'error';
  message: string;
  onClose?: () => void;
}

export function AlertBanner({ type, message, onClose }: AlertBannerProps) {
  const isSuccess = type === 'success';

  return (
    <div
      role="alert"
      className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-xs ${
        isSuccess
          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
          : 'border-rose-200 bg-rose-50 text-rose-800'
      }`}
    >
      <div className="flex items-start gap-2.5">
        {isSuccess ? (
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
        ) : (
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
        )}
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 opacity-70 transition hover:bg-black/5 hover:opacity-100"
          aria-label="Fechar aviso"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

