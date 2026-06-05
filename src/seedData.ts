/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Opportunity, Team, Task, DailyCheckin, WeeklyReport, Notification, Memory, UserPreference, ActivityLog, TaskStatus, TaskPriority } from './types.js';

const userId = 'demo-user';

export const SEED_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp-1',
    userId,
    title: 'SheBuilds Hackathon',
    type: 'Hackathon',
    description: 'Women-centric 48-hour virtual national hackathon to build tech solutions for societal challenges.',
    registrationLink: 'https://shebuilds.devpost.com',
    deadline: '2026-06-20',
    status: 'In Progress',
    teamId: 'team-1',
    notes: 'Teaming up with Riya and Ananya. We are building a safety-first peer tutoring application.',
    createdAt: '2026-05-15T10:00:00.000Z'
  },
  {
    id: 'opp-2',
    userId,
    title: 'MLH Fellowship (Software Engineering)',
    type: 'Fellowship',
    description: '12-week educational internship alternative where fellows contribute to open-source software under mentorship.',
    registrationLink: 'https://fellowship.mlh.io',
    deadline: '2026-06-30',
    status: 'Registered',
    notes: 'Completed initial application. Need to prepare for technical interview on data structures.',
    createdAt: '2026-05-10T12:00:00.000Z'
  },
  {
    id: 'opp-3',
    userId,
    title: 'Google STEP Internship 2026',
    type: 'Internship',
    description: 'Student Training in Engineering Program (STEP) for computer science undergraduates.',
    registrationLink: 'https://careers.google.com',
    deadline: '2026-07-15',
    status: 'In Progress',
    notes: 'Resume submitted. Referred by senior alumnus. Studying system design and algorithms.',
    createdAt: '2026-05-20T08:30:00.000Z'
  },
  {
    id: 'opp-4',
    userId,
    title: 'ACM ICPC Regionals',
    type: 'Competition',
    description: 'International Collegiate Programming Contest regional qualifier.',
    registrationLink: 'https://icpc.global',
    deadline: '2026-07-05',
    status: 'Registered',
    teamId: 'team-2',
    notes: 'Our team "Bits to Bytes" is practicing graph problems and dynamic programming.',
    createdAt: '2026-05-12T09:00:00.000Z'
  },
  {
    id: 'opp-5',
    userId,
    title: 'Open Source Summit Berlin',
    type: 'Event',
    description: 'Leading conference for open source developers, community managers, and industry leaders.',
    registrationLink: 'https://events.linuxfoundation.org',
    deadline: '2026-06-10',
    status: 'Registered',
    notes: 'Received academic student travel scholarship! Need to book flights and accommodation.',
    createdAt: '2026-05-01T14:20:00.000Z'
  },
  {
    id: 'opp-6',
    userId,
    title: 'Next-Gen Web Dev Workshop',
    type: 'Workshop',
    description: 'Hands-on intensive session covering Astro, Qwik, and Next-JS server component architecture.',
    registrationLink: 'https://webdevworkshop.org',
    deadline: '2026-06-08',
    status: 'Registered',
    notes: 'Need to install Node 20+ and pnpm on local laptop prior to attendance.',
    createdAt: '2026-05-25T11:00:00.000Z'
  },
  {
    id: 'opp-7',
    userId,
    title: 'Kaggle Global Predictor Cup',
    type: 'Competition',
    description: 'Machine learning competition utilizing tabbed customer datasets for neural price forecasting.',
    registrationLink: 'https://kaggle.com/cup',
    deadline: '2026-07-20',
    status: 'In Progress',
    notes: 'Working on XGBoost, LightGBM, and feature engineering. Baseline validation score is 0.812.',
    createdAt: '2026-05-18T16:00:00.000Z'
  },
  {
    id: 'opp-8',
    userId,
    title: 'Microsoft Imagine Cup',
    type: 'Competition',
    description: 'Global technology startup competition for students using Azure tools and AI services.',
    registrationLink: 'https://imaginecup.microsoft.com',
    deadline: '2026-08-01',
    status: 'Submitted',
    teamId: 'team-3',
    notes: 'Submitted our AI Medical Assistant prototye proposal! Azure resources hosted and active.',
    createdAt: '2026-04-10T10:00:00.000Z'
  },
  {
    id: 'opp-9',
    userId,
    title: 'Y-Combinator Startup School Hack',
    type: 'Hackathon',
    description: 'Build an operational MVP and pitch it directly to YC alums over an intensive weekend.',
    registrationLink: 'https://startupschool.org/hack',
    deadline: '2026-05-28',
    status: 'Completed',
    teamId: 'team-4',
    notes: 'Built a collaborative peer group study room with audio voice lobbies. Outstanding feedback!',
    createdAt: '2026-05-02T13:40:00.000Z'
  },
  {
    id: 'opp-10',
    userId,
    title: 'Jane Street Quantitative Fellowship',
    type: 'Fellowship',
    description: 'Elite program covering probability theory, quantitative research, and automated pricing.',
    registrationLink: 'https://janestreet.com/fellow',
    deadline: '2026-06-18',
    status: 'Registered',
    notes: 'Completed the preliminary math exam. Awaiting results of cutoff brackets.',
    createdAt: '2026-05-22T17:15:00.000Z'
  },
  {
    id: 'opp-11',
    userId,
    title: 'Stripe Junior Software Engineer',
    type: 'Internship',
    description: 'Summer 2026 Internship in San Francisco working on core payments API.',
    registrationLink: 'https://stripe.com/jobs',
    deadline: '2026-07-10',
    status: 'Registered',
    notes: 'Application submitted. Received online assessment invitation. Need to practice SQL and concurrency.',
    createdAt: '2026-05-28T09:00:00.000Z'
  },
  {
    id: 'opp-12',
    userId,
    title: 'NASA Space Apps Challenge',
    type: 'Hackathon',
    description: 'Global hackathon targeting earth observation datasets and custom satellite mapping modules.',
    registrationLink: 'https://spaceappschallenge.org',
    deadline: '2026-08-15',
    status: 'Registered',
    notes: 'Looking for a UI designer. Planning to work on mapping ocean microplastics.',
    createdAt: '2026-06-01T10:10:00.000Z'
  },
  {
    id: 'opp-13',
    userId,
    title: 'GitHub Campus Expert Program',
    type: 'Fellowship',
    description: 'Student leaders building software development communities on their campus.',
    registrationLink: 'https://education.github.com',
    deadline: '2026-06-25',
    status: 'In Progress',
    notes: 'Completed essay answers on community growth. Recording video pitch today.',
    createdAt: '2026-05-29T15:20:00.000Z'
  },
  {
    id: 'opp-14',
    userId,
    title: 'AWS Cloud Practitioner Cohort',
    type: 'Workshop',
    description: 'Intensive official masterclass covering VPC, S3, EC2, DynamoDB, and serverless architectures.',
    registrationLink: 'https://aws.training',
    deadline: '2026-06-15',
    status: 'Registered',
    notes: 'Fully funded by university department. Practice exams scoring ~85. Target exam date mid June.',
    createdAt: '2026-05-23T12:00:00.000Z'
  },
  {
    id: 'opp-15',
    userId,
    title: 'ETH Global London',
    type: 'Hackathon',
    description: 'Ethereum ecosystem developer hackathon focusing on Solidity, zk-SNARKs and Layer-2 scaling.',
    registrationLink: 'https://ethglobal.com',
    deadline: '2026-07-28',
    status: 'Registered',
    notes: 'Travel plans finalized. Reviewing smart contract security frameworks.',
    createdAt: '2026-06-02T11:45:00.000Z'
  },
  {
    id: 'opp-16',
    userId,
    title: 'Cisco Intercollegiate Cyber Cup',
    type: 'Competition',
    description: 'Capture the flag (CTF) security contest covering memory forensics, protocol analysis, and reverse engineering.',
    registrationLink: 'https://cisco-cybercup.com',
    deadline: '2026-07-02',
    status: 'Registered',
    teamId: 'team-5',
    notes: 'Teamed up with Rohan and Kabir. Rohan handles binary analysis; I am working on crypto and web.',
    createdAt: '2026-05-30T10:00:00.000Z'
  },
  {
    id: 'opp-17',
    userId,
    title: 'Neo Scholars Fellowship',
    type: 'Fellowship',
    description: 'Prestigious community supporting young entrepreneurs and engineers with startup mentorship.',
    registrationLink: 'https://neo.com',
    deadline: '2026-06-15',
    status: 'Selected',
    notes: 'INCREDIBLE! Selected as a Neo Scholar. Mentorship onboarding scheduled next week.',
    createdAt: '2026-04-15T09:00:00.000Z'
  },
  {
    id: 'opp-18',
    userId,
    title: 'HackerX Coding Battlegrounds',
    type: 'Competition',
    description: 'Speed-coding battlegrounds scoring based on latency and architectural space efficiency.',
    registrationLink: 'https://hackerx.coders',
    deadline: '2026-05-25',
    status: 'Rejected',
    notes: 'Missed final stage qualification. Solved 4 out of 5, but execution time was slightly non-optimal on test case 4.',
    createdAt: '2026-05-01T08:00:00.000Z'
  },
  {
    id: 'opp-19',
    userId,
    title: 'Vercel Front-End Fellowship',
    type: 'Fellowship',
    description: '6-week intense cohort focused on building beautiful layouts, component libraries, and visual streaming platforms.',
    registrationLink: 'https://vercel.com/fellows',
    deadline: '2026-08-10',
    status: 'Registered',
    notes: 'Preparing portfolio with animations and custom tailwind setups.',
    createdAt: '2026-06-03T16:00:00.000Z'
  },
  {
    id: 'opp-20',
    userId,
    title: 'Data Science & Big Data Internship (Meta)',
    type: 'Internship',
    description: 'Summer 2026 cohort. Working on analytical telemetry pipelines and user conversion trends.',
    registrationLink: 'https://meta.com/careers',
    deadline: '2026-07-22',
    status: 'In Progress',
    notes: 'Need to review statistics, distributions, and SQL database window functions.',
    createdAt: '2026-06-04T13:10:00.000Z'
  }
];

