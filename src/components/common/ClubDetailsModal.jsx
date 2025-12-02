import React from 'react';
import { X, Users } from 'lucide-react';
import { useTranslation } from '../../i18n';

const contactMap = [
  { key: 'instagram', labelKey: 'clubs.contact_labels.instagram' },
  { key: 'telegram', labelKey: 'clubs.contact_labels.telegram' },
  { key: 'whatsapp', labelKey: 'clubs.contact_labels.whatsapp' },
];

const getCategoryLabel = (t, club) => {
  if (!club) return '';
  if (club.categoryKey) return t(club.categoryKey);
  const fallbackKey = `clubs.categories.${club.category}`;
  const fallback = t(fallbackKey);
  return fallback !== fallbackKey ? fallback : club.category;
};

const getDescriptionText = (t, club) => {
  if (!club) return '';
  if (club.descriptionKey) return t(club.descriptionKey);
  return club.description || '';
};

export default function ClubDetailsModal({ club, onClose }) {
  const { t } = useTranslation();
  if (!club) return null;

  const categoryLabel = getCategoryLabel(t, club);
  const description = getDescriptionText(t, club);
  const memberCount = club.members ?? 0;

  const headerStyle = club.backgroundUrl
    ? {
        backgroundImage: `url(${club.backgroundUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    : undefined;

  const contacts = contactMap
    .map((item) => {
      const value = club[item.key];
      if (!value) return null;
      return {
        key: item.key,
        label: t(item.labelKey),
        value,
      };
    })
    .filter(Boolean);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-gray-100 overflow-hidden">
        <div
          className="h-32 relative"
          style={headerStyle}
        >
          {!club.backgroundUrl && (
            <div className={`${club.color} absolute inset-0`} />
          )}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white hover:bg-gray-100 transition shadow-lg"
            aria-label={t('common.close')}
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 pb-5 relative">
          {club.clubAvatar ? (
            <div className="absolute -top-7 left-6 h-16 w-16 rounded-full border-4 border-white overflow-hidden shadow-lg flex-shrink-0">
              <img src={club.clubAvatar} alt={club.name} className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="absolute -top-7 left-6 w-16 h-16 bg-white rounded-full p-1 shadow-lg flex-shrink-0 border-4 border-white">
              <div className={`w-full h-full rounded-full ${club.color} flex items-center justify-center text-white font-bold text-2xl`}>
                {club.name[0]}
              </div>
            </div>
          )}

          <div className="pt-10">
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">{categoryLabel}</p>
            <h2 className="text-2xl font-bold text-gray-900">{club.name}</h2>
          </div>

          <div className="pt-5 space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users size={18} className="text-sky-500" />
              <span className="font-semibold text-gray-900">{memberCount}</span>
              <span>{t('clubs.members_label')}</span>
            </div>
            <p className="text-gray-700 leading-relaxed break-words">{description}</p>
            {contacts.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-gray-500">{t('clubs.details_contacts')}</p>
                <div className="space-y-1">
                  {contacts.map((contact) => (
                    <div key={contact.key} className="flex justify-between text-sm text-gray-700">
                      <span className="text-gray-500">{contact.label}</span>
                      <span className="font-medium text-gray-900">{contact.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-5 border-t border-gray-100 flex justify-end mt-5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
