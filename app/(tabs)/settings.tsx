import { Ionicons } from '@expo/vector-icons';
import { useState, type ComponentProps } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { useTheme } from '../../constants/theme';
import { useAuth } from '../../src/auth';

type SettingRowProps = {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

function SettingRow({ icon, label, description, value, onValueChange }: SettingRowProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.settingRow}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={20} color={colors.accent} />
      </View>
      <View style={styles.settingCopy}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.accent }}
        thumbColor={value ? colors.text : colors.textMuted}
      />
    </View>
  );
}

export default function SettingsScreen() {
  const { colors, isDark, setIsDark } = useTheme();
  const styles = createStyles(colors);
  const [notifications, setNotifications] = useState(true);
  const [locationServices, setLocationServices] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const { user, signOut } = useAuth();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable style={styles.profileButton} accessibilityLabel="Open profile">
          <Ionicons name="person" size={22} color={colors.background} />
        </Pressable>
        <View>
          <Text style={styles.eyebrow}>YOUR ACCOUNT</Text>
          <Text style={styles.title}>Settings</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Preferences</Text>
      <View style={styles.settingsCard}>
        <SettingRow
          icon="moon"
          label="Dark mode"
          description="Use a darker appearance throughout the app."
          value={isDark}
          onValueChange={setIsDark}
        />
        <SettingRow
          icon="notifications"
          label="Notifications"
          description="Get updates about nearby treasure."
          value={notifications}
          onValueChange={setNotifications}
        />
        <SettingRow
          icon="location"
          label="Location services"
          description="Allow the app to find nearby chests."
          value={locationServices}
          onValueChange={setLocationServices}
        />
        <SettingRow
          icon="volume-high"
          label="Sound effects"
          description="Play sounds when you find rewards."
          value={soundEffects}
          onValueChange={setSoundEffects}
        />
      </View>

      <Text style={styles.sectionTitle}>Account</Text>
      <View style={styles.accountCard}>
        <View style={styles.accountRow}>
          <Ionicons name="mail-outline" size={21} color={colors.textMuted} />
          <View style={styles.accountCopy}>
            <Text style={styles.accountLabel}>Signed in as</Text>
            <Text style={styles.accountEmail}>{user?.email}</Text>
          </View>
        </View>
        <Pressable style={styles.accountRow} accessibilityLabel="Edit profile">
          <Ionicons name="create-outline" size={21} color={colors.textMuted} />
          <Text style={styles.accountLabel}>Edit profile</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </Pressable>
        <Pressable style={styles.accountRow} accessibilityLabel="Help and support">
          <Ionicons name="help-circle-outline" size={21} color={colors.textMuted} />
          <Text style={styles.accountLabel}>Help and support</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </Pressable>
      </View>

      <Pressable style={styles.signOutButton} accessibilityLabel="Sign out" onPress={signOut}>
        <Ionicons name="log-out-outline" size={20} color={colors.danger} />
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
      <Text style={styles.version}>Digi Chest • Version 1.0.0</Text>
    </ScrollView>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 28,
  },
  profileButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: colors.accent,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: colors.textMuted,
  },
  title: {
    marginTop: 2,
    fontSize: 30,
    fontWeight: '800',
    color: colors.text,
  },
  sectionTitle: {
    marginBottom: 10,
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
  },
  settingsCard: {
    marginBottom: 24,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  settingRow: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: colors.background,
  },
  settingCopy: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  settingDescription: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textMuted,
  },
  accountCard: {
    marginBottom: 28,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  accountRow: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  accountLabel: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  accountCopy: {
    flex: 1,
  },
  accountEmail: {
    marginTop: 3,
    color: colors.textMuted,
    fontSize: 12,
  },
  signOutButton: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 14,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.danger,
  },
  version: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 12,
    color: colors.textMuted,
  },
  });
}
