import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { useSession } from '@/context/auth';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function SignUpScreen() {
  const theme = useTheme();
  const { signUp } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirm?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const next: typeof errors = {};
    if (!name.trim()) next.name = 'Name is required';
    if (!email.trim()) next.email = 'Email is required';
    else if (!isValidEmail(email)) next.email = 'Enter a valid email';
    if (!password) next.password = 'Password is required';
    else if (password.length < 6) next.password = 'At least 6 characters';
    if (!confirm) next.confirm = 'Confirm your password';
    else if (confirm !== password) next.confirm = 'Passwords do not match';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function onSubmit() {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      signUp(name, email, password);
      setLoading(false);
    }, 350);
  }

  return (
    <Screen scroll padded={false} style={styles.screen}>
      <View style={styles.screenInner}>
        <View
          style={[
            styles.card,
            { backgroundColor: theme.backgroundElement, borderColor: theme.border },
          ]}>
          <View style={styles.header}>
            <View style={[styles.brandMark, { backgroundColor: theme.primary }]}>
              <SymbolView
                name={{ ios: 'leaf.fill', android: 'eco', web: 'eco' }}
                tintColor={theme.onPrimary}
                size={18}
              />
            </View>
            <ThemedText type="title" numberOfLines={1} style={styles.title}>
              Create your garden
            </ThemedText>
            <ThemedText
              type="small"
              numberOfLines={1}
              themeColor="textSecondary"
              style={styles.subtitle}>
              Track care, growth, and plant health.
            </ThemedText>
          </View>

          <View style={styles.form}>
            <TextField
              placeholder="Your name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              textContentType="name"
              autoComplete="name"
              error={errors.name}
              style={styles.input}
            />
            <TextField
              placeholder="email@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              textContentType="emailAddress"
              autoComplete="email"
              error={errors.email}
              style={styles.input}
            />
            <TextField
              placeholder="Create password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textContentType="newPassword"
              autoComplete="new-password"
              error={errors.password}
              style={styles.input}
            />
            <TextField
              placeholder="Confirm password"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
              textContentType="newPassword"
              autoComplete="new-password"
              error={errors.confirm}
              style={styles.input}
            />
            <Button title="Create account" onPress={onSubmit} loading={loading} style={styles.cta} />
          </View>

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
            <ThemedText type="small" themeColor="textSecondary">
              or
            </ThemedText>
            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
          </View>

          <View style={[styles.googleButton, { borderColor: theme.border }]}>
            <Image
              source={{ uri: 'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg' }}
              style={styles.googleIcon}
              contentFit="contain"
            />
            <ThemedText type="smallBold">Continue with Google</ThemedText>
          </View>

          <View style={styles.footer}>
            <ThemedText type="small" numberOfLines={1} themeColor="textSecondary">
              Already have an account?{' '}
            </ThemedText>
            <Link href="/login" style={styles.footerLink}>
              <ThemedText type="linkPrimary" style={styles.footerText}>
                Sign in
              </ThemedText>
            </Link>
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  screenInner: {
    alignSelf: 'stretch',
    flexGrow: 1,
    alignItems: 'stretch',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
  },
  card: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderRadius: 20,
    padding: Spacing.three,
    marginVertical: Spacing.two,
  },
  header: {
    gap: Spacing.two,
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  brandMark: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
    transform: [{ rotate: '-8deg' }],
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.8,
    textAlign: 'center',
    maxWidth: '100%',
  },
  subtitle: {
    lineHeight: 24,
    textAlign: 'center',
  },
  form: {
    gap: Spacing.three,
  },
  cta: {
    minHeight: 46,
    borderRadius: 14,
    marginTop: Spacing.two,
  },
  input: {
    minHeight: 44,
    borderRadius: 12,
    paddingHorizontal: Spacing.two,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginVertical: Spacing.three,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  googleButton: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  googleIcon: {
    width: 20,
    height: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.four,
  },
  footerLink: {
    marginLeft: Spacing.half,
  },
  footerText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
