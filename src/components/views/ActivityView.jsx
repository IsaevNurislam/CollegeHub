import React, { useMemo, useState, useEffect } from 'react';
import { Award, Shield, UserCheck } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { Card, Badge } from '../common/UI';
import EmptyState from '../common/EmptyState';
import ProjectDetailsModal from '../common/ProjectDetailsModal';

const SectionCard = ({
  item,
  type,
  showEdit,
  showJoin,
  showDelete,
  showParticipants,
  actions = {},
  activeMembers,
  onShowMembers,
  onEdit,
  onDelete,
  onJoin,
  onLeave,
  onOpenDetails,
  sectionId
}) => {
  const { t } = useTranslation();
  const shouldShowMembers = showParticipants && activeMembers?.sectionId === sectionId && activeMembers?.id === item?.id;
  const title = item?.title || item?.name || item?.club || t('common.details');
  const description = item?.description || item?.category || item?.subtitle;
  const statusLabel = type === 'project' && item?.status ? t(`projects.statuses.${item.status}`) : null;
  const metadata = type === 'club'
    ? typeof item?.members === 'number'
      ? `${item.members} ${t('clubs.members_label')}`
      : item?.category
    : statusLabel || item?.author;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpenDetails?.(item)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpenDetails?.(item);
        }
      }}
      className="cursor-pointer"
    >
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-400">{type === 'club' ? t('clubs.title') : t('projects.heading')}</p>
        <h4 className="text-lg font-semibold text-gray-900">{title}</h4>
        {description && <p className="text-sm text-gray-500">{description}</p>}
        {metadata && <p className="text-xs text-gray-500 mt-1">{metadata}</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        {showJoin && onJoin && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onJoin(item);
            }}
            className="text-xs px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-100 hover:bg-sky-100 transition"
          >
            {t('activity.join_button')}
          </button>
        )}
        {actions.leave && onLeave && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onLeave(item);
            }}
            className="text-xs px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-100 hover:bg-rose-100 transition"
          >
            {t('activity.leave_club')}
          </button>
        )}
        {showEdit && onEdit && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onEdit(item);
            }}
            className="text-xs px-3 py-1.5 rounded-lg border border-sky-200 text-sky-600 bg-white hover:bg-sky-50 transition"
          >
            Редактировать
          </button>
        )}
        {showDelete && onDelete && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(item);
            }}
            className="text-xs px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 transition"
          >
            Удалить
          </button>
        )}
        {showParticipants && onShowMembers && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onShowMembers(item);
            }}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100 transition"
          >
            Участники
          </button>
        )}
      </div>
      {shouldShowMembers && (
        <div className="mt-3 text-xs text-gray-600">
          <p className="font-semibold text-slate-700">Участники:</p>
          <p className="truncate">{activeMembers.names.join(', ') || t('activity.last_action_empty')}</p>
        </div>
      )}
      </div>
    </div>
  );
};

const generateMemberNames = (item) => {
  if (!item) return [];
  if (Array.isArray(item.members)) return item.members;
  if (Array.isArray(item.participants)) return item.participants;
  if (Array.isArray(item.team)) return item.team;
  return [];
};

