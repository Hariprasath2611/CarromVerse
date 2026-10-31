import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Modal } from './Modal';
import { THEME } from '../constants/theme';

export interface StickerItem {
  id: string;
  emoji: string;
  text: string;
}

export const CARROM_STICKERS: StickerItem[] = [
  { id: 'stk_1', emoji: '🎯', text: 'NICE SHOT!' },
  { id: 'stk_2', emoji: '👑', text: 'QUEEN SECURED!' },
  { id: 'stk_3', emoji: '🔥', text: 'ON FIRE!' },
  { id: 'stk_4', emoji: '⚡', text: 'LASER AIM!' },
  { id: 'stk_5', emoji: '💥', text: 'POWER BREAK!' },
  { id: 'stk_6', emoji: '🤝', text: 'GOOD GAME!' },
  { id: 'stk_7', emoji: '🛡️', text: 'CLEVER COVER!' },
  { id: 'stk_8', emoji: '🏆', text: 'MATCH POINT!' },
];

export interface StickersModalProps {
  visible: boolean;
  onClose: () => void;
  onSendSticker?: (sticker: StickerItem) => void;
  onSelectSticker?: (sticker: StickerItem) => void;
}

export const StickersModal: React.FC<StickersModalProps> = ({
  visible,
  onClose,
  onSendSticker,
  onSelectSticker,
}) => {
  const handleSelect = onSelectSticker || onSendSticker || (() => {});

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Table Reactions"
      subtitle="Send tactical reactions across the table"
    >
      <View style={styles.grid}>
        {CARROM_STICKERS.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => {
              handleSelect(item);
              onClose();
            }}
            style={({ pressed }) => [styles.stickerBtn, pressed && styles.pressed]}
          >
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={styles.text}>{item.text}</Text>
          </Pressable>
        ))}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: THEME.spacing.sm,
  },
  stickerBtn: {
    width: '48%',
    backgroundColor: '#07261C',
    borderColor: '#1B7050',
    borderWidth: 1.5,
    borderRadius: 16,
    alignItems: 'center',
    paddingVertical: 14,
    marginBottom: 10,
  },
  pressed: {
    borderColor: THEME.colors.neonEmerald,
    backgroundColor: '#104430',
    transform: [{ scale: 0.97 }],
  },
  emoji: {
    fontSize: 26,
    marginBottom: 4,
  },
  text: {
    fontSize: 11,
    fontWeight: 'bold',
    color: THEME.colors.cream,
    letterSpacing: 0.5,
  },
});
