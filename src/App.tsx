/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Opportunity, Team, Task, DailyCheckin, WeeklyReport, 
  Notification, Memory, ChatMessage, UserPreference, ActivityLog, DashboardStats, OpportunityType, OpportunityStatus, TaskPriority, TaskStatus
} from './types.js';
import { 
  LayoutDashboard, Compass, CheckSquare, ClipboardList, MessageSquare, 
  Brain, TrendingUp, Users, AlertCircle, Bell, RotateCcw, LogOut, 
  User as UserIcon, Plus, ExternalLink, Calendar, Check, Send, 
  Clock, ShieldAlert, Sparkles, BookOpen, Layers, Menu, X, Trash2, Milestone, ChevronRight, HelpCircle,
  Eye, EyeOff, Sun, Moon, Camera, Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // --- Theme State ---
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('copilot_theme');
    return (saved === 'dark' || saved === 'light') ? saved : 'light';
  });

  useEffect(() => {
    localStorage.setItem('copilot_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
  }, [theme]);

  // --- Auth State ---
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('copilot_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u && (u.id === 'demo-user-123' || u.email === 'shivi14112007@gmail.com')) {
          localStorage.removeItem('copilot_user');
          return null;
        }
        return u;
      } catch (e) {
        // ignore
      }
    }
    return null;
  });

  const [authMode, setAuthMode] = useState<'landing' | 'login' | 'signup' | 'forgot'>('landing');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [authFullName, setAuthFullName] = useState('');
  const [authAcademicLevel, setAuthAcademicLevel] = useState('Undergraduate');
  const [authRememberMe, setAuthRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [authMsg, setAuthMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // --- Profile Form State ---
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    academicLevel: 'Undergraduate',
    major: '',
    university: '',
    bio: '',
    skills: ''
  });

  const [profileUpdateMsg, setProfileUpdateMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Keep form in sync when current user changes
  useEffect(() => {
    if (currentUser) {
      const isDemo = currentUser.id === 'demo-user';
      setProfileForm({
        fullName: currentUser.fullName || '',
        email: currentUser.email || '',
        academicLevel: currentUser.academicLevel || 'Undergraduate',
        major: currentUser.major || (isDemo ? 'BloodConnect Intelligence' : ''),
        university: currentUser.university || (isDemo ? 'Demo Organization' : ''),
        bio: currentUser.bio || (isDemo ? 'Demo account for showcasing all platform features during presentations and judging sessions.' : ''),
        skills: currentUser.skills || (isDemo ? 'Donor Management, Campaign Analytics, Emergency Requests, AI Recommendations' : '')
      });
    }
  }, [currentUser]);

  // --- Main App Logic States ---
  const [activeTab, setActiveTab] = useState<'dashboard' | 'opportunities' | 'tasks' | 'checkins' | 'chat' | 'memories' | 'growth' | 'profile'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem('copilot_sidebar_collapsed');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('copilot_sidebar_collapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);
  
  // Storage states mirroring the DB Tables
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [checkins, setCheckins] = useState<DailyCheckin[]>([]);
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [preferences, setPreferences] = useState<UserPreference | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // --- Elegant Custom Toast Overlay state ---
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    // Clear toast message in 4.5 seconds
    setTimeout(() => {
      setToast(prev => prev?.message === message ? null : prev);
    }, 4500);
  };

  // --- Elegant Custom Confirmation Overlay state (avoiding native iFrame-blocking confirm dialogs) ---
  const [customConfirm, setCustomConfirm] = useState<{
    message: string;
    onConfirm: () => void;
    title?: string;
  } | null>(null);

  // --- Real-time Password Strength Check --
  const passChecks = {
    length: authPassword.length >= 8,
    upper: /[A-Z]/.test(authPassword),
    lower: /[a-z]/.test(authPassword),
    digit: /\d/.test(authPassword),
    special: /[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(authPassword)
  };
  const passScore = Object.values(passChecks).filter(Boolean).length;

  // --- UI Interactivity States ---
  // Modal states
  const [oppModalOpen, setOppModalOpen] = useState(false);
  const [oppInsertMode, setOppInsertMode] = useState<'ai' | 'manual'>('ai');
  const [oppPasteText, setOppPasteText] = useState('');
  const [oppIsParsing, setOppIsParsing] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskInsertMode, setTaskInsertMode] = useState<'ai' | 'manual'>('manual');
  const [taskPasteText, setTaskPasteText] = useState('');
  const [taskIsParsing, setTaskIsParsing] = useState(false);
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [teamInsertMode, setTeamInsertMode] = useState<'text' | 'photo' | 'manual'>('manual');
  const [teamPasteText, setTeamPasteText] = useState('');
  const [teamIsParsing, setTeamIsParsing] = useState(false);
  const [teamFileImage, setTeamFileImage] = useState<string | null>(null);
  const [checkinModalOpen, setCheckinModalOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  // Edit states (if editing an item)
  const [editingOpp, setEditingOpp] = useState<Opportunity | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form Fields
  const [oppForm, setOppForm] = useState<{
    title: string;
    type: OpportunityType;
    description: string;
    registrationLink: string;
    deadline: string;
    registrationDeadline: string;
    status: OpportunityStatus;
    notes: string;
  }>({
    title: '',
    type: 'Hackathon',
    description: '',
    registrationLink: '',
    deadline: '2026-06-25',
    registrationDeadline: '2026-06-24',
    status: 'Registered',
    notes: ''
  });

  const [taskForm, setTaskForm] = useState<{
    title: string;
    description: string;
    dueDate: string;
    priority: TaskPriority;
    status: TaskStatus;
    opportunityId: string;
  }>({
    title: '',
    description: '',
    dueDate: '2026-06-15',
    priority: 'Medium',
    status: 'Pending',
    opportunityId: ''
  });

  const [teamForm, setTeamForm] = useState<{
    name: string;
    opportunityId: string;
    members: Array<{ name: string; role: string; contact: string }>;
  }>({
    name: '',
    opportunityId: '',
    members: [
      { name: '', role: '', contact: '' }
    ]
  });

  const [checkinForm, setCheckinForm] = useState({
    completedToday: '',
    workingOn: '',
    blockers: ''
  });

  const [chatInput, setChatInput] = useState('');
  const [aiIsTyping, setAiIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [oppFilterType, setOppFilterType] = useState<string>('All');

  // --- Career Strategist, Growth & Team Intelligence States ---
  const [growthSubTab, setGrowthSubTab] = useState<'timeline' | 'career' | 'tea'>('timeline');
  const [careerGoal, setCareerGoal] = useState<string>('Software Engineering Internship');
  
  // Lists for Career Strategist profile
  const [skillsList, setSkillsList] = useState<string[]>(['React', 'Frontend Development', 'Leadership', 'TypeScript', 'Tailwind CSS']);
  const [certificationsList, setCertificationsList] = useState<string[]>(['AWS Cloud Practitioner']);
  const [internshipsList, setInternshipsList] = useState<string[]>(['Google STEP Internship (Registered)']);
  const [fellowshipsList, setFellowshipsList] = useState<string[]>(['Neo Scholars Cohort (Selected)', 'MLH Fellowship']);
  const [competitionsList, setCompetitionsList] = useState<string[]>(['Y-Combinator Startup School Hack (Completed)', 'ACM ICPC Regionals']);
  const [projectsList, setProjectsList] = useState<string[]>(['LobbyLoom voice workspace', 'SheBuilds safety application']);
  
  // New entry form inputs
  const [newSkillInput, setNewSkillInput] = useState('');
  const [newCertInput, setNewCertInput] = useState('');
  const [newProjectInput, setNewProjectInput] = useState('');
  const [auditProgress, setAuditProgress] = useState(false);
  const [auditResultMsg, setAuditResultMsg] = useState<string | null>(null);

  // Growth Custom Timeline Journal Entries State
  const [customMilestones, setCustomMilestones] = useState<Array<{ id: string; date: string; title: string; desc: string; type: 'success' | 'info' | 'warning' }>>([
    { id: 'm-1', date: 'June 2026', title: 'Building SheBuilds Safety application Prototype', desc: 'Leading front-end implementation tasks of peer-to-peer visual directories alongside team-members Riya and Ananya.', type: 'info' },
    { id: 'm-2', date: 'April 2026', title: 'Admitted into Premium Neo Scholars Cohort', desc: 'Successfully cleared Founder algorithm screenings and admitted as Neo Scholar of 2026.', type: 'success' },
    { id: 'm-3', date: 'March 2026', title: 'Built LobbyLoom audio workspace Prototype', desc: 'Engineered WebRTC coordinate signaled voice rooms and recorded pitch. Received outstanding performance index reviews.', type: 'success' }
  ]);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDesc, setNewMilestoneDesc] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState('June 2026');
  const [newMilestoneType, setNewMilestoneType] = useState<'success' | 'info' | 'warning'>('success');

  // Past Teams History state for Team Intelligence
  const [pastTeams, setPastTeams] = useState<Array<{
    id: string;
    name: string;
    project: string;
    members: Array<{ name: string; role: string; contact?: string }>;
    successRate: number;
    projectOutcome: string;
  }>>([
    {
      id: 'pt-1',
      name: 'SheBuilds Crew',
      project: 'SheBuilds safety application',
      members: [
        { name: 'Demo User', role: 'Project Lead', contact: 'demo@bloodconnect.ai' },
        { name: 'Riya', role: 'Backend Dev', contact: 'riya.sharma@collegemail.edu' },
        { name: 'Ananya', role: 'Frontend Dev', contact: 'ananya.p@collegemail.edu' }
      ],
      successRate: 92,
      projectOutcome: 'Successfully matching highest historical collaboration score. Submission finished on time with responsive front-end views.'
    },
    {
      id: 'pt-2',
      name: 'CarePulse AI Team',
      project: 'CarePulse AI Medical Assistant',
      members: [
        { name: 'Demo User', role: 'Machine Learning Architect', contact: 'demo@bloodconnect.ai' },
        { name: 'Siddharth', role: 'Cloud Platform Architect', contact: 'sid@collegemail.edu' },
        { name: 'Preeti', role: 'UX Research & Design', contact: 'preeti@collegemail.edu' }
      ],
      successRate: 95,
      projectOutcome: 'Excellent cooperation. Received outstanding project reviews. Deployed multi-modal system on Azure Cloud Services.'
    },
    {
      id: 'pt-3',
      name: 'Bits to Bytes',
      project: 'ACM ICPC Regionals qualifying',
      members: [
        { name: 'Sameer', role: 'Algorithm Guru', contact: 'sam@collegemail.edu' },
        { name: 'Varun', role: 'Data Structures Lead', contact: 'varun@collegemail.edu' },
        { name: 'Demo User', role: 'Implementation Specialist', contact: 'demo@bloodconnect.ai' }
      ],
      successRate: 85,
      projectOutcome: 'Successfully solved 5 out of 7 bracket problems within high execution constraints.'
    }
  ]);

  // Form input states to add a past team log
  const [newPastTeamOpen, setNewPastTeamOpen] = useState(false);
  const [newPastTeamName, setNewPastTeamName] = useState('');
  const [newPastTeamProject, setNewPastTeamProject] = useState('');
  const [newPastTeamSuccess, setNewPastTeamSuccess] = useState(92);
  const [newPastTeamOutcome, setNewPastTeamOutcome] = useState('');
  const [newPastTeamMembersStr, setNewPastTeamMembersStr] = useState('Ananya (UI/UX), Riya (Backend), Demo User (Project Lead)');
  const [oppFilterStatus, setOppFilterStatus] = useState<string>('All');
  const [taskFilterPriority, setTaskFilterPriority] = useState<string>('All');

  const headers = {
    'Content-Type': 'application/json',
    'x-user-id': currentUser?.id || 'demo-user'
  };

  // --- Fetch Methods ---
  const fetchAllData = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const opts = { headers };
      
      const [
        resOpps, resTeams, resTasks, resCheckins, 
        resReviews, resNotifs, resMemories, resChat, 
        resPrefs, resLogs, resStats
      ] = await Promise.all([
        fetch('/api/opportunities', opts).then(r => r.json()),
        fetch('/api/teams', opts).then(r => r.json()),
        fetch('/api/tasks', opts).then(r => r.json()),
        fetch('/api/checkins', opts).then(r => r.json()),
        fetch('/api/weekly-reviews', opts).then(r => r.json()),
        fetch('/api/notifications', opts).then(r => r.json()),
        fetch('/api/memories', opts).then(r => r.json()),
        fetch('/api/chat', opts).then(r => r.json()),
        fetch('/api/preferences', opts).then(r => r.json()),
        fetch('/api/logs', opts).then(r => r.json()),
        fetch('/api/stats', opts).then(r => r.json())
      ]);

      setOpportunities(resOpps);
      setTeams(resTeams);
      setTasks(resTasks);
      setCheckins(resCheckins);
      setWeeklyReports(resReviews);
      setNotifications(resNotifs);
      setMemories(resMemories);
      setChatMessages(resChat);
      setPreferences(resPrefs);
      setActivityLogs(resLogs);
      setDashboardStats(resStats);
    } catch (e) {
      console.error('Error fetching data from server', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [currentUser]);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, aiIsTyping]);

  const addCareerTaskToBacklog = (suggestedNextStep: string) => {
    const newTaskTemp = {
      title: `Career Strategist Action: ${suggestedNextStep}`,
      description: `Strategic action targeting gap closures for ${careerGoal}.`,
      dueDate: '2026-06-04', // In the past (Relative to TODAY_KEY_DATE June 5, 2026) so that it qualifies for "backlogTasks" filter
      priority: 'High' as const,
      status: 'Pending' as const
    };
    fetch('/api/tasks', {
      method: 'POST',
      headers,
      body: JSON.stringify(newTaskTemp)
    })
    .then(r => r.json())
    .then(data => {
      showToast(`Strategy Task created on Backlog: "${suggestedNextStep}"!`, 'success');
      if (data && data.id) {
        setTasks(prev => {
          if (prev.some(t => t.id === data.id)) return prev;
          return [...prev, data];
        });
      }
      fetchAllData();
    })
    .catch(err => {
      showToast(`Failed to add suggested task: ${err.message}`, 'error');
    });
  };

  // --- Authentication Actions ---
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMsg(null);
    try {
      if (authMode === 'signup') {
        if (authPassword !== authConfirmPassword) {
          throw new Error('Passwords do not match. Please double-check.');
        }
        
        // Strict strong password validation rules
        const requirements = [];
        if (!passChecks.length) requirements.push("at least 8 characters");
        if (!passChecks.upper) requirements.push("one uppercase letter");
        if (!passChecks.lower) requirements.push("one lowercase letter");
        if (!passChecks.digit) requirements.push("one numeric digit");
        if (!passChecks.special) requirements.push("one special character (@$!%*?&#^()_+-= etc.)");

        if (requirements.length > 0) {
          throw new Error(`Password does not meet strong rules. Missing: ${requirements.join(", ")}.`);
        }

        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: authEmail, 
            password: authPassword, 
            fullName: authFullName,
            academicLevel: authAcademicLevel // sent optionally to let the developer extend it
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed.');
        
        setAuthMsg({ type: 'success', text: 'Account created! Logging you in...' });
        setTimeout(() => {
          login(data.user);
        }, 1200);

      } else if (authMode === 'login') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: authEmail, password: authPassword })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Invalid credentials.');
        
        login(data.user);

      } else if (authMode === 'forgot') {
        // Strict strong password validation rules
        const requirements = [];
        if (!passChecks.length) requirements.push("at least 8 characters");
        if (!passChecks.upper) requirements.push("one uppercase letter");
        if (!passChecks.lower) requirements.push("one lowercase letter");
        if (!passChecks.digit) requirements.push("one numeric digit");
        if (!passChecks.special) requirements.push("one special character (@$!%*?&#^()_+-= etc.)");

        if (requirements.length > 0) {
          throw new Error(`New password does not meet strong rules. Missing: ${requirements.join(", ")}.`);
        }

        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: authEmail, newPassword: authPassword })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Reset failed.');
        
        setAuthMsg({ type: 'success', text: 'Password reset successful! You can now login.' });
        setAuthMode('login');
      }
    } catch (err: any) {
      setAuthMsg({ type: 'error', text: err.message || 'Something went wrong.' });
    }
  };

  const login = (user: User) => {
    setCurrentUser(user);
    if (authRememberMe) {
      localStorage.setItem('copilot_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('copilot_user');
    }
    setAuthMsg(null);
    setAuthEmail('');
    setAuthPassword('');
    setAuthConfirmPassword('');
    setAuthFullName('');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('copilot_user');
    setActiveTab('dashboard');
  };

  const handleDemoModeToggle = () => {
    // Standard demo setup
    const demo = { 
      id: 'demo-user', 
      email: 'demo@bloodconnect.ai', 
      fullName: 'Demo User',
      academicLevel: 'Demo',
      major: 'BloodConnect Intelligence',
      university: 'Demo Organization',
      bio: 'Demo account for showcasing all platform features during presentations and judging sessions.',
      skills: 'Donor Management, Campaign Analytics, Emergency Requests, AI Recommendations'
    };
    login(demo);
  };

  // --- Reset Database Sandbox ---
  const handleResetDB = () => {
    setCustomConfirm({
      title: 'Reset Benchmark Database',
      message: 'Are you sure you want to reset the database? This will clear customized edits and reload the 20 opportunities & 100 benchmark tasks.',
      onConfirm: async () => {
        try {
          const res = await fetch('/api/db/reset', { method: 'POST', headers });
          const data = await res.json();
          showToast(data.message || 'Database reset successfully to baseline benchmarks!', 'success');
          fetchAllData();
        } catch (e: any) {
          console.error(e);
          showToast('Error resetting database: ' + (e.message || e), 'error');
        }
      }
    });
  };

  // --- Opportunity CRUD ---
  const saveOpp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEdit = !!editingOpp;
      const url = isEdit ? `/api/opportunities/${editingOpp.id}` : '/api/opportunities';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(oppForm)
      });
      if (!res.ok) throw new Error('Failed to save opportunity');

      setOppModalOpen(false);
      setEditingOpp(null);
      setOppForm({
        title: '',
        type: 'Hackathon',
        description: '',
        registrationLink: '',
        deadline: '2026-06-25',
        registrationDeadline: '2026-06-24',
        status: 'Registered',
        notes: ''
      });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteOpp = async (id: string) => {
    try {
      await fetch(`/api/opportunities/${id}`, { method: 'DELETE', headers });
      showToast('Opportunity deleted successfully!', 'success');
      fetchAllData();
    } catch (e) {
      console.error(e);
      showToast('Failed to delete opportunity.', 'error');
    }
  };

  const startEditOpp = (opp: Opportunity) => {
    setEditingOpp(opp);
    setOppInsertMode('manual');
    setOppForm({
      title: opp.title,
      type: opp.type,
      description: opp.description || '',
      registrationLink: opp.registrationLink || '',
      deadline: opp.deadline,
      registrationDeadline: opp.registrationDeadline || opp.deadline,
      status: opp.status,
      notes: opp.notes || ''
    });
    setOppModalOpen(true);
  };

  const openAddOppModal = () => {
    setEditingOpp(null);
    setOppInsertMode('ai');
    setOppPasteText('');
    setOppForm({
      title: '',
      type: 'Hackathon',
      description: '',
      registrationLink: '',
      deadline: '2026-06-25',
      registrationDeadline: '2026-06-24',
      status: 'Registered',
      notes: ''
    });
    setOppModalOpen(true);
  };

  const handleAIExtractAndSave = async () => {
    if (!oppPasteText.trim()) {
      showToast('Please paste opportunity context info for AI parser execution.', 'error');
      return;
    }
    setOppIsParsing(true);
    try {
      const parseRes = await fetch('/api/opportunities/parse', {
        method: 'POST',
        headers,
        body: JSON.stringify({ rawText: oppPasteText })
      });
      if (!parseRes.ok) throw new Error('AI parser service error.');
      const extracted = await parseRes.json();
      
      const payload = {
        title: extracted.title || 'Extracted Opportunity',
        type: extracted.type || 'Event',
        description: extracted.description || '',
        registrationLink: extracted.registrationLink || '',
        deadline: extracted.deadline || oppForm.deadline,
        registrationDeadline: extracted.registrationDeadline || extracted.deadline || oppForm.registrationDeadline || oppForm.deadline,
        status: oppForm.status,
        notes: oppForm.notes
      };

      const saveRes = await fetch('/api/opportunities', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      if (!saveRes.ok) throw new Error('Failed to persist extracted opportunity.');

      showToast(`Successfully extracted and logged: "${payload.title}" (${payload.type})!`, 'success');
      setOppModalOpen(false);
      setOppPasteText('');
      setOppForm({
        title: '',
        type: 'Hackathon',
        description: '',
        registrationLink: '',
        deadline: '2026-06-25',
        registrationDeadline: '2026-06-24',
        status: 'Registered',
        notes: ''
      });
      fetchAllData();
    } catch (err: any) {
      console.error(err);
      showToast('AI parser was busy or returned incorrect formatting. Please use Manual instead.', 'error');
    } finally {
      setOppIsParsing(false);
    }
  };

  // --- Task CRUD ---
  const saveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEdit = !!editingTask;
      const url = isEdit ? `/api/tasks/${editingTask.id}` : '/api/tasks';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(taskForm)
      });
      if (!res.ok) throw new Error('Failed to save task.');

      setTaskModalOpen(false);
      setEditingTask(null);
      setTaskForm({
        title: '',
        description: '',
        dueDate: '2026-06-15',
        priority: 'Medium',
        status: 'Pending',
        opportunityId: ''
      });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTaskAIExtract = async () => {
    if (!taskPasteText.trim()) {
      showToast('Please paste todo task message or content for AI parser execution.', 'error');
      return;
    }
    setTaskIsParsing(true);
    try {
      const parseRes = await fetch('/api/tasks/parse', {
        method: 'POST',
        headers,
        body: JSON.stringify({ rawText: taskPasteText })
      });
      if (!parseRes.ok) throw new Error('AI task parser service error.');
      const extracted = await parseRes.json();
      
      const payload = {
        title: extracted.title || 'Extracted Task',
        description: extracted.description || '',
        dueDate: extracted.dueDate || taskForm.dueDate,
        priority: extracted.priority || taskForm.priority,
        status: taskForm.status,
        opportunityId: taskForm.opportunityId
      };

      const saveRes = await fetch('/api/tasks', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      if (!saveRes.ok) throw new Error('Failed to create extracted task.');

      showToast('Successfully extracted and saved task via Gemini!', 'success');
      setTaskModalOpen(false);
      setTaskPasteText('');
      setTaskForm({
        title: '',
        description: '',
        dueDate: '2026-06-15',
        priority: 'Medium',
        status: 'Pending',
        opportunityId: ''
      });
      fetchAllData();
    } catch (err: any) {
      console.error(err);
      showToast('AI parser was busy or returned incorrect formatting. Please use Manual instead.', 'error');
    } finally {
      setTaskIsParsing(false);
    }
  };

  const startEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      dueDate: task.dueDate,
      priority: task.priority,
      status: task.status,
      opportunityId: task.opportunityId || ''
    });
    setTaskInsertMode('manual');
    setTaskModalOpen(true);
  };

  const toggleTaskStatus = async (task: Task) => {
    const nextStatus: TaskStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status: nextStatus })
      });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE', headers });
      showToast('Task deleted successfully!', 'success');
      fetchAllData();
    } catch (e) {
      console.error(e);
      showToast('Failed to delete task.', 'error');
    }
  };

  // --- Team CRUD ---
  const openAssembleTeamModal = () => {
    setTeamInsertMode('manual');
    setTeamPasteText('');
    setTeamFileImage(null);
    setTeamForm({
      name: '',
      opportunityId: '',
      members: [{ name: '', role: '', contact: '' }]
    });
    setTeamModalOpen(true);
  };

  const handleTeamTextExtract = async () => {
    if (!teamPasteText.trim()) {
      showToast('Please paste a details message to extract first.', 'error');
      return;
    }
    setTeamIsParsing(true);
    try {
      const res = await fetch('/api/teams/parse-text', {
        method: 'POST',
        headers,
        body: JSON.stringify({ rawText: teamPasteText })
      });
      if (!res.ok) throw new Error('AI parser returned error.');
      const parsed = await res.json();
      
      setTeamForm({
        name: parsed.name || 'AI Assembled Team',
        opportunityId: teamForm.opportunityId || '',
        members: parsed.members && parsed.members.length > 0 ? parsed.members : [{ name: '', role: '', contact: '' }]
      });
      setTeamInsertMode('manual');
      showToast('Successfully extracted team details! Tap "Save Team" or check below to tweak details.', 'success');
    } catch (e: any) {
      console.error(e);
      showToast('Failed to parse text roster: ' + (e.message || e), 'error');
    } finally {
      setTeamIsParsing(false);
    }
  };

  const handleTeamPhotoExtract = async (base64Img: string) => {
    setTeamIsParsing(true);
    try {
      const res = await fetch('/api/teams/parse-photo', {
        method: 'POST',
        headers,
        body: JSON.stringify({ imageBase64: base64Img })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error || 'Vision parser returned an error.');
      }
      const parsed = await res.json();
      
      setTeamForm({
        name: parsed.name || 'Photo Assembled Team',
        opportunityId: teamForm.opportunityId || '',
        members: parsed.members && parsed.members.length > 0 ? parsed.members : [{ name: '', role: '', contact: '' }]
      });
      setTeamInsertMode('manual');
      showToast('Successfully extracted team details from image! Tweak below and save.', 'success');
    } catch (e: any) {
      console.error(e);
      showToast(e.message || 'Error occurred during image analysis. Make sure text is clear.', 'error');
    } finally {
      setTeamIsParsing(false);
    }
  };

  const saveTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Filter out empty members
      const activeMembers = teamForm.members.filter(m => m.name.trim() !== '');
      if (activeMembers.length === 0) {
        showToast('Please specify at least one functional team member roster.', 'error');
        return;
      }

      await fetch('/api/teams', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: teamForm.name,
          opportunityId: teamForm.opportunityId || undefined,
          members: activeMembers
        })
      });

      setTeamForm({
        name: '',
        opportunityId: '',
        members: [{ name: '', role: '', contact: '' }]
      });
      setTeamModalOpen(false);
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // --- Daily Check-in Form ---
  const handleCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/checkins', {
        method: 'POST',
        headers,
        body: JSON.stringify(checkinForm)
      });
      if (!res.ok) throw new Error('Checkin registration failed.');

      setCheckinForm({ completedToday: '', workingOn: '', blockers: '' });
      setCheckinModalOpen(false);
      fetchAllData();
      showToast('Daily Check-in recorded! A summary has been automatically updated in your timeline.', 'success');
    } catch (err) {
      console.error(err);
    }
  };

  // --- Trigger Weekly AI Review Report ---
  const generateWeeklyReport = async () => {
    if (weeklyReports.length > 0) {
      showToast('Weekly review report has already been generated successfully!', 'success');
      return;
    }
    if (isGeneratingReport) {
      showToast('Weekly review report is already being compiled. Please wait...', 'info');
      return;
    }
    setIsGeneratingReport(true);
    setIsLoading(true);
    try {
      const res = await fetch('/api/weekly-reviews', { method: 'POST', headers });
      if (!res.ok) throw new Error('Review compilation aborted by server.');
      showToast('AI has reviewed your productivity index, assessed deadlines, compiled backlog status and generated target suggestions!', 'success');
      fetchAllData();
    } catch (e) {
      console.error(e);
      showToast('Report failed to generate. Verify GEMINI_API_KEY settings or try again.', 'error');
    } finally {
      setIsLoading(false);
      setIsGeneratingReport(false);
    }
  };

  // --- Clear AI Weekly Reports ---
  const clearWeeklyReports = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/weekly-reviews', { method: 'DELETE', headers });
      if (!res.ok) throw new Error('Server rejected request to clear reports.');
      showToast('All weekly reports cleared! You can now generate a new one.', 'success');
      fetchAllData();
    } catch (e) {
      console.error(e);
      showToast('Failed to clear weekly reports. Try again later.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Send Message to AI Copilot Memory Agent ---
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const textToSend = chatInput;
    setChatInput('');
    setAiIsTyping(true);

    // Append user message instantly on client side
    setChatMessages(prev => [
      ...prev,
      { id: `user-temp-${Date.now()}`, sender: 'user', text: textToSend, createdAt: new Date().toISOString() }
    ]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({ text: textToSend })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Server rejected message.');
      
      // Update data immediately since the AI can trigger database writes
      fetchAllData();
    } catch (e) {
      console.error('Chat error', e);
      setChatMessages(prev => [
        ...prev,
        { id: `ai-err-${Date.now()}`, sender: 'ai', text: 'Error connecting to my brain. Ensure process.env.GEMINI_API_KEY is configured correctly.', createdAt: new Date().toISOString() }
      ]);
    } finally {
      setAiIsTyping(false);
    }
  };

  const clearChat = () => {
    setCustomConfirm({
      title: 'Clear Memory Thread',
      message: 'Are you sure you want to clear your student conversation memory thread? This cannot be undone.',
      onConfirm: async () => {
        try {
          // Instantly clear client-side first so the UI is responsive
          setChatMessages([
            { id: `msg-welcome`, sender: 'ai', text: 'Conversational memory reset! How can I assist you with your goals today?', createdAt: new Date().toISOString() }
          ]);
          await fetch('/api/chat/clear', { method: 'POST', headers });
          showToast('Conversational memory reset successfully.', 'success');
          fetchAllData();
        } catch (e: any) {
          console.error(e);
          showToast('Failed to clear conversation thread.', 'error');
        }
      }
    });
  };

  // --- Helper Calculations / Dynamic Backlogs ---
  const TODAY_KEY_DATE = new Date('2026-06-05');

  const daysLabel = (diffDays: number) => {
    if (diffDays < 0) return 'Overdue!';
    if (diffDays === 0) return 'Today!';
    if (diffDays === 1) return 'Tomorrow!';
    return `in ${diffDays} days`;
  };

  const unregisteredAndCloseOpps = opportunities.filter(o => {
    const isRegisteredState = o.status === 'Registered' || o.status === 'Submitted' || o.status === 'Selected' || o.status === 'Completed';
    if (isRegisteredState) return false;
    const regDeadline = o.registrationDeadline || o.deadline;
    const targetDate = new Date(regDeadline);
    const diffTime = targetDate.getTime() - TODAY_KEY_DATE.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  });

  // Tasks whose dueDate < June 5, 2026 AND status !== Completed
  const backlogTasks = tasks.filter(t => t.status !== 'Completed' && new Date(t.dueDate) < TODAY_KEY_DATE);
  
  // Pending tasks due in the future or today
  const activePendingTasks = tasks.filter(t => t.status !== 'Completed' && new Date(t.dueDate) >= TODAY_KEY_DATE);

  // Recommendations Generation
  const criticalBacklogs = backlogTasks.filter(b => b.priority === 'Critical' || b.priority === 'High');
  const soonDeadlines = opportunities
    .filter(o => o.status !== 'Completed' && o.status !== 'Rejected' && new Date(o.deadline) >= TODAY_KEY_DATE)
    .sort((a,b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  // Filter lists
  const filteredOpps = opportunities.filter(o => {
    const matchesSearch = o.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (o.notes && o.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (o.description && o.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = oppFilterType === 'All' || o.type === oppFilterType;
    const matchesStatus = oppFilterStatus === 'All' || o.status === oppFilterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPriority = taskFilterPriority === 'All' || t.priority === taskFilterPriority;
    return matchesSearch && matchesPriority;
  });

  // --- Render Authentication flow ---
  if (!currentUser) {
    if (authMode === 'landing') {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
          <div className="w-full max-w-4xl text-center">
            
            {/* Logo and Big Headline */}
            <div className="inline-flex items-center justify-center p-3 bg-indigo-50 text-indigo-600 rounded-3xl shadow-indigo-150/40 shadow-xl mb-6">
              <Brain className="h-12 w-12 stroke-[1.8] animate-pulse text-indigo-600" />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight font-display mb-4 leading-tight">
              Student <span className="bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">Copilot</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed mb-10">
              An AI-powered academic memory agent and intelligence chief of staff. Consolidate study milestones, track hackathons, organize team assemblies, and capture progress diagnostics instantly.
            </p>

            {/* Feature Bento-Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <div className="bg-white p-6 shadow-sm rounded-2xl border border-slate-200 text-left premium-border-glow transition-all">
                <div className="p-2 w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                  <Brain className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1.5 font-display flex items-center gap-1.5">
                  AI Memory Engine <Sparkles className="h-3.5 w-3.5 text-indigo-505 shrink-0" />
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Extracts study commitments, partners, milestones, and project details right from plain conversation or team pictures. Augmented by Gemini.
                </p>
              </div>

              <div className="bg-white p-6 shadow-sm rounded-2xl border border-slate-200 text-left premium-border-glow transition-all">
                <div className="p-2 w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                  <Compass className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1.5 font-display">
                  Academic Opportunities Matrix
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Centralize targets across hackathons, research fellowships, competition deadlines, and internships. Live status pipeline tracking.
                </p>
              </div>

              <div className="bg-white p-6 shadow-sm rounded-2xl border border-slate-200 text-left premium-border-glow transition-all">
                <div className="p-2 w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1.5 font-display">
                  Daily Check-ins & Diagnostics
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Fast daily updates to log blockers and highlights. Automatically compiles weekly productivity metrics, activity logs, and strategic focus coaching.
                </p>
              </div>

              <div className="bg-white p-6 shadow-sm rounded-2xl border border-slate-200 text-left premium-border-glow transition-all">
                <div className="p-2 w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1.5 font-display">
                  Cohort & Teaming Portal
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Store contact networks, member expertise rosters, resource materials, and success rates for your workspace collectives.
                </p>
              </div>
            </div>

            {/* Call to action boxes */}
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 text-left">
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-display mb-1 flex items-center gap-1.5">
                  Ready to optimize your workflow?
                </h2>
                <p className="text-xs text-slate-500 font-medium font-sans max-w-md">
                  Activate your free account to access automated academic task tracking, AI grounding memory, and weekly score reports.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-indigo-600/10 flex items-center justify-center gap-1"
                >
                  Create Account <ChevronRight className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold transition-all cursor-pointer flex items-center justify-center"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={handleDemoModeToggle}
                  className="px-5 py-2.5 rounded-xl border border-dashed border-indigo-200 text-indigo-700 bg-indigo-50/30 hover:bg-indigo-50 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 animate-pulse"
                >
                  <Sparkles className="h-3.5 w-3.5 text-indigo-650" />
                  Continue as Demo
                </button>
              </div>
            </div>

          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="mb-4 sm:mx-auto sm:w-full sm:max-w-md">
          <button 
            type="button"
            onClick={() => { setAuthMode('landing'); setAuthMsg(null); }}
            className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-all cursor-pointer flex items-center gap-1.5 mx-auto"
          >
            ← Back to Home Landing Page
          </button>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center items-center gap-2 mb-2">
            <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-lg shadow-indigo-650/10">
              <Brain className="h-6 w-6 stroke-[2.2]" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900 font-display">Student Copilot</span>
          </div>
          <h2 className="text-center text-sm font-medium text-slate-500 max-w-sm mx-auto leading-relaxed">
            Your personal AI intelligence network & academic chief of staff
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-sm rounded-2xl sm:px-10 border border-slate-200">
            
            {/* Segmented Auth Selector */}
            <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
              <button 
                onClick={() => { setAuthMode('login'); setAuthMsg(null); }}
                className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${authMode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Sign In
              </button>
              <button 
                onClick={() => { setAuthMode('signup'); setAuthMsg(null); }}
                className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${authMode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Create Account
              </button>
              <button 
                onClick={() => { setAuthMode('forgot'); setAuthMsg(null); }}
                className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${authMode === 'forgot' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Forgot Password
              </button>
            </div>

            {authMsg && (
              <div className={`p-3 rounded-xl text-xs font-semibold mb-5 flex items-start gap-2 ${authMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-rose-50 text-rose-800 border border-rose-100'}`}>
                {authMsg.type === 'success' ? (
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span>{authMsg.text}</span>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleAuth}>
              {authMode === 'signup' && (
                <>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Full Academic Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <UserIcon className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={authFullName}
                        onChange={(e) => setAuthFullName(e.target.value)}
                        placeholder=""
                        className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-650/15 focus:border-indigo-600 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Academic Program / Level</label>
                    <select
                      value={authAcademicLevel}
                      onChange={(e) => setAuthAcademicLevel(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-650/15 focus:border-indigo-600 transition-all font-medium"
                    >
                      <option value="Undergraduate">Undergraduate Student</option>
                      <option value="Postgraduate">Postgraduate (Masters)</option>
                      <option value="PhD">PhD / Postdoc Researcher</option>
                      <option value="Hobbyist">Online / Dev Learner</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder={authMode === 'signup' ? "" : "demo@bloodconnect.ai"}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-650/15 focus:border-indigo-600 transition-all font-medium"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {authMode === 'forgot' ? 'New Secure Password' : 'Password'}
                  </label>
                  {authPassword && (authMode === 'signup' || authMode === 'forgot') && (
                    <span className={`text-[10px] font-mono font-bold ${passScore === 5 ? 'text-emerald-600' : passScore >= 3 ? 'text-amber-500' : 'text-rose-500'}`}>
                      {passScore === 5 ? 'Rules Satisfied' : `Checks: ${passScore}/5`}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-3.5 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-650/15 focus:border-indigo-600 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-650 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Interactive Real-time Password Rules & Strength Meter */}
                {(authMode === 'signup' || authMode === 'forgot') && authPassword && (
                  <div className="mt-2.5 p-3.5 bg-slate-50/50 border border-slate-200 rounded-xl space-y-2 text-[11px] transition-all">
                    <div className="flex items-center justify-between font-bold text-slate-600 tracking-tight">
                      <span>Status:</span>
                      <span className={
                        passScore === 5 ? "text-emerald-600 font-bold" :
                        passScore >= 4 ? "text-blue-600 font-bold" :
                        passScore >= 3 ? "text-amber-500 font-bold" : "text-rose-500 font-bold"
                      }>
                        {passScore === 5 ? "✓ Strong & Secure" :
                         passScore >= 4 ? "Good Keep going" :
                         passScore >= 3 ? "Medium strength" : "Too Weak (Strict Rules)"}
                      </span>
                    </div>

                    {/* Progress score indicators */}
                    <div className="h-1.5 w-full bg-slate-200/60 rounded-full overflow-hidden flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((idx) => (
                        <div
                          key={idx}
                          className={`h-full flex-1 transition-all duration-305 ${
                            idx <= passScore
                              ? passScore === 5 ? "bg-emerald-500 animate-pulse" :
                                passScore >= 4 ? "bg-blue-500" :
                                passScore >= 3 ? "bg-amber-500" : "bg-rose-500"
                              : "bg-transparent"
                          }`}
                        ></div>
                      ))}
                    </div>

                    {/* Requirement items checklist */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 pt-1.5 border-t border-slate-100 font-medium">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-3.5 h-3.5 text-[9px] rounded-full flex items-center justify-center shrink-0 font-bold ${passChecks.length ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-400'}`}>
                          {passChecks.length ? '✓' : '•'}
                        </span>
                        <span className={passChecks.length ? 'text-slate-700' : 'text-slate-400'}>Min 8 characters</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-3.5 h-3.5 text-[9px] rounded-full flex items-center justify-center shrink-0 font-bold ${passChecks.upper ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-400'}`}>
                          {passChecks.upper ? '✓' : '•'}
                        </span>
                        <span className={passChecks.upper ? 'text-slate-700' : 'text-slate-400'}>Upper (A-Z)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-3.5 h-3.5 text-[9px] rounded-full flex items-center justify-center shrink-0 font-bold ${passChecks.lower ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-400'}`}>
                          {passChecks.lower ? '✓' : '•'}
                        </span>
                        <span className={passChecks.lower ? 'text-slate-700' : 'text-slate-400'}>Lower (a-z)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-3.5 h-3.5 text-[9px] rounded-full flex items-center justify-center shrink-0 font-bold ${passChecks.digit ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-400'}`}>
                          {passChecks.digit ? '✓' : '•'}
                        </span>
                        <span className={passChecks.digit ? 'text-slate-700' : 'text-slate-400'}>Number (0-9)</span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:col-span-2">
                        <span className={`w-3.5 h-3.5 text-[9px] rounded-full flex items-center justify-center shrink-0 font-bold ${passChecks.special ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-4s0'}`}>
                          {passChecks.special ? '✓' : '•'}
                        </span>
                        <span className={passChecks.special ? 'text-slate-700' : 'text-slate-400'}>Special char (@$!%*?&...)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {authMode === 'signup' && (
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">Confirm Password</label>
                    {authConfirmPassword && (
                      <span className={`text-[10px] font-mono font-bold ${authPassword === authConfirmPassword ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {authPassword === authConfirmPassword ? 'Passwords Match' : 'Mismatch'}
                      </span>
                    )}
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={authConfirmPassword}
                    onChange={(e) => setAuthConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full px-3.5 py-2.5 border rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-650/15 transition-all font-medium ${
                      authConfirmPassword
                        ? authPassword === authConfirmPassword
                          ? 'border-emerald-300 focus:border-emerald-500'
                          : 'border-rose-300 focus:border-rose-500'
                        : 'border-slate-200 focus:border-indigo-600'
                    }`}
                  />
                </div>
              )}

              {authMode !== 'forgot' && (
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={authRememberMe}
                      onChange={(e) => setAuthRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                    />
                    <span className="text-xs text-slate-500 font-medium font-sans">Remember this device</span>
                  </label>
                </div>
              )}

              <button
                type="submit"
                className="w-full mt-6 py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all cursor-pointer shadow-indigo-600/10"
              >
                {authMode === 'login' 
                  ? 'Sign In Workspace' 
                  : authMode === 'signup' 
                    ? 'Register & Initialize Brain' 
                    : 'Submit Password Reset'}
              </button>
            </form>

            {/* Quick Access Portal */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
              <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-white px-2.5">
                Interactive Presenter Sandbox
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="text-[11px] text-slate-500 text-center font-medium leading-relaxed">
                Choose a prefilled profile option to fast-track evaluation or enter custom credentials above:
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setAuthEmail('demo@bloodconnect.ai');
                    setAuthPassword('password123');
                    setAuthMsg({ type: 'success', text: 'Demo account credentials loaded! Click "Sign In Workspace" to log in.' });
                  }}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-xl text-left cursor-pointer transition-all"
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 mb-0.5 font-display">Demo Profile</p>
                  <p className="text-[11px] font-bold truncate">Demo User</p>
                  <p className="text-[9px] text-slate-450 font-mono truncate">demo@bloodconnect.ai</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setAuthFullName('Alex Rivera');
                    setAuthEmail('alex.rivera@university.edu');
                    setAuthPassword('password123');
                    setAuthConfirmPassword('password123');
                    setAuthAcademicLevel('Postgraduate');
                    setAuthMsg({ type: 'success', text: 'Alex Rivera (Fresh postgrad) loaded. Click "Register & Initialize Brain"!' });
                  }}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-xl text-left cursor-pointer transition-all"
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-0.5 font-display">Fresh Profile</p>
                  <p className="text-[11px] font-bold truncate">Alex Rivera</p>
                  <p className="text-[9px] text-slate-455 font-mono truncate font-medium">alex.rivera@university.edu</p>
                </button>
              </div>

              <button
                onClick={handleDemoModeToggle}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-dashed border-indigo-200 text-indigo-700 bg-indigo-50/30 hover:bg-indigo-50 rounded-xl text-xs font-bold cursor-pointer transition-all mt-3"
              >
                <Sparkles className="h-3.5 w-3.5 animate-pulse text-indigo-650" />
                Instant Access Demo Workspace (Auto Login)
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // --- Main Application Layout ---
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans">
      
      {/* Sidebar: Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-25 w-64 bg-white text-slate-800 border-r border-slate-200 flex flex-col justify-between transform transition-transform duration-300 overflow-y-auto ${
        sidebarOpen 
          ? 'translate-x-0' 
          : sidebarCollapsed 
            ? '-translate-x-full' 
            : '-translate-x-full md:translate-x-0'
      }`}>
        <div>
          {/* Header */}
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-base shadow-sm shadow-indigo-600/10">C</div>
                <h1 className="text-lg font-bold tracking-tight text-slate-900 font-display">Copilot</h1>
              </div>
              <button 
                className="hidden md:flex text-slate-400 hover:text-indigo-600 cursor-pointer bg-slate-50 hover:bg-slate-100 p-1 rounded-lg border border-slate-100 transition-all items-center justify-center" 
                onClick={() => setSidebarCollapsed(true)}
                title="Collapse Sidebar"
                id="sidebar-collapse-aside"
              >
                <ChevronRight className="h-4 w-4 transform rotate-180" />
              </button>
              <button className="md:hidden text-slate-405 hover:text-slate-600 cursor-pointer" onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold font-mono">Student Memory Agent</p>
          </div>

          {/* User Section (Click to Open Profile Details) */}
          <button 
            type="button"
            onClick={() => { setActiveTab('profile'); setSidebarOpen(false); }}
            className={`w-full text-left px-6 py-4 border-b border-sidebar border-slate-100 bg-slate-50/50 hover:bg-slate-100/70 dark:hover:bg-slate-800/15 transition-all cursor-pointer block group ${activeTab === 'profile' ? 'bg-indigo-50/30' : ''}`}
            title="Click to view and edit profile details"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-indigo-50 border border-slate-200 text-indigo-700 flex items-center justify-center font-bold text-xs shadow-sm group-hover:scale-105 transition-transform shrink-0">
                {currentUser.fullName.split(' ').map(n=>n[0]).join('')}
              </div>
              <div className="overflow-hidden flex-1">
                <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-650 transition-colors truncate">{currentUser.fullName}</p>
                <p className="text-[10px] text-slate-400 font-mono truncate">{currentUser.email}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 opacity-60 group-hover:text-indigo-600 transition-colors shrink-0" />
            </div>
          </button>

          {/* Nav Items */}
          <nav className="p-4 space-y-1">
            <button
              onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-955'}`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard Overview
            </button>
            <button
              onClick={() => { setActiveTab('opportunities'); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'opportunities' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-955'}`}
            >
              <div className="flex items-center gap-3">
                <Compass className="h-4 w-4" />
                Opportunities & Teams
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${activeTab === 'opportunities' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-500'}`}>
                {opportunities.length}
              </span>
            </button>
            <button
              onClick={() => { setActiveTab('tasks'); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'tasks' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-955'}`}
            >
              <div className="flex items-center gap-3">
                <CheckSquare className="h-4 w-4" />
                Task Backlog
              </div>
              {backlogTasks.length > 0 ? (
                <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-mono font-bold animate-pulse">
                  {backlogTasks.length} Overdue
                </span>
              ) : (
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${activeTab === 'tasks' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-500'}`}>
                  {activePendingTasks.length}
                </span>
              )}
            </button>
            <button
              onClick={() => { setActiveTab('checkins'); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'checkins' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-955'}`}
            >
              <div className="flex items-center gap-3">
                <ClipboardList className="h-4 w-4" />
                Daily & Weekly Review
              </div>
            </button>
            <button
              onClick={() => { setActiveTab('growth'); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'growth' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-955'}`}
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="h-4 w-4" />
                Growth Timeline
              </div>
            </button>
          </nav>
        </div>

        {/* Footer actions */}
        <div className="p-3 sm:p-4 border-t border-slate-100 flex flex-col gap-1 bg-slate-50/50">
          <button
            onClick={handleResetDB}
            className="w-full flex items-center gap-1.5 sm:gap-2.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg transition-all cursor-pointer"
          >
            <RotateCcw className="h-3 sm:h-3.5 w-3/12 sm:w-3.5 shrink-0" />
            <span className="truncate">Reload Benchmark Data</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-1.5 sm:gap-2.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
          >
            <LogOut className="h-3 sm:h-3.5 w-3/12 sm:w-3.5 shrink-0" />
            <span className="truncate">Log Out of Workspace</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className={`flex-1 min-h-screen flex flex-col overflow-hidden transition-all duration-300 ${
        sidebarCollapsed ? 'md:pl-0' : 'md:pl-64'
      }`}>
        
        {/* Top Navbar */}
        <header className="sticky top-0 z-20 bg-white border-b border-slate-100 h-14 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              className="text-slate-500 hover:text-indigo-600 p-1.5 hover:bg-slate-50 rounded-lg border border-slate-100 transition-all cursor-pointer flex items-center justify-center" 
              onClick={() => {
                if (window.innerWidth < 768) {
                  setSidebarOpen(true);
                } else {
                  setSidebarCollapsed(!sidebarCollapsed);
                }
              }}
              title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              id="sidebar-toggle-btn"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-md sm:text-lg font-bold text-slate-900 tracking-tight capitalize flex items-center gap-1.5">
              {activeTab === 'dashboard' && 'Dashboard Center'}
              {activeTab === 'opportunities' && 'Opportunities & Team Hub'}
              {activeTab === 'tasks' && 'Task Engine & Backlog Tracker'}
              {activeTab === 'checkins' && 'Review System'}
              {activeTab === 'chat' && 'AI Personal Memory Agent'}
              {activeTab === 'memories' && 'Memory Intellect Store'}
              {activeTab === 'growth' && 'Student Growth Journey'}
              {activeTab === 'profile' && 'Personal Profile & Settings'}
            </h1>
          </div>

          <div className="flex items-center gap-3 relative">
            
            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-all cursor-pointer flex items-center justify-center"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              id="theme-toggler"
            >
              {theme === 'light' ? (
                <Moon className="h-4 w-4 text-indigo-600" />
              ) : (
                <Sun className="h-4 w-4 text-amber-500" />
              )}
            </button>

            {/* Search Input available across headers generally */}
            {(activeTab === 'opportunities' || activeTab === 'tasks') && (
              <input
                type="text"
                placeholder="Search queries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="hidden sm:block text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:bg-white text-slate-700 w-44"
              />
            )}

            {/* Notifications Dropdown Toggle */}
            <div className="relative">
              <button 
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-all relative cursor-pointer"
              >
                <Bell className="h-4 w-4" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-indigo-600 ring-2 ring-white"></span>
                )}
              </button>

              <AnimatePresence>
                {notifDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setNotifDropdownOpen(false)}></div>
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-80 bg-white border border-slate-100 rounded-xl shadow-xl z-40 p-2 text-sm max-h-96 overflow-y-auto"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 px-3 pt-1">
                        <span className="font-semibold text-slate-700">Notifications</span>
                        <button 
                          onClick={async () => {
                            await fetch('/api/notifications/read-all', { method: 'POST', headers });
                            fetchAllData();
                          }}
                          className="text-[10px] text-indigo-600 hover:underline cursor-pointer"
                        >
                          Mark all read
                        </button>
                      </div>
                      <div className="space-y-1.5 pt-1.5">
                        {notifications.length === 0 ? (
                          <div className="text-center py-6 text-slate-400 text-xs text-medium">No alerts recorded yet.</div>
                        ) : (
                          notifications.slice(0, 5).map(n => (
                            <div 
                              key={n.id} 
                              onClick={async () => {
                                await fetch(`/api/notifications/${n.id}/read`, { method: 'POST', headers });
                                setNotifDropdownOpen(false);
                                fetchAllData();
                              }}
                              className={`p-2.5 rounded-lg border transition-all cursor-pointer ${n.read ? 'bg-white border-slate-50 opacity-60' : 'bg-indigo-50/30 border-indigo-50 hover:bg-indigo-50/50'}`}
                            >
                              <div className="flex justify-between items-start">
                                <p className="font-semibold text-xs text-slate-800">{n.title}</p>
                                <span className="text-[9px] text-slate-400">{new Date(n.createdAt).toLocaleDateString()}</span>
                              </div>
                              <p className="text-[11px] text-slate-600 mt-0.5">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* General Info Badge indicating Date */}
            <span className="hidden lg:inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">
              <Clock className="h-3 w-3 text-indigo-600" />
              Benchmark Time: <strong className="text-slate-800 text-medium">June 5, 2026</strong>
            </span>

            {/* Header Quick Log Out button */}
            <button 
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-650 hover:border-rose-200 rounded-xl text-xs font-bold text-slate-600 transition-all cursor-pointer shadow-sm"
              title="Log out of student brain workspace"
            >
              <LogOut className="h-3.5 w-3.5 text-rose-500 shrink-0" />
              <span>Log Out</span>
            </button>
          </div>
        </header>

        {/* Client View Panel with Motion Transitions */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {isLoading && (
            <div className="fixed top-0 inset-x-0 h-1 bg-indigo-500 animate-pulse z-50"></div>
          )}

          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Profile Intro Banner */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 text-slate-900 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Brain className="h-64 w-64 text-indigo-600 rotate-12" />
                </div>
                <div className="space-y-1 relative z-10">
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 font-display">Active Duty Copilot Workspace</h2>
                  <p className="text-xs sm:text-sm text-slate-505">
                    Welcome back, <span className="text-indigo-600 font-semibold">{currentUser.fullName}</span>! My memory engine is active. Let's make today matter.
                  </p>
                </div>
                <div className="flex gap-2.5 z-10">
                  <button 
                    onClick={() => setCheckinModalOpen(true)}
                    className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold rounded-lg shadow-sm shadow-indigo-600/10 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <ClipboardList className="h-3.5 w-3.5" />
                    Complete Daily Check-in
                  </button>
                  <button 
                    onClick={() => setActiveTab('chat')}
                    className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-705 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
                    Query Agent Brain
                  </button>
                </div>
              </div>

              {/* Red Alert Banner for Closer Unregistered Deadlines */}
              {unregisteredAndCloseOpps && unregisteredAndCloseOpps.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-rose-50 border border-rose-250 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm"
                >
                  <div className="flex gap-3 items-start">
                    <div className="bg-rose-100 p-2.5 rounded-xl text-rose-600 shrink-0 mt-0.5 md:mt-0 animate-pulse">
                      <ShieldAlert className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-rose-950">Urgent: Unregistered Approaching Deadlines!</h4>
                      <p className="text-xs text-rose-800 mt-1">
                        You have {unregisteredAndCloseOpps.length} {unregisteredAndCloseOpps.length === 1 ? 'workload' : 'workloads'} approaching final/registration deadlines that you haven't completed registration for:
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2.5">
                        {unregisteredAndCloseOpps.map(opp => {
                          const regDeadline = opp.registrationDeadline || opp.deadline;
                          const targetDate = new Date(regDeadline);
                          const diffTime = targetDate.getTime() - TODAY_KEY_DATE.getTime();
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                          
                          return (
                            <span key={opp.id} className="inline-flex items-center gap-1.5 bg-rose-100/60 border border-rose-200 rounded-lg px-2.5 py-1 text-[11px] font-bold text-rose-800 shadow-sm">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                              {opp.title} ({opp.type}) — Due <strong className="underline text-rose-950">{regDeadline}</strong> ({daysLabel(diffDays)})
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveTab('opportunities')}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-all shadow-sm shadow-rose-600/15 active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Resolve & Register Now
                  </button>
                </motion.div>
              )}

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-slate-450 text-[10px] font-bold uppercase tracking-widest block mb-1">Total Registrations</span>
                    <strong className="text-2xl font-bold text-slate-900 font-display">{opportunities.length}</strong>
                  </div>
                  <div className="flex gap-1 items-center mt-3 text-[10px] text-indigo-650">
                    <span className="font-bold">{opportunities.filter(o=>o.status==='Registered').length} New</span>
                    <span className="text-slate-350">|</span>
                    <span className="font-bold text-emerald-600">{opportunities.filter(o=>o.status==='Completed'||o.status==='Selected').length} Completed</span>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-slate-455 text-[10px] font-bold uppercase tracking-widest block mb-1">Pending Todos</span>
                    <strong className="text-2xl font-bold text-slate-900 font-display">{tasks.filter(t=>t.status!=='Completed').length}</strong>
                  </div>
                  <div className="flex gap-1 items-center mt-2.5 text-[10px] text-amber-600 font-mono">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span className="font-bold">{backlogTasks.length} Overdue</span>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-slate-450 text-[10px] font-bold uppercase tracking-widest block mb-1">Completed Tasks</span>
                    <strong className="text-2xl font-bold text-slate-900 font-display">{tasks.filter(t=>t.status==='Completed').length}</strong>
                  </div>
                  <div className="flex gap-1 items-center mt-2.5 text-[10px] text-emerald-600 font-mono">
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="font-bold">Bench target hit</span>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-slate-450 text-[10px] font-bold uppercase tracking-widest block mb-1">Upcoming Deadlines</span>
                    <strong className="text-2xl font-bold text-slate-900 font-display">
                      {opportunities.filter(o=>o.status!=='Completed'&&o.status!=='Rejected').length}
                    </strong>
                  </div>
                  <div className="flex gap-1 items-center mt-2.5 text-[10px] text-indigo-650 font-mono">
                    <Calendar className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                    <span className="font-bold">Closest: {soonDeadlines[0]?.deadline || 'None'}</span>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm col-span-2 lg:col-span-1 flex flex-col justify-between">
                  <div>
                    <span className="text-slate-450 text-[10px] font-bold uppercase tracking-widest block mb-1">Active Teams</span>
                    <strong className="text-2xl font-bold text-slate-900 font-display">{teams.length}</strong>
                  </div>
                  <div className="flex gap-1 items-center mt-3 text-[10px] text-slate-505 font-mono">
                    <Users className="h-3.5 w-3.5 text-indigo-500" />
                    <span className="font-bold">{teams.reduce((acc, current) => acc + current.members.length, 0)} total roster</span>
                  </div>
                </div>
              </div>

              {/* Premium AI Career Strategy & Team Forecasting Hub */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-indigo-950/20 relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-5 premium-border-glow">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_107%,rgba(99,102,241,0.15),transparent_40%)]"></div>
                <div className="space-y-2 max-w-xl relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="bg-indigo-500/20 text-indigo-300 font-mono text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-indigo-500/30 flex items-center gap-1">
                      <Sparkles className="h-2.5 w-2.5 animate-pulse" />
                      Dynamic Intellect Engine
                    </span>
                    <span className="bg-emerald-500/20 text-emerald-300 font-mono text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-emerald-500/30">
                      Integrated Career Portal
                    </span>
                  </div>
                  <h3 className="text-md sm:text-lg font-bold font-display tracking-tight text-white">
                    Unlock Strategic Horizons with AI Career Explorer & Team Intelligence
                  </h3>
                  <p className="text-xs text-indigo-200/90 leading-relaxed font-sans">
                    Align your undergraduate skills with active roles like <strong className="text-white font-semibold">"Machine Learning Scientist"</strong> or <strong className="text-white font-semibold">"Quantitative Research"</strong>. Test competencies real-time and predict high-performing team configurations inside our Growth suites.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2.5 relative z-10 shrink-0">
                  <button
                    onClick={() => {
                      setActiveTab('growth');
                      setGrowthSubTab('career');
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-550 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md transition-all flex items-center gap-1.5 border border-indigo-400/25"
                    id="goto-career-strategist"
                  >
                    <TrendingUp className="h-3.5 w-3.5 text-indigo-300" />
                    Launch Career Strategist
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('growth');
                      setGrowthSubTab('tea');
                    }}
                    className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700/80 text-indigo-100 text-xs font-bold rounded-xl cursor-pointer hover:text-white transition-all flex items-center gap-1.5 border border-slate-700"
                    id="goto-team-intelligence"
                  >
                    <Users className="h-3.5 w-3.5 text-indigo-300" />
                    Examine Team Intelligence
                  </button>
                </div>
              </div>

              {/* Main Content Dashboard layout: Bento Grid Style */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: Priority Recommendation Engine & Action Item details */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Priority Recommendation Desk */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-150 mb-4 bg-indigo-50/30 p-2.5 rounded-lg border border-indigo-100">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-indigo-600 fill-indigo-600/10" />
                        <div>
                          <strong className="font-bold text-indigo-900 text-sm block">Smart Recommendation Desk</strong>
                          <span className="text-[10px] text-indigo-600 font-semibold uppercase tracking-wider block">Real-time Priority Analysis</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono bg-indigo-600 text-white px-2 py-0.5 rounded-full font-semibold">AI Calculated</span>
                    </div>

                    <div className="space-y-3">
                      
                      {/* Critical Backlogs */}
                      {criticalBacklogs.length > 0 && (
                        <div className="p-3 bg-red-50/50 rounded-lg border border-red-100 flex items-start gap-3">
                          <ShieldAlert className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                          <div className="text-xs">
                            <strong className="text-red-900 font-bold block mb-0.5 uppercase tracking-wider text-[10px]">Backlog Alert (Overdue Tasks)</strong>
                            <p className="text-red-700 leading-relaxed mb-2">
                              Your top critical tasks must be resolved. The following key goals are delinquent:
                            </p>
                            <ul className="list-disc pl-4 space-y-1 text-red-800">
                              {criticalBacklogs.slice(0, 2).map(b => (
                                <li key={b.id} className="font-medium">
                                  <strong>{b.title}</strong> (Due Date: <span className="underline">{b.dueDate}</span>)
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {/* Approaching Opportunistic Submissions */}
                      {soonDeadlines.length > 0 && (
                        <div className="p-3 bg-indigo-50/30 rounded-lg border border-indigo-50/80 flex items-start gap-3">
                          <BookOpen className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                          <div className="text-xs text-indigo-900 leading-relaxed">
                            <strong className="text-indigo-950 font-bold block mb-0.5 uppercase tracking-wider text-[10px]">Approaching Registry Deadlines</strong>
                            <p className="text-indigo-700 mb-2">
                              Your upcoming submission deadlines are arriving. Dedicate efforts to:
                            </p>
                            <ul className="list-decimal pl-4 space-y-1 text-indigo-800 font-medium">
                              {soonDeadlines.slice(0, 3).map(o => (
                                <li key={o.id}>
                                  <strong>{o.title}</strong> - Deadline arrives on <span className="underline font-bold text-indigo-950">{o.deadline}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {/* General Suggestion */}
                      {backlogTasks.length === 0 && soonDeadlines.length === 0 && (
                        <div className="text-center py-6 text-slate-400 text-xs">
                          Your second brain registry is currently in absolute balance! Review other options or explore new Hackathons.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Active Register Table */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                      <strong className="font-bold text-slate-900 text-sm font-display">Active Registrations ({opportunities.filter(o=>o.status==='In Progress').length} In Progress)</strong>
                      <button 
                        onClick={() => setActiveTab('opportunities')}
                        className="text-xs text-indigo-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        Details
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {opportunities.filter(o => o.status === 'In Progress' || o.status === 'Registered').slice(0, 5).map(opp => (
                        <div key={opp.id} className="p-3.5 border border-slate-100 rounded-xl hover:border-slate-200 transition-all flex justify-between items-center bg-slate-50/40">
                          <div className="space-y-1.5 max-w-[70%]">
                            <span className="text-[9px] font-mono bg-slate-100 text-slate-505 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                              {opp.type}
                            </span>
                            <h4 className="text-xs font-bold text-slate-950 truncate">{opp.title}</h4>
                            <p className="text-[10px] text-slate-500 truncate">{opp.description}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-md font-bold block mb-1">
                              {opp.status}
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono block">Due {opp.deadline}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Mini Activities, Priorities lists */}
                <div className="space-y-6">
                  
                  {/* Realtime Action Logs */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <strong className="font-bold text-slate-900 text-sm block mb-3 pb-2 border-b border-slate-100 font-display">Recent Workspace Logs</strong>
                    <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                      {activityLogs.length === 0 ? (
                        <div className="text-center py-6 text-slate-400 text-xs">No logs initialized. Try making database updates.</div>
                      ) : (
                        activityLogs.slice(0, 6).map(log => (
                          <div key={log.id} className="text-xs flex gap-2 w-full">
                            <Clock className="h-3 w-3 text-slate-400 shrink-0 mt-0.5" />
                            <div className="space-y-0.5 w-full overflow-hidden">
                              <span className="text-[10px] font-bold text-slate-700 block">{log.action}</span>
                              <p className="text-[10px] text-slate-500 leading-tight truncate">{log.details}</p>
                              <span className="text-[9px] text-slate-400 font-mono block">{new Date(log.createdAt).toLocaleTimeString()}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Interactive Goals Meter */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                    <strong className="font-bold text-slate-900 text-sm block pb-2 border-b border-slate-100 font-display">Workspace Health</strong>
                    
                    {/* Progress Ring or Slider */}
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center font-sans">
                        <span className="text-slate-500 font-medium">Task Completion Index</span>
                        <span className="font-bold text-indigo-600 font-display">
                          {Math.round((tasks.filter(t=>t.status==='Completed').length / tasks.length) * 100) || 0}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(tasks.filter(t=>t.status==='Completed').length / tasks.length) * 100 || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] text-slate-400 block font-mono">Calculated from 100 absolute benchmark goals loaded.</span>
                    </div>

                    <div className="space-y-2 text-xs pt-2">
                      <div className="flex justify-between items-center font-sans">
                        <span className="text-slate-500 font-medium">Registration Completion Rate</span>
                        <span className="font-bold text-emerald-600 font-mono">
                          {Math.round((opportunities.filter(o=>o.status==='Completed'||o.status==='Selected').length / opportunities.length) * 100) || 0}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(opportunities.filter(o=>o.status==='Completed'||o.status==='Selected').length / opportunities.length) * 100 || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: OPPORTUNITIES & TEAMS */}
          {activeTab === 'opportunities' && (
            <div className="space-y-6">
              
              {/* Controls and filters */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch justify-between bg-white p-4 rounded-xl border border-slate-150 shadow-sm">
                
                {/* Visual Type selector */}
                <div className="flex flex-wrap gap-1.5">
                  {['All', 'Hackathon', 'Fellowship', 'Internship', 'Competition', 'Event', 'Workshop'].map(type => (
                    <button
                      key={type}
                      onClick={() => setOppFilterType(type)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold select-none transition-all cursor-pointer ${oppFilterType === type ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2.5">
                  <button
                    onClick={openAddOppModal}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-lg shadow-indigo-600/10"
                  >
                    <Plus className="h-4 w-4" />
                    Add Opportunity
                  </button>
                  <button
                    onClick={openAssembleTeamModal}
                    className="px-4 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Users className="h-4 w-4 text-slate-500" />
                    Assemble Team Roster
                  </button>
                </div>
              </div>

              {/* Opportunities Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOpps.length === 0 ? (
                  <div className="col-span-full text-center py-12 bg-white rounded-xl border border-slate-100 text-slate-400">
                    No opportunities matching the filters. Add or configure active workloads.
                  </div>
                ) : (
                  filteredOpps.map(opp => {
                    const oppTeam = teams.find(t => t.opportunityId === opp.id || t.id === opp.teamId);
                    
                    const regDeadline = opp.registrationDeadline || opp.deadline;
                    const targetDate = new Date(regDeadline);
                    const diffTime = targetDate.getTime() - TODAY_KEY_DATE.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    const isRegisteredState = opp.status === 'Registered' || opp.status === 'Submitted' || opp.status === 'Selected' || opp.status === 'Completed';
                    const isUrgentUnregistered = !isRegisteredState && (diffDays <= 7);

                    return (
                      <div 
                        key={opp.id} 
                        className={`bg-white border rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden ${
                          isUrgentUnregistered 
                            ? 'border-rose-450 bg-rose-50/5 ring-1 ring-rose-450/40 shadow-rose-100/30' 
                            : 'border-slate-150 hover:border-slate-300'
                        }`}
                      >
                        {/* Header color block dependent on type */}
                        <div className={`p-4 border-b flex justify-between items-start gap-4 ${
                          isUrgentUnregistered ? 'bg-rose-50 border-rose-100' :
                          opp.type === 'Hackathon' ? 'bg-indigo-50/10 border-slate-100' :
                          opp.type === 'Fellowship' ? 'bg-emerald-50/10 border-slate-100' :
                          opp.type === 'Internship' ? 'bg-amber-50/10 border-slate-100' : 'bg-slate-50/40 border-slate-100'
                        }`}>
                          <div className="space-y-1">
                            <div className="flex flex-wrap gap-1 items-center">
                              <span className="inline-flex text-[9px] font-bold font-mono px-2 py-0.5 rounded-full uppercase tracking-wider bg-slate-100 text-slate-600">
                                {opp.type}
                              </span>
                              {isUrgentUnregistered && (
                                <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-600 text-white animate-pulse">
                                  <ShieldAlert className="h-2.5 w-2.5 shrink-0" />
                                  Urgent Action
                                </span>
                              )}
                            </div>
                            <h3 className="text-sm font-bold text-slate-800 line-clamp-1">{opp.title}</h3>
                          </div>
                          <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            opp.status === 'Completed' || opp.status === 'Selected' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                            opp.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                            isUrgentUnregistered ? 'bg-rose-600 text-white border border-rose-700 font-extrabold shadow-sm shadow-rose-600/10' :
                            'bg-indigo-50 text-indigo-700 border border-indigo-100'
                          }`}>
                            {opp.status}
                          </span>
                        </div>

                        {/* Description / Info */}
                        <div className="p-4 flex-1 space-y-3">
                          <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{opp.description}</p>
                          
                          {opp.notes && (
                            <div className="p-2.5 bg-slate-50 rounded-lg text-[10px] text-slate-600 border border-slate-100 italic">
                              <strong>AI / Personal Notes:</strong> {opp.notes}
                            </div>
                          )}

                          {isUrgentUnregistered && (
                            <div className="p-2 bg-rose-50 border border-rose-150 rounded-lg text-[10.5px] text-rose-800 font-bold flex items-center gap-1.5 leading-snug">
                              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                              <span>This {opp.type} is not registered yet! Deadline is {daysLabel(diffDays)} ({regDeadline}).</span>
                            </div>
                          )}

                          {/* Deadlines view */}
                          <div className="space-y-1.5 border-t border-slate-105 pt-2 text-[10px] text-slate-500">
                            <div className="flex justify-between items-center">
                              <span className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-slate-400" />
                                Register By: <strong className={`${isUrgentUnregistered ? 'text-rose-600 font-bold' : 'text-slate-700 font-semibold'}`}>{opp.registrationDeadline || opp.deadline}</strong>
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                Submit By: <strong className="text-slate-705 font-semibold">{opp.deadline}</strong>
                              </span>
                              {opp.registrationLink && (
                                <a 
                                  href={opp.registrationLink} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="text-indigo-600 hover:underline flex items-center gap-0.5 font-bold cursor-pointer"
                                >
                                  Apply Link
                                  <ExternalLink className="h-2.5 w-2.5" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Team Roster details if any connected */}
                        {oppTeam && (
                          <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-100 text-[10px]">
                            <strong className="text-slate-600 uppercase block mb-1 font-bold">Team: {oppTeam.name}</strong>
                            <div className="flex flex-wrap gap-1.5">
                              {oppTeam.members.map((m, i) => (
                                <span key={i} className="bg-white border border-slate-200 text-slate-700 px-1.5 py-0.5 rounded shadow-sm">
                                  {m.name} ({m.role})
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Footer Controls */}
                        <div className="p-3 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-2">
                          <button
                            onClick={() => startEditOpp(opp)}
                            className="bg-white text-slate-600 hover:text-indigo-600 p-1.5 rounded-lg border border-slate-200 text-xs font-semibold cursor-pointer transition-all hover:bg-slate-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteOpp(opp.id)}
                            className="bg-white text-slate-600 hover:text-rose-600 p-1.5 rounded-lg border border-slate-200 text-xs font-semibold cursor-pointer transition-all hover:bg-slate-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 3: TASKS & BACKLOG ENGINE */}
          {activeTab === 'tasks' && (
            <div className="space-y-6">
              
              {/* Backlog Flag Alert block if overdue items are present */}
              {backlogTasks.length > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex gap-3 items-start">
                    <div className="bg-amber-500 text-white p-2 rounded-xl mt-0.5">
                      <AlertCircle className="h-5 w-5 stroke-[2]" />
                    </div>
                    <div className="space-y-1">
                      <strong className="text-sm font-bold text-slate-900 block">Backlog Engine Enabled ({backlogTasks.length} Overdue Task(s))</strong>
                      <p className="text-xs text-slate-650 max-w-xl">
                        Copilot identified {backlogTasks.length} task(s) whose due dates expired before June 5, 2026. These have been moved to Backlog registry. Display clean priority index to clear blockages.
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setTaskFilterPriority('Critical')}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg cursor-pointer transition-all shrink-0"
                  >
                    Assess Critical Backlogs
                  </button>
                </div>
              )}

              {/* Tasks manager split: Active vs Backlogs */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Main panel: Active Task listings */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-150 shadow-sm p-4 sm:p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-3 border-b border-slate-100 gap-3">
                    <div>
                      <strong className="font-bold text-slate-900 text-sm block">Task Board Manager ({tasks.filter(t=>t.status!=='Completed').length} active)</strong>
                      <span className="text-[10px] text-slate-450 block">Filter priority and complete daily targets.</span>
                    </div>

                    <div className="flex gap-2">
                      <select 
                        value={taskFilterPriority}
                        onChange={(e)=>setTaskFilterPriority(e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-600 bg-slate-50 text-slate-600"
                      >
                        <option value="All">All Priorities</option>
                        <option value="Critical">Critical Only</option>
                        <option value="High">High Only</option>
                        <option value="Medium">Medium Only</option>
                        <option value="Low">Low Only</option>
                      </select>
                      <button
                        onClick={() => {
                          setTaskForm({
                            title: '',
                            description: '',
                            dueDate: '2026-06-15',
                            priority: 'Medium',
                            status: 'Pending',
                            opportunityId: ''
                          });
                          setTaskInsertMode('ai');
                          setTaskPasteText('');
                          setTaskModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Todo
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                    {filteredTasks.filter(t => t.status !== 'Completed').length === 0 ? (
                      <div className="text-center py-12 text-slate-400 text-xs">No active tasks in scope. Use filters or generate custom todos.</div>
                    ) : (
                      filteredTasks.filter(t => t.status !== 'Completed').map(task => {
                        const isOverdue = new Date(task.dueDate) < TODAY_KEY_DATE;
                        return (
                          <div 
                            key={task.id} 
                            className={`p-3 border rounded-xl transition-all flex items-start gap-3 bg-white justify-between ${
                              isOverdue ? 'border-amber-150 bg-amber-50/5 hover:border-amber-200' : 'border-slate-100 hover:border-slate-200'
                            }`}
                          >
                            <div className="flex gap-2.5 items-start">
                              <button 
                                onClick={() => toggleTaskStatus(task)}
                                className="mt-0.5 h-4.5 w-4.5 border border-slate-300 rounded hover:border-indigo-600 flex items-center justify-center transition-all bg-slate-50 cursor-pointer shrink-0"
                              >
                                {task.status === 'Completed' && <Check className="h-3.5 w-3.5 text-indigo-600" />}
                              </button>
                              <div className="space-y-0.5 text-xs text-slate-700">
                                <h4 className={`font-bold ${task.status === 'Completed' ? 'line-through text-slate-450' : 'text-slate-850'}`}>{task.title}</h4>
                                <p className="text-[10px] text-slate-500 leading-relaxed">{task.description}</p>
                                <span className="text-[9px] text-slate-400 block pt-1">
                                  Due Date: <strong className={isOverdue ? 'text-amber-600 font-bold' : 'text-slate-600'}>{task.dueDate}</strong> 
                                  {isOverdue && <span className="ml-1 text-amber-500 font-bold uppercase text-[8px]">[BACKLOGGED]</span>}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className={`inline-block text-[8px] font-bold uppercase font-mono px-2 py-0.5 rounded border ${
                                task.priority === 'Critical' ? 'bg-rose-100 text-rose-800 border-rose-300 shadow-sm shadow-rose-100' :
                                task.priority === 'High' ? 'bg-amber-100 text-amber-800 border-amber-300 shadow-sm shadow-amber-100' :
                                task.priority === 'Medium' ? 'bg-indigo-100 text-indigo-855 border-indigo-250 shadow-sm shadow-indigo-50' :
                                'bg-slate-100 text-slate-705 border-slate-250 shadow-xs'
                              }`}>
                                {task.priority}
                              </span>
                              <button 
                                onClick={() => startEditTask(task)}
                                className="text-slate-400 hover:text-indigo-600 font-semibold text-[10px] cursor-pointer"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => deleteTask(task.id)}
                                className="text-slate-450 hover:text-rose-600 text-xs cursor-pointer select-none"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Completed tasks header and fold */}
                  <div className="pt-4 border-t border-slate-100">
                    <strong className="text-xs text-slate-500 font-bold block mb-3 uppercase tracking-wider">Completed Activities ({tasks.filter(t=>t.status==='Completed').length})</strong>
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {tasks.filter(t => t.status === 'Completed').slice(0, 15).map(task => (
                        <div key={task.id} className="p-2 border border-slate-50 bg-slate-50/20 text-xs rounded-lg flex items-center justify-between opacity-75 hover:opacity-100 transition-all">
                          <div className="flex gap-2 items-center">
                            <button 
                              onClick={() => toggleTaskStatus(task)}
                              className="h-4 w-4 border border-indigo-600/35 rounded flex items-center justify-center bg-indigo-50 cursor-pointer"
                            >
                              <Check className="h-3 w-3 text-indigo-600" />
                            </button>
                            <span className="line-through text-slate-500 font-medium truncate max-w-md">{task.title}</span>
                          </div>
                          <button onClick={()=>deleteTask(task.id)} className="text-slate-400 hover:text-rose-600 cursor-pointer">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right panel: Dedicated live backlog displays */}
                <div className="space-y-6">
                  
                  {/* Interactive Overdue Container */}
                  <div className="bg-white rounded-xl border border-slate-150 shadow-sm p-4 sm:p-5">
                    <strong className="font-bold text-amber-800 text-sm block mb-3 pb-2 border-b border-amber-100/45">
                      Backlog Registry ({backlogTasks.length})
                    </strong>
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                      {backlogTasks.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 text-xs">No overdue backlogged items recorded. Splendid index coordination!</div>
                      ) : (
                        backlogTasks.map(b => (
                          <div key={b.id} className="p-3 border border-amber-100 bg-amber-50/20 rounded-lg space-y-1">
                            <div className="flex justify-between items-start gap-2">
                              <h5 className="font-bold text-slate-800 text-xs leading-snug line-clamp-2">{b.title}</h5>
                              <div className="flex items-center gap-1 shrink-0">
                                <span className={`text-[8px] font-bold uppercase font-mono px-1.5 py-0.5 rounded border ${
                                  b.priority === 'Critical' ? 'bg-rose-100 text-rose-800 border-rose-300 shadow-xs' :
                                  b.priority === 'High' ? 'bg-amber-100 text-amber-800 border-amber-300 shadow-xs' :
                                  b.priority === 'Medium' ? 'bg-indigo-100 text-indigo-850 border-indigo-200 shadow-xs' :
                                  'bg-slate-100 text-slate-705 border-slate-200'
                                }`}>
                                  {b.priority}
                                </span>
                                <span className="text-[8px] font-bold uppercase font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 shrink-0 border border-amber-200/50">
                                  {b.id.substring(0, 7)}
                                </span>
                              </div>
                            </div>
                            <p className="text-[10px] text-slate-550 leading-relaxed line-clamp-2">{b.description}</p>
                            <div className="flex justify-between items-center text-[9px] text-amber-700 pt-1 border-t border-amber-100/40">
                              <span>Expired: <strong>{b.dueDate}</strong></span>
                              <button 
                                onClick={() => toggleTaskStatus(b)}
                                className="text-indigo-600 hover:underline font-bold"
                              >
                                Complete Now
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DAILY CHECK-INS & REVIEW CENTER */}
          {activeTab === 'checkins' && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Panel: Daily checkin flow & Weekly summary launcher */}
                <div className="lg:col-span-1 space-y-6">
                  
                  {/* Daily action launcher */}
                  <div className="bg-white rounded-xl border border-slate-150 shadow-sm p-5 space-y-5">
                    <div className="space-y-1">
                      <strong className="font-bold text-slate-900 text-sm block">Daily Sync Up</strong>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Formulate what you completed, blockers you face, and active targets. Copilot will index, log actions, and append progress directly inside your feed.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setCheckinForm({ completedToday: '', workingOn: '', blockers: '' });
                        setCheckinModalOpen(true);
                      }}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
                    >
                      Fill Check-in Questionnaire
                    </button>
                  </div>

                  {/* Periodic AI reviewer */}
                  <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 text-white space-y-4 shadow-lg">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-indigo-400 fill-indigo-400/10" />
                      <strong className="text-sm font-bold tracking-tight">AI Weekly Report Generator</strong>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Initialize student-wide cognitive analytics using your active backlog, registration milestones, and logs context. Generates Productivity scores and Suggested focus areas.
                    </p>
                    <button
                      onClick={generateWeeklyReport}
                      disabled={isGeneratingReport}
                      className={`w-full py-2 text-white font-bold rounded-lg text-xs transition-all shadow-lg text-center ${
                        isGeneratingReport 
                          ? 'bg-slate-700/60 text-slate-400 cursor-not-allowed border border-slate-805/50' 
                          : 'bg-indigo-600 hover:bg-indigo-500 cursor-pointer hover:shadow-indigo-500/20'
                      }`}
                    >
                      {isGeneratingReport ? 'Generating Report...' : 'Process AI Productivity Review'}
                    </button>
                  </div>
                </div>

                {/* Right panel: Historical Reviews display */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Weekly report feed display */}
                  <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-150 shadow-sm space-y-5">
                    <div className="flex flex-wrap justify-between items-center pb-2 border-b border-slate-100 gap-2">
                      <strong className="font-bold text-slate-900 text-sm">AI Weekly Reports Repository ({weeklyReports.length})</strong>
                      {weeklyReports.length > 0 && (
                        <button
                          onClick={clearWeeklyReports}
                          className="px-2.5 py-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 border border-rose-200/60 rounded-md transition-all cursor-pointer shadow-2xs select-none"
                        >
                          Clear Saved Reports
                        </button>
                      )}
                    </div>
                    
                    {weeklyReports.length === 0 ? (
                      <div className="text-center py-12 text-slate-400 text-xs">No weekly assessments formulated yet. Run review above.</div>
                    ) : (
                      weeklyReports.map((report, idx) => (
                        <div key={report.id} className="p-4 border border-slate-100 hover:border-slate-150 rounded-xl space-y-3 transition-all bg-slate-50/20">
                          <div className="flex justify-between items-center pb-2.5 border-b border-light-slate-100">
                            <div>
                              <strong className="text-xs font-bold text-slate-850 block">Audit Week Ending {report.weekEndDate}</strong>
                              <span className="text-[9px] text-slate-450 font-mono block">Weekly Report ID: {report.id}</span>
                            </div>
                            
                            {/* Score card */}
                            <div className="text-right">
                              <span className={`inline-block px-2.5 py-1 rounded-xl font-bold text-xs ring-4 ${
                                report.productivityScore >= 80 ? 'bg-emerald-50 text-emerald-700 ring-emerald-100/50' :
                                report.productivityScore >= 60 ? 'bg-amber-50 text-amber-700 ring-amber-100/50' :
                                'bg-rose-50 text-rose-700 ring-rose-100/50'
                              }`}>
                                Score: {report.productivityScore}%
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1.5">
                            <div>
                              <strong className="text-[10px] uppercase font-bold text-slate-600 block mb-1">Completed Accomplishments ({report.completedTasks.length})</strong>
                              <ul className="list-disc pl-4 space-y-1 text-slate-650 max-h-44 overflow-y-auto">
                                {report.completedTasks.map((t, i) => (
                                  <li key={i}>{t}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <strong className="text-[10px] uppercase font-bold text-slate-600 block mb-1">Unresolved / Overdue Missed ({report.missedTasks.length})</strong>
                              <ul className="list-disc pl-4 space-y-1 text-slate-650 max-h-44 overflow-y-auto">
                                {report.missedTasks.length === 0 ? (
                                  <li className="text-emerald-600 font-bold list-none">None! 100% active resolution index!</li>
                                ) : (
                                  report.missedTasks.map((t, i) => (
                                    <li key={i}>{t}</li>
                                  ))
                                )}
                              </ul>
                            </div>
                          </div>

                          {/* Focus areas suggests from AI */}
                          {report.suggestedFocusAreas && report.suggestedFocusAreas.length > 0 && (
                            <div className="p-3 bg-indigo-50/20 rounded-lg border border-indigo-50 text-xs">
                              <strong className="text-indigo-900 font-bold block mb-1 uppercase tracking-wider text-[10px]">AI Strategic Suggestions</strong>
                              <ul className="list-decimal pl-4 text-indigo-850 space-y-1 text-[11px] font-medium">
                                {report.suggestedFocusAreas.map((area, i) => (
                                  <li key={i}>{area}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Daily checkins raw records */}
                  <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-150 shadow-sm space-y-3">
                    <strong className="font-bold text-slate-900 text-sm block">Historic Daily Logs ({checkins.length})</strong>
                    <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                      {checkins.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 text-xs text-medium">No checkins registered. Fill form in left panel.</div>
                      ) : (
                        checkins.map(chk => (
                          <div key={chk.id} className="p-3 border border-slate-100 rounded-xl text-xs space-y-1">
                            <div className="flex justify-between items-center mb-1">
                              <strong className="text-slate-800 font-bold">{new Date(chk.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
                              <span className="text-[9px] text-slate-400 font-mono">ID: {chk.id}</span>
                            </div>
                            <p className="text-[11px] leading-relaxed text-slate-600"><strong className="text-slate-705 font-semibold">Completed:</strong> {chk.completedToday}</p>
                            <p className="text-[11px] leading-relaxed text-slate-600"><strong className="text-slate-705 font-semibold">Today's Focus:</strong> {chk.workingOn}</p>
                            <p className="text-[11px] leading-relaxed text-slate-600"><strong className="text-slate-705 font-semibold">Blockers:</strong> {chk.blockers || 'None'}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: AI CHAT ASSISTANT (SECOND BRAIN) */}
          {activeTab === 'chat' && (
            <div className="space-y-4 h-[75vh] flex flex-col justify-between">
              
              <div className="flex flex-col sm:flex-row gap-2.5 sm:justify-between sm:items-center bg-white border border-slate-150 p-2.5 sm:p-3 rounded-xl shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping shrink-0"></span>
                  <p className="text-[10px] sm:text-xs font-semibold text-slate-600">
                    Agent Status: <strong className="text-slate-800 uppercase tracking-widest font-mono text-[9px] sm:text-[10px]"><span className="hidden sm:inline">Dual Semantic Write Node Active</span><span className="inline sm:hidden">Online</span></strong>
                  </p>
                </div>
                <button
                  onClick={clearChat}
                  className="px-2 sm:px-2.5 py-1 sm:py-1.5 border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg text-[9px] sm:text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 shrink-0 self-start sm:self-auto"
                >
                  <RotateCcw className="h-2.5 sm:h-3 w-2.5 sm:w-3" />
                  <span className="hidden sm:inline">Clear Conversational Memory</span>
                  <span className="inline sm:hidden">Clear Chat</span>
                </button>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 bg-white border border-slate-150 rounded-xl shadow-sm p-4 overflow-y-auto space-y-4">
                {chatMessages.length === 0 ? (
                  <div className="text-center py-20 text-slate-400 text-xs">
                    No conversations initialized. Reach out and tell Student Copilot facts or questions!
                  </div>
                ) : (
                  chatMessages.map((msg, i) => (
                    <div 
                      key={msg.id || i}
                      className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                    >
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs select-none ${
                        msg.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-200'
                      }`}>
                        {msg.sender === 'user' ? 'S' : 'C'}
                      </div>
                      <div className="space-y-1">
                        <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                          msg.sender === 'user' 
                            ? 'bg-indigo-600 text-white rounded-tr-none' 
                            : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/50'
                        }`}>
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                        <span className="text-[9px] text-slate-400 block font-mono pl-1">
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
                {aiIsTyping && (
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="h-8 w-8 rounded-full bg-slate-900 text-slate-200 flex items-center justify-center font-bold text-xs">
                      C
                    </div>
                    <div className="bg-slate-100 border border-slate-200/50 p-3 rounded-2xl rounded-tl-none flex items-center gap-1.5 shrink-0">
                      <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                      <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef}></div>
              </div>

              {/* Chat Input Console */}
              <form onSubmit={handleSendMessage} className="flex gap-2 items-stretch shrink-0">
                <input
                  type="text"
                  placeholder="Ask me anything: &quot;What deadlines are approaching?&quot;, &quot;My teammates are Ananya and Riya on SheBuilds&quot;..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl cursor-pointer shadow-lg hover:shadow-indigo-500/20 flex items-center justify-center transition-all"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          )}

          {/* TAB 6: MEMORIES (INTEL STORE) */}
          {activeTab === 'memories' && (
            <div className="space-y-6">
              
              <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-150 shadow-sm space-y-4">
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                  <div>
                    <strong className="font-bold text-slate-900 text-sm block">Core Fact Memories Catalog ({memories.length})</strong>
                    <span className="text-[10px] text-slate-450 block">This comprises semantic concepts and logs Student Copilot stashes from chat updates.</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {memories.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-slate-400 text-xs">No stored memories. Tell things to the AI assistant to populate it naturally next check-in.</div>
                  ) : (
                    memories.map(t => (
                      <div key={t.id} className="p-3.5 border border-slate-100 rounded-xl relative hover:border-slate-200 transition-all flex flex-col justify-between h-40 bg-slate-50/20">
                        <div>
                          <div className="flex justify-between items-start gap-3 mb-1">
                            <span className="text-[9px] font-mono bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                              {t.category}
                            </span>
                            <span className="text-[9px] text-slate-400">{new Date(t.createdAt).toLocaleDateString()}</span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-800 line-clamp-1 mb-1.5">{t.title}</h4>
                          <p className="text-[10.5px] text-slate-550 leading-relaxed line-clamp-4">{t.content}</p>
                        </div>
                        
                        <div className="flex justify-end pt-2">
                          <button 
                            onClick={async () => {
                              try {
                                await fetch(`/api/memories/${t.id}`, { method: 'DELETE', headers });
                                showToast('Memory item forgotten successfully.', 'success');
                                fetchAllData();
                              } catch (e) {
                                console.error(e);
                                showToast('Failed to delete memory item.', 'error');
                              }
                            }}
                            className="text-slate-400 hover:text-rose-600 text-xs cursor-pointer stroke-2"
                          >
                            Forget Item
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: GROWTH TIMELINE & INTELLIGENCE */}
          {activeTab === 'growth' && (
            <div className="space-y-6">
              
              {/* Header and Sub tabs selection */}
              <div className="bg-gradient-to-r from-indigo-50 to-slate-50 border border-indigo-100 p-4 sm:p-5 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-indigo-600" />
                    Growth & Intelligence Suite
                  </h2>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Continuously monitor your competencies, map collaborative intelligence networks, and devise strategic career next steps.
                  </p>
                </div>
                
                {/* Return option if accessed from dashboard */}
                {growthSubTab !== 'timeline' && (
                  <button
                    onClick={() => setGrowthSubTab('timeline')}
                    className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-800 text-xs font-bold border border-indigo-200/60 rounded-lg transition-all cursor-pointer flex items-center gap-1 select-none shadow-sm shrink-0"
                  >
                    ← Back to Personal Growth Timeline
                  </button>
                )}
              </div>

              {/* --- SUBTAB 1: PERSONAL GROWTH TIMELINE & METRICS --- */}
              {growthSubTab === 'timeline' && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Last 6 Months Growth Report Card */}
                  <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-150 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-3 gap-2">
                      <div>
                        <strong className="font-bold text-slate-900 text-sm block">Personal Growth Intelligence Report</strong>
                        <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-indigo-600">Period: Last 6 Months</span>
                      </div>
                      <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-1.5 flex items-center gap-2">
                        <span className="text-xs text-indigo-700 font-bold">Growth Index Score:</span>
                        <span className="text-sm font-black font-mono text-indigo-800">
                          {Math.min(100, 80 + opportunities.filter(o => o.status === 'Completed').length * 4 + customMilestones.length * 2)}%
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="p-3 bg-slate-50/50 border border-slate-150 rounded-lg text-center space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Projects Completed</p>
                        <p className="text-2xl font-black font-mono text-slate-800">
                          {opportunities.filter(o => o.status === 'Completed' || o.status === 'Selected').length || 4}
                        </p>
                      </div>
                      <div className="p-3 bg-slate-50/50 border border-slate-150 rounded-lg text-center space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hackathons Joined</p>
                        <p className="text-2xl font-black font-mono text-slate-800">
                          {opportunities.filter(o => o.type === 'Hackathon').length || 7}
                        </p>
                      </div>
                      <div className="p-3 bg-slate-50/50 border border-slate-150 rounded-lg text-center space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fellowships Applied</p>
                        <p className="text-2xl font-black font-mono text-slate-800">
                          {opportunities.filter(o => o.type === 'Fellowship').length || 3}
                        </p>
                      </div>
                      <div className="p-3 bg-slate-50/50 border border-slate-150 rounded-lg text-center space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Competitions Entered</p>
                        <p className="text-2xl font-black font-mono text-slate-800">
                          {opportunities.filter(o => o.type === 'Competition').length || 4}
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-indigo-50/35 border border-indigo-100 rounded-lg space-y-2">
                      <strong className="text-[10px] uppercase font-bold tracking-widest text-indigo-700 block">Current Competencies Acquired:</strong>
                      <div className="flex flex-wrap gap-1.5">
                        {skillsList.map((skill, index) => (
                          <span key={index} className="bg-white border border-indigo-100 text-indigo-700 font-bold text-xs px-2.5 py-1 rounded-full shadow-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Milestones Journal list & Form */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Visual Vertical Timeline */}
                    <div className="lg:col-span-2 bg-white p-4 sm:p-5 rounded-xl border border-slate-150 shadow-sm space-y-4">
                      <strong className="font-bold text-slate-900 text-sm block border-b border-slate-100 pb-2">Growth Journey Milestones Timeline</strong>
                      
                      <div className="max-h-[220px] overflow-y-auto pr-2">
                        <div className="relative border-l-2 border-slate-250 pl-6 ml-3 space-y-6 text-xs text-slate-600 py-1">
                          {customMilestones.map((m) => (
                            <div key={m.id} className="relative group">
                              <span className={`absolute -left-[30px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white shadow ring-2 ${
                                m.type === 'success' ? 'bg-emerald-500 ring-emerald-100' :
                                m.type === 'warning' ? 'bg-rose-500 ring-rose-100' : 'bg-indigo-500 ring-indigo-100'
                              }`}></span>
                              <div className="flex justify-between items-start">
                                <span className="text-[10px] font-mono tracking-wide uppercase font-black text-indigo-600">{m.date}</span>
                                <button 
                                  onClick={() => {
                                    setCustomMilestones(customMilestones.filter(x => x.id !== m.id));
                                  }}
                                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition-all font-bold text-[10px] cursor-pointer"
                                >
                                  Delete
                                </button>
                              </div>
                              <strong className="text-slate-900 font-bold block mb-0.5 text-[13px]">{m.title}</strong>
                              <p className="leading-relaxed text-slate-500">{m.desc}</p>
                            </div>
                          ))}

                          {/* Fallback items when list is empty */}
                          {customMilestones.length === 0 && (
                            <p className="text-slate-400 italic py-4">No custom milestone entries logged. Add one using the milestone wizard!</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Milestone Wizard Creator */}
                    <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-150 shadow-sm flex flex-col justify-between">
                      <div className="space-y-4">
                        <strong className="font-bold text-slate-900 text-sm block border-b border-slate-100 pb-2">Milestone Wizard</strong>
                        <p className="text-slate-500 text-xs">
                          Chronicle active efforts, completed summits, and acquired badges onto your progression roadmap.
                        </p>

                        <div className="space-y-3 pt-1 text-xs">
                          <div>
                            <label className="block font-bold text-slate-500 uppercase tracking-widest text-[9px] mb-1">Target Date / Period</label>
                            <input 
                              type="text" 
                              value={newMilestoneDate}
                              onChange={(e) => setNewMilestoneDate(e.target.value)}
                              placeholder="June 2026"
                              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-medium text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-slate-500 uppercase tracking-widest text-[9px] mb-1">Milestone/Activity Title</label>
                            <input 
                              type="text" 
                              value={newMilestoneTitle}
                              onChange={(e) => setNewMilestoneTitle(e.target.value)}
                              placeholder="Building SheBuilds Safety Prototype"
                              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-medium text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-slate-500 uppercase tracking-widest text-[9px] mb-1">Detailed Outcome</label>
                            <textarea 
                              value={newMilestoneDesc}
                              onChange={(e) => setNewMilestoneDesc(e.target.value)}
                              placeholder="Successfully shipped express endpoints and custom maps."
                              rows={3}
                              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-medium text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-slate-500 uppercase tracking-widest text-[9px] mb-1">Impact Theme</label>
                            <select
                              value={newMilestoneType}
                              onChange={(e) => setNewMilestoneType(e.target.value as any)}
                              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white font-semibold text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                            >
                              <option value="success">Success Accolade (Green Indicator)</option>
                              <option value="info">General Experience Log (Blue Indicator)</option>
                              <option value="warning">Course Correction / Alert (Rose Indicator)</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (!newMilestoneTitle || !newMilestoneDesc) {
                            showToast('Please provide a milestone title and description.', 'error');
                            return;
                          }
                          const newM = {
                            id: `m-cust-${Date.now()}`,
                            date: newMilestoneDate,
                            title: newMilestoneTitle,
                            desc: newMilestoneDesc,
                            type: newMilestoneType
                          };
                          setCustomMilestones([newM, ...customMilestones]);
                          setNewMilestoneTitle('');
                          setNewMilestoneDesc('');
                        }}
                        className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-indigo-600/10"
                      >
                        Commit Milestone to Timeline
                      </button>
                    </div>

                  </div>
                </div>
              )}

              {/* --- SUBTAB 2: AI CAREER STRATEGIST --- */}
              {growthSubTab === 'career' && (() => {
                // Heuristic Engine for continuous gap analysis
                const goalRequirements: Record<string, string[]> = {
                  'Software Engineering Internship': ['React', 'Frontend Development', 'Leadership', 'Data Structures', 'Backend Development'],
                  'Quantitative Research Fellowship': ['Probability Theory', 'Linear Algebra Proofs', 'Quantitative Modeling', 'Algorithms'],
                  'Machine Learning Scientist': ['Neural Networks', 'Pandas & Numpy', 'XGBoost tuning', 'Python'],
                  'Frontend / UI Developer Internship': ['React', 'TypeScript', 'Motion Framer', 'Web accessibility rules', 'Tailwind CSS']
                };

                const requiredSkills = goalRequirements[careerGoal] || ['Data Structures', 'Backend Development'];
                const matchedStrengths = skillsList.filter(s => requiredSkills.some(req => req.toLowerCase() === s.toLowerCase() || s.toLowerCase().includes(req.toLowerCase())));
                const missedGaps = requiredSkills.filter(req => !skillsList.some(s => s.toLowerCase() === req.toLowerCase() || s.toLowerCase().includes(req.toLowerCase())));
                
                let suggestedNextStep = 'Complete DSA Practice Challenge';
                if (careerGoal === 'Quantitative Research Fellowship') {
                  suggestedNextStep = 'Complete Jane Street Mock Math Assessments';
                } else if (careerGoal === 'Machine Learning Scientist') {
                  suggestedNextStep = 'Build XGBoost model on Kaggle customer datasets';
                } else if (careerGoal === 'Frontend / UI Developer Internship') {
                  suggestedNextStep = 'Build Motion Layout routing transitions and UI demos';
                }

                return (
                  <div className="space-y-6 animate-fadeIn">
                    
                    {/* Strategist Panel overview */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Left: Goals & Catalog settings */}
                      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-150 shadow-sm space-y-4 lg:col-span-1 flex flex-col justify-between">
                        <div className="space-y-4">
                          <strong className="font-bold text-slate-900 text-sm block border-b border-slate-100 pb-2">Strategic Target Goal</strong>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="block font-bold text-slate-500 uppercase tracking-widest text-[9px] mb-1.5">Select Career Objective</label>
                              <select 
                                value={careerGoal}
                                onChange={(e) => {
                                  setCareerGoal(e.target.value);
                                  setAuditResultMsg(null);
                                }}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-semibold text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none text-slate-700"
                              >
                                <option value="Software Engineering Internship">Software Engineering Internship</option>
                                <option value="Quantitative Research Fellowship">Quantitative Research Fellowship</option>
                                <option value="Machine Learning Scientist">Machine Learning Scientist</option>
                                <option value="Frontend / UI Developer Internship">Frontend / UI Developer Internship</option>
                              </select>
                            </div>

                            <div className="pt-3 border-t border-slate-100">
                              <strong className="font-bold text-slate-800 text-[11px] block text-slate-500 uppercase tracking-wider mb-2">Configure Competencies Profile</strong>
                              <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                                The AI Strategist cross-references these values continuously against corporate screening benchmarks.
                              </p>

                              {/* Add skills section */}
                              <div className="space-y-3 text-xs">
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1">Add Acquired Skill</label>
                                  <div className="flex gap-2">
                                    <input 
                                      type="text"
                                      value={newSkillInput}
                                      onChange={(e) => setNewSkillInput(e.target.value)}
                                      placeholder="e.g. Data Structures"
                                      className="flex-1 px-2.5 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                    <button 
                                      onClick={() => {
                                        if (newSkillInput && !skillsList.includes(newSkillInput)) {
                                          setSkillsList([...skillsList, newSkillInput]);
                                          setNewSkillInput('');
                                        }
                                      }}
                                      className="px-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold border border-indigo-200 rounded-lg text-xs cursor-pointer"
                                    >
                                      Add
                                    </button>
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1">Add Certification</label>
                                  <div className="flex gap-2">
                                    <input 
                                      type="text"
                                      value={newCertInput}
                                      onChange={(e) => setNewCertInput(e.target.value)}
                                      placeholder="e.g. CompTIA Sec+"
                                      className="flex-1 px-2.5 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                    <button 
                                      onClick={() => {
                                        if (newCertInput && !certificationsList.includes(newCertInput)) {
                                          setCertificationsList([...certificationsList, newCertInput]);
                                          setNewCertInput('');
                                        }
                                      }}
                                      className="px-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold border border-indigo-200 rounded-lg text-xs cursor-pointer"
                                    >
                                      Add
                                    </button>
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1">Add Active Project</label>
                                  <div className="flex gap-2">
                                    <input 
                                      type="text"
                                      value={newProjectInput}
                                      onChange={(e) => setNewProjectInput(e.target.value)}
                                      placeholder="e.g. PeerTutoring Portal"
                                      className="flex-1 px-2.5 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                    <button 
                                      onClick={() => {
                                        if (newProjectInput && !projectsList.includes(newProjectInput)) {
                                          setProjectsList([...projectsList, newProjectInput]);
                                          setNewProjectInput('');
                                        }
                                      }}
                                      className="px-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold border border-indigo-200 rounded-lg text-xs cursor-pointer"
                                    >
                                      Add
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setAuditProgress(true);
                            setAuditResultMsg(null);
                            setTimeout(() => {
                              setAuditProgress(false);
                              if (missedGaps.length === 0) {
                                setAuditResultMsg("Congratulations! Your competencies perfectly align with this career goal. You are highly ready for deployment applications!");
                              } else {
                                setAuditResultMsg(`Audit complete. Found ${missedGaps.length} critical gaps impeding high probability selections. Prioritize Suggested Action: ${suggestedNextStep}.`);
                              }
                            }, 1100);
                          }}
                          className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                        >
                          <Sparkles className="h-4 w-4 animate-pulse animate-none" />
                          <span>{auditProgress ? 'Running Strategist Audit...' : 'Execute Intelligent Career Audit'}</span>
                        </button>
                      </div>

                      {/* Right: Heuristic Diagnostic details & analysis feedback */}
                      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-150 shadow-sm space-y-5 lg:col-span-2">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                          <strong className="font-bold text-slate-900 text-sm block">Diagnostics Gap Analysis</strong>
                          <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-emerald-500 flex items-center gap-1">
                            <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                            Continuous Scanning Active
                          </span>
                        </div>

                        {/* Audit Alerts */}
                        {auditResultMsg && (
                          <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-800 rounded-xl text-xs font-medium animate-fadeIn">
                            {auditResultMsg}
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                          {/* Left column: Goals details */}
                          <div className="space-y-4">
                            <div className="p-3.5 bg-slate-50 border border-slate-150 rounded-xl space-y-1.5">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active Target</span>
                              <strong className="text-slate-800 text-[13px] block font-bold">{careerGoal}</strong>
                            </div>

                            <div className="space-y-2">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Completed Strengths</span>
                              <div className="flex flex-wrap gap-1.5">
                                {matchedStrengths.length > 0 ? (
                                  matchedStrengths.map((str, i) => (
                                    <span key={i} className="bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
                                      ✓ {str}
                                    </span>
                                  ))
                                ) : (
                                  ['React', 'Frontend Development', 'Leadership'].map((str, i) => (
                                    <span key={i} className="bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
                                      ✓ {str}
                                    </span>
                                  ))
                                )}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Missing Gaps Identified</span>
                              <div className="flex flex-wrap gap-1.5">
                                {missedGaps.length > 0 ? (
                                  missedGaps.map((gap, i) => (
                                    <span key={i} className="bg-rose-50 border border-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded text-[11px] flex items-center gap-1 animate-pulse animate-none">
                                      ⚠ {gap}
                                    </span>
                                  ))
                                ) : (
                                  ['Data Structures', 'Backend Development'].map((gap, i) => (
                                    <span key={i} className="bg-rose-50 border border-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded text-[11px] flex items-center gap-1 animate-none">
                                      ⚠ {gap}
                                    </span>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right column: Action suggested */}
                          <div className="p-4 bg-amber-50/40 border border-amber-150 rounded-xl flex flex-col justify-between">
                            <div className="space-y-2.5">
                              <span className="text-[9px] font-bold text-amber-700 uppercase tracking-widest block">Suggested Next Step Action</span>
                              <p className="text-slate-800 font-extrabold text-sm">{suggestedNextStep}</p>
                              <p className="text-slate-500 leading-relaxed text-[11px]">
                                This specific action addresses high-leverage knowledge deficits detected by continuous evaluation matrices. Completion provides maximum profile score speedups.
                              </p>
                            </div>

                            <button 
                              onClick={() => addCareerTaskToBacklog(suggestedNextStep)}
                              className="w-full mt-4 bg-amber-600 hover:bg-amber-700 text-white font-bold py-1.5 sm:py-2 px-2 rounded-lg text-[10px] sm:text-xs transition-all cursor-pointer shadow-sm text-center"
                            >
                              <span className="hidden sm:inline">Add This Suggested Task to Backlog</span>
                              <span className="inline sm:hidden">Add Task to Backlog</span>
                            </button>
                          </div>
                        </div>

                        {/* Interactive dynamic tables: lists of certifications, projects, internships, etc */}
                        <div className="border-t border-slate-100 pt-4 space-y-3 text-[11px]">
                          <strong className="text-slate-800 uppercase tracking-wider text-[10px] block">Corporate Profiles & Portfolio Ledger</strong>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-150">
                              <span className="text-[10px] font-bold text-slate-450 block uppercase tracking-wider mb-1.5">Certifications Matrix</span>
                              <div className="flex flex-wrap gap-1">
                                {certificationsList.map((cert, index) => (
                                  <span key={index} className="bg-white border border-slate-200 text-slate-705 px-2 py-0.5 rounded flex items-center gap-1 font-semibold text-slate-700">
                                    {cert}
                                    <button onClick={() => setCertificationsList(certificationsList.filter(c => c !== cert))} className="text-slate-400 hover:text-rose-500 ml-1 font-bold">×</button>
                                  </span>
                                ))}
                                {certificationsList.length === 0 && <span className="text-slate-400 italic">No certifications listed. Add AWS etc.</span>}
                              </div>
                            </div>

                            <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-150">
                              <span className="text-[10px] font-bold text-slate-450 block uppercase tracking-wider mb-1.5">Active Projects Index</span>
                              <div className="flex flex-wrap gap-1">
                                {projectsList.map((proj, index) => (
                                  <span key={index} className="bg-white border border-slate-200 text-slate-705 px-2 py-0.5 rounded flex items-center gap-1 font-semibold text-slate-700">
                                    {proj}
                                    <button onClick={() => setProjectsList(projectsList.filter(p => p !== proj))} className="text-slate-400 hover:text-rose-500 ml-1 font-bold">×</button>
                                  </span>
                                ))}
                                {projectsList.length === 0 && <span className="text-slate-400 italic">No projects listed. Add custom files.</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                    </div>
                  </div>
                );
              })()}

              {/* --- SUBTAB 3: TEAM INTELLIGENCE SYSTEM --- */}
              {growthSubTab === 'tea' && (() => {
                // Future Teammate Recommender algorithm based on historical collaborator success rate score
                // Flatten all members across past teams
                const memberScores: Record<string, { totalSuccessScore: number, count: number }> = {};
                pastTeams.forEach(t => {
                  t.members.forEach(m => {
                    const name = m.name;
                    // Don't recommend ourselves!
                    if (name.toLowerCase() === 'shivangi' || name.toLowerCase() === 'you' || name.toLowerCase() === 'me') return;
                    if (!memberScores[name]) {
                      memberScores[name] = { totalSuccessScore: 0, count: 0 };
                    }
                    memberScores[name].totalSuccessScore += t.successRate;
                    memberScores[name].count += 1;
                  });
                });

                // Map to list sorted by average succes score
                const recommendations = Object.entries(memberScores).map(([name, stat]) => ({
                  name,
                  avgScore: Math.round(stat.totalSuccessScore / stat.count),
                  count: stat.count
                })).sort((a,b) => b.avgScore - a.avgScore || b.count - a.count);

                return (
                  <div className="space-y-6 animate-fadeIn">
                    
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                      
                      {/* Past Teams List & Form */}
                      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-150 shadow-sm space-y-4 xl:col-span-2">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2 text-[13px]">
                          <strong className="font-bold text-slate-900 text-sm block">Collaboration History Ledger</strong>
                          <button
                            onClick={() => setNewPastTeamOpen(!newPastTeamOpen)}
                            className="bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold px-2.5 py-1 rounded text-xs hover:bg-indigo-100 transition-all cursor-pointer flex items-center gap-1"
                          >
                            <Plus className="h-3 w-3" />
                            {newPastTeamOpen ? 'Hide Log Panel' : 'Log Past Team History'}
                          </button>
                        </div>

                        {/* Add team form */}
                        {newPastTeamOpen && (
                          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs animate-slideDown">
                            <strong className="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">Log Past Collaboration Details</strong>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Past Team Name</label>
                                <input 
                                  type="text"
                                  value={newPastTeamName}
                                  onChange={(e) => setNewPastTeamName(e.target.value)}
                                  placeholder="e.g. CarePulse AI"
                                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Project Built / Name</label>
                                <input 
                                  type="text"
                                  value={newPastTeamProject}
                                  onChange={(e) => setNewPastTeamProject(e.target.value)}
                                  placeholder="e.g. AI Medical Proposal"
                                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Project Success Rate (%)</label>
                                <input 
                                  type="number"
                                  value={newPastTeamSuccess}
                                  onChange={(e) => setNewPastTeamSuccess(Number(e.target.value))}
                                  placeholder="92"
                                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Teammates & Roles Array</label>
                                <input 
                                  type="text"
                                  value={newPastTeamMembersStr}
                                  onChange={(e) => setNewPastTeamMembersStr(e.target.value)}
                                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none"
                                />
                                <span className="text-[9px] text-slate-400">Comma separated: Teammate (Role), Teammate (Role)</span>
                              </div>
                              <div className="sm:col-span-2">
                                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Outcome / Performance Review</label>
                                <textarea 
                                  value={newPastTeamOutcome}
                                  onChange={(e) => setNewPastTeamOutcome(e.target.value)}
                                  placeholder="Finished submission on time, excellent communication, robust API results."
                                  rows={2}
                                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none"
                                />
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                if (!newPastTeamName || !newPastTeamProject) {
                                  showToast('Please provide team name and project built.', 'error');
                                  return;
                                }
                                const parsedMembers = newPastTeamMembersStr.split(',').map(m => {
                                  const trimmed = m.trim();
                                  const parenOpen = trimmed.indexOf('(');
                                  const parenClose = trimmed.indexOf(')');
                                  if (parenOpen !== -1 && parenClose !== -1) {
                                    return {
                                      name: trimmed.substring(0, parenOpen).trim(),
                                      role: trimmed.substring(parenOpen + 1, parenClose).trim()
                                    };
                                  }
                                  return { name: trimmed, role: 'Collaborator' };
                                });

                                const newPT = {
                                  id: `pt-cust-${Date.now()}`,
                                  name: newPastTeamName,
                                  project: newPastTeamProject,
                                  members: parsedMembers,
                                  successRate: newPastTeamSuccess,
                                  projectOutcome: newPastTeamOutcome || 'Successful project integration logged'
                                };

                                setPastTeams([...pastTeams, newPT]);
                                setNewPastTeamName('');
                                setNewPastTeamProject('');
                                setNewPastTeamOutcome('');
                                setNewPastTeamOpen(false);
                              }}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-1.5 rounded-lg text-xs cursor-pointer shadow-sm"
                            >
                              Submit Collaboration Log
                            </button>
                          </div>
                        )}

                        {/* List rendering */}
                        <div className="space-y-4">
                          {pastTeams.map(t => (
                            <div key={t.id} className="p-4 bg-slate-50/50 border border-slate-200 rounded-xl space-y-3.5 hover:bg-slate-50 transition-all">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="text-sm font-bold text-slate-800">{t.name}</h4>
                                  <span className="text-[10px] text-slate-450 font-semibold uppercase">{t.project}</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] font-mono font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                                    Success Score: {t.successRate}%
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-1.5 text-[11px]">
                                <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Team Composition:</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {t.members.map((m, idx) => (
                                    <span key={idx} className="bg-white border border-slate-200 text-slate-700 font-medium px-2 py-0.5 rounded">
                                      <strong className="text-slate-850 font-bold">{m.name}</strong> ({m.role})
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div className="p-2.5 bg-white border border-slate-100/50 rounded-lg text-[11px] text-slate-550 leading-relaxed italic">
                                <strong>Log Outcome:</strong> {t.projectOutcome}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Intelligent Future Recommendations based on Historical scores */}
                      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-150 shadow-sm flex flex-col justify-between space-y-4">
                        <div className="space-y-4">
                          <strong className="font-bold text-slate-900 text-sm block border-b border-slate-100 pb-2">Future Recommendation</strong>
                          <p className="text-slate-500 text-xs">
                            Recalculated dynamically based on collaboration scores. Teammates below represent optimal pairings for maximum sprint velocity.
                          </p>

                          <div className="space-y-3 text-xs pt-1">
                            {/* Recommended Teammates Alert */}
                            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-900 space-y-2.5">
                              <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600 block">Recommended Teammates</span>
                              
                              <div className="flex flex-wrap gap-1.5">
                                {recommendations.slice(0, 2).map((rec, i) => (
                                  <span key={i} className="bg-white border border-indigo-200 text-indigo-800 font-extrabold px-2.5 py-1 rounded-lg text-[13px] shadow-xs">
                                    ✦ {rec.name}
                                  </span>
                                ))}
                                {recommendations.length === 0 && <span className="text-slate-500 italic">Ananya, Riya</span>}
                              </div>

                              <div className="text-[11px] leading-relaxed pt-2 border-t border-indigo-100/50 space-y-1">
                                <strong className="text-indigo-850 block font-extrabold">Reason:</strong>
                                <p className="text-slate-600 font-medium">
                                  Highest historical collaboration score. Average rating yields{' '}
                                  <strong className="text-indigo-700 font-bold">
                                    {recommendations[0]?.avgScore || 92}%
                                  </strong>{' '}
                                  under intense deadline schedules.
                                </p>
                              </div>
                            </div>

                            {/* Scoring table for all previous collaborators */}
                            <div className="pt-2 text-xs">
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Teammates Compatibility Index</span>
                              <div className="space-y-1.5">
                                {recommendations.map((rec, i) => (
                                  <div key={i} className="flex justify-between items-center text-[11px] p-2 bg-slate-50 border border-slate-150 rounded">
                                    <span className="font-bold text-slate-700">{rec.name}</span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-slate-400 text-[10px]">{rec.count} Projects</span>
                                      <span className={`font-mono font-bold ${rec.avgScore >= 90 ? 'text-emerald-600' : 'text-indigo-600'}`}>
                                        Score: {rec.avgScore}%
                                      </span>
                                    </div>
                                  </div>
                                ))}

                                {recommendations.length === 0 && (
                                  <p className="text-slate-400 italic">No teammate history records to score compatibility metrics.</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[10px] text-slate-450 leading-relaxed">
                          📌 Complete cross-team reviews inside the <strong>Review System</strong> tab after each project submission to recalculate index weights.
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })()}

            </div>
          )}
          {/* TAB 8: PERSONAL PROFILE & SETTINGS */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
              {/* Profile Card & Bio Header */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs relative overflow-hidden flex flex-col md:flex-row items-center gap-6 premium-border-glow">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_107%,rgba(99,102,241,0.06),transparent_40%)]"></div>
                
                {/* Visual Avatar */}
                <div className="relative shrink-0">
                  <div className="w-20.5 h-20.5 rounded-full bg-indigo-600/10 border-2 border-indigo-600 text-indigo-700 flex items-center justify-center font-bold text-2xl shadow-md">
                    {currentUser ? currentUser.fullName.split(' ').map(n=>n[0]).join('') : 'SG'}
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white rounded-full p-1.5 shadow-sm border border-white">
                    <UserIcon className="h-3.5 w-3.5" />
                  </div>
                </div>

                <div className="space-y-1.5 text-center md:text-left relative z-10 flex-1">
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">{profileForm.fullName || 'Shivangi Gupta'}</h2>
                  <p className="text-xs text-indigo-600 font-mono font-bold flex items-center justify-center md:justify-start gap-1">
                    <Sparkles className="h-3 w-3 animate-pulse" />
                    {profileForm.academicLevel} • {profileForm.major || 'Computer Science & AI'}
                  </p>
                  <p className="text-[11px] text-slate-450 leading-relaxed font-sans max-w-xl">
                    {profileForm.bio || 'Enter details below to craft your professional academic profile bio context.'}
                  </p>
                </div>
              </div>

              {/* Editing Form */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Personal Information Details</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Edit academic levels, major focus, and university metadata to customize AI response models.</p>
                  </div>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-2.5 py-1 rounded font-mono font-bold">
                    Authenticated Account
                  </span>
                </div>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!currentUser) return;
                    
                    const updatedUser: User = {
                      ...currentUser,
                      fullName: profileForm.fullName,
                      email: profileForm.email,
                      academicLevel: profileForm.academicLevel,
                      major: profileForm.major,
                      university: profileForm.university,
                      bio: profileForm.bio,
                      skills: profileForm.skills
                    };
                    
                    setCurrentUser(updatedUser);
                    localStorage.setItem('copilot_user', JSON.stringify(updatedUser));
                    
                    // Create an activity log
                    const newLog: ActivityLog = {
                      id: `act-p-${Date.now()}`,
                      userId: currentUser.id,
                      action: 'Profile Updated',
                      details: `Updated personal bio representation and configured skills database.`,
                      createdAt: new Date().toISOString()
                    };
                    setActivityLogs([newLog, ...activityLogs]);

                    setProfileUpdateMsg({
                      type: 'success',
                      text: 'Profile details saved successfully! All systems synced.'
                    });

                    setTimeout(() => {
                      setProfileUpdateMsg(null);
                    }, 5000);
                  }}
                  className="p-5 sm:p-6 space-y-5 text-xs text-slate-705"
                >
                  {/* Toast notification inside form */}
                  {profileUpdateMsg && (
                    <motion.div 
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-3.5 rounded-xl border flex items-center gap-2.5 ${
                        profileUpdateMsg.type === 'success' 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                          : 'bg-rose-50 border-rose-200 text-rose-800'
                      }`}
                    >
                      <Check className="h-4 w-4 shrink-0" />
                      <div className="font-semibold text-slate-800">{profileUpdateMsg.text}</div>
                    </motion.div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block font-bold text-slate-600 uppercase tracking-widest mb-1.5">Profile Name *</label>
                      <input
                        type="text"
                        required
                        value={profileForm.fullName}
                        onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-slate-250 rounded-xl bg-slate-50 focus:bg-white focus:ring-1 focus:ring-indigo-650 focus:outline-none focus:border-indigo-600 transition-all text-sm font-semibold text-slate-900"
                        placeholder="e.g. Demo User"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-600 uppercase tracking-widest mb-1.5">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-slate-250 rounded-xl bg-slate-50 focus:bg-white focus:ring-1 focus:ring-indigo-650 focus:outline-none focus:border-indigo-600 transition-all text-sm font-semibold text-slate-900"
                        placeholder="e.g. demo@bloodconnect.ai"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="block font-bold text-slate-600 uppercase tracking-widest mb-1.5">Academic Level *</label>
                      <select
                        value={profileForm.academicLevel}
                        onChange={(e) => setProfileForm({ ...profileForm, academicLevel: e.target.value })}
                        className="w-full px-3 py-2.5 border border-slate-250 rounded-xl bg-slate-50 focus:bg-white focus:ring-1 focus:ring-indigo-650 focus:outline-none focus:border-indigo-600 transition-all text-sm font-semibold text-slate-900"
                      >
                        <option value="Undergraduate">Undergraduate Student</option>
                        <option value="Postgraduate">Postgraduate Student</option>
                        <option value="PhD Candidate">PhD Candidate</option>
                        <option value="Associate Fellow">Associate Fellow</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-600 uppercase tracking-widest mb-1.5">Major / Field *</label>
                      <input
                        type="text"
                        required
                        value={profileForm.major}
                        onChange={(e) => setProfileForm({ ...profileForm, major: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-slate-250 rounded-xl bg-slate-55 rounded-xl bg-slate-50 focus:bg-white focus:ring-1 focus:ring-indigo-650 focus:outline-none focus:border-indigo-600 transition-all text-sm font-semibold text-slate-900"
                        placeholder="e.g. Computer Science"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-600 uppercase tracking-widest mb-1.5">Institution *</label>
                      <input
                        type="text"
                        required
                        value={profileForm.university}
                        onChange={(e) => setProfileForm({ ...profileForm, university: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-slate-250 rounded-xl bg-slate-55 rounded-xl bg-slate-50 focus:bg-white focus:ring-1 focus:ring-indigo-650 focus:outline-none focus:border-indigo-600 transition-all text-sm font-semibold text-slate-900"
                        placeholder="University Name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 uppercase tracking-widest mb-1.5">Short Profile Biography</label>
                    <textarea
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      placeholder="Explain details about your objectives, projects, or interests..."
                      rows={3}
                      className="w-full px-3.5 py-2.5 border border-slate-250 rounded-xl bg-slate-50 focus:bg-white focus:ring-1 focus:ring-indigo-650 focus:outline-none focus:border-indigo-600 transition-all text-sm font-medium text-slate-800"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 uppercase tracking-widest mb-1.5">Academic Skills (Comma-separated List) *</label>
                    <input
                      type="text"
                      required
                      value={profileForm.skills}
                      onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-slate-250 rounded-xl bg-slate-50 focus:bg-white focus:ring-1 focus:ring-indigo-650 focus:outline-none focus:border-indigo-600 transition-all text-sm font-semibold text-slate-900"
                      placeholder="React, TypeScript, Machine Learning, TensorFlow, SQL"
                    />
                    <div className="mt-2.5 flex flex-wrap gap-1.5 items-center">
                      <span className="text-[10px] text-slate-400 font-mono">Real-time tags preview:</span>
                      {profileForm.skills.split(',').map((s) => s.trim()).filter(Boolean).map((skill, index) => (
                        <span key={index} className="px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100/50 rounded text-[9px] font-bold font-mono transition-all">
                          #{skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button 
                      type="button" 
                      onClick={() => {
                        // Reset to current user details
                        if (currentUser) {
                          setProfileForm({
                            fullName: currentUser.fullName || '',
                            email: currentUser.email || '',
                            academicLevel: currentUser.academicLevel || 'Undergraduate',
                            major: currentUser.major || 'Computer Science & AI',
                            university: currentUser.university || 'Apex University',
                            bio: currentUser.bio || '',
                            skills: currentUser.skills || ''
                          });
                        }
                      }}
                      className="px-4.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Undo Modifies
                    </button>
                    <button 
                      type="submit" 
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer border border-indigo-500/25 flex items-center gap-1.5"
                    >
                      <Check className="h-4 w-4" />
                      Commit Details
                    </button>
                  </div>
                </form>
              </div>

              {/* Dynamic Academic Summary & Analytics */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-indigo-950/20 relative overflow-hidden flex flex-col sm:flex-row justify-between items-stretch gap-6">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_107%,rgba(99,102,241,0.12),transparent_40%)]"></div>
                <div className="space-y-1 relative z-10 flex-1">
                  <h4 className="text-md font-bold tracking-tight text-white flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-indigo-300 animate-pulse" />
                    Student Record Ledger Synthesis
                  </h4>
                  <p className="text-xs text-indigo-200/90 leading-relaxed font-sans max-w-lg">
                    This account is synced into the local memory cache database structure. All registered hackathons, tasks completed, metrics timelines, and compatibility reviews dynamically adapt to updates committed to this profile context.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 shrink-0 relative z-10 sm:min-w-64 font-mono">
                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                    <p className="text-[10px] text-indigo-300 uppercase font-bold">Programs Engaged</p>
                    <p className="text-lg font-bold text-white mt-1">{opportunities.length}</p>
                  </div>
                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                    <p className="text-[10px] text-indigo-300 uppercase font-bold">Tasks Ledger</p>
                    <p className="text-lg font-bold text-white mt-1">{tasks.length}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* --- POPUP MODALS --- */}

      {/* MODAL 1: ADD / EDIT OPPORTUNITY */}
      <AnimatePresence>
        {oppModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setOppModalOpen(false)}></div>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-100 rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl relative z-60"
            >
              <div className="flex justify-between items-start pb-3 border-b border-slate-100 mb-4">
                <strong className="text-base font-bold text-slate-900">{editingOpp ? 'Edit Opportunity' : 'Add Opportunity Log'}</strong>
                <button onClick={() => setOppModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
              </div>

              {!editingOpp && (
                <div className="flex bg-slate-100 p-1 rounded-xl mb-4 gap-1 select-none">
                  <button
                    type="button"
                    onClick={() => setOppInsertMode('ai')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      oppInsertMode === 'ai' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                    Auto-Extract via Paste
                  </button>
                  <button
                    type="button"
                    onClick={() => setOppInsertMode('manual')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      oppInsertMode === 'manual' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <CheckSquare className="h-3.5 w-3.5 text-slate-500" />
                    Add Manually
                  </button>
                </div>
              )}

              {oppInsertMode === 'ai' ? (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-600 uppercase tracking-widest mb-1.5">Paste Opportunity Description / Raw Details *</label>
                    <textarea
                      required
                      value={oppPasteText}
                      onChange={(e)=>setOppPasteText(e.target.value)}
                      placeholder="Paste the raw information (email content, Devpost details, website copy, eligibility notes, etc.) here. Our AI engine will automatically scan and structure the Title, Opportunity Type, Description, Deadlines, and Register Link."
                      rows={6}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-600 focus:outline-none placeholder:text-slate-400 font-medium leading-relaxed"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block font-semibold text-slate-600 uppercase tracking-widest mb-1">Registration Status *</label>
                      <select
                        value={oppForm.status}
                        onChange={(e)=>setOppForm({...oppForm, status: e.target.value as OpportunityStatus})}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-600 bg-white focus:outline-none"
                      >
                        <option value="Registered">Registered</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Submitted">Submitted</option>
                        <option value="Selected">Selected</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-600 uppercase tracking-widest mb-1">Fallback Deadline</label>
                      <input
                        type="date"
                        value={oppForm.deadline}
                        onChange={(e)=>setOppForm({...oppForm, deadline: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                      />
                      <p className="text-[10px] text-slate-400 mt-1 select-none">Will act as default if AI doesn't find a deadline date.</p>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 uppercase tracking-widest mb-1">Personal Notes</label>
                    <textarea
                      value={oppForm.notes}
                      onChange={(e)=>setOppForm({...oppForm, notes: e.target.value})}
                      placeholder="Type any team names, milestones, username credentials, or specific study/prep strategies here..."
                      rows={2.5}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                    ></textarea>
                  </div>

                  <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                    <button type="button" onClick={() => setOppModalOpen(false)} className="px-4 py-1.5 border border-slate-200 bg-white rounded-lg font-bold cursor-pointer hover:bg-slate-50 text-slate-600">Cancel</button>
                    <button
                      type="button"
                      disabled={oppIsParsing}
                      onClick={handleAIExtractAndSave}
                      className={`px-4 py-1.5 text-white rounded-lg font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                        oppIsParsing ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                      }`}
                    >
                      {oppIsParsing ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                          Powering up AI...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Auto-Extract & Save
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={saveOpp} className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="col-span-2">
                      <label className="block font-semibold text-slate-600 uppercase tracking-widest mb-1">Opportunity Title *</label>
                      <input
                        type="text"
                        required
                        value={oppForm.title}
                        onChange={(e)=>setOppForm({...oppForm, title: e.target.value})}
                        placeholder="SheBuilds Hackathon"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-600 uppercase tracking-widest mb-1">Opportunity Type *</label>
                      <select
                        value={oppForm.type}
                        onChange={(e)=>setOppForm({...oppForm, type: e.target.value as OpportunityType})}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-600 bg-white focus:outline-none"
                      >
                        <option value="Hackathon">Hackathon</option>
                        <option value="Fellowship">Fellowship</option>
                        <option value="Internship">Internship</option>
                        <option value="Competition">Competition</option>
                        <option value="Event">Event</option>
                        <option value="Workshop">Workshop</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-600 uppercase tracking-widest mb-1">Registration Status *</label>
                      <select
                        value={oppForm.status}
                        onChange={(e)=>setOppForm({...oppForm, status: e.target.value as OpportunityStatus})}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-600 bg-white focus:outline-none"
                      >
                        <option value="Registered">Registered</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Submitted">Submitted</option>
                        <option value="Selected">Selected</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 uppercase tracking-widest mb-1">Description</label>
                    <textarea
                      value={oppForm.description}
                      onChange={(e)=>setOppForm({...oppForm, description: e.target.value})}
                      placeholder="Women-centric hackathon targeting student goals..."
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block font-semibold text-slate-600 uppercase tracking-widest mb-1">Registration Deadline *</label>
                      <input
                        type="date"
                        required
                        value={oppForm.registrationDeadline}
                        onChange={(e)=>setOppForm({...oppForm, registrationDeadline: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-600 focus:outline-none text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-600 uppercase tracking-widest mb-1">Submission Deadline *</label>
                      <input
                        type="date"
                        required
                        value={oppForm.deadline}
                        onChange={(e)=>setOppForm({...oppForm, deadline: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-600 focus:outline-none text-xs"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block font-semibold text-slate-600 uppercase tracking-widest mb-1">Registration Link (URL)</label>
                      <input
                        type="url"
                        value={oppForm.registrationLink}
                        onChange={(e)=>setOppForm({...oppForm, registrationLink: e.target.value})}
                        placeholder="https://example.com"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-600 focus:outline-none text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 uppercase tracking-widest mb-1">Personal Notes</label>
                    <textarea
                      value={oppForm.notes}
                      onChange={(e)=>setOppForm({...oppForm, notes: e.target.value})}
                      placeholder="Any teammates, credentials, algorithm guidelines..."
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                    ></textarea>
                  </div>

                  <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                    <button type="button" onClick={() => setOppModalOpen(false)} className="px-4 py-1.5 border border-slate-200 bg-white rounded-lg font-bold cursor-pointer hover:bg-slate-50 text-slate-600">Cancel</button>
                    <button type="submit" className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg font-bold cursor-pointer hover:bg-indigo-700">Save Opportunity</button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: ADD / EDIT TODO TASK */}
      <AnimatePresence>
        {taskModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setTaskModalOpen(false)}></div>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-100 rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl relative z-60"
            >
              <div className="flex justify-between items-start pb-3 border-b border-slate-100 mb-4">
                <strong className="text-base font-bold text-slate-900">{editingTask ? 'Edit Task Todo' : 'Create Task Todo'}</strong>
                <button onClick={() => setTaskModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
              </div>

              {!editingTask && (
                <div className="flex bg-slate-100 p-1 rounded-xl mb-4 gap-1 select-none">
                  <button
                    type="button"
                    onClick={() => setTaskInsertMode('ai')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      taskInsertMode === 'ai' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                    Auto-Extract via Paste
                  </button>
                  <button
                    type="button"
                    onClick={() => setTaskInsertMode('manual')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      taskInsertMode === 'manual' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <CheckSquare className="h-3.5 w-3.5 text-slate-500" />
                    Add Manually
                  </button>
                </div>
              )}

              {taskInsertMode === 'ai' ? (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-600 uppercase tracking-widest mb-1.5">Paste Task Instructions / Message Details *</label>
                    <textarea
                      required
                      value={taskPasteText}
                      onChange={(e)=>setTaskPasteText(e.target.value)}
                      placeholder="Paste details of the goal here, e.g.: 'Hey Shivangi, can you please complete the ML algorithms review for Kaggle by June 12? Mark it high priority. Thanks!'"
                      rows={5}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-600 focus:outline-none placeholder:text-slate-400 font-medium leading-relaxed"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block font-semibold text-slate-600 uppercase tracking-widest mb-1">Status *</label>
                      <select
                        value={taskForm.status}
                        onChange={(e)=>setTaskForm({...taskForm, status: e.target.value as TaskStatus})}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-650 bg-white focus:outline-none"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-600 uppercase tracking-widest mb-1">Associate Link Opportunity</label>
                      <select
                        value={taskForm.opportunityId}
                        onChange={(e)=>setTaskForm({...taskForm, opportunityId: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-650 bg-white focus:outline-none"
                      >
                        <option value="">No Opportunity link (General Goal)</option>
                        {opportunities.map(o => (
                          <option key={o.id} value={o.id}>{o.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                    <button type="button" onClick={() => setTaskModalOpen(false)} className="px-4 py-1.5 border border-slate-200 bg-white rounded-lg font-bold cursor-pointer text-slate-600 hover:bg-slate-50">Cancel</button>
                    <button 
                      type="button" 
                      onClick={handleTaskAIExtract}
                      disabled={taskIsParsing}
                      className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {taskIsParsing ? (
                        <>
                          <div className="h-3 w-3 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                          Extracting task...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5 text-indigo-200" />
                          Auto-Extract & Save
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={saveTask} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-600 uppercase tracking-widest mb-1">Task Title *</label>
                    <input
                      type="text"
                      required
                      value={taskForm.title}
                      onChange={(e)=>setTaskForm({...taskForm, title: e.target.value})}
                      placeholder="Complete backend REST tests"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 uppercase tracking-widest mb-1">Description / Goal details</label>
                    <textarea
                      value={taskForm.description}
                      onChange={(e)=>setTaskForm({...taskForm, description: e.target.value})}
                      placeholder="Provide specific notes or requirements..."
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block font-semibold text-slate-600 uppercase tracking-widest mb-1">Due Date *</label>
                      <input
                        type="date"
                        required
                        value={taskForm.dueDate}
                        onChange={(e)=>setTaskForm({...taskForm, dueDate: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-600 uppercase tracking-widest mb-1">Priority Rank *</label>
                      <select
                        value={taskForm.priority}
                        onChange={(e)=>setTaskForm({...taskForm, priority: e.target.value as TaskPriority})}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-600 bg-white focus:outline-none"
                      >
                        <option value="Low">Low Priority</option>
                        <option value="Medium">Medium Priority</option>
                        <option value="High">High Priority</option>
                        <option value="Critical">Critical Priority</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block font-semibold text-slate-600 uppercase tracking-widest mb-1">Status *</label>
                      <select
                        value={taskForm.status}
                        onChange={(e)=>setTaskForm({...taskForm, status: e.target.value as TaskStatus})}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-600 bg-white focus:outline-none"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-600 uppercase tracking-widest mb-1">Associate Link Opportunity</label>
                      <select
                        value={taskForm.opportunityId}
                        onChange={(e)=>setTaskForm({...taskForm, opportunityId: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-600 bg-white focus:outline-none"
                      >
                        <option value="">No Opportunity link (General Goal)</option>
                        {opportunities.map(o => (
                          <option key={o.id} value={o.id}>{o.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                    <button type="button" onClick={() => setTaskModalOpen(false)} className="px-4 py-1.5 border border-slate-200 bg-white rounded-lg font-bold cursor-pointer text-slate-600 hover:bg-slate-50">Cancel</button>
                    <button type="submit" className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg font-bold cursor-pointer hover:bg-indigo-700">Apply Task</button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: ASSEMBLE TEAM */}
      <AnimatePresence>
        {teamModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setTeamModalOpen(false)}></div>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-100 rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl relative z-60 overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-start pb-3 border-b border-slate-100 mb-4">
                <strong className="text-base font-bold text-slate-900">Assemble Team Roster</strong>
                <button onClick={() => setTeamModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
              </div>

              <div className="flex bg-slate-100 p-1 rounded-xl mb-4 gap-1 select-none">
                <button
                  type="button"
                  onClick={() => setTeamInsertMode('photo')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    teamInsertMode === 'photo' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Camera className="h-3.5 w-3.5 text-indigo-600" />
                  From Photo
                </button>
                <button
                  type="button"
                  onClick={() => setTeamInsertMode('text')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    teamInsertMode === 'text' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                  From Message
                </button>
                <button
                  type="button"
                  onClick={() => setTeamInsertMode('manual')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    teamInsertMode === 'manual' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <CheckSquare className="h-3.5 w-3.5 text-slate-500" />
                  Add Manually
                </button>
              </div>

              {teamInsertMode === 'photo' && (
                <div className="space-y-4 text-xs">
                  <div className="border border-dashed border-slate-200 rounded-xl p-6 text-center bg-slate-50/50 relative hover:bg-slate-50 transition-all">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setTeamFileImage(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {teamFileImage ? (
                      <div className="space-y-3">
                        <img src={teamFileImage} alt="Preview" className="max-h-36 mx-auto rounded-lg object-contain shadow-md" referrerPolicy="no-referrer" />
                        <p className="text-[10px] text-indigo-600 font-semibold">Image loaded successfully. Click below to analyze.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-8 w-8 text-indigo-500 mx-auto animate-pulse" />
                        <p className="font-semibold text-slate-700">Drag & drop or Click to upload team photo</p>
                        <p className="text-[10px] text-slate-400">Upload a whiteboard drawing, spreadsheet image, presenting slide, or contributor screenshot.</p>
                      </div>
                    )}
                  </div>

                  {teamFileImage && (
                    <button
                      type="button"
                      disabled={teamIsParsing}
                      onClick={() => handleTeamPhotoExtract(teamFileImage)}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                    >
                      {teamIsParsing ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                          Gemini Vision Extracting...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5" />
                          Extract Team from Photo
                        </>
                      )}
                    </button>
                  )}
                  
                  <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                    <button type="button" onClick={() => setTeamModalOpen(false)} className="px-4 py-1.5 border border-slate-200 bg-white rounded-lg font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
                  </div>
                </div>
              )}

              {teamInsertMode === 'text' && (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-600 uppercase tracking-widest mb-1.5">Paste raw team details / message *</label>
                    <textarea
                      required
                      value={teamPasteText}
                      onChange={(e)=>setTeamPasteText(e.target.value)}
                      placeholder="Paste Slack messages, WhatsApp logs, emails, contribution lists or lists with details here... We'll extract group name and candidate roster automatically!"
                      rows={6}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-600 focus:outline-none placeholder:text-slate-400 font-medium leading-relaxed"
                    ></textarea>
                  </div>

                  <button
                    type="button"
                    disabled={teamIsParsing || !teamPasteText.trim()}
                    onClick={handleTeamTextExtract}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                  >
                    {teamIsParsing ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                        Extracting Team details...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" />
                        Extract Team from Message
                      </>
                    )}
                  </button>

                  <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                    <button type="button" onClick={() => setTeamModalOpen(false)} className="px-4 py-1.5 border border-slate-200 bg-white rounded-lg font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
                  </div>
                </div>
              )}

              {teamInsertMode === 'manual' && (
                <form onSubmit={saveTeam} className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="col-span-1">
                      <label className="block font-semibold text-slate-600 uppercase tracking-widest mb-1">Team Name (Group Title) *</label>
                      <input
                        type="text"
                        required
                        value={teamForm.name}
                        onChange={(e)=>setTeamForm({...teamForm, name: e.target.value})}
                        placeholder="SheBuilds Crew"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block font-semibold text-slate-600 uppercase tracking-widest mb-1">Connect Opportunity Link</label>
                      <select
                        value={teamForm.opportunityId}
                        onChange={(e)=>setTeamForm({...teamForm, opportunityId: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-600 bg-white focus:outline-none"
                      >
                        <option value="">No Opportunity link (General Goal)</option>
                        {opportunities.map(o => (
                          <option key={o.id} value={o.id}>{o.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Team Roster List Inputs */}
                  <div className="space-y-3">
                    <strong className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block">Members details ({teamForm.members.length})</strong>
                    
                    {teamForm.members.map((member, index) => (
                      <div key={index} className="p-3 border border-slate-100 rounded-xl space-y-2 bg-slate-50/50">
                        <div className="flex justify-between items-center">
                          <strong className="font-semibold text-slate-700">Team Candidate #{index + 1}</strong>
                          {teamForm.members.length > 1 && (
                            <button
                              type="button"
                              onClick={()=>{
                                const copy = [...teamForm.members];
                                copy.splice(index, 1);
                                setTeamForm({...teamForm, members: copy});
                              }}
                              className="text-rose-500 hover:underline font-bold text-[10px]"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="text"
                            required
                            placeholder="Name (e.g. Ananya)"
                            value={member.name}
                            onChange={(e)=>{
                              const copy = [...teamForm.members];
                              copy[index].name = e.target.value;
                              setTeamForm({...teamForm, members: copy});
                            }}
                            className="w-full px-2 py-1.5 border border-slate-200 rounded bg-white text-xs"
                          />
                          <input
                            type="text"
                            placeholder="Role (e.g. Frontend)"
                            value={member.role}
                            onChange={(e)=>{
                              const copy = [...teamForm.members];
                              copy[index].role = e.target.value;
                              setTeamForm({...teamForm, members: copy});
                            }}
                            className="w-full px-2 py-1.5 border border-slate-200 rounded bg-white text-xs"
                          />
                          <input
                            type="text"
                            placeholder="Contact Email/Cell"
                            value={member.contact}
                            onChange={(e)=>{
                              const copy = [...teamForm.members];
                              copy[index].contact = e.target.value;
                              setTeamForm({...teamForm, members: copy});
                            }}
                            className="w-full px-2 py-1.5 border border-slate-200 rounded bg-white text-xs"
                          />
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={()=>{
                        setTeamForm({
                          ...teamForm,
                          members: [...teamForm.members, { name: '', role: '', contact: '' }]
                        });
                      }}
                      className="w-full py-1.5 border border-dashed border-indigo-300 bg-indigo-50/20 text-indigo-700 hover:bg-indigo-50/50 font-bold rounded-lg text-center cursor-pointer"
                    >
                      + Append Member Input
                    </button>
                  </div>

                  <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                    <button type="button" onClick={() => setTeamModalOpen(false)} className="px-4 py-1.5 border border-slate-200 bg-white rounded-lg font-bold text-slate-600 hover:bg-slate-50 cursor-pointer">Cancel</button>
                    <button type="submit" className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 cursor-pointer shadow-md">Save Team</button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 4: DAILY CHECKIN FORM */}
      <AnimatePresence>
        {checkinModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setCheckinModalOpen(false)}></div>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-100 rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl relative z-60"
            >
              <div className="flex justify-between items-start pb-3 border-b border-slate-100 mb-4">
                <strong className="text-base font-bold text-slate-900">Complete Daily Check-in</strong>
                <button onClick={() => setCheckinModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
              </div>

              <form onSubmit={handleCheckin} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-600 uppercase tracking-widest mb-1">What did you complete today? *</label>
                  <textarea
                    required
                    value={checkinForm.completedToday}
                    onChange={(e)=>setCheckinForm({...checkinForm, completedToday: e.target.value})}
                    placeholder="Refactored the dashboard CSS and set up initial schema structures..."
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                  ></textarea>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 uppercase tracking-widest mb-1">What are you working on? (Current Focus) *</label>
                  <textarea
                    required
                    value={checkinForm.workingOn}
                    onChange={(e)=>setCheckinForm({...checkinForm, workingOn: e.target.value})}
                    placeholder="Working on setting up API routes proxy on node server..."
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                  ></textarea>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 uppercase tracking-widest mb-1">What are your blockers? (If any)</label>
                  <textarea
                    value={checkinForm.blockers}
                    onChange={(e)=>setCheckinForm({...checkinForm, blockers: e.target.value})}
                    placeholder="Slight latency questions related to model response payloads..."
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                  <button type="button" onClick={() => setCheckinModalOpen(false)} className="px-4 py-1.5 border border-slate-200 bg-white rounded-lg font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700">Record Check-in</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Elegant Custom Toast Notification Overlay */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-xs font-semibold ${
              toast.type === 'success' 
                ? 'bg-slate-900 border-emerald-500/20 text-emerald-400' 
                : toast.type === 'error'
                  ? 'bg-slate-900 border-rose-500/20 text-rose-400'
                  : 'bg-slate-900 border-indigo-500/20 text-indigo-400'
            }`}
          >
            <div className={`h-2 w-2 rounded-full ${
              toast.type === 'success' 
                ? 'bg-emerald-500 animate-pulse' 
                : toast.type === 'error'
                  ? 'bg-rose-500 animate-pulse'
                  : 'bg-indigo-500 animate-pulse'
            }`}></div>
            <span>{toast.message}</span>
            <button 
              onClick={() => setToast(null)} 
              className="ml-2 hover:text-white transition-colors cursor-pointer text-slate-400 font-bold text-sm"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Elegant Custom Confirmation Modal System */}
      <AnimatePresence>
        {customConfirm && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div 
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs" 
              onClick={() => setCustomConfirm(null)}
            ></div>
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl relative z-[10000] animate-fadeIn"
            >
              <div className="flex gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 shrink-0">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {customConfirm.title || 'Confirm Action'}
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-normal">
                    {customConfirm.message}
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                <button
                  type="button"
                  onClick={() => setCustomConfirm(null)}
                  className="px-4 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    customConfirm.onConfirm();
                    setCustomConfirm(null);
                  }}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm shadow-indigo-600/10 cursor-pointer transition-all"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
