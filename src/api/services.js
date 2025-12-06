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
const normalizeClub = (club) => {
  console.log('[normalizeClub] Input:', club);
  const normalized = {
    ...club,
    clubAvatar: club.club_avatar || club.clubAvatar || '',
    backgroundUrl: club.background_url || club.backgroundUrl || '',
    backgroundType: club.background_type || club.backgroundType || '',
    creatorId: club.creator_id || club.creatorId,
    createdAt: club.created_at || club.createdAt,
  };
  console.log('[normalizeClub] Output:', normalized);
  return normalized;
};

// Clubs
export const clubsService = {
  async getAll() {
    const clubs = await apiClient.get('/api/clubs');
    console.log('[clubsService.getAll] Raw clubs from API:', clubs);
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
    console.log('[clubsService.create] Sending payload:', payload);
    const result = await apiClient.post('/api/clubs', payload);
    console.log('[clubsService.create] Result:', result);
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
// Helper to convert project data from snake_case to camelCase
const normalizeProject = (project) => {
  console.log('[normalizeProject] Input:', project);
  const normalized = {
    ...project,
    backgroundUrl: project.background_url || project.backgroundUrl || '',
    createdAt: project.created_at || project.createdAt,
  };
  console.log('[normalizeProject] Output:', normalized);
  return normalized;
};

export const projectsService = {
  async getAll() {
    const projects = await apiClient.get('/api/projects');
    console.log('[projectsService.getAll] Raw projects from API:', projects);
    return projects.map(normalizeProject);
  },

  async create(project) {
    const payload = {
      ...project,
      background_url: project.backgroundUrl,
    };
    console.log('[projectsService.create] Sending payload:', payload);
    const result = await apiClient.post('/api/projects', payload);
    console.log('[projectsService.create] Result:', result);
    return normalizeProject(result);
  },

  async delete(projectId) {
    return apiClient.delete(`/api/projects/${projectId}`);
  },
};

// Schedule
// Helper to convert schedule data from snake_case to camelCase
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
