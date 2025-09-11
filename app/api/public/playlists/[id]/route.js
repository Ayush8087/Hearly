import { prisma } from "@/lib/prisma";

export async function GET(_req, { params }) {
  const playlist = await prisma.playlist.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      createdAt: true,
      user: { select: { name: true } },
      songs: { select: { songId: true, createdAt: true } },
    },
  });
  if (!playlist) return new Response("Not found", { status: 404 });

  return Response.json({
    id: playlist.id,
    name: playlist.name,
    createdAt: playlist.createdAt,
    ownerName: playlist.user?.name || null,
    songs: playlist.songs.map((s) => ({ songId: s.songId })),
  }, { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=300" } });
}


