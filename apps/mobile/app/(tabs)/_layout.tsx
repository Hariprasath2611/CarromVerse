import React from 'react';
import { Tabs } from 'expo-router';
import { Text, View, StyleSheet } from 'react-native';
import { THEME } from '../../src/constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: THEME.colors.goldBright,
        tabBarInactiveTintColor: THEME.colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Play',
          tabBarIcon: ({ focused, color }) => (
            <Text style={{ fontSize: 20, color }}>🎯</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused, color }) => (
            <Text style={{ fontSize: 20, color }}>👤</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused, color }) => (
            <Text style={{ fontSize: 20, color }}>⚙️</Text>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: THEME.colors.surface,
    borderTopColor: THEME.colors.surfaceBorder,
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
