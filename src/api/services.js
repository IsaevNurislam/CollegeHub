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
    // Sanitize inputs: strip any accidental prefixes like ": " and trim whitespace
    const sanitizePassword = (pwd) => {
      if (!pwd) return '';
      // Remove leading colons, spaces, or other common copy-paste artifacts
      return String(pwd).replace(/^[:\s]+/, '').trim();
    };

    const payload = {
      studentId: String(credentials.studentId).trim(),
      password: sanitizePassword(credentials.password),
      // Only include names if present
      ...(credentials.firstName && { firstName: credentials.firstName.trim() }),
      ...(credentials.lastName && { lastName: credentials.lastName.trim() })
    };
    
    // DEBUG: Log payload to console to verify data before sending
    console.log('[AuthService] Login Payload:', {
      studentId: payload.studentId,
      password: payload.password ? `[HIDDEN] (len=${payload.password.length})` : 'MISSING',
      firstName: payload.firstName || '(not sent)',
      lastName: payload.lastName || '(not sent)'
    });

    const response = await apiClient.post('/api/auth/login', payload);
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
    return apiClient.get('/api/user/me');
  },

  async updateProfile(data) {
    return apiClient.put('/api/user/profile', data);
  },
};

// News
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

// Helper to convert club data from snake_case to camelCase
const normalizeClub = (club) => ({
  ...club,
  clubAvatar: club.club_avatar || club.clubAvatar || '',
  backgroundUrl: club.background_url || club.backgroundUrl || '',
  backgroundType: club.background_type || club.backgroundType || '',
  creatorId: club.creator_id || club.creatorId,
  createdAt: club.created_at || club.createdAt,
});

// Clubs
export const clubsService = {
  async getAll() {
    const clubs = await apiClient.get('/api/clubs');
    return clubs.map(normalizeClub);
  },

  async create(club) {
    // Convert camelCase to snake_case for backend
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

// Projects
export const projectsService = {
  async getAll() {
    return apiClient.get('/api/projects');
  },

  async create(project) {
    return apiClient.post('/api/projects', project);
  },

  async delete(projectId) {
    return apiClient.delete(`/api/projects/${projectId}`);
  },
};

// Schedule
export const scheduleService = {
  async getAll() {
    return apiClient.get('/api/schedule');
  },

  async create(meeting) {
    return apiClient.post('/api/schedule', meeting);
  },

  async update(id, meeting) {
    return apiClient.put(`/api/schedule/${id}`, meeting);
  },

  async delete(id) {
    return apiClient.delete(`/api/schedule/${id}`);
  },
};

// Activities
export const activitiesService = {
  async getAll() {
    return apiClient.get('/api/activities');
  },
};

// Parliament

export const parliamentService = {
  getAll: getParliamentMembers,
  addMember: addParliamentMember,
  updateMember: updateParliamentMember,
  deleteMember: removeParliamentMember,
  async updateAvatar(id, avatarUrl) {
    return apiClient.put(`/api/parliament/${id}/avatar`, { avatarUrl });
  }
};

// File Upload
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
