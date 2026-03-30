import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
};

export const userAPI = {
  getMe:           ()         => api.get('/users/me'),
  getByUsername:   (username) => api.get(`/users/${username}`),
  updateProfile:   (data)     => api.put('/users/me', data),
  follow:          (userId)   => api.post(`/users/${userId}/follow`),
  unfollow:        (userId)   => api.delete(`/users/${userId}/follow`),
  getFollowStatus: (userId)   => api.get(`/users/${userId}/follow/status`),
};

export const postAPI = {
  create:    (data)                 => api.post('/posts', data),
  getById:   (id)                   => api.get(`/posts/${id}`),
  update:    (id, data)             => api.put(`/posts/${id}`, data),
  delete:    (id)                   => api.delete(`/posts/${id}`),
  getByUser: (username, page, size) => api.get(`/posts/user/${username}?page=${page}&size=${size}`),
  getFeed:   (page, size)           => api.get(`/posts/feed?page=${page}&size=${size}`),
};

export const commentAPI = {
  add:    (postId, data)       => api.post(`/posts/${postId}/comments`, data),
  getAll: (postId, page, size) => api.get(`/posts/${postId}/comments?page=${page}&size=${size}`),
  delete: (postId, commentId)  => api.delete(`/posts/${postId}/comments/${commentId}`),
};

export const likeAPI = {
  like:      (postId) => api.post(`/posts/${postId}/likes`),
  unlike:    (postId) => api.delete(`/posts/${postId}/likes`),
  getStatus: (postId) => api.get(`/posts/${postId}/likes/status`),
};

export default api;
