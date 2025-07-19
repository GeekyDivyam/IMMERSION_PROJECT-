import React from 'react';
import { Button } from 'react-bootstrap';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = ({ className = '', size = 'sm' }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline-secondary"
      size={size}
      onClick={toggleTheme}
      className={`theme-toggle ${className}`}
      title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
      <span className="d-none d-md-inline ms-1">
        {isDarkMode ? 'Light' : 'Dark'} Mode
      </span>
    </Button>
  );
};

export default ThemeToggle;
