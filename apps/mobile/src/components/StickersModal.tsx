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
      subtitle="Send animated sticker reactions across the board"
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
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1.5,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
    paddingVertical: THEME.spacing.md,
    marginBottom: THEME.spacing.sm,
  },
  pressed: {
    borderColor: THEME.colors.accent,
    backgroundColor: THEME.colors.surfaceHighlight,
    transform: [{ scale: 0.97 }],
  },
  emoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  text: {
    fontSize: THEME.typography.fontSize.caption,
    fontWeight: THEME.typography.fontWeight.semibold,
    color: THEME.colors.textPrimary,
  },
});
