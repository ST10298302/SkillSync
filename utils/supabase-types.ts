// SkillSync Platform Enhancement - TypeScript Types
// Comprehensive type definitions for all database tables and entities

// ============================================
// ENUMS
// ============================================

export enum UserRole {
  LEARNER = 'learner',
  TUTOR = 'tutor',
  ADMIN = 'admin',
}

export enum SkillVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  STUDENTS = 'students',
  TUTOR = 'tutor',
}

export enum ReactionType {
  LIKE = 'like',
  LOVE = 'love',
  CELEBRATE = 'celebrate',
  INSIGHTFUL = 'insightful',
  MOTIVATE = 'motivate',
}

export enum SkillLevelType {
  BEGINNER = 'beginner',
  NOVICE = 'novice',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

export enum NotificationType {
  COMMENT = 'comment',
  LIKE = 'like',
  MENTION = 'mention',
  ASSIGNMENT = 'assignment',
  MILESTONE = 'milestone',
  ACHIEVEMENT = 'achievement',
  SYSTEM = 'system',
}

export enum AchievementCategory {
  CONSISTENCY = 'consistency',
  MILESTONE = 'milestone',
  MASTERY = 'mastery',
  SOCIAL = 'social',
  EXPLORER = 'explorer',
}

export enum ResourceType {
  LINK = 'link',
  DOCUMENT = 'document',
  VIDEO = 'video',
  ARTICLE = 'article',
}

export enum ArtifactFileType {
  IMAGE = 'image',
  PDF = 'pdf',
  DOCUMENT = 'document',
  VIDEO = 'video',
}

export enum AssignmentStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  OVERDUE = 'overdue',
}

// ============================================
// ENHANCED EXISTING TYPES
// ============================================

export interface User {
  id: string;
  email: string;
  name?: string;
  profile_picture_url?: string;
  role: UserRole;
  bio?: string;
  tutor_specializations?: string[];
  is_verified: boolean;
  premium_tier: string;
  followers_count: number;
  following_count: number;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  name: string;
  description?: string;
  progress: number;
  user_id: string;
  total_hours: number;
  streak: number;
  last_updated?: string;
  created_at: string;
  updated_at: string;
  
  // New fields
  category_id?: string;
  level_id?: string;
  visibility: SkillVisibility;
  is_certified: boolean;
  estimated_hours?: number;
  likes_count: number;
  comments_count: number;
  current_level: SkillLevelType;
  
  // Related data (populated via joins)
  category?: SkillCategory;
  level?: SkillLevel;
  milestones?: SkillMilestone[];
  resources?: SkillResource[];
  artifacts?: SkillArtifact[];
  techniques?: SkillTechnique[];
  challenges?: SkillChallenge[];
  dependencies?: SkillDependency[];
  comments?: SkillComment[];
  reactions?: SkillReaction[];
  skill_entries?: SkillEntry[];
  progress_updates?: ProgressUpdate[];
}

export interface SkillEntry {
  id: string;
  skill_id: string;
  content: string;
  hours: number;
  created_at: string;
}

export interface ProgressUpdate {
  id: string;
  skill_id: string;
  progress: number;
  notes?: string;
  created_at: string;
}

// ============================================
// NEW CORE TYPES
// ============================================

export interface SkillCategory {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  icon?: string;
  created_at: string;
  parent?: SkillCategory;
  children?: SkillCategory[];
}

export interface SkillLevel {
  id: string;
  skill_id: string;
  level_type: SkillLevelType;
  name: string;
  description?: string;
  min_progress: number;
  max_progress: number;
  required_hours: number;
  created_at: string;
}

export interface SkillMilestone {
  id: string;
  skill_id: string;
  title: string;
  description?: string;
  order_index: number;
  is_completed: boolean;
  completed_at?: string;
  completed_by?: string;
  created_at: string;
  updated_at: string;
}

export interface SkillDependency {
  id: string;
  skill_id: string;
  prerequisite_skill_id: string;
  is_required: boolean;
  created_at: string;
  prerequisite_skill?: Skill;
}

export interface SkillResource {
  id: string;
  skill_id: string;
  title: string;
  description?: string;
  resource_type: ResourceType;
  url?: string;
  file_url?: string;
  added_by?: string;
  created_at: string;
  added_by_user?: User;
}

export interface SkillArtifact {
  id: string;
  skill_id: string;
  title: string;
  description?: string;
  file_type: ArtifactFileType;
  file_url: string;
  thumbnail_url?: string;
  file_size?: number;
  uploaded_by?: string;
  created_at: string;
  uploaded_by_user?: User;
}