export const SEED_TEAMS: Team[] = [
  {
    id: 'team-1',
    userId,
    opportunityId: 'opp-1',
    name: 'SheBuilds Crew',
    members: [
      { name: 'Shivangi', role: 'Project Lead', contact: 'shivangi@collegemail.edu' },
      { name: 'Riya', role: 'Backend Dev', contact: 'riya.sharma@collegemail.edu' },
      { name: 'Ananya', role: 'Frontend Dev', contact: 'ananya.p@collegemail.edu' }
    ]
  },
  {
    id: 'team-2',
    userId,
    opportunityId: 'opp-4',
    name: 'Bits to Bytes',
    members: [
      { name: 'Sameer', role: 'Algorithm Guru', contact: 'sam@collegemail.edu' },
      { name: 'Varun', role: 'Data Structures Lead', contact: 'varun@collegemail.edu' },
      { name: 'Demo User', role: 'Implementation Specialist', contact: 'demo@bloodconnect.ai' }
    ]
  },
  {
    id: 'team-3',
    userId,
    opportunityId: 'opp-8',
    name: 'CarePulse AI',
    members: [
      { name: 'Demo User', role: 'Machine Learning Architect', contact: 'demo@bloodconnect.ai' },
      { name: 'Siddharth', role: 'Cloud Platform Architect', contact: 'sid@collegemail.edu' },
      { name: 'Preeti', role: 'UX Research & Design', contact: 'preeti@collegemail.edu' }
    ]
  },
  {
    id: 'team-4',
    userId,
    opportunityId: 'opp-9',
    name: 'LobbyLoom MVP',
    members: [
      { name: 'Demo User', role: 'Full-stack Engineer', contact: 'demo@bloodconnect.ai' },
      { name: 'Tarun', role: 'DevOps / WebRTC', contact: 'tarun@web.dev' }
    ]
  },
  {
    id: 'team-5',
    userId,
    opportunityId: 'opp-16',
    name: 'NetSlayers',
    members: [
      { name: 'Rohan', role: 'Binary Forensics Specialist', contact: 'rohan@ctf.net' },
      { name: 'Kabir', role: 'Network Protocol Analyst', contact: 'kabir@ctf.net' },
      { name: 'Demo User', role: 'Web Exploits & Cryptography', contact: 'demo@bloodconnect.ai' }
    ]
  }
];

