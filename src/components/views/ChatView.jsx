import React, { useMemo, useState } from 'react';
import { Card } from '../common/UI';
import { useTranslation } from '../../i18n';
import { MessageSquare, Paperclip, Send, Mic2, Smile, Link, Settings, Star } from 'lucide-react';
import { INITIAL_CHAT_MESSAGES } from '../../data/mockData';

const formatTime = (date) => new Date(date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

export default function ChatView({ user }) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState(INITIAL_CHAT_MESSAGES);
  const [draft, setDraft] = useState('');
  const [recording, setRecording] = useState(false);

  const pinnedMessage = useMemo(() => messages.find((message) => message.pinned), [messages]);

  const sendMessage = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    const next = {
      id: Date.now(),
      author: user?.name || 'Вы',
      avatar: user?.avatar || (user?.name?.[0] || 'Т'),
      time: formatTime(Date.now()),
      text: trimmed,
      isMine: true,
      status: 'sent'
    };
    setMessages((prev) => [...prev, next]);
    setDraft('');
  };

  const toggleRecording = () => {
    setRecording((prev) => !prev);
  };

  const quickActions = [
    { label: t('chat.action_voice'), icon: <Mic2 size={16} /> },
    { label: t('chat.action_sticker'), icon: <Smile size={16} /> },
    { label: t('chat.action_attach'), icon: <Paperclip size={16} /> }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="w-full flex flex-col lg:flex-row lg:items-end lg:justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{t('chat.title')}</h2>
            <p className="text-sm text-slate-500">{t('chat.subtitle')}</p>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-medium hover:bg-slate-800"
            onClick={() => window.open('https://t.me', '_blank')}
          >
            <Link size={16} /> {t('chat.invite_link')}
          </button>
        </div>
        {pinnedMessage && (
          <Card className="bg-sky-50 border-sky-200">
            <div className="text-xs uppercase tracking-wide text-sky-600 font-semibold mb-1">
              {t('chat.pinned_label')}
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white shadow-sm text-sky-600 font-bold">
                {pinnedMessage.avatar}
              </div>
              <div>
                <div className="text-sm text-slate-900 font-semibold">{pinnedMessage.author}</div>
                <p className="text-sm text-slate-700 leading-relaxed">{pinnedMessage.text}</p>
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <Star size={14} /> {pinnedMessage.time} · {t(`chat.status.${pinnedMessage.status}`)}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      <div className="grid lg:grid-cols-[3fr,2fr] gap-6">
        <section className="space-y-4">
          <Card className="p-4 space-y-4">
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.isMine ? 'justify-end' : 'justify-start'}`}
                >
                  {!message.isMine && (
                    <div className="flex items-start mt-1">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-sky-600 font-semibold">
                        {message.avatar}
                      </div>
                    </div>
                  )}
                  <div
                    className={`max-w-[18rem] min-w-[10rem] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                      message.isMine ? 'bg-slate-900 text-white rounded-br-lg' : 'bg-gray-100 text-slate-900 rounded-bl-lg'
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
                      <span>{message.isMine ? t('chat.send') : message.author}</span>
                      <span className="text-[10px] uppercase">
                        {message.time} · {t(`chat.status.${message.status}`)}
                      </span>
                    </div>
                    <p className="text-sm text-inherit">{message.text}</p>
                    {message.attachments && (
                      <div className="mt-2 flex flex-col gap-2">
                        {message.attachments.map((file, idx) => (
                          <div
                            key={`${file.label}-${idx}`}
                            className="flex items-center gap-2 bg-white/70 border border-dashed border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-600"
                          >
                            <Paperclip size={14} /> {file.label}
                          </div>
                        ))}
                      </div>
                    )}
                    {message.quickActions && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {message.quickActions.map((action) => (
                          <span
                            key={action}
                            className="text-[11px] px-2 py-1 rounded-full bg-slate-200 text-slate-600"
                          >
                            {action}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {message.isMine && (
                    <div className="flex items-start mt-1">
                      <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-semibold">
                        {message.avatar}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2 items-center pt-2 border-t border-slate-200">
              <button
                onClick={toggleRecording}
                className={`p-2 rounded-full border ${
                  recording ? 'border-red-500 bg-red-50 text-red-600' : 'border-slate-200 text-slate-500'
                }`}
              >
                <Mic2 size={16} />
              </button>
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={t('chat.placeholder')}
                className="flex-1 px-4 py-2 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button
                onClick={sendMessage}
                className="p-2 rounded-full bg-sky-600 text-white hover:bg-sky-700 transition"
              >
                <Send size={16} />
              </button>
            </div>
          </Card>
        </section>
        <aside className="space-y-4">
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">{t('chat.quick_actions_title')}</h3>
              <Settings size={16} className="text-slate-500" />
            </div>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                  {action.icon}
                  {action.label}
                </button>
              ))}
            </div>
            <div className="text-sm text-slate-500">{t('chat.empty')}</div>
          </Card>
          <Card className="p-4 space-y-3 bg-gradient-to-br from-sky-600 to-sky-700 text-white">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs uppercase opacity-80">Telegram</p>
                <h3 className="text-lg font-semibold">Live channel</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                <MessageSquare size={20} />
              </div>
            </div>
            <p className="text-sm opacity-90">
              {t('chat.subtitle')} {t('chat.invite_link')} — {t('chat.quick_actions_title')}.
            </p>
            <button
              onClick={() => window.open('https://t.me/collegehub', '_blank')}
              className="w-full rounded-full bg-white text-slate-900 font-semibold py-2"
            >
              {t('chat.invite_link')}
            </button>
          </Card>
        </aside>
      </div>
    </div>
  );
}
