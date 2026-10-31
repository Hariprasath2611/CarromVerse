import React from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { THEME } from '../../src/constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: THEME.colors.neonEmerald,
        tabBarInactiveTintColor: THEME.colors.mutedMint,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'HOME',
          tabBarIcon: () => null,
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: 'FRIENDS',
          tabBarIcon: () => null,
        }}
      />
      <Tabs.Screen
        name="customize"
        options={{
          title: 'CUSTOMIZE',
          tabBarIcon: () => null,
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'RANKINGS',
          tabBarIcon: () => null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'PROFILE',
          tabBarIcon: () => null,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#07261C',
    borderTopColor: '#1B7050',
    borderTopWidth: 2,
    height: 56,
    paddingBottom: 4,
    paddingTop: 4,
  },
  tabItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});
