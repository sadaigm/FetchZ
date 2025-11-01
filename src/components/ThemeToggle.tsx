import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import { Avatar, Tooltip, theme } from 'antd';

const ThemeToggle: React.FC = () => {
  const themeContext = useContext(ThemeContext);
  if (!themeContext) {
    throw new Error('ThemeToggle must be used within a ThemeProvider');
  }
  const { theme: themeMode, toggleTheme } = themeContext;
  const { token } = theme.useToken();

  return (
    <Tooltip title={`Switch to ${themeMode === 'light' ? 'dark' : 'light'} mode`}>
      <Avatar
        onClick={toggleTheme}
        style={{
          backgroundColor: 'transparent',
          cursor: 'pointer',
          border: `1px solid ${token.colorBorder}`,
          color: token.colorText,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        size="small"
        icon={<FontAwesomeIcon icon={themeMode === 'light' ? faMoon : faSun} />}
      />
    </Tooltip>
  );
};

export default ThemeToggle;