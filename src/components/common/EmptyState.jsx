import React from 'react';
import { useTranslation } from '../../i18n';

export default function EmptyState({ message, className }) {
  const { t } = useTranslation();
  const content = message || t('common.empty_state');

  return (
    <div className={`min-h-[40vh] flex flex-col items-center justify-center text-center px-4 ${className || ''}`}>
      <p className="text-3xl font-semibold text-gray-400 tracking-wide">{content}</p>
    </div>
  );
}
