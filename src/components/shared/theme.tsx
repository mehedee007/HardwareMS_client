"use client"
import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';

function ThemeChange() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <div>
      <motion.button
        onClick={toggleDarkMode}
        className="fixed bottom-4 right-4 p-3 rounded-full bg-zinc-200 dark:bg-zinc-800 shadow-lg transition-colors duration-300 z-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isDarkMode ? (
          <Sun className="w-6 h-6 text-zinc-700 dark:text-zinc-300" />
        ) : (
          <Moon className="w-6 h-6 text-zinc-700 dark:text-zinc-300" />
        )}
      </motion.button>
    </div>
  )
}

export default ThemeChange