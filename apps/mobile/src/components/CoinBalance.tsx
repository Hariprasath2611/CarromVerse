import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { THEME } from '../constants/theme';

export interface CoinBalanceProps {
  amount: number;
  onPressPlus?: () => void;
  style?: ViewStyle;
}

export const CoinBalance: React.FC<CoinBalanceProps> = ({
  amount,
  onPressPlus,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.coinIcon}>
        <Text style={styles.coinSymbol}>🪙</Text>
      </View>
      <Text style={styles.amountText}>{amount.toLocaleString()}</Text>
      {onPressPlus && (
        <Pressable onPress={onPressPlus} style={styles.plusBtn}>
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
    fontSize: THEME.typography.fontSize.caption,
    fontWeight: THEME.typography.fontWeight.bold,
    marginRight: 6,
    letterSpacing: 0.3,
  },
  plusBtn: {
    backgroundColor: THEME.colors.primary,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusText: {
    color: THEME.colors.textPrimary,
    fontSize: 12,
    fontWeight: 'bold',
    lineHeight: 14,
  },
});
