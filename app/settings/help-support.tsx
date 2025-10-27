import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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

export default function HelpSupport() {
  const router = useRouter();
  const { t } = useLanguage();
  const { resolvedTheme } = useTheme();
  const safeTheme = resolvedTheme === 'light' || resolvedTheme === 'dark' ? resolvedTheme : 'light';
  const themeColors = Colors[safeTheme] || Colors.light;

  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

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

  const faqs = [
    {
      question: "How do I add a new skill?",
      answer: "Tap the '+' button on the home screen or go to the Add tab. Enter the skill name, description, and set your learning goals. You can also add categories and difficulty levels to better organize your learning journey."
    },
    {
      question: "How does progress tracking work?",
      answer: "SkillSync tracks your progress through daily entries. Each time you practice a skill, add an entry with your achievements, challenges, and time spent. The app calculates your overall progress based on your goals and consistency."
    },
    {
      question: "What are streaks and how do they work?",
      answer: "Streaks track consecutive days of practice for each skill. The longer your streak, the more motivated you'll stay. You can view your streaks in the Analytics tab and get notifications to maintain them."
    },
    {
      question: "Can I export my data?",
      answer: "Yes! Go to Settings > Privacy & Security > Export Data to download all your skills, entries, and progress data. This feature helps you backup your learning journey or transfer to other platforms."
    },
    {
      question: "How do I change my profile picture?",
      answer: "Tap on your profile picture in the Profile tab. You can either take a new photo or select one from your gallery. The app will automatically crop and optimize the image for the best display."
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely! We use industry-standard encryption and secure cloud storage. Your data is never shared with third parties without your explicit consent. You can control your privacy settings in the Privacy & Security section."
    }
  ];

  const contactOptions = [
    {
      title: "Email Support",
      subtitle: "Get help via email",
      icon: "mail-outline",
      action: () => Linking.openURL('mailto:support@skillsync.app'),
    },
    {
      title: "Live Chat",
      subtitle: "Chat with our support team",
      icon: "chatbubbles-outline",
      action: () => {
        // TODO: Implement live chat
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
    },
    {
      title: "Report a Bug",
      subtitle: "Help us improve the app",
      icon: "bug-outline",
      action: () => {
        // TODO: Implement bug reporting
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
    },
    {
      title: "Feature Request",
      subtitle: "Suggest new features",
      icon: "bulb-outline",
      action: () => {
        // TODO: Implement feature request
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
    }
  ];

  const HelpItem = ({ 
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
    <TouchableOpacity style={styles.helpItem} onPress={onPress}>
      <View style={styles.helpIcon}>
        <Ionicons name={icon as any} size={24} color={themeColors.accent} />
      </View>
      <View style={styles.helpContent}>
        <Text style={styles.helpTitle}>{title}</Text>
        <Text style={styles.helpSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={themeColors.textSecondary} />
    </TouchableOpacity>
  );

  const FAQItem = ({ 
    question, 
    answer, 
    index 
  }: {
    question: string;
    answer: string;
    index: number;
  }) => {
    const isExpanded = expandedFAQ === index;
    
    return (
      <View style={styles.faqItem}>
        <TouchableOpacity
          style={styles.faqQuestion}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setExpandedFAQ(isExpanded ? null : index);
          }}
        >
          <Text style={styles.faqQuestionText}>{question}</Text>
          <Ionicons 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={20} 
            color={themeColors.textSecondary} 
          />
        </TouchableOpacity>
        {isExpanded && (
          <Animated.View style={styles.faqAnswer}>
            <Text style={styles.faqAnswerText}>{answer}</Text>
          </Animated.View>
        )}
      </View>
    );
  };

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
    helpItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border,
    },
    helpIcon: {
      width: 48,
      height: 48,
      borderRadius: BorderRadius.round,
      backgroundColor: themeColors.accent + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.md,
    },
    helpContent: {
      flex: 1,
    },
    helpTitle: {
      ...Typography.body,
      color: themeColors.text,
      fontWeight: '600',
      marginBottom: Spacing.xs,
    },
    helpSubtitle: {
      ...Typography.caption,
      color: themeColors.textSecondary,
      lineHeight: 18,
    },
    faqItem: {
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border,
    },
    faqQuestion: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: Spacing.md,
    },
    faqQuestionText: {
      ...Typography.body,
      color: themeColors.text,
      fontWeight: '600',
      flex: 1,
      marginRight: Spacing.md,
    },
    faqAnswer: {
      paddingBottom: Spacing.md,
    },
    faqAnswerText: {
      ...Typography.bodySmall,
      color: themeColors.textSecondary,
      lineHeight: 22,
    },
    quickActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: Spacing.lg,
    },
    quickAction: {
      flex: 1,
      backgroundColor: themeColors.backgroundTertiary,
      borderRadius: BorderRadius.md,
      padding: Spacing.md,
      alignItems: 'center',
      marginHorizontal: Spacing.xs,
    },
    quickActionIcon: {
      width: 32,
      height: 32,
      borderRadius: BorderRadius.round,
      backgroundColor: themeColors.accent + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: Spacing.sm,
    },
    quickActionTitle: {
      ...Typography.caption,
      color: themeColors.text,
      fontWeight: '600',
      textAlign: 'center',
    },
    infoSection: {
      backgroundColor: themeColors.info + '10',
      borderRadius: BorderRadius.md,
      padding: Spacing.md,
      marginTop: Spacing.lg,
    },
    infoText: {
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
            <Text style={styles.headerTitle}>{t('helpSupport')}</Text>
          </View>
          <View style={styles.logoContainer}>
            <Logo size={40} />
          </View>
        </Animated.View>

        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.sectionTitle}>{t('quickActions')}</Text>
          
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                // TODO: Navigate to getting started guide
              }}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="play-outline" size={16} color={themeColors.accent} />
              </View>
              <Text style={styles.quickActionTitle}>{t('getStarted')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                // TODO: Navigate to tutorials
              }}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="school-outline" size={16} color={themeColors.accent} />
              </View>
              <Text style={styles.quickActionTitle}>{t('tutorials')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                // TODO: Navigate to troubleshooting
              }}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="construct-outline" size={16} color={themeColors.accent} />
              </View>
              <Text style={styles.quickActionTitle}>{t('troubleshoot')}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.sectionTitle}>{t('contactUs')}</Text>
          
          <View style={styles.card}>
            {contactOptions.map((option, index) => (
              <HelpItem
                key={index}
                title={option.title}
                subtitle={option.subtitle}
                icon={option.icon}
                onPress={option.action}
              />
            ))}
          </View>
        </Animated.View>

        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.sectionTitle}>{t('frequentlyAskedQuestions')}</Text>
          
          <View style={styles.card}>
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                index={index}
              />
            ))}
          </View>
        </Animated.View>

        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.infoSection}>
            <Text style={styles.infoText}>
              {t('cantFindWhatLookingFor')} {t('typicallyRespondWithin24Hours')}
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </UniformLayout>
  );
}
