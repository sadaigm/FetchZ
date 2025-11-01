import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { ConfigProvider, theme } from 'antd';
import { materialDarkTheme } from '../themes/material-dark-theme';
import { materialLightTheme } from '../themes/material-light-theme';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme') as ThemeMode | null;
    return savedTheme || 'light';
  });

  useEffect(() => {
    // Apply theme to document element
    document.documentElement.setAttribute('data-theme', themeMode);
    // Save theme preference to localStorage
    localStorage.setItem('theme', themeMode);
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // Ant Design theme configuration
  const antdTheme = {
    algorithm: themeMode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: themeMode === 'dark' ? materialDarkTheme.token : materialLightTheme.token,
  };

  return (
    <ThemeContext.Provider value={{ theme: themeMode, toggleTheme }}>
      <ConfigProvider theme={antdTheme}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

export const lightTheme = {
  token: {
    colorPrimary: 'rgb(126, 87, 15)',
    colorBgBase: 'rgb(255, 248, 243)',
    colorTextBase: 'rgb(32, 27, 19)',
    colorBgContainer: 'rgb(248, 236, 223)',
    colorBorder: 'rgb(129, 117, 103)',
    colorTextSecondary: 'rgb(79, 69, 57)',

    colorSuccess: 'rgb(80, 100, 65)',
    colorWarning: 'rgb(111, 91, 64)',
    colorError: 'rgb(186, 26, 26)',
    colorInfo: 'rgb(126, 87, 15)',

    colorPrimaryBg: 'rgb(255, 221, 175)',
    colorPrimaryText: 'rgb(255, 255, 255)',

    borderRadius: 6,
    fontSize: 14,
  },
};

export const darkTheme = {
  token: {
    colorPrimary: 'rgb(242, 190, 110)',
    colorBgBase: 'rgb(24, 19, 11)',
    colorTextBase: 'rgb(237, 225, 212)',
    colorBgContainer: 'rgb(36, 31, 23)',
    colorBorder: 'rgb(155, 143, 128)',
    colorTextSecondary: 'rgb(210, 196, 180)',

    colorSuccess: 'rgb(182, 206, 163)',
    colorWarning: 'rgb(220, 195, 161)',
    colorError: 'rgb(255, 180, 171)',
    colorInfo: 'rgb(242, 190, 110)',

    colorPrimaryBg: 'rgb(97, 64, 0)',
    colorPrimaryText: 'rgb(68, 44, 0)',

    borderRadius: 6,
    fontSize: 14,
  },
};
