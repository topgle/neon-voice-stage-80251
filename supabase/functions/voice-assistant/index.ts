import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Define available tools for the AI
const tools = [
  {
    type: "function",
    function: {
      name: "search_youtube",
      description: "Busca vídeos de karaokê no YouTube. Retorna os 5 melhores resultados.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Termo de busca, ex: 'Bohemian Rhapsody karaoke'"
          }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "add_song_to_playlist",
      description: "Adiciona uma música a uma playlist específica",
      parameters: {
        type: "object",
        properties: {
          song_title: {
            type: "string",
            description: "Título da música"
          },
          playlist_name: {
            type: "string",
            description: "Nome da playlist"
          }
        },
        required: ["song_title", "playlist_name"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_the_voices_session",
      description: "Inicia uma nova sessão do modo The Voices com participantes",
      parameters: {
        type: "object",
        properties: {
          session_name: {
            type: "string",
            description: "Nome da sessão"
          },
          participants: {
            type: "array",
            items: {
              type: "string"
            },
            description: "Lista de nomes dos participantes"
          }
        },
        required: ["session_name", "participants"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "list_playlists",
      description: "Lista todas as playlists disponíveis",
      parameters: {
        type: "object",
        properties: {}
      }
    }
  },
  {
    type: "function",
    function: {
      name: "list_songs",
      description: "Lista todas as músicas disponíveis no banco",
      parameters: {
        type: "object",
        properties: {
          limit: {
            type: "number",
            description: "Número máximo de músicas a retornar (padrão 10)"
          }
        }
      }
    }
  }
];

// Execute tool functions
async function executeTool(toolName: string, args: any, supabase: any) {
  console.log(`Executing tool: ${toolName} with args:`, args);

  switch (toolName) {
    case "search_youtube":
      // Simula busca no YouTube - em produção, usaria YouTube Data API
      return {
        results: [
          {
            title: `${args.query} - Karaoke Version`,
            videoId: "demo123",
            thumbnail: "https://i.ytimg.com/vi/demo/default.jpg",
            duration: "4:30"
          }
        ],
        message: `Encontrei resultados para "${args.query}". Nota: Busca real no YouTube requer API key.`
      };

    case "add_song_to_playlist":
      // Busca a música e playlist
      const { data: songs } = await supabase
        .from('songs')
        .select('id, title')
        .ilike('title', `%${args.song_title}%`)
        .limit(1);

      const { data: playlists } = await supabase
        .from('playlists')
        .select('id, name')
        .ilike('name', `%${args.playlist_name}%`)
        .limit(1);

      if (!songs || songs.length === 0) {
        return { success: false, message: `Música "${args.song_title}" não encontrada no banco.` };
      }

      if (!playlists || playlists.length === 0) {
        return { success: false, message: `Playlist "${args.playlist_name}" não encontrada.` };
      }

      // Get max position
      const { data: existingSongs } = await supabase
        .from('playlist_songs')
        .select('position')
        .eq('playlist_id', playlists[0].id)
        .order('position', { ascending: false })
        .limit(1);

      const nextPosition = existingSongs && existingSongs.length > 0 
        ? existingSongs[0].position + 1 
        : 0;

      // Add to playlist
      const { error } = await supabase
        .from('playlist_songs')
        .insert([{
          playlist_id: playlists[0].id,
          song_id: songs[0].id,
          position: nextPosition
        }]);

      if (error) {
        return { success: false, message: `Erro ao adicionar: ${error.message}` };
      }

      return { 
        success: true, 
        message: `"${songs[0].title}" adicionada à playlist "${playlists[0].name}"!` 
      };

    case "create_the_voices_session":
      const { data: session, error: sessionError } = await supabase
        .from('the_voices_sessions')
        .insert([{
          name: args.session_name,
          status: 'waiting',
          host_id: 'assistant-created'
        }])
        .select()
        .single();

      if (sessionError) {
        return { success: false, message: `Erro ao criar sessão: ${sessionError.message}` };
      }

      // Add participants
      const participantInserts = args.participants.map((name: string) => ({
        session_id: session.id,
        display_name: name,
        total_score: 0
      }));

      const { error: participantsError } = await supabase
        .from('participants')
        .insert(participantInserts);

      if (participantsError) {
        return { 
          success: false, 
          message: `Sessão criada mas erro ao adicionar participantes: ${participantsError.message}` 
        };
      }

      return { 
        success: true, 
        message: `Sessão "${args.session_name}" criada com ${args.participants.length} participantes!`,
        session_id: session.id
      };

    case "list_playlists":
      const { data: playlistsList } = await supabase
        .from('playlists')
        .select('id, name, description')
        .order('created_at', { ascending: false });

      return {
        playlists: playlistsList || [],
        message: `Encontradas ${playlistsList?.length || 0} playlists.`
      };

    case "list_songs":
      const limit = args.limit || 10;
      const { data: songsList } = await supabase
        .from('songs')
        .select('id, title, artist, duration')
        .order('title')
        .limit(limit);

      return {
        songs: songsList || [],
        message: `Mostrando ${songsList?.length || 0} músicas.`
      };

    default:
      return { error: `Tool desconhecida: ${toolName}` };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabase = createClient(
      SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!
    );

    const systemPrompt = `Você é um assistente de voz para um aplicativo de karaokê chamado "Neon Voice Stage".

Você ajuda usuários a:
- Buscar músicas de karaokê
- Gerenciar playlists
- Iniciar sessões do modo "The Voices" (competição entre participantes)
- Calibrar microfone
- Adicionar músicas ao banco

IMPORTANTE:
- Sempre responda em português brasileiro
- Seja amigável e use emojis ocasionalmente
- Confirme ações antes de executar (ex: "Vou adicionar X à playlist Y, confirma?")
- Se não tiver certeza sobre algum nome, pergunte para esclarecer
- Para ações que modificam dados, use as tools disponíveis
- Scanner de pastas locais não é possível em apps web por segurança - informe isso se perguntarem

Limitações atuais:
- Busca no YouTube é simulada (requer API key do YouTube em produção)
- Download de vídeos do YouTube requer confirmação legal e API key
- Scanner de pasta local não é possível por questões de segurança do navegador`;

    // Initial AI call with tools
    let response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        tools: tools,
        tool_choice: 'auto'
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente em alguns instantes.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos insuficientes. Por favor, adicione créditos ao workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    let assistantMessage = aiResponse.choices[0].message;

    // Handle tool calls
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      const toolResults = [];
      
      for (const toolCall of assistantMessage.tool_calls) {
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);
        
        const result = await executeTool(functionName, functionArgs, supabase);
        
        toolResults.push({
          tool_call_id: toolCall.id,
          role: 'tool',
          name: functionName,
          content: JSON.stringify(result)
        });
      }

      // Second AI call with tool results
      const finalResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages,
            assistantMessage,
            ...toolResults
          ]
        }),
      });

      const finalAiResponse = await finalResponse.json();
      assistantMessage = finalAiResponse.choices[0].message;
    }

    return new Response(
      JSON.stringify({ 
        message: assistantMessage.content,
        role: 'assistant'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        message: 'Desculpe, ocorreu um erro ao processar seu pedido. Tente novamente.' 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});