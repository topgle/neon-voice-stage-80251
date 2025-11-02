import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Plus, Loader2, Play, Swords, Settings, Download } from "lucide-react";
import { useTheVoices } from "@/hooks/useTheVoices";
import { useSongs } from "@/hooks/useSongs";
import { ExportPerformancesDialog } from "@/components/ExportPerformancesDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ParticipantSetup } from "@/components/voices/ParticipantSetup";
import { RoundManager } from "@/components/voices/RoundManager";
import { RoundResults } from "@/components/voices/RoundResults";
import { DuelMode } from "@/components/voices/DuelMode";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type SessionPhase = 'setup' | 'round' | 'results';

const TheVoices = () => {
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [newSessionName, setNewSessionName] = useState("");
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [sessionPhase, setSessionPhase] = useState<SessionPhase>('setup');
  const [activeTab, setActiveTab] = useState('round');

  const { songs } = useSongs();
  const {
    sessions,
    participants,
    performances,
    loadingSessions,
    loadingParticipants,
    createSession,
    addParticipant,
    updateSessionStatus,
  } = useTheVoices(selectedSessionId);

  const activeSession = sessions.find(s => s.id === selectedSessionId);

  // Realtime subscriptions
  useEffect(() => {
    if (!selectedSessionId) return;

    const participantsChannel = supabase
      .channel(`participants-${selectedSessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'participants',
          filter: `session_id=eq.${selectedSessionId}`
        },
        () => {
          // Refresh is handled by react-query
        }
      )
      .subscribe();

    const performancesChannel = supabase
      .channel(`performances-${selectedSessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'performances',
          filter: `session_id=eq.${selectedSessionId}`
        },
        () => {
          // Refresh is handled by react-query
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(participantsChannel);
      supabase.removeChannel(performancesChannel);
    };
  }, [selectedSessionId]);

  const handleCreateSession = () => {
    if (!newSessionName.trim()) {
      toast.error("Digite um nome para a sessão");
      return;
    }
    createSession(newSessionName, {
      onSuccess: (data: any) => {
        setSelectedSessionId(data.id);
        setNewSessionName("");
        setSessionDialogOpen(false);
        setSessionPhase('setup');
      },
    });
  };

  const handleAddParticipant = async (participantData: any) => {
    if (!selectedSessionId) return;

    try {
      const { data, error } = await supabase
        .from('participants')
        .insert([{
          session_id: selectedSessionId,
          display_name: participantData.display_name,
          avatar_url: participantData.avatar_url,
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success("Participante adicionado!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleRemoveParticipant = async (id: string) => {
    try {
      const { error } = await supabase
        .from('participants')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success("Participante removido");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleUpdateParticipant = async (id: string, data: any) => {
    try {
      const { error } = await supabase
        .from('participants')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleStartRound = () => {
    if (participants.length < 2) {
      toast.error("Adicione pelo menos 2 participantes");
      return;
    }

    updateSessionStatus({
      sessionId: selectedSessionId,
      status: 'active',
    });
    setSessionPhase('round');
  };

  const handleRoundComplete = () => {
    setSessionPhase('results');
  };

  const handleNewRound = () => {
    setSessionPhase('round');
  };

  const handleFinishSession = () => {
    updateSessionStatus({
      sessionId: selectedSessionId,
      status: 'finished',
    });
    setSessionPhase('setup');
    toast.success("Sessão finalizada!");
  };

  if (loadingSessions) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8 md:pt-20">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gradient-primary mb-4">
              <Trophy className="h-10 w-10" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
              Modo The Voices
            </h1>
            <p className="text-muted-foreground text-lg">
              Competição ao vivo • Pontuação em tempo real
            </p>
          </div>

          {!selectedSessionId ? (
            <Card>
              <CardHeader>
                <CardTitle>Selecionar ou Criar Sessão</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {sessions.length > 0 && (
                  <div className="space-y-2">
                    <Label>Sessões Disponíveis</Label>
                    {sessions.map((session) => (
                      <Button
                        key={session.id}
                        variant="outline"
                        className="w-full justify-between"
                        onClick={() => {
                          setSelectedSessionId(session.id);
                          setSessionPhase(session.status === 'active' ? 'round' : 'setup');
                        }}
                      >
                        <span>{session.name}</span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {session.status === 'waiting' ? 'Aguardando' :
                           session.status === 'active' ? 'Em andamento' :
                           'Finalizada'}
                        </span>
                      </Button>
                    ))}
                  </div>
                )}
                
                <Dialog open={sessionDialogOpen} onOpenChange={setSessionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="neon" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Sessão
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Criar Nova Sessão</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="session-name">Nome da Sessão</Label>
                        <Input
                          id="session-name"
                          value={newSessionName}
                          onChange={(e) => setNewSessionName(e.target.value)}
                          placeholder="Ex: Karaokê da Sexta"
                        />
                      </div>
                      <Button onClick={handleCreateSession} className="w-full">
                        Criar Sessão
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl font-bold">{activeSession?.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {participants.length} participantes • {performances.length} performances
                  </p>
                </div>
                <div className="flex gap-2">
                  <ExportPerformancesDialog sessionId={selectedSessionId} />
                  <Button variant="outline" onClick={() => setSelectedSessionId("")}>
                    Voltar
                  </Button>
                </div>
              </div>

              {sessionPhase === 'setup' && (
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="setup">
                      <Settings className="w-4 h-4 mr-2" />
                      Configurar
                    </TabsTrigger>
                    <TabsTrigger value="duel">
                      <Swords className="w-4 h-4 mr-2" />
                      Modo Duelo
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="setup" className="space-y-6">
                    <ParticipantSetup
                      participants={participants.map(p => ({
                        ...p,
                        preferred_songs: p.preferred_songs || []
                      }))}
                      onAddParticipant={handleAddParticipant}
                      onRemoveParticipant={handleRemoveParticipant}
                      onUpdateParticipant={handleUpdateParticipant}
                    />

                    <Button 
                      onClick={handleStartRound}
                      className="w-full"
                      size="lg"
                      variant="neon"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Iniciar Round
                    </Button>
                  </TabsContent>

                  <TabsContent value="duel">
                    <DuelMode
                      sessionId={selectedSessionId}
                      participants={participants}
                      songs={songs}
                      performances={performances}
                    />
                  </TabsContent>
                </Tabs>
              )}

              {sessionPhase === 'round' && (
                <RoundManager
                  sessionId={selectedSessionId}
                  participants={participants.map(p => ({
                    ...p,
                    preferred_songs: p.preferred_songs || []
                  }))}
                  songs={songs}
                  onComplete={handleRoundComplete}
                />
              )}

              {sessionPhase === 'results' && (
                <RoundResults
                  participants={participants}
                  performances={performances}
                  songs={songs}
                  onNewRound={handleNewRound}
                  onFinishSession={handleFinishSession}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TheVoices;
