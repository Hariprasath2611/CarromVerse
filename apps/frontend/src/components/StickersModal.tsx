import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Modal } from './Modal';
import { AnimatedCoinSticker, StickerId } from './AnimatedCoinSticker';

export interface StickerItem {
  id: StickerId | string;
  text: string;
  name: string;
  bg: string;
  textColor?: string;
}

export const CARROM_STICKERS: StickerItem[] = [
  { id: 'gg', text: 'GG', name: 'GG', bg: '#F5EEDB' },
  { id: 'wow', text: 'WOW', name: 'WOW', bg: '#F5A623' },
  { id: 'oops', text: 'OOPS', name: 'OOPS', bg: '#FF7597' },
  { id: 'lol', text: 'LOL', name: 'LOL', bg: '#2BD67B' },
  { id: 'angry', text: 'ANGRY', name: 'ANGRY', bg: '#EF4444' },
  { id: 'sad', text: 'SAD', name: 'SAD', bg: '#5EEAD4' },
  { id: 'cool', text: 'COOL', name: 'COOL', bg: '#1F2937' },
  { id: 'cheer', text: 'CHEER', name: 'CHEER', bg: '#FBBF24' },
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
      title="ANIMATED STICKERS"
    >
      <Text style={styles.subtitle}>
        Coin characters for in-game reactions. Each loops 1–2 seconds and fades out after 2 seconds in the match.
      </Text>

      <View style={styles.grid}>
        {CARROM_STICKERS.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => {
              handleSelect(item);
              onClose();
            }}
            style={({ pressed }) => [
              styles.stickerCard,
              pressed && styles.pressed,
            ]}
          >
            <AnimatedCoinSticker id={item.id} size={50} animate={true} />
            <Text style={styles.stickerLabel}>{item.name}</Text>
          </Pressable>
        ))}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  subtitle: {
    color: '#9FD8B8',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  stickerCard: {
    width: '23%',
    aspectRatio: 0.82,
    backgroundColor: '#0E4A33',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#1B7050',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  stickerLabel: {
    color: '#F5ECD2',
    fontSize: 11,
    fontWeight: '900',
    marginTop: 6,
    letterSpacing: 0.6,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.94 }],
  },
});
