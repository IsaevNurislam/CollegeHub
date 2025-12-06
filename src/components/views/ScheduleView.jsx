import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Plus, Download, Trash2 } from 'lucide-react';
import { Card, Badge } from '../common/UI';
import { useTranslation } from '../../i18n';
import { scheduleService } from '../../api/services';

export default function ScheduleView({ schedule = [], setSchedule }) {
  const { t, language } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:30',
    subject: '',
    room: '',
    type: 'lecture',
    color: 'border-blue-500'
  });

  const handleAddMeeting = async (e) => {
    e.preventDefault();
    if (formData.subject && formData.room && formData.date) {
      try {
        if (editingIndex !== null) {
          const meeting = schedule[editingIndex];
          const updatedMeeting = await scheduleService.update(meeting.id, {
            date: formData.date,
            time: `${formData.startTime} - ${formData.endTime}`,
            subject: formData.subject,
            room: formData.room,
            type: formData.type,
            color: formData.color,
          });
          const updated = [...schedule];
          updated[editingIndex] = updatedMeeting;
          setSchedule(updated);
          setEditingIndex(null);
        } else {
          const newMeeting = await scheduleService.create({
            date: formData.date,
            time: `${formData.startTime} - ${formData.endTime}`,
            subject: formData.subject,
            room: formData.room,
            type: formData.type,
            color: formData.color,
          });
          setSchedule([...schedule, newMeeting]);
        }
        setFormData({
          date: new Date().toISOString().split('T')[0],
          startTime: '09:00',
          endTime: '10:30',
          subject: '',
          room: '',
          type: 'lecture',
          color: 'border-blue-500'
        });
        setShowForm(false);
      } catch (error) {
        console.error('Failed to save meeting:', error);
        alert('Ошибка при сохранении встречи');
      }
    }
  };

  const handleEditMeeting = (index) => {
    const meeting = schedule[index];
    const [startTime, endTime] = meeting.time.split(' - ');
    setFormData({
      date: meeting.date || new Date().toISOString().split('T')[0],
      startTime: startTime || '09:00',
      endTime: endTime || '10:30',
      subject: meeting.subject || '',
      room: meeting.room || '',
      type: meeting.type || 'lecture',
      color: meeting.color || 'border-blue-500'
    });
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleDeleteMeeting = async (index) => {
    const meeting = schedule[index];
    try {
      await scheduleService.delete(meeting.id);
      setSchedule(schedule.filter((_, i) => i !== index));
    } catch (error) {
      console.error('Failed to delete meeting:', error);
      alert('Ошибка при удалении встречи');
    }
  };

  const exportToIcs = () => {
    const langCode = language === 'ru' ? 'RU' : 'EN';
    let icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//${t('app.name')}//Calendar//${langCode}\nX-WR-CALNAME:${t('app.name')}\nCALSCALE:GREGORIAN\n`;
    
    schedule.forEach(meeting => {
      const [startTime, endTime] = meeting.time.split(' - ');
      const startDateTime = `20251127T${startTime.replace(':', '')}00`;
      const endDateTime = `20251127T${endTime.replace(':', '')}00`;
      
      icsContent += `BEGIN:VEVENT\n`;
      icsContent += `DTSTART:${startDateTime}\n`;
      icsContent += `DTEND:${endDateTime}\n`;
      icsContent += `SUMMARY:${meeting.subjectKey ? t(meeting.subjectKey) : meeting.subject}\n`;
      icsContent += `LOCATION:${meeting.roomKey ? t(meeting.roomKey) : meeting.room}\n`;
      icsContent += `DESCRIPTION:${meeting.type}\n`;
      icsContent += `END:VEVENT\n`;
    });
    
    icsContent += 'END:VCALENDAR';
    
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/calendar;charset=utf-8,' + encodeURIComponent(icsContent));
    element.setAttribute('download', 'schedule.ics');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">{t('schedule.title')}</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-3 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4">
            <h3 className="text-base sm:text-lg font-bold text-gray-700 flex items-center gap-2">
              <Calendar size={20}/> {t('schedule.all')}
            </h3>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={exportToIcs}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-sky-100 text-sky-600 rounded-lg hover:bg-sky-200 transition font-medium text-xs sm:text-sm"
              >
                <Download size={16} className="sm:w-[18px] sm:h-[18px]" /> <span className="hidden xs:inline">{t('schedule.export')}</span><span className="xs:hidden">ИCS</span>
              </button>
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition font-medium text-xs sm:text-sm"
              >
                <Plus size={16} className="sm:w-[18px] sm:h-[18px]" /> {t('schedule.add_meeting')}
              </button>
            </div>
          </div>

          {showForm && (
            <Card className="bg-sky-50">
              <form onSubmit={handleAddMeeting} className="space-y-4">
                <h4 className="font-bold text-gray-800 mb-4">
                  {editingIndex !== null ? t('schedule.edit_meeting') : t('schedule.add_meeting')}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('schedule.form.date')}</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none bg-slate-800 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('schedule.form.start_time')}</label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none bg-slate-800 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('schedule.form.end_time')}</label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none bg-slate-800 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('schedule.form.name')}</label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      placeholder={t('schedule.form.placeholder_name')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none bg-slate-800 text-white placeholder-gray-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('schedule.form.room')}</label>
                    <input
                      type="text"
                      value={formData.room}
                      onChange={(e) => setFormData({...formData, room: e.target.value})}
                      placeholder={t('schedule.form.placeholder_room')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none bg-slate-800 text-white placeholder-gray-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('schedule.form.type')}</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none bg-slate-800 text-white"
                    >
                      <option value="lecture">{t('schedule.types.lecture')}</option>
                      <option value="seminar">{t('schedule.types.seminar')}</option>
                      <option value="lab">{t('schedule.types.lab')}</option>
                      <option value="practice">{t('schedule.types.practice')}</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition font-medium"
                  >
                    {editingIndex !== null ? t('schedule.form.save') : t('schedule.form.add')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingIndex(null);
                      setFormData({
                        date: new Date().toISOString().split('T')[0],
                        startTime: '09:00',
                        endTime: '10:30',
                        subject: '',
                        room: '',
                        type: 'lecture',
                        color: 'border-blue-500'
                      });
                    }}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium"
                  >
                    {t('schedule.form.cancel')}
                  </button>
                </div>
              </form>
            </Card>
          )}
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             {schedule && schedule.length > 0 ? (
               schedule.map((item, index) => {
                 const now = new Date();
                 const [endTimeStr] = (item.time || '').split(' - ').slice(1);
                 const itemDate = item.date || new Date().toISOString().split('T')[0];
                 const [y, m, d] = itemDate.split('-').map(Number);
                 const [hh, mm] = (endTimeStr || '23:59').split(':').map(Number);
                 const endDt = new Date(y, m - 1, d, hh, mm, 0, 0);
                 const isPast = endDt < now;
                 return (
                 <div 
                   key={index} 
                   className={`flex flex-col sm:flex-row p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors border-l-4 ${item.color} ${isPast ? 'opacity-60' : ''}`}
                 >
                   <div className="w-full sm:w-32 flex-shrink-0 text-sm font-bold text-gray-500 flex flex-col justify-center mb-2 sm:mb-0 pb-2 sm:pb-0 border-b border-gray-100 sm:border-b-0">
                     <span className="text-xs font-normal text-gray-600 mb-1">{itemDate}</span>
                     <span>{item.time.split(' - ')[0]}</span>
                     <span className="text-xs font-normal text-gray-400">{item.time.split(' - ')[1]}</span>
                   </div>
                   <div className="flex-1 sm:pl-4 min-w-0">
                     <h4 className={`font-bold text-gray-900 truncate ${isPast ? 'line-through' : ''}`}>{item.subjectKey ? t(item.subjectKey) : item.subject}</h4>
                     <div className="flex flex-wrap items-center text-sm text-gray-500 mt-2 gap-3">
                       <span className="flex items-center gap-1 min-w-0 truncate">
                          <MapPin size={14} className="flex-shrink-0"/> 
                          {item.roomKey ? t(item.roomKey) : item.room}
                       </span>
                       <Badge color="bg-gray-100 text-gray-700">{t(`schedule.types.${item.type}`) || item.type}</Badge>
                     </div>
                   </div>
                   <div className="mt-2 sm:mt-0 sm:ml-4 flex-shrink-0 flex gap-2">
                     <button
                       onClick={() => handleEditMeeting(index)}
                       className="p-2 text-sky-600 hover:bg-sky-50 rounded-lg transition"
                       title={t('schedule.edit')}
                     >
                       <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                         <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                         <path d="m15 5 4 4"/>
                       </svg>
                     </button>
                     <button
                       onClick={() => handleDeleteMeeting(index)}
                       className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                       title={t('schedule.delete')}
                     >
                       <Trash2 size={18} />
                     </button>
                   </div>
                 </div>
               );
               })
             ) : (
                 <div className="p-8 text-center text-gray-500">
                 <Clock size={40} className="mx-auto mb-2 opacity-50"/>
                 <p>{t('schedule.no_meetings')}</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}