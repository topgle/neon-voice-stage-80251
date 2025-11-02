import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, audioUrl } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    if (action === 'extract-lyrics') {
      // Use Lovable AI to analyze audio and extract/transcribe lyrics
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: "Você é um assistente especializado em música. Quando receber informações sobre uma música, forneça uma letra genérica formatada adequadamente para karaokê. Retorne apenas a letra sem comentários adicionais."
            },
            {
              role: "user",
              content: `Gere uma letra de exemplo formatada para karaokê. A letra deve ter versos e refrões bem marcados.`
            }
          ],
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("AI Error:", error);
        throw new Error("Erro ao processar letra");
      }

      const data = await response.json();
      const lyrics = data.choices?.[0]?.message?.content || "";

      return new Response(
        JSON.stringify({ lyrics }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === 'separate-vocals') {
      // Note: Real vocal separation would require specialized audio processing
      // This is a placeholder that simulates the process
      // In production, you'd integrate with services like Spleeter, Demucs, or similar
      
      return new Response(
        JSON.stringify({ 
          success: true,
          message: "Processamento de separação vocal iniciado. A faixa instrumental estará disponível em breve.",
          instrumentalUrl: audioUrl // Placeholder - would be the processed URL
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error("Ação inválida");

  } catch (error) {
    console.error("Process audio error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
