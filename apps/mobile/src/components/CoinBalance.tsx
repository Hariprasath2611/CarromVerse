import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { THEME } from '../constants/theme';

export interface CoinBalanceProps {
  amount?: number;
  balance?: number;
  onPressPlus?: () => void;
  onAddPress?: () => void;
  style?: ViewStyle;
}

export const CoinBalance: React.FC<CoinBalanceProps> = ({
  amount,
  balance,
  onPressPlus,
  onAddPress,
  style,
}) => {
  const displayAmount = balance ?? amount ?? 0;
  const handlePlus = onAddPress || onPressPlus;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.coinBadge}>
        <View style={styles.coinDisc}>
          <Text style={styles.coinDiscText}>C</Text>
        </View>
      </View>
      <Text style={styles.amountText}>{displayAmount.toLocaleString()}</Text>
      {handlePlus && (
        <Pressable onPress={handlePlus} hitSlop={8} style={styles.plusBtn}>
          <Text style={styles.plusText}>+</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#07261C',
    borderColor: '#E9B949',
    borderWidth: 1.5,
    borderRadius: 20,
    paddingLeft: 8,
    paddingRight: 8,
    paddingVertical: 4,
  },
  coinBadge: {
    marginRight: 6,
  },
  coinDisc: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#E9B949',
    borderWidth: 1.5,
    borderColor: '#F7D070',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinDiscText: {
    color: '#261B04',
    fontSize: 10,
    fontWeight: '900',
    lineHeight: 12,
  },
  amountText: {
    color: '#E9B949',
    fontWeight: 'bold',
    fontSize: 13,
    letterSpacing: 0.4,
    marginRight: 6,
  },
  plusBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E9B949',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusText: {
    color: '#261B04',
    fontSize: 15,
    fontWeight: 'bold',
    lineHeight: 18,
  },
});
