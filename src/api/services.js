import { apiClient } from './client';
import {
  getParliamentMembers,
  addParliamentMember,
  updateParliamentMember,
  removeParliamentMember
} from '../fetch/parliamentAPI';

// Authentication
export const authService = {
  async login(credentials) {
    const response = await apiClient.post('/auth/login', credentials);
    if (response.token) {
      apiClient.setToken(response.token);
    }
    return response;
  },

  async logout() {
    apiClient.clearToken();
    localStorage.removeItem('user');
  },

  async getMe() {
    return apiClient.get('/user/me');
  },

  async updateProfile(data) {
    return apiClient.put('/user/profile', data);
  },
};

// News
export const newsService = {
  async getAll() {
    return apiClient.get('/news');
  },

  async create(post) {
    return apiClient.post('/news', post);
  },

  async like(postId) {
    return apiClient.post(`/news/${postId}/like`);
  },

  async getComments(newsId) {
    return apiClient.get(`/news/${newsId}/comments`);
  },

  async addComment(newsId, text) {
    return apiClient.post(`/news/${newsId}/comments`, { text });
  },

  async updateComment(newsId, commentId, text) {
    return apiClient.put(`/news/${newsId}/comments/${commentId}`, { text });
  },

  async deleteComment(newsId, commentId) {
    return apiClient.delete(`/news/${newsId}/comments/${commentId}`);
  },

  async delete(newsId) {
    return apiClient.delete(`/news/${newsId}`);
  },
};

// Clubs
export const clubsService = {
  async getAll() {
    return apiClient.get('/clubs');
  },

  async create(club) {
    return apiClient.post('/clubs', club);
  },

  async join(clubId) {
    return apiClient.post(`/clubs/${clubId}/join`);
  },

  async leave(clubId) {
    return apiClient.delete(`/clubs/${clubId}/leave`);
  },

  async delete(clubId) {
    return apiClient.delete(`/clubs/${clubId}`);
  },

  async getById(clubId) {
    return apiClient.get(`/clubs/${clubId}`);
  },

  async getMembers(clubId) {
    return apiClient.get(`/clubs/${clubId}/members`);
  },

  async removeMember(clubId, memberId) {
    return apiClient.delete(`/clubs/${clubId}/members/${memberId}`);
  }
};

// Projects
export const projectsService = {
  async getAll() {
    return apiClient.get('/projects');
  },

  async create(project) {
    return apiClient.post('/projects', project);
  },

  async delete(projectId) {
    return apiClient.delete(`/projects/${projectId}`);
  },
};

// Schedule
export const scheduleService = {
  async getAll() {
    return apiClient.get('/schedule');
  },

  async create(meeting) {
    return apiClient.post('/schedule', meeting);
  },

  async update(id, meeting) {
    return apiClient.put(`/schedule/${id}`, meeting);
  },

  async delete(id) {
    return apiClient.delete(`/schedule/${id}`);
  },
};

// Activities
export const activitiesService = {
  async getAll() {
    return apiClient.get('/activities');
  },
};

// Parliament

export const parliamentService = {
  getAll: getParliamentMembers,
  addMember: addParliamentMember,
  updateMember: updateParliamentMember,
  deleteMember: removeParliamentMember,
  async updateAvatar(id, avatarUrl) {
    return apiClient.put(`/parliament/${id}/avatar`, { avatarUrl });
  }
};
