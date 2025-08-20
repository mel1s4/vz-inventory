import React from 'react';
import { useTheme } from '../ThemeProvider/ThemeProvider';
import Icon from '../Icon/Icon';
import { t } from '../../utils/i18n';
import './ThemeToggle.scss';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className={`theme-toggle ${className}`.trim()}
      onClick={toggleTheme}
      aria-label={theme === 'light' ? t('Switch to dark theme') : t('Switch to light theme')}
      title={theme === 'light' ? t('Switch to dark theme') : t('Switch to light theme')}
    >
      <span className="theme-toggle__icon">
        <Icon icon={theme === 'light' ? 'moon' : 'sun'} />
      </span>
      <span className="theme-toggle__text">
        {theme === 'light' ? t('Dark') : t('Light')}
      </span>
    </button>
  );
};

export default ThemeToggle;
