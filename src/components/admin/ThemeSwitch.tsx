import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ThemeSwitch = () => {
  const { theme, setTheme } = useTheme();

  const themes = [
    {
      value: "light",
      label: "Claro",
      icon: Sun,
      description: "Tema claro para ambientes iluminados",
    },
    {
      value: "dark",
      label: "Escuro",
      icon: Moon,
      description: "Tema escuro para reduzir cansaço visual",
    },
    {
      value: "system",
      label: "Sistema",
      icon: Monitor,
      description: "Seguir preferência do sistema operacional",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {themes.map((themeOption) => {
        const Icon = themeOption.icon;
        const isActive = theme === themeOption.value;

        return (
          <Card
            key={themeOption.value}
            className={`cursor-pointer transition-all hover:border-primary ${
              isActive ? "border-primary border-2 shadow-lg" : "border-2"
            }`}
            onClick={() => setTheme(themeOption.value)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon className={`h-6 w-6 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                {isActive && (
                  <Badge variant="default" className="gap-1">
                    Ativo
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <CardTitle className="text-lg">{themeOption.label}</CardTitle>
              <CardDescription className="text-sm">
                {themeOption.description}
              </CardDescription>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ThemeSwitch;
