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
      <View style={styles.coinIcon}>
        <Text style={styles.coinSymbol}>🪙</Text>
      </View>
      <Text style={styles.amountText}>{displayAmount.toLocaleString()}</Text>
      {handlePlus && (
        <Pressable onPress={handlePlus} style={styles.plusBtn}>
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
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.goldPrimary,
    borderWidth: 1,
    borderRadius: THEME.borderRadius.full,
    paddingLeft: 6,
    paddingRight: 6,
    paddingVertical: 4,
  },
  coinIcon: {
    marginRight: 4,
  },
  coinSymbol: {
    fontSize: 14,
  },
  amountText: {
    color: THEME.colors.goldBright,
    fontWeight: THEME.typography.fontWeight.bold,
    fontSize: THEME.typography.fontSize.bodySm,
    marginRight: 6,
  },
  plusBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: THEME.colors.goldPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusText: {
    color: THEME.colors.textInverse,
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: 16,
  },
});
