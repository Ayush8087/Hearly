/*
  Warnings:

  - A unique constraint covering the columns `[playlistId,songId]` on the table `PlaylistSong` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PlaylistSong_playlistId_songId_key" ON "PlaylistSong"("playlistId", "songId");
