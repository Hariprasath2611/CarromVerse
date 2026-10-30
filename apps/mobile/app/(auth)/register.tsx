import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  GameCard,
  Input,
  LoadingOverlay,
  PrimaryButton,
  ScreenContainer,
  SecondaryButton,
  Toggle,
} from '../../src/components';
import { useAuthStore } from '../../src/store/authStore';
import { validateEmail, validatePassword, validateUsername } from '@carromverse/shared-utils';
import { THEME } from '../../src/constants/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [termsError, setTermsError] = useState<string | null>(null);

  const handleRegister = async () => {
    clearError();
    setUsernameError(null);
    setEmailError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);
    setTermsError(null);

    const userVal = validateUsername(username);
    if (!userVal.isValid) {
      setUsernameError(userVal.error || 'Invalid username');
      return;
    }

    const emailVal = validateEmail(email);
    if (!emailVal.isValid) {
      setEmailError(emailVal.error || 'Invalid email');
      return;
    }

    const passVal = validatePassword(password);
    if (!passVal.isValid) {
      setPasswordError(passVal.error || 'Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return;
    }

    if (!agreeTerms) {
      setTermsError('You must agree to the Terms & Privacy Policy to register');
      return;
    }

    try {
      await register(email, password, username);
      router.replace('/(tabs)');
    } catch {
      // Error is caught and surfaced in authStore.error
    }
  };

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.container}>
      <LoadingOverlay visible={isLoading} message="Creating Player Profile..." />

      {/* Header Box */}
      <View style={styles.headerBox}>
        <View style={styles.emblemCircle}>
          <Text style={styles.emblemEmoji}>👑</Text>
        </View>
        <Text style={styles.title}>Join CarromVerse</Text>
        <Text style={styles.subtitle}>
          Create your champion profile to compete, track stats & earn rewards
        </Text>
      </View>

      {/* Error Banner */}
      {!!error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Registration Card Form */}
      <GameCard elevated style={styles.formCard}>
        <Input
          label="Username"
          placeholder="e.g. StrikerAce"
          autoCapitalize="none"
          value={username}
          onChangeText={(val) => {
            setUsername(val);
            if (usernameError) setUsernameError(null);
          }}
          error={usernameError}
        />

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

        <View style={styles.passwordField}>
          <Input
            label="Password"
            placeholder="••••••••"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={(val) => {
              setPassword(val);
              if (passwordError) setPasswordError(null);
            }}
            error={passwordError}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.eyeText}>{showPassword ? '👁️' : '🙈'}</Text>
          </TouchableOpacity>
        </View>

        <Input
          label="Confirm Password"
          placeholder="••••••••"
          secureTextEntry={!showPassword}
          value={confirmPassword}
          onChangeText={(val) => {
            setConfirmPassword(val);
            if (confirmPasswordError) setConfirmPasswordError(null);
          }}
          error={confirmPasswordError}
        />

        {/* Terms Acceptance Row */}
        <View style={styles.termsRow}>
          <Toggle
            value={agreeTerms}
            onValueChange={(val) => {
              setAgreeTerms(val);
              if (termsError) setTermsError(null);
            }}
          />
          <View style={styles.termsTextWrap}>
            <Text style={styles.termsText}>
              I agree to the{' '}
              <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>
        </View>
        {!!termsError && <Text style={styles.fieldError}>{termsError}</Text>}

        {/* Action Button */}
        <PrimaryButton
          title="Create Account"
          onPress={handleRegister}
          loading={isLoading}
          variant="emerald"
          size="large"
          style={styles.registerButton}
        />

        {/* Return to Login */}
        <View style={styles.footerRow}>
          <Text style={styles.footerPrompt}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.footerAction}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </GameCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.xl,
    paddingBottom: THEME.spacing.xxl,
  },
  headerBox: {
    alignItems: 'center',
    marginBottom: THEME.spacing.lg,
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
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: THEME.typography.fontSize.bodySm,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginTop: THEME.spacing.xs,
    paddingHorizontal: THEME.spacing.md,
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
  formCard: {
    padding: THEME.spacing.lg,
  },
  passwordField: {
    position: 'relative',
  },
  eyeButton: {
    position: 'absolute',
    right: 14,
    top: 38,
    padding: 4,
  },
  eyeText: {
    fontSize: 16,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: THEME.spacing.sm,
    marginBottom: THEME.spacing.xs,
  },
  termsTextWrap: {
    flex: 1,
    marginLeft: THEME.spacing.md,
  },
  termsText: {
    fontSize: THEME.typography.fontSize.caption,
    color: THEME.colors.textSecondary,
    lineHeight: 18,
  },
  termsLink: {
    color: THEME.colors.accent,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  fieldError: {
    fontSize: THEME.typography.fontSize.caption,
    color: THEME.colors.danger,
    marginBottom: THEME.spacing.sm,
  },
  registerButton: {
    marginTop: THEME.spacing.lg,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: THEME.spacing.lg,
    paddingTop: THEME.spacing.md,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
  },
  footerPrompt: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.fontSize.bodySm,
  },
  footerAction: {
    color: THEME.colors.accent,
    fontSize: THEME.typography.fontSize.bodySm,
    fontWeight: THEME.typography.fontWeight.bold,
  },
});
