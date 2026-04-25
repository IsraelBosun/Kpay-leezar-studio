'use client';

import { createContext, useContext, useState, useEffect } from 'react';

export const AdminThemeContext = createContext({ dark: false, toggle: () => {} });
export const useAdminTheme = () => useContext(AdminThemeContext);

export function AdminThemeProvider({ children, userEmail }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('admin-theme');
    if (saved === 'dark') setDark(true);
  }, []);

  const toggle = () => {
    setDark(d => {
      const next = !d;
      localStorage.setItem('admin-theme', next ? 'dark' : 'light');
      return next;
    });
  };

  return (
    <AdminThemeContext.Provider value={{ dark, toggle }}>
      <div className={`admin-shell${dark ? ' admin-dark' : ''} min-h-screen flex`}
        style={{ backgroundColor: 'var(--a-bg)', color: 'var(--a-text)' }}>
        {children}
      </div>
    </AdminThemeContext.Provider>
  );
}
