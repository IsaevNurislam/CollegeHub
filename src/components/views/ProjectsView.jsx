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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const isJoined = joinedProjectIds.includes(project.id);
            const needed = Array.isArray(project.needed) ? project.needed : [];
            const neededKeys = Array.isArray(project.neededKeys) ? project.neededKeys : [];

            const headerStyle = project.backgroundUrl
              ? {
                  backgroundImage: `url(${project.backgroundUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }
              : undefined;

            return (
              <Card key={project.id} className="hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">
                <div
                  className="h-32 rounded-t-lg -mx-6 -mt-6 relative mb-4 flex-shrink-0"
                  style={headerStyle}
                >
                  {!project.backgroundUrl && (
                    <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-sky-600" />
                  )}
                </div>

                <div className="flex flex-col flex-grow">
                  <h3 className="font-bold text-lg text-gray-900 line-clamp-2 mb-1">
                    {project.titleKey ? t(project.titleKey) : project.title}
                  </h3>
                  <div className="flex items-center justify-between mb-3 gap-2">
                    <Badge color="bg-green-100 text-green-700" className="text-xs flex-shrink-0">
                      {t(`projects.statuses.${project.status}`) !== `projects.statuses.${project.status}`
                        ? t(`projects.statuses.${project.status}`)
                        : project.status}
                    </Badge>
                  </div>

                  <div className="text-xs text-gray-600 mb-2">
                    <span className="font-semibold">{t('projects.labels.author')}:</span> {project.author}
                  </div>

                  <div className="text-xs text-gray-600 mb-3">
                    <span className="font-semibold">{t('projects.labels.needed')}:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {needed.map((role, idx) => (
                        <span key={`${role}-${idx}`} className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs">
                          {neededKeys[idx] ? t(neededKeys[idx]) : role}
                        </span>
                      ))}
                    </div>
                  </div>

                  {project.description && (
                    <div className="text-sm text-gray-700 mb-3 line-clamp-2">
                      <span className="font-semibold">Описание:</span> {project.description}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => { if (!isJoined) onJoinProject(project.id); }}
                    disabled={isJoined}
                    className={`w-full px-3 py-1.5 rounded-lg text-white text-xs font-semibold transition flex-shrink-0 ${isJoined ? 'bg-slate-300 cursor-not-allowed' : 'bg-sky-600 hover:bg-sky-700'}`}
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