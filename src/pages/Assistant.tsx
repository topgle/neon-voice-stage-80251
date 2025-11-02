import { Navigation } from "@/components/Navigation";
import { VoiceAssistant } from "@/components/VoiceAssistant";
import { Bot, Sparkles } from "lucide-react";

const Assistant = () => {
  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8 md:pt-20">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gradient-primary mb-4">
              <Bot className="h-10 w-10" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
              Assistente Inteligente
            </h1>
            <p className="text-muted-foreground text-lg flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5" />
              Controle o app com comandos naturais em português
            </p>
          </div>

          <VoiceAssistant />

          <div className="mt-8 p-6 bg-secondary/50 rounded-lg">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              O que você pode fazer
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold mb-2">🎵 Gerenciar Músicas</p>
                <ul className="space-y-1 text-muted-foreground ml-4">
                  <li>• "Listar minhas músicas"</li>
                  <li>• "Buscar [nome da música]"</li>
                  <li>• "Adicionar [música] à playlist [nome]"</li>
                </ul>
              </div>
              
              <div>
                <p className="font-semibold mb-2">📋 Playlists</p>
                <ul className="space-y-1 text-muted-foreground ml-4">
                  <li>• "Mostrar minhas playlists"</li>
                  <li>• "Criar playlist [nome]"</li>
                  <li>• "Adicionar músicas à [playlist]"</li>
                </ul>
              </div>
              
              <div>
                <p className="font-semibold mb-2">🎤 Modo The Voices</p>
                <ul className="space-y-1 text-muted-foreground ml-4">
                  <li>• "Iniciar The Voices com [nomes]"</li>
                  <li>• "Criar sessão com Ana, João e Carlos"</li>
                </ul>
              </div>
              
              <div>
                <p className="font-semibold mb-2">🔍 Buscar no YouTube</p>
                <ul className="space-y-1 text-muted-foreground ml-4">
                  <li>• "Buscar [música] karaoke"</li>
                  <li>• "Encontrar [artista] no YouTube"</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assistant;