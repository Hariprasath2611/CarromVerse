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
  const pocketSize = size * 0.11;
  const centerSize = innerSize * 0.38;
  const queenSize = centerSize * 0.28;
  const coinSize = queenSize * 0.85;

  const surfaceBg =
    theme === 'emerald'
      ? '#0F5A3E'
      : theme === 'mahogany'
      ? '#4A1D13'
      : '#F5ECD2'; // Cream playing surface

  return (
    <View
      style={[
        styles.outerFrame,
        { width: size, height: size },
        style,
      ]}
    >
      {/* Brass Inner Line */}
      <View
        style={[
          styles.brassInnerLine,
          { width: size - 14, height: size - 14 },
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

          {/* Center Circle with Emerald Ring */}
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
            {/* Surrounding Carrom Men (Cream & Coal) */}
            <View style={[styles.coin, styles.coinWhite, { width: coinSize, height: coinSize, borderRadius: coinSize / 2, top: 4, left: centerSize * 0.38 }]} />
            <View style={[styles.coin, styles.coinBlack, { width: coinSize, height: coinSize, borderRadius: coinSize / 2, bottom: 4, left: centerSize * 0.38 }]} />
            <View style={[styles.coin, styles.coinWhite, { width: coinSize, height: coinSize, borderRadius: coinSize / 2, left: 4, top: centerSize * 0.38 }]} />
            <View style={[styles.coin, styles.coinBlack, { width: coinSize, height: coinSize, borderRadius: coinSize / 2, right: 4, top: centerSize * 0.38 }]} />
          </View>

          {/* Neon Emerald Striker preview */}
          <View
            style={[
              styles.striker,
              {
                width: coinSize * 1.3,
                height: coinSize * 1.3,
                borderRadius: (coinSize * 1.3) / 2,
                bottom: innerSize * 0.12,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerFrame: {
    backgroundColor: '#7A431C',
    borderRadius: 14,
    borderWidth: 5,
    borderColor: '#4D270E',
    alignItems: 'center',
    justifyContent: 'center',
    ...THEME.shadows.card,
  },
  brassInnerLine: {
    borderWidth: 2,
    borderColor: '#E9B949',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  playingSurface: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  pocket: {
    position: 'absolute',
    backgroundColor: '#0B0F0D',
    borderColor: '#1F2937',
    borderWidth: 1.5,
    zIndex: 2,
  },
  baselineHorizontal: {
    position: 'absolute',
    height: 1.5,
    backgroundColor: 'rgba(11, 15, 13, 0.45)',
  },
  baselineVertical: {
    position: 'absolute',
    width: 1.5,
    backgroundColor: 'rgba(11, 15, 13, 0.45)',
  },
  centerCircle: {
    borderWidth: 2,
    borderColor: '#2BD67B',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  queen: {
    backgroundColor: '#E23B5A',
    borderColor: '#981C33',
    borderWidth: 1.5,
    zIndex: 3,
  },
  coin: {
    position: 'absolute',
    zIndex: 2,
  },
  coinWhite: {
    backgroundColor: '#F5ECD2',
    borderWidth: 1.5,
    borderColor: '#C7B99A',
  },
  coinBlack: {
    backgroundColor: '#0B0F0D',
    borderWidth: 1.5,
    borderColor: '#242D28',
  },
  striker: {
    position: 'absolute',
    backgroundColor: '#2BD67B',
    borderWidth: 2,
    borderColor: '#169352',
    zIndex: 4,
    shadowColor: '#2BD67B',
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
});
