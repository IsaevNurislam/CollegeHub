import React, { useState, useMemo, useEffect } from 'react';
import { 
  MessageSquare, Clock, MapPin, ChevronRight, GraduationCap, Star, Heart, Menu 
} from 'lucide-react';
import { Card, Badge } from '../common/UI'; 
import EmptyState from '../common/EmptyState';
import { useTranslation } from '../../i18n';
import { newsService } from '../../api/services';

export default function HomeView({ newsFeed, clubs, schedule, handleLikePost, onNavigate, onViewClub }) {
  const { t } = useTranslation();
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [openMenus, setOpenMenus] = useState({});
  const [commentsByNews, setCommentsByNews] = useState({});
  const [editingComment, setEditingComment] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [showCommentInputs, setShowCommentInputs] = useState({});

  // Load comments from API
  useEffect(() => {
    const loadComments = async () => {
      const commentsMap = {};
      for (const news of newsFeed) {
        try {
          const comments = await newsService.getComments(news.id);
          commentsMap[news.id] = comments;
        } catch (error) {
          console.error(`Failed to load comments for news ${news.id}:`, error);
        }
      }
      setCommentsByNews(commentsMap);
    };
    
    if (newsFeed.length > 0) {
      loadComments();
    }
  }, [newsFeed]);

  const popularClubs = useMemo(() => {
    if (!clubs || clubs.length === 0) return [];
    return [...clubs]
      .sort((a, b) => (b.members ?? 0) - (a.members ?? 0))
      .slice(0, 3);
  }, [clubs]);

  const nextClass = useMemo(() => {
    if (!schedule || schedule.length === 0) return { subject: t('home.no_classes'), room: '—', time: '', date: '' };
    const now = new Date();
    const upcoming = schedule
      .map(m => {
        const itemDate = m.date || new Date().toISOString().split('T')[0];
        const [startStr] = (m.time || '').split(' - ');
        if (!startStr || !startStr.includes(':')) return null;
        const [y, mo, d] = itemDate.split('-').map(Number);
        const [h, mi] = startStr.split(':').map(Number);
        const startDt = new Date(y, mo - 1, d, h, mi, 0, 0);
        if (startDt < now) return null;
        return { ...m, startDt };
      })
      .filter(Boolean)
      .sort((a, b) => a.startDt - b.startDt);
    return upcoming.length > 0 ? upcoming[0] : { subject: t('home.no_classes'), room: '—', time: '', date: '' };
  }, [schedule, t]);

  const minutesUntilStart = useMemo(() => {
    if (!nextClass || !nextClass.startDt) return null;
    try {
      const now = new Date();
      const diffMs = nextClass.startDt.getTime() - now.getTime();
      const diffMin = Math.round(diffMs / 60000);
      return diffMin;
    } catch {
      return null;
    }
  }, [nextClass]);

  const hasNews = Array.isArray(newsFeed) && newsFeed.length > 0;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-sky-600 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2">{t('login.welcome')}</h1>
          <p className="opacity-90 text-sm md:text-base max-w-full md:max-w-xl">
            {t('home.tagline')}
          </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-10 translate-y-10">
          <GraduationCap size={200} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <MessageSquare className="mr-2" size={20}/> {t('home.news_title')}
          </h2>
          {hasNews ? (
            newsFeed.map((news) => (
              <Card key={news.id} className="hover:shadow-md transition-shadow relative">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-bold flex-shrink-0">
                      {(news.authorKey ? (t(news.authorKey)[0] || '') : news.author && news.author[0])}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-900 truncate">{news.authorKey ? t(news.authorKey) : news.author}</h3>
                      <span className="text-xs text-gray-500">{news.timeKey ? t(news.timeKey) : news.time}</span>
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenus(prev => ({ ...prev, [news.id]: !prev[news.id] }))}
                      className="text-sky-400 hover:text-sky-600 flex-shrink-0"
                      aria-haspopup="true"
                      aria-expanded={!!openMenus[news.id]}
                    >
                      <Menu size={20} />
                    </button>
                    {openMenus[news.id] && (
                      <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                        <button
                          onClick={() => {
                            setOpenMenus(prev => ({ ...prev, [news.id]: false }));
                            const shareText = `${news.authorKey ? t(news.authorKey) : news.author}: ${news.contentKey ? t(news.contentKey) : news.content}`;
                            if (navigator.share) {
                              navigator.share({ title: 'Campus News', text: shareText }).catch(() => {});
                            } else {
                              navigator.clipboard.writeText(shareText).then(() => alert('Скопировано в буфер обмена'));
                            }
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                        >
                          Поделиться
                        </button>
                        <button
                          onClick={() => {
                            setOpenMenus(prev => ({ ...prev, [news.id]: false }));
                            alert('Жалоба отправлена на модерацию');
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                        >
                          Пожаловаться
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-gray-700 mb-4 leading-relaxed text-sm sm:text-base">{news.contentKey ? t(news.contentKey) : news.content}</p>
                <div className="flex items-center justify-between border-t pt-4 border-gray-100">
                  <div className="flex flex-wrap gap-2">
                    {news.tags && news.tags.length > 0 && news.tags.map((tag, idx) => {
                      const tagKey = news.tagsKeys && news.tagsKeys[idx];
                      const label = tagKey ? t(tagKey) : tag;
                      return <Badge key={`${tag}-${idx}`} color="bg-sky-50 text-sky-700">#{label}</Badge>;
                    })}
                  </div>
                  <div className="flex space-x-4 text-gray-500 text-sm flex-shrink-0">
                    <button
                      onClick={() => handleLikePost(news.id)}
                      className={`cursor-pointer flex items-center gap-1 transition-colors ${
                        news.liked ? 'text-red-500' : 'hover:text-red-500'
                      }`}
                    >
                      <Heart size={16} fill={news.liked ? 'currentColor' : 'none'}/> {news.likes}
                    </button>
                    <button
                      onClick={() => {
                        setShowCommentInputs(prev => ({ ...prev, [news.id]: !prev[news.id] }));
                        const el = document.getElementById(`comment-input-${news.id}`);
                        if (el) el.focus();
                      }}
                      className="hover:text-blue-500 cursor-pointer flex items-center gap-1"
                    >
                      <MessageSquare size={16}/> {(commentsByNews[news.id]?.length || 0) + (news.comments || 0)}
                    </button>
                  </div>
                </div>

                {showCommentInputs[news.id] && (
                  <div className="mt-4 space-y-3">
                    <div className="flex gap-2">
                      <input
                        id={`comment-input-${news.id}`}
                        type="text"
                        value={commentInputs[news.id] || ''}
                        onChange={(e) => setCommentInputs(prev => ({ ...prev, [news.id]: e.target.value }))}
                        placeholder="Напишите комментарий..."
                        className="flex-1 px-3 py-2 bg-slate-800 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                      />
                      <button
                        onClick={async () => {
                          const text = (commentInputs[news.id] || '').trim();
                          if (!text) return;
                          
                          try {
                            const newComment = await newsService.addComment(news.id, text);
                            setCommentsByNews(prev => {
                              const existing = prev[news.id] || [];
                              return { ...prev, [news.id]: [...existing, newComment] };
                            });
                            setCommentInputs(prev => ({ ...prev, [news.id]: '' }));
                            setShowCommentInputs(prev => ({ ...prev, [news.id]: false }));
                          } catch (error) {
                            console.error('Failed to add comment:', error);
                            alert('Ошибка при добавлении комментария');
                          }
                        }}
                        className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition"
                      >
                        Отправить
                      </button>
                    </div>
                  </div>
                )}
                {(commentsByNews[news.id] || []).length > 0 && (
                  <div className="mt-4 space-y-2">
                    {(commentsByNews[news.id] || []).map(c => (
                      <div key={c.id} className="text-sm bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 flex items-start justify-between gap-3">
                        {editingComment[c.id] != null ? (
                          <input
                            type="text"
                            value={editingComment[c.id]}
                            onChange={(e) => setEditingComment(prev => ({ ...prev, [c.id]: e.target.value }))}
                            className="flex-1 px-2 py-1 bg-white border border-gray-200 rounded"
                          />
                        ) : (
                          <div className="text-gray-800 flex-1 break-words"><span className="font-semibold mr-1">{c.author || 'Вы'}:</span>{c.text}</div>
                        )}
                        <div className="flex-shrink-0 flex gap-2">
                          {editingComment[c.id] != null ? (
                            <>
                              <button
                                onClick={async () => {
                                  const newText = (editingComment[c.id] || '').trim();
                                  if (!newText) return;
                                  
                                  try {
                                    await newsService.updateComment(news.id, c.id, newText);
                                    setCommentsByNews(prev => {
                                      const list = prev[news.id] || [];
                                      const updated = list.map(item => item.id === c.id ? { ...item, text: newText } : item);
                                      return { ...prev, [news.id]: updated };
                                    });
                                    setEditingComment(prev => {
                                      const cp = { ...prev };
                                      delete cp[c.id];
                                      return cp;
                                    });
                                  } catch (error) {
                                    console.error('Failed to update comment:', error);
                                    alert('Ошибка при обновлении комментария');
                                  }
                                }}
                                className="text-sky-600 text-xs hover:underline"
                              >
                                Сохранить
                              </button>
                              <button
                                onClick={() => setEditingComment(prev => { const cp = { ...prev }; delete cp[c.id]; return cp; })}
                                className="text-gray-600 text-xs hover:underline"
                              >
                                Отмена
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => setEditingComment(prev => ({ ...prev, [c.id]: c.text }))}
                                className="text-sky-600 text-xs hover:underline"
                              >
                                Редактировать
                              </button>
                              <button
                                onClick={async () => {
                                  try {
                                    await newsService.deleteComment(news.id, c.id);
                                    setCommentsByNews(prev => {
                                      const list = prev[news.id] || [];
                                      const updated = list.filter(item => item.id !== c.id);
                                      return { ...prev, [news.id]: updated };
                                    });
                                    setEditingComment(prev => { const cp = { ...prev }; delete cp[c.id]; return cp; });
                                  } catch (error) {
                                    console.error('Failed to delete comment:', error);
                                    alert('Ошибка при удалении комментария');
                                  }
                                }}
                                className="text-red-600 text-xs hover:underline"
                              >
                                Удалить
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))
          ) : (
            <EmptyState className="min-h-[40vh]" />
          )}
        </div>

        <div className="space-y-6 lg:col-span-1">
          <Card>
            <h3 className="font-bold text-gray-800 mb-4 flex items-center">
              <Clock size={18} className="mr-2 text-sky-600"/>
              {t('home.meetings')}
            </h3>
            <div className="p-4 bg-sky-50 rounded-lg border-l-4 border-sky-600">
              <div className="text-sm text-sky-600 font-semibold mb-1">
                {minutesUntilStart != null ? (() => {
                  const mins = minutesUntilStart;
                  if (mins < 0) return t('home.upcoming');
                  if (mins < 60) return `${mins} ${t('home.time.minutes')}`;
                  const hours = Math.floor(mins / 60);
                  if (hours < 24) return `${hours} ${t('home.time.hours')}`;
                  const days = Math.floor(hours / 24);
                  if (days < 7) return `${days} ${t('home.time.days')}`;
                  const weeks = Math.floor(days / 7);
                  if (weeks < 4) return `${weeks} ${t('home.time.weeks')}`;
                  const months = Math.floor(days / 30);
                  if (months < 12) return `${months} ${t('home.time.months')}`;
                  const years = Math.floor(days / 365);
                  return `${years} ${t('home.time.years')}`;
                })() : t('home.upcoming')}
              </div>
              <div className="font-bold text-gray-900 truncate">{nextClass.subject}</div>
              <div className="text-sm text-gray-600 flex items-center mt-2">
                <MapPin size={14} className="mr-1 flex-shrink-0"/> <span className="truncate">{nextClass.room}</span>
              </div> 
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setShowMeetingModal(true)}
                  className="px-3 py-1 bg-sky-600 text-white rounded-lg text-sm hover:bg-sky-700 transition"
                >
                  {t('common.details')}
                </button>
                <button
                  onClick={() => onNavigate?.('/schedule')}
                  className="px-3 py-1 bg-gray-200 text-gray-800 rounded-lg text-sm hover:bg-gray-300 transition"
                >
                  {t('schedule.title')}
                </button>
              </div>
            </div>
          </Card>

          {showMeetingModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4" onClick={() => setShowMeetingModal(false)}>
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{nextClass.subject}</h3>
                <div className="text-sm text-gray-600 mb-4">
                  {nextClass.time && (
                    <div className="mb-1">{nextClass.time}</div>
                  )}
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-gray-500" />
                    <span>{nextClass.room}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const title = nextClass.subject;
                      const [startTimeStr, endTimeStr] = (nextClass.time || '').split(' - ');
                      if (startTimeStr && endTimeStr) {
                        const now = new Date();
                        const y = now.getFullYear();
                        const mo = String(now.getMonth() + 1).padStart(2, '0');
                        const d = String(now.getDate()).padStart(2, '0');
                        const startDt = `${y}${mo}${d}T${startTimeStr.replace(':','')}00`;
                        const endDt = `${y}${mo}${d}T${endTimeStr.replace(':','')}00`;
                        let ics = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//College Hub//Event//EN\nBEGIN:VEVENT\n`;
                        ics += `DTSTART:${startDt}\n`;
                        ics += `DTEND:${endDt}\n`;
                        ics += `SUMMARY:${title}\n`;
                        ics += `LOCATION:${nextClass.room}\n`;
                        ics += `END:VEVENT\nEND:VCALENDAR`;
                        const a = document.createElement('a');
                        a.setAttribute('href', 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics));
                        a.setAttribute('download', 'meeting.ics');
                        a.style.display = 'none';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition"
                  >
                    {t('schedule.export')}
                  </button>
                  <button
                    onClick={() => setShowMeetingModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition"
                  >
                    {t('common.close')}
                  </button>
                </div>
              </div>
            </div>
          )}

          <Card>
            <h3 className="font-bold text-gray-800 mb-4 flex items-center">
              <Star size={18} className="mr-2 text-yellow-500"/> {t('home.popular_clubs')}
            </h3>
            <div className="space-y-3">
              {popularClubs.map(club => (
                <div key={club.id} onClick={() => onViewClub?.(club)} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className={`w-8 h-8 rounded-full ${club.color} flex items-center justify-center text-white text-xs flex-shrink-0`}>
                      {club.name[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold truncate">{club.name}</div>
                      <div className="text-xs text-gray-500 truncate">{club.categoryKey ? t(club.categoryKey) : (t(`clubs.categories.${club.category}`) !== `clubs.categories.${club.category}` ? t(`clubs.categories.${club.category}`) : club.category)}</div>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-400 flex-shrink-0"/>
                </div>
              ))}
            </div>
              <button 
                onClick={() => onNavigate?.('/clubs')}
                className="w-full mt-4 text-center text-sm text-sky-600 font-medium hover:underline"
              >
                {t('clubs.view_all')}
              </button>
          </Card>
        </div>
      </div>

    </div>
  );
}