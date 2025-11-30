import React from 'react';
import { PlusCircle } from 'lucide-react';
import { Card, Badge } from '../common/UI';
import EmptyState from '../common/EmptyState';
import { useTranslation } from '../../i18n';

export default function ClubsView({ clubs, onCreateClub, joinedClubs = [], onJoinClub, onViewClub }) {
  const { t } = useTranslation();
  const availableClubs = (clubs || []).filter((club) => !joinedClubs.includes(club.id));
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">{t('clubs.title')}</h2>
        <button onClick={onCreateClub} className="w-full sm:w-auto bg-sky-600 text-white px-4 py-2 rounded-lg flex items-center justify-center sm:justify-start gap-2 hover:bg-sky-700 transition">
          <PlusCircle size={18} /> {t('clubs.create')}
        </button>
      </div>

      {availableClubs.length === 0 ? (
        <EmptyState className="min-h-[40vh]" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableClubs.map((club) => {
            const headerStyle = club.backgroundUrl
              ? {
                  backgroundImage: `url(${club.backgroundUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }
              : undefined;

            return (
              <Card
                key={club.id}
                onClick={() => onViewClub?.(club)}
                className="hover:shadow-lg transition-all duration-300 group cursor-pointer relative overflow-visible flex flex-col"
              >
                <div
                  className="h-24 rounded-t-lg -mx-6 -mt-6 relative mb-6 overflow-hidden flex-shrink-0"
                  style={headerStyle}
                >
                  {!club.backgroundUrl && (
                    <div className={`${club.color} absolute inset-0`} />
                  )}
                </div>
                {club.clubAvatar ? (
                  <div className="absolute top-16 left-6 h-14 w-14 rounded-full border-3 border-white overflow-hidden shadow-lg flex-shrink-0">
                    <img src={club.clubAvatar} alt={club.name} className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="absolute top-16 left-6 w-14 h-14 bg-white rounded-full p-1 shadow-lg flex-shrink-0">
                    <div className={`w-full h-full rounded-full ${club.color} opacity-80 flex items-center justify-center text-white font-bold text-lg`}>
                      {club.name[0]}
                    </div>
                  </div>
                )}
                <div className="pt-2 flex flex-col flex-grow">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0 pr-2">
                      <h3 className="font-bold text-lg text-gray-900 truncate">{club.name}</h3>
                      <p className="text-sm text-gray-500">
                        {club.categoryKey
                          ? t(club.categoryKey)
                          : t(`clubs.categories.${club.category}`) !== `clubs.categories.${club.category}`
                            ? t(`clubs.categories.${club.category}`)
                            : club.category}
                      </p>
                    </div>
                    <Badge>{club.members} {t('clubs.members_label')}</Badge>
                  </div>
                  <p className="text-gray-600 mt-3 text-sm h-10 overflow-hidden line-clamp-2 flex-grow">
                    {club.descriptionKey ? t(club.descriptionKey) : club.description}
                  </p>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      if (joinedClubs.includes(club.id)) {
                        onViewClub?.(club);
                      } else {
                        onJoinClub(club.id);
                      }
                    }}
                    className={`w-full mt-4 border border-sky-600 py-2 rounded-lg transition-colors font-medium text-sm flex-shrink-0 ${
                      joinedClubs.includes(club.id)
                        ? 'bg-sky-600 text-white cursor-pointer hover:bg-sky-700'
                        : 'text-sky-600 hover:bg-sky-600 hover:text-white'
                    }`}
                  >
                    {joinedClubs.includes(club.id) ? t('clubs.joined') : t('clubs.join')}
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}