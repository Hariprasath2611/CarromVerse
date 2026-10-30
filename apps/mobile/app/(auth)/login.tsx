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
import { validateEmail, validatePassword } from '@carromverse/shared-utils';
import { THEME } from '../../src/constants/theme';
import { APP_CONFIG } from '../../src/constants/config';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(true);

  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleLogin = async () => {
    clearError();
    setEmailError(null);
    setPasswordError(null);

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error || 'Invalid email');
      return;
    }

    const passValidation = validatePassword(password);
    if (!passValidation.isValid) {
      setPasswordError(passValidation.error || 'Invalid password');
      return;
    }

    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch {
      // Error handled and shown via authStore
    }
  };

  const handleGuestPlay = () => {
    router.replace('/(tabs)');
  };

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.container}>
      <LoadingOverlay visible={isLoading} message="Authenticating Player..." />

      {/* Header Emblem & Title */}
      <View style={styles.headerBox}>
        <View style={styles.emblemCircle}>
          <Text style={styles.emblemEmoji}>🎯</Text>
        </View>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to sync your match stats and trophies</Text>
      </View>

      {/* Error Banner */}
      {!!error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Login Card Form */}
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
            containerStyle={{ marginBottom: 0, flex: 1 }}
          />
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeBtn}
            hitSlop={10}
          >
            <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '🙈'}</Text>
          </Pressable>
        </View>

        {/* Options Row */}
        <View style={styles.optionsRow}>
          <Toggle
            label="Remember session"
            value={rememberSession}
            onValueChange={setRememberSession}
            style={styles.rememberToggle}
          />

          <TouchableOpacity
            onPress={() => router.push('/(auth)/forgot-password')}
            style={styles.forgotBtn}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        {/* Sign In Primary Action */}
        <PrimaryButton
          title="Sign In"
          icon="🔑"
          onPress={handleLogin}
          loading={isLoading}
          variant="emerald"
          style={styles.signInButton}
        />

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR PLAY LOCALLY</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Guest Mode Button */}
        <SecondaryButton
          title="Play Offline as Guest"
          icon="🎮"
          variant="forest"
          onPress={handleGuestPlay}
        />
      </GameCard>

      {/* Footer Registration Link */}
      <View style={styles.footerRow}>
        <Text style={styles.footerText}>New to CarromVerse? </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.signUpText}>Create Account</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    paddingVertical: THEME.spacing.lg,
  },
  headerBox: {
    marginBottom: THEME.spacing.lg,
    alignItems: 'center',
  },
  emblemCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: THEME.colors.surface,
    borderWidth: 2,
    borderColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.sm,
    ...THEME.shadows.emeraldGlow,
  },
  emblemEmoji: {
    fontSize: 28,
  },
  title: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.fontSize.headline,
    fontWeight: THEME.typography.fontWeight.heavy,
  },
  subtitle: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.fontSize.bodySm,
    marginTop: 4,
    textAlign: 'center',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.errorBg,
    borderColor: THEME.colors.error,
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
    color: THEME.colors.error,
    fontSize: THEME.typography.fontSize.bodySm,
    flex: 1,
  },
  formCard: {
    padding: THEME.spacing.lg,
  },
  passwordField: {
    position: 'relative',
    marginBottom: THEME.spacing.sm,
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    top: 36,
  },
  eyeIcon: {
    fontSize: 18,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.lg,
  },
  rememberToggle: {
    paddingVertical: 0,
    flex: 1,
  },
  forgotBtn: {
    paddingVertical: 4,
    marginLeft: THEME.spacing.sm,
  },
  forgotText: {
    color: THEME.colors.accent,
    fontSize: THEME.typography.fontSize.caption,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  signInButton: {
    marginBottom: THEME.spacing.sm,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: THEME.spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: THEME.colors.border,
  },
  dividerText: {
    color: THEME.colors.textMuted,
    marginHorizontal: THEME.spacing.sm,
    fontSize: 10,
    fontWeight: THEME.typography.fontWeight.heavy,
    letterSpacing: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: THEME.spacing.xl,
  },
  footerText: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.fontSize.bodySm,
  },
  signUpText: {
    color: THEME.colors.accent,
    fontSize: THEME.typography.fontSize.bodySm,
    fontWeight: THEME.typography.fontWeight.bold,
  },
});
