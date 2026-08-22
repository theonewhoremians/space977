import { notFound } from "next/navigation";
import {
  getChannel,
  getVideosByChannel,
  shorts,
  playlists,
  videos,
} from "@/lib/data";
import ChannelView from "@/components/channel/ChannelView";

export default async function ChannelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const channel = getChannel(id);
  if (!channel) notFound();

  const channelVideos = getVideosByChannel(id);
  const list = channelVideos.length ? channelVideos : videos.slice(0, 8);
  const channelShorts = shorts.slice(0, 8);
  const channelPlaylists = playlists.filter((p) => p.channelId === id);
  const plist = channelPlaylists.length ? channelPlaylists : playlists.slice(0, 4);

  return (
    <ChannelView
      channel={channel}
      videos={list}
      shorts={channelShorts}
      playlists={plist}
    />
  );
}
