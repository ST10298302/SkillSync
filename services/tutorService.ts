// Tutor Service
// Handles tutor-student relationships, assignments, and student management

import { supabase } from '../utils/supabase';
import {
    Assignment,
    CreateAssignmentRequest,
    Skill,
    TutorStudent,
    User,
    UserRole,
} from '../utils/supabase-types';

export class TutorService {
  // ============================================
  // TUTOR-STUDENT RELATIONSHIPS
  // ============================================

  /**
   * Enroll a student with a tutor
   */
  static async enrollStudent(
    tutorId: string,
    studentId: string,
    notes?: string
  ): Promise<TutorStudent> {
    // Verify tutor role
    const { data: tutor } = await supabase
      .from('users')
      .select('role')
      .eq('id', tutorId)
      .single();

    if (!tutor || tutor.role !== UserRole.TUTOR) {
      throw new Error('User is not a tutor');
    }

    const { data, error } = await supabase
      .from('tutor_students')
      .insert({
        tutor_id: tutorId,
        student_id: studentId,
        status: 'active',
        notes: notes,
      })
      .select('*, tutor: tutor_id(*), student: student_id(*)')
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Remove a student enrollment
   */
  static async removeStudent(tutorId: string, studentId: string): Promise<void> {
    const { error } = await supabase
      .from('tutor_students')
      .delete()
      .eq('tutor_id', tutorId)
      .eq('student_id', studentId);

    if (error) throw error;
  }

  /**
   * Get all students for a tutor
   */
  static async getStudents(tutorId: string): Promise<TutorStudent[]> {
    const { data, error } = await supabase
      .from('tutor_students')
      .select('*, student: student_id(*)')
      .eq('tutor_id', tutorId)
      .order('enrolled_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get all tutors for a student
   */
  static async getTutors(studentId: string): Promise<TutorStudent[]> {
    const { data, error } = await supabase
      .from('tutor_students')
      .select('*, tutor: tutor_id(*)')
      .eq('student_id', studentId)
      .order('enrolled_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Update student enrollment status
   */
  static async updateStudentStatus(
    tutorId: string,
    studentId: string,
    status: 'active' | 'paused' | 'completed'
  ): Promise<void> {
    const { error } = await supabase
      .from('tutor_students')
      .update({ status })
      .eq('tutor_id', tutorId)
      .eq('student_id', studentId);

    if (error) throw error;
  }

  /**
   * Check if a user is a tutor's student
   */
  static async isStudentOfTutor(studentId: string, tutorId: string): Promise<boolean> {
    const { data } = await supabase
      .from('tutor_students')
      .select('id')
      .eq('student_id', studentId)
      .eq('tutor_id', tutorId)
      .eq('status', 'active')
      .single();

    return !!data;
  }

  // ============================================
  // ASSIGNMENTS
  // ============================================

  /**
   * Create an assignment for a student
   */
  static async createAssignment(
    tutorId: string,
    request: CreateAssignmentRequest
  ): Promise<Assignment> {
    // Verify tutor owns the assignment
    const { error } = await supabase.from('assignments').insert({
      tutor_id: tutorId,
      student_id: request.student_id,
      skill_id: request.skill_id,
      title: request.title,
      description: request.description,
      due_date: request.due_date,
      is_completed: false,
    });

    if (error) throw error;

    // Return the created assignment
    const { data } = await supabase
      .from('assignments')
      .select('*, skill: skill_id(*), student: student_id(*)')
      .eq('tutor_id', tutorId)
      .eq('student_id', request.student_id)
      .eq('skill_id', request.skill_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!data) throw new Error('Failed to retrieve created assignment');
    return data;
  }

  /**
   * Get all assignments for a tutor
   */
  static async getTutorAssignments(tutorId: string): Promise<Assignment[]> {
    const { data, error } = await supabase
      .from('assignments')
      .select('*, skill: skill_id(*), student: student_id(*)')
      .eq('tutor_id', tutorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get all assignments for a student
   */
  static async getStudentAssignments(studentId: string): Promise<Assignment[]> {
    const { data, error } = await supabase
      .from('assignments')
      .select('*, skill: skill_id(*), tutor: tutor_id(*)')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get pending assignments for a student
   */
  static async getPendingAssignments(studentId: string): Promise<Assignment[]> {
    const { data, error } = await supabase
      .from('assignments')
      .select('*, skill: skill_id(*), tutor: tutor_id(*)')
      .eq('student_id', studentId)
      .eq('is_completed', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Mark an assignment as completed
   */
  static async completeAssignment(assignmentId: string): Promise<void> {
    const { error } = await supabase
      .from('assignments')
      .update({
        is_completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq('id', assignmentId);

    if (error) throw error;
  }

  /**
   * Add feedback to a completed assignment
   */
  static async addFeedback(assignmentId: string, feedback: string): Promise<void> {
    const { error } = await supabase
      .from('assignments')
      .update({
        feedback,
        updated_at: new Date().toISOString(),
      })
      .eq('id', assignmentId);

    if (error) throw error;
  }

  /**
   * Delete an assignment
   */
  static async deleteAssignment(assignmentId: string): Promise<void> {
    const { error } = await supabase
      .from('assignments')
      .delete()
      .eq('id', assignmentId);

    if (error) throw error;
  }

  // ============================================
  // STUDENT PROGRESS MONITORING
  // ============================================

  /**
   * Get overall progress statistics for a tutor's students
   */
  static async getTutorStatistics(tutorId: string): Promise<{
    total_students: number;
    active_students: number;
    total_assignments: number;
    completed_assignments: number;
    average_progress: number;
  }> {
    // Get student count
    const { data: students } = await supabase
      .from('tutor_students')
      .select('id, status')
      .eq('tutor_id', tutorId);

    const total_students = students?.length || 0;
    const active_students = students?.filter(s => s.status === 'active').length || 0;

    // Get assignment statistics
    const { data: assignments } = await supabase
      .from('assignments')
      .select('is_completed')
      .eq('tutor_id', tutorId);

    const total_assignments = assignments?.length || 0;
    const completed_assignments = assignments?.filter(a => a.is_completed).length || 0;

    // Calculate average student progress
    const studentIds = students?.map(s => s.student_id) || [];
    let average_progress = 0;

    if (studentIds.length > 0) {
      const { data: skills } = await supabase
        .from('skills')
        .select('progress')
        .in('user_id', studentIds);

      const skills_list = skills || [];
      if (skills_list.length > 0) {
        average_progress =
          skills_list.reduce((sum, skill) => sum + skill.progress, 0) / skills_list.length;
      }
    }

    return {
      total_students,
      active_students,
      total_assignments,
      completed_assignments,
      average_progress: Math.round(average_progress),
    };
  }

  /**
   * Get progress details for a specific student
   */
  static async getStudentProgress(tutorId: string, studentId: string): Promise<{
    student: User;
    skills: Skill[];
    assignments: Assignment[];
    overall_progress: number;
    total_hours: number;
  }> {
    // Verify tutor-student relationship
    const isStudent = await this.isStudentOfTutor(studentId, tutorId);
    if (!isStudent) {
      throw new Error('Student is not enrolled with this tutor');
    }

    // Get student info
    const { data: student } = await supabase
      .from('users')
      .select('*')
      .eq('id', studentId)
      .single();

    if (!student) throw new Error('Student not found');

    // Get student skills
    const { data: skills } = await supabase
      .from('skills')
      .select('*')
      .eq('user_id', studentId)
      .order('created_at', { ascending: false });

    // Get assignments
    const assignments = await this.getStudentAssignments(studentId);

    // Calculate overall progress
    const skills_list = skills || [];
    const overall_progress =
      skills_list.length > 0
        ? Math.round(skills_list.reduce((sum, s) => sum + s.progress, 0) / skills_list.length)
        : 0;

    // Calculate total hours
    const total_hours = skills_list.reduce((sum, s) => sum + (s.total_hours || 0), 0);

    return {
      student,
      skills: skills || [],
      assignments,
      overall_progress,
      total_hours,
    };
  }

  /**
   * Get all students with their recent activity
   */
  static async getStudentsWithActivity(tutorId: string): Promise<
    Array<{
      student: User;
      recent_activity: string;
      assignment_count: number;
      completed_assignments: number;
    }>
  > {
    const students = await this.getStudents(tutorId);

    const studentsWithActivity = await Promise.all(
      students.map(async (enrollment) => {
        const studentId = enrollment.student_id;

        // Get assignment counts
        const assignments = await this.getStudentAssignments(studentId);
        const assignment_count = assignments.length;
        const completed_assignments = assignments.filter(a => a.is_completed).length;

        // Get most recent activity
        const { data: recentSkill } = await supabase
          .from('skills')
          .select('last_updated')
          .eq('user_id', studentId)
          .order('last_updated', { ascending: false })
          .limit(1)
          .single();

        let recent_activity = 'No recent activity';
        if (recentSkill?.last_updated) {
          const daysSince = Math.floor(
            (Date.now() - new Date(recentSkill.last_updated).getTime()) / (1000 * 60 * 60 * 24)
          );
          recent_activity =
            daysSince === 0 ? 'Today' : daysSince === 1 ? 'Yesterday' : `${daysSince} days ago`;
        }

        return {
          student: enrollment.student as User,
          recent_activity,
          assignment_count,
          completed_assignments,
        };
      })
    );

    return studentsWithActivity;
  }

  /**
   * Search for potential students by email
   */
  static async searchStudentsByEmail(query: string): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .ilike('email', `%${query}%`)
      .eq('role', UserRole.LEARNER)
      .limit(10);

    if (error) throw error;
    return data || [];
  }
}
