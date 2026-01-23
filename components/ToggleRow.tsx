import { StyleSheet, Text, View } from 'react-native';
import { Switch } from 'react-native';
import { Colors } from '@/constants/Colors';

interface ToggleRowProps {
  label: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export const ToggleRow = ({ label, description, value, onChange }: ToggleRowProps) => {
  return (
    <View style={styles.row}>
      <View style={styles.textWrap}>
        <Text style={styles.label}>{label}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: Colors.border, true: Colors.sage }}
        thumbColor={value ? Colors.primary : '#f4f4f4'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  textWrap: {
    flex: 1,
    marginRight: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.foreground,
  },
  description: {
    fontSize: 12,
    color: Colors.mutedForeground,
    marginTop: 4,
  },
});
