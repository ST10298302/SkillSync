// Enhanced Skills Context
// Integrates all new services: skill management, tutor, social, achievements, media, analytics

import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { AchievementService } from '../services/achievementService';
import { AnalyticsService, LearningPattern } from '../services/analyticsService';
import { ChallengeService } from '../services/challengeService';
import { MediaService } from '../services/mediaService';
import { SkillManagementService } from '../services/skillManagementService';
import { SocialService } from '../services/socialService';
import { TechniqueService } from '../services/techniqueService';
import { TutorService } from '../services/tutorService';
import {
    ArtifactFileType,
    Assignment,
    Notification,
    ReactionType,
    Skill,
    SkillArtifact,
    SkillChallenge,
    SkillComment,
    SkillMilestone,
    SkillResource,
    SkillTechnique,
    TutorStudent,
    UserAchievement,
    UserRole
} from '../utils/supabase-types';
import { useAuth } from './AuthContext';

// Extended context interface
interface EnhancedSkillsContextProps {
  // Core skill data
  skills: Skill[];
  currentSkill: Skill | null;
  loading: boolean;
  
  // Skill management
  createSkill: (skillData: any) => Promise<Skill>;
  updateSkill: (id: string, updates: any) => Promise<void>;
  deleteSkill: (id: string) => Promise<void>;
  setCurrentSkill: (skill: Skill | null) => void;
  refreshSkills: () => Promise<void>;
  getPublicSkills: () => Promise<Skill[]>;
  
  // Milestones
  milestones: SkillMilestone[];
  createMilestone: (milestoneData: any) => Promise<SkillMilestone>;
  completeMilestone: (milestoneId: string) => Promise<void>;
  getMilestones: (skillId: string) => Promise<void>;
  
  // Resources
  resources: SkillResource[];
  addResource: (resourceData: any) => Promise<SkillResource>;
  getResources: (skillId: string) => Promise<void>;
  deleteResource: (resourceId: string) => Promise<void>;
  
  // Artifacts
  artifacts: SkillArtifact[];
  uploadArtifact: (skillId: string, title: string, description: string, fileUri: string, fileType: ArtifactFileType) => Promise<SkillArtifact>;
  getArtifacts: (skillId: string) => Promise<void>;
  deleteArtifact: (artifactId: string) => Promise<void>;
  
  // Techniques
  techniques: SkillTechnique[];
  getTechniques: (skillId: string) => Promise<void>;
  addTechnique: (techniqueData: any) => Promise<SkillTechnique>;
  updateTechnique: (techniqueId: string, updates: any) => Promise<void>;
  deleteTechnique: (techniqueId: string) => Promise<void>;
  
  // Challenges
  challenges: SkillChallenge[];
  getChallenges: (skillId: string) => Promise<void>;
  addChallenge: (challengeData: any) => Promise<SkillChallenge>;
  updateChallenge: (challengeId: string, updates: any) => Promise<void>;
  deleteChallenge: (challengeId: string) => Promise<void>;
  
  // Comments
  comments: SkillComment[];
  createComment: (skillId: string, content: string, parentCommentId?: string) => Promise<SkillComment>;
  getComments: (skillId: string) => Promise<void>;
  
  // Reactions
  addReaction: (skillId: string, reactionType: ReactionType) => Promise<void>;
  removeReaction: (skillId: string) => Promise<void>;
  
  // Following
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
  isFollowing: (userId: string) => boolean;
  
  // Tutoring features
  isTutor: boolean;
  students: TutorStudent[];
  assignments: Assignment[];
  getTutorData: () => Promise<void>;
  enrollStudent: (studentId: string) => Promise<void>;
  
  // Achievements
  achievements: UserAchievement[];
  getAchievements: () => Promise<void>;
  
  // Analytics
  learningPatterns: LearningPattern[];
  insights: { insights: string[]; recommendations: string[] } | null;
  getAnalytics: (skillId?: string) => Promise<void>;
  
  // Notifications
  notifications: Notification[];
  unreadCount: number;
  getNotifications: () => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
}

