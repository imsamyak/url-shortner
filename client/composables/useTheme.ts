export type ColorTheme = "light" | "dark";

const storageKey = "linkora-theme";

/** Provides the persisted Linkora color theme and keeps browser chrome in sync. */
export function useTheme() {
  const theme = useState<ColorTheme>("color-theme", () => "light");
  const isReady = useState("color-theme-ready", () => false);

  const applyTheme = (nextTheme: ColorTheme) => {
    if (!import.meta.client) return;

    const isDark = nextTheme === "dark";
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.style.colorScheme = nextTheme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", isDark ? "#1e293b" : "#f8fafc");
  };

  const initializeTheme = () => {
    if (!import.meta.client || isReady.value) return;

    theme.value = document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";
    isReady.value = true;
  };

  const setTheme = (nextTheme: ColorTheme) => {
    theme.value = nextTheme;
    applyTheme(nextTheme);
    if (import.meta.client) localStorage.setItem(storageKey, nextTheme);
  };

  const toggleTheme = () => {
    initializeTheme();
    setTheme(theme.value === "dark" ? "light" : "dark");
  };

  onMounted(initializeTheme);

  return {
    isDark: computed(() => theme.value === "dark"),
    setTheme,
    theme: readonly(theme),
    toggleTheme,
  };
}
