import React, { useState, useEffect } from 'react';
import { LogOut, Home, Users, Briefcase, Activity, Calendar, Shield, Users2, HelpCircle } from 'lucide-react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';

import HomeView from './components/views/HomeView';
import ClubsView from './components/views/ClubsView';
import ProjectsView from './components/views/ProjectsView';
import ActivityView from './components/views/ActivityView';
import ScheduleView from './components/views/ScheduleView';
import AdminView from './components/views/AdminView';
import ParliamentView from './components/views/ParliamentView';
import SupportView from './components/views/SupportView';
import ClubDetailsModal from './components/common/ClubDetailsModal';
import LoginView from './components/auth/LoginView';
import Modal from './components/common/Modal';
import Notification from './components/common/Notification';
import IsLoading from './components/common/IsLoading';
import SidebarItem from './components/layout/SidebarItem';
import { I18nProvider, getT, useTranslation } from './i18n';
import { authService, newsService, clubsService, scheduleService, projectsService, uploadService } from './api/services';

const NAV_TABS = [
  { key: 'home', labelKey: 'sidebar.home', path: '/', icon: Home },
  { key: 'clubs', labelKey: 'sidebar.clubs', path: '/clubs', icon: Users },
  { key: 'projects', labelKey: 'sidebar.projects', path: '/projects', icon: Briefcase },
  { key: 'activity', labelKey: 'sidebar.activity', path: '/activity', icon: Activity },
  { key: 'schedule', labelKey: 'sidebar.schedule', path: '/schedule', icon: Calendar },
  { key: 'parliament', labelKey: 'sidebar.parliament', path: '/parliament', icon: Users2 },
  { key: 'admin', labelKey: 'sidebar.admin', path: '/admin', icon: Shield },
  { key: 'support', labelKey: 'sidebar.support', path: '/support', icon: HelpCircle }
];

