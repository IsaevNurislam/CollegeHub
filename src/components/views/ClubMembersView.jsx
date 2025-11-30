import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Badge } from '../common/UI';
import { useTranslation } from '../../i18n';
import { clubsService } from '../../api/services';

const formatDate = (value) => {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return value;
  }
};

export default function ClubMembersView({ projects = [], addNotification }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [club, setClub] = useState(null);
  const [members, setMembers] = useState([]);
  const [error, setError] = useState('');
  const [removing, setRemoving] = useState(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const load = async () => {
      try {
        if (!cancelled) setError('');
        const [clubDetail, clubMembers] = await Promise.all([
          clubsService.getById(id),
          clubsService.getMembers(id)
        ]);
        if (!cancelled) {
          setClub(clubDetail);
          setMembers(clubMembers);
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setError(err?.message || 'Не удалось загрузить участников');
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const loading = ((!club || club.id?.toString() !== id) && !error);
  const clubProjects = projects.filter((project) => project.clubId?.toString() === id);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm text-gray-500">{t('clubs.members.loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="text-center text-sm text-red-600">
        {error}
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-500">{t('clubs.members.heading')}</p>
          <h1 className="text-2xl font-bold text-gray-900">{club?.name}</h1>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <Badge>{club?.members ?? 0} {t('clubs.members_label')}</Badge>
            <span>{formatDate(club?.createdAt)}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/club/${id}`)}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-100"
          >
            {t('clubs.detail.back_button')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">{t('clubs.members.participants_title')}</h2>
          {members.length === 0 ? (
            <p className="text-sm text-gray-500">{t('clubs.members.empty')}</p>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between gap-3 p-3 border border-gray-100 rounded-lg bg-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-gray-700 font-semibold">
                      {member.avatar || member.name?.[0] || '?'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 truncate">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.studentId}</p>
                      <p className="text-xs text-gray-400">{formatDate(member.joinedAt)}</p>
                    </div>
                  </div>
                  <button
                    disabled={removing === member.id}
                    onClick={() => {
                      setRemoving(member.id);
                      clubsService.removeMember(id, member.id)
                        .then(() => {
                          setMembers(prev => prev.filter(item => item.id !== member.id));
                          addNotification?.(t('clubs.members.removed_success'), 'success');
                        })
                        .catch((err) => {
                          console.error(err);
                          addNotification?.(t('clubs.members.removed_error'), 'error');
                        })
                        .finally(() => setRemoving(null));
                    }}
                    className="px-3 py-1.5 text-xs rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('clubs.members.remove')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">{t('clubs.members.projects_title')}</h2>
            <Badge>{clubProjects.length}</Badge>
          </div>
          {clubProjects.length === 0 ? (
            <p className="text-sm text-gray-500">{t('clubs.members.no_projects')}</p>
          ) : (
            <div className="space-y-3">
              {clubProjects.map(project => (
                <div key={project.id} className="border-b pb-3 last:border-b-0">
                  <p className="font-semibold text-gray-900">{project.title}</p>
                  <p className="text-xs text-gray-500">{project.status}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
