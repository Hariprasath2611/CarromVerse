import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

export type StickerId =
  | 'gg'
  | 'wow'
  | 'oops'
  | 'lol'
  | 'angry'
  | 'sad'
  | 'cool'
  | 'cheer';

export interface AnimatedCoinStickerProps {
  id: StickerId | string;
  size?: number;
  animate?: boolean;
}

export const STICKER_CONFIG: Record<
  StickerId,
  {
    name: string;
    bgColor: string;
    borderColor: string;
  }
> = {
  gg: {
    name: 'GG',
    bgColor: '#F5EEDB',
    borderColor: '#C7B99A',
  },
  wow: {
    name: 'WOW',
    bgColor: '#F5A623',
    borderColor: '#B87708',
  },
  oops: {
    name: 'OOPS',
    bgColor: '#FF7597',
    borderColor: '#D9456F',
  },
  lol: {
    name: 'LOL',
    bgColor: '#2BD67B',
    borderColor: '#159A52',
  },
  angry: {
    name: 'ANGRY',
    bgColor: '#EF4444',
    borderColor: '#991B1B',
  },
  sad: {
    name: 'SAD',
    bgColor: '#5EEAD4',
    borderColor: '#0D9488',
  },
  cool: {
    name: 'COOL',
    bgColor: '#1F2937',
    borderColor: '#374151',
  },
  cheer: {
    name: 'CHEER',
    bgColor: '#FBBF24',
    borderColor: '#D97706',
  },
};

