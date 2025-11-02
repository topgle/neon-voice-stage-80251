import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Performance {
  id: string;
  session_id: string;
  participant_id: string;
  song_id: string;
  score: number;
  pitch_accuracy: number;
  rhythm_accuracy: number;
  expression_score: number;
  feedback_text: string;
  performed_at: string;
}

export const usePerformanceExport = () => {
  const fetchPerformances = async (sessionId?: string): Promise<Performance[]> => {
    try {
      let query = supabase
        .from('performances' as any)
        .select('*')
        .order('performed_at', { ascending: false });

      if (sessionId) {
        query = query.eq('session_id', sessionId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Performance[];
    } catch (error) {
      console.error('Error fetching performances:', error);
      return [];
    }
  };

  const exportToCSV = useCallback(async (sessionId?: string) => {
    try {
      const performances = await fetchPerformances(sessionId);

      if (performances.length === 0) {
        toast.error('Nenhuma performance encontrada para exportar');
        return;
      }

      // CSV headers
      const headers = [
        'ID',
        'Sessão',
        'Participante',
        'Música',
        'Pontuação',
        'Afinação (%)',
        'Ritmo (%)',
        'Expressão (%)',
        'Feedback',
        'Data/Hora'
      ].join(',');

      // CSV rows
      const rows = performances.map(p => [
        p.id,
        p.session_id,
        p.participant_id,
        p.song_id,
        p.score,
        Math.round(p.pitch_accuracy || 0),
        Math.round(p.rhythm_accuracy || 0),
        Math.round(p.expression_score || 0),
        `"${(p.feedback_text || '').replace(/"/g, '""')}"`,
        new Date(p.performed_at).toLocaleString('pt-BR')
      ].join(','));

      const csv = [headers, ...rows].join('\n');

      // Download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `performances_${sessionId || 'all'}_${Date.now()}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success(`${performances.length} performances exportadas para CSV`);
    } catch (error: any) {
      toast.error('Erro ao exportar CSV: ' + error.message);
    }
  }, []);

  const exportToJSON = useCallback(async (sessionId?: string) => {
    try {
      const performances = await fetchPerformances(sessionId);

      if (performances.length === 0) {
        toast.error('Nenhuma performance encontrada para exportar');
        return;
      }

      const json = JSON.stringify({
        exported_at: new Date().toISOString(),
        session_id: sessionId || 'all',
        total_performances: performances.length,
        performances: performances.map(p => ({
          id: p.id,
          session_id: p.session_id,
          participant_id: p.participant_id,
          song_id: p.song_id,
          scores: {
            total: p.score,
            pitch_accuracy: p.pitch_accuracy,
            rhythm_accuracy: p.rhythm_accuracy,
            expression_score: p.expression_score,
          },
          feedback: p.feedback_text,
          performed_at: p.performed_at,
        }))
      }, null, 2);

      // Download
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `performances_${sessionId || 'all'}_${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success(`${performances.length} performances exportadas para JSON`);
    } catch (error: any) {
      toast.error('Erro ao exportar JSON: ' + error.message);
    }
  }, []);

  return {
    exportToCSV,
    exportToJSON,
  };
};
