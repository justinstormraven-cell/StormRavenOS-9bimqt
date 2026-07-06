// Powered by OnSpace.AI
import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, View, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../constants/theme';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  const tabBarStyle = {
    height: Platform.select({
      ios: insets.bottom + 58,
      android: insets.bottom + 58,
      default: 68,
    }),
    paddingTop: 8,
    paddingBottom: Platform.select({
      ios: insets.bottom + 6,
      android: insets.bottom + 6,
      default: 8,
    }),
    paddingHorizontal: Spacing.base,
    backgroundColor: Colors.matteBlack,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle,
        tabBarActiveTintColor: Colors.amethyst,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          fontFamily: Typography.mono,
          letterSpacing: 0.8,
          marginTop: 1,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'DASHBOARD',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="dashboard" size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="terminal"
        options={{
          title: 'TERMINAL',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="terminal" size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="modules"
        options={{
          title: 'MODULES',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="memory" size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="network"
        options={{
          title: 'NETWORK',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="radar" size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ymir"
        options={{
          title: 'YMIR',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="developer-board" size={size - 2} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
