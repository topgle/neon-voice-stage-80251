import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { videoId, quality = 'best' } = await req.json();

    if (!videoId) {
      throw new Error('videoId é obrigatório');
    }

    console.log(`Iniciando download do vídeo: ${videoId}`);

    // Executar yt-dlp
    const command = new Deno.Command('yt-dlp', {
      args: [
        '--format', quality === 'best' ? 'best' : 'worst',
        '--get-url',
        '--get-title',
        '--get-duration',
        '--get-thumbnail',
        `https://www.youtube.com/watch?v=${videoId}`
      ],
      stdout: 'piped',
      stderr: 'piped',
    });

    const { code, stdout, stderr } = await command.output();

    if (code !== 0) {
      const errorString = new TextDecoder().decode(stderr);
      console.error('Erro yt-dlp:', errorString);
      throw new Error('Falha ao processar vídeo do YouTube');
    }

    const output = new TextDecoder().decode(stdout);
    const lines = output.trim().split('\n');

    // Parse output
    const [title, duration, thumbnail, downloadUrl] = lines;

    console.log('Download preparado:', { title, duration, thumbnail });

    return new Response(
      JSON.stringify({
        success: true,
        videoId,
        title,
        duration,
        thumbnail,
        downloadUrl,
        message: 'URL de download gerada com sucesso',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Erro no youtube-download:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        note: 'yt-dlp precisa estar instalado no ambiente de execução',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
