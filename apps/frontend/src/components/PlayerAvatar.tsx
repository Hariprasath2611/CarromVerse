import React from 'react';
import { Image, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { THEME } from '../constants/theme';

export interface PlayerAvatarProps {
  name: string;
  size?: number;
  avatarUrl?: string | null;
  isActive?: boolean;
  showHalo?: boolean;
  level?: number;
  teamColor?: 'team_a' | 'team_b';
  colorVariant?: 'gold' | 'emerald' | 'pink' | 'mint' | 'cream' | 'auto';
  ringColor?: string;
  fillColor?: string;
  style?: ViewStyle;
}

const COLOR_MAP: Record<string, { fill: string; ring: string; text: string }> = {
  H: { fill: '#E9B949', ring: '#2BD67B', text: '#07261C' },
  A: { fill: '#2BD67B', ring: '#E9B949', text: '#07261C' },
  M: { fill: '#F472B6', ring: '#F472B6', text: '#07261C' },
  K: { fill: '#9FD8B8', ring: '#9FD8B8', text: '#07261C' },
  D: { fill: '#2BD67B', ring: '#2BD67B', text: '#07261C' },
  Y: { fill: '#E9B949', ring: '#2BD67B', text: '#07261C' },
};

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  name,
  size = 52,
  avatarUrl,
  isActive = false,
  showHalo = false,
  level,
  teamColor,
  colorVariant = 'auto',
  ringColor,
  fillColor,
  style,
}) => {
  const isGlowing = isActive || showHalo;
  const initial = (name || 'P').trim()[0].toUpperCase();
  const radius = size / 2;

  const defaultPalette = COLOR_MAP[initial] || {
    fill: '#E9B949',
    ring: '#2BD67B',
    text: '#07261C',
  };

  const getResolvedColors = () => {
    let fill = fillColor || defaultPalette.fill;
    let ring = ringColor || defaultPalette.ring;
    let text = defaultPalette.text;

    if (colorVariant === 'gold') {
      fill = '#E9B949';
      ring = ringColor || '#2BD67B';
      text = '#07261C';
    } else if (colorVariant === 'emerald') {
      fill = '#2BD67B';
      ring = ringColor || '#E9B949';
      text = '#07261C';
    } else if (colorVariant === 'pink') {
      fill = '#F472B6';
      ring = ringColor || '#F472B6';
      text = '#07261C';
    } else if (colorVariant === 'mint') {
      fill = '#9FD8B8';
      ring = ringColor || '#9FD8B8';
      text = '#07261C';
    } else if (colorVariant === 'cream') {
      fill = '#F5ECD2';
      ring = ringColor || '#1B7050';
      text = '#07261C';
    }

    if (teamColor === 'team_a') {
      ring = '#2BD67B';
    } else if (teamColor === 'team_b') {
      ring = '#E9B949';
    }

    if (isGlowing) {
      ring = '#2BD67B';
    }

    return { fill, ring, text };
  };

  const colors = getResolvedColors();

  const isImageUri =
    avatarUrl &&
    (avatarUrl.startsWith('http://') ||
      avatarUrl.startsWith('https://') ||
      avatarUrl.startsWith('data:image/'));

  const isEmoji =
    avatarUrl &&
    !isImageUri &&
    avatarUrl.trim().length <= 4;

  return (
    <View style={[styles.wrapper, style]}>
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: radius,
            borderColor: colors.ring,
            backgroundColor: colors.fill,
            overflow: 'hidden',
          },
          isGlowing && styles.activeHalo,
        ]}
      >
        {isImageUri ? (
          <Image
            source={{ uri: avatarUrl }}
            style={{
              width: size - 6,
              height: size - 6,
              borderRadius: (size - 6) / 2,
            }}
            resizeMode="cover"
          />
        ) : isEmoji ? (
          <Text style={{ fontSize: size * 0.52 }}>{avatarUrl.trim()}</Text>
        ) : (
          <Text
            style={[
              styles.initial,
              {
                fontSize: size * 0.44,
                color: colors.text,
              },
            ]}
          >
            {initial}
          </Text>
        )}
      </View>

      {level !== undefined && (
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>{level}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    borderWidth: 3,             // 3px colored ring
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeHalo: {
    borderColor: '#2BD67B',
    shadowColor: '#2BD67B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.75,
    shadowRadius: 10,
    elevation: 8,
  },
  initial: {
    fontWeight: '900',
    color: '#07261C',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#2BD67B',
    borderColor: '#07261C',
    borderWidth: 1.5,
    borderRadius: 999,
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#07261C',
  },
});
