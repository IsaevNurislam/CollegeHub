import React, { useEffect, useState } from 'react';
import { Card } from '../common/UI';
import { useTranslation } from '../../i18n';
import { parliamentService } from '../../api/services';

const renderAvatar = (member) => {
  const avatarValue = member.avatarUrl || member.avatar;
  if (avatarValue) {
    return (
      <img
        src={avatarValue}
        alt={member.name}
        className="w-14 h-14 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center font-semibold text-sky-600 text-lg">
      {member.name?.[0] || 'П'}
    </div>
  );
};

export default function ParliamentView() {
  const { t } = useTranslation();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadMembers = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await parliamentService.getAll();
        setMembers(response || []);
      } catch (fetchError) {
        console.error('Failed to load parliament members', fetchError);
        setError(t('parliament.error') || 'Не удалось загрузить парламент');
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, [t]);

  const displayName = (member) =>
    member.fullName || member.name || `${member.firstName || ''} ${member.lastName || ''}`.trim() || '-';

  const labelText = (member) => {
    const role = member.role?.trim();
    const position = member.position?.trim();
    if (position && role && position !== role) {
      return (
        <>
          <p className="text-sm font-semibold text-gray-900">{position}</p>
          <p className="text-xs text-gray-500">{role}</p>
        </>
      );
    }
    return role ? <p className="text-sm text-gray-600">{role}</p> : null;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{t('parliament.title')}</h2>
        <p className="text-xs sm:text-sm text-gray-500 max-w-2xl">{t('parliament.info')}</p>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {loading ? (
        <p className="text-sm text-gray-500">{t('parliament.loading')}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.length === 0 ? (
            <Card className="p-6 text-center text-sm text-gray-500">
              {t('parliament.no_members')}
            </Card>
          ) : (
            members.map((member) => (
              <Card key={member.id} className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  {renderAvatar(member)}
                  <div className="min-w-0 space-y-0.5">
                    <h3 className="text-base font-semibold text-gray-900 truncate">{displayName(member)}</h3>
                    {labelText(member)}
                    {member.groupName && (
                      <p className="text-xs text-gray-400 truncate">{member.groupName}</p>
                    )}
                  </div>
                </div>
                {member.description && <p className="text-sm text-gray-600">{member.description}</p>}
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
