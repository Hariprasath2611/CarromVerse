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
  { id: 'stk_1', emoji: '🎯', text: 'Nice Shot!' },
  { id: 'stk_2', emoji: '👑', text: 'Queen Secured!' },
  { id: 'stk_3', emoji: '🔥', text: 'On Fire!' },
  { id: 'stk_4', emoji: '😱', text: 'So Close!' },
  { id: 'stk_5', emoji: '💥', text: 'Power Break!' },
  { id: 'stk_6', emoji: '🤝', text: 'Good Game!' },
  { id: 'stk_7', emoji: '⚡', text: 'Laser Aim!' },
  { id: 'stk_8', emoji: '😎', text: 'Easy Peasy!' },
];

export interface StickersModalProps {
  visible: boolean;
  onClose: () => void;
  onSendSticker: (sticker: StickerItem) => void;
}

export const StickersModal: React.FC<StickersModalProps> = ({
  visible,
  onClose,
  onSendSticker,
}) => {
  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Table Reactions"
      subtitle="Send animated sticker reactions across the board"
    >
      <View style={styles.grid}>
        {CARROM_STICKERS.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => {
              onSendSticker(item);
              onClose();
            }}
            style={({ pressed }) => [styles.stickerBtn, pressed && styles.pressed]}
          >
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={styles.stickerText}>{item.text}</Text>
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
    gap: 10,
    justifyContent: 'space-between',
    paddingVertical: THEME.spacing.xs,
  },
  stickerBtn: {
    width: '48%',
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1.2,
    borderColor: THEME.colors.border,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  stickerText: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.fontSize.caption,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  pressed: {
    backgroundColor: THEME.colors.surfaceHighlight,
    borderColor: THEME.colors.accent,
    transform: [{ scale: 0.96 }],
  },
});
