import React from 'react';
import { StyleSheet, View } from 'react-native';

export type TabName = 'home' | 'friends' | 'customize' | 'rankings' | 'profile';

export interface TabBarIconProps {
  name: TabName;
  focused: boolean;
  color?: any;
}

export const TabBarIcon: React.FC<TabBarIconProps> = ({ name, focused, color = '#2BD67B' }) => {
  const renderIcon = () => {
    switch (name) {
      case 'home':
        return (
          <View style={styles.iconContainer}>
            {/* Roof Chevron */}
            <View style={[styles.homeRoof, { borderBottomColor: color }]} />
            {/* House Body */}
            <View style={[styles.homeBody, { borderColor: color }]}>
              {/* Door */}
              <View style={[styles.homeDoor, { backgroundColor: color }]} />
            </View>
          </View>
        );

      case 'friends':
        return (
          <View style={styles.iconContainer}>
            {/* Primary player */}
            <View style={[styles.friendsHeadPrimary, { backgroundColor: color }]} />
            <View style={[styles.friendsBodyPrimary, { backgroundColor: color }]} />
            {/* Secondary player behind */}
            <View style={[styles.friendsHeadSecondary, { backgroundColor: color }]} />
            <View style={[styles.friendsBodySecondary, { backgroundColor: color }]} />
          </View>
        );

      case 'customize':
        return (
          <View style={styles.iconContainer}>
            {/* Carrom Board Mini Frame */}
            <View style={[styles.boardFrame, { borderColor: color }]}>
              {/* Corner pockets */}
              <View style={[styles.boardPocket, styles.pocketTL, { backgroundColor: color }]} />
              <View style={[styles.boardPocket, styles.pocketTR, { backgroundColor: color }]} />
              <View style={[styles.boardPocket, styles.pocketBL, { backgroundColor: color }]} />
              <View style={[styles.boardPocket, styles.pocketBR, { backgroundColor: color }]} />
              {/* Center circle */}
              <View style={[styles.boardCenterCircle, { borderColor: color }]} />
            </View>
          </View>
        );

      case 'rankings':
        return (
          <View style={styles.iconContainer}>
            {/* Trophy Cup */}
            <View style={[styles.trophyCup, { borderColor: color }]}>
              {/* Star / Crest inside */}
              <View style={[styles.trophyCrest, { backgroundColor: color }]} />
            </View>
            {/* Left & Right handles */}
            <View style={[styles.trophyHandleLeft, { borderColor: color }]} />
            <View style={[styles.trophyHandleRight, { borderColor: color }]} />
            {/* Stem */}
            <View style={[styles.trophyStem, { backgroundColor: color }]} />
            {/* Base Pedestal */}
            <View style={[styles.trophyBase, { backgroundColor: color }]} />
          </View>
        );

      case 'profile':
        return (
          <View style={styles.iconContainer}>
            {/* Head circle */}
            <View style={[styles.profileHead, { borderColor: color }]} />
            {/* Shoulders arc */}
            <View style={[styles.profileShoulders, { borderColor: color }]} />
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.wrapper, focused && styles.wrapperFocused]}>
      {renderIcon()}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: 38,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
  },
  wrapperFocused: {
    backgroundColor: 'rgba(43, 214, 123, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(43, 214, 123, 0.35)',
  },
  iconContainer: {
    width: 26,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  // HOME ICON
  homeRoof: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginBottom: -1,
  },
  homeBody: {
    width: 15,
    height: 10,
    borderWidth: 1.8,
    borderTopWidth: 0,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  homeDoor: {
    width: 5,
    height: 5,
    borderTopLeftRadius: 1.5,
    borderTopRightRadius: 1.5,
  },

  // FRIENDS ICON
  friendsHeadPrimary: {
    position: 'absolute',
    top: 2,
    left: 4,
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  friendsBodyPrimary: {
    position: 'absolute',
    bottom: 3,
    left: 1,
    width: 13,
    height: 7,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 1,
    borderBottomRightRadius: 1,
  },
  friendsHeadSecondary: {
    position: 'absolute',
    top: 0,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.65,
  },
  friendsBodySecondary: {
    position: 'absolute',
    bottom: 5,
    right: 1,
    width: 11,
    height: 6,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    borderBottomLeftRadius: 1,
    borderBottomRightRadius: 1,
    opacity: 0.65,
  },

  // CUSTOMIZE (MINI CARROM BOARD)
  boardFrame: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  boardPocket: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  pocketTL: { top: 1, left: 1 },
  pocketTR: { top: 1, right: 1 },
  pocketBL: { bottom: 1, left: 1 },
  pocketBR: { bottom: 1, right: 1 },
  boardCenterCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.4,
  },

  // RANKINGS (TROPHY)
  trophyCup: {
    width: 14,
    height: 10,
    borderWidth: 1.8,
    borderBottomLeftRadius: 7,
    borderBottomRightRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  trophyCrest: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  trophyHandleLeft: {
    position: 'absolute',
    top: 3,
    left: 2,
    width: 4,
    height: 6,
    borderWidth: 1.4,
    borderRightWidth: 0,
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
  },
  trophyHandleRight: {
    position: 'absolute',
    top: 3,
    right: 2,
    width: 4,
    height: 6,
    borderWidth: 1.4,
    borderLeftWidth: 0,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
  trophyStem: {
    width: 2.5,
    height: 3.5,
    marginTop: -0.5,
  },
  trophyBase: {
    width: 13,
    height: 2.5,
    borderRadius: 1,
  },

  // PROFILE ICON
  profileHead: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    borderWidth: 1.8,
    marginBottom: 1,
  },
  profileShoulders: {
    width: 17,
    height: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 1.8,
    borderBottomWidth: 0,
  },
});
