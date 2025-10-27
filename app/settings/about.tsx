import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Animated,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import Logo from '../../components/Logo';
import UniformLayout from '../../components/UniformLayout';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/Colors';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

export default function About() {
  const router = useRouter();
  const { t } = useLanguage();
  const { resolvedTheme } = useTheme();
  const safeTheme = resolvedTheme === 'light' || resolvedTheme === 'dark' ? resolvedTheme : 'light';
  const themeColors = Colors[safeTheme] || Colors.light;

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const appInfo = {
    name: 'SkillSync',
    version: '1.0.0',
    buildNumber: '1',
    description: 'Master your skills with intelligent tracking and personalized insights. SkillSync helps you build consistent habits and achieve your learning goals through detailed progress tracking, streak monitoring, and data-driven insights.',
    features: [
      'Skill tracking and progress monitoring',
      'Daily entry logging with achievements',
      'Streak tracking for motivation',
      'Analytics and insights',
      'Profile customization',
      'Cross-platform sync',
      'Privacy-focused design'
    ]
  };

  const teamMembers = [
    {
      name: 'Development Team',
      role: 'Core Development',
      description: 'Building the future of skill tracking'
    },
    {
      name: 'Design Team',
      role: 'UI/UX Design',
      description: 'Creating beautiful, intuitive experiences'
    },
    {
      name: 'Product Team',
      role: 'Product Strategy',
      description: 'Shaping the product vision'
    }
  ];

  const legalLinks = [
    {
      title: 'Privacy Policy',
      subtitle: 'How we protect your data',
      icon: 'shield-outline',
      url: 'https://skillsync.app/privacy'
    },
    {
      title: 'Terms of Service',
      subtitle: 'Our terms and conditions',
      icon: 'document-text-outline',
      url: 'https://skillsync.app/terms'
    },
    {
      title: 'Cookie Policy',
      subtitle: 'How we use cookies',
      icon: 'cafe-outline',
      url: 'https://skillsync.app/cookies'
    },
    {
      title: 'Data Processing',
      subtitle: 'How we process your data',
      icon: 'analytics-outline',
      url: 'https://skillsync.app/data-processing'
    }
  ];

  const socialLinks = [
    {
      title: 'Website',
      subtitle: 'Visit our website',
      icon: 'globe-outline',
      url: 'https://skillsync.app'
    },
    {
      title: 'Twitter',
      subtitle: 'Follow us on Twitter',
      icon: 'logo-twitter',
      url: 'https://twitter.com/skillsync'
    },
    {
      title: 'GitHub',
      subtitle: 'View our open source projects',
      icon: 'logo-github',
      url: 'https://github.com/skillsync'
    },
    {
      title: 'Discord',
      subtitle: 'Join our community',
      icon: 'logo-discord',
      url: 'https://discord.gg/skillsync'
    }
  ];

  const AboutItem = ({ 
    title, 
    subtitle, 
    icon, 
    onPress 
  }: {
    title: string;
    subtitle: string;
    icon: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity style={styles.aboutItem} onPress={onPress}>
      <View style={styles.aboutIcon}>
        <Ionicons name={icon as any} size={24} color={themeColors.accent} />
      </View>
      <View style={styles.aboutContent}>
        <Text style={styles.aboutTitle}>{title}</Text>
        <Text style={styles.aboutSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={themeColors.textSecondary} />
    </TouchableOpacity>
  );

  const FeatureItem = ({ feature }: { feature: string }) => (
    <View style={styles.featureItem}>
      <View style={styles.featureBullet}>
        <Ionicons name="checkmark" size={16} color={themeColors.success} />
      </View>
      <Text style={styles.featureText}>{feature}</Text>
    </View>
  );

  const TeamMember = ({ member }: { member: { name: string; role: string; description: string } }) => (
    <View style={styles.teamMember}>
      <Text style={styles.memberName}>{member.name}</Text>
      <Text style={styles.memberRole}>{member.role}</Text>
      <Text style={styles.memberDescription}>{member.description}</Text>
    </View>
  );

  const styles = StyleSheet.create({
    scrollView: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    scrollContent: {
      paddingBottom: Spacing.xl,
    },
    header: {
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.xl,
      paddingBottom: Spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.lg,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: BorderRadius.round,
      backgroundColor: themeColors.backgroundTertiary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.md,
    },
    headerTitle: {
      ...Typography.h2,
      color: themeColors.text,
      fontWeight: '700',
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: Spacing.lg,
    },
    appInfoContainer: {
      alignItems: 'center',
      paddingVertical: Spacing.xl,
    },
    appName: {
      ...Typography.h1,
      color: themeColors.text,
      fontWeight: '700',
      marginBottom: Spacing.xs,
    },
    appVersion: {
      ...Typography.caption,
      color: themeColors.textSecondary,
      marginBottom: Spacing.lg,
    },
    appDescription: {
      ...Typography.body,
      color: themeColors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      paddingHorizontal: Spacing.lg,
    },
    section: {
      paddingHorizontal: Spacing.lg,
      marginTop: Spacing.lg,
    },
    sectionTitle: {
      ...Typography.h3,
      color: themeColors.text,
      fontWeight: '600',
      marginBottom: Spacing.md,
    },
    card: {
      backgroundColor: themeColors.backgroundSecondary,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      marginBottom: Spacing.md,
      shadowColor: themeColors.shadow as any,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    aboutItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border,
    },
    aboutIcon: {
      width: 48,
      height: 48,
      borderRadius: BorderRadius.round,
      backgroundColor: themeColors.accent + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.md,
    },
    aboutContent: {
      flex: 1,
    },
    aboutTitle: {
      ...Typography.body,
      color: themeColors.text,
      fontWeight: '600',
      marginBottom: Spacing.xs,
    },
    aboutSubtitle: {
      ...Typography.caption,
      color: themeColors.textSecondary,
      lineHeight: 18,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.sm,
    },
    featureBullet: {
      width: 20,
      height: 20,
      borderRadius: BorderRadius.round,
      backgroundColor: themeColors.success + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.sm,
    },
    featureText: {
      ...Typography.bodySmall,
      color: themeColors.textSecondary,
      flex: 1,
    },
    teamMember: {
      marginBottom: Spacing.md,
      paddingBottom: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border,
    },
    memberName: {
      ...Typography.body,
      color: themeColors.text,
      fontWeight: '600',
      marginBottom: Spacing.xs,
    },
    memberRole: {
      ...Typography.caption,
      color: themeColors.accent,
      fontWeight: '600',
      marginBottom: Spacing.xs,
    },
    memberDescription: {
      ...Typography.caption,
      color: themeColors.textSecondary,
      lineHeight: 18,
    },
    footer: {
      alignItems: 'center',
      paddingVertical: Spacing.xl,
      paddingHorizontal: Spacing.lg,
    },
    footerText: {
      ...Typography.caption,
      color: themeColors.textSecondary,
      textAlign: 'center',
      lineHeight: 18,
    },
  });

  return (
    <UniformLayout>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.back();
              }}
            >
              <Ionicons name="arrow-back" size={24} color={themeColors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('aboutSkillSync')}</Text>
          </View>
        </Animated.View>

        <Animated.View style={[styles.appInfoContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Logo size={80} />
          <Text style={styles.appName}>{appInfo.name}</Text>
          <Text style={styles.appVersion}>{t('version')} {appInfo.version} (Build {appInfo.buildNumber})</Text>
          <Text style={styles.appDescription}>{appInfo.description}</Text>
        </Animated.View>

        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.sectionTitle}>{t('features')}</Text>
          
          <View style={styles.card}>
            {appInfo.features.map((feature, index) => (
              <FeatureItem key={index} feature={feature} />
            ))}
          </View>
        </Animated.View>

        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.sectionTitle}>{t('ourTeam')}</Text>
          
          <View style={styles.card}>
            {teamMembers.map((member, index) => (
              <TeamMember key={index} member={member} />
            ))}
          </View>
        </Animated.View>

        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.sectionTitle}>{t('legal')}</Text>
          
          <View style={styles.card}>
            {legalLinks.map((link, index) => {
              let titleKey = '';
              let subtitleKey = '';
              if (link.title === 'Privacy Policy') {
                titleKey = 'privacyPolicy';
                subtitleKey = 'howWeProtectYourData';
              } else if (link.title === 'Terms of Service') {
                titleKey = 'termsOfService';
                subtitleKey = 'ourTermsAndConditions';
              } else if (link.title === 'Cookie Policy') {
                titleKey = 'cookiePolicy';
                subtitleKey = 'howWeUseCookies';
              } else if (link.title === 'Data Processing') {
                titleKey = 'dataProcessing';
                subtitleKey = 'howWeProcessYourData';
              }
              return (
                <AboutItem
                  key={index}
                  title={titleKey ? t(titleKey) : link.title}
                  subtitle={subtitleKey ? t(subtitleKey) : link.subtitle}
                  icon={link.icon}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    Linking.openURL(link.url);
                  }}
                />
              );
            })}
          </View>
        </Animated.View>

        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.sectionTitle}>{t('connectWithUs')}</Text>
          
          <View style={styles.card}>
            {socialLinks.map((link, index) => {
              let titleKey = '';
              let subtitleKey = '';
              if (link.title === 'Website') {
                titleKey = 'website';
                subtitleKey = 'visitOurWebsite';
              } else if (link.title === 'Twitter') {
                titleKey = 'twitter';
                subtitleKey = 'followUsOnTwitter';
              } else if (link.title === 'GitHub') {
                titleKey = 'github';
                subtitleKey = 'viewOurOpenSourceProjects';
              } else if (link.title === 'Discord') {
                titleKey = 'discord';
                subtitleKey = 'joinOurCommunity';
              }
              return (
                <AboutItem
                  key={index}
                  title={titleKey ? t(titleKey) : link.title}
                  subtitle={subtitleKey ? t(subtitleKey) : link.subtitle}
                  icon={link.icon}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    Linking.openURL(link.url);
                  }}
                />
              );
            })}
          </View>
        </Animated.View>

        <Animated.View style={[styles.footer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.footerText}>
            {t('madeWith')}{'\n'}
            {t('allRightsReserved')}
          </Text>
        </Animated.View>
      </ScrollView>
    </UniformLayout>
  );
}
