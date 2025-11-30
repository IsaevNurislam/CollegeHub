import React from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

export default function Notification({ notifications, onRemove }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className={`flex items-start gap-3 p-4 rounded-lg shadow-lg animate-in slide-in-from-right ${
            notif.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : notif.type === 'error'
              ? 'bg-red-50 border border-red-200'
              : 'bg-blue-50 border border-blue-200'
          }`}
        >
          <div className="flex-shrink-0 mt-0.5">
            {notif.type === 'success' && <CheckCircle className="text-green-600" size={20} />}
            {notif.type === 'error' && <AlertCircle className="text-red-600" size={20} />}
            {notif.type === 'info' && <AlertCircle className="text-blue-600" size={20} />}
          </div>
          <div className="flex-1 min-w-0">
            <p
              className={`text-sm font-medium ${
                notif.type === 'success'
                  ? 'text-green-900'
                  : notif.type === 'error'
                  ? 'text-red-900'
                  : 'text-blue-900'
              }`}
            >
              {notif.message}
            </p>
          </div>
          <button
            onClick={() => onRemove(notif.id)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition"
          >
            <X size={18} />
          </button>
        </div>
      ))}
    </div>
  );
}
