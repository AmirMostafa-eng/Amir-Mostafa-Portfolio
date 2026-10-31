import type { ProjectVideo } from "@/types";

const videoIdPattern = /^[\w-]+$/;

function parseYouTubeUrl(url: URL): ProjectVideo | null {
  const host = url.hostname.toLowerCase();
  let id: string | null = null;

  if (host === "youtu.be") {
    id = url.pathname.split("/").filter(Boolean)[0] ?? null;
  } else if (host === "youtube.com" || host === "www.youtube.com" || host === "m.youtube.com") {
    if (url.pathname === "/watch") {
      id = url.searchParams.get("v");
    } else {
      const match = url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)$/);
      id = match?.[1] ?? null;
    }
  }

  return id && videoIdPattern.test(id) ? { provider: "youtube", id } : null;
}

export function parseVideoUrl(value: string): ProjectVideo {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`Invalid video URL "${value}". Provide a full YouTube, Vimeo, Wistia, or video file URL.`);
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(`Unsupported video URL "${value}". Provide a YouTube, Vimeo, Wistia, or HTTP(S) video file URL.`);
  }

  const host = url.hostname.toLowerCase();
  const youtube = parseYouTubeUrl(url);
  if (youtube) return youtube;
  if (host === "youtube.com" || host === "www.youtube.com" || host === "m.youtube.com" || host === "youtu.be") {
    throw new Error(`Unsupported YouTube URL "${value}". Use a video watch, embed, shorts, or youtu.be URL.`);
  }

  if (host === "vimeo.com" || host === "www.vimeo.com" || host === "player.vimeo.com") {
    const segments = url.pathname.split("/").filter(Boolean);
    const isPlayerUrl = host === "player.vimeo.com";
    const id = isPlayerUrl
      ? segments[0] === "video" ? segments[1] : undefined
      : segments[0];
    const pathHash = !isPlayerUrl && segments.length === 2 ? segments[1] : undefined;
    const hash = url.searchParams.get("h") ?? pathHash;

    if (id && /^\d+$/.test(id) && segments.length === (isPlayerUrl ? 2 : pathHash ? 2 : 1)) {
      if (hash && !videoIdPattern.test(hash)) {
        throw new Error(`Invalid Vimeo hash in URL "${value}".`);
      }
      return hash ? { provider: "vimeo", id, hash } : { provider: "vimeo", id };
    }
    throw new Error(`Unsupported Vimeo URL "${value}". Use a Vimeo video URL or player.vimeo.com/video URL.`);
  }

  if (host.endsWith(".wistia.com") || host === "fast.wistia.net") {
    const segments = url.pathname.split("/").filter(Boolean);
    if (segments[0] === "s") {
      throw new Error(`Wistia share links (/s/{slug}) are not supported. Use the /medias/ URL for the video instead.`);
    }

    const id = (host !== "fast.wistia.net" && (segments[0] === "medias" || segments[0] === "m"))
      ? segments.length === 2 ? segments[1] : undefined
      : (host === "fast.wistia.net" || host === "fast.wistia.com") && segments[0] === "embed" && segments[1] === "iframe" && segments.length === 3
        ? segments[2]
        : undefined;

    if (id && videoIdPattern.test(id)) return { provider: "wistia", id };
    throw new Error(`Unsupported Wistia URL "${value}". Use a /medias/, /m/, or embed/iframe URL.`);
  }

  if (/\.(?:mp4|webm|mov|m4v|ogv|ogg|mpg|mpeg|m3u8)$/i.test(url.pathname)) {
    return { provider: "file", url: value };
  }

  throw new Error(`Unsupported video URL "${value}". Provide a YouTube, Vimeo, Wistia, or direct video file URL.`);
}
