import { useState, useEffect, useCallback, useRef } from 'react';
import { offlineDB } from './db';

/**
 * Format bytes to human readable format (KB, MB, GB)
 */
export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Global active blob URL cache so we can cleanly revoke previous ones
let activeBlobUrl: string | null = null;

export async function getActiveLocalVideoUrl(): Promise<string | null> {
  try {
    const media = await offlineDB.getVideoMedia();
    if (!media || !media.blob) {
      if (activeBlobUrl) {
        URL.revokeObjectURL(activeBlobUrl);
        activeBlobUrl = null;
      }
      return null;
    }

    // Revoke old URL before creating new one
    if (activeBlobUrl) {
      URL.revokeObjectURL(activeBlobUrl);
    }
    activeBlobUrl = URL.createObjectURL(media.blob);
    return activeBlobUrl;
  } catch (err) {
    console.warn('[VideoManager] Error creating local video blob URL:', err);
    return null;
  }
}

/**
 * React hook for loading local video blob URL safely with cleanup
 */
export function useLocalVideo(triggerKey?: string | number) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoMeta, setVideoMeta] = useState<{
    name: string;
    size: number;
    type: string;
    updated_at: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const currentUrlRef = useRef<string | null>(null);

  const loadVideo = useCallback(async () => {
    setIsLoading(true);
    try {
      const media = await offlineDB.getVideoMedia();
      if (media && media.blob) {
        if (currentUrlRef.current) {
          URL.revokeObjectURL(currentUrlRef.current);
        }
        const url = URL.createObjectURL(media.blob);
        currentUrlRef.current = url;
        setVideoUrl(url);
        setVideoMeta({
          name: media.name,
          size: media.size,
          type: media.type,
          updated_at: media.updated_at
        });
      } else {
        if (currentUrlRef.current) {
          URL.revokeObjectURL(currentUrlRef.current);
          currentUrlRef.current = null;
        }
        setVideoUrl(null);
        setVideoMeta(null);
      }
    } catch (err) {
      console.warn('[useLocalVideo] Error loading local video:', err);
      setVideoUrl(null);
      setVideoMeta(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVideo();
    return () => {
      if (currentUrlRef.current) {
        URL.revokeObjectURL(currentUrlRef.current);
        currentUrlRef.current = null;
      }
    };
  }, [loadVideo, triggerKey]);

  return { videoUrl, videoMeta, isLoading, reloadVideo: loadVideo };
}
