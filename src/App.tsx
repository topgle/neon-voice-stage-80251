import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthGuard } from "@/components/AuthGuard";
import Home from "./pages/Home";
import Player from "./pages/Player";
import Playlists from "./pages/Playlists";
import TheVoices from "./pages/TheVoices";
import Assistant from "./pages/Assistant";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<AuthGuard><Home /></AuthGuard>} />
          <Route path="/player" element={<AuthGuard><Player /></AuthGuard>} />
          <Route path="/playlists" element={<AuthGuard><Playlists /></AuthGuard>} />
          <Route path="/the-voices" element={<AuthGuard><TheVoices /></AuthGuard>} />
          <Route path="/assistant" element={<AuthGuard><Assistant /></AuthGuard>} />
          <Route path="/settings" element={<AuthGuard><Settings /></AuthGuard>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
