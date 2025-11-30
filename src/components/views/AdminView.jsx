import React, { useState, useEffect } from 'react';
import { Card } from '../common/UI';
import { newsService, parliamentService, clubsService, projectsService } from '../../api/services';
import { Trash2, Edit2, CheckCircle } from 'lucide-react';
import ConfirmModal from '../common/ConfirmModal';
import Modal from '../common/Modal';

const emptyMemberForm = {
  name: '',
  role: '',
  position: '',
  description: '',
  groupName: '',
  avatarUrl: ''
};

const placeholderStyles = `
  .admin-form input::placeholder,
  .admin-form textarea::placeholder {
    color: rgba(255, 255, 255, 0.8);
  }
  .admin-form input,
  .admin-form textarea {
    color: #ffffff;
  }
`;

export default function AdminView({ user }) {
  const [activeTab, setActiveTab] = useState('news');
  const [allNews, setAllNews] = useState([]);
  const [newNewsForm, setNewNewsForm] = useState({ author: 'Студенческий Совет', content: '', tags: '' });
  const [commentsMap, setCommentsMap] = useState({});

  const [parliamentMembers, setParliamentMembers] = useState([]);
  const [memberForm, setMemberForm] = useState(emptyMemberForm);
  const [currentMember, setCurrentMember] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [isFormSaving, setIsFormSaving] = useState(false);

  const [clubs, setClubs] = useState([]);
  const [projects, setProjects] = useState([]);

  const [notification, setNotification] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3200);
  };

  const openConfirmDialog = (config) => setConfirmDialog({ ...config });
  const closeConfirmDialog = () => setConfirmDialog(null);

  const loadNews = async () => {
    const news = await newsService.getAll();
    setAllNews(news);
    const comments = {};
    await Promise.all(
      news.map(async (item) => {
        try {
          comments[item.id] = await newsService.getComments(item.id);
        } catch {
          comments[item.id] = [];
        }
      })
    );
    setCommentsMap(comments);
  };

  const loadParliament = async () => {
    const members = await parliamentService.getAll();
    setParliamentMembers(members);
  };

  const loadClubs = async () => {
    const allClubs = await clubsService.getAll();
    setClubs(allClubs);
  };

  const loadProjects = async () => {
    const allProjects = await projectsService.getAll();
    setProjects(allProjects);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([loadNews(), loadParliament(), loadClubs(), loadProjects()]);
      } catch (error) {
        console.error('Admin data load failed', error);
      }
    };
    fetchData();
  }, []);

  const handleAddNews = async () => {
    if (!newNewsForm.content.trim()) return;

    try {
      const tags = newNewsForm.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);
      await newsService.create({
        author: newNewsForm.author,
        content: newNewsForm.content,
        tags
      });
      setNewNewsForm({ author: 'Студенческий Совет', content: '', tags: '' });
      await loadNews();
      showNotification('Новость опубликована');
    } catch (error) {
      console.error('Failed to add news:', error);
      showNotification('Не удалось опубликовать новость');
    }
  };

  const confirmDeleteNews = (newsId) => {
    openConfirmDialog({
      title: 'Удалить новость',
      message: 'Вы действительно хотите удалить эту новость?',
      confirmText: 'Удалить',
      cancelText: 'Отмена',
      isDangerous: true,
      onConfirm: async () => {
        closeConfirmDialog();
        try {
          await newsService.delete(newsId);
          await loadNews();
          showNotification('Новость удалена');
        } catch (error) {
          console.error('delete news', error);
          showNotification('Не удалось удалить новость');
        }
      },
      onCancel: closeConfirmDialog
    });
  };

  const confirmDeleteComment = (newsId, commentId) => {
    openConfirmDialog({
      title: 'Удалить комментарий',
      message: 'Комментарий будет удалён без возможности восстановления.',
      confirmText: 'Удалить',
      cancelText: 'Отмена',
      isDangerous: true,
      onConfirm: async () => {
        closeConfirmDialog();
        try {
          await newsService.deleteComment(newsId, commentId);
          await loadNews();
          showNotification('Комментарий удалён');
        } catch (error) {
          console.error('delete comment', error);
          showNotification('Не удалось удалить комментарий');
        }
      },
      onCancel: closeConfirmDialog
    });
  };

  const handleAvatarUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setMemberForm((prev) => ({ ...prev, avatarUrl: reader.result || '' }));
    };
    reader.readAsDataURL(file);
  };

  const handleFormChange = (field, value) => {
    setMemberForm((prev) => ({ ...prev, [field]: value }));
  };

  const getNormalizedMemberForm = () => {
    const computedRole = memberForm.role?.trim()
      ? memberForm.role
      : memberForm.position?.trim()
      ? memberForm.position
      : 'Член парламента';
    return { ...memberForm, role: computedRole };
  };

  const validateMemberForm = (form = memberForm) => {
    if (!form.name.trim()) {
      setFormError('Имя обязательно');
      return false;
    }
    if (!form.position.trim()) {
      setFormError('Должность обязательна');
      return false;
    }
    setFormError('');
    return true;
  };

  const openAddMemberModal = () => {
    setMemberForm({ ...emptyMemberForm });
    setCurrentMember(null);
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleAddMember = async () => {
    const normalizedForm = getNormalizedMemberForm();
    setMemberForm(normalizedForm);
    if (!validateMemberForm(normalizedForm)) return;
    setIsFormSaving(true);
    try {
      await parliamentService.addMember(normalizedForm);
      await loadParliament();
      setIsAddModalOpen(false);
      setMemberForm({ ...emptyMemberForm });
      showNotification('Участник добавлен');
    } catch (error) {
      console.error('add member', error);
      setFormError('Не удалось добавить участника');
    } finally {
      setIsFormSaving(false);
    }
  };

  const openEditMemberModal = (member) => {
    setCurrentMember(member);
    setMemberForm({
      name: member.name || '',
      role: member.role || '',
      position: member.position || '',
      description: member.description || '',
      groupName: member.groupName || '',
      avatarUrl: member.avatarUrl || member.avatar || ''
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handleUpdateMember = async () => {
    if (!currentMember) return;
    const normalizedForm = getNormalizedMemberForm();
    setMemberForm(normalizedForm);
    if (!validateMemberForm(normalizedForm)) return;
    setIsFormSaving(true);
    try {
      await parliamentService.updateMember(currentMember.id, normalizedForm);
      await loadParliament();
      setIsEditModalOpen(false);
      setCurrentMember(null);
      setMemberForm({ ...emptyMemberForm });
      showNotification('Изменения сохранены');
    } catch (error) {
      console.error('update member', error);
      setFormError('Не удалось сохранить изменения');
    } finally {
      setIsFormSaving(false);
    }
  };

  const deleteMember = (member) => {
    openConfirmDialog({
      title: 'Удалить участника',
      message: `Вы уверены, что хотите удалить ${member.name}?`,
      confirmText: 'Удалить',
      cancelText: 'Отмена',
      isDangerous: true,
      onConfirm: async () => {
        closeConfirmDialog();
        try {
          await parliamentService.deleteMember(member.id);
          await loadParliament();
          showNotification('Участник удалён');
        } catch (error) {
          console.error('delete member', error);
          showNotification('Не удалось удалить участника');
        }
      },
      onCancel: closeConfirmDialog
    });
  };

  const handleDeleteClub = (clubId) => {
    openConfirmDialog({
      title: 'Удалить клуб',
      message: 'Клуб исчезнет из списка, и его запись нельзя восстановить.',
      confirmText: 'Удалить',
      cancelText: 'Отмена',
      isDangerous: true,
      onConfirm: async () => {
        closeConfirmDialog();
        try {
          await clubsService.delete(clubId);
          await loadClubs();
          showNotification('Клуб удалён');
        } catch (error) {
          console.error('delete club', error);
          showNotification('Не удалось удалить клуб');
        }
      },
      onCancel: closeConfirmDialog
    });
  };

  const handleDeleteProject = (projectId) => {
    openConfirmDialog({
      title: 'Удалить проект',
      message: 'Проект будет удалён без возможности восстановления.',
      confirmText: 'Удалить',
      cancelText: 'Отмена',
      isDangerous: true,
      onConfirm: async () => {
        closeConfirmDialog();
        try {
          await projectsService.delete(projectId);
          await loadProjects();
          showNotification('Проект удалён');
        } catch (error) {
          console.error('delete project', error);
          showNotification('Не удалось удалить проект');
        }
      },
      onCancel: closeConfirmDialog
    });
  };

  const renderMemberFormFields = () => {
    const avatarPlaceholder = memberForm.name ? memberForm.name[0].toUpperCase() : 'П';
    return (
      <div className="space-y-4 text-sm">
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1">Имя</label>
          <input
            type="text"
            value={memberForm.name}
            onChange={(e) => handleFormChange('name', e.target.value)}
            placeholder="ФИО участника"
            className="w-full px-3 py-2 bg-slate-900/60 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1">Должность</label>
          <input
            type="text"
            value={memberForm.position}
            onChange={(e) => handleFormChange('position', e.target.value)}
            placeholder="Например, председатель студсовета"
            className="w-full px-3 py-2 bg-slate-900/60 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1">Группа/факультет</label>
          <input
            type="text"
            value={memberForm.groupName}
            onChange={(e) => handleFormChange('groupName', e.target.value)}
            placeholder="Пример: Физико-математический"
            className="w-full px-3 py-2 bg-slate-900/60 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1">Описание</label>
          <textarea
            rows={3}
            value={memberForm.description}
            onChange={(e) => handleFormChange('description', e.target.value)}
            placeholder="Коротко о том, чем занимается участник"
            className="w-full px-3 py-2 bg-slate-900/60 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1">Фото</label>
          <div className="flex items-center gap-3">
            {memberForm.avatarUrl ? (
              <img src={memberForm.avatarUrl} alt="avatar" className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-lg font-semibold text-sky-400">
                {avatarPlaceholder}
              </div>
            )}
            <label className="cursor-pointer px-3 py-1 border border-gray-600 rounded-lg text-xs font-semibold text-gray-400">
              Загрузить фото
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleAvatarUpload(e.target.files?.[0])} />
            </label>
          </div>
        </div>
        {formError && <p className="text-xs text-rose-400">{formError}</p>}
      </div>
    );
  };

  if (!user || !user.isAdmin) {
    return <div className="p-10 text-center text-gray-500">Доступ запрещён</div>;
  }

  return (
    <>
      <style>{placeholderStyles}</style>
      <div className="space-y-6 admin-form">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Администрирование</h1>
            <p className="text-sm text-gray-500">Используйте модальные формы для управления парламентом и публикациями.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('news')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${
                activeTab === 'news' ? 'bg-white text-sky-600 border border-sky-600' : 'bg-slate-100 text-slate-600'
              }`}
            >
              Новости
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('parliament')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${
                activeTab === 'parliament'
                  ? 'bg-white text-sky-600 border border-sky-600'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              Парламент
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('clubs')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${
                activeTab === 'clubs' ? 'bg-white text-sky-600 border border-sky-600' : 'bg-slate-100 text-slate-600'
              }`}
            >
              Клубы
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('projects')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${
                activeTab === 'projects' ? 'bg-white text-sky-600 border border-sky-600' : 'bg-slate-100 text-slate-600'
              }`}
            >
              Проекты
            </button>
          </div>
        </div>

        {notification && (
          <div className="fixed top-5 right-5 z-50 flex items-center gap-3 rounded-lg border border-sky-200/60 bg-white px-4 py-3 shadow-lg">
            <CheckCircle className="text-sky-500" size={20} />
            <span className="text-sm font-medium text-slate-700">{notification}</span>
          </div>
        )}

        {confirmDialog && (
          <ConfirmModal
            isOpen
            title={confirmDialog.title}
            message={confirmDialog.message}
            confirmText={confirmDialog.confirmText}
            cancelText={confirmDialog.cancelText}
            isDangerous={confirmDialog.isDangerous}
            onConfirm={confirmDialog.onConfirm}
            onCancel={confirmDialog.onCancel}
          />
        )}

        {activeTab === 'news' && (
          <div className="space-y-6">
            <Card className="p-6 bg-slate-900/70 text-white">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Создать новость</h2>
                <input
                  type="text"
                  value={newNewsForm.author}
                  onChange={(e) => setNewNewsForm((prev) => ({ ...prev, author: e.target.value }))}
                  placeholder="Автор"
                  className="w-full rounded-lg border border-gray-800 bg-slate-800/80 px-3 py-2"
                />
                <textarea
                  rows={4}
                  value={newNewsForm.content}
                  onChange={(e) => setNewNewsForm((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="Текст новости"
                  className="w-full rounded-lg border border-gray-800 bg-slate-800/80 px-3 py-2"
                />
                <input
                  type="text"
                  value={newNewsForm.tags}
                  onChange={(e) => setNewNewsForm((prev) => ({ ...prev, tags: e.target.value }))}
                  placeholder="Теги через запятую"
                  className="w-full rounded-lg border border-gray-800 bg-slate-800/80 px-3 py-2"
                />
                <button
                  type="button"
                  onClick={handleAddNews}
                  disabled={!newNewsForm.content.trim()}
                  className="w-fit rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white ring-2 ring-transparent transition hover:bg-sky-500 disabled:opacity-50"
                >
                  Опубликовать
                </button>
              </div>
            </Card>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Все новости ({allNews.length})</h2>
              {allNews.map((news) => (
                <Card key={news.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{news.author}</div>
                      {news.time && <div className="text-xs text-gray-500">{news.time}</div>}
                    </div>
                    <button
                      type="button"
                      onClick={() => confirmDeleteNews(news.id)}
                      className="rounded-full p-2 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p className="mt-3 text-gray-700">{news.content}</p>
                  {commentsMap[news.id] && commentsMap[news.id].length > 0 && (
                    <div className="mt-4 space-y-2 rounded-lg bg-gray-50 p-3">
                      <div className="text-xs font-semibold text-gray-600">Комментарии ({commentsMap[news.id].length})</div>
                      {commentsMap[news.id].map((comment) => (
                        <div key={comment.id} className="flex items-start justify-between rounded-lg bg-white p-2 shadow-sm">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{comment.author}</div>
                            <p className="text-sm text-gray-600">{comment.text}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => confirmDeleteComment(news.id, comment.id)}
                            className="text-red-600 hover:text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'parliament' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Парламент</h2>
                <p className="text-sm text-gray-500">Добавляйте и редактируйте участников через модальные формы.</p>
              </div>
              <button
                type="button"
                onClick={openAddMemberModal}
                className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500"
              >
                Добавить участника
              </button>
            </div>
            {parliamentMembers.length === 0 ? (
              <Card className="p-6 text-center text-sm text-gray-500">Участники ещё не добавлены.</Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {parliamentMembers.map((member) => (
                  <Card key={member.id} className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {member.avatarUrl ? (
                          <img src={member.avatarUrl} alt={member.name} className="h-12 w-12 rounded-full object-cover" />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-lg font-semibold text-sky-600">
                            {member.name?.[0] || 'П'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="text-md font-semibold text-gray-900 truncate">{member.name}</div>
                          {member.position && <p className="text-sm text-gray-500">{member.position}</p>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEditMemberModal(member)}
                          className="rounded-full bg-slate-100 p-2 text-sky-600 hover:bg-slate-200"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteMember(member)}
                          className="rounded-full bg-red-50 p-2 text-red-600 hover:bg-red-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    {member.groupName && <p className="text-xs text-gray-500">{member.groupName}</p>}
                    {member.description && <p className="text-sm text-gray-600">{member.description}</p>}
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'clubs' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Клубы ({clubs.length})</h2>
            {clubs.map((club) => (
              <Card key={club.id} className="p-4">
                <div className="flex justify-between">
                  <div className="space-y-1">
                    <div className="text-md font-semibold text-gray-900">{club.name}</div>
                    <div className="text-sm text-gray-500">{club.category}</div>
                    <p className="text-xs text-gray-500">{club.members} участников</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteClub(club.id)}
                    className="rounded-full p-2 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Проекты ({projects.length})</h2>
            {projects.map((project) => (
              <Card key={project.id} className="p-4">
                <div className="flex justify-between">
                  <div className="space-y-1">
                    <div className="text-md font-semibold text-gray-900">{project.title}</div>
                    <div className="text-sm text-gray-500">{project.author}</div>
                    <p className="text-xs text-gray-500">Статус: {project.status}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteProject(project.id)}
                    className="rounded-full p-2 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={isAddModalOpen}
        title="Добавить участника"
        primaryLabel="Добавить"
        primaryDisabled={isFormSaving}
        onClose={() => {
          setIsAddModalOpen(false);
          setFormError('');
          setMemberForm({ ...emptyMemberForm });
        }}
        onSubmit={async () => {
          await handleAddMember();
        }}
      >
        {renderMemberFormFields()}
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        title="Редактировать участника"
        primaryLabel="Сохранить"
        primaryDisabled={isFormSaving}
        onClose={() => {
          setIsEditModalOpen(false);
          setFormError('');
          setMemberForm({ ...emptyMemberForm });
          setCurrentMember(null);
        }}
        onSubmit={async () => {
          await handleUpdateMember();
        }}
      >
        {renderMemberFormFields()}
      </Modal>
    </>
  );
}
