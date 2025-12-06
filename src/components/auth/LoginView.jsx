import React, { useState } from 'react';
import { GraduationCap, ArrowRight, AlertCircle, Eye, EyeOff, UserPlus, LogIn, X } from 'lucide-react';
import { useTranslation } from '../../i18n';

export default function LoginView({ onLogin }) {
  const { t } = useTranslation();
  const [mode, setMode] = useState('login');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const isRegister = mode === 'register';

  const showNotification = (message, type = 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const capitalizeFirstLetter = (value) => {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  const validateInputs = () => {
    const newErrors = {};
    
    if (isRegister) {
      if (!firstName.trim()) newErrors.firstName = t('login.errors.required') || 'Обязательное поле';
      else if (firstName.trim().length < 2) newErrors.firstName = t('login.errors.min_chars') || 'Минимум 2 символа';
      else if (!/^[a-zA-Zа-яА-ЯёЁ]+$/.test(firstName.trim())) newErrors.firstName = 'Только буквы';
      
      if (!lastName.trim()) newErrors.lastName = t('login.errors.required') || 'Обязательное поле';
      else if (lastName.trim().length < 2) newErrors.lastName = t('login.errors.min_chars') || 'Минимум 2 символа';
      else if (!/^[a-zA-Zа-яА-ЯёЁ]+$/.test(lastName.trim())) newErrors.lastName = 'Только буквы';
    }
    
    if (!studentId.trim()) {
      newErrors.studentId = t('login.errors.required') || 'Обязательное поле';
    } else if (!/^[0-9]{6}$/.test(studentId)) {
      newErrors.studentId = 'ID должен содержать ровно 6 цифр';
    }
    
    if (!password.trim()) {
      newErrors.password = t('login.errors.required') || 'Обязательное поле';
    } else if (password.trim().length < 5) {
      newErrors.password = 'Минимум 5 символов';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateInputs();
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      const errorCount = Object.keys(newErrors).length;
      showNotification(`Исправьте ${errorCount} ${errorCount === 1 ? 'ошибку' : 'ошибки'} в форме`, 'error');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const credentials = {
        studentId: studentId.trim(),
        password: password.trim(),
      };
      
      if (isRegister) {
        credentials.firstName = firstName.trim();
        credentials.lastName = lastName.trim();
        credentials.isRegistration = true;
      }
      
      await onLogin(credentials);
    } catch (error) {
      // Показываем ошибку от сервера
      const message = error?.userMessage || error?.message || 'Ошибка входа';
      showNotification(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setErrors({});
  };

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setStudentId('');
    setPassword('');
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      {/* Уведомление */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 max-w-sm p-4 rounded-lg shadow-lg flex items-center gap-3 ${
          notification.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
        }`}>
          <AlertCircle size={20} />
          <span className="flex-1 text-sm">{notification.message}</span>
          <button onClick={() => setNotification(null)} className="hover:opacity-80">
            <X size={18} />
          </button>
        </div>
      )}

      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sky-100 text-sky-600 mb-4">
            <GraduationCap size={40} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isRegister ? (t('login.register_title') || 'Регистрация') : (t('login.welcome') || 'Добро пожаловать')}
          </h1>
          <p className="text-gray-500 mt-2">
            {isRegister 
              ? (t('login.register_subtitle') || 'Создайте аккаунт для доступа к платформе')
              : (t('login.instructions') || 'Войдите в свой аккаунт')
            }
          </p>
        </div>

        <div className="flex mb-6 bg-slate-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => { setMode('login'); resetForm(); }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition flex items-center justify-center gap-2 ${
              !isRegister ? 'bg-white shadow text-sky-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <LogIn size={16} />
            {t('login.tab_login') || 'Вход'}
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); resetForm(); }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition flex items-center justify-center gap-2 ${
              isRegister ? 'bg-white shadow text-sky-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <UserPlus size={16} />
            {t('login.tab_register') || 'Регистрация'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {isRegister && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('login.placeholder_first') || 'Имя'}
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(capitalizeFirstLetter(e.target.value))}
                  placeholder={t('login.placeholder_first') || 'Введите имя'}
                  className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-sky-500 outline-none transition bg-slate-800 text-white placeholder-gray-400 ${
                    errors.firstName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.firstName && (
                  <div className="flex items-center gap-1 text-red-500 text-sm mt-2">
                    <AlertCircle size={16} />{errors.firstName}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('login.placeholder_last') || 'Фамилия'}
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(capitalizeFirstLetter(e.target.value))}
                  placeholder={t('login.placeholder_last') || 'Введите фамилию'}
                  className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-sky-500 outline-none transition bg-slate-800 text-white placeholder-gray-400 ${
                    errors.lastName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.lastName && (
                  <div className="flex items-center gap-1 text-red-500 text-sm mt-2">
                    <AlertCircle size={16} />{errors.lastName}
                  </div>
                )}
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('login.student_id_label') || 'Student ID'}
            </label>
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder={t('login.student_id_placeholder') || '000000'}
              maxLength="6"
              className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-sky-500 outline-none transition bg-slate-800 text-white placeholder-gray-400 ${
                errors.studentId ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.studentId && (
              <div className="flex items-center gap-1 text-red-500 text-sm mt-2">
                <AlertCircle size={16} />{errors.studentId}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              {t('auth.passwordLabel') || 'Пароль'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.passwordPlaceholder') || 'Введите пароль'}
                className={`w-full px-4 py-3 pr-12 rounded-lg border focus:ring-2 focus:ring-sky-500 outline-none transition bg-slate-800 text-white placeholder-gray-400 ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <div className="flex items-center gap-1 text-red-500 text-sm mt-2">
                <AlertCircle size={16} />{errors.password}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-sky-600 text-white py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-sky-700'}`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Загрузка...
              </>
            ) : (
              <>
                {isRegister ? (t('login.register_button') || 'Зарегистрироваться') : (t('login.submit') || 'Войти')}
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={switchMode}
            className="text-sm text-sky-600 hover:text-sky-700 hover:underline"
          >
            {isRegister 
              ? (t('login.have_account') || 'Уже есть аккаунт? Войти')
              : (t('login.no_account') || 'Нет аккаунта? Зарегистрироваться')
            }
          </button>
        </div>

        <div className="mt-4 text-center text-xs text-gray-400">
          {t('login.no_id_help') || 'Если у вас нет Student ID, обратитесь в деканат'}
        </div>
      </div>
    </div>
  );
}
