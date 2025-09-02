import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return new Response("Unauthorized", { status: 401 });
  const { songId, playlistId, playlistName } = await req.json();
  if (!songId) return new Response("songId required", { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return new Response("Unauthorized", { status: 401 });

  let playlist;
  if (playlistId) {
    playlist = await prisma.playlist.findFirst({ where: { id: playlistId, userId: user.id } });
    if (!playlist) return new Response("Playlist not found", { status: 404 });
  } else if (playlistName) {
    playlist = await prisma.playlist.findFirst({ where: { userId: user.id, name: playlistName } });
    if (!playlist) {
      playlist = await prisma.playlist.create({ data: { userId: user.id, name: playlistName } });
    }
  } else {
    playlist = await prisma.playlist.findFirst({ where: { userId: user.id, name: "My Favorites" } });
    if (!playlist) {
      playlist = await prisma.playlist.create({ data: { userId: user.id, name: "My Favorites" } });
    }
  }

  // avoid duplicates
  const existing = await prisma.playlistSong.findFirst({ where: { playlistId: playlist.id, songId } });
  if (!existing) {
    await prisma.playlistSong.create({ data: { playlistId: playlist.id, songId } });
  }

  const updated = await prisma.playlist.findUnique({ where: { id: playlist.id }, include: { songs: true } });
  return Response.json(updated);
}


