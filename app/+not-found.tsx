import { Link, Stack } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { Screen } from '@/components/Screen';
import { Colors } from '@/constants/Colors';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Nicht gefunden' }} />
      <Screen scroll={false}>
        <Text style={styles.title}>Diese Ansicht existiert nicht.</Text>
        <Link href="/" style={styles.link}>Zur Startseite</Link>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.foreground,
    marginTop: 40,
  },
  link: {
    marginTop: 16,
    fontSize: 14,
    color: Colors.primary,
  },
});
