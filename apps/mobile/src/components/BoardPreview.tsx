import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { THEME } from '../constants/theme';

export interface BoardPreviewProps {
  size?: number;
  theme?: 'classic' | 'emerald' | 'mahogany' | string;
  themeColor?: string;
  style?: ViewStyle;
}

export const BoardPreview: React.FC<BoardPreviewProps> = ({
  size = 220,
  theme = 'classic',
  themeColor,
  style,
}) => {
  const frameWidth = size * 0.08;
  const innerSize = size - frameWidth * 2;
  const pocketSize = size * 0.1;
  const centerSize = innerSize * 0.38;
  const queenSize = centerSize * 0.28;
  const coinSize = queenSize * 0.85;

  const surfaceBg =
    theme === 'emerald'
      ? '#064E3B'
      : theme === 'mahogany'
      ? '#4A1D13'
      : THEME.colors.playingSurface;

  const frameColor =
    theme === 'emerald'
      ? '#0F291E'
      : theme === 'mahogany'
      ? '#2A0D08'
      : THEME.colors.woodBorder;

  return (
    <View
      style={[
        styles.outerFrame,
        { width: size, height: size, borderColor: frameColor },
        style,
      ]}
    >
      {/* Wooden Cushion Border */}
      <View
        style={[
          styles.cushion,
          { width: size - 12, height: size - 12, borderColor: THEME.colors.woodDark },
        ]}
      >
        {/* Polished Board Face */}
        <View
          style={[
            styles.playingSurface,
            { width: innerSize, height: innerSize, backgroundColor: surfaceBg },
          ]}
        >
          {/* Pockets at 4 corners */}
          <View style={[styles.pocket, { top: 2, left: 2, width: pocketSize, height: pocketSize, borderRadius: pocketSize / 2 }]} />
          <View style={[styles.pocket, { top: 2, right: 2, width: pocketSize, height: pocketSize, borderRadius: pocketSize / 2 }]} />
          <View style={[styles.pocket, { bottom: 2, right: 2, width: pocketSize, height: pocketSize, borderRadius: pocketSize / 2 }]} />
          <View style={[styles.pocket, { bottom: 2, left: 2, width: pocketSize, height: pocketSize, borderRadius: pocketSize / 2 }]} />

          {/* Baselines */}
          <View style={[styles.baselineHorizontal, { top: innerSize * 0.16, width: innerSize * 0.65 }]} />
          <View style={[styles.baselineHorizontal, { bottom: innerSize * 0.16, width: innerSize * 0.65 }]} />
          <View style={[styles.baselineVertical, { left: innerSize * 0.16, height: innerSize * 0.65 }]} />
          <View style={[styles.baselineVertical, { right: innerSize * 0.16, height: innerSize * 0.65 }]} />

          {/* Center Circle */}
          <View
            style={[
              styles.centerCircle,
              { width: centerSize, height: centerSize, borderRadius: centerSize / 2 },
            ]}
          >
            {/* Red Queen in center */}
            <View
              style={[
                styles.queen,
                { width: queenSize, height: queenSize, borderRadius: queenSize / 2 },
              ]}
            />
            {/* Surrounding Carrom Men */}
            <View style={[styles.coin, styles.coinWhite, { width: coinSize, height: coinSize, borderRadius: coinSize / 2, top: 4, left: centerSize * 0.4 }]} />
            <View style={[styles.coin, styles.coinBlack, { width: coinSize, height: coinSize, borderRadius: coinSize / 2, bottom: 4, left: centerSize * 0.4 }]} />
            <View style={[styles.coin, styles.coinWhite, { width: coinSize, height: coinSize, borderRadius: coinSize / 2, left: 4, top: centerSize * 0.4 }]} />
            <View style={[styles.coin, styles.coinBlack, { width: coinSize, height: coinSize, borderRadius: coinSize / 2, right: 4, top: centerSize * 0.4 }]} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerFrame: {
    backgroundColor: THEME.colors.woodPrimary,
    borderWidth: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    ...THEME.shadows.card,
  },
  cushion: {
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playingSurface: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pocket: {
    position: 'absolute',
    backgroundColor: '#0a0a0a',
    borderColor: '#3D1D0E',
    borderWidth: 2,
    zIndex: 2,
  },
  baselineHorizontal: {
    position: 'absolute',
    height: 1.5,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  baselineVertical: {
    position: 'absolute',
    width: 1.5,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  centerCircle: {
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  queen: {
    backgroundColor: THEME.colors.queenRed,
    borderColor: '#7F1D1D',
    borderWidth: 1.5,
    zIndex: 3,
  },
  coin: {
    position: 'absolute',
    borderWidth: 1,
    zIndex: 2,
  },
  coinWhite: {
    backgroundColor: THEME.colors.coinWhite,
    borderColor: '#D1D5DB',
  },
  coinBlack: {
    backgroundColor: THEME.colors.coinBlack,
    borderColor: '#0F172A',
  },
});
