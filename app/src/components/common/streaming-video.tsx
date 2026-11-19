import { useEventListener } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { StyleSheet, View } from 'react-native';

export interface StreamingVideoProps {
  uri: string;
  startAt?: number;
  autoplay?: boolean;
  onProgress?: (position: number, duration: number) => void;
  onEnded?: () => void;
}

export function StreamingVideo({ uri, startAt = 0, autoplay = true, onProgress, onEnded }: StreamingVideoProps) {
  const player = useVideoPlayer(uri, (instance) => {
    instance.timeUpdateEventInterval = 5;
    instance.loop = false;
    if (startAt > 1) {
      instance.currentTime = startAt;
    }
    if (autoplay) {
      instance.play();
    }
  });

  useEventListener(player, 'timeUpdate', ({ currentTime }) => {
    onProgress?.(currentTime, player.duration || 0);
  });

  useEventListener(player, 'playToEnd', () => {
    onEnded?.();
  });

  return (
    <View style={styles.container}>
      <VideoView
        style={StyleSheet.absoluteFill}
        player={player}
        nativeControls
        contentFit="contain"
        fullscreenOptions={{ enable: true }}
        allowsPictureInPicture={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
