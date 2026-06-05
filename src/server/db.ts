/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { 
  User, Opportunity, Team, Task, DailyCheckin, WeeklyReport, 
  Notification, Memory, ChatMessage, Conversation, UserPreference, ActivityLog 
} from '../types.js';
import { 
  SEED_OPPORTUNITIES, SEED_TEAMS, SEED_TASKS_CONTAINER, 
  SEED_DAILY_CHECKINS, SEED_WEEKLY_REPORTS, SEED_NOTIFICATIONS, 
  SEED_MEMORIES, SEED_USER_PREFERENCE, SEED_ACTIVITY_LOGS 
} from '../seedData.js';

interface DBState {
  users: User[];
  passwords: Record<string, string>; // userId -> password (stored plain or simple hash for demo purposes)
  opportunities: Opportunity[];
  teams: Team[];
  tasks: Task[];
  dailyCheckins: DailyCheckin[];
  weeklyReports: WeeklyReport[];
  notifications: Notification[];
  memories: Memory[];
  conversations: Record<string, ChatMessage[]>; // userId -> messages
  userPreferences: Record<string, UserPreference>; // userId -> prefs
  activityLogs: ActivityLog[];
}

const DB_FILE_PATH = join(process.cwd(), 'database.json');
const DEFAULT_USER_ID = 'demo-user';

type md5OrString = string;

