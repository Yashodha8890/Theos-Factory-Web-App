import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { loginUser, registerUser, fetchProfile, updateUserProfile, deleteUserAccount } from '../api/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('theos_token'));
  const [theme, setTheme] = useState(localStorage.getItem('theos_theme') || 'light');
  const [loading, setLoading] = useState(true);

  const setSession = (tokenValue, userData) => {
    if (tokenValue) {
      localStorage.setItem('theos_token', tokenValue);
      setToken(tokenValue);
      setUser(userData);
    } else {
      localStorage.removeItem('theos_token');
      setToken(null);
      setUser(null);
    }
  };

  const signIn = async (credentials) => {
    const data = await loginUser(credentials);
    setSession(data.token, data.user);
    return data;
  };

  const signUp = async (credentials) => {
    const data = await registerUser(credentials);
    setSession(data.token, data.user);
    return data;
  };

  const signOut = () => setSession(null, null);

  const refreshProfile = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const data = await fetchProfile(token);
      setUser(data);
    } catch (error) {
      setSession(null, null);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (payload) => {
    const updated = await updateUserProfile(token, payload);
    setUser(updated);
    return updated;
  };

  const deleteAccount = async () => {
    const result = await deleteUserAccount(token);
    signOut();
    return result;
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theos_theme', next);
  };

  useEffect(() => {
    refreshProfile();
  }, [token]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  const value = useMemo(() => ({
    user,
    token,
    loading,
    theme,
    signIn,
    signUp,
    signOut,
    updateProfile,
    deleteAccount,
    toggleTheme,
  }), [user, token, loading, theme]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
