import React from 'react';
import { PlusCircle } from 'lucide-react';
import { Card, Badge } from '../common/UI';
import EmptyState from '../common/EmptyState';
import { useTranslation } from '../../i18n';

export default function ProjectsView({ projects, joinedProjectIds = [], onAddProject, onJoinProject = () => {} }) {
  const { t } = useTranslation();
  const hasProjects = Array.isArray(projects) && projects.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{t('projects.heading')}</h2>
          <p className="text-gray-500 text-sm">{t('projects.subtitle')}</p>
        </div>
        <button onClick={onAddProject} className="w-full sm:w-auto bg-sky-600 text-white px-4 py-2 rounded-lg flex items-center justify-center sm:justify-start gap-2 hover:bg-sky-700">
          <PlusCircle size={18} /> {t('projects.add')}
        </button>
      </div>

      {hasProjects ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => {
            const isJoined = joinedProjectIds.includes(project.id);
            const needed = Array.isArray(project.needed) ? project.needed : [];
            const neededKeys = Array.isArray(project.neededKeys) ? project.neededKeys : [];
            const neededDisplay = (neededKeys.length ? neededKeys : needed).map((value) =>
              neededKeys.length ? t(value) : value
            );

            return (
              <Card key={project.id} className="border-l-4 border-l-sky-500">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg text-gray-900 truncate pr-2">
                    {project.titleKey ? t(project.titleKey) : project.title}
                  </h3>
                  <Badge color="bg-green-100 text-green-700">
                    {t(`projects.statuses.${project.status}`) !== `projects.statuses.${project.status}`
                      ? t(`projects.statuses.${project.status}`)
                      : project.status}
                  </Badge>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold">{t('projects.labels.author')}</span> {project.author}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold">{t('projects.labels.needed')}</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {needed.map((role, idx) => (
                        <span key={`${role}-${idx}`} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs border">
                          {neededKeys[idx] ? t(neededKeys[idx]) : role}
                        </span>
                      ))}
                    </div>
                    <div className="mt-2 text-xs text-gray-500">{neededDisplay.join(', ')}</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
                  <button className="text-sky-600 text-sm font-medium hover:underline">{t('projects.details')}</button>
                  <button
                    type="button"
                    onClick={() => { if (!isJoined) onJoinProject(project.id); }}
                    disabled={isJoined}
                    className={`px-3 py-1.5 rounded-lg text-white text-xs font-semibold transition ${isJoined ? 'bg-slate-300 cursor-not-allowed' : 'bg-sky-600 hover:bg-sky-700'}`}
                  >
                    {isJoined ? t('projects.labels.team') : t('projects.join_button')}
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState className="min-h-[40vh]" />
      )}
    </div>
  );
}