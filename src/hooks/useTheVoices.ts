import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Session {
  id: string;
  name: string;
  status: string;
  host_id: string;
  started_at?: string;
  finished_at?: string;
  created_at: string;
}

export interface Participant {
  id: string;
  display_name: string;
  avatar_url?: string;
  session_id: string;
  total_score: number;
  joined_at: string;
  preferred_songs?: string[];
}

export interface Performance {
  id: string;
  participant_id: string;
  song_id: string;
  session_id: string;
  score: number;
  pitch_accuracy?: number;
  rhythm_accuracy?: number;
  expression_score?: number;
  feedback_text?: string;
  performed_at: string;
}

export const useTheVoices = (sessionId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sessions = [], isLoading: loadingSessions } = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('the_voices_sessions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Session[];
    },
  });

  const { data: participants = [], isLoading: loadingParticipants } = useQuery({
    queryKey: ['participants', sessionId],
    enabled: !!sessionId,
    queryFn: async () => {
      if (!sessionId) return [];
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('session_id', sessionId)
        .order('total_score', { ascending: false });
      
      if (error) throw error;
      return data as Participant[];
    },
  });

  const { data: performances = [], isLoading: loadingPerformances } = useQuery({
    queryKey: ['performances', sessionId],
    enabled: !!sessionId,
    queryFn: async () => {
      if (!sessionId) return [];
      const { data, error } = await supabase
        .from('performances')
        .select('*')
        .eq('session_id', sessionId)
        .order('performed_at', { ascending: false });
      
      if (error) throw error;
      return data as Performance[];
    },
  });

  const createSession = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from('the_voices_sessions')
        .insert([{
          name,
          status: 'waiting',
          host_id: 'public-host',
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast({
        title: "Sessão criada!",
        description: "Nova sessão do The Voices iniciada.",
      });
    },
  });

  const addParticipant = useMutation({
    mutationFn: async ({ 
      sessionId, 
      displayName, 
      avatarUrl 
    }: { 
      sessionId: string; 
      displayName: string; 
      avatarUrl?: string;
    }) => {
      const { data, error } = await supabase
        .from('participants')
        .insert([{
          session_id: sessionId,
          display_name: displayName,
          avatar_url: avatarUrl,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participants'] });
      toast({
        title: "Participante adicionado!",
        description: "Novo participante entrou na competição.",
      });
    },
  });

  const addPerformance = useMutation({
    mutationFn: async ({
      sessionId,
      participantId,
      songId,
      score,
      pitchAccuracy,
      rhythmAccuracy,
      expressionScore,
      feedbackText,
    }: {
      sessionId: string;
      participantId: string;
      songId: string;
      score: number;
      pitchAccuracy?: number;
      rhythmAccuracy?: number;
      expressionScore?: number;
      feedbackText?: string;
    }) => {
      const { data, error } = await supabase
        .from('performances')
        .insert([{
          session_id: sessionId,
          participant_id: participantId,
          song_id: songId,
          score,
          pitch_accuracy: pitchAccuracy,
          rhythm_accuracy: rhythmAccuracy,
          expression_score: expressionScore,
          feedback_text: feedbackText,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performances'] });
      queryClient.invalidateQueries({ queryKey: ['participants'] });
      toast({
        title: "Performance registrada!",
        description: "Pontuação salva com sucesso.",
      });
    },
  });

  const updateSessionStatus = useMutation({
    mutationFn: async ({ 
      sessionId, 
      status 
    }: { 
      sessionId: string; 
      status: string;
    }) => {
      const updates: any = { status };
      if (status === 'active') {
        updates.started_at = new Date().toISOString();
      } else if (status === 'finished') {
        updates.finished_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('the_voices_sessions')
        .update(updates)
        .eq('id', sessionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });

  return {
    sessions,
    participants,
    performances,
    loadingSessions,
    loadingParticipants,
    loadingPerformances,
    createSession: createSession.mutate,
    addParticipant: addParticipant.mutate,
    addPerformance: addPerformance.mutate,
    updateSessionStatus: updateSessionStatus.mutate,
  };
};