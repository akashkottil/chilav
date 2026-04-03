'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const getIcon = () => {
    switch (theme) {
      case 'light': return <Sun className="h-[16px] w-[16px]" />;
      case 'dark': return <Moon className="h-[16px] w-[16px]" />;
      default: return <Monitor className="h-[16px] w-[16px]" />;
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center h-9 w-9 rounded-xl text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-foreground transition-all duration-200"
      aria-label="Toggle theme"
    >
      {getIcon()}
    </button>
  );
}