const determineTabKey = (pathname) => {
  if (pathname.startsWith('/admin')) return 'admin';
  if (pathname.startsWith('/support')) return 'support';
  if (pathname.startsWith('/parliament')) return 'parliament';
  if (pathname.startsWith('/schedule')) return 'schedule';
  if (pathname.startsWith('/activity')) return 'activity';
  if (pathname.startsWith('/projects')) return 'projects';
  if (pathname.startsWith('/club')) return 'clubs';
  if (pathname.startsWith('/clubs')) return 'clubs';
  return 'home';
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newsFeed, setNewsFeed] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [projects, setProjects] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [formData, setFormData] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [clubDetails, setClubDetails] = useState(null);
  const [clubDetailsLoading, setClubDetailsLoading] = useState(false);
  const [clubDetailsError, setClubDetailsError] = useState('');
  const [isClubModalOpen, setIsClubModalOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState(null);
  const [isSubmittingModal, setIsSubmittingModal] = useState(false);
  const [language, setLanguage] = useState(() => {
    if (typeof window === 'undefined') return 'ru';
    const saved = localStorage.getItem('language');
    return saved === 'en' ? 'en' : 'ru';
  });
  const t = getT(language);
  const toggleLanguage = () => setLanguage((prev) => (prev === 'ru' ? 'en' : 'ru'));

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const profile = await authService.getMe();
        setUser(profile);
        setIsAuthenticated(true);
        
        // Load data after auth
        const [newsData, clubsData, scheduleData, projectsData] = await Promise.all([
          newsService.getAll(),
          clubsService.getAll(),
          scheduleService.getAll(),
          projectsService.getAll()
        ]);
        console.log('[App] Loaded clubs data:', clubsData);
        setNewsFeed(newsData);
        setClubs(clubsData);
        setSchedule(scheduleData);
        setProjects(projectsData);
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('authToken');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login failed:', error);
      const message = error?.message || 'Ошибка входа. Проверьте данные.';
      addNotification(message, 'error');
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const handleLikePost = async (newsId) => {
    try {
      await newsService.like(newsId);
      setNewsFeed(prev => prev.map(n => 
        n.id === newsId ? { ...n, liked: !n.liked, likes: n.liked ? n.likes - 1 : n.likes + 1 } : n
      ));
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleOpenCreateClubModal = () => {
    setModalType('club');
    setFormData({
      name: '',
      category: 'Общество',
      description: '',
      color: 'bg-sky-600',
      socialLinks: {
        instagram: '',
        tiktok: '',
        telegram: '',
        youtube: '',
        website: ''
      },
      clubBackground: '',
      clubAvatar: '',
    });
    setModalOpen(true);
  };

  const handleOpenProjectModal = () => {
    setModalType('project');
    setFormData({ title: '', projectBackground: '' });
    setModalOpen(true);
  };

  const handleJoinClub = async (clubId) => {
    try {
      const updatedUser = await clubsService.join(clubId);
      setUser(updatedUser);
      addNotification('Вы присоединились к клубу!', 'success');
    } catch (error) {
      const message = error?.message || 'Ошибка при присоединении к клубу';
      console.error('Failed to join club:', error);
      addNotification(message, 'error');
    }
  };

  const handleOpenClubDetailsModal = async (club) => {
    if (!club?.id) return;
    setSelectedClub(club);
    setIsClubModalOpen(true);
    setClubDetails(null);
    setClubDetailsLoading(true);
    setClubDetailsError('');
    try {
      const details = await clubsService.getById(club.id);
      setClubDetails(details);
    } catch (error) {
      const message = error?.message || 'Не удалось загрузить клуб';
      setClubDetailsError(message);
      addNotification(message, 'error');
    } finally {
      setClubDetailsLoading(false);
    }
  };
  const handleCloseClubDetailsModal = () => {
    setIsClubModalOpen(false);
    setClubDetails(null);
    setSelectedClub(null);
    setClubDetailsError('');
    setClubDetailsLoading(false);
  };

  const handleSocialLinkChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: {
        ...(prev.socialLinks || {}),
        [key]: value
      }
    }));
  };

  const normalizeUrl = (value) => {
    if (!value) return '';
    const trimmed = value.trim();
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

  const isValidUrl = (value) => {
    if (!value) return true;
    const normalized = normalizeUrl(value);
    try {
      new URL(normalized);
      return true;
    } catch {
      return false;
    }
  };

  const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });

  const handleBackgroundUpload = async (field, file) => {
    if (!file) return;
    try {
      // Store file object for later upload to Cloudinary
      // For preview, generate DataURL
      const dataUrl = await readFileAsDataUrl(file);
      setFormData((prev) => ({ 
        ...prev, 
        [`${field}File`]: file,  // Store actual file for upload
        [field]: dataUrl  // Store DataURL for preview
      }));
    } catch (error) {
      console.error('Failed to load background image:', error);
    }
  };

  const handleLeaveClub = async (clubId) => {
    try {
      console.log('handleLeaveClub called with clubId:', clubId);
      const updatedUser = await clubsService.leave(clubId);
      console.log('updatedUser.joinedClubs:', updatedUser.joinedClubs);
      setUser(updatedUser);
      // Reload clubs to update member count
      const updatedClubs = await clubsService.getAll();
      console.log('updatedClubs:', updatedClubs);
      setClubs(updatedClubs);
      addNotification('Вы покинули клуб.', 'success');
    } catch (error) {
      console.error('Failed to leave club:', error);
      const message = error?.message || 'Ошибка при выходе из клуба';
      addNotification(message, 'error');
    }
  };

  const handleJoinProject = (projectId) => {
    if (!projectId) return;
    setUser((prev) => {
      if (!prev) return prev;
      const joined = prev.joinedProjects || [];
      if (joined.includes(projectId)) return prev;
      return { ...prev, joinedProjects: [...joined, projectId] };
    });
    addNotification('Вы присоединились к проекту!', 'success');
  };

  const handleDeleteClub = async (clubId) => {
    try {
      await clubsService.delete(clubId);
      setClubs((prev) => prev.filter((club) => club.id !== clubId));
      addNotification('Клуб удалён из списка', 'info');
    } catch (error) {
      console.error('Failed to delete club:', error);
      const message = error?.message || 'Не удалось удалить клуб';
      addNotification(message, 'error');
    }
  };

  const handleDeleteProject = (projectId) => {
    setProjects((prev) => prev.filter((project) => project.id !== projectId));
    addNotification('Проект удалён из списка', 'info');
  };

  const handleEditClub = (club) => {
    addNotification(`Редактирование клуба ${club.name}`, 'info');
    handleOpenClubDetailsModal(club);
  };

  const handleEditProject = (project) => {
    addNotification(`Редактирование проекта ${project.title || ''}`, 'info');
  };

  const handleModalSubmit = async () => {
    if (isSubmittingModal) return; // Prevent double submission
    
    let clubPayload;
    try {
      setIsSubmittingModal(true);
      if (modalType === 'club') {
        const { name, category, description, color } = formData;
        const backgroundType = formData.clubBackground ? 'image' : 'color';
        const socialLinks = formData.socialLinks || {};
        const socialLabelMap = {
          instagram: t('clubs.form.instagram_label'),
          tiktok: t('clubs.form.tiktok_label'),
          telegram: t('clubs.form.telegram_label'),
          youtube: t('clubs.form.youtube_label'),
          website: t('clubs.form.website_label')
        };

        // Validation: required fields
        if (!name.trim()) {
          addNotification('Введите название клуба', 'error');
          setIsSubmittingModal(false);
          return;
        }
        if (!description.trim()) {
          addNotification('Введите описание клуба', 'error');
          setIsSubmittingModal(false);
          return;
        }
        if (!formData.clubBackground) {
          addNotification('Загрузите фон клуба', 'error');
          setIsSubmittingModal(false);
          return;
        }
        if (!formData.clubAvatar) {
          addNotification('Загрузите аватарку клуба', 'error');
          setIsSubmittingModal(false);
          return;
        }

        // Check at least one social link
        const hasSocialLink = Object.values(socialLinks).some(v => v && v.trim());
        if (!hasSocialLink) {
          addNotification('Добавьте хотя бы одну ссылку на соцсеть', 'error');
          setIsSubmittingModal(false);
          return;
        }

        // Validation: URLs
        const invalidEntry = Object.entries(socialLinks).find(([, value]) => value && !isValidUrl(value));
        if (invalidEntry) {
          const [key] = invalidEntry;
          addNotification(`${t('clubs.form.invalid_url')} ${socialLabelMap[key] || key}`, 'error');
          setIsSubmittingModal(false);
          return;
        }

        const preparedLinks = Object.fromEntries(
          Object.entries(socialLinks).map(([key, value]) => [key, normalizeUrl(value)])
        );

        // Upload files to Cloudinary if they exist
        let backgroundUrl = formData.clubBackground || '';
        let clubAvatarUrl = formData.clubAvatar || '';

        try {
          // Upload background image to Cloudinary
          if (formData.clubBackgroundFile) {
            addNotification('Загружаем фон клуба...', 'info');
            const bgUpload = await uploadService.uploadImage(formData.clubBackgroundFile, 'club-backgrounds');
            backgroundUrl = bgUpload.url;
          }

          // Upload club avatar to Cloudinary
          if (formData.clubAvatarFile) {
            addNotification('Загружаем аватарку клуба...', 'info');
            const avatarUpload = await uploadService.uploadImage(formData.clubAvatarFile, 'club-avatars');
            clubAvatarUrl = avatarUpload.url;
          }
        } catch (uploadError) {
          console.error('Failed to upload images to Cloudinary:', uploadError);
          const errorMessage = uploadError?.message || 'Неизвестная ошибка';
          const errorDetails = uploadError?.response?.error || uploadError?.details || '';
          const fullMessage = errorDetails 
            ? `Ошибка загрузки: ${errorMessage} (${errorDetails})`
            : `Ошибка при загрузке изображений: ${errorMessage}`;
          addNotification(fullMessage, 'error');
          setIsSubmittingModal(false);
          return;
        }

        const payload = {
          name,
          category,
          description,
          color: color || 'bg-sky-600',
          backgroundUrl: backgroundUrl,
          clubAvatar: clubAvatarUrl,
          backgroundType,
          ...preparedLinks
        };
        clubPayload = payload;
        const missingClubFields = ['name', 'category', 'description'].filter((key) => !payload[key]?.trim());
        if (missingClubFields.length > 0) {
          console.warn('Club payload missing required fields:', missingClubFields);
        }
        const newClub = await clubsService.create(payload);
        setClubs(prev => [...prev, newClub]);
        addNotification('Клуб создан успешно!', 'success');
        setModalOpen(false);
        setFormData({});
      } else if (modalType === 'project') {
        const { title, status, needed } = formData;
        if (!title.trim()) {
          addNotification('Введите название проекта', 'error');
          return;
        }
        const neededArray = needed ? needed.split(',').map(s => s.trim()).filter(s => s) : [];
        const projectPayload = {
          title,
          description: formData.description || '',
          status: status || 'developing',
          author: user?.name || 'Студент',
          needed: neededArray,
          backgroundUrl: formData.projectBackground || ''
        };
        const newProject = await projectsService.create(projectPayload);
        setProjects(prev => [...prev, newProject]);
        addNotification('Проект создан успешно!', 'success');
        setModalOpen(false);
        setFormData({});
      }
    } catch (error) {
      const message = error?.message || 'Ошибка при создании клуба';
      console.error('Failed to create club:', { payload: clubPayload }, error);
      addNotification(message, 'error');
    } finally {
      setIsSubmittingModal(false);
    }
  };

  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleSubmitFeedback = (feedbackData) => {
    const newFeedback = {
      id: Date.now(),
      ...feedbackData,
      createdAt: new Date().toLocaleString(),
      accepted: false
    };
    setFeedback(prev => [newFeedback, ...prev]);
  };

  const handleAcceptFeedback = (acceptedFeedbackData) => {
    // Update the feedback item to mark as accepted
    setFeedback(prev => prev.map(f => 
      f.id === acceptedFeedbackData.id 
        ? { ...f, accepted: true, acceptedAt: acceptedFeedbackData.acceptedAt }
        : f
    ));
  };

  const handleCreateProject = handleOpenProjectModal;

  if (loading) {
    return (
      <I18nProvider language={language}>
        <div className="flex items-center justify-center h-screen bg-slate-50">
          <div className="text-center space-y-2">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-sky-600" />
            <p className="text-sm text-gray-600">Загрузка...</p>
          </div>
        </div>
      </I18nProvider>
    );
  }

  if (!isAuthenticated) {
    return (
      <I18nProvider language={language}>
        <LoginView onLogin={handleLogin} />
      </I18nProvider>
    );
  }

  return (
    <I18nProvider language={language}>
      <Router>
          <AppLayout
            user={user}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            newsFeed={newsFeed}
            clubs={clubs}
            schedule={schedule}
            setSchedule={setSchedule}
            projects={projects}
            feedback={feedback}
            handleLikePost={handleLikePost}
            handleOpenCreateClubModal={handleOpenCreateClubModal}
            onOpenClubModal={handleOpenClubDetailsModal}
            handleJoinClub={handleJoinClub}
            handleLeaveClub={handleLeaveClub}
            handleCreateProject={handleCreateProject}
            handleJoinProject={handleJoinProject}
            handleOpenClubDetailsModal={handleOpenClubDetailsModal}
            handleDeleteClub={handleDeleteClub}
            handleDeleteProject={handleDeleteProject}
            handleEditClub={handleEditClub}
            handleEditProject={handleEditProject}
            handleSubmitFeedback={handleSubmitFeedback}
            handleAcceptFeedback={handleAcceptFeedback}
            toggleLanguage={toggleLanguage}
            language={language}
            handleLogout={handleLogout}
          />

        <Modal
          isOpen={modalOpen}
          title={modalType === 'club' ? 'Создать клуб' : 'Создать проект'}
          onClose={() => setModalOpen(false)}
          onSubmit={handleModalSubmit}
          primaryLabel={modalType === 'club' ? 'Создать клуб' : 'Создать проект'}
          primaryDisabled={isSubmittingModal}
        >
        {modalType === 'club' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Название клуба</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Введите название"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
              <select
                value={formData.category || 'Общество'}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option>Общество</option>
                <option>Экология</option>
                <option>Творчество</option>
                <option>Наука</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Введите описание клуба"
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-600">{t('clubs.form.social_heading')}</p>
                <span className="text-xs uppercase tracking-wide text-slate-400">{t('clubs.form.social_optional')}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">{t('clubs.form.instagram_label')}</label>
                  <input
                    type="url"
                    value={(formData.socialLinks?.instagram) || ''}
                    onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                    placeholder={t('clubs.form.instagram_placeholder')}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">{t('clubs.form.tiktok_label')}</label>
                  <input
                    type="url"
                    value={(formData.socialLinks?.tiktok) || ''}
                    onChange={(e) => handleSocialLinkChange('tiktok', e.target.value)}
                    placeholder={t('clubs.form.tiktok_placeholder')}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">{t('clubs.form.telegram_label')}</label>
                  <input
                    type="url"
                    value={(formData.socialLinks?.telegram) || ''}
                    onChange={(e) => handleSocialLinkChange('telegram', e.target.value)}
                    placeholder={t('clubs.form.telegram_placeholder')}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">{t('clubs.form.youtube_label')}</label>
                  <input
                    type="url"
                    value={(formData.socialLinks?.youtube) || ''}
                    onChange={(e) => handleSocialLinkChange('youtube', e.target.value)}
                    placeholder={t('clubs.form.youtube_placeholder')}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">{t('clubs.form.website_label')}</label>
                  <div className="flex gap-2">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-200 bg-white text-xs font-semibold text-gray-500">https://</span>
                    <input
                      type="url"
                      value={(formData.socialLinks?.website) || ''}
                      onChange={(e) => handleSocialLinkChange('website', e.target.value)}
                      placeholder={t('clubs.form.website_placeholder')}
                      className="flex-1 px-3 py-2 rounded-r-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Аватарка клуба</label>
              <div className="h-20 rounded-2xl border border-dashed border-gray-300 bg-slate-50 overflow-hidden flex items-center justify-center">
                {formData.clubAvatar ? (
                  <img src={formData.clubAvatar} alt="club avatar" className="h-full w-full object-cover rounded-2xl" />
                ) : (
                  <div className="text-xs text-gray-500">Аватарка не выбрана</div>
                )}
              </div>
              <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 cursor-pointer">
                Загрузить аватарку
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleBackgroundUpload('clubAvatar', e.target.files?.[0])}
                />
              </label>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Фон клуба</label>
              <div className="h-28 rounded-2xl border border-dashed border-gray-300 bg-slate-50 overflow-hidden">
                {formData.clubBackground ? (
                  <img src={formData.clubBackground} alt="club background" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-gray-500">Фон не выбран</div>
                )}
              </div>
              <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 cursor-pointer">
                Загрузить фон
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleBackgroundUpload('clubBackground', e.target.files?.[0])}
                />
              </label>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs font-semibold text-gray-600 mb-2">Предпросмотр:</p>
              <div
                className="h-20 rounded-lg mb-3 overflow-hidden border border-gray-200 relative"
                style={formData.clubBackground ? { backgroundImage: `url(${formData.clubBackground})`, backgroundSize: 'cover' } : { backgroundColor: '#e0e7ff' }}
              >
                {!formData.clubBackground && <div className={`${formData.color || 'bg-sky-600'} h-full w-full`} />}
                {formData.clubAvatar && (
                  <div className="absolute top-2 left-2 h-12 w-12 rounded-full border-2 border-white overflow-hidden shadow-md">
                    <img src={formData.clubAvatar} alt="avatar" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
              <h3 className="font-bold text-gray-900">{formData.name || 'Название клуба'}</h3>
              <p className="text-sm text-gray-600">{formData.category || 'Категория'}</p>
              <p className="text-xs text-gray-500 mt-1">{formData.description || 'Описание клуба'}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Название проекта</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Введите название"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
              <select
                value={formData.status || 'developing'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="developing">В разработке</option>
                <option value="mvp">MVP</option>
                <option value="script">Сценарий</option>
                <option value="completed">Завершен</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Требуемые роли (через запятую)</label>
              <input
                type="text"
                value={formData.needed || ''}
                onChange={(e) => setFormData({ ...formData, needed: e.target.value })}
                placeholder="Frontend, Backend, Designer"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Описание проекта</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Введите описание проекта"
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Фон проекта</label>
              <div className="h-24 rounded-2xl border border-dashed border-gray-300 bg-slate-50 overflow-hidden">
                {formData.projectBackground ? (
                  <img src={formData.projectBackground} alt="project background" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-gray-500">Фон не выбран</div>
                )}
              </div>
              <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 cursor-pointer">
                Загрузить фон
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleBackgroundUpload('projectBackground', e.target.files?.[0])}
                />
              </label>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs font-semibold text-gray-600 mb-2">Предпросмотр:</p>
              <div
                className="border-l-4 border-l-sky-500 pl-3 rounded-lg overflow-hidden"
                style={formData.projectBackground ? { backgroundImage: `url(${formData.projectBackground})`, backgroundSize: 'cover' } : { backgroundColor: '#e0f2fe' }}
              >
                <h3 className="font-bold text-gray-900">{formData.title || 'Название проекта'}</h3>
                <p className="text-sm text-gray-600 mt-1"><span className="font-semibold">Статус:</span> {formData.status || 'developing'}</p>
                <p className="text-sm text-gray-600"><span className="font-semibold">Автор:</span> {user?.name || 'Студент'}</p>
                {formData.description && (
                  <p className="text-sm text-gray-600 mt-1"><span className="font-semibold">Описание:</span> {formData.description}</p>
                )}
                {formData.needed && (
                  <p className="text-sm text-gray-600 mt-1"><span className="font-semibold">Ищем:</span> {formData.needed}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
        <Notification notifications={notifications} onRemove={removeNotification} />
        <IsLoading active={loading} />
        {isClubModalOpen && clubDetailsLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {isClubModalOpen && clubDetailsError && !clubDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full text-center space-y-4">
              <p className="text-lg font-semibold text-gray-900">{t('clubs.error.loading_title')}</p>
              <p className="text-sm text-gray-600">{clubDetailsError}</p>
              <button
                onClick={handleCloseClubDetailsModal}
                className="px-4 py-2 rounded-lg bg-sky-600 text-white font-semibold hover:bg-sky-500 transition"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        )}
        {isClubModalOpen && (
          <ClubDetailsModal club={clubDetails || selectedClub} onClose={handleCloseClubDetailsModal} />
        )}
      </Router>
    </I18nProvider>
  );
}

function AppLayout({
  user,
  searchQuery,
  setSearchQuery,
  sidebarOpen,
  setSidebarOpen,
  newsFeed,
  clubs,
  schedule,
  setSchedule,
  projects,
  handleLikePost,
  handleOpenCreateClubModal,
  onOpenClubModal,
  handleJoinClub,
  handleLeaveClub,
  handleCreateProject,
  handleJoinProject,
  handleOpenClubDetailsModal,
  handleDeleteClub,
  handleDeleteProject,
  handleEditClub,
  handleEditProject,
  toggleLanguage,
  language,
  handleLogout,
  feedback,
  handleSubmitFeedback,
  handleAcceptFeedback,
}) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab = determineTabKey(location.pathname);
  const headerTitle = t(NAV_TABS.find((tab) => tab.key === activeTab)?.labelKey || 'sidebar.home');
  const availableTabs = NAV_TABS.filter((tab) => tab.key !== 'admin' || user?.isAdmin);

  const handleNavClick = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <aside
        className={`fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 z-30 lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-sky-600">{t('app.name')}</h2>
        </div>
        <nav className="space-y-2 p-4">
          {availableTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <SidebarItem
                key={tab.key}
                icon={<Icon size={20} />}
                label={t(tab.labelKey)}
                onClick={() => handleNavClick(tab.path)}
                active={activeTab === tab.key}
              />
            );
          })}
        </nav>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
          <div className="flex items-center gap-4 px-4 md:px-6 py-4 w-full">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen((prev) => !prev)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition"
              >
                ☰
              </button>
              <h1 className="text-2xl font-semibold whitespace-nowrap">{headerTitle}</h1>
            </div>
            <div className="hidden md:flex flex-1 justify-center px-4">
              <input
                type="text"
                placeholder={t('search.placeholder_short')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full max-w-xl px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                aria-label={t(`language.switch_to_${language === 'ru' ? 'en' : 'ru'}`)}
                title={t(`language.switch_to_${language === 'ru' ? 'en' : 'ru'}`)}
              >
                <span className={language === 'en' ? 'text-slate-900' : 'text-slate-400'}>EN</span>
                <span className="text-xs text-slate-400">/</span>
                <span className={language === 'ru' ? 'text-slate-900' : 'text-slate-400'}>RU</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <LogOut size={14} />
                Выход
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-10">
          <Routes>
            <Route
              path="/"
              element={
                <HomeView
                  newsFeed={newsFeed}
                  clubs={clubs}
                  schedule={schedule}
                  handleLikePost={handleLikePost}
                  onNavigate={(path) => navigate(path)}
                  onViewClub={onOpenClubModal}
                />
              }
            />
            <Route
              path="/clubs"
              element={
                <ClubsView
                  clubs={clubs}
                  joinedClubs={user?.joinedClubs || []}
                  onCreateClub={handleOpenCreateClubModal}
                  onJoinClub={handleJoinClub}
                  onViewClub={onOpenClubModal}
                />
              }
            />
            <Route path="/projects" element={<ProjectsView projects={projects} joinedProjectIds={user?.joinedProjects || []} onAddProject={handleCreateProject} onJoinProject={handleJoinProject} />} />
            <Route
              path="/activity"
              element={
                <ActivityView
                  user={user}
                  clubs={clubs}
                  projects={projects}
                  onLeaveClub={handleLeaveClub}
                  onViewClub={handleOpenClubDetailsModal}
                  onJoinClub={handleJoinClub}
                  onJoinProject={handleJoinProject}
                  onDeleteClub={handleDeleteClub}
                  onDeleteProject={handleDeleteProject}
                  onEditClub={handleEditClub}
                  onEditProject={handleEditProject}
                />
              }
            />
            <Route path="/schedule" element={<ScheduleView schedule={schedule} setSchedule={setSchedule} />} />
            <Route path="/parliament" element={<ParliamentView user={user} />} />
            <Route
              path="/admin"
              element={user?.isAdmin ? <AdminView user={user} feedback={feedback} onAcceptFeedback={handleAcceptFeedback} /> : <div className="text-center text-gray-500">{t('common.access_denied')}</div>}
            />
            <Route path="/support" element={<SupportView onSubmitFeedback={handleSubmitFeedback} user={user} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
