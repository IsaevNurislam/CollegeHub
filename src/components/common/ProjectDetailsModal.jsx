import React from 'react';
import { X } from 'lucide-react';
import { useTranslation } from '../../i18n';

export default function ProjectDetailsModal({ project, onClose }) {
  const { t } = useTranslation();

  if (!project) return null;

  const statusLabel = project.status ? t(`projects.statuses.${project.status}`) : project.status;
  const neededRoles = Array.isArray(project.needed) && project.needed.length > 0 ? project.needed.join(', ') : t('projects.labels.team');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-gray-100 overflow-hidden">
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">{t('projects.details')}</p>
            <h2 className="text-2xl font-bold text-gray-900">{project.title || project.name}</h2>
            {project.author && (
              <p className="text-sm text-gray-500 mt-1">
                <span className="font-semibold text-gray-700">{t('projects.labels.author')}</span>
                {' '}
                {project.author}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition"
            aria-label={t('common.close')}
          >
            <X size={20} />
          </button>
        </div>
        {project.backgroundUrl && (
          <div className="h-40 w-full overflow-hidden">
            <img src={project.backgroundUrl} alt={project.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="px-6 py-5 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">{t('projects.form.status')}</p>
            <p className="text-lg font-semibold text-gray-900">{statusLabel || t('projects.statuses.developing')}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">{t('projects.labels.needed')}</p>
            <p className="text-sm text-gray-700">{neededRoles}</p>
          </div>
          {project.description && (
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">{t('projects.details')}</p>
              <p className="text-sm text-gray-700 leading-relaxed break-words">{project.description}</p>
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
