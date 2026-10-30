import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { THEME } from '../constants/theme';

export interface BoardPreviewProps {
  size?: number;
  themeColor?: string;
  style?: ViewStyle;
}

export const BoardPreview: React.FC<BoardPreviewProps> = ({
  size = 220,
  themeColor = THEME.colors.primary,
  style,
}) => {
  const frameWidth = size * 0.08;
  const innerSize = size - frameWidth * 2;
  const pocketSize = size * 0.1;
  const centerSize = innerSize * 0.38;
  const queenSize = centerSize * 0.28;
  const coinSize = queenSize * 0.85;

  return (
    <View
      style={[
        styles.outerFrame,
        { width: size, height: size, borderColor: THEME.colors.woodBorder },
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
            { width: innerSize, height: innerSize },
          ]}
        >
          {/* Pockets at 4 corners */}
          <View style={[styles.pocket, { top: 2, left: 2, width: pocketSize, height: pocketSize, borderRadius: pocketSize / 2 }]} />
          <View style={[styles.pocket, { top: 2, right: 2, width: pocketSize, height: pocketSize, borderRadius: pocketSize / 2 }]} />
          <View style={[styles.pocket, { bottom: 2, right: 2, width: pocketSize, height: pocketSize, borderRadius: pocketSize / 2 }]} />
          <View style={[styles.pocket, { bottom: 2, left: 2, width: pocketSize, height: pocketSize, borderRadius: pocketSize / 2 }]} />

          {/* 4 Baselines */}
          <View style={[styles.baselineHorizontal, { top: innerSize * 0.16, width: innerSize * 0.62 }]} />
          <View style={[styles.baselineHorizontal, { bottom: innerSize * 0.16, width: innerSize * 0.62 }]} />
          <View style={[styles.baselineVertical, { left: innerSize * 0.16, height: innerSize * 0.62 }]} />
          <View style={[styles.baselineVertical, { right: innerSize * 0.16, height: innerSize * 0.62 }]} />

          {/* Center Floral Mandala */}
          <View
            style={[
              styles.centerCircle,
              {
                width: centerSize,
                height: centerSize,
                borderRadius: centerSize / 2,
                borderColor: themeColor,
              },
            ]}
          >
            {/* Inner Ring */}
            <View
              style={[
                styles.innerRing,
                {
                  width: centerSize * 0.65,
                  height: centerSize * 0.65,
                  borderRadius: (centerSize * 0.65) / 2,
                  borderColor: themeColor,
                },
              ]}
            >
              {/* Queen (Red) */}
              <View
                style={[
                  styles.queenCoin,
                  {
                    width: queenSize,
                    height: queenSize,
                    borderRadius: queenSize / 2,
                  },
                ]}
              />
            </View>

            {/* Orbiting Coin Dots */}
            {[0, 60, 120, 180, 240, 300].map((deg, idx) => {
              const rad = (deg * Math.PI) / 180;
              const r = centerSize * 0.38;
              const x = r * Math.cos(rad);
              const y = r * Math.sin(rad);
              const isWhite = idx % 2 === 0;

              return (
                <View
                  key={deg}
                  style={[
                    styles.miniCoin,
                    {
                      width: coinSize,
                      height: coinSize,
                      borderRadius: coinSize / 2,
                      backgroundColor: isWhite ? THEME.colors.coinWhite : THEME.colors.coinBlack,
                      borderColor: isWhite ? '#CBD5E1' : '#334155',
                      transform: [{ translateX: x }, { translateY: y }],
                    },
                  ]}
                />
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerFrame: {
    backgroundColor: THEME.colors.woodDark,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    ...THEME.shadows.card,
  },
  cushion: {
    backgroundColor: THEME.colors.woodPrimary,
    borderRadius: THEME.borderRadius.sm,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playingSurface: {
    backgroundColor: THEME.colors.playingSurface,
    borderRadius: THEME.borderRadius.xs,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pocket: {
    position: 'absolute',
    backgroundColor: '#0F0C0A',
    borderWidth: 1.5,
    borderColor: '#475569',
  },
  baselineHorizontal: {
    position: 'absolute',
    height: 1.5,
    backgroundColor: '#A0522D',
  },
  baselineVertical: {
    position: 'absolute',
    width: 1.5,
    backgroundColor: '#A0522D',
  },
  centerCircle: {
    position: 'absolute',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerRing: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  queenCoin: {
    backgroundColor: THEME.colors.queenRed,
    borderWidth: 1,
    borderColor: '#FEF08A',
  },
  miniCoin: {
    position: 'absolute',
    borderWidth: 1,
  },
});
