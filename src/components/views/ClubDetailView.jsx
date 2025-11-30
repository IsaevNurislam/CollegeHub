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

export default function ClubDetailView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [club, setClub] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const loadClub = async () => {
      try {
        if (!cancelled) setError('');
        const data = await clubsService.getById(id);
        if (!cancelled) {
          setClub(data);
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setError(err?.message || 'Не удалось загрузить клуб');
        }
      }
    };
    loadClub();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const loading = ((!club || club.id?.toString() !== id) && !error);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm text-gray-500">{t('clubs.detail.loading')}</div>
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

  if (!club) {
    return null;
  }

  const socials = Object.entries(club.socialLinks || {}).filter(([, value]) => !!value);
  const heroStyle = club.backgroundUrl ? {
    backgroundImage: `url(${club.backgroundUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  } : undefined;
  const categoryLabel = club.categoryKey
    ? t(club.categoryKey)
    : (() => {
      const fallbackKey = `clubs.categories.${club.category}`;
      const fallback = t(fallbackKey);
      return fallback !== fallbackKey ? fallback : club.category;
    })();

  return (
    <div className="space-y-6">
      <div className="rounded-3xl overflow-hidden border border-gray-100">
        <div className="relative h-48" style={heroStyle}>
          {!club.backgroundUrl && (
            <div className={`${club.color || 'bg-sky-600'} absolute inset-0`} />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/0 to-black/60" />
          <div className="absolute inset-0 px-6 py-5 flex flex-col justify-end text-white">
            <p className="text-xs uppercase tracking-wider">{categoryLabel}</p>
            <h1 className="text-3xl font-bold leading-tight">{club.name}</h1>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-3 text-sm text-gray-500">
          <span>{t('clubs.detail.creator_label')}: {club.creator?.name || '—'}</span>
          <span>{t('clubs.detail.created_at_label')}: {formatDate(club.createdAt)}</span>
          <Badge>{club.members ?? 0} {t('clubs.members_label')}</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate('/clubs')}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition"
          >
            {t('clubs.detail.back_button')}
          </button>
          {club.canManageMembers && (
            <button
              onClick={() => navigate(`/club/${club.id}/members`)}
              className="px-4 py-2 rounded-lg bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 transition"
            >
              {t('clubs.detail.members_button')}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 space-y-5">
          <div className="space-y-3">
            <p className="text-sm text-gray-500 font-semibold">{club.description || '—'}</p>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              {club.creator?.avatar && (
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-white font-bold">
                  {club.creator.avatar}
                </div>
              )}
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500">{t('clubs.detail.creator_label')}</p>
                <p className="font-semibold text-gray-900">{club.creator?.name || '—'}</p>
                <p className="text-xs text-gray-500">{club.creator?.username || '—'}</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">{t('clubs.detail.social_heading')}</p>
            {socials.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {socials.map(([key, value]) => (
                  <a
                    key={key}
                    href={value}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-sky-500 hover:text-sky-600 transition"
                  >
                    <span>{t(`clubs.contact_labels.${key}`, key)}</span>
                    <span className="text-xs text-gray-400">{value.replace(/^https?:\/\//, '')}</span>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">{t('clubs.detail.no_socials')}</p>
            )}
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">{t('clubs.detail.photos_heading')}</p>
            {club.photos && club.photos.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {club.photos.map((photo, idx) => (
                  <div key={idx} className="rounded-lg overflow-hidden border border-gray-200">
                    <img src={photo} alt={`${club.name} ${idx + 1}`} className="w-full h-32 object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                {t('clubs.detail.no_photos')}
              </div>
            )}
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-600">{t('clubs.detail.activity_heading')}</h3>
            <Badge>{club.recentActivity?.length ?? 0}</Badge>
          </div>
          {club.recentActivity && club.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {club.recentActivity.map((item) => (
                <div key={item.id} className="text-sm text-gray-700 space-y-1">
                  <p className="font-semibold text-gray-900 truncate">{item.action}</p>
                  <p className="text-xs text-gray-500 truncate">{item.detail}</p>
                  <p className="text-xs text-gray-400">{item.date || item.createdAt}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">{t('clubs.detail.no_activity')}</p>
          )}
        </Card>
      </div>
    </div>
  );
}
