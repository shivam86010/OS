export const profile = {
  name: "Shivam Singh",
  role: "Frontend Developer",
  email: "shivamsingh8601018@gmail.com",
  phone: "+91 8382044417",
  github: "shivamsingh",
  linkedin: "linkedin.com/in/shivam",
  leetcode: "leetcode.com/shivam",
  location: "India",
  status: "Available for Opportunities",
  bio: "Frontend Developer with 2+ years building responsive, dashboard-driven web applications using React.js, Next.js, Electron.js, Socket.IO, TypeScript, Tailwind CSS, and Redux. I obsess over scalable UI architecture, state management, and the millisecond between intent and feedback.",
  stack: [
    "React",
    "Next.js",
    "TypeScript",
    "Redux",
    "Socket.IO",
    "Electron",
    "Tailwind",
    "Framer Motion",
  ],
};

export const skills = [
  {
    category: "Frontend",
    value: 95,
    items: [
      { name: "React.js", value: 95 },
      { name: "Next.js", value: 90 },
      { name: "TypeScript", value: 88 },
      { name: "JavaScript ES6+", value: 95 },
      { name: "Electron.js", value: 80 },
      { name: "Socket.IO", value: 82 },
    ],
  },
  {
    category: "State & Data",
    value: 90,
    items: [
      { name: "Redux Toolkit", value: 92 },
      { name: "Context API", value: 90 },
      { name: "REST APIs", value: 88 },
      { name: "Strapi", value: 75 },
    ],
  },
  {
    category: "UI & Animation",
    value: 92,
    items: [
      { name: "Tailwind CSS", value: 95 },
      { name: "Framer Motion", value: 88 },
      { name: "Material UI", value: 85 },
      { name: "Shadcn UI", value: 90 },
      { name: "Recharts", value: 85 },
    ],
  },
  {
    category: "Tooling",
    value: 85,
    items: [
      { name: "Git / GitHub", value: 90 },
      { name: "Vite / Webpack", value: 85 },
      { name: "VS Code", value: 95 },
      { name: "Figma / Postman", value: 82 },
    ],
  },
];

export const experience = [
  {
    company: "Uda-Mandi Service Pvt. Ltd.",
    role: "Frontend Developer — Test Portal & HRM",
    period: "Oct 2024 — Present",
    bullets: [
      "Built a Test Portal with separate candidate and company dashboards for assessments, evaluation, and hiring insights",
      "Integrated AI-based proctoring to ensure test authenticity and prevent malpractice during online assessments",
      "Implemented Redux state management to handle complex test flows and real-time updates",
      "Designed responsive, animated UI/UX using React, Tailwind, Framer Motion, and Recharts",
      "Shipped HRM system covering employee registration, salary, shifts, travel, attendance and analytics dashboards",
    ],
  },
  {
    company: "Napino Control Systems Pvt. Ltd.",
    role: "Frontend Developer — Complaint Management",
    period: "Jul 2023 — Dec 2023",
    bullets: [
      "Developed frontend of a Complaint Management System using React.js with a focus on usability and performance",
      "Built responsive UI components for real-time complaint registration, tracking, and status updates",
      "Designed dashboards and employee activity monitoring views to visualize complaint progress and workload",
      "Implemented dynamic forms and tables for data entry, filtering, and status management",
      "Collaborated with backend teams to integrate APIs and ensure smooth data flow",
    ],
  },
];

export const education = [
  {
    degree: "B.Tech, Computer Science",
    year: "2024",
    school: "Krishna Engineering College, Ghaziabad",
    cgpa: "7.9",
  },
  {
    degree: "Intermediate",
    year: "2019",
    school: "TBVIC Beduppar, Turkdiha, Kushinagar",
    cgpa: "7.0",
  },
];

export const projects = [
  {
    id: "testportal",
    name: "Test Portal",
    role: "Frontend Lead",
    stack: ["React", "Redux", "Socket.IO", "Recharts", "Framer Motion"],
    users: "Live Project",
    problem: "Candidate assessment with AI proctoring at scale",
    solution: "Dual dashboards, Redux flows, AI-based proctoring, animated UI",
    result: "Unified testing, evaluation, and hiring workflow",
  },
  {
    id: "hrm",
    name: "HRM Web Application",
    role: "Frontend Developer",
    stack: ["React", "Redux", "Tailwind", "Recharts"],
    users: "Live Project",
    problem: "Fragmented HR operations across teams",
    solution:
      "Centralized dashboard for salary, shifts, leave, attendance, analytics",
    result: "Fully responsive HR ops across desktop, tablet, mobile",
  },
  {
    id: "complaints",
    name: "Complaint Management System",
    role: "Frontend Developer",
    stack: ["React.js", "REST APIs"],
    users: "Internal",
    problem: "Manual complaint tracking and routing",
    solution:
      "Real-time registration, tracking, dynamic forms, activity dashboards",
    result: "Faster resolution and clearer workload visibility",
  },
];

export const achievements = [
  { id: "boot", label: "Booted Shivam OS" },
  { id: "about", label: "Read About.exe" },
  { id: "projects", label: "Explored Projects" },
  { id: "terminal", label: "Opened Terminal" },
  { id: "resume", label: "Downloaded Resume" },
  { id: "contact", label: "Sent a Message" },
  { id: "theme", label: "Changed Theme" },
  { id: "easter", label: "Found Easter Egg" },
  { id: "crash", label: "Crashed The System 💀" },
  { id: "taskmanager", label: "Opened Task Manager" },
];

export const accolades = [
  "Solved 800+ LeetCode problems",
  "6-Star rating in problem solving on HackerRank",
  "AIR 43 — National Chemistry Olympiad",
  "3 Gold Medals — JEE Advanced Test Series",
];
