import { createElement, useEffect, useRef } from 'react';
import type { SyntheticEvent } from 'react';
import { StyleSheet, View } from 'react-native';

import { isHlsUrl } from '@/utils/stream';
import type { StreamingVideoProps } from './streaming-video';

interface HlsInstance {
  destroy: () => void;
  loadSource: (src: string) => void;
  attachMedia: (media: HTMLVideoElement) => void;
}

export function StreamingVideo({ uri, startAt = 0, onProgress, onEnded }: StreamingVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const seekAppliedRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    let cancelled = false;
    let hls: HlsInstance | null = null;
    seekAppliedRef.current = false;

    const attachNativeOrHls = async () => {
      const canPlayHlsNatively = video.canPlayType('application/vnd.apple.mpegurl') !== '';

      if (isHlsUrl(uri) && !canPlayHlsNatively) {
        try {
          const module = await import('hls.js');
          if (cancelled || !videoRef.current) {
            return;
          }
          const Hls = module.default;
          if (Hls.isSupported()) {
            const instance = new Hls() as unknown as HlsInstance;
            hls = instance;
            instance.loadSource(uri);
            instance.attachMedia(videoRef.current);
            return;
          }
        } catch {
          // Fall back to native playback below.
        }
      }

      video.src = uri;
    };

    void attachNativeOrHls();

    return () => {
      cancelled = true;
      hls?.destroy();
      video.removeAttribute('src');
      video.load();
    };
  }, [uri]);

  const handleLoadedMetadata = (event: SyntheticEvent<HTMLVideoElement>) => {
    if (!seekAppliedRef.current && startAt > 1) {
      seekAppliedRef.current = true;
      event.currentTarget.currentTime = startAt;
    }
  };

  const handleTimeUpdate = (event: SyntheticEvent<HTMLVideoElement>) => {
    onProgress?.(event.currentTarget.currentTime, event.currentTarget.duration || 0);
  };

  return (
    <View style={styles.container}>
      {createElement('video', {
        ref: videoRef,
        controls: true,
        playsInline: true,
        onLoadedMetadata: handleLoadedMetadata,
        onTimeUpdate: handleTimeUpdate,
        onEnded,
        style: {
          width: '100%',
          height: '100%',
          backgroundColor: '#000000',
          objectFit: 'contain',
        },
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
