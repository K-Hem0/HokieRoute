import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface PlaceSearchRequest {
  query: string;
  latitude: number;
  longitude: number;
}

interface PlaceResult {
  id: string;
  name: string;
  address: string;
  placeId: string;
  uri: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, latitude, longitude }: PlaceSearchRequest = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ success: false, error: "Query is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ success: false, error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use Gemini with Google Maps grounding for place search
    const prompt = `Find places matching "${query}" in Blacksburg, Virginia. 
    For each place, provide the name, address, and a brief description.
    Focus on Virginia Tech campus buildings, local businesses, and landmarks.
    Return results as a JSON array with fields: name, address, description.
    Only return the JSON array, no other text.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a local expert on Blacksburg, Virginia, especially Virginia Tech campus. 
            When searching for places, prioritize:
            1. Virginia Tech campus buildings (academic halls, libraries, dining halls, dorms)
            2. Downtown Blacksburg businesses and restaurants
            3. Local landmarks and parks
            Always provide accurate addresses in Blacksburg, VA.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        tools: [{ googleMaps: {} }],
        tool_config: {
          retrievalConfig: {
            latLng: {
              latitude: latitude || 37.2296,
              longitude: longitude || -80.4139,
            },
          },
        },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: "Rate limit exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: "Payment required, please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ success: false, error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Extract grounding metadata for place information
    const groundingMetadata = data.choices?.[0]?.message?.grounding_metadata;
    const groundingChunks = groundingMetadata?.groundingChunks || [];
    
    // Parse places from grounding chunks (Google Maps data)
    const places: PlaceResult[] = groundingChunks
      .filter((chunk: any) => chunk.maps)
      .map((chunk: any, index: number) => ({
        id: chunk.maps.placeId || `place-${index}`,
        name: chunk.maps.title || "Unknown Place",
        address: chunk.maps.title || "Blacksburg, VA",
        placeId: chunk.maps.placeId || "",
        uri: chunk.maps.uri || "",
      }));

    // If no grounding data, try to parse from the text response
    if (places.length === 0) {
      try {
        // Try to extract JSON from the response
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          parsed.forEach((item: any, index: number) => {
            places.push({
              id: `parsed-${index}`,
              name: item.name || "Unknown",
              address: item.address || "Blacksburg, VA",
              placeId: "",
              uri: "",
            });
          });
        }
      } catch (e) {
        console.log("Could not parse places from response:", e);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        places,
        rawResponse: content,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Place search error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
