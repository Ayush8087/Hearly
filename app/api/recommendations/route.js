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

    // Simple heuristic: prefer same primary artist first, then fill with others
    const primaryArtist = candidates?.[0]?.artists?.primary?.[0]?.name?.toLowerCase?.() || "";
    const sameArtist = candidates.filter(c => (c?.artists?.primary?.[0]?.name || "").toLowerCase() === primaryArtist).map(c => c.id);
    const others = candidates.map(c => c.id).filter(id => !sameArtist.includes(id));
    const finalIds = [...sameArtist, ...others].slice(0, 10);

    return Response.json({ recommendations: finalIds });
  } catch (e) {
    return new Response(JSON.stringify({ error: "server_error" }), { status: 500 });
  }
}


