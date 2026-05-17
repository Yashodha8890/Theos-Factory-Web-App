import { X } from 'lucide-react';

const Modal = ({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  danger = false,
  children,
  maxWidth = 'max-w-md',
}) => (
  <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/55 px-5 backdrop-blur-sm">
    <section className={`card w-full ${maxWidth} p-6 shadow-lift`}>
      <div className="flex items-start justify-between gap-6">
        <div>
          <h2 className="display text-2xl font-bold">{title}</h2>
          <p className="mt-3 text-sm leading-6 muted">{message}</p>
        </div>
        <button type="button" onClick={onCancel} className="btn-outline h-9 w-9 shrink-0 px-0" aria-label="Close modal">
          <X size={16} />
        </button>
      </div>
      {children && <div className="mt-6">{children}</div>}
      <div className="mt-8 grid grid-cols-2 gap-3">
        <button type="button" onClick={onCancel} className="btn-outline">{cancelText}</button>
        <button type="button" onClick={onConfirm} className={danger ? 'btn bg-red-600 text-white hover:bg-red-700' : 'btn-primary'}>
          {confirmText}
        </button>
      </div>
    </section>
  </div>
);

export default Modal;