export const SEED_TASKS: Task[] = [];

// To ensure we have EXACTLY 100 tasks and 30 completed activities:
// Let's programmatically generate tasks with realistic text to guarantee high quality and precise counts!
function generateSeedTasks() {
  const list: Task[] = [];

  // Completed Tasks: Need exactly 32 completed tasks!
  const completedTaskDefinitions = [
    // SheBuilds Completed Task
    { oppId: 'opp-1', title: 'Initialize SheBuilds Git repository & ESLint', desc: 'Create initial repo skeleton and setup typescript configurations.', priority: 'Medium' as const },
    { oppId: 'opp-1', title: 'Draft Figma mockups for tutor navigation and whiteboard views', desc: 'Detail sidebars, user avatars, and whiteboard toolbox overlays.', priority: 'High' as const },
    { oppId: 'opp-1', title: 'Setup Node server skeleton', desc: 'Configure Express endpoints mapping basic routes and health checks.', priority: 'Medium' as const },
    // Google STEP Completed Tasks
    { oppId: 'opp-3', title: 'Refactor personal resume for STEP guidelines', desc: 'Include relevant academic software achievements, GPA, and GitHub URL.', priority: 'Critical' as const },
    { oppId: 'opp-3', title: 'Solve 20 graph traversal and BFS/DFS problems', desc: 'Practice patterns on LeetCode focusing on matrices and grid coordinates.', priority: 'High' as const },
    { oppId: 'opp-3', title: 'Request step referral from department alumnus', desc: 'Draft cover email explaining current hackathon roles and projects.', priority: 'High' as const },
    // Open Source Summit Berlin Completed Tasks
    { oppId: 'opp-5', title: 'Submit academic scholarship application documents', desc: 'Upload GPA transcripts, recommendation letter, and summary of interest.', priority: 'Critical' as const },
    { oppId: 'opp-5', title: 'Receive passport authorization updates', desc: 'Verify passport validity dates exceed the conference dates by 6 months.', priority: 'Medium' as const },
    // Next-Gen Web Dev Workshop Completed Tasks
    { oppId: 'opp-6', title: 'Install Node 21.0 on local developer laptop', desc: 'Update nvm alias and make sure pnpm version matches latest specs.', priority: 'Low' as const },
    // Y-Combinator completed tasks
    { oppId: 'opp-9', title: 'Setup WebRTC signaling connection lobbies', desc: 'Integrate simple socket event handshakes for multi-user voice rooms.', priority: 'Critical' as const },
    { oppId: 'opp-9', title: 'Design fluid room controls and chat overlay panels', desc: 'Build reactive UI elements that allow muting audio and clearing logs.', priority: 'High' as const },
    { oppId: 'opp-9', title: 'Record a 2-minute project demo screenshare video', desc: 'Demonstrate functional peer interactions and low audio latency.', priority: 'High' as const },
    { oppId: 'opp-9', title: 'Pitch project MVP to YC Alumni mentors during audit panel', desc: 'Synthesize student peer use-case and active collaborative stats.', priority: 'Critical' as const },
    // Neo Scholars Completed Tasks
    { oppId: 'opp-17', title: 'Solve coding puzzle stage for Neo Application', desc: 'Write efficient algorithmic solutions for custom data arrays.', priority: 'Critical' as const },
    { oppId: 'opp-17', title: 'Fill personality essay describing personal engineering trajectory', desc: 'Highlight hackathons, peer initiatives, and collaborative labs.', priority: 'High' as const },
    { oppId: 'opp-17', title: 'Complete first-round founder interview loop', desc: 'Talk about target student memory agent vision and past startups.', priority: 'Critical' as const },
    { oppId: 'opp-17', title: 'Confirm Neo fellowship agreement documents online', desc: 'E-sign fellowship onboarding criteria and peer code of conduct.', priority: 'Medium' as const },
    // HackerX Completed Tasks
    { oppId: 'opp-18', title: 'Submit signup form for HackerX Code Contest', desc: 'Include language preferences and target region identifiers.', priority: 'Low' as const },
    { oppId: 'opp-18', title: 'Complete preliminary code warmups on portal', desc: 'Verify environment debugger can output results via custom stdout lines.', priority: 'Medium' as const },

    // General Student Completed Tasks (Not linked to any opportunity directly)
    { oppId: '', title: 'Clean and format developer portfolio homepage layout', desc: 'Ensure fast image responsive rendering and clean tailwind grid margins.', priority: 'Medium' as const },
    { oppId: '', title: 'Complete calculus homework on double integration loops', desc: 'Solve exercises 14 through 32 illustrating dynamic area changes.', priority: 'Medium' as const },
    { oppId: '', title: 'Configure SSH keys for enterprise GitHub authentication', desc: 'Rotate old RSA keys with clean, robust Ed25519 cryptography.', priority: 'Low' as const },
    { oppId: '', title: 'Conduct department research on vector databases', desc: 'Read research papers comparing pinecone, pgvector, and chroma.', priority: 'High' as const },
    { oppId: '', title: 'Set up backup hard drive for laptop contents', desc: 'Create secure disk images of core source codes and academic PDFs.', priority: 'Low' as const },
    { oppId: '', title: 'Draft technical blog detailing microservices message queues', desc: 'Elucidate differences between RabbitMQ, Kafka, and Redis PubSub.', priority: 'Medium' as const },
    { oppId: '', title: 'Review linear algebra matrices and eigenvalues properties', desc: 'Complete 5 proofs showing basis invariance of linear map traces.', priority: 'High' as const },
    { oppId: '', title: 'Practice SQL window partitions and aggregations', desc: 'Do 15 intermediate hacking challenges of row ranking and offsets.', priority: 'Medium' as const },
    { oppId: '', title: 'Update LinkedIn profile with latest tech stack achievements', desc: 'Highlight React 19, TypeScript, and Express fullstack work.', priority: 'Low' as const },
    { oppId: '', title: 'Attend campus seminar on sustainable smart energy grids', desc: 'Listen to keynote on utilizing decentral battery arrays.', priority: 'Low' as const },
    { oppId: '', title: 'Fix CSS layout overlapping bug in campus club homepage', desc: 'Resolve absolute positioning conflict inside responsive navigation bar.', priority: 'Medium' as const },
    { oppId: '', title: 'Refactor college department database indexing structure', desc: 'Add composite index for student courses query speedup.', priority: 'High' as const },
    { oppId: '', title: 'Prepare slide deck for Operating Systems course group demo', desc: 'Detail semaphore coordination block and custom scheduler loops.', priority: 'High' as const }
  ];

  // Let's form the completed tasks list (32 tasks exactly)
  completedTaskDefinitions.forEach((def, index) => {
    list.push({
      id: `task-comp-${index}`,
      userId,
      opportunityId: def.oppId || undefined,
      title: def.title,
      description: def.desc,
      dueDate: '2026-05-20', // historical past due date
      priority: def.priority,
      status: 'Completed',
      createdAt: '2026-05-01T10:00:00.000Z'
    });
  });

  // Now, let's generate 68 active tasks (Pending and In Progress) to reach EXACTLY 100 tasks in total!
  // Distribute them among our 20 opportunities and general goals
  const activeOpportunities = [
    { oppId: 'opp-1', name: 'SheBuilds Hackathon' },
    { oppId: 'opp-2', name: 'MLH Fellowship' },
    { oppId: 'opp-3', name: 'Google STEP Internship' },
    { oppId: 'opp-4', name: 'ACM ICPC Regionals' },
    { oppId: 'opp-7', name: 'Kaggle Global Predictor' },
    { oppId: 'opp-10', name: 'Jane Street Quantitative Fellowship' },
    { oppId: 'opp-11', name: 'Stripe Junior Software Engineer' },
    { oppId: 'opp-12', name: 'NASA Space Apps Challenge' },
    { oppId: 'opp-13', name: 'GitHub Campus Expert' },
    { oppId: 'opp-14', name: 'AWS Cloud Practitioner Cohort' },
    { oppId: 'opp-15', name: 'ETH Global London' },
    { oppId: 'opp-16', name: 'Cisco Intercollegiate Cyber Cup' },
    { oppId: 'opp-19', name: 'Vercel Front-End Fellowship' },
    { oppId: 'opp-20', name: 'Data Science Internship Meta' }
  ];

  const taskTitlesPool = [
    { title: 'Learn key concepts and prepare cheatsheets', desc: 'Write concise explanations of complex terms.', importance: 'High' as const },
    { title: 'Study previous winning projects or review questions', desc: 'Examine design plans, tech stacks, and team composition.', importance: 'Medium' as const },
    { title: 'Build clean, interactive frontend routes', desc: 'Ensure smooth page changes, proper margins, and helpful icons.', importance: 'High' as const },
    { title: 'Set up resilient API schemas and data validation', desc: 'Create backend routes returning robust structured data.', importance: 'High' as const },
    { title: 'Write comprehensive integration tests for features', desc: 'Verify correct operations under normal and edge conditions.', priority: 'Medium' as const },
    { title: 'Assemble submission documentation & pitch video', desc: 'Organize high-level highlights, architecture maps, and user results.', importance: 'Critical' as const },
    { title: 'Refactor algorithmic execution profiles for latency', desc: 'Measure system runtimes and remove unnecessary allocations.', importance: 'Medium' as const },
    { title: 'Attend weekly sync meetings & gather suggestions', desc: 'Present recent progress, note suggestions, and clarify roles.', importance: 'Low' as const },
    { title: 'Deploy functional release build to test platform', desc: 'Fix build errors and verify environment variables.', importance: 'High' as const },
    { title: 'Prepare backup plans for complex modules', desc: 'Develop simple contingency fallback configurations.', importance: 'Low' as const }
  ];

  let taskCounter = 0;

  // Let's allocate 3-4 tasks to each active opportunity (approx 14 * 3.5 = 49 tasks)
  activeOpportunities.forEach((opp) => {
    const taskCountForOpp = 3 + (taskCounter % 2); // alternating 3 or 4 tasks
    for (let c = 0; c < taskCountForOpp; c++) {
      const designRef = taskTitlesPool[(taskCounter + c) % taskTitlesPool.length];
      const status: TaskStatus = (taskCounter % 3 === 0) ? 'In Progress' : 'Pending';
      const priority: TaskPriority = (taskCounter % 4 === 0) ? 'Critical' : (taskCounter % 4 === 1) ? 'High' : (taskCounter % 4 === 2) ? 'Medium' : 'Low';
      
      // Let's vary the due dates around the current local time 2026-06-05
      // Some overdue (which will go to BACKLOG!), some due very soon, some due in the future
      let dueDate = '2026-06-12';
      if (taskCounter % 6 === 0) {
        dueDate = '2026-05-25'; // Overdue -> will trigger Backlog view!
      } else if (taskCounter % 6 === 1) {
        dueDate = '2026-06-03'; // Overdue -> will trigger Backlog view!
      } else if (taskCounter % 6 === 2) {
        dueDate = '2026-06-06'; // Due tomorrow/Day after
      } else if (taskCounter % 6 === 3) {
        dueDate = '2026-06-08'; // Due soon
      } else if (taskCounter % 6 === 4) {
        dueDate = '2026-06-22';
      } else {
        dueDate = '2026-07-04';
      }

      list.push({
        id: `task-active-${taskCounter}`,
        userId,
        opportunityId: opp.oppId,
        title: `${opp.name}: ${designRef.title}`,
        description: `Linked to opportunity. ${designRef.desc}. Make sure to coordinate with other stakeholders.`,
        dueDate,
        priority,
        status,
        createdAt: '2026-06-01T09:00:00.000Z'
      });
      taskCounter++;
    }
  });

  // The remaining tasks to reach EXACTLY 100 in total will be general student tasks (68 remaining - taskCounter generated)
  const targetRemaining = 100 - list.length;
  const generalTaskTitles = [
    'Review discrete mathematics graph isomorphism proofs',
    'Revise algorithms for finding strongly connected components',
    'Write documentation for automated server deploy scripts',
    'Schedule academic mentor consultation session',
    'Conduct comprehensive review of computer architecture pipelines',
    'Refactor personal cloud backup storage configurations',
    'Buy textbook material on advanced dynamic scheduling',
    'Set up Docker container layouts for localized development',
    'Research modern distributed database clustering benefits',
    'Organize digital folders containing developer credentials',
    'Complete quiz on transaction isolation levels and concurrency',
    'Install and test Postgres extensions locally',
    'Draft syllabus summary for upcoming summer research labs',
    'Practice mock technical interviews with peer partners',
    'Complete resume feedback revisions from university center',
    'Review binary trees leaf count equations',
    'Organize workspace cables and charging structures',
    'Backup previous semester source code files safely'
  ];

  for (let r = 0; r < targetRemaining; r++) {
    const title = generalTaskTitles[r % generalTaskTitles.length];
    const status: TaskStatus = (r % 2 === 0) ? 'In Progress' : 'Pending';
    const priority: TaskPriority = (r % 3 === 0) ? 'High' : (r % 3 === 1) ? 'Medium' : 'Low';
    
    // Vary due dates: some backlog and some future
    let dueDate = '2026-06-15';
    if (r % 5 === 0) {
      dueDate = '2026-05-28'; // Overdue!
    } else if (r % 5 === 1) {
      dueDate = '2026-06-04'; // Overdue!
    } else if (r % 5 === 2) {
      dueDate = '2026-06-06'; // Due tomorrow!
    } else if (r % 5 === 3) {
      dueDate = '2026-06-14';
    } else {
      dueDate = '2026-06-25';
    }

    list.push({
      id: `task-gen-${r}`,
      userId,
      opportunityId: undefined,
      title: `General: ${title}`,
      description: 'Personal growth and academic commitment target. Track individually or query in AI check-ins.',
      dueDate,
      priority,
      status,
      createdAt: '2026-06-02T10:00:00.000Z'
    });
  }

  return list;
}

