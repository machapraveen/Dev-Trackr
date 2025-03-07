
import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative inline-flex h-12 w-24 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 p-0.5 transition-all duration-300 hover:scale-105 hover:shadow-lg dark:from-violet-400 dark:to-indigo-400"
    >
      <span className="absolute inset-0 bg-gradient-to-br from-violet-500/50 to-indigo-500/50 blur-xl" />
      <span className="relative flex h-11 w-[90px] items-center justify-center gap-2 rounded-full bg-white font-medium text-slate-800 transition-all dark:bg-slate-900 dark:text-slate-100">
        {theme === 'dark' ? (
          <>
            <Moon className="h-5 w-5" />
            Dark
          </>
        ) : (
          <>
            <Sun className="h-5 w-5" />
            Light
          </>
        )}
      </span>
    </button>
  )
}
