import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
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
        <Text style={styles.title}>RESET PASSWORD</Text>
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
          title="SEND RESET LINK"
          onPress={handleReset}
          loading={isLoading}
          variant="emerald"
          size="large"
          style={styles.submitButton}
        />

        <SecondaryButton
          title="BACK TO SIGN IN"
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
    marginBottom: 20,
  },
  emblemCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#07261C',
    borderColor: THEME.colors.neonEmerald,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    ...THEME.shadows.glowEmerald,
  },
  emblemEmoji: {
    fontSize: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME.colors.cream,
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: 13,
    color: THEME.colors.mutedMint,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 16,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(226, 59, 90, 0.15)',
    borderColor: THEME.colors.queenRed,
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  errorIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  errorText: {
    color: THEME.colors.queenRed,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(43, 214, 123, 0.15)',
    borderColor: THEME.colors.neonEmerald,
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  successIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  successText: {
    color: THEME.colors.neonEmerald,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  formCard: {
    padding: 22,
  },
  submitButton: {
    marginTop: 20,
  },
  backButton: {
    marginTop: 12,
  },
});
