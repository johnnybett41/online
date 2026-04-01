import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      return null;
    }
  });
  const [token, setToken] = useState(localStorage.getItem('token'));

  const persistSession = (session) => {
    setToken(session.token);
    setUser(session.user);
    localStorage.setItem('token', session.token);
    localStorage.setItem('user', JSON.stringify(session.user));
    axios.defaults.headers.common['Authorization'] = `Bearer ${session.token}`;
  };

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // You might want to validate token here
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await axios.post('/auth/login', { email, password });
    persistSession(res.data);
  };

  const googleLogin = async (credential) => {
    const res = await axios.post('/auth/google', { credential });
    persistSession(res.data);
  };

  const register = async (username, email, password) => {
    const res = await axios.post('/auth/register', { username, email, password });
    return res.data;
  };

  const logout = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, googleLogin, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
