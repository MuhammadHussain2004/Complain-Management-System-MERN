import api from "./axios";

export const createComplaintRequest = (data) => api.post("/complaints", data);
export const getMyComplaintsRequest = () => api.get("/complaints/my");
export const getComplaintRequest = (id) => api.get(`/complaints/${id}`);
export const updateComplaintRequest = (id, data) => api.put(`/complaints/${id}`, data);
export const deleteComplaintRequest = (id) => api.delete(`/complaints/${id}`);

export const getAllComplaintsRequest = (params) => api.get("/complaints", { params });
export const updateComplaintStatusRequest = (id, data) => api.patch(`/complaints/${id}/status`, data);
export const getComplaintStatsRequest = () => api.get("/complaints/stats");
