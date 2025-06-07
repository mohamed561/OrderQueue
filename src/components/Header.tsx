
import React from 'react';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, onThemeToggle }) => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-text">
          <h1 className="header-title">Order Pickup Reminders</h1>
          <p className="header-subtitle">Track your orders efficiently</p>
        </div>
        <ThemeToggle isDarkMode={isDarkMode} onToggle={onThemeToggle} />
      </div>
    </header>
  );
};

export default Header;
