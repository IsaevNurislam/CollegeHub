import React, { useState } from 'react';
import { GraduationCap, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from '../../i18n';

export default function LoginView({ onLogin }) {
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const capitalizeFirstLetter = (value) => {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  const validateInputs = () => {
    const newErrors = {};
    if (!firstName.trim()) newErrors.firstName = t('login.errors.required');
    else if (firstName.trim().length < 2) newErrors.firstName = t('login.errors.min_chars');
    if (!lastName.trim()) newErrors.lastName = t('login.errors.required');
    else if (lastName.trim().length < 2) newErrors.lastName = t('login.errors.min_chars');
    if (!/^[0-9]{6}$/.test(studentId)) newErrors.studentId = 'ID должен содержать ровно 6 цифр';
    if (!password.trim()) newErrors.password = t('login.errors.required');
    else if (password.trim().length < 5) newErrors.password = 'Минимум 5 символов';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateInputs();
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      onLogin({ studentId, firstName, lastName, password });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <style>{`
        input::placeholder { color: #9ca3af; }
      `}</style>
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sky-100 text-sky-600 mb-4">
            <GraduationCap size={40} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{t('login.welcome')}</h1>
          <p className="text-gray-500 mt-2">{t('login.instructions')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('login.placeholder_first')}</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(capitalizeFirstLetter(e.target.value))}
              placeholder={t('login.placeholder_first')}
              className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-sky-500 outline-none transition text-white bg-slate-800 ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.firstName && <div className="flex items-center gap-1 text-red-500 text-sm mt-2"><AlertCircle size={16} />{errors.firstName}</div>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('login.placeholder_last')}</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(capitalizeFirstLetter(e.target.value))}
              placeholder={t('login.placeholder_last')}
              className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-sky-500 outline-none transition text-white bg-slate-800 ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.lastName && <div className="flex items-center gap-1 text-red-500 text-sm mt-2"><AlertCircle size={16} />{errors.lastName}</div>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('login.student_id_label')}</label>
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder={t('login.student_id_placeholder')}
              maxLength="6"
              className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-sky-500 outline-none transition text-white bg-slate-800 ${errors.studentId ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.studentId && <div className="flex items-center gap-1 text-red-500 text-sm mt-2"><AlertCircle size={16} />{errors.studentId}</div>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">{t('auth.passwordLabel')}</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.passwordPlaceholder')}
                className={`w-full px-4 py-3 pr-12 rounded-lg border focus:ring-2 focus:ring-sky-500 outline-none transition text-white bg-slate-800 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <div className="flex items-center gap-1 text-red-500 text-sm mt-2"><AlertCircle size={16} />{errors.password}</div>}
          </div>

          <button type="submit" className="w-full bg-sky-600 text-white py-3 rounded-lg font-bold hover:bg-sky-700 transition flex items-center justify-center gap-2">{t('login.submit')} <ArrowRight size={20} /></button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-400">{t('login.no_id_help')}</div>
      </div>
    </div>
  );
}