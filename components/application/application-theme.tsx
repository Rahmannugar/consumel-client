"use client";

import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";

export type ApplicationTheme = "light" | "dark" | "system";

type ThemeContextValue = {
  theme: ApplicationTheme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: ApplicationTheme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const storageKey = "consumel-application-theme-v2";

export function ApplicationThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ApplicationTheme>(() => {
    if (typeof window === "undefined") return "light";
    const stored = window.localStorage.getItem(storageKey);
    return stored === "light" || stored === "dark" || stored === "system" ? stored : "light";
  });
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setSystemTheme(media.matches ? "dark" : "light");
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const resolvedTheme = theme === "system" ? systemTheme : theme;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
    document.documentElement.style.colorScheme = resolvedTheme;
    return () => {
      document.documentElement.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
    };
  }, [resolvedTheme]);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme: (nextTheme: ApplicationTheme) => {
        window.localStorage.setItem(storageKey, nextTheme);
        setThemeState(nextTheme);
      },
    }),
    [resolvedTheme, theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useApplicationTheme() {
  const value = useContext(ThemeContext);
  if (!value)
    throw new Error("useApplicationTheme must be used inside ApplicationThemeProvider");
  return value;
}
