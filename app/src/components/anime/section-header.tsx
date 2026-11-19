import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, layout, typography } from '@/theme';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} hitSlop={8}>
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
    paddingHorizontal: layout.sectionPaddingH,
    paddingVertical: layout.sectionPaddingV,
  },
  title: typography.sectionTitle,
  action: {
    color: colors.textMuted,
    fontFamily: fonts.uiMedium,
    fontSize: 11,
  },
  subContainer: {
    paddingHorizontal: layout.sectionPaddingH,
    paddingVertical: layout.sectionPaddingV,
  },
  subtitle: typography.sectionLabel,
});
