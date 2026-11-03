import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { AnimatedCoinSticker } from './AnimatedCoinSticker';
import { StickerItem } from './StickersModal';

export interface FloatingReactionProps {
  sticker: StickerItem | null;
  onDismiss: () => void;
}

export const FloatingReaction: React.FC<FloatingReactionProps> = ({
  sticker,
  onDismiss,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (!sticker) return;

    // Reset values
    scaleAnim.setValue(0);
    opacityAnim.setValue(0);
    translateYAnim.setValue(20);

    // 1. Entrance Pop: Spring bounce up
    const entrance = Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 140,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(translateYAnim, {
        toValue: 0,
        tension: 120,
        friction: 8,
        useNativeDriver: true,
      }),
    ]);

    // 2. Float Up and Fade Out after 2000ms
    const exit = Animated.sequence([
      Animated.delay(2000),
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 350,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: -35,
          duration: 350,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.85,
          duration: 350,
          useNativeDriver: true,
        }),
      ]),
    ]);

    Animated.sequence([entrance, exit]).start(() => {
      onDismiss();
    });
  }, [sticker]);

  if (!sticker) return null;

  return (
    <Animated.View
      style={[
        styles.reactionContainer,
        {
          opacity: opacityAnim,
          transform: [{ translateY: translateYAnim }, { scale: scaleAnim }],
        },
      ]}
      pointerEvents="none"
    >
      <View style={styles.bubbleCard}>
        {/* Animated 3D Coin Character */}
        <AnimatedCoinSticker id={sticker.id} size={76} animate={true} />

        {/* Reaction Text Badge */}
        <View style={styles.nameBadge}>
          <Text style={styles.nameText}>{sticker.name || sticker.text}</Text>
        </View>

        {/* Speech Bubble Pointer Tail */}
        <View style={styles.bubbleTail} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  reactionContainer: {
    position: 'absolute',
    top: 24,
    right: 20,
    zIndex: 100,
    elevation: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleCard: {
    backgroundColor: 'rgba(20, 10, 8, 0.94)',
    borderRadius: 24,
    borderWidth: 2.5,
    borderColor: '#E9B949',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E9B949',
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    position: 'relative',
  },
  nameBadge: {
    backgroundColor: '#0F261C',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#2BD67B',
    paddingHorizontal: 12,
    paddingVertical: 3,
    marginTop: 8,
  },
  nameText: {
    color: '#F5ECD2',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  bubbleTail: {
    position: 'absolute',
    bottom: -8,
    alignSelf: 'center',
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#E9B949',
  },
});

