import OpenAI from "openai";
import { getSongsSuggestions } from "@/lib/fetch";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const songId = searchParams.get("songId");
    if (!songId) return new Response(JSON.stringify({ error: "songId required" }), { status: 400 });

    const res = await getSongsSuggestions(songId);
    const payload = await res.json();
    const candidates = Array.isArray(payload?.data) ? payload.data : [];
    if (!candidates.length) return Response.json({ recommendations: [] });

    const apiKey = process.env.OPENAI_API_KEY;
    const client = new OpenAI({ apiKey });
    const system = "You are a recommender. Given input songs (id, name, primaryArtist, album), respond ONLY with a JSON array of objects with field 'id' of 5 best items. No prose.";
    const user = `Songs: ${JSON.stringify(candidates.map((c) => ({ id: c.id, name: c.name, primaryArtist: c?.artists?.primary?.[0]?.name || "unknown", album: c?.album?.name || "" })))}`;
    let ids = [];
    try {
      const chat = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user }
        ],
        temperature: 0.2,
        response_format: { type: "json_object" }
      });
      const content = chat.choices?.[0]?.message?.content || "{}";
      const parsed = JSON.parse(content);
      const list = Array.isArray(parsed) ? parsed : parsed?.items || parsed?.recommendations || [];
      ids = Array.isArray(list) ? list.map((o) => o.id).filter(Boolean) : [];
    } catch {
      ids = candidates.slice(0, 5).map((c) => c.id);
    }

    const uniqueOrdered = ids.filter((id, idx) => ids.indexOf(id) === idx && candidates.find((c) => c.id === id));
    const fallback = candidates.map((c) => c.id).filter((id) => !uniqueOrdered.includes(id));
    let finalIds = [...uniqueOrdered, ...fallback].slice(0, 10);
    if (!finalIds.length) finalIds = candidates.map(c => c.id).slice(0, 10);

    return Response.json({ recommendations: finalIds });
  } catch (e) {
    return new Response(JSON.stringify({ error: "server_error" }), { status: 500 });
  }
}


