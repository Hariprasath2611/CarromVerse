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
        <Text style={styles.title}>WELCOME BACK</Text>
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
          title="SIGN IN"
          icon="🔑"
          onPress={handleLogin}
          loading={isLoading}
          variant="emerald"
          size="large"
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
          title="PLAY OFFLINE AS GUEST"
          icon="🎮"
          variant="forest"
          size="large"
          onPress={handleGuestPlay}
        />
      </GameCard>

      {/* Footer Registration Link */}
      <View style={styles.footerRow}>
        <Text style={styles.footerText}>New to CarromVerse? </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.signUpText}>CREATE ACCOUNT</Text>
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
    marginBottom: 20,
    alignItems: 'center',
  },
  emblemCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#07261C',
    borderWidth: 2.5,
    borderColor: THEME.colors.neonEmerald,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    ...THEME.shadows.glowEmerald,
  },
  emblemEmoji: {
    fontSize: 30,
  },
  title: {
    color: THEME.colors.cream,
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  subtitle: {
    color: THEME.colors.mutedMint,
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
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
  formCard: {
    padding: 22,
  },
  passwordField: {
    position: 'relative',
    marginBottom: 12,
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
    marginBottom: 20,
  },
  rememberToggle: {
    paddingVertical: 0,
    flex: 1,
  },
  forgotBtn: {
    paddingVertical: 4,
    marginLeft: 8,
  },
  forgotText: {
    color: THEME.colors.brass,
    fontSize: 12,
    fontWeight: 'bold',
  },
  signInButton: {
    marginBottom: 12,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: '#1B7050',
  },
  dividerText: {
    color: THEME.colors.mutedMint,
    marginHorizontal: 10,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: THEME.colors.mutedMint,
    fontSize: 13,
  },
  signUpText: {
    color: THEME.colors.neonEmerald,
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
