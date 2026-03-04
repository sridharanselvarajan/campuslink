import { createContext, useState } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Attach token to every request
  api.interceptors.request.use((config) => {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    setToken(res.data.token);
    const userObj = {
      ...res.data.user,
      _id: res.data.user._id || res.data.user.id,
      skillsOffered: res.data.user.skillsOffered || [],
      averageRating: res.data.user.averageRating || 0,
      totalPoints: res.data.user.totalPoints || 0,
      badges: res.data.user.badges || []
    };
    setUser(userObj);
    localStorage.setItem('token', res.data.token);
    console.log('AuthContext: User after login:', userObj);
  };

  const register = async (username, email, password, role) => {
    await api.post('/auth/register', { username, email, password, role });
    await login(email, password);
  };

  // Refresh user info from backend (call this on Profile page mount)
  const refreshUser = async () => {
    if (!token) return;
    const res = await api.get('/auth/me');
    const userObj = {
      ...res.data.user,
      _id: res.data.user._id || res.data.user.id,
      skillsOffered: res.data.user.skillsOffered || [],
      averageRating: res.data.user.averageRating || 0,
      totalPoints: res.data.user.totalPoints || 0,
      badges: res.data.user.badges || []
    };
    setUser(userObj);
    console.log('AuthContext: User after refresh:', userObj);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
