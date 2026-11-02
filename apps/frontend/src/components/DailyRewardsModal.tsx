import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Modal } from './Modal';
import { Button } from './Button';
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
  const { dailyRewardClaimed, claimDailyReward } = useEconomyStore();
  const [claimed, setClaimed] = useState(dailyRewardClaimed);

  const daysGrid = [
    { day: 1, amount: 50 },
    { day: 2, amount: 75 },
    { day: 3, amount: 100, isToday: true },
    { day: 4, amount: 150 },
    { day: 5, amount: 200 },
    { day: 6, amount: 300 },
  ];

  const handleClaim = () => {
    claimDailyReward();
    setClaimed(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="DAILY REWARDS"
      subtitle="Log in every day for bigger bonuses"
    >
      <View style={styles.container}>
        {/* Days 1-6 Grid (3 cols x 2 rows) */}
        <View style={styles.grid}>
          {daysGrid.map((item) => {
            return (
              <View
                key={item.day}
                style={[
                  styles.dayCard,
                  item.isToday && styles.todayCard,
                ]}
              >
                <Text style={[styles.dayLabel, item.isToday && styles.todayText]}>
                  DAY {item.day}
                </Text>
                <View style={styles.coinCircle}>
                  <Text style={styles.coinText}>C</Text>
                </View>
                <Text style={[styles.rewardAmount, item.isToday && styles.todayText]}>
                  {item.amount}
                </Text>
                {item.isToday && (
                  <View style={styles.todayPill}>
                    <Text style={styles.todayPillText}>TODAY</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Day 7 Full Width Bonus */}
        <View style={styles.day7Card}>
          <View>
            <Text style={styles.day7Label}>DAY 7</Text>
            <Text style={styles.day7Title}>500 COINS + STRIKER</Text>
          </View>
          <View style={styles.day7CoinBadge}>
            <Text style={styles.day7CoinText}>C</Text>
          </View>
        </View>

        {/* Claim Button */}
        <Button
          title={claimed ? 'CLAIMED TODAY' : 'CLAIM 100 COINS'}
          variant="primary"
          disabled={claimed}
          onPress={handleClaim}
          style={styles.actionBtn}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 12,
  },
  dayCard: {
    width: '30%',
    aspectRatio: 0.95,
    backgroundColor: '#0E4A33',
    borderColor: '#1B7050',
    borderWidth: 2,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    position: 'relative',
  },
  todayCard: {
    borderColor: '#2BD67B',
    backgroundColor: '#11573C',
  },
  dayLabel: {
    color: '#9FD8B8',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  todayText: {
    color: '#2BD67B',
  },
  coinCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E9B949',
    borderWidth: 1.5,
    borderColor: '#F7D070',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  coinText: {
    color: '#261B04',
    fontSize: 12,
    fontWeight: '900',
  },
  rewardAmount: {
    color: '#E9B949',
    fontSize: 12,
    fontWeight: 'bold',
  },
  todayPill: {
    position: 'absolute',
    top: -8,
    backgroundColor: '#2BD67B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  todayPillText: {
    color: '#07261C',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  day7Card: {
    backgroundColor: '#0E4A33',
    borderColor: '#E9B949',
    borderWidth: 2,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  day7Label: {
    color: '#E9B949',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  day7Title: {
    color: '#F5ECD2',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  day7CoinBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E9B949',
    borderWidth: 2,
    borderColor: '#F7D070',
    alignItems: 'center',
    justifyContent: 'center',
  },
  day7CoinText: {
    color: '#261B04',
    fontSize: 16,
    fontWeight: '900',
  },
  actionBtn: {
    width: '100%',
  },
});
