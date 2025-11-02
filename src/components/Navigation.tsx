import { Home, Music, ListMusic, Trophy, Bot, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
export const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const navItems = [{
    icon: Home,
    label: "Início",
    path: "/"
  }, {
    icon: Music,
    label: "Player",
    path: "/player"
  }, {
    icon: ListMusic,
    label: "Playlists",
    path: "/playlists"
  }, {
    icon: Trophy,
    label: "The Voices",
    path: "/the-voices"
  }, {
    icon: Bot,
    label: "Assistente",
    path: "/assistant"
  }];
  return <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-t border-border/50 md:top-0 md:bottom-auto md:border-t-0 md:border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between md:justify-center py-3">
          <div className="hidden md:block mr-8">
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">🎤 Karaokê Caspershow</h1>
          </div>
          
          <div className="flex items-center justify-around md:justify-center md:gap-8 flex-1 md:flex-initial">
            {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return <Button key={item.path} variant={isActive ? "neon" : "ghost"} size="sm" onClick={() => navigate(item.path)} className="flex-col h-auto py-2 px-3 md:flex-row md:px-4">
                  <Icon className="h-5 w-5 md:mr-2" />
                  <span className="text-xs md:text-sm mt-1 md:mt-0">{item.label}</span>
                </Button>;
          })}
          </div>

          <Button variant={location.pathname === "/settings" ? "neon" : "ghost"} size="icon" onClick={() => navigate("/settings")} className="hidden md:flex">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>;
};