import { apiClient } from './client';
import {
  getParliamentMembers,
  addParliamentMember,
  updateParliamentMember,
  removeParliamentMember
} from '../fetch/parliamentAPI';

const isValidName = (value) => {
  if (!value || typeof value !== 'string') return false;
  if (value.includes('.') || value.includes('_')) return false;
  return value.trim().length > 0;
};

const normalizeUser = (user) => {
  if (!user) return user;

  const firstName = [
    user.firstName,
    user.first_name,
    user.profile_first_name,
    user.profile?.first_name,
    user['profile.first_name']
  ].find(isValidName) || '';

  const lastName = [
    user.lastName,
    user.last_name,
    user.profile_last_name,
    user.profile?.last_name,
    user['profile.last_name']
  ].find(isValidName) || '';

  return {
    ...user,
    firstName,
    lastName,
    lastNameChange: user.lastNameChange || user.last_name_change || user.profile?.last_name_change || null,
    studentId: user.studentId || user.student_id || '',
    isAdmin: user.isAdmin ?? user.is_admin ?? false,
  };
};

const sanitizePassword = (password) => {
  if (!password) return '';
  return String(password).replace(/^[:\s]+/, '').trim();
};

export const authService = {
  async login(credentials) {
    const payload = {
      studentId: String(credentials.studentId).trim(),
      password: sanitizePassword(credentials.password),
      ...(credentials.firstName && { firstName: credentials.firstName.trim() }),
      ...(credentials.lastName && { lastName: credentials.lastName.trim() })
    };

    const response = await apiClient.post('/api/auth/login', payload);
    
    if (response.token) {
      apiClient.setToken(response.token);
    }
    
    if (response.user) {
      response.user = normalizeUser(response.user);
    }
    
    return response;
  },

  async logout() {
    apiClient.clearToken();
    localStorage.removeItem('user');
  },

  async getMe() {
    const user = await apiClient.get('/api/user/me');
    return normalizeUser(user);
  },

  async updateProfile(data) {
    const user = await apiClient.put('/api/user/profile', data);
    return normalizeUser(user);
  },
};

export const newsService = {
  async getAll() {
    return apiClient.get('/api/news');
  },

  async create(post) {
    return apiClient.post('/api/news', post);
  },

  async like(postId) {
    return apiClient.post(`/api/news/${postId}/like`);
  },

  async getComments(newsId) {
    return apiClient.get(`/api/news/${newsId}/comments`);
  },

  async addComment(newsId, text) {
    return apiClient.post(`/api/news/${newsId}/comments`, { text });
  },

  async updateComment(newsId, commentId, text) {
    return apiClient.put(`/api/news/${newsId}/comments/${commentId}`, { text });
  },

  async deleteComment(newsId, commentId) {
    return apiClient.delete(`/api/news/${newsId}/comments/${commentId}`);
  },

  async delete(newsId) {
    return apiClient.delete(`/api/news/${newsId}`);
  },
};

const normalizeClub = (club) => ({
  ...club,
  clubAvatar: club.club_avatar || club.clubAvatar || '',
  backgroundUrl: club.background_url || club.backgroundUrl || '',
  backgroundType: club.background_type || club.backgroundType || '',
  creatorId: club.creator_id || club.creatorId,
  createdAt: club.created_at || club.createdAt,
});

export const clubsService = {
  async getAll() {
    const clubs = await apiClient.get('/api/clubs');
    return clubs.map(normalizeClub);
  },

  async create(club) {
    const payload = {
      ...club,
      club_avatar: club.clubAvatar,
      background_url: club.backgroundUrl,
      background_type: club.backgroundType,
    };
    const result = await apiClient.post('/api/clubs', payload);
    return normalizeClub(result);
  },

  async join(clubId) {
    return apiClient.post(`/api/clubs/${clubId}/join`);
  },

  async leave(clubId) {
    return apiClient.delete(`/api/clubs/${clubId}/leave`);
  },

  async delete(clubId) {
    return apiClient.delete(`/api/clubs/${clubId}`);
  },

  async getById(clubId) {
    const club = await apiClient.get(`/api/clubs/${clubId}`);
    return normalizeClub(club);
  },

  async getMembers(clubId) {
    return apiClient.get(`/api/clubs/${clubId}/members`);
  },

  async removeMember(clubId, memberId) {
    return apiClient.delete(`/api/clubs/${clubId}/members/${memberId}`);
  }
};

const normalizeProject = (project) => ({
  ...project,
  backgroundUrl: project.background_url || project.backgroundUrl || '',
  createdAt: project.created_at || project.createdAt,
});

export const projectsService = {
  async getAll() {
    const projects = await apiClient.get('/api/projects');
    return projects.map(normalizeProject);
  },

  async create(project) {
    const payload = {
      ...project,
      background_url: project.backgroundUrl,
    };
    const result = await apiClient.post('/api/projects', payload);
    return normalizeProject(result);
  },

  async delete(projectId) {
    return apiClient.delete(`/api/projects/${projectId}`);
  },
};

const normalizeSchedule = (meeting) => ({
  ...meeting,
  startTime: meeting.start_time || meeting.startTime,
  endTime: meeting.end_time || meeting.endTime,
  createdAt: meeting.created_at || meeting.createdAt,
});

export const scheduleService = {
  async getAll() {
    const meetings = await apiClient.get('/api/schedule');
    return Array.isArray(meetings) ? meetings.map(normalizeSchedule) : [];
  },

  async create(meeting) {
    const payload = {
      ...meeting,
      start_time: meeting.startTime,
      end_time: meeting.endTime,
    };
    const result = await apiClient.post('/api/schedule', payload);
    return normalizeSchedule(result);
  },

  async update(id, meeting) {
    const payload = {
      ...meeting,
      start_time: meeting.startTime,
      end_time: meeting.endTime,
    };
    const result = await apiClient.put(`/api/schedule/${id}`, payload);
    return normalizeSchedule(result);
  },

  async delete(id) {
    return apiClient.delete(`/api/schedule/${id}`);
  },
};

export const activitiesService = {
  async getAll() {
    return apiClient.get('/api/activities');
  },
};

const normalizeParliamentMember = (member) => ({
  ...member,
  groupName: member.group_name || member.groupName || '',
  avatarUrl: member.avatar_url || member.avatarUrl || member.avatar || '',
  createdAt: member.created_at || member.createdAt,
});

export const parliamentService = {
  async getAll() {
    const members = await getParliamentMembers();
    return members.map(normalizeParliamentMember);
  },
  addMember: addParliamentMember,
  updateMember: updateParliamentMember,
  deleteMember: removeParliamentMember,
  async updateAvatar(id, avatarUrl) {
    return apiClient.put(`/api/parliament/${id}/avatar`, { avatarUrl });
  }
};

export const uploadService = {
  async uploadImage(file, folder = 'college-hub') {
    return apiClient.uploadFile('/api/upload', file, {
      resourceType: 'image',
      folder: folder
    });
  },

  async uploadFile(file, folder = 'college-hub') {
    return apiClient.uploadFile('/api/upload', file, {
      resourceType: 'auto',
      folder: folder
    });
  }
};
