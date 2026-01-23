import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { Colors, Radii } from '@/constants/Colors';

interface SecondaryButtonProps {
  label: string;
  onPress: () => void;
  style?: ViewStyle | ViewStyle[];
}

export const SecondaryButton = ({ label, onPress, style }: SecondaryButtonProps) => {
  return (
    <Pressable onPress={onPress} style={[styles.button, style]}>
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: Radii.lg,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: Colors.sage,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.sageDark,
  },
});
