import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../common/UI';
import { useTranslation } from '../../i18n';
import { MessageSquare, Send, Loader2, Users, RefreshCw } from 'lucide-react';
import { chatService } from '../../api/services';

const formatTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (d.toDateString() === today.toDateString()) return 'Сегодня';
  if (d.toDateString() === yesterday.toDateString()) return 'Вчера';
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
};

export default function ChatView({ user }) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const pollIntervalRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      const data = await chatService.getMessages();
      setMessages(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Не удалось загрузить сообщения');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
    
    pollIntervalRef.current = setInterval(() => {
      loadMessages();
    }, 5000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    const trimmed = draft.trim();
    if (!trimmed || sending) return;

    const tempId = Date.now();
    const tempMessage = {
      id: tempId,
      text: trimmed,
      author: user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Вы',
      avatar: user?.avatar || (user?.firstName?.[0] || user?.name?.[0] || 'U'),
      createdAt: new Date().toISOString(),
      isMine: true,
      pending: true,
    };

    setMessages((prev) => [...prev, tempMessage]);
    setDraft('');
    setSending(true);

    try {
      const savedMessage = await chatService.sendMessage(trimmed);
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...savedMessage, isMine: true } : m))
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId ? { ...m, pending: false, error: true } : m
        )
      );
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const groupMessagesByDate = (msgs) => {
    const groups = {};
    msgs.forEach((msg) => {
      const date = formatDate(msg.createdAt);
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{t('chat.title') || 'Общий чат'}</h2>
          <p className="text-sm text-slate-500 flex items-center gap-2">
            <Users size={14} />
            {t('chat.subtitle') || 'Общение всех студентов'}
          </p>
        </div>
        <button
          onClick={loadMessages}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition"
          title="Обновить"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <Card className="p-0 overflow-hidden">
        <div className="h-[500px] overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <MessageSquare size={48} className="mb-4 opacity-50" />
              <p>{t('chat.empty') || 'Пока нет сообщений'}</p>
              <p className="text-sm">Начните общение первым!</p>
            </div>
          ) : (
            Object.entries(messageGroups).map(([date, msgs]) => (
              <div key={date}>
                <div className="flex justify-center my-4">
                  <span className="px-3 py-1 bg-slate-200 text-slate-600 text-xs rounded-full">
                    {date}
                  </span>
                </div>
                <div className="space-y-3">
                  {msgs.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      {!message.isMine && (
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-semibold">
                            {message.avatar || message.author?.[0] || '?'}
                          </div>
                        </div>
                      )}
                      <div
                        className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                          message.isMine
                            ? 'bg-sky-600 text-white rounded-br-md'
                            : 'bg-white shadow-sm text-slate-900 rounded-bl-md'
                        } ${message.pending ? 'opacity-70' : ''} ${
                          message.error ? 'bg-red-100 border border-red-300' : ''
                        }`}
                      >
                        {!message.isMine && (
                          <div className="text-xs font-semibold text-sky-600 mb-1">
                            {message.author}
                          </div>
                        )}
                        <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                        <div
                          className={`text-xs mt-1 flex items-center gap-1 ${
                            message.isMine ? 'text-sky-200 justify-end' : 'text-slate-400'
                          }`}
                        >
                          {formatTime(message.createdAt)}
                          {message.pending && <Loader2 size={10} className="animate-spin ml-1" />}
                          {message.error && <span className="text-red-500 ml-1">!</span>}
                        </div>
                      </div>
                      {message.isMine && (
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-sky-600 flex items-center justify-center text-white font-semibold">
                            {user?.avatar || user?.firstName?.[0] || user?.name?.[0] || 'U'}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-slate-200">
          <div className="flex gap-3 items-end">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('chat.placeholder') || 'Напишите сообщение...'}
              rows={1}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            <button
              onClick={sendMessage}
              disabled={!draft.trim() || sending}
              className="p-3 rounded-xl bg-sky-600 text-white hover:bg-sky-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
