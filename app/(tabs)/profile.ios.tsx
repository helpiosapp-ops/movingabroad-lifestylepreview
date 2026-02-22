
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, typography, spacing, borderRadius, shadows } from '@/styles/commonStyles';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? colors.dark : colors.light;

  const infoItems = [
    {
      icon: 'info',
      title: 'About This App',
      description: 'Get realistic previews of daily life in different countries. No hype, just honest insights.',
    },
    {
      icon: 'lock',
      title: 'Privacy First',
      description: 'No accounts, no tracking, no data collection. Your conversations stay private.',
    },
    {
      icon: 'payment',
      title: 'Pay Once, Use Forever',
      description: 'No subscriptions, no recurring payments. One purchase, lifetime access.',
    },
  ];

  const features = [
    'Realistic lifestyle previews',
    'Daily life insights',
    'Cultural expectations',
    'Work-life balance info',
    'Common surprises',
    'Honest assessments',
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={[theme.gradientStart, theme.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconContainer}
          >
            <IconSymbol
              ios_icon_name="globe"
              android_material_icon_name="public"
              size={48}
              color="#FFFFFF"
            />
          </LinearGradient>
          <Text style={[styles.appName, { color: theme.text }]}>
            Moving Abroad
          </Text>
          <Text style={[styles.tagline, { color: theme.primary }]}>
            Lifestyle Preview
          </Text>
        </View>

        {/* Info Cards */}
        <View style={styles.section}>
          {infoItems.map((item, index) => (
            <View
              key={index}
              style={[
                styles.infoCard,
                { backgroundColor: theme.surface },
                shadows.small,
              ]}
            >
              <View style={[styles.infoIconContainer, { backgroundColor: theme.primaryLight }]}>
                <IconSymbol
                  ios_icon_name={item.icon}
                  android_material_icon_name={item.icon}
                  size={24}
                  color={theme.primary}
                />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoTitle, { color: theme.text }]}>
                  {item.title}
                </Text>
                <Text style={[styles.infoDescription, { color: theme.textSecondary }]}>
                  {item.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Features Section */}
        <View style={[styles.featuresCard, { backgroundColor: theme.surface }, shadows.medium]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            What You Get
          </Text>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={[styles.featureDot, { backgroundColor: theme.primary }]} />
                <Text style={[styles.featureText, { color: theme.textSecondary }]}>
                  {feature}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Disclaimer */}
        <View style={[styles.disclaimerCard, { backgroundColor: theme.surfaceElevated }]}>
          <IconSymbol
            ios_icon_name="exclamationmark.triangle"
            android_material_icon_name="warning"
            size={20}
            color={theme.textTertiary}
          />
          <Text style={[styles.disclaimerText, { color: theme.textSecondary }]}>
            This app provides general lifestyle information only. It does not offer legal, immigration, tax, or financial advice.
          </Text>
        </View>

        {/* Version */}
        <Text style={[styles.version, { color: theme.textTertiary }]}>
          Version 1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 100,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  appName: {
    fontSize: typography.h2,
    fontWeight: typography.bold,
    marginTop: spacing.sm,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: typography.h4,
    fontWeight: typography.semibold,
    marginTop: spacing.xs,
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: spacing.lg,
  },
  infoCard: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  infoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    marginBottom: spacing.xs,
  },
  infoDescription: {
    fontSize: typography.bodySmall,
    lineHeight: 20,
  },
  featuresCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.h4,
    fontWeight: typography.bold,
    marginBottom: spacing.md,
  },
  featuresGrid: {
    gap: spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  featureText: {
    fontSize: typography.body,
    lineHeight: 24,
  },
  disclaimerCard: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  disclaimerText: {
    flex: 1,
    fontSize: typography.caption,
    lineHeight: 18,
  },
  version: {
    fontSize: typography.caption,
    textAlign: 'center',
  },
});
