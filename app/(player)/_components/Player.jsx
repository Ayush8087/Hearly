"use client"
import { Button } from "@/components/ui/button";
import { getSongsById, getSongsLyricsById } from "@/lib/fetch";
import { Download, Pause, Play, RedoDot, UndoDot, Repeat, Loader2, BookmarkPlus, Repeat1, Share2 } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useContext, useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { NextContext } from "@/hooks/use-context";
import Next from "@/components/cards/next";
import { useMusic } from "@/components/music-provider";
import { IoPause } from "react-icons/io5";

export default function Player({ id }) {
    const [data, setData] = useState([]);
    const [playing, setPlaying] = useState(true);
    const audioRef = useRef(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isLooping, setIsLooping] = useState(false);
    const [audioURL, setAudioURL] = useState("");
    const [playlists, setPlaylists] = useState([]);
    const [newPlaylistName, setNewPlaylistName] = useState("");
    const params = useSearchParams();
    const next = useContext(NextContext);
    const { current, setCurrent } = useMusic();

    const getSong = async () => {
        try {
            const get = await getSongsById(id);
            const payload = await get.json();
            const song = payload?.data?.[0];
            if (!song) throw new Error('No song data');
            setData(song);
            const urls = song?.downloadUrl || [];
            const preferred = urls[2]?.url || urls[1]?.url || urls[0]?.url || "";
            setAudioURL(preferred);
        } catch (e) {
            toast.error('Something went wrong!');
        }
    };

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    const togglePlayPause = () => {
        if (playing) {
            audioRef.current.pause();
            localStorage.setItem("p", "false");
        } else {
            audioRef.current.play();
            localStorage.setItem("p", "true");
        }
        setPlaying(!playing);
    };

    const downloadSong = async () => {
        setIsDownloading(true);
        const response = await fetch(audioURL);
        const datas = await response.blob();
        const url = URL.createObjectURL(datas);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${data.name}.mp3`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('downloaded');
        setIsDownloading(false);
    };

    const handleSeek = (e) => {
        const seekTime = e[0];
        audioRef.current.currentTime = seekTime;
        setCurrentTime(seekTime);
    };

    const loopSong = () => {
        audioRef.current.loop = !audioRef.current.loop;
        setIsLooping(!isLooping);
    };

    const handleShare = () => {
        try {
            const base = process.env.NEXT_PUBLIC_SITE_URL || `https://${window.location.host}`;
            navigator.share({ url: `${base}/${data.id}` });
        }
        catch (e) {
            toast.error('Something went wrong!');
        }
    }

    const addToPlaylist = async () => {
        try {
            const res = await fetch('/api/playlists/add-song', { method: 'POST', body: JSON.stringify({ songId: id }) });
            if (!res.ok) return toast.error('Sign in to save to playlist');
            toast.success('Added to My Favorites');
        } catch {
            toast.error('Could not add to playlist');
        }
    }

    const fetchPlaylists = async () => {
        try {
            const res = await fetch('/api/playlists');
            if (res.ok) setPlaylists(await res.json());
        } catch {}
    };

    const addToSpecific = async (playlistId) => {
        try {
            const res = await fetch('/api/playlists/add-song', { method: 'POST', body: JSON.stringify({ songId: id, playlistId }) });
            if (!res.ok) return toast.error('Sign in to save to playlist');
            toast.success('Added to playlist');
        } catch {
            toast.error('Could not add to playlist');
        }
    };

    const createAndAdd = async () => {
        if (!newPlaylistName.trim()) return;
        try {
            const res = await fetch('/api/playlists/add-song', { method: 'POST', body: JSON.stringify({ songId: id, playlistName: newPlaylistName.trim() }) });
            if (!res.ok) return toast.error('Sign in to save to playlist');
            setNewPlaylistName("");
            toast.success('Added to new playlist');
            fetchPlaylists();
        } catch {
            toast.error('Could not add to playlist');
        }
    };


    useEffect(() => {
        getSong();
        fetchPlaylists();
        localStorage.setItem("last-played", id);
        localStorage.removeItem("p");
        if (current) {
            audioRef.current.currentTime = parseFloat(current + 1);
        }
        const handleTimeUpdate = () => {
            try {
                setCurrentTime(audioRef.current.currentTime);
                setDuration(audioRef.current.duration);
                setCurrent(audioRef.current.currentTime);
            }
            catch (e) {
                setPlaying(false);
            }
        };
        audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
        return () => {
            if (audioRef.current) {
                audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
            }
        };
    }, []);
    useEffect(() => {
        const autoplayNext = async () => {
            if (isLooping || duration === 0) return;
            if (currentTime < duration - 0.25) return;

            const playlistId = params.get('playlist');
            const posParam = params.get('pos');
            const currentIndex = posParam ? parseInt(posParam, 10) : null;

            if (playlistId && currentIndex !== null && !Number.isNaN(currentIndex)) {
                try {
                    const res = await fetch(`/api/playlists/${playlistId}`);
                    if (!res.ok) throw new Error('Failed to load playlist');
                    const list = await res.json();
                    const songIds = (list?.songs || []).map(s => s.songId);
                    const nextIndex = currentIndex + 1;
                    const nextId = songIds[nextIndex];
                    if (nextId) {
                        const base = `https://${window.location.host}`;
                        window.location.href = `${base}/${nextId}?playlist=${playlistId}&pos=${nextIndex}`;
                        return;
                    }
                } catch {}
            }

            if (next?.nextData?.id) {
                const base = `https://${window.location.host}`;
                window.location.href = `${base}/${next.nextData.id}`;
            }
        };
        autoplayNext();
    }, [currentTime, duration, isLooping, params]);
    return (
        <div className="mb-3 mt-10">
            <audio onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onLoadedData={() => setDuration(audioRef.current.duration)} autoPlay={playing} src={audioURL} ref={audioRef}></audio>
            <div className="grid gap-6 w-full">
                <div className="sm:flex px-6 md:px-20 lg:px-32 grid gap-5 w-full">
                    <div>
                        {data.length <= 0 ? (
                            <Skeleton className="md:w-[130px] aspect-square rounded-2xl md:h-[150px]" />
                        ) : (
                            <div className="relative">
                                <img src={data.image[2].url} className="sm:h-[150px] h-full aspect-square bg-secondary/50 rounded-2xl sm:w-[200px] w-full sm:mx-0 mx-auto object-cover" />
                                <img src={data.image[2].url} className="hidden dark:block absolute top-0 left-0 w-[110%] h-[110%] blur-3xl -z-10 opacity-50" />
                            </div>
                        )}
                    </div>
                    {data.length <= 0 ? (
                        <div className="flex flex-col justify-between w-full">
                            <div>
                                <Skeleton className="h-4 w-36 mb-2" />
                                <Skeleton className="h-3 w-16 mb-4" />
                            </div>
                            <div>
                                <Skeleton className="h-4 w-full rounded-full mb-2" />
                                <div className="w-full flex items-center justify-between">
                                    <Skeleton className="h-[9px] w-6" />
                                    <Skeleton className="h-[9px] w-6" />
                                </div>
                                <div className="flex items-center gap-3 mt-3">
                                    <Skeleton className="h-10 w-10" />
                                    <Skeleton className="h-10 w-10" />
                                    <Skeleton className="h-10 w-10" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col justify-between w-full">
                            <div className="sm:mt-0 mt-3">
                                <h1 className="text-xl font-bold md:max-w-lg">{data.name}</h1>
                                <p className="text-sm text-muted-foreground">by <Link href={"/search/" + `${encodeURI(data.artists.primary[0].name.toLowerCase().split(" ").join("+"))}`} className="text-foreground">{data.artists.primary[0]?.name || "unknown"}</Link></p>
                            </div>
                            <div className="grid gap-2 w-full mt-5 sm:mt-0">
                                <Slider onValueChange={handleSeek} value={[currentTime]} max={duration} className="w-full" />
                                <div className="w-full flex items-center justify-between">
                                    <span className="text-sm">{formatTime(currentTime)}</span>
                                    <span className="text-sm">{formatTime(duration)}</span>
                                </div>
                                <div className="flex items-center mt-1 justify-between w-full sm:mt-2">
                                    <Button variant={playing ? "default" : "secondary"} className="gap-1 rounded-full" onClick={togglePlayPause}>
                                        {playing ? (
                                            <IoPause className="h-4 w-4" />
                                        ) : (
                                            <Play className="h-4 w-4" />
                                        )}
                                        {playing ? "Pause" : "Play"}
                                    </Button>
                                    <div className="flex items-center gap-2 sm:gap-3 sm:mt-0">
                                        <Button size="icon" variant="ghost" onClick={loopSong}>
                                            {!isLooping ? <Repeat className="h-4 w-4" /> : <Repeat1 className="h-4 w-4" />}
                                        </Button>
                                        <Button size="icon" variant="ghost" onClick={downloadSong}>
                                            {isDownloading ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Download className="h-4 w-4" />
                                            )}
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button size="icon" variant="ghost"><BookmarkPlus className="h-4 w-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onClick={addToPlaylist}>Add to My Favorites</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                {playlists.map((p) => (
                                                    <DropdownMenuItem key={p.id} onClick={() => addToSpecific(p.id)}>Add to {p.name}</DropdownMenuItem>
                                                ))}
                                                <DropdownMenuSeparator />
                                                <div className="p-2 grid gap-2">
                                                    <Input placeholder="New playlist name" value={newPlaylistName} onChange={(e) => setNewPlaylistName(e.target.value)} />
                                                    <Button size="sm" onClick={createAndAdd}>Create & Add</Button>
                                                </div>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <Button size="icon" variant="ghost" onClick={handleShare}><Share2 className="h-4 w-4" /></Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {next.nextData && (
                <div className="mt-10 -mb-3 px-6 md:px-20 lg:px-32">
                    <Next name={next.nextData.name} artist={next.nextData.artist} image={next.nextData.image} id={next.nextData.id} />
                </div>
            )}
        </div>
    )
}
