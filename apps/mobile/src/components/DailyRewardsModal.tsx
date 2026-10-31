import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Modal } from './Modal';
import { PrimaryButton } from './PrimaryButton';
import { useEconomyStore } from '../store/economyStore';
import { THEME } from '../constants/theme';

export interface DailyRewardsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const DailyRewardsModal: React.FC<DailyRewardsModalProps> = ({
  visible,
  onClose,
}) => {
  const { dailyRewardClaimed, dailyRewardStreak, claimDailyReward } = useEconomyStore();
  const [claimedAmount, setClaimedAmount] = useState<number | null>(null);

  const days = [
    { day: 1, reward: 300 },
    { day: 2, reward: 600 },
    { day: 3, reward: 900 },
    { day: 4, reward: 1200 },
    { day: 5, reward: 1500 },
    { day: 6, reward: 2000 },
    { day: 7, reward: 5000, isJackpot: true },
  ];

  const handleClaim = () => {
    const amount = claimDailyReward();
    setClaimedAmount(amount);
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Daily Rewards"
      subtitle="Log in daily to claim escalating coin bonuses"
    >
      <View style={styles.container}>
        <View style={styles.grid}>
          {days.map((item) => {
            const isToday = item.day === dailyRewardStreak;
            const isPast = item.day < dailyRewardStreak;

            return (
              <View
                key={item.day}
                style={[
                  styles.dayCard,
                  isToday && styles.todayCard,
                  isPast && styles.pastCard,
                  item.isJackpot && styles.jackpotCard,
                ]}
              >
                <Text style={[styles.dayLabel, isToday && styles.todayText]}>
                  DAY {item.day}
                </Text>
                <Text style={styles.coinIcon}>
                  {item.isJackpot ? '🏆' : '🪙'}
                </Text>
                <Text style={[styles.rewardAmount, isToday && styles.todayText]}>
                  +{item.reward}
                </Text>
                {isPast && <Text style={styles.checkMark}>✓</Text>}
              </View>
            );
          })}
        </View>

        {claimedAmount !== null ? (
          <View style={styles.celebrationBox}>
            <Text style={styles.celebrationTitle}>REWARDS CLAIMED!</Text>
            <Text style={styles.celebrationText}>
              +{claimedAmount.toLocaleString()} Coins added to your vault balance.
            </Text>
            <PrimaryButton
              title="COLLECT & PLAY"
              onPress={onClose}
              variant="emerald"
              style={styles.actionBtn}
            />
          </View>
        ) : (
          <PrimaryButton
            title={dailyRewardClaimed ? 'CLAIMED TODAY' : 'CLAIM REWARD'}
            disabled={dailyRewardClaimed}
            onPress={handleClaim}
            variant="gold"
            style={styles.actionBtn}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: THEME.spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginBottom: THEME.spacing.lg,
  },
  dayCard: {
    width: '30%',
    backgroundColor: '#07261C',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#1B7050',
    paddingVertical: 10,
    alignItems: 'center',
    position: 'relative',
  },
  todayCard: {
    borderColor: THEME.colors.brass,
    backgroundColor: '#124330',
    ...THEME.shadows.glowBrass,
  },
  pastCard: {
    opacity: 0.6,
    borderColor: THEME.colors.neonEmerald,
  },
  jackpotCard: {
    width: '95%',
    borderColor: THEME.colors.brass,
    backgroundColor: 'rgba(233, 185, 73, 0.12)',
  },
  dayLabel: {
    color: THEME.colors.mutedMint,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  todayText: {
    color: THEME.colors.brass,
  },
  coinIcon: {
    fontSize: 22,
    marginVertical: 4,
  },
  rewardAmount: {
    color: THEME.colors.cream,
    fontSize: 13,
    fontWeight: 'bold',
  },
  checkMark: {
    position: 'absolute',
    top: 4,
    right: 6,
    color: THEME.colors.neonEmerald,
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionBtn: {
    marginTop: THEME.spacing.sm,
  },
  celebrationBox: {
    alignItems: 'center',
    paddingVertical: THEME.spacing.sm,
  },
  celebrationTitle: {
    color: THEME.colors.brass,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  celebrationText: {
    color: THEME.colors.mutedMint,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: THEME.spacing.md,
  },
});
