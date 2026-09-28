"use client";
import {
  ThemeProvider as Provider,
  useTheme as useNextTheme,
} from "next-themes";
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      storageKey="li-theme"
      disableTransitionOnChange
    >
      {children}
    </Provider>
  );
}
export function useTheme() {
  const { resolvedTheme, setTheme } = useNextTheme();
  return { theme: resolvedTheme === "dark" ? "dark" : "light", setTheme };
}
