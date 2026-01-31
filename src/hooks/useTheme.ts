import { useState, useEffect } from "react";

export const useTheme = () => {
  // Check if it's "night" time (between 6pm and 6am)
  const getInitialTheme = (): boolean => {
    const hour = new Date().getHours();
    return hour >= 18 || hour < 6;
  };

  const [isDark, setIsDark] = useState<boolean>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  return { isDark, toggleTheme };
};
