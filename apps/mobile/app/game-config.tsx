import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { BoardPreview, Button, Card, ScreenContainer } from '../src/components';
import { useGameSetupStore } from '../src/store/gameSetupStore';
import { THEME } from '../src/constants/theme';

interface BoardOption {
  id: 'classic' | 'emerald' | 'mahogany';
  title: string;
  subtitle: string;
  surfaceColor: string;
  locked?: boolean;
}

const BOARDS: BoardOption[] = [
  {
    id: 'classic',
    title: 'CLASSIC WOOD',
    subtitle: 'Selected',
    surfaceColor: '#F5ECD2',
  },
  {
    id: 'emerald',
    title: 'EMERALD',
    subtitle: 'Free',
    surfaceColor: '#0F5A3E',
  },
  {
    id: 'mahogany',
    title: 'MIDNIGHT',
    subtitle: 'Unlock with 1,500 coins',
    surfaceColor: '#1A2922',
  },
];

export default function GameConfigScreen() {
  const router = useRouter();
  const { boardTheme, setBoardTheme } = useGameSetupStore();

  const handleSelectBoard = (id: 'classic' | 'emerald' | 'mahogany') => {
    setBoardTheme(id);
  };

  const handleContinue = () => {
    router.push('/lobby');
  };

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.container}>
      {/* Decorative background shapes */}
      <View style={styles.bokehTop} pointerEvents="none" />
      <View style={styles.bokehBottom} pointerEvents="none" />

      {/* Title */}
      <View style={styles.header}>
        <Text style={styles.title}>CHOOSE BOARD</Text>
      </View>

      {/* Hero Board Preview */}
      <View style={styles.heroBoardBox}>
        <BoardPreview size={210} theme={boardTheme} />
      </View>

      {/* Board Options List */}
      <View style={styles.boardList}>
        {BOARDS.map((b) => {
          const isSelected = boardTheme === b.id;
          return (
            <TouchableOpacity
              key={b.id}
              activeOpacity={0.85}
              onPress={() => handleSelectBoard(b.id)}
            >
              <Card
                style={[
                  styles.boardCard,
                  isSelected && styles.boardCardSelected,
                ]}
              >
                {/* Board Mini Thumbnail */}
                <View style={styles.thumbWrapper}>
                  <BoardPreview size={52} theme={b.id} />
                </View>

                {/* Details */}
                <View style={styles.boardInfo}>
                  <Text style={styles.boardTitle}>{b.title}</Text>
                  <Text
                    style={[
                      styles.boardSubtitle,
                      isSelected && styles.boardSubtitleActive,
                    ]}
                  >
                    {isSelected ? 'Selected' : b.subtitle}
                  </Text>
                </View>
              </Card>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Select Board Button */}
      <View style={styles.footer}>
        <Button
          title="SELECT BOARD"
          variant="primary"
          onPress={handleContinue}
          style={styles.selectBtn}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#07261C',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  bokehTop: {
    position: 'absolute',
    top: 30,
    right: -20,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(15, 90, 62, 0.25)',
  },
  bokehBottom: {
    position: 'absolute',
    bottom: 80,
    left: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(15, 90, 62, 0.2)',
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#F5ECD2',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  heroBoardBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  boardList: {
    gap: 12,
    marginVertical: 12,
  },
  boardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 18,
    gap: 16,
  },
  boardCardSelected: {
    borderColor: '#2BD67B',
    borderWidth: 2,
    backgroundColor: '#11573C',
  },
  thumbWrapper: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boardInfo: {
    flex: 1,
  },
  boardTitle: {
    color: '#F5ECD2',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  boardSubtitle: {
    color: '#9FD8B8',
    fontSize: 13,
  },
  boardSubtitleActive: {
    color: '#2BD67B',
    fontWeight: '700',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 16,
  },
  selectBtn: {
    width: '100%',
  },
});
