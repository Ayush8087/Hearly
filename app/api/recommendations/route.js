import { GoogleGenerativeAI } from "@google/generative-ai";
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

    const apiKey = process.env.GEMINI_API_KEY || "AIzaSyC_eeURwI1oaFiTGH_mXUblQnSnt55I4J8";
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Given the following songs with fields id, name, primaryArtist, and album, return the best 5 recommendations as a JSON array of objects with only one field: id. Input songs: ${JSON.stringify(
      candidates.map((c) => ({ id: c.id, name: c.name, primaryArtist: c?.artists?.primary?.[0]?.name || "unknown", album: c?.album?.name || "" }))
    )}`;

    let ids = [];
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const parsed = JSON.parse(text);
      ids = Array.isArray(parsed) ? parsed.map((o) => o.id).filter(Boolean) : [];
    } catch {
      ids = candidates.slice(0, 5).map((c) => c.id);
    }

    const uniqueOrdered = ids.filter((id, idx) => ids.indexOf(id) === idx && candidates.find((c) => c.id === id));
    const fallback = candidates.map((c) => c.id).filter((id) => !uniqueOrdered.includes(id));
    const finalIds = [...uniqueOrdered, ...fallback].slice(0, 10);

    return Response.json({ recommendations: finalIds });
  } catch (e) {
    return new Response(JSON.stringify({ error: "server_error" }), { status: 500 });
  }
}


