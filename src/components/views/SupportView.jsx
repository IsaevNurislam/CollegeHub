import React, { useState } from 'react';
import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from '../common/UI';
import { useTranslation } from '../../i18n';

export default function SupportView({ onSubmitFeedback, user }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Введите корректный email';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Тема обязательна';
    } else if (formData.subject.trim().length < 3) {
      newErrors.subject = 'Тема должна содержать минимум 3 символа';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Сообщение обязательно';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Сообщение должно содержать минимум 10 символов';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Simulate sending email
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Call the handler if provided
      if (onSubmitFeedback) {
        onSubmitFeedback({
          name: user?.name || 'Anonymous',
          email: formData.email,
          subject: formData.subject,
          message: formData.message
        });
      }

      setSubmitted(true);
      setFormData({ email: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error('Failed to send support request:', error);
      setErrors({ submit: 'Ошибка при отправке. Попробуйте снова.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">{t('common.support') || 'Служба поддержки'}</h2>
        <p className="text-gray-500 text-sm mt-1">Свяжитесь с нами, если у вас есть вопросы или проблемы</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Form */}
        <Card className="md:col-span-1">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle size={18} />
                <span>{errors.submit}</span>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
              <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                {user?.name || 'Anonymous'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.email && (
                <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.email}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Тема *</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Введите тему обращения"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                  errors.subject ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.subject && (
                <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.subject}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Сообщение *</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Опишите вашу проблему или вопрос..."
                rows="4"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                  errors.message ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.message && (
                <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-600 text-white py-2 rounded-lg font-medium hover:bg-sky-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <Send size={18} />
              {loading ? 'Отправка...' : 'Отправить'}
            </button>
          </form>

          {submitted && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
              <CheckCircle size={20} />
              <span>Ваше сообщение отправлено! Мы ответим вам в ближайшее время.</span>
            </div>
          )}
        </Card>

        {/* FAQ / Contact Info */}
        <Card className="md:col-span-1">
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <Mail className="text-sky-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-semibold text-gray-900">Email</h3>
                <p className="text-gray-600 text-sm">support@collegehub.com</p>
              </div>
            </div>

            <hr className="border-gray-200" />

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Часто задаваемые вопросы</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-sky-600 font-bold">•</span>
                  <span><strong>Как присоединиться к клубу?</strong> Откройте раздел "Клубы" и нажмите "Вступить" на интересующий вас клуб.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-600 font-bold">•</span>
                  <span><strong>Как создать свой проект?</strong> Перейдите в "Проекты" и нажмите "Добавить проект".</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-600 font-bold">•</span>
                  <span><strong>Как изменить профиль?</strong> Откройте профиль в верхнем правом углу экрана.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-600 font-bold">•</span>
                  <span><strong>Как найти клуб?</strong> Используйте поиск в левой панели для быстрого поиска клубов.</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
