import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Modal } from './Modal';
import { THEME } from '../constants/theme';

export interface StickerItem {
  id: string;
  text: string;
  bg: string;
  textColor?: string;
}

export const CARROM_STICKERS: StickerItem[] = [
  { id: 'gg', text: 'GG', bg: '#2BD67B' },
  { id: 'wow', text: 'WOW', bg: '#E9B949' },
  { id: 'oops', text: 'OOPS', bg: '#F472B6' },
  { id: 'nice', text: 'NICE', bg: '#9FD8B8' },
  { id: 'ha', text: 'HA', bg: '#F5ECD2' },
  { id: 'wait', text: 'WAIT', bg: '#E9B949' },
  { id: 'lol', text: 'LOL', bg: '#2BD67B' },
  { id: 'sorry', text: 'SORRY', bg: '#F472B6' },
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
      title="REACT"
    >
      <View style={styles.grid}>
        {CARROM_STICKERS.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => {
              handleSelect(item);
              onClose();
            }}
            style={({ pressed }) => [
              styles.reactCircle,
              { backgroundColor: item.bg },
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.reactText}>{item.text}</Text>
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
    paddingVertical: 12,
    gap: 16,
  },
  reactCircle: {
    width: '21%',
    aspectRatio: 1,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactText: {
    color: '#07261C',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.95 }],
  },
});
