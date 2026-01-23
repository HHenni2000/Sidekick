import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Radii } from '@/constants/Colors';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
}

export const PrimaryButton = ({ label, onPress, disabled, style }: PrimaryButtonProps) => {
  if (disabled) {
    return (
      <Pressable disabled style={[styles.disabled, style]}>
        <Text style={styles.disabledText}>{label}</Text>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} style={style}>
      <LinearGradient
        colors={[Colors.primary, Colors.tealDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Text style={styles.text}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  gradient: {
    borderRadius: Radii.xl,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: Colors.shadowButton,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primaryForeground,
  },
  disabled: {
    borderRadius: Radii.xl,
    paddingVertical: 14,
    backgroundColor: Colors.muted,
    alignItems: 'center',
  },
  disabledText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.mutedForeground,
  },
});
