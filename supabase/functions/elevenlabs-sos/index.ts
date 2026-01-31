import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY is not configured');
    }

    const { message } = await req.json();
    
    // Default emergency message
    const emergencyMessage = message || 
      "This is an emergency SOS call. The caller needs immediate assistance. " +
      "Their location is being shared. Please send help immediately. " +
      "I repeat, this is an emergency SOS call requesting immediate assistance.";

    // Use a calm, clear voice for emergency messages
    const voiceId = "JBFqnCBsd6RMkjVDRZzb"; // George - clear male voice

    console.log("Generating emergency TTS for message:", emergencyMessage.substring(0, 50) + "...");

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: emergencyMessage,
          model_id: 'eleven_turbo_v2_5', // Fast generation for emergencies
          voice_settings: {
            stability: 0.8, // High stability for clear speech
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true,
            speed: 0.9, // Slightly slower for clarity
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', response.status, errorText);
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    console.log("Successfully generated audio, size:", audioBuffer.byteLength);

    return new Response(audioBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch (error) {
    console.error('SOS TTS error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
