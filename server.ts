
 /**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './src/server/db.js';
import { processStudentMessage, runAISummaryEngine, aiParseOpportunity, aiParseTeamFromMessage, aiParseTeamFromPhoto, aiParseTaskFromMessage } from './src/server/gemini.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// --- Middleware: Extract User ID from header ---
const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) {
    res.status(401).json({ error: 'Authentication required. Missing x-user-id header.' });
    return;
  }
  next();
};

const getUserId = (req: express.Request): string => {
  return (req.headers['x-user-id'] as string) || 'demo-user';
};

// --- API routes ---

// Auth endpoints
app.post('/api/auth/register', (req, res) => {
  const { email, password, fullName } = req.body;
  if (!email || !password || !fullName) {
    res.status(400).json({ error: 'Please provide email, password, and full name.' });
    return;
  }
  const result = db.registerUser(email, password, fullName);
  if (result.error) {
    res.status(400).json({ error: result.error });
    return;
  }
  res.json({ user: result.user });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Please provide email and password.' });
    return;
  }
  const result = db.loginUser(email, password);
  if (result.error) {
    res.status(401).json({ error: result.error });
    return;
  }
  res.json({ user: result.user });
});

app.post('/api/auth/forgot-password', (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    res.status(400).json({ error: 'Please provide email and new password.' });
    return;
  }
  const result = db.updatePassword(email, newPassword);
  if (result.error) {
    res.status(400).json({ error: result.error });
    return;
  }
  res.json({ success: true, message: 'Password updated successfully.' });
});

// Opportunities REST API
app.post('/api/opportunities/parse', requireAuth, async (req, res) => {
  const { rawText } = req.body;
  if (!rawText) {
    res.status(400).json({ error: 'Missing rawText parameter' });
    return;
  }
  try {
    const result = await aiParseOpportunity(rawText);
    res.json(result);
  } catch (err: any) {
    console.error('Opportunity parse error:', err);
    res.status(500).json({ error: err?.message || 'Failed to parse opportunity' });
  }
});

app.get('/api/opportunities', requireAuth, (req, res) => {
  const userId = getUserId(req);
  res.json(db.getOpportunities(userId));
});

app.post('/api/opportunities', requireAuth, (req, res) => {
  const userId = getUserId(req);
  const { title, type, description, registrationLink, deadline, registrationDeadline, status, notes } = req.body;
  if (!title || !type || !deadline || !status) {
    res.status(400).json({ error: 'Missing required opportunities fields.' });
    return;
  }
  const opp = db.createOpportunity(userId, { title, type, description: description || '', registrationLink, deadline, registrationDeadline, status, notes });
  res.status(201).json(opp);
});

app.put('/api/opportunities/:id', requireAuth, (req, res) => {
  const userId = getUserId(req);
  const opp = db.updateOpportunity(userId, req.params.id, req.body);
  if (!opp) {
    res.status(404).json({ error: 'Opportunity not found.' });
    return;
  }
  res.json(opp);
});

app.delete('/api/opportunities/:id', requireAuth, (req, res) => {
  const userId = getUserId(req);
  const success = db.deleteOpportunity(userId, req.params.id);
  if (!success) {
    res.status(404).json({ error: 'Opportunity not found.' });
    return;
  }
  res.json({ success: true });
});

// Teams REST API
app.post('/api/teams/parse-text', requireAuth, async (req, res) => {
  const { rawText } = req.body;
  if (!rawText) {
    res.status(400).json({ error: 'Missing rawText parameter' });
    return;
  }
  try {
    const result = await aiParseTeamFromMessage(rawText);
    res.json(result);
  } catch (err: any) {
    console.error('Team text parse error:', err);
    res.status(500).json({ error: err?.message || 'Failed to parse team details' });
  }
});

app.post('/api/teams/parse-photo', requireAuth, async (req, res) => {
  const { imageBase64 } = req.body;
  if (!imageBase64) {
    res.status(400).json({ error: 'Missing imageBase64 parameter' });
    return;
  }
  try {
    const result = await aiParseTeamFromPhoto(imageBase64);
    res.json(result);
  } catch (err: any) {
    console.error('Team photo vision parse error:', err);
    res.status(500).json({ error: err?.message || 'Failed to extract team details from photo' });
  }
});

app.get('/api/teams', requireAuth, (req, res) => {
  const userId = getUserId(req);
  res.json(db.getTeams(userId));
});

app.post('/api/teams', requireAuth, (req, res) => {
  const userId = getUserId(req);
  const { name, opportunityId, members } = req.body;
  if (!name || !members) {
    res.status(400).json({ error: 'Missing name or members payload.' });
    return;
  }
  const team = db.createTeam(userId, { name, opportunityId, members });
  res.status(201).json(team);
});

app.put('/api/teams/:id', requireAuth, (req, res) => {
  const userId = getUserId(req);
  const team = db.updateTeam(userId, req.params.id, req.body);
  if (!team) {
    res.status(404).json({ error: 'Team not found.' });
    return;
  }
  res.json(team);
});

// Tasks REST API
app.post('/api/tasks/parse', requireAuth, async (req, res) => {
  const { rawText } = req.body;
  if (!rawText) {
    res.status(400).json({ error: 'Missing rawText parameter' });
    return;
  }
  try {
    const result = await aiParseTaskFromMessage(rawText);
    res.json(result);
  } catch (err: any) {
    console.error('Task text parse error:', err);
    res.status(500).json({ error: err?.message || 'Failed to parse task details' });
  }
});

app.get('/api/tasks', requireAuth, (req, res) => {
  const userId = getUserId(req);
  res.json(db.getTasks(userId));
});

app.post('/api/tasks', requireAuth, (req, res) => {
  const userId = getUserId(req);
  const { title, description, dueDate, priority, status, opportunityId } = req.body;
  if (!title || !dueDate || !priority || !status) {
    res.status(400).json({ error: 'Missing required task fields.' });
    return;
  }
  const task = db.createTask(userId, { title, description: description || '', dueDate, priority, status, opportunityId });
  res.status(201).json(task);
});

app.put('/api/tasks/:id', requireAuth, (req, res) => {
  const userId = getUserId(req);
  const task = db.updateTask(userId, req.params.id, req.body);
  if (!task) {
    res.status(404).json({ error: 'Task not found.' });
    return;
  }
  res.json(task);
});

app.delete('/api/tasks/:id', requireAuth, (req, res) => {
  const userId = getUserId(req);
  const success = db.deleteTask(userId, req.params.id);
  if (!success) {
    res.status(404).json({ error: 'Task not found.' });
    return;
  }
  res.json({ success: true });
});

// Daily Check-ins API
app.get('/api/checkins', requireAuth, (req, res) => {
  const userId = getUserId(req);
  res.json(db.getDailyCheckins(userId));
});

app.post('/api/checkins', requireAuth, (req, res) => {
  const userId = getUserId(req);
  const { completedToday, workingOn, blockers } = req.body;
  if (!completedToday || !workingOn) {
    res.status(400).json({ error: 'Please provide both completedToday and workingOn details.' });
    return;
  }
  const date = new Date().toISOString().split('T')[0];
  const summary = `Captured check-in for ${date}. Completed: ${completedToday}. Working on: ${workingOn}. Blockers: ${blockers || 'None'}.`;
  
  const checkin = db.createDailyCheckin(userId, {
    date,
    completedToday,
    workingOn,
    blockers: blockers || '',
    summary
  });
  res.status(201).json(checkin);
});

// Weekly reports API
app.get('/api/weekly-reviews', requireAuth, (req, res) => {
  const userId = getUserId(req);
  res.json(db.getWeeklyReports(userId));
});

app.post('/api/weekly-reviews', requireAuth, (req, res) => {
  const userId = getUserId(req);
  runAISummaryEngine(userId)
    .then(report => res.status(201).json(report))
    .catch(err => res.status(500).json({ error: 'Failed to compile AI weekly report: ' + err.message }));
});

app.delete('/api/weekly-reviews', requireAuth, (req, res) => {
  const userId = getUserId(req);
  db.clearWeeklyReports(userId);
  res.json({ success: true, message: 'All weekly reports cleared.' });
});

// Notifications API
app.get('/api/notifications', requireAuth, (req, res) => {
  const userId = getUserId(req);
  res.json(db.getNotifications(userId));
});

app.post('/api/notifications/read-all', requireAuth, (req, res) => {
  const userId = getUserId(req);
  db.markAllNotificationsRead(userId);
  res.json({ success: true });
});

app.post('/api/notifications/:id/read', requireAuth, (req, res) => {
  const userId = getUserId(req);
  const success = db.markNotificationRead(userId, req.params.id);
  if (!success) {
    res.status(404).json({ error: 'Notification not found' });
    return;
  }
  res.json({ success: true });
});

// Memories API
app.get('/api/memories', requireAuth, (req, res) => {
  const userId = getUserId(req);
  res.json(db.getMemories(userId));
});

app.post('/api/memories', requireAuth, (req, res) => {
  const userId = getUserId(req);
  const { title, content, category } = req.body;
  if (!title || !content || !category) {
    res.status(400).json({ error: 'Missing required memory fields.' });
    return;
  }
  const mem = db.createMemory(userId, { title, content, category });
  res.status(201).json(mem);
});

app.delete('/api/memories/:id', requireAuth, (req, res) => {
  const userId = getUserId(req);
  const success = db.deleteMemory(userId, req.params.id);
  if (!success) {
    res.status(404).json({ error: 'Memory not found.' });
    return;
  }
  res.json({ success: true });
});

// Chat API (Gemini memory assistant interface)
app.get('/api/chat', requireAuth, (req, res) => {
  const userId = getUserId(req);
  res.json(db.getConversation(userId));
});

app.post('/api/chat', requireAuth, async (req, res) => {
  const userId = getUserId(req);
  const { text } = req.body;
  if (!text) {
    res.status(400).json({ error: 'Missing text content for message.' });
    return;
  }
  try {
    const aiReply = await processStudentMessage(userId, text);
    res.json({ text: aiReply });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to process AI memory response: ' + err.message });
  }
});

app.post('/api/chat/clear', requireAuth, (req, res) => {
  const userId = getUserId(req);
  db.clearConversation(userId);
  res.json({ success: true });
});

// Preferences API
app.get('/api/preferences', requireAuth, (req, res) => {
  const userId = getUserId(req);
  res.json(db.getUserPreference(userId));
});

app.put('/api/preferences', requireAuth, (req, res) => {
  const userId = getUserId(req);
  const updated = db.updateUserPreference(userId, req.body);
  res.json(updated);
});

// Logs API
app.get('/api/logs', requireAuth, (req, res) => {
  const userId = getUserId(req);
  res.json(db.getActivityLogs(userId));
});

// Computed Stats API
app.get('/api/stats', requireAuth, (req, res) => {
  const userId = getUserId(req);
  const opportunities = db.getOpportunities(userId);
  const tasks = db.getTasks(userId);
  const teams = db.getTeams(userId);
  
  // Real-time backlog check
  const activeOpps = opportunities.filter(o => o.status !== 'Completed' && o.status !== 'Rejected');
  const pendingTasks = tasks.filter(t => t.status !== 'Completed');
  const completedTasks = tasks.filter(t => t.status === 'Completed');
  
  res.json({
    totalOpportunities: opportunities.length,
    pendingTasks: pendingTasks.length,
    completedTasks: completedTasks.length,
    upcomingDeadlinesCount: activeOpps.length,
    activeTeamsCount: teams.length
  });
});

// DB Reset API
app.post('/api/db/reset', requireAuth, (req, res) => {
  db.resetWithSeedData();
  res.json({ success: true, message: 'Database reset to demo state completely.' });
});

// --- Vite & Client static file routing middleware ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server starting on http://localhost:${PORT}`);
  });
}

startServer();
