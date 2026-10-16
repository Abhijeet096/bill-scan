'use client';

import { Modal } from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
}) => (
  <Modal open={open} title={title} onClose={onCancel} width="sm:max-w-md">
    <p className="text-sm text-muted">{message}</p>
    <div className="mt-6 flex justify-end gap-2">
      <button className="btn-secondary" onClick={onCancel}>
        Cancel
      </button>
      <button className="btn bg-bad text-white hover:opacity-90" onClick={onConfirm}>
        {confirmLabel}
      </button>
    </div>
  </Modal>
);