export const AnimatedCoinSticker: React.FC<AnimatedCoinStickerProps> = ({
  id,
  size = 64,
  animate = true,
}) => {
  const stickerKey = (id?.toLowerCase() as StickerId) || 'gg';
  const config = STICKER_CONFIG[stickerKey] || STICKER_CONFIG.gg;

  // Animation values
  const mainAnim = useRef(new Animated.Value(0)).current;
  const secondaryAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animate) return;

    let animLoop: Animated.CompositeAnimation | null = null;

    switch (stickerKey) {
      case 'gg':
        // Happy nodding / bobbing up & down
        animLoop = Animated.loop(
          Animated.sequence([
            Animated.timing(mainAnim, {
              toValue: 1,
              duration: 380,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(mainAnim, {
              toValue: 0,
              duration: 420,
              easing: Easing.in(Easing.quad),
              useNativeDriver: true,
            }),
          ])
        );
        break;

      case 'wow':
        // Surprised pop & scale pulse
        animLoop = Animated.loop(
          Animated.sequence([
            Animated.timing(mainAnim, {
              toValue: 1,
              duration: 320,
              easing: Easing.back(1.5),
              useNativeDriver: true,
            }),
            Animated.timing(mainAnim, {
              toValue: 0,
              duration: 450,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.delay(200),
          ])
        );
        break;

      case 'oops':
        // Nervous wobble / shimmy
        animLoop = Animated.loop(
          Animated.sequence([
            Animated.timing(mainAnim, {
              toValue: 1,
              duration: 100,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.timing(mainAnim, {
              toValue: -1,
              duration: 100,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.timing(mainAnim, {
              toValue: 0.6,
              duration: 90,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.timing(mainAnim, {
              toValue: -0.6,
              duration: 90,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.timing(mainAnim, {
              toValue: 0,
              duration: 80,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.delay(500),
          ])
        );
        break;

      case 'lol':
        // Rapid laughing giggle bounce & rock
        animLoop = Animated.loop(
          Animated.sequence([
            Animated.timing(mainAnim, {
              toValue: 1,
              duration: 120,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(mainAnim, {
              toValue: 0,
              duration: 120,
              easing: Easing.in(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(mainAnim, {
              toValue: 0.8,
              duration: 110,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(mainAnim, {
              toValue: 0,
              duration: 110,
              easing: Easing.in(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.delay(250),
          ])
        );
        break;

      case 'angry':
        // Jittery rage shake & tremble
        animLoop = Animated.loop(
          Animated.sequence([
            Animated.timing(mainAnim, {
              toValue: 1,
              duration: 60,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.timing(mainAnim, {
              toValue: -1,
              duration: 60,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.timing(mainAnim, {
              toValue: 0.8,
              duration: 60,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.timing(mainAnim, {
              toValue: -0.8,
              duration: 60,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.timing(mainAnim, {
              toValue: 0,
              duration: 60,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.delay(220),
          ])
        );
        break;

      case 'sad':
        // Gentle downward sigh + falling tear drop
        animLoop = Animated.loop(
          Animated.parallel([
            Animated.sequence([
              Animated.timing(mainAnim, {
                toValue: 1,
                duration: 650,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
              }),
              Animated.timing(mainAnim, {
                toValue: 0,
                duration: 550,
                easing: Easing.in(Easing.quad),
                useNativeDriver: true,
              }),
            ]),
            Animated.sequence([
              Animated.timing(secondaryAnim, {
                toValue: 1,
                duration: 900,
                easing: Easing.in(Easing.quad),
                useNativeDriver: true,
              }),
              Animated.timing(secondaryAnim, {
                toValue: 0,
                duration: 10,
                useNativeDriver: true,
              }),
              Animated.delay(290),
            ]),
          ])
        );
        break;

      case 'cool':
        // Confident swagger head tilt & visor pulse
        animLoop = Animated.loop(
          Animated.sequence([
            Animated.timing(mainAnim, {
              toValue: 1,
              duration: 600,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(mainAnim, {
              toValue: -1,
              duration: 600,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(mainAnim, {
              toValue: 0,
              duration: 400,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.delay(300),
          ])
        );
        break;

      case 'cheer':
        // Celebratory bounce & spinning twinkle stars
        animLoop = Animated.loop(
          Animated.parallel([
            Animated.sequence([
              Animated.timing(mainAnim, {
                toValue: 1,
                duration: 350,
                easing: Easing.out(Easing.back(1.5)),
                useNativeDriver: true,
              }),
              Animated.timing(mainAnim, {
                toValue: 0,
                duration: 350,
                easing: Easing.in(Easing.quad),
                useNativeDriver: true,
              }),
            ]),
            Animated.sequence([
              Animated.timing(secondaryAnim, {
                toValue: 1,
                duration: 700,
                easing: Easing.inOut(Easing.sin),
                useNativeDriver: true,
              }),
              Animated.timing(secondaryAnim, {
                toValue: 0,
                duration: 10,
                useNativeDriver: true,
              }),
            ]),
          ])
        );
        break;
    }

    animLoop?.start();

    return () => {
      animLoop?.stop();
    };
  }, [animate, stickerKey]);

  // Derived transforms for coin body
  let bodyTransform: any[] = [];
  if (stickerKey === 'gg') {
    bodyTransform = [
      {
        translateY: mainAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -size * 0.09],
        }),
      },
      {
        scale: mainAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.05],
        }),
      },
    ];
  } else if (stickerKey === 'wow') {
    bodyTransform = [
      {
        scale: mainAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.12],
        }),
      },
    ];
  } else if (stickerKey === 'oops') {
    bodyTransform = [
      {
        rotate: mainAnim.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: ['-7deg', '0deg', '7deg'],
        }),
      },
    ];
  } else if (stickerKey === 'lol') {
    bodyTransform = [
      {
        translateY: mainAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -size * 0.08],
        }),
      },
      {
        rotate: mainAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '-4deg'],
        }),
      },
    ];
  } else if (stickerKey === 'angry') {
    bodyTransform = [
      {
        translateX: mainAnim.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: [-size * 0.05, 0, size * 0.05],
        }),
      },
      {
        translateY: mainAnim.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: [size * 0.02, 0, -size * 0.02],
        }),
      },
    ];
  } else if (stickerKey === 'sad') {
    bodyTransform = [
      {
        translateY: mainAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, size * 0.06],
        }),
      },
    ];
  } else if (stickerKey === 'cool') {
    bodyTransform = [
      {
        rotate: mainAnim.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: ['-6deg', '0deg', '6deg'],
        }),
      },
    ];
  } else if (stickerKey === 'cheer') {
    bodyTransform = [
      {
        translateY: mainAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -size * 0.09],
        }),
      },
      {
        scale: mainAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.06],
        }),
      },
    ];
  }

  const s = size;
  const borderWidth = Math.max(2, Math.round(s * 0.045));

  return (
    <View style={{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }}>
      {/* Sparkle Stars for CHEER (Top-left and Top-right) */}
      {stickerKey === 'cheer' && (
        <>
          <Animated.View
            style={[
              styles.sparkleStar,
              {
                top: -s * 0.08,
                left: -s * 0.08,
                transform: [
                  {
                    scale: secondaryAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.5, 1.25, 0.5],
                    }),
                  },
                  {
                    rotate: secondaryAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '120deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.starCrossH} />
            <View style={styles.starCrossV} />
          </Animated.View>
          <Animated.View
            style={[
              styles.sparkleStar,
              {
                top: -s * 0.08,
                right: -s * 0.08,
                transform: [
                  {
                    scale: secondaryAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.8, 1.3, 0.8],
                    }),
                  },
                  {
                    rotate: secondaryAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['30deg', '150deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.starCrossH} />
            <View style={styles.starCrossV} />
          </Animated.View>
        </>
      )}

      {/* Main Animated Coin Body */}
      <Animated.View
        style={[
          styles.coinBody,
          {
            width: s,
            height: s,
            borderRadius: s / 2,
            backgroundColor: config.bgColor,
            borderColor: config.borderColor,
            borderWidth: borderWidth,
            transform: bodyTransform,
          },
        ]}
      >
        {/* 3D Curved Specular Glint Highlight (Top-left arc) */}
        <View
          style={[
            styles.specularGlint,
            {
              top: s * 0.09,
              left: s * 0.12,
              width: s * 0.28,
              height: s * 0.13,
              borderRadius: s * 0.1,
            },
          ]}
        />

        {/* Character Face Expressions */}
        {renderFace(stickerKey, s, secondaryAnim)}
      </Animated.View>
    </View>
  );
};

function renderFace(key: StickerId, s: number, tearAnim: Animated.Value) {
  switch (key) {
    case 'gg':
      // Happy squinting eyes ^ ^ & wide open smile
      return (
        <View style={styles.faceContainer}>
          <View style={[styles.eyesRow, { marginTop: s * 0.06, gap: s * 0.22 }]}>
            <View
              style={[
                styles.happyArcEye,
                {
                  width: s * 0.17,
                  height: s * 0.1,
                  borderTopWidth: s * 0.045,
                  borderTopLeftRadius: s * 0.09,
                  borderTopRightRadius: s * 0.09,
                },
              ]}
            />
            <View
              style={[
                styles.happyArcEye,
                {
                  width: s * 0.17,
                  height: s * 0.1,
                  borderTopWidth: s * 0.045,
                  borderTopLeftRadius: s * 0.09,
                  borderTopRightRadius: s * 0.09,
                },
              ]}
            />
          </View>
          <View
            style={[
              styles.openSmileMouth,
              {
                width: s * 0.36,
                height: s * 0.18,
                borderBottomLeftRadius: s * 0.18,
                borderBottomRightRadius: s * 0.18,
                marginTop: s * 0.08,
              },
            ]}
          />
        </View>
      );

    case 'wow':
      // Wide open eyes with pupils & 'O' mouth
      return (
        <View style={styles.faceContainer}>
          <View style={[styles.eyesRow, { marginTop: s * 0.06, gap: s * 0.2 }]}>
            <View style={[styles.whiteEye, { width: s * 0.18, height: s * 0.18, borderRadius: s * 0.09 }]}>
              <View style={[styles.blackPupil, { width: s * 0.09, height: s * 0.09, borderRadius: s * 0.045 }]} />
            </View>
            <View style={[styles.whiteEye, { width: s * 0.18, height: s * 0.18, borderRadius: s * 0.09 }]}>
              <View style={[styles.blackPupil, { width: s * 0.09, height: s * 0.09, borderRadius: s * 0.045 }]} />
            </View>
          </View>
          <View
            style={[
              styles.oMouth,
              {
                width: s * 0.17,
                height: s * 0.22,
                borderRadius: s * 0.085,
                marginTop: s * 0.06,
              },
            ]}
          />
        </View>
      );

    case 'oops':
      // Startled eyes & squiggly wavy mouth
      return (
        <View style={styles.faceContainer}>
          <View style={[styles.eyesRow, { marginTop: s * 0.06, gap: s * 0.22 }]}>
            <View style={[styles.whiteEye, { width: s * 0.18, height: s * 0.18, borderRadius: s * 0.09 }]}>
              <View style={[styles.blackPupil, { width: s * 0.08, height: s * 0.08, borderRadius: s * 0.04 }]} />
            </View>
            <View style={[styles.whiteEye, { width: s * 0.18, height: s * 0.18, borderRadius: s * 0.09 }]}>
              <View style={[styles.blackPupil, { width: s * 0.08, height: s * 0.08, borderRadius: s * 0.04 }]} />
            </View>
          </View>
          {/* Squiggly mouth with alternating curved arches */}
          <View style={[styles.squigglyMouthWrap, { marginTop: s * 0.08, width: s * 0.38 }]}>
            <View style={[styles.waveArch1, { width: s * 0.18, height: s * 0.08, borderTopWidth: s * 0.045 }]} />
            <View style={[styles.waveArch2, { width: s * 0.18, height: s * 0.08, borderBottomWidth: s * 0.045 }]} />
          </View>
        </View>
      );

    case 'lol':
      // Laughing XD chevrons & open laughing mouth with tongue
      return (
        <View style={styles.faceContainer}>
          <View style={[styles.eyesRow, { marginTop: s * 0.06, gap: s * 0.22 }]}>
            {/* Left >< eye */}
            <View style={{ width: s * 0.16, height: s * 0.16, justifyContent: 'center', alignItems: 'center' }}>
              <View style={[styles.xdLine, { width: s * 0.14, height: s * 0.04, transform: [{ rotate: '45deg' }] }]} />
              <View style={[styles.xdLine, { width: s * 0.14, height: s * 0.04, transform: [{ rotate: '-45deg' }], position: 'absolute' }]} />
            </View>
            {/* Right >< eye */}
            <View style={{ width: s * 0.16, height: s * 0.16, justifyContent: 'center', alignItems: 'center' }}>
              <View style={[styles.xdLine, { width: s * 0.14, height: s * 0.04, transform: [{ rotate: '45deg' }] }]} />
              <View style={[styles.xdLine, { width: s * 0.14, height: s * 0.04, transform: [{ rotate: '-45deg' }], position: 'absolute' }]} />
            </View>
          </View>
          {/* Big laughing mouth with tongue */}
          <View
            style={[
              styles.openSmileMouth,
              {
                width: s * 0.42,
                height: s * 0.24,
                borderBottomLeftRadius: s * 0.21,
                borderBottomRightRadius: s * 0.21,
                marginTop: s * 0.06,
                overflow: 'hidden',
                position: 'relative',
              },
            ]}
          >
            {/* Red/pink tongue */}
            <View
              style={{
                position: 'absolute',
                bottom: -s * 0.02,
                alignSelf: 'center',
                width: s * 0.22,
                height: s * 0.14,
                borderRadius: s * 0.11,
                backgroundColor: '#FF4D6D',
              }}
            />
          </View>
        </View>
      );

    case 'angry':
      // Slanted angry eyebrows & downturned grimace
      return (
        <View style={styles.faceContainer}>
          <View style={[styles.eyesRow, { marginTop: s * 0.04, gap: s * 0.16 }]}>
            {/* Left Angry Eyebrow & Eye */}
            <View style={{ alignItems: 'center' }}>
              <View style={[styles.angryBrow, { width: s * 0.18, height: s * 0.045, transform: [{ rotate: '25deg' }] }]} />
              <View style={[styles.blackDotEye, { width: s * 0.1, height: s * 0.1, borderRadius: s * 0.05, marginTop: s * 0.02 }]} />
            </View>
            {/* Right Angry Eyebrow & Eye */}
            <View style={{ alignItems: 'center' }}>
              <View style={[styles.angryBrow, { width: s * 0.18, height: s * 0.045, transform: [{ rotate: '-25deg' }] }]} />
              <View style={[styles.blackDotEye, { width: s * 0.1, height: s * 0.1, borderRadius: s * 0.05, marginTop: s * 0.02 }]} />
            </View>
          </View>
          <View
            style={[
              styles.angryFrownMouth,
              {
                width: s * 0.3,
                height: s * 0.12,
                borderTopWidth: s * 0.045,
                borderTopLeftRadius: s * 0.15,
                borderTopRightRadius: s * 0.15,
                marginTop: s * 0.06,
              },
            ]}
          />
        </View>
      );

    case 'sad':
      // Sad arched eyebrows, sad mouth & animated teardrop
      return (
        <View style={styles.faceContainer}>
          <View style={[styles.eyesRow, { marginTop: s * 0.04, gap: s * 0.22 }]}>
            {/* Left Sad Eye with falling tear */}
            <View style={{ alignItems: 'center', position: 'relative' }}>
              <View style={[styles.sadBrow, { width: s * 0.16, height: s * 0.04, transform: [{ rotate: '-18deg' }] }]} />
              <View style={[styles.blackDotEye, { width: s * 0.1, height: s * 0.1, borderRadius: s * 0.05, marginTop: s * 0.02 }]} />
              {/* Falling Teardrop */}
              <Animated.View
                style={[
                  styles.teardrop,
                  {
                    width: s * 0.08,
                    height: s * 0.12,
                    borderRadius: s * 0.04,
                    top: s * 0.12,
                    left: -s * 0.02,
                    opacity: tearAnim.interpolate({
                      inputRange: [0, 0.2, 0.8, 1],
                      outputRange: [0, 1, 1, 0],
                    }),
                    transform: [
                      {
                        translateY: tearAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, s * 0.18],
                        }),
                      },
                    ],
                  },
                ]}
              />
            </View>
            {/* Right Sad Eye */}
            <View style={{ alignItems: 'center' }}>
              <View style={[styles.sadBrow, { width: s * 0.16, height: s * 0.04, transform: [{ rotate: '18deg' }] }]} />
              <View style={[styles.blackDotEye, { width: s * 0.1, height: s * 0.1, borderRadius: s * 0.05, marginTop: s * 0.02 }]} />
            </View>
          </View>
          <View
            style={[
              styles.angryFrownMouth,
              {
                width: s * 0.26,
                height: s * 0.12,
                borderTopWidth: s * 0.045,
                borderTopLeftRadius: s * 0.13,
                borderTopRightRadius: s * 0.13,
                marginTop: s * 0.06,
              },
            ]}
          />
        </View>
      );

    case 'cool':
      // Futuristic Neon Emerald Cyberpunk Visor & Smirk
      return (
        <View style={styles.faceContainer}>
          <View
            style={[
              styles.coolVisor,
              {
                width: s * 0.65,
                height: s * 0.2,
                borderRadius: s * 0.1,
                marginTop: s * 0.06,
              },
            ]}
          >
            {/* Visor top highlight */}
            <View
              style={{
                width: '75%',
                height: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                borderRadius: 1,
                marginTop: 2,
              }}
            />
          </View>
          {/* Confident curved white smirk */}
          <View
            style={[
              styles.smirkSmile,
              {
                width: s * 0.32,
                height: s * 0.14,
                borderBottomWidth: s * 0.045,
                borderBottomLeftRadius: s * 0.16,
                borderBottomRightRadius: s * 0.16,
                marginTop: s * 0.08,
              },
            ]}
          />
        </View>
      );

    case 'cheer':
      // Happy eyes & big joyous open smile
      return (
        <View style={styles.faceContainer}>
          <View style={[styles.eyesRow, { marginTop: s * 0.06, gap: s * 0.22 }]}>
            <View
              style={[
                styles.happyArcEye,
                {
                  width: s * 0.17,
                  height: s * 0.1,
                  borderTopWidth: s * 0.045,
                  borderTopLeftRadius: s * 0.09,
                  borderTopRightRadius: s * 0.09,
                },
              ]}
            />
            <View
              style={[
                styles.happyArcEye,
                {
                  width: s * 0.17,
                  height: s * 0.1,
                  borderTopWidth: s * 0.045,
                  borderTopLeftRadius: s * 0.09,
                  borderTopRightRadius: s * 0.09,
                },
              ]}
            />
          </View>
          <View
            style={[
              styles.openSmileMouth,
              {
                width: s * 0.38,
                height: s * 0.2,
                borderBottomLeftRadius: s * 0.19,
                borderBottomRightRadius: s * 0.19,
                marginTop: s * 0.06,
              },
            ]}
          />
        </View>
      );
  }
}

const styles = StyleSheet.create({
  coinBody: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 4,
  },
  specularGlint: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    transform: [{ rotate: '-35deg' }],
  },
  faceContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  eyesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  happyArcEye: {
    borderColor: '#111827',
  },
  openSmileMouth: {
    backgroundColor: '#111827',
  },
  whiteEye: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  blackPupil: {
    backgroundColor: '#111827',
  },
  oMouth: {
    backgroundColor: '#111827',
  },
  squigglyMouthWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveArch1: {
    borderColor: '#111827',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  waveArch2: {
    borderColor: '#111827',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  xdLine: {
    backgroundColor: '#111827',
    borderRadius: 2,
  },
  angryBrow: {
    backgroundColor: '#111827',
    borderRadius: 2,
  },
  sadBrow: {
    backgroundColor: '#111827',
    borderRadius: 2,
  },
  blackDotEye: {
    backgroundColor: '#111827',
  },
  angryFrownMouth: {
    borderColor: '#111827',
  },
  teardrop: {
    position: 'absolute',
    backgroundColor: '#38BDF8',
  },
  coolVisor: {
    backgroundColor: '#2BD67B',
    alignItems: 'center',
    shadowColor: '#2BD67B',
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  smirkSmile: {
    borderColor: '#FFFFFF',
  },
  sparkleStar: {
    position: 'absolute',
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  starCrossH: {
    position: 'absolute',
    width: 14,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  starCrossV: {
    position: 'absolute',
    width: 3.5,
    height: 14,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
});
