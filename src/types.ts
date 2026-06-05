/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  email: string;
  fullName: string;
  academicLevel?: string;
  major?: string;
  university?: string;
  bio?: string;
  skills?: string;
}

export type OpportunityType = 'Hackathon' | 'Fellowship' | 'Internship' | 'Competition' | 'Event' | 'Workshop';
export type OpportunityStatus = 'Registered' | 'In Progress' | 'Submitted' | 'Selected' | 'Rejected' | 'Completed';

export interface Opportunity {
  id: string;
  userId: string;
  title: string;
  type: OpportunityType;
  description: string;
  registrationLink?: string;
  deadline: string; // YYYY-MM-DD (acts as submission deadline)
  registrationDeadline?: string; // YYYY-MM-DD
  status: OpportunityStatus;
  teamId?: string; // Optional links to a team
  notes?: string;
  createdAt: string;
}

export interface Team {
  id: string;
  userId: string;
  opportunityId?: string;
  name: string;
  members: TeamMember[];
}

export interface TeamMember {
  name: string;
  role: string;
  contact?: string;
}

export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Task {
  id: string;
  userId: string;
  opportunityId?: string; // Optional link to opportunity
  title: string;
  description: string;
  dueDate: string; // YYYY-MM-DD
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: string;
}

export interface DailyCheckin {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  completedToday: string;
  workingOn: string;
  blockers: string;
  summary: string; // AI generated progress summary
  createdAt: string;
}

export interface WeeklyReport {
  id: string;
  userId: string;
  weekEndDate: string; // YYYY-MM-DD
  completedTasks: string[]; // task titles
  missedTasks: string[]; // task titles
  applicationsSubmitted: number;
  upcomingDeadlines: string[]; // opportunity titles + deadlines
  productivityScore: number; // 0-100
  suggestedFocusAreas: string[];
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'deadline';
  read: boolean;
  createdAt: string;
}

export interface Memory {
  id: string;
  userId: string;
  title: string; // e.g. "SheBuilds Team Members"
  content: string; // factual context
  category: 'team' | 'deadline' | 'hackathon' | 'goal' | 'preference' | 'log';
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  createdAt: string;
}

export interface Conversation {
  id: string;  // user ID
  messages: ChatMessage[];
}

export interface UserPreference {
  userId: string;
  notificationsEnabled: boolean;
  targetOpportunityTypes: OpportunityType[];
  weeklyCochingDay: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  details: string;
  createdAt: string;
}

// Client State for Dashboard Overview
export interface DashboardStats {
  totalOpportunities: number;
  pendingTasks: number;
  completedTasks: number;
  upcomingDeadlinesCount: number;
  activeTeamsCount: number;
}