export default function ActivityView({
  user,
  clubs = [],
  projects = [],
  onLeaveClub = () => {},
  onDeleteClub = () => {},
  onDeleteProject = () => {},
  onEditClub = () => {},
  onEditProject = () => {},
  onJoinProject = () => {},
  onViewClub = () => {}
}) {
  const { t } = useTranslation();
  const joinedClubs = useMemo(() => user?.joinedClubs ?? [], [user?.joinedClubs]);
  const joinedProjects = useMemo(() => user?.joinedProjects ?? [], [user?.joinedProjects]);

  const createdClubs = useMemo(() => clubs.filter((club) => club.creatorId === user?.id), [clubs, user?.id]);
  const createdProjects = useMemo(
    () => projects.filter((project) => project.author === user?.name),
    [projects, user?.name]
  );
  const joinedOnlyClubs = useMemo(
    () => clubs.filter((club) => joinedClubs.includes(club.id) && club.creatorId !== user?.id),
    [clubs, joinedClubs, user?.id]
  );
  const joinedOnlyProjects = useMemo(
    () => projects.filter((project) => joinedProjects.includes(project.id)),
    [projects, joinedProjects]
  );

  const [myClubs, setMyClubs] = useState(createdClubs);
  const [joinedClubsState, setJoinedClubsState] = useState(joinedOnlyClubs);
  const [myProjects, setMyProjects] = useState(createdProjects);
  const [joinedProjectsState, setJoinedProjectsState] = useState(joinedOnlyProjects);
  const [activeMembers, setActiveMembers] = useState({ id: null, names: [], sectionId: null });
  const [selectedProject, setSelectedProject] = useState(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  useEffect(() => {
    setMyClubs(createdClubs);
  }, [createdClubs]);

  useEffect(() => {
    setJoinedClubsState(joinedOnlyClubs);
  }, [joinedOnlyClubs]);

  useEffect(() => {
    setMyProjects(createdProjects);
  }, [createdProjects]);

  useEffect(() => {
    setJoinedProjectsState(joinedOnlyProjects);
  }, [joinedOnlyProjects]);

  const handleShowMembers = (sectionId, item) => {
    setActiveMembers((prev) => {
      if (prev.id === item.id) {
        return { id: null, names: [], sectionId: null };
      }
      return { id: item.id, names: generateMemberNames(item), sectionId };
    });
  };

  const handleDelete = (item, setter, callback) => {
    setter((prev) => prev.filter((value) => value.id !== item.id));
    callback(item.id);
  };

  const handleCloseProjectModal = () => {
    setIsProjectModalOpen(false);
    setSelectedProject(null);
  };

  const handleSectionItemClick = (sectionId, item) => {
    const normalizedId = sectionId.toLowerCase();
    if (normalizedId.includes('club')) {
      onViewClub(item);
      return;
    }
    setSelectedProject(item);
    setIsProjectModalOpen(true);
  };

  const scrollableSections = new Set(['myClubs', 'joinedClubs']);
  const sectionConfig = [
    {
      id: 'myClubs',
      title: t('activity.my_clubs_title'),
      icon: <Award size={18} className="text-yellow-500" />,
      items: myClubs,
      actions: { leave: false },
      showEdit: true,
      showJoin: false,
      showParticipants: true,
      emptyLabel: t('activity.no_created_clubs'),
      deleteHandler: (item) => handleDelete(item, setMyClubs, onDeleteClub),
      editHandler: onEditClub,
      leaveHandler: onLeaveClub
    },
    {
      id: 'joinedClubs',
      title: t('activity.joined_clubs_title'),
      icon: <Award size={18} className="text-sky-500" />,
      items: joinedClubsState,
      actions: { leave: true },
      showEdit: false,
      showJoin: false,
      showParticipants: false,
      showDelete: false,
      emptyLabel: t('activity.no_joined_clubs'),
      deleteHandler: (item) => handleDelete(item, setJoinedClubsState, onLeaveClub),
      leaveHandler: onLeaveClub
    },
    {
      id: 'myProjects',
      title: t('activity.my_projects_title'),
      icon: <Shield size={18} className="text-sky-600" />, 
      items: myProjects,
      actions: { leave: false },
      showEdit: true,
      showJoin: false,
      showParticipants: true,
      emptyLabel: t('activity.no_created_projects'),
      deleteHandler: (item) => handleDelete(item, setMyProjects, onDeleteProject),
      editHandler: onEditProject
    },
    {
      id: 'joinedProjects',
      title: t('activity.joined_projects_title'),
      icon: <UserCheck size={18} className="text-purple-500" />,
      items: joinedProjectsState,
      actions: { leave: false },
      showEdit: false,
      showJoin: false,
      showParticipants: false,
      emptyLabel: t('activity.no_joined_projects'),
      deleteHandler: (item) => handleDelete(item, setJoinedProjectsState, onDeleteProject),
      leaveHandler: onLeaveClub,
      joinHandler: onJoinProject
    }
  ];

  const totalItems = myClubs.length + joinedClubsState.length + myProjects.length + joinedProjectsState.length;

  return (
    <div className="space-y-6">
      {totalItems > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sectionConfig.map((section) => (
            <Card key={section.id}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {section.icon}
                  <h3 className="font-bold text-gray-800">{section.title}</h3>
                </div>
                <Badge color="bg-slate-50 text-slate-600 border border-slate-200">{section.items.length}</Badge>
              </div>
              {section.items.length > 0 ? (
                <div
                  className={`space-y-3 ${scrollableSections.has(section.id) ? 'max-h-[28rem] overflow-y-auto pr-1' : ''}`}
                >
                  {section.items.map((item) => (
                    <SectionCard
                      key={item.id}
                      item={item}
                      type={section.id.toLowerCase().includes('club') ? 'club' : 'project'}
                      showEdit={section.showEdit}
                      showJoin={section.showJoin}
                      showDelete={section.showDelete ?? true}
                      showParticipants={section.showParticipants}
                      actions={section.actions}
                      activeMembers={activeMembers}
                      onShowMembers={(current) => handleShowMembers(section.id, current)}
                      onEdit={(current) => section.editHandler?.(current)}
                      onDelete={(current) => section.deleteHandler(current)}
                      onJoin={(current) => section.joinHandler?.(current)}
                      onLeave={(current) => section.leaveHandler?.(current)}
                      onOpenDetails={(current) => handleSectionItemClick(section.id, current)}
                      sectionId={section.id}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">{section.emptyLabel}</p>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState className="min-h-[50vh]" />
      )}

      {isProjectModalOpen && selectedProject && (
        <ProjectDetailsModal project={selectedProject} onClose={handleCloseProjectModal} />
      )}
    </div>
  );
}
