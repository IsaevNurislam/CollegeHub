import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { useTranslation } from '../../i18n';

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText, cancelText, isDangerous = false }) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onCancel}></div>
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
          <div className="flex items-center gap-4 mb-4">
            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
              isDangerous ? 'bg-red-100' : 'bg-sky-100'
            }`}>
              <AlertCircle size={24} className={isDangerous ? 'text-red-600' : 'text-sky-600'} />
            </div>
            <button
              onClick={onCancel}
              className="ml-auto text-gray-400 hover:text-gray-600 transition"
            >
              <X size={24} />
            </button>
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 text-sm mb-6">{message}</p>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
            >
              {cancelText || t('common.cancel')}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-3 text-white rounded-lg transition font-medium ${
                isDangerous
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-sky-600 hover:bg-sky-700'
              }`}
            >
              {confirmText || t('common.create')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