export const SEED_TASKS_CONTAINER = generateSeedTasks();

export const SEED_DAILY_CHECKINS: DailyCheckin[] = [
  {
    id: 'dc-1',
    userId,
    date: '2026-06-03',
    completedToday: 'Refactored personal profile styling and finished the Calculus double integration exercises.',
    workingOn: 'Drafting the Y-Combinator project summary screenshots & videos.',
    blockers: 'None so far, feeling very energized!',
    summary: 'Shivangi is making steady progress. He finished his math assignments and refactored his developer portfolio. His priority now is compiling submission resources for YC.',
    createdAt: '2026-06-03T18:00:00.000Z'
  },
  {
    id: 'dc-2',
    userId,
    date: '2026-06-04',
    completedToday: 'Finished setting up the first-round developer folders and designed tutor navigation layouts.',
    workingOn: 'Implementing SheBuilds server skeleton and routing algorithms.',
    blockers: 'Slight delay coordinating with Riya regarding DB schemas, but Riya is responsive.',
    summary: 'Progress is solid on SheBuilds. She finalized mockups and directory skeletons, and has moved on to the Express server routes. Communication blockers with teammates are currently resolved.',
    createdAt: '2026-06-04T19:00:00.000Z'
  }
];

export const SEED_WEEKLY_REPORTS: WeeklyReport[] = [
  {
    id: 'wr-1',
    userId,
    weekEndDate: '2026-05-31',
    completedTasks: [
      'Record YC screenshare and pitch proposal',
      'Solve coding puzzle stage for Neo Scholars',
      'E-sign Neo Scholars agreements'
    ],
    missedTasks: [
      'Next-Gen Web Dev Workshop preparatory installations'
    ],
    applicationsSubmitted: 4,
    upcomingDeadlines: [
      'SheBuilds Hackathon (June 20)',
      'MLH Fellowship (June 30)'
    ],
    productivityScore: 88,
    suggestedFocusAreas: [
      'Prioritize SheBuilds backend routes',
      'Commence STEP algorithm reviews',
      'Install Web Dev dependencies on local environment'
    ],
    createdAt: '2026-05-31T20:00:00.000Z'
  }
];

