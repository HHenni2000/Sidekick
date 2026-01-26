import { useEffect } from 'react';
import { Stack } from 'expo-router';
import 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import * as Updates from 'expo-updates';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Start im Tab-Layout.
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  useEffect(() => {
    async function onFetchUpdateAsync() {
      try {
        const update = await Updates.checkForUpdateAsync();

        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        }
      } catch (error) {
        // You can also add an alert() to see the error message in case of an error when fetching updates.
        console.log(`Error fetching latest Expo update: ${error}`);
      }
    }

    // Only check for updates in production builds
    if (!__DEV__) {
      onFetchUpdateAsync();
    }
  }, []);

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
