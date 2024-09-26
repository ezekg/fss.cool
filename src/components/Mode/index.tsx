import { type FC, useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

enum Theme {
  Light = "theme-light",
  Dark = "dark",
  System = "system",
}

export const Mode: FC = () => {
  const [theme, setThemeState] = useState<Theme>(Theme.System);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains(Theme.Dark);

    setThemeState(isDarkMode ? Theme.Dark : Theme.Light);
  }, []);

  useEffect(() => {
    const isDark =
      theme === Theme.Dark ||
      (theme === Theme.System &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    document.documentElement.classList[isDark ? "add" : "remove"](Theme.Dark);
  }, [theme]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setThemeState(Theme.Light)}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setThemeState(Theme.Dark)}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setThemeState(Theme.System)}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