class Database {
  private state: DBState = {
    users: [],
    passwords: {},
    opportunities: [],
    teams: [],
    tasks: [],
    dailyCheckins: [],
    weeklyReports: [],
    notifications: [],
    memories: [],
    conversations: {},
    userPreferences: {},
    activityLogs: []
  };

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (existsSync(DB_FILE_PATH)) {
        const fileContent = readFileSync(DB_FILE_PATH, 'utf-8');
        this.state = JSON.parse(fileContent);
        
        // Detect if old hardcoded/default user exists or if the new demo user is missing
        const hasOldUser = this.state.users.some(u => u.id === 'demo-user-123' || u.email === 'shivi14112007@gmail.com');
        const hasNewUser = this.state.users.some(u => u.id === 'demo-user');
        
        if (hasOldUser || !hasNewUser) {
          console.log('Detected old user data or missing new demo user. Resetting database with seed data...');
          this.resetWithSeedData();
        } else {
          console.log('Database loaded successfully with', this.state.opportunities.length, 'opportunities.');
        }
      } else {
        console.log('Database file not found, initializing with seed data...');
        this.resetWithSeedData();
      }
    } catch (e) {
      console.error('Failed to load database, initializing empty', e);
      this.resetWithSeedData();
    }
  }

  private save() {
    try {
      writeFileSync(DB_FILE_PATH, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write database file', e);
    }
  }

  public resetWithSeedData() {
    this.state = {
      users: [
        {
          id: DEFAULT_USER_ID,
          email: 'demo@bloodconnect.ai',
          fullName: 'Demo User',
          academicLevel: 'Demo',
          major: 'BloodConnect Intelligence',
          university: 'Demo Organization',
          bio: 'Demo account for showcasing all platform features during presentations and judging sessions.',
          skills: 'Donor Management, Campaign Analytics, Emergency Requests, AI Recommendations'
        }
      ],
      passwords: {
        [DEFAULT_USER_ID]: 'password123'
      },
      opportunities: [...SEED_OPPORTUNITIES],
      teams: [...SEED_TEAMS],
      tasks: [...SEED_TASKS_CONTAINER],
      dailyCheckins: [...SEED_DAILY_CHECKINS],
      weeklyReports: [...SEED_WEEKLY_REPORTS],
      notifications: [...SEED_NOTIFICATIONS],
      memories: [...SEED_MEMORIES],
      conversations: {
        [DEFAULT_USER_ID]: [
          { id: 'msg-1', sender: 'ai', text: 'Hello Demo User! I am your AI Student Copilot. I have loaded your workspace commitments, deadlines, and teams. How can I assist you today?', createdAt: new Date().toISOString() }
        ]
      },
      userPreferences: {
        [DEFAULT_USER_ID]: { ...SEED_USER_PREFERENCE }
      },
      activityLogs: [...SEED_ACTIVITY_LOGS]
    };
    this.save();
    console.log('Database seeded successfully.');
  }

  // --- Users & Auth ---
  public getUsers() {
    return this.state.users;
  }

  public registerUser(email: string, password: md5OrString, fullName: string): { user: User; error?: string } {
    const normalizedEmail = email.toLowerCase().trim();
    const existing = this.state.users.find(u => u.email.toLowerCase() === normalizedEmail);
    if (existing) {
      return { user: null as any, error: 'User already exists with this email address.' };
    }
    const id = `user-${Math.random().toString(36).substr(2, 9)}`;
    const newUser: User = { id, email: normalizedEmail, fullName };
    this.state.users.push(newUser);
    this.state.passwords[id] = password;
    this.state.userPreferences[id] = {
      userId: id,
      notificationsEnabled: true,
      targetOpportunityTypes: ['Hackathon', 'Fellowship', 'Internship', 'Competition'],
      weeklyCochingDay: 'Sunday'
    };
    this.state.conversations[id] = [
      { id: `msg-welcome-${id}`, sender: 'ai', text: `Hi ${fullName}! Welcome to your Student Copilot. I have generated a fresh space for you. Try telling me or writing "I joined ETH London today" to see my memory engine extract and catalog it immediately!`, createdAt: new Date().toISOString() }
    ];
    this.logActivity(id, 'User Registered', `Account created successfully for ${email}`);
    this.save();
    return { user: newUser };
  }

  public loginUser(email: string, password: md5OrString): { user: User; error?: string } {
    const normalizedEmail = email.toLowerCase().trim();
    const user = this.state.users.find(u => u.email.toLowerCase() === normalizedEmail);
    if (!user) {
      return { user: null as any, error: 'Invalid credentials. User not found.' };
    }
    if (this.state.passwords[user.id] !== password) {
      return { user: null as any, error: 'Invalid credentials. Password incorrect.' };
    }
    this.logActivity(user.id, 'User Logged In', `Session authenticated successfully.`);
    return { user };
  }

  public updatePassword(email: string, password: md5OrString): { success: boolean; error?: string } {
    const normalizedEmail = email.toLowerCase().trim();
    const user = this.state.users.find(u => u.email.toLowerCase() === normalizedEmail);
    if (!user) {
      return { success: false, error: 'Email address not found.' };
    }
    this.state.passwords[user.id] = password;
    this.logActivity(user.id, 'Password Reset', 'User reset account password.');
    this.save();
    return { success: true };
  }

  // --- Opportunities ---
  public getOpportunities(userId: string) {
    return this.state.opportunities.filter(o => o.userId === userId);
  }

  public getOpportunity(id: string) {
    return this.state.opportunities.find(o => o.id === id);
  }

  public createOpportunity(userId: string, opp: Omit<Opportunity, 'id' | 'userId' | 'createdAt'>): Opportunity {
    const newOpp: Opportunity = {
      ...opp,
      id: `opp-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      createdAt: new Date().toISOString()
    };
    this.state.opportunities.push(newOpp);
    this.logActivity(userId, 'Created Opportunity', `Registered ${newOpp.type}: ${newOpp.title}`);
    
    // Auto-create notification for new opportunity deadline
    this.createNotification(userId, {
      title: 'New Deadline Registered',
      message: `${newOpp.title} registered with deadline on ${newOpp.deadline}.`,
      type: 'deadline'
    });

    this.save();
    return newOpp;
  }

  public updateOpportunity(userId: string, id: string, opp: Partial<Omit<Opportunity, 'id' | 'userId' | 'createdAt'>>): Opportunity | null {
    const index = this.state.opportunities.findIndex(o => o.id === id);
    if (index === -1) return null;
    
    this.state.opportunities[index] = {
      ...this.state.opportunities[index],
      ...opp
    };
    this.logActivity(userId, 'Updated Opportunity', `Modified details of ${this.state.opportunities[index].title}`);
    this.save();
    return this.state.opportunities[index];
  }

  public deleteOpportunity(userId: string, id: string): boolean {
    const index = this.state.opportunities.findIndex(o => o.id === id);
    if (index === -1) return false;
    const title = this.state.opportunities[index].title;
    this.state.opportunities.splice(index, 1);
    this.logActivity(userId, 'Deleted Opportunity', `Removed opportunity: ${title}`);
    this.save();
    return true;
  }

  // --- Teams ---
  public getTeams(userId: string) {
    return this.state.teams.filter(t => t.userId === userId);
  }

  public createTeam(userId: string, team: Omit<Team, 'id' | 'userId'>): Team {
    const newTeam: Team = {
      ...team,
      id: `team-${Math.random().toString(36).substr(2, 9)}`,
      userId
    };
    this.state.teams.push(newTeam);
    if (newTeam.opportunityId) {
      const opp = this.state.opportunities.find(o => o.id === newTeam.opportunityId);
      if (opp) {
        opp.teamId = newTeam.id;
      }
    }
    this.logActivity(userId, 'Created Team', `Assembled team: ${newTeam.name}`);
    this.save();
    return newTeam;
  }

  public updateTeam(userId: string, id: string, team: Partial<Omit<Team, 'id' | 'userId'>>): Team | null {
    const index = this.state.teams.findIndex(t => t.id === id);
    if (index === -1) return null;
    this.state.teams[index] = {
      ...this.state.teams[index],
      ...team
    };
    this.logActivity(userId, 'Updated Team', `Modified team members or name for ${this.state.teams[index].name}`);
    this.save();
    return this.state.teams[index];
  }

  // --- Tasks ---
  public getTasks(userId: string, localDateStr: string = '2026-06-05') {
    const userTasks = this.state.tasks.filter(t => t.userId === userId);
    
    // Dynamic backlog movement check:
    // If a task meets the backlog criteria (dueDate < localDate && status !== 'Completed'),
    // we return it with that system behavior.
    return userTasks;
  }

  public createTask(userId: string, task: Omit<Task, 'id' | 'userId' | 'createdAt'>): Task {
    const newTask: Task = {
      ...task,
      id: `task-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      createdAt: new Date().toISOString()
    };
    this.state.tasks.push(newTask);
    this.logActivity(userId, 'Created Task', `Added task: ${newTask.title}`);
    this.save();
    return newTask;
  }

  public updateTask(userId: string, id: string, task: Partial<Omit<Task, 'id' | 'userId' | 'createdAt'>>): Task | null {
    const index = this.state.tasks.findIndex(t => t.id === id);
    if (index === -1) return null;
    this.state.tasks[index] = {
      ...this.state.tasks[index],
      ...task
    };
    this.logActivity(userId, 'Updated Task', `Modified status/details of: ${this.state.tasks[index].title}`);
    this.save();
    return this.state.tasks[index];
  }

  public deleteTask(userId: string, id: string): boolean {
    const index = this.state.tasks.findIndex(t => t.id === id);
    if (index === -1) return false;
    const title = this.state.tasks[index].title;
    this.state.tasks.splice(index, 1);
    this.logActivity(userId, 'Deleted Task', `Removed: ${title}`);
    this.save();
    return true;
  }

  // --- Daily Check-ins ---
  public getDailyCheckins(userId: string) {
    return this.state.dailyCheckins.filter(dc => dc.userId === userId);
  }

  public createDailyCheckin(userId: string, dc: Omit<DailyCheckin, 'id' | 'userId' | 'createdAt'>): DailyCheckin {
    const newDc: DailyCheckin = {
      ...dc,
      id: `dc-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      createdAt: new Date().toISOString()
    };
    this.state.dailyCheckins.push(newDc);
    this.logActivity(userId, 'Daily Check-in Completed', `Check-in recorded for ${newDc.date}`);
    this.save();
    return newDc;
  }

  // --- Weekly Reports ---
  public getWeeklyReports(userId: string) {
    return this.state.weeklyReports.filter(wr => wr.userId === userId);
  }

  public createWeeklyReport(userId: string, report: Omit<WeeklyReport, 'id' | 'userId' | 'createdAt'>): WeeklyReport {
    const newReport: WeeklyReport = {
      ...report,
      id: `wr-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      createdAt: new Date().toISOString()
    };
    this.state.weeklyReports.push(newReport);
    this.logActivity(userId, 'Weekly Review Generated', `Report compiled for week ending ${newReport.weekEndDate}`);
    
    this.createNotification(userId, {
      title: 'Weekly Report Ready',
      message: `Your Productivity Score this week is ${newReport.productivityScore}%. Read suggested focus areas.`,
      type: 'success'
    });

    this.save();
    return newReport;
  }

  public clearWeeklyReports(userId: string): void {
    this.state.weeklyReports = this.state.weeklyReports.filter(wr => wr.userId !== userId);
    this.save();
  }

  // --- Notifications ---
  public getNotifications(userId: string) {
    return this.state.notifications.filter(n => n.userId === userId);
  }

  public createNotification(userId: string, notif: Omit<Notification, 'id' | 'userId' | 'read' | 'createdAt'>): Notification {
    const newNotif: Notification = {
      ...notif,
      id: `notif-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      read: false,
      createdAt: new Date().toISOString()
    };
    this.state.notifications.push(newNotif);
    this.save();
    return newNotif;
  }

  public markNotificationRead(userId: string, id: string): boolean {
    const notif = this.state.notifications.find(n => n.id === id);
    if (!notif) return false;
    notif.read = true;
    this.save();
    return true;
  }

  public markAllNotificationsRead(userId: string): void {
    this.state.notifications
      .filter(n => n.userId === userId)
      .forEach(n => n.read = true);
    this.save();
  }

  // --- Memories ---
  public getMemories(userId: string) {
    return this.state.memories.filter(m => m.userId === userId);
  }

  public createMemory(userId: string, mem: Omit<Memory, 'id' | 'userId' | 'createdAt'>): Memory {
    const newMem: Memory = {
      ...mem,
      id: `mem-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      createdAt: new Date().toISOString()
    };
    this.state.memories.push(newMem);
    this.logActivity(userId, 'Committed Memoir', `Fact learned under ${newMem.category}: ${newMem.title}`);
    this.save();
    return newMem;
  }

  public deleteMemory(userId: string, id: string): boolean {
    const index = this.state.memories.findIndex(m => m.id === id);
    if (index === -1) return false;
    this.state.memories.splice(index, 1);
    this.save();
    return true;
  }

  // --- Conversations ---
  public getConversation(userId: string): ChatMessage[] {
    if (!this.state.conversations[userId]) {
      this.state.conversations[userId] = [];
    }
    return this.state.conversations[userId];
  }

  public addMessage(userId: string, sender: 'user' | 'ai', text: string): ChatMessage {
    if (!this.state.conversations[userId]) {
      this.state.conversations[userId] = [];
    }
    const msg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      sender,
      text,
      createdAt: new Date().toISOString()
    };
    this.state.conversations[userId].push(msg);
    this.save();
    return msg;
  }

  public clearConversation(userId: string): void {
    this.state.conversations[userId] = [
      { id: `msg-welcome-${userId}`, sender: 'ai', text: 'Conversational memory reset! How can I assist you with your goals today?', createdAt: new Date().toISOString() }
    ];
    this.save();
  }

  // --- User Preferences ---
  public getUserPreference(userId: string): UserPreference {
    if (!this.state.userPreferences[userId]) {
      this.state.userPreferences[userId] = {
        userId,
        notificationsEnabled: true,
        targetOpportunityTypes: ['Hackathon', 'Fellowship', 'Internship', 'Competition'],
        weeklyCochingDay: 'Sunday'
      };
      this.save();
    }
    return this.state.userPreferences[userId];
  }

  public updateUserPreference(userId: string, pref: Partial<UserPreference>): UserPreference {
    const current = this.getUserPreference(userId);
    this.state.userPreferences[userId] = {
      ...current,
      ...pref
    };
    this.save();
    return this.state.userPreferences[userId];
  }

  // --- Activity Logs & Helpers ---
  public getActivityLogs(userId: string) {
    return this.state.activityLogs
      .filter(al => al.userId === userId)
      .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public logActivity(userId: string, action: string, details: string) {
    const newLog: ActivityLog = {
      id: `al-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      action,
      details,
      createdAt: new Date().toISOString()
    };
    this.state.activityLogs.push(newLog);
    // Prune logs beyond 100 entries to save space
    if (this.state.activityLogs.length > 300) {
      this.state.activityLogs.shift();
    }
  }
}

export const db = new Database();
