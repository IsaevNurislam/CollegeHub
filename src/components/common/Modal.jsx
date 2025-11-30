import React from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, title, onClose, onSubmit, children, primaryLabel = 'Создать', primaryDisabled = false }) {
  if (!isOpen) return null;

  const stopPropagation = (event) => event.stopPropagation();

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] flex flex-col"
        onClick={stopPropagation}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {children}
        </div>
        <div className="flex gap-3 justify-end p-6 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Отмена
          </button>
          <button
            onClick={onSubmit}
            className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition disabled:opacity-60"
            disabled={primaryDisabled}
          >
            {primaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
