import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  return user;
}

export async function GET(_req, { params }) {
  const user = await requireSession();
  if (!user) return new Response("Unauthorized", { status: 401 });
  const playlist = await prisma.playlist.findFirst({
    where: { id: params.id, userId: user.id },
    include: { songs: true },
  });
  if (!playlist) return new Response("Not found", { status: 404 });
  return Response.json(playlist);
}

export async function PUT(req, { params }) {
  const user = await requireSession();
  if (!user) return new Response("Unauthorized", { status: 401 });
  const { songs, name } = await req.json();
  // ensure ownership
  const owned = await prisma.playlist.findFirst({ where: { id: params.id, userId: user.id } });
  if (!owned) return new Response("Not found", { status: 404 });
  if (name) {
    await prisma.playlist.update({ where: { id: params.id }, data: { name } });
  }
  if (Array.isArray(songs)) {
    await prisma.playlistSong.deleteMany({ where: { playlistId: params.id } });
    if (songs.length) {
      await prisma.playlistSong.createMany({ data: songs.map((songId) => ({ playlistId: params.id, songId })), skipDuplicates: true });
    }
  }
  const result = await prisma.playlist.findUnique({
    where: { id: params.id },
    include: { songs: true },
  });
  return Response.json(result);
}

export async function DELETE(_req, { params }) {
  const user = await requireSession();
  if (!user) return new Response("Unauthorized", { status: 401 });
  const playlist = await prisma.playlist.findUnique({ where: { id: params.id } });
  if (!playlist) return new Response("Not found", { status: 404 });
  if (playlist.userId !== user.id) return new Response("Forbidden", { status: 403 });
  await prisma.playlistSong.deleteMany({ where: { playlistId: params.id } });
  await prisma.playlist.delete({ where: { id: params.id } });
  return new Response(null, { status: 204 });
}


