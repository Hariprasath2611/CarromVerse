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
            <Text style={styles.celebrationTitle}>🎉 Rewards Claimed!</Text>
            <Text style={styles.celebrationText}>
              +{claimedAmount.toLocaleString()} Virtual Coins have been added to your balance.
            </Text>
            <PrimaryButton
              title="Awesome!"
              onPress={onClose}
              style={styles.actionBtn}
            />
          </View>
        ) : (
          <PrimaryButton
            title={dailyRewardClaimed ? 'Claimed Today (Come back tomorrow!)' : 'Claim Daily Reward'}
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
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1.2,
    borderColor: THEME.colors.border,
    paddingVertical: 10,
    alignItems: 'center',
    position: 'relative',
  },
  todayCard: {
    borderColor: THEME.colors.goldBright,
    backgroundColor: THEME.colors.surfaceHighlight,
    ...THEME.shadows.goldGlow,
  },
  pastCard: {
    opacity: 0.6,
    borderColor: THEME.colors.success,
  },
  jackpotCard: {
    width: '94%',
    borderColor: THEME.colors.goldPrimary,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  dayLabel: {
    color: THEME.colors.textMuted,
    fontSize: 10,
    fontWeight: THEME.typography.fontWeight.heavy,
  },
  todayText: {
    color: THEME.colors.goldBright,
  },
  coinIcon: {
    fontSize: 22,
    marginVertical: 4,
  },
  rewardAmount: {
    color: THEME.colors.textPrimary,
    fontSize: 12,
    fontWeight: THEME.typography.fontWeight.bold,
  },
  checkMark: {
    position: 'absolute',
    top: 4,
    right: 6,
    color: THEME.colors.success,
    fontSize: 12,
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
    color: THEME.colors.goldBright,
    fontSize: THEME.typography.fontSize.subtitle,
    fontWeight: THEME.typography.fontWeight.bold,
    marginBottom: 4,
  },
  celebrationText: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.fontSize.bodySm,
    textAlign: 'center',
    marginBottom: THEME.spacing.md,
  },
});
