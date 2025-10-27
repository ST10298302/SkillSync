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

import UniformLayout from '../../components/UniformLayout';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/Colors';
import { useTheme } from '../../context/ThemeContext';

export default function HelpSupport() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const safeTheme = resolvedTheme === 'light' || resolvedTheme === 'dark' ? resolvedTheme : 'light';
  const themeColors = Colors[safeTheme] || Colors.light;

  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [expandedTutorial, setExpandedTutorial] = useState<number | null>(null);

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
      title: "Report a Bug",
      subtitle: "Help us improve the app",
      icon: "bug-outline",
      action: () => Linking.openURL('mailto:support@skillsync.app?subject=Bug Report'),
    },
    {
      title: "Feature Request",
      subtitle: "Suggest new features",
      icon: "bulb-outline",
      action: () => Linking.openURL('mailto:support@skillsync.app?subject=Feature Request'),
    }
  ];

  const tutorials = [
    {
      step: 1,
      title: "Getting Started",
      icon: "rocket-outline",
      description: "Welcome to SkillSync! Start by creating your first skill. Tap the '+' button on the home screen or navigate to the 'Add' tab. Give your skill a name, description, and set your learning goals.",
      tips: ["Choose skills you're passionate about", "Set realistic goals", "Start with one or two skills"]
    },
    {
      step: 2,
      title: "Track Your Progress",
      icon: "trending-up-outline",
      description: "Each time you practice, add an entry by tapping on your skill card. Record what you learned, challenges faced, and time spent. SkillSync automatically calculates your progress.",
      tips: ["Add entries daily for best results", "Be honest about your progress", "Include specific achievements"]
    },
    {
      step: 3,
      title: "Build Streaks",
      icon: "flame-outline",
      description: "Consistency is key! Practice daily to build streaks. The longer your streak, the more motivated you'll stay. View your streaks in the Analytics tab.",
      tips: ["Set daily reminders", "Even 15 minutes counts", "Don't break the chain!"]
    },
    {
      step: 4,
      title: "Use Analytics",
      icon: "bar-chart-outline",
      description: "Monitor your learning journey in the Analytics tab. See progress charts, total practice time, streak statistics, and skill comparisons to optimize your learning.",
      tips: ["Review weekly progress", "Identify patterns", "Adjust goals as needed"]
    },
    {
      step: 5,
      title: "Join the Community",
      icon: "people-outline",
      description: "Share your skills publicly in the Community tab. Follow other learners, get inspired by their progress, and add their skills to your collection.",
      tips: ["Share your journey", "Learn from others", "Stay motivated together"]
    }
  ];

  const HelpItem = ({ 
    title, 
    subtitle, 
    icon, 
    onPress,
    isLast = false,
  }: {
    title: string;
    subtitle: string;
    icon: string;
    onPress: () => void;
    isLast?: boolean;
  }) => (
    <TouchableOpacity style={[styles.helpItem, isLast && { borderBottomWidth: 0 }]} onPress={onPress}>
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
    index,
    isLast = false,
  }: {
    question: string;
    answer: string;
    index: number;
    isLast?: boolean;
  }) => {
    const isExpanded = expandedFAQ === index;
    
    return (
      <View style={[styles.faqItem, isLast && { borderBottomWidth: 0 }]}>
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

  const TutorialItem = ({
    tutorial,
    index,
    isLast = false,
  }: {
    tutorial: typeof tutorials[0];
    index: number;
    isLast?: boolean;
  }) => {
    const isExpanded = expandedTutorial === index;

    return (
      <View style={[styles.tutorialItem, isLast && { borderBottomWidth: 0 }]}>
        <TouchableOpacity
          style={styles.tutorialHeader}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setExpandedTutorial(isExpanded ? null : index);
          }}
        >
          <View style={styles.tutorialHeaderLeft}>
            <View style={styles.tutorialStepBadge}>
              <Text style={styles.tutorialStepText}>{tutorial.step}</Text>
            </View>
            <View style={styles.tutorialIcon}>
              <Ionicons name={tutorial.icon as any} size={24} color={themeColors.accent} />
            </View>
            <Text style={styles.tutorialTitle}>{tutorial.title}</Text>
          </View>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color={themeColors.textSecondary}
          />
        </TouchableOpacity>
        {isExpanded && (
          <Animated.View style={styles.tutorialContent}>
            <Text style={styles.tutorialDescription}>{tutorial.description}</Text>
            <View style={styles.tutorialTips}>
              <Text style={styles.tutorialTipsTitle}>💡 Pro Tips:</Text>
              {tutorial.tips.map((tip, idx) => (
                <View key={idx} style={styles.tutorialTip}>
                  <View style={styles.tutorialTipBullet} />
                  <Text style={styles.tutorialTipText}>{tip}</Text>
                </View>
              ))}
            </View>
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
      paddingTop: Spacing.xxl,
      paddingBottom: Spacing.xl,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.md,
    },
    backButton: {
      width: 44,
      height: 44,
      borderRadius: BorderRadius.round,
      backgroundColor: themeColors.backgroundSecondary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.md,
      shadowColor: themeColors.shadow.medium,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    headerTitle: {
      ...Typography.h1,
      color: themeColors.text,
      fontWeight: '700',
    },
    headerSubtitle: {
      ...Typography.body,
      color: themeColors.textSecondary,
      marginTop: Spacing.xs,
      opacity: 0.8,
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
      backgroundColor: themeColors.background,
      borderRadius: BorderRadius.xl,
      overflow: 'hidden',
      marginBottom: Spacing.md,
      shadowColor: themeColors.shadow.medium,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
      borderWidth: 1,
      borderColor: themeColors.border,
    },
    helpItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Spacing.lg,
      paddingHorizontal: Spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.borderSecondary,
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
      borderBottomColor: themeColors.borderSecondary,
      paddingHorizontal: Spacing.lg,
    },
    faqQuestion: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: Spacing.lg,
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
    infoSection: {
      backgroundColor: themeColors.backgroundSecondary,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      borderLeftWidth: 3,
      borderLeftColor: themeColors.info,
    },
    infoText: {
      ...Typography.bodySmall,
      color: themeColors.textSecondary,
      lineHeight: 20,
    },
    tutorialItem: {
      borderBottomWidth: 1,
      borderBottomColor: themeColors.borderSecondary,
    },
    tutorialHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: Spacing.lg,
      paddingHorizontal: Spacing.lg,
    },
    tutorialHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    tutorialStepBadge: {
      width: 32,
      height: 32,
      borderRadius: BorderRadius.round,
      backgroundColor: themeColors.accent,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.sm,
    },
    tutorialStepText: {
      ...Typography.body,
      color: '#ffffff',
      fontWeight: '700',
    },
    tutorialIcon: {
      width: 40,
      height: 40,
      borderRadius: BorderRadius.round,
      backgroundColor: themeColors.accent + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.md,
    },
    tutorialTitle: {
      ...Typography.body,
      color: themeColors.text,
      fontWeight: '600',
      flex: 1,
    },
    tutorialContent: {
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing.lg,
      paddingLeft: Spacing.xl + Spacing.lg,
    },
    tutorialDescription: {
      ...Typography.bodySmall,
      color: themeColors.textSecondary,
      lineHeight: 22,
      marginBottom: Spacing.lg,
    },
    tutorialTips: {
      backgroundColor: themeColors.backgroundSecondary,
      borderRadius: BorderRadius.md,
      padding: Spacing.md,
      borderLeftWidth: 3,
      borderLeftColor: themeColors.warning,
    },
    tutorialTipsTitle: {
      ...Typography.bodySmall,
      color: themeColors.text,
      fontWeight: '700',
      marginBottom: Spacing.sm,
    },
    tutorialTip: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginTop: Spacing.xs,
    },
    tutorialTipBullet: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: themeColors.warning,
      marginRight: Spacing.sm,
      marginTop: 6,
    },
    tutorialTipText: {
      ...Typography.bodySmall,
      color: themeColors.textSecondary,
      flex: 1,
      lineHeight: 20,
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
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>Help & Support</Text>
              <Text style={styles.headerSubtitle}>Get the help you need</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.sectionTitle}>Step-by-Step Tutorial</Text>
          
          <View style={styles.card}>
            {tutorials.map((tutorial, index) => (
              <TutorialItem
                key={index}
                tutorial={tutorial}
                index={index}
                isLast={index === tutorials.length - 1}
              />
            ))}
          </View>
        </Animated.View>

        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          
          <View style={styles.card}>
            {contactOptions.map((option, index) => (
              <HelpItem
                key={index}
                title={option.title}
                subtitle={option.subtitle}
                icon={option.icon}
                onPress={option.action}
                isLast={index === contactOptions.length - 1}
              />
            ))}
          </View>
        </Animated.View>

        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          
          <View style={styles.card}>
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                index={index}
                isLast={index === faqs.length - 1}
              />
            ))}
          </View>
        </Animated.View>

        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.infoSection}>
            <Text style={styles.infoText}>
              Can&apos;t find what you&apos;re looking for? Our support team is here to help! 
              We typically respond within 24 hours during business days.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </UniformLayout>
  );
}
