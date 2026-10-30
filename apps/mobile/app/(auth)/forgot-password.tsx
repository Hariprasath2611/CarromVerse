import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  GameCard,
  Input,
  LoadingOverlay,
  PrimaryButton,
  ScreenContainer,
  SecondaryButton,
} from '../../src/components';
import { useAuthStore } from '../../src/store/authStore';
import { validateEmail } from '@carromverse/shared-utils';
import { THEME } from '../../src/constants/theme';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resetPassword, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleReset = async () => {
    clearError();
    setEmailError(null);
    setSuccessMessage(null);

    const val = validateEmail(email);
    if (!val.isValid) {
      setEmailError(val.error || 'Invalid email address');
      return;
    }

    try {
      await resetPassword(email);
      setSuccessMessage('Password reset link sent! Check your inbox to reset your password.');
    } catch {
      // Error handled via authStore.error
    }
  };

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.container}>
      <LoadingOverlay visible={isLoading} message="Sending Reset Link..." />

      {/* Header Emblem & Title */}
      <View style={styles.headerBox}>
        <View style={styles.emblemCircle}>
          <Text style={styles.emblemEmoji}>🔐</Text>
        </View>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Enter your registered email and we'll send you a password reset link
        </Text>
      </View>

      {/* Error Alert */}
      {!!error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Success Alert */}
      {!!successMessage && (
        <View style={styles.successBox}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.successText}>{successMessage}</Text>
        </View>
      )}

      {/* Form Card */}
      <GameCard elevated style={styles.formCard}>
        <Input
          label="Email Address"
          placeholder="champion@carromverse.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={(val) => {
            setEmail(val);
            if (emailError) setEmailError(null);
          }}
          error={emailError}
        />

        <PrimaryButton
          title="Send Reset Link"
          onPress={handleReset}
          loading={isLoading}
          variant="emerald"
          size="large"
          style={styles.submitButton}
        />

        <SecondaryButton
          title="Back to Sign In"
          onPress={() => router.back()}
          variant="outline"
          size="medium"
          style={styles.backButton}
        />
      </GameCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.xxl,
    paddingBottom: THEME.spacing.xxl,
  },
  headerBox: {
    alignItems: 'center',
    marginBottom: THEME.spacing.xl,
  },
  emblemCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.primary,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.sm,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  emblemEmoji: {
    fontSize: 28,
  },
  title: {
    fontSize: THEME.typography.fontSize.h2,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.textPrimary,
  },
  subtitle: {
    fontSize: THEME.typography.fontSize.bodySm,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginTop: THEME.spacing.xs,
    paddingHorizontal: THEME.spacing.lg,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: THEME.colors.danger,
    borderWidth: 1,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
  },
  errorIcon: {
    fontSize: 16,
    marginRight: THEME.spacing.sm,
  },
  errorText: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.fontSize.bodySm,
    flex: 1,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    borderColor: THEME.colors.accent,
    borderWidth: 1,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
  },
  successIcon: {
    fontSize: 16,
    marginRight: THEME.spacing.sm,
  },
  successText: {
    color: THEME.colors.accent,
    fontSize: THEME.typography.fontSize.bodySm,
    fontWeight: THEME.typography.fontWeight.medium,
    flex: 1,
  },
  formCard: {
    padding: THEME.spacing.lg,
  },
  submitButton: {
    marginTop: THEME.spacing.lg,
  },
  backButton: {
    marginTop: THEME.spacing.md,
  },
});
