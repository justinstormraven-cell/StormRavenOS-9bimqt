// Powered by OnSpace.AI
import { AlertProvider } from '@/template';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <AlertProvider>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor="#050508" />
        <Stack screenOptions={{ headerShown: false }} initialRouteName="boot">
          <Stack.Screen
            name="boot"
            options={{
              headerShown: false,
              animation: 'none',
            }}
          />
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
              animation: 'fade',
              animationDuration: 600,
            }}
          />
          <Stack.Screen
            name="lockdown-wall"
            options={{
              headerShown: false,
              animation: 'fade',
              animationDuration: 400,
            }}
          />
        </Stack>
      </SafeAreaProvider>
    </AlertProvider>
  );
}
