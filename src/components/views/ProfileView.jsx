import React, { useState, useMemo } from 'react';
import { User, Mail, Briefcase, AlertCircle, Check, Clock } from 'lucide-react';
import { Card } from '../common/UI';
import { useTranslation } from '../../i18n';

// Check if user can edit name (once per week)
const canEditName = (lastNameChangeDate) => {
  if (!lastNameChangeDate) return true;
  const lastChange = new Date(lastNameChangeDate);
  const now = new Date();
  const daysSinceChange = Math.floor((now - lastChange) / (1000 * 60 * 60 * 24));
  return daysSinceChange >= 7;
};

// Get days remaining until next name change
const getDaysUntilNextChange = (lastNameChangeDate) => {
  if (!lastNameChangeDate) return 0;
  const lastChange = new Date(lastNameChangeDate);
  const now = new Date();
  const daysSinceChange = Math.floor((now - lastChange) / (1000 * 60 * 60 * 24));
  return Math.max(0, 7 - daysSinceChange);
};

export default function ProfileView({ user, onUpdateUser }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user.firstName || user.name?.split(' ')[0] || '',
    lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
    studentId: user.studentId || '',
    role: user.role || '',
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { t } = useTranslation();

  const canEdit = useMemo(() => canEditName(user.lastNameChangeDate), [user.lastNameChangeDate]);
  const daysRemaining = useMemo(() => getDaysUntilNextChange(user.lastNameChangeDate), [user.lastNameChangeDate]);

  React.useEffect(() => {
    if (user.roleKey) {
      setFormData((fd) => ({ ...fd, role: t(user.roleKey) }));
    }
  }, [user.roleKey, t]);

  // Update form when user changes
  React.useEffect(() => {
    setFormData({
      firstName: user.firstName || user.name?.split(' ')[0] || '',
      lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
      studentId: user.studentId || '',
      role: user.role || '',
    });
  }, [user]);

  const capitalizeFirstLetter = (value) => {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  const displayName = user.name || `${formData.firstName} ${formData.lastName}`.trim();

  const validateInputs = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = t('login.errors.required') || 'Обязательное поле';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = t('login.errors.min_chars') || 'Минимум 2 символа';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = t('login.errors.required') || 'Обязательное поле';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = t('login.errors.min_chars') || 'Минимум 2 символа';
    }
    
    return newErrors;
  };

  const handleSave = async () => {
    const newErrors = validateInputs();
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsSaving(true);
      try {
        const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;
        const hasNameChanged = fullName !== displayName;
        
        await onUpdateUser({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          name: fullName,
          // Only update lastNameChangeDate if name actually changed
          ...(hasNameChanged && { lastNameChangeDate: new Date().toISOString() }),
        });
        
        setSuccess(t('profile.save_success') || 'Профиль успешно обновлён');
        setIsEditing(false);
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        console.error('Failed to save profile:', error);
        setErrors({ general: error?.message || 'Не удалось сохранить профиль' });
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user.firstName || user.name?.split(' ')[0] || '',
      lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
      studentId: user.studentId || '',
      role: user.role || '',
    });
    setErrors({});
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('profile.title') || 'Профиль'}</h2>

      <Card>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-2xl overflow-hidden">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                user.avatar || displayName?.[0] || 'U'
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{displayName}</h3>
              <p className="text-gray-600">ID: {user.studentId}</p>
            </div>
          </div>
          {canEdit ? (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-sky-100 text-sky-600 rounded-lg hover:bg-sky-200 transition font-medium"
            >
              {isEditing ? (t('common.cancel') || 'Отмена') : (t('profile.edit') || 'Редактировать')}
            </button>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-500 rounded-lg">
              <Clock size={16} />
              <span className="text-sm">
                {daysRemaining} {daysRemaining === 1 ? 'день' : daysRemaining < 5 ? 'дня' : 'дней'} до изменения
              </span>
            </div>
          )}
        </div>

        {!canEdit && !isEditing && (
          <div className="mb-6 flex items-center gap-2 p-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg">
            <Clock size={20} />
            <span>Вы можете изменить имя и фамилию раз в неделю. Следующее изменение будет доступно через {daysRemaining} {daysRemaining === 1 ? 'день' : daysRemaining < 5 ? 'дня' : 'дней'}.</span>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-center gap-2 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            <Check size={20} />
            {success}
          </div>
        )}

        {errors.general && (
          <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            <AlertCircle size={20} />
            {errors.general}
          </div>
        )}

        {isEditing ? (
          <div className="space-y-6 border-t pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <User size={16} />
                    {t('profile.first_name') || 'Имя'}
                  </div>
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => {
                    const capitalized = capitalizeFirstLetter(e.target.value);
                    setFormData({ ...formData, firstName: capitalized });
                    if (errors.firstName) setErrors({ ...errors, firstName: '' });
                  }}
                  placeholder="Введите имя"
                  className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-sky-500 outline-none transition text-gray-900 bg-white ${
                    errors.firstName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-sky-500'
                  }`}
                />
                {errors.firstName && (
                  <div className="flex items-center gap-1 text-red-500 text-sm mt-2">
                    <AlertCircle size={16} />
                    {errors.firstName}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <User size={16} />
                    {t('profile.last_name') || 'Фамилия'}
                  </div>
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => {
                    const capitalized = capitalizeFirstLetter(e.target.value);
                    setFormData({ ...formData, lastName: capitalized });
                    if (errors.lastName) setErrors({ ...errors, lastName: '' });
                  }}
                  placeholder="Введите фамилию"
                  className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-sky-500 outline-none transition text-gray-900 bg-white ${
                    errors.lastName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-sky-500'
                  }`}
                />
                {errors.lastName && (
                  <div className="flex items-center gap-1 text-red-500 text-sm mt-2">
                    <AlertCircle size={16} />
                    {errors.lastName}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 px-4 py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Сохранение...
                  </span>
                ) : (
                  t('profile.save') || 'Сохранить'
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium disabled:opacity-50"
              >
                {t('common.cancel') || 'Отмена'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-600">
                <User size={18} />
                {t('profile.first_name') || 'Имя'}
              </div>
              <p className="font-medium text-gray-900">{formData.firstName || '-'}</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-600">
                <User size={18} />
                {t('profile.last_name') || 'Фамилия'}
              </div>
              <p className="font-medium text-gray-900">{formData.lastName || '-'}</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail size={18} />
                {t('profile.student_id_label') || 'Студенческий ID'}
              </div>
              <p className="font-medium text-gray-900">{formData.studentId}</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-600">
                <Briefcase size={18} />
                {t('profile.role_label') || 'Роль'}
              </div>
              <p className="font-medium text-gray-900">
                {user.roleKey ? t(user.roleKey) : (formData.role || (t('profile.not_specified') || 'Не указано'))}
              </p>
            </div>
            {user.lastNameChangeDate && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <Clock size={16} />
                  Последнее изменение имени
                </div>
                <p className="text-gray-500">
                  {new Date(user.lastNameChangeDate).toLocaleDateString('ru-RU')}
                </p>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