const EnhancedSkillsContext = createContext<EnhancedSkillsContextProps | undefined>(undefined);

export const EnhancedSkillsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [currentSkill, setCurrentSkill] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Extended state
  const [milestones, setMilestones] = useState<SkillMilestone[]>([]);
  const [resources, setResources] = useState<SkillResource[]>([]);
  const [artifacts, setArtifacts] = useState<SkillArtifact[]>([]);
  const [techniques, setTechniques] = useState<SkillTechnique[]>([]);
  const [challenges, setChallenges] = useState<SkillChallenge[]>([]);
  const [comments, setComments] = useState<SkillComment[]>([]);
  const [students, setStudents] = useState<TutorStudent[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [learningPatterns, setLearningPatterns] = useState<LearningPattern[]>([]);
  const [insights, setInsights] = useState<{ insights: string[]; recommendations: string[] } | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const isTutor = user?.role === UserRole.TUTOR;

  // Core skill operations
  const refreshSkills = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      // Load basic skills using existing SupabaseService
      // This will be enhanced with new fields
    } catch (error) {
      console.error('Failed to refresh skills:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getPublicSkills = useCallback(async () => {
    if (!user) return [];
    
    try {
      // Query public skills with user information
      const { supabase } = await import('../utils/supabase');
      const { data, error } = await supabase
        .from('skills')
        .select(`
          *,
          users(
            id,
            name,
            email,
            profile_picture_url
          )
        `)
        .eq('visibility', 'public')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching public skills:', error);
        throw error;
      }
      
      // Map the database results to Skill type with default values and owner info
      return (data || []).map((skill: any) => ({
        ...skill,
        progress: skill.progress || 0,
        likes_count: skill.likes_count || 0,
        comments_count: skill.comments_count || 0,
        current_level: skill.current_level || 'beginner',
        visibility: skill.visibility || 'private',
        owner: skill.users || null, // Add owner information
      })) as any[];
    } catch (error) {
      console.error('Failed to get public skills:', error);
      return [];
    }
  }, [user]);

  const createSkill = async (skillData: any) => {
    if (!user) throw new Error('User not authenticated');
    
    const newSkill = await SkillManagementService.createSkill(skillData);
    setSkills(prev => [...prev, newSkill]);
    return newSkill;
  };

  const updateSkill = async (id: string, updates: any) => {
    await SkillManagementService.updateSkill(id, updates);
    setSkills(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteSkill = async (id: string) => {
    await SkillManagementService.deleteSkill(id);
    setSkills(prev => prev.filter(s => s.id !== id));
    if (currentSkill?.id === id) setCurrentSkill(null);
  };

  // Milestone operations
  const getMilestones = async (skillId: string) => {
    if (!skillId || typeof skillId !== 'string' || skillId === 'null') {
      console.warn('getMilestones: Invalid skillId', skillId);
      return;
    }
    try {
      const data = await SkillManagementService.getMilestones(skillId);
      setMilestones(data);
    } catch (error) {
      console.error('Failed to load milestones:', error);
      setMilestones([]);
    }
  };

  const createMilestone = async (milestoneData: any) => {
    const milestone = await SkillManagementService.createMilestone(milestoneData);
    setMilestones(prev => [...prev, milestone]);
    return milestone;
  };

  const completeMilestone = async (milestoneId: string) => {
    await SkillManagementService.completeMilestone(milestoneId);
    setMilestones(prev => 
      prev.map(m => m.id === milestoneId ? { ...m, is_completed: true } : m)
    );
  };

  // Resource operations
  const getResources = async (skillId: string) => {
    if (!skillId || typeof skillId !== 'string' || skillId === 'null') {
      console.warn('getResources: Invalid skillId', skillId);
      return;
    }
    try {
      const data = await SkillManagementService.getResources(skillId);
      setResources(data);
    } catch (error) {
      console.error('Failed to load resources:', error);
      setResources([]);
    }
  };

  const addResource = async (resourceData: any) => {
    const resource = await SkillManagementService.addResource(resourceData);
    setResources(prev => [...prev, resource]);
    return resource;
  };

  // Artifact operations
  const getArtifacts = async (skillId: string) => {
    const data = await MediaService.getSkillArtifacts(skillId);
    setArtifacts(data);
  };

  const uploadArtifact = async (
    skillId: string,
    title: string,
    description: string,
    fileUri: string,
    fileType: ArtifactFileType
  ) => {
    const { url, thumbnailUrl } = await MediaService.uploadImage(fileUri);
    const artifact = await MediaService.createArtifact(
      skillId,
      title,
      description,
      url,
      fileType,
      thumbnailUrl
    );
    setArtifacts(prev => [...prev, artifact]);
    return artifact;
  };

  const deleteArtifact = async (artifactId: string) => {
    await MediaService.deleteArtifact(artifactId);
    setArtifacts(prev => prev.filter(a => a.id !== artifactId));
  };

  const deleteResource = async (resourceId: string) => {
    await SkillManagementService.deleteResource(resourceId);
    setResources(prev => prev.filter(r => r.id !== resourceId));
  };

  // Technique operations
  const getTechniques = async (skillId: string) => {
    if (!skillId || typeof skillId !== 'string' || skillId === 'null') {
      console.warn('getTechniques: Invalid skillId', skillId);
      return;
    }
    try {
      const data = await TechniqueService.getTechniques(skillId);
      setTechniques(data);
    } catch (error) {
      console.error('Failed to load techniques:', error);
      setTechniques([]);
    }
  };

  const addTechnique = async (techniqueData: any) => {
    const technique = await TechniqueService.createTechnique(techniqueData);
    setTechniques(prev => [...prev, technique]);
    return technique;
  };

  const updateTechnique = async (techniqueId: string, updates: any) => {
    await TechniqueService.updateTechnique(techniqueId, updates);
    setTechniques(prev => prev.map(t => t.id === techniqueId ? { ...t, ...updates } : t));
  };

  const deleteTechnique = async (techniqueId: string) => {
    await TechniqueService.deleteTechnique(techniqueId);
    setTechniques(prev => prev.filter(t => t.id !== techniqueId));
  };

  // Challenge operations
  const getChallenges = async (skillId: string) => {
    if (!skillId || typeof skillId !== 'string' || skillId === 'null') {
      console.warn('getChallenges: Invalid skillId', skillId);
      return;
    }
    try {
      const data = await ChallengeService.getChallenges(skillId);
      setChallenges(data);
    } catch (error) {
      console.error('Failed to load challenges:', error);
      setChallenges([]);
    }
  };

  const addChallenge = async (challengeData: any) => {
    const challenge = await ChallengeService.createChallenge(challengeData);
    setChallenges(prev => [...prev, challenge]);
    return challenge;
  };

  const updateChallenge = async (challengeId: string, updates: any) => {
    await ChallengeService.updateChallenge(challengeId, updates);
    setChallenges(prev => prev.map(c => c.id === challengeId ? { ...c, ...updates } : c));
  };

  const deleteChallenge = async (challengeId: string) => {
    await ChallengeService.deleteChallenge(challengeId);
    setChallenges(prev => prev.filter(c => c.id !== challengeId));
  };

  // Comment operations
  const getComments = async (skillId: string) => {
    if (!skillId || typeof skillId !== 'string' || skillId === 'null') {
      console.warn('getComments: Invalid skillId', skillId);
      return;
    }
    try {
      const data = await SocialService.getSkillComments(skillId);
      setComments(data);
    } catch (error) {
      console.error('Failed to load comments:', error);
      setComments([]);
    }
  };

  const createComment = async (skillId: string, content: string, parentCommentId?: string) => {
    const comment = await SocialService.createComment({
      skill_id: skillId,
      content,
      parent_comment_id: parentCommentId,
    });
    setComments(prev => [...prev, comment]);
    return comment;
  };

  // Reaction operations
  const addReaction = async (skillId: string, reactionType: ReactionType) => {
    await SocialService.addSkillReaction({ skill_id: skillId, reaction_type: reactionType });
  };

  const removeReaction = async (skillId: string) => {
    await SocialService.removeSkillReaction(skillId);
  };

  // Following operations
  const followUser = async (userId: string) => {
    if (!user) throw new Error('User not authenticated');
    await SocialService.followUser(userId);
  };

  const unfollowUser = async (userId: string) => {
    if (!user) throw new Error('User not authenticated');
    await SocialService.unfollowUser(userId);
  };

  const isFollowing = (userId: string): boolean => {
    // TODO: Implement proper following status check
    // For now, return false as we don't have this data loaded
    return false;
  };

  // Tutor operations
  const getTutorData = async () => {
    if (!user || !isTutor) return;
    
    const [tutorStudents, tutorAssignments] = await Promise.all([
      TutorService.getStudents(user.id),
      TutorService.getTutorAssignments(user.id),
    ]);
    
    setStudents(tutorStudents);
    setAssignments(tutorAssignments);
  };

  const enrollStudent = async (studentId: string) => {
    if (!user || !isTutor) throw new Error('Must be a tutor to enroll students');
    const enrollment = await TutorService.enrollStudent(user.id, studentId);
    setStudents(prev => [...prev, enrollment]);
  };

  // Achievement operations
  const getAchievements = async () => {
    if (!user) return;
    const data = await AchievementService.getUserAchievements(user.id);
    setAchievements(data);
  };

  // Analytics operations
  const getAnalytics = async (skillId?: string) => {
    if (!user) return;
    
    if (skillId) {
      // Get analytics for specific skill
      const velocity = await AnalyticsService.calculateVelocity(skillId);
      const consistency = await AnalyticsService.calculateConsistency(skillId);
      const plateau = await AnalyticsService.detectPlateau(skillId);
      // Update patterns
    } else {
      // Get overall analytics
      const [patterns, insightsData] = await Promise.all([
        AnalyticsService.analyzeLearningPatterns(user.id),
        AnalyticsService.getPersonalizedInsights(user.id),
      ]);
      setLearningPatterns(patterns);
      setInsights(insightsData);
    }
  };

  // Notification operations
  const getNotifications = async () => {
    if (!user) return;
    
    const [notifData, count] = await Promise.all([
      SocialService.getNotifications(user.id),
      SocialService.getUnreadCount(user.id),
    ]);
    
    setNotifications(notifData);
    setUnreadCount(count);
  };

  const markNotificationAsRead = async (notificationId: string) => {
    await SocialService.markAsRead(notificationId);
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Initial data load
  useEffect(() => {
    if (!user) return;
    
    refreshSkills();
    getAchievements();
    getNotifications();
    
    if (isTutor) {
      getTutorData();
    }
  }, [user]);

  const value: EnhancedSkillsContextProps = {
    skills,
    currentSkill,
    loading,
    createSkill,
    updateSkill,
    deleteSkill,
    setCurrentSkill,
    refreshSkills,
    getPublicSkills,
    milestones,
    createMilestone,
    completeMilestone,
    getMilestones,
    resources,
    addResource,
    getResources,
    deleteResource,
    artifacts,
    uploadArtifact,
    getArtifacts,
    deleteArtifact,
    techniques,
    getTechniques,
    addTechnique,
    updateTechnique,
    deleteTechnique,
    challenges,
    getChallenges,
    addChallenge,
    updateChallenge,
    deleteChallenge,
    comments,
    createComment,
    getComments,
    addReaction,
    removeReaction,
    followUser,
    unfollowUser,
    isFollowing,
    isTutor,
    students,
    assignments,
    getTutorData,
    enrollStudent,
    achievements,
    getAchievements,
    learningPatterns,
    insights,
    getAnalytics,
    notifications,
    unreadCount,
    getNotifications,
    markNotificationAsRead,
  };

  return (
    <EnhancedSkillsContext.Provider value={value}>
      {children}
    </EnhancedSkillsContext.Provider>
  );
};

export const useEnhancedSkills = () => {
  const context = useContext(EnhancedSkillsContext);
  if (context === undefined) {
    throw new Error('useEnhancedSkills must be used within an EnhancedSkillsProvider');
  }
  return context;
};