export const SEED_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    userId,
    title: 'SheBuilds Hackathon approaching!',
    message: 'Submission closes on June 20. Your team matches "SheBuilds Crew". Frontend tasks are pending.',
    type: 'deadline',
    read: false,
    createdAt: '2026-06-04T08:00:00.000Z'
  },
  {
    id: 'notif-2',
    userId,
    title: 'Outstanding achievements recorded',
    message: 'Congratulations! You are officially selected as a Neo Scholar. Matrix onboarding is active.',
    type: 'success',
    read: false,
    createdAt: '2026-06-01T09:00:00.000Z'
  },
  {
    id: 'notif-3',
    userId,
    title: 'Overdue task warning',
    message: 'Calculus homework double integration proofs are marked past-due and pushed to Backlog!',
    type: 'warning',
    read: true,
    createdAt: '2026-05-29T10:00:00.000Z'
  }
];

export const SEED_MEMORIES: Memory[] = [
  {
    id: 'mem-1',
    userId,
    title: 'SheBuilds Team Members',
    content: 'Ananya is writing frontend views using motion/react. Riya is compiling Express models on the server. Shivangi is lead project manager keeping timelines synchronized.',
    category: 'team',
    createdAt: '2026-06-01T10:00:00.000Z'
  },
  {
    id: 'mem-2',
    userId,
    title: 'STEP Internship referral coordinates',
    content: 'Referred by senior software engineer Rohan. Follow-ups must reference team safety and node clusters as priority topics she demonstrated during academic demo labs.',
    category: 'preference',
    createdAt: '2026-06-02T11:00:00.000Z'
  },
  {
    id: 'mem-3',
    userId,
    title: 'Neo Scholars schedule priorities',
    content: 'Mentoring sync happens every alternating Tuesday. Focus is on scaling digital services, bootstrap MVP structures, and database latency profiles.',
    category: 'goal',
    createdAt: '2026-06-03T12:00:00.000Z'
  }
];

export const SEED_USER_PREFERENCE: UserPreference = {
  userId,
  notificationsEnabled: true,
  targetOpportunityTypes: ['Hackathon', 'Fellowship', 'Internship', 'Competition'],
  weeklyCochingDay: 'Sunday'
};

export const SEED_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'al-1',
    userId,
    action: 'Registered Opportunity',
    details: 'Added Space Apps Challenge, slated with an August 15 submission deadline.',
    createdAt: '2026-06-01T10:10:00.000Z'
  },
  {
    id: 'al-2',
    userId,
    action: 'Completed Checkin',
    details: 'Completed checkin checklist on math tasks and portfolio mockups.',
    createdAt: '2026-06-04T19:00:00.000Z'
  }
];
