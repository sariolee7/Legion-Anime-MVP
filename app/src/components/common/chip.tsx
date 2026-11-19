import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, fonts } from '@/theme';

interface ChipProps {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function Chip({ label, active, disabled, onPress, style }: ChipProps) {
  const content = (
    <Text style={[styles.label, active && styles.labelActive, disabled && styles.labelDisabled]}>
      {label}
    </Text>
  );

  if (!onPress) {
    return (
      <View style={[styles.chip, active && styles.chipActive, style]}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.chip,
        active && styles.chipActive,
        pressed && { opacity: 0.75 },
        disabled && { opacity: 0.4 },
        style,
      ]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: colors.elevated,
    borderRadius: 3,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.white,
    borderColor: colors.white,
  },
  label: {
    color: colors.textSecondary,
    fontFamily: fonts.uiMedium,
    fontSize: 11,
  },
  labelActive: {
    color: colors.black,
  },
  labelDisabled: {
    color: colors.textMuted,
  },
});
