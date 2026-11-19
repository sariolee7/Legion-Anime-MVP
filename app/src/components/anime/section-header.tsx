import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, layout, typography } from '@/theme';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  inset?: boolean;
}

export function SectionHeader({ title, actionLabel, onAction, inset = true }: SectionHeaderProps) {
  return (
    <View style={[styles.container, !inset && styles.noInset]}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} hitSlop={8} style={({ pressed }) => pressed && { opacity: 0.7 }}>
          <Text style={styles.action}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function SubsectionLabel({ title }: { title: string }) {
  return (
    <View style={styles.subContainer}>
      <Text style={styles.subtitle}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: layout.sectionPaddingH,
    paddingVertical: layout.sectionPaddingV,
  },
  noInset: {
    paddingHorizontal: 0,
  },
  title: typography.sectionTitle,
  action: {
    color: colors.textMuted,
    fontFamily: fonts.uiMedium,
    fontSize: 11,
  },
  subContainer: {
    paddingHorizontal: layout.sectionPaddingH,
    paddingTop: 6,
    paddingBottom: 6,
  },
  subtitle: {
    ...typography.sectionLabel,
    color: colors.textMuted,
    fontSize: 13,
  },
});
