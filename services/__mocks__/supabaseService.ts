// Manual Jest mock for SupabaseService used in tests

type SupabaseSkillRow = {
  id: string;
  name: string;
  description: string;
  created_at: string;
  progress: number;
  total_hours: number;
  streak: number;
  last_updated: string | null;
  user_id: string;
  skill_entries: { id: string; content: string; hours: number; created_at: string }[];
};

const memory = {
  skillsByUser: new Map<string, SupabaseSkillRow[]>(),
  entriesBySkill: new Map<string, { id: string; content: string; hours: number; created_at: string }[]>(),
  progressBySkill: new Map<string, { id: string; progress: number; created_at: string; notes?: string }[]>(),
};

export function __reset() {
  memory.skillsByUser.clear();
  memory.entriesBySkill.clear();
  memory.progressBySkill.clear();
}

function getUserSkills(userId: string): SupabaseSkillRow[] {
  if (!memory.skillsByUser.has(userId)) memory.skillsByUser.set(userId, []);
  return memory.skillsByUser.get(userId)!;
}

function findSkillById(skillId: string): { userId: string; skill: SupabaseSkillRow } | null {
  for (const [userId, list] of memory.skillsByUser.entries()) {
    const found = list.find((s) => s.id === skillId);
    if (found) return { userId, skill: found };
  }
  return null;
}

export class SupabaseService {
  // Auth mocks
  static async signUp(email: string, _password: string, name?: string) {
    return { user: { id: 'u1', email, user_metadata: { name } } } as any;
  }

  static async signIn(email: string, _password: string) {
    return { user: { id: 'u1', email } } as any;
  }

  static async signOut() {
    return undefined;
  }

  static async getCurrentUser() {
    return null;
  }

  // Skills
  static async getSkills(userId: string) {
    return getUserSkills(userId);
  }

  static async createSkill(skill: { name: string; description?: string; progress: number; user_id: string; total_hours: number; streak: number }) {
    const id = `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const created_at = new Date().toISOString();
    const row: SupabaseSkillRow = {
      id,
      name: skill.name,
      description: skill.description || '',
      created_at,
      progress: skill.progress,
      total_hours: skill.total_hours,
      streak: skill.streak,
      last_updated: null,
      user_id: skill.user_id,
      skill_entries: [],
    };
    const list = getUserSkills(skill.user_id);
    list.push(row);
    return row as any;
  }

  static async updateSkill(skillId: string, updates: Partial<SupabaseSkillRow>) {
    const found = findSkillById(skillId);
    if (!found) return undefined as any;
    Object.assign(found.skill, updates);
    return found.skill as any;
  }

  static async deleteSkill(skillId: string) {
    const found = findSkillById(skillId);
    if (!found) return;
    const list = getUserSkills(found.userId);
    const idx = list.findIndex((s) => s.id === skillId);
    if (idx >= 0) list.splice(idx, 1);
  }

  // Entries
  static async createSkillEntry(entry: { skill_id: string; content: string; hours: number }) {
    const id = `e_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const created_at = new Date().toISOString();
    const rec = { id, content: entry.content, hours: entry.hours, created_at };
    const arr = memory.entriesBySkill.get(entry.skill_id) || [];
    arr.push(rec);
    memory.entriesBySkill.set(entry.skill_id, arr);

    const found = findSkillById(entry.skill_id);
    if (found) {
      found.skill.skill_entries.push(rec);
      found.skill.last_updated = created_at;
    }
    return rec as any;
  }

  // Progress
  static async getProgressUpdates(skillId: string) {
    return memory.progressBySkill.get(skillId) || [];
  }

  static async createProgressUpdate(update: { skill_id: string; progress: number; notes?: string }) {
    const id = `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const created_at = new Date().toISOString();
    const rec = { id, progress: update.progress, created_at, notes: update.notes };
    const arr = memory.progressBySkill.get(update.skill_id) || [];
    arr.push(rec);
    memory.progressBySkill.set(update.skill_id, arr);

    const found = findSkillById(update.skill_id);
    if (found) {
      found.skill.progress = update.progress;
      found.skill.last_updated = created_at;
    }
    return rec as any;
  }
}


