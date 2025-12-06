import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../common/UI';
import { useTranslation } from '../../i18n';
import { 
  MessageSquare, Send, Loader2, ArrowLeft, Search, User, 
  RefreshCw, X 
} from 'lucide-react';
import { directMessageService, usersService } from '../../api/services';

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

function ConversationsList({ conversations, onSelect, selectedId, loading }) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="w-6 h-6 animate-spin text-sky-600" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
        <p className="text-sm">{t('dm.noConversations') || 'Нет диалогов'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {conversations.map((conv) => (
        <button
          key={conv.id}
          onClick={() => onSelect(conv)}
          className={`w-full p-3 rounded-lg flex items-center gap-3 transition ${
            selectedId === conv.id 
              ? 'bg-sky-50 border border-sky-200' 
              : 'hover:bg-slate-50'
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-semibold flex-shrink-0 overflow-hidden">
            {conv.avatar?.startsWith('http') ? (
              <img src={conv.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              conv.avatar || conv.name?.[0] || '?'
            )}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-900 truncate">{conv.name}</span>
              <span className="text-xs text-slate-400">{formatTime(conv.lastMessageAt)}</span>
            </div>
            <p className="text-sm text-slate-500 truncate">{conv.lastMessage}</p>
          </div>
          {conv.unreadCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-sky-600 text-white text-xs flex items-center justify-center">
              {conv.unreadCount}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

function ChatWithUser({ partner, user, onBack }) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const pollIntervalRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await directMessageService.getMessages(partner.id);
        setMessages(data);
      } catch (err) {
        console.error('Failed to load DM messages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    inputRef.current?.focus();

    pollIntervalRef.current = setInterval(fetchMessages, 5000);
    return () => clearInterval(pollIntervalRef.current);
  }, [partner.id]);

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
      senderId: user.id,
      receiverId: partner.id,
      createdAt: new Date().toISOString(),
      isMine: true,
      pending: true,
    };

    setMessages((prev) => [...prev, tempMessage]);
    setDraft('');
    setSending(true);

    try {
      const savedMessage = await directMessageService.sendMessage(partner.id, trimmed);
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

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 sm:p-4 border-b border-slate-200 bg-white flex items-center gap-2 sm:gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-slate-100 transition lg:hidden flex-shrink-0"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-semibold overflow-hidden flex-shrink-0">
          {partner.avatar?.startsWith('http') ? (
            <img src={partner.avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            partner.avatar || partner.name?.[0] || '?'
          )}
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">{partner.name}</h3>
          {partner.studentId && (
            <p className="text-xs text-slate-500">ID: {partner.studentId}</p>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-slate-50">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-sky-600" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <MessageSquare size={48} className="mb-4 opacity-50" />
            <p>{t('dm.empty') || 'Начните диалог'}</p>
          </div>
        ) : (
          Object.entries(messageGroups).map(([date, msgs]) => (
            <div key={date}>
              <div className="flex justify-center my-4">
                <span className="px-3 py-1 bg-slate-200 text-slate-600 text-xs rounded-full">
                  {date}
                </span>
              </div>
              <div className="space-y-2">
                {msgs.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isMine ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[70%] px-3 sm:px-4 py-2 rounded-2xl ${
                        message.isMine
                          ? 'bg-sky-600 text-white rounded-br-md'
                          : 'bg-white shadow-sm text-slate-900 rounded-bl-md'
                      } ${message.pending ? 'opacity-70' : ''} ${
                        message.error ? 'bg-red-100 border border-red-300' : ''
                      }`}
                    >
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
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
        <div className="flex gap-2 sm:gap-3 items-end">
          <textarea
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('dm.placeholder') || 'Сообщение...'}
            rows={1}
            className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none text-sm sm:text-base"
            style={{ minHeight: '44px', maxHeight: '100px' }}
          />
          <button
            onClick={sendMessage}
            disabled={!draft.trim() || sending}
            className="p-2.5 sm:p-3 rounded-xl bg-sky-600 text-white hover:bg-sky-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            {sending ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DirectMessagesView({ user, initialPartner, onClearPartner }) {
  const { t } = useTranslation();
  const [conversations, setConversations] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(initialPartner || null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (initialPartner) {
      setSelectedPartner(initialPartner);
    }
  }, [initialPartner]);

  const loadConversations = async () => {
    try {
      const data = await directMessageService.getConversations();
      setConversations(data);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      const result = await usersService.searchById(searchQuery.trim());
      setSearchResults(result ? [result] : []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const selectConversation = (conv) => {
    setSelectedPartner({
      id: conv.partnerId || conv.id,
      name: conv.name,
      avatar: conv.avatar,
      studentId: conv.studentId,
    });
    setSearchResults([]);
    setSearchQuery('');
  };

  const selectSearchResult = (user) => {
    setSelectedPartner({
      id: user.id,
      name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      avatar: user.avatar,
      studentId: user.studentId,
    });
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleBack = () => {
    setSelectedPartner(null);
    if (onClearPartner) onClearPartner();
    loadConversations();
  };

  return (
    <div className="space-y-4 lg:max-w-4xl lg:mx-auto">
      <div className={`flex items-center justify-between ${selectedPartner ? 'hidden lg:flex' : ''}`}>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            {t('dm.title') || 'Личные сообщения'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {t('dm.subtitle') || 'Приватные диалоги'}
          </p>
        </div>
        <button
          onClick={loadConversations}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition"
          title="Обновить"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="flex h-[calc(100vh-12rem)] sm:h-[calc(100vh-14rem)] lg:h-[600px] min-h-[400px]">
          <div className={`w-full lg:w-80 lg:border-r border-slate-200 flex flex-col ${
            selectedPartner ? 'hidden lg:flex' : ''
          }`}>
            <div className="p-4 border-b border-slate-200">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleSearchKeyPress}
                    placeholder={t('dm.searchPlaceholder') || 'Поиск по ID...'}
                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={searching || !searchQuery.trim()}
                  className="px-3 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition disabled:opacity-50"
                >
                  {searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                </button>
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="p-4 border-b border-slate-200 bg-sky-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-600">
                    {t('dm.searchResults') || 'Результаты поиска'}
                  </span>
                  <button
                    onClick={() => { setSearchResults([]); setSearchQuery(''); }}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                </div>
                {searchResults.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => selectSearchResult(u)}
                    className="w-full p-2 rounded-lg flex items-center gap-3 hover:bg-sky-100 transition"
                  >
                    <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-semibold overflow-hidden">
                      {u.avatar?.startsWith('http') ? (
                        <img src={u.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User size={16} />
                      )}
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-medium text-slate-900">
                        {u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim()}
                      </span>
                      <p className="text-xs text-slate-500">ID: {u.studentId}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4">
              <ConversationsList
                conversations={conversations}
                onSelect={selectConversation}
                selectedId={selectedPartner?.id}
                loading={loading}
              />
            </div>
          </div>

          <div className={`flex-1 flex flex-col ${
            selectedPartner ? '' : 'hidden lg:flex'
          }`}>
            {selectedPartner ? (
              <ChatWithUser
                partner={selectedPartner}
                user={user}
                onBack={handleBack}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <MessageSquare size={64} className="mb-4 opacity-50" />
                <p>{t('dm.selectChat') || 'Выберите диалог или найдите студента'}</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
