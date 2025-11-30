import { apiClient } from '../api/client';

const basePath = '/parliament';

export const getParliamentMembers = () => apiClient.get(`${basePath}/getAll`);
export const addParliamentMember = (member) => apiClient.post(`${basePath}/add`, member);
export const updateParliamentMember = (id, member) => apiClient.put(`${basePath}/update/${id}`, member);
export const removeParliamentMember = (id) => apiClient.delete(`${basePath}/remove/${id}`);
