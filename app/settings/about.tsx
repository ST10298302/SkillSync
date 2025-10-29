import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Animated,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import UniformLayout from '../../components/UniformLayout';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/Colors';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

/**
 * About Page - Displays app information, team members, features, and legal policies
 * Features animated entrance, expandable legal sections, and modern card-based UI
 */
export default function About() {
  const router = useRouter();
  const { t } = useLanguage();
  const { resolvedTheme } = useTheme();
  const safeTheme = resolvedTheme === 'light' || resolvedTheme === 'dark' ? resolvedTheme : 'light';
  const themeColors = Colors[safeTheme] || Colors.light;

  // State for managing expanded legal policy items
  const [expandedLegal, setExpandedLegal] = React.useState<number | null>(null);

  // Animation values for smooth entrance effects
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  // Initialize entrance animations on component mount
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

  // App metadata and key features
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

  // Development team members with GitHub profile images
  const teamMembers = [
    {
      name: 'Markus Fourie',
      role: 'Developer',
      image: 'https://avatars.githubusercontent.com/u/148498902?v=4'
    },
    {
      name: 'Derik Korf',
      role: 'Developer',
      image: 'https://avatars.githubusercontent.com/u/204842053?v=4'
    },
    {
      name: 'Kyle Nel',
      role: 'Developer',
      image: 'https://avatars.githubusercontent.com/u/75183377?v=4'
    },
    {
      name: 'Shawn du Preez',
      role: 'Developer',
      image: 'https://avatars.githubusercontent.com/u/213583861?v=4'
    }
  ];

  // Legal policies with detailed descriptions (expandable dropdowns)
  const legalLinks = [
    {
      title: 'Privacy Policy',
      subtitle: 'We prioritize your privacy and security. Your personal data is encrypted end-to-end, and we never share your information with third parties. We collect only essential data needed to provide our services and ensure you have full control over your information.',
      icon: 'shield-outline'
    },
    {
      title: 'Terms of Service',
      subtitle: 'Our terms outline your rights and responsibilities while using SkillSync. We maintain fair usage policies, respect intellectual property, and ensure transparent service delivery. By using our app, you agree to these terms designed to protect both you and our community.',
      icon: 'document-text-outline'
    },
    {
      title: 'Cookie Policy',
      subtitle: 'We use cookies and similar technologies to enhance your experience, remember your preferences, and analyze app performance. You can manage cookie settings anytime. Essential cookies ensure core functionality, while optional cookies help us improve our services.',
      icon: 'cafe-outline'
    },
    {
      title: 'Data Processing',
      subtitle: 'We process your data with industry-leading security standards and full GDPR compliance. All data processing is performed with your consent, stored in secure servers, and regularly audited. You have the right to access, modify, or delete your data at any time.',
      icon: 'analytics-outline'
    }
  ];

  // Social media and community links
  const socialLinks = [
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

  /**
   * Legal Item Component - Expandable accordion item for legal policies
   * @param title - Policy title
   * @param subtitle - Detailed policy description
   * @param icon - Ionicon name for the policy
   * @param index - Index of the item (for expand state tracking)
   * @param isExpanded - Whether this item is currently expanded
   */
  const LegalItem = ({ 
    title, 
    subtitle, 
    icon, 
    index,
    isExpanded
  }: {
    title: string;
    subtitle: string;
    icon: string;
    index: number;
    isExpanded: boolean;
  }) => (
    <View style={styles.legalItem}>
      <TouchableOpacity 
        style={styles.legalHeader} 
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setExpandedLegal(isExpanded ? null : index);
        }}
      >
        <View style={styles.aboutIcon}>
          <Ionicons name={icon as any} size={24} color={themeColors.accent} />
        </View>
        <View style={styles.aboutContent}>
          <Text style={styles.aboutTitle}>{title}</Text>
        </View>
        <View style={styles.chevronContainer}>
          <Ionicons 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={20} 
            color={themeColors.textSecondary} 
          />
        </View>
      </TouchableOpacity>
      {isExpanded && (
        <View style={styles.legalContent}>
          <Text style={styles.legalDescription}>{subtitle}</Text>
        </View>
      )}
    </View>
  );

  /**
   * About Item Component - Clickable list item for social/community links
   * @param title - Item title
   * @param subtitle - Item description
   * @param icon - Ionicon name
   * @param onPress - Click handler
   */
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
      <View style={styles.chevronContainer}>
        <Ionicons name="chevron-forward" size={20} color={themeColors.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  /**
   * Get appropriate icon for each feature based on index
   * @param index - Feature index
   * @returns Ionicon name string
   */
  const getFeatureIcon = (index: number): any => {
    const icons = ['analytics-outline', 'create-outline', 'flash-outline', 'stats-chart-outline', 'person-outline', 'sync-outline', 'shield-checkmark-outline'];
    return icons[index] || 'checkmark-circle-outline';
  };

  /**
   * Feature Item Component - Card displaying a single app feature
   * @param feature - Feature description text
   * @param index - Feature index (used for icon selection)
   */
  const FeatureItem = ({ feature, index }: { feature: string; index: number }) => (
    <View style={styles.featureItem}>
      <View style={styles.featureIconContainer}>
        <Ionicons name={getFeatureIcon(index)} size={28} color={themeColors.accent} />
      </View>
      <Text style={styles.featureText}>{feature}</Text>
    </View>
  );

  /**
   * Team Member Component - Card displaying team member info with profile picture
   * @param member - Team member object with name, role, and image URL
   */
  const TeamMember = ({ member }: { member: { name: string; role: string; image: string } }) => (
    <View style={styles.teamMember}>
      <Image 
        source={{ uri: member.image }}
        style={styles.memberImage}
      />
      <Text style={styles.memberName}>{member.name}</Text>
      <Text style={styles.memberRole}>{member.role}</Text>
    </View>
  );

  const styles = StyleSheet.create({
    // Main container styles
    scrollView: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    scrollContent: {
      paddingBottom: Spacing.xl,
    },

    // Header section styles
    header: {
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.xl,
      paddingBottom: Spacing.lg,
      backgroundColor: themeColors.backgroundSecondary,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border,
      shadowColor: themeColors.shadow as any,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
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

    // App info section styles
    appInfoContainer: {
      alignItems: 'center',
      paddingVertical: Spacing.xl,
      paddingHorizontal: Spacing.lg,
    },
    appName: {
      ...Typography.h1,
      color: themeColors.text,
      fontWeight: '700',
      marginBottom: Spacing.xs,
      fontSize: 36,
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
      lineHeight: 26,
      paddingHorizontal: Spacing.xl,
      maxWidth: 600,
    },

    // Section and card styles
    section: {
      paddingHorizontal: Spacing.lg,
      marginTop: Spacing.lg,
    },
    sectionTitle: {
      ...Typography.h3,
      color: themeColors.text,
      fontWeight: '700',
      marginBottom: Spacing.md,
      paddingLeft: Spacing.xs,
      borderLeftWidth: 4,
      borderLeftColor: themeColors.accent,
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

    // Social/community item styles
    aboutItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: Spacing.lg,
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
      marginRight: Spacing.sm,
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
      lineHeight: 20,
    },
    chevronContainer: {
      alignSelf: 'flex-start',
      marginTop: 2,
    },

    // Features section styles
    featuresGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: Spacing.md,
    },
    featureItem: {
      flexDirection: 'column',
      alignItems: 'center',
      width: '48%',
      backgroundColor: themeColors.backgroundSecondary,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      shadowColor: themeColors.shadow as any,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 3,
      borderWidth: 1,
      borderColor: themeColors.border,
    },
    featureIconContainer: {
      width: 56,
      height: 56,
      borderRadius: BorderRadius.round,
      backgroundColor: themeColors.accent + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: Spacing.md,
    },
    featureText: {
      ...Typography.bodySmall,
      color: themeColors.text,
      fontWeight: '600',
      textAlign: 'center',
      lineHeight: 20,
    },

    // Team section styles
    teamGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginHorizontal: -Spacing.xs,
    },
    teamMember: {
      alignItems: 'center',
      width: '48%',
      marginBottom: Spacing.lg,
      padding: Spacing.md,
      backgroundColor: themeColors.backgroundTertiary,
      borderRadius: BorderRadius.lg,
      shadowColor: themeColors.shadow as any,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    memberImage: {
      width: 70,
      height: 70,
      borderRadius: BorderRadius.round,
      marginBottom: Spacing.sm,
      backgroundColor: themeColors.backgroundSecondary,
      borderWidth: 3,
      borderColor: themeColors.accent + '30',
    },
    memberName: {
      ...Typography.bodySmall,
      color: themeColors.text,
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: 4,
    },
    memberRole: {
      ...Typography.caption,
      color: themeColors.accent,
      fontWeight: '600',
      textAlign: 'center',
      fontSize: 11,
    },

    // Legal section styles (expandable accordion)
    legalItem: {
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border,
    },
    legalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Spacing.lg,
    },
    legalContent: {
      paddingLeft: 64,
      paddingRight: Spacing.md,
      paddingBottom: Spacing.lg,
    },
    legalDescription: {
      ...Typography.bodySmall,
      color: themeColors.textSecondary,
      lineHeight: 22,
    },

    // Footer section styles
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
          <Text style={styles.appName}>{appInfo.name}</Text>
          <Text style={styles.appVersion}>{t('version')} {appInfo.version} (Build {appInfo.buildNumber})</Text>
          <Text style={styles.appDescription}>{appInfo.description}</Text>
        </Animated.View>

        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.sectionTitle}>{t('ourTeam')}</Text>
          
          <View style={styles.card}>
            <View style={styles.teamGrid}>
              {teamMembers.map((member, index) => (
                <TeamMember key={index} member={member} />
              ))}
            </View>
          </View>
        </Animated.View>

        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.sectionTitle}>{t('features')}</Text>
          
          <View style={styles.featuresGrid}>
            {appInfo.features.map((feature, index) => (
              <FeatureItem key={index} feature={feature} index={index} />
            ))}
          </View>
        </Animated.View>

        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.sectionTitle}>Legal & Privacy</Text>
          
          <View style={styles.card}>
            {legalLinks.map((link, index) => (
              <LegalItem
                key={index}
                title={link.title}
                subtitle={link.subtitle}
                icon={link.icon}
                index={index}
                isExpanded={expandedLegal === index}
              />
            ))}
          </View>
        </Animated.View>

        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.sectionTitle}>{t('connectWithUs')}</Text>
          
          <View style={styles.card}>
            {socialLinks.map((link, index) => (
              <AboutItem
                key={index}
                title={link.title}
                subtitle={link.subtitle}
                icon={link.icon}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Linking.openURL(link.url);
                }}
              />
            ))}
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
