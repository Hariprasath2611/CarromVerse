import React from 'react';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabBarIcon } from '../../src/components';
import { THEME } from '../../src/constants/theme';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  // Ensure generous clearance for Android 3-button navigation (||| O <) so labels never overlap system keys
  const bottomClearance = Math.max(insets.bottom, Platform.OS === 'android' ? 52 : 16);
  const tabBarHeight = 62 + bottomClearance;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          {
            height: tabBarHeight,
            paddingBottom: bottomClearance,
          },
        ],
        tabBarActiveTintColor: '#2BD67B',
        tabBarInactiveTintColor: '#648A79',
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'HOME',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name="home" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: 'FRIENDS',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name="friends" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="customize"
        options={{
          title: 'CUSTOMIZE',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name="customize" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'RANKINGS',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name="rankings" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'PROFILE',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name="profile" focused={focused} color={color} />
          ),
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
    backgroundColor: '#061D15',
    borderTopColor: 'rgba(43, 214, 123, 0.3)',
    borderTopWidth: 1.5,
    paddingTop: 6,
    elevation: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
  },
  tabItem: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 4,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginTop: 2,
    textTransform: 'uppercase',
  },
});
