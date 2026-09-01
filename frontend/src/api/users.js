import api from "./axios";

export const getUsersRequest = (params) => api.get("/admin/users", { params });
export const approveUserRequest = (id) => api.patch(`/admin/users/${id}/approve`);
export const rejectUserRequest = (id) => api.patch(`/admin/users/${id}/reject`);
export const setUserStatusRequest = (id, status) => api.patch(`/admin/users/${id}/status`, { status });
export const setUserRoleRequest = (id, role) => api.patch(`/admin/users/${id}/role`, { role });
