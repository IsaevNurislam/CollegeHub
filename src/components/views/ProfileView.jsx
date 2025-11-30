import React, { useState } from 'react';
import { User, Mail, Briefcase, AlertCircle, Check } from 'lucide-react';
import { Card } from '../common/UI';
import { useTranslation } from '../../i18n';

export default function ProfileView({ user, onUpdateUser }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || '',
    studentId: user.studentId || '',
    role: user.role || '',
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const { t } = useTranslation();

  React.useEffect(() => {
    if (user.roleKey) {
      setFormData((fd) => ({ ...fd, role: t(user.roleKey) }));
    }
  }, [user.roleKey, t]);

  const capitalizeFirstLetter = (value) => {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  const validateInputs = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = t('login.errors.required');
    } else if (formData.name.trim().length < 2) {
      newErrors.name = t('login.errors.min_chars');
    }
    
    if (!formData.studentId.trim()) {
      newErrors.studentId = t('login.errors.required');
    } else if (!/^\d{6}$/.test(formData.studentId)) {
      newErrors.studentId = t('profile.student_id_invalid') || t('login.errors.id_invalid');
    }
    
    return newErrors;
  };

  const handleSave = () => {
    const newErrors = validateInputs();
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onUpdateUser(formData);
      setSuccess(t('profile.save_success'));
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || '',
      studentId: user.studentId || '',
      role: user.role || '',
    });
    setErrors({});
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('profile.title')}</h2>

      <Card>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-2xl">
              {user.avatar}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
              <p className="text-gray-600">ID: {user.studentId}</p>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-sky-100 text-sky-600 rounded-lg hover:bg-sky-200 transition font-medium"
          >
            {isEditing ? t('common.cancel') : t('profile.edit')}
          </button>
        </div>

        {success && (
          <div className="mb-6 flex items-center gap-2 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            <Check size={20} />
            {success}
          </div>
        )}

        {isEditing ? (
          <div className="space-y-6 border-t pt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <User size={16} />
                  {t('profile.full_name')}
                </div>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  const capitalized = capitalizeFirstLetter(e.target.value);
                  setFormData({ ...formData, name: capitalized });
                  if (errors.name) setErrors({ ...errors, name: '' });
                }}
                className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-sky-500 outline-none transition text-white bg-slate-800 ${
                  errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-sky-500'
                }`}
              />
              {errors.name && (
                <div className="flex items-center gap-1 text-red-500 text-sm mt-2">
                  <AlertCircle size={16} />
                  {errors.name}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Mail size={16} />
                  {t('profile.student_id_label')}
                </div>
              </label>
              <input
                type="text"
                value={formData.studentId}
                onChange={(e) => {
                  setFormData({ ...formData, studentId: e.target.value });
                  if (errors.studentId) setErrors({ ...errors, studentId: '' });
                }}
                placeholder={t('login.student_id_placeholder')}
                className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-sky-500 outline-none transition text-white bg-slate-800 ${
                  errors.studentId ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-sky-500'
                }`}
              />
              {errors.studentId && (
                <div className="flex items-center gap-1 text-red-500 text-sm mt-2">
                  <AlertCircle size={16} />
                  {errors.studentId}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Briefcase size={16} />
                  {t('profile.role_label')}
                </div>
              </label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder={t('profile.placeholder_role')}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition text-white bg-slate-800"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition font-medium"
              >
                {t('profile.save')}
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-600">
                <User size={18} />
                {t('profile.full_name')}
              </div>
              <p className="font-medium text-gray-900">{formData.name}</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail size={18} />
                {t('profile.student_id_label')}
              </div>
              <p className="font-medium text-gray-900">{formData.studentId}</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-600">
                <Briefcase size={18} />
                {t('profile.role_label')}
              </div>
              <p className="font-medium text-gray-900">{user.roleKey ? t(user.roleKey) : (formData.role || t('profile.not_specified'))}</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