export interface SkillTechnique {
  id: string;
  skill_id: string;
  technique_name: string;
  description?: string;
  practice_hours: number;
  mastery_level: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SkillChallenge {
  id: string;
  skill_id: string;
  challenge_title: string;
  challenge_description?: string;
  solution?: string;
  is_resolved: boolean;
  resolved_at?: string;
  created_by?: string;
  created_at: string;
  created_by_user?: User;
}

// ============================================
// TUTOR-STUDENT SYSTEM
// ============================================

export interface TutorStudent {
  id: string;
  tutor_id: string;
  student_id: string;
  enrolled_at: string;
  status: string; // 'active', 'paused', 'completed'
  notes?: string;
  tutor?: User;
  student?: User;
}

export interface Assignment {
  id: string;
  tutor_id: string;
  student_id: string;
  skill_id: string;
  title: string;
  description?: string;
  due_date?: string;
  is_completed: boolean;
  completed_at?: string;
  feedback?: string;
  created_at: string;
  updated_at: string;
  tutor?: User;
  student?: User;
  skill?: Skill;
}

// ============================================
// SOCIAL FEATURES
// ============================================

export interface SkillComment {
  id: string;
  skill_id: string;
  user_id: string;
  parent_comment_id?: string;
  content: string;
  mentions?: string[];
  edited: boolean;
  edited_at?: string;
  likes_count: number;
  created_at: string;
  updated_at: string;
  user?: User;
  parent_comment?: SkillComment;
  replies?: SkillComment[];
}

export interface SkillReaction {
  id: string;
  skill_id: string;
  user_id: string;
  reaction_type: ReactionType;
  created_at: string;
  user?: User;
}

export interface CommentReaction {
  id: string;
  comment_id: string;
  user_id: string;
  reaction_type: ReactionType;
  created_at: string;
  user?: User;
}

export interface UserFollow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
  follower?: User;
  following?: User;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message?: string;
  related_skill_id?: string;
  related_user_id?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  related_skill?: Skill;
  related_user?: User;
}

// ============================================
// GAMIFICATION
// ============================================

export interface Achievement {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  category: AchievementCategory;
  requirements: Record<string, any>; // JSONB
  rarity: string; // 'common', 'rare', 'epic', 'legendary'
  points: number;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  progress: number;
  is_unlocked: boolean;
  unlocked_at?: string;
  created_at: string;
  achievement?: Achievement;
  user?: User;
}

export interface LearningPath {
  id: string;
  title: string;
  description?: string;
  created_by?: string;
  is_public: boolean;
  skill_count: number;
  estimated_hours?: number;
  created_at: string;
  updated_at: string;
  creator?: User;
  skills?: LearningPathSkill[];
}

export interface LearningPathSkill {
  id: string;
  path_id: string;
  skill_id: string;
  order_index: number;
  is_required: boolean;
  created_at: string;
  skill?: Skill;
}

// ============================================
// HELPER TYPES
// ============================================

export interface SkillWithDetails extends Skill {
  category?: SkillCategory;
  level?: SkillLevel;
  milestones?: SkillMilestone[];
  resources?: SkillResource[];
  artifacts?: SkillArtifact[];
  comments?: SkillComment[];
  reactions?: SkillReaction[];
}

export interface UserWithRole extends User {
  role: UserRole;
  is_tutor?: boolean;
  is_admin?: boolean;
}

export interface TutorWithStudents extends User {
  role: UserRole.TUTOR;
  students?: TutorStudent[];
  student_count?: number;
}

export interface StudentWithTutor extends User {
  role: UserRole.LEARNER;
  tutors?: TutorStudent[];
  tutor_count?: number;
}

export interface SkillProgress {
  skill_id: string;
  progress: number;
  level: SkillLevelType;
  milestones_completed: number;
  milestones_total: number;
  hours_logged: number;
  estimated_hours?: number;
  completion_percentage: number;
}

export interface SkillInsight {
  skill_id: string;
  velocity: number; // Progress per day
  consistency: number; // Days with activity / total days
  plateau_detected: boolean;
  optimal_learning_time?: string;
  next_milestone?: SkillMilestone;
}

// ============================================
// REQUEST/RESPONSE TYPES
// ============================================

export interface CreateSkillRequest {
  name: string;
  description?: string;
  category_id?: string;
  visibility?: SkillVisibility;
  estimated_hours?: number;
}

export interface CreateMilestoneRequest {
  skill_id: string;
  title: string;
  description?: string;
  order_index: number;
}

export interface CreateResourceRequest {
  skill_id: string;
  title: string;
  description?: string;
  resource_type: ResourceType;
  url?: string;
  file_url?: string;
}

export interface CreateAssignmentRequest {
  student_id: string;
  skill_id: string;
  title: string;
  description?: string;
  due_date?: string;
}

export interface CreateCommentRequest {
  skill_id: string;
  content: string;
  parent_comment_id?: string;
  mentions?: string[];
}

export interface AddReactionRequest {
  skill_id?: string;
  comment_id?: string;
  reaction_type: ReactionType;
}

export interface UpdateSkillRequest {
  name?: string;
  description?: string;
  visibility?: SkillVisibility;
  estimated_hours?: number;
  category_id?: string;
}

// ============================================
// AGGREGATION TYPES
// ============================================

export interface SkillStatistics {
  total_skills: number;
  completed_skills: number;
  in_progress_skills: number;
  total_hours: number;
  average_progress: number;
  current_streak: number;
  longest_streak: number;
}

export interface UserStatistics extends SkillStatistics {
  achievements_unlocked: number;
  total_likes_received: number;
  total_comments_written: number;
  followers_count: number;
  following_count: number;
}

export interface TutorStatistics {
  total_students: number;
  active_assignments: number;
  completed_assignments: number;
  average_student_progress: number;
}
