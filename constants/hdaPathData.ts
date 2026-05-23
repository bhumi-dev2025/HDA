export interface Lesson {
  id: number;
  icon: any;
  title: string;
  chapter: string;
  chapterTitle: string;
  week: number;
  bullets: string[];
}

export const HDA_LESSONS: Lesson[] = [
  {
    id: 1,
    icon: require('../assets/photo/c31.png'),
    title: "FigJam Basics",
    chapter: "Phase 1 | Chapter 1",
    chapterTitle: "Designing Your Mind",
    week: 1,
    bullets: [
      "Use FigJam for brainstorming and planning",
      "Create diagrams and flowcharts easily",
      "Collaborate with your team in real-time",
    ]
  },
  {
    id: 2,
    icon: require('../assets/photo/c32.png'),
    title: "ChatGPT Mastery",
    chapter: "Phase 1 | Chapter 1",
    chapterTitle: "Designing Your Mind",
    week: 1,
    bullets: [
      "Generate ideas, scripts and UI copy with AI",
      "Automate design briefs and strategies",
      "Debug and learn anything quickly",
    ]
  },
  {
    id: 3,
    icon: require('../assets/photo/c33.png'),
    title: "Google AI Studio",
    chapter: "Phase 1 | Chapter 1",
    chapterTitle: "Designing Your Mind",
    week: 1,
    bullets: [
      "Train custom AI models for your brand",
      "Integrate AI via API into apps and websites",
      "Create reliable prompt engineering workflows",
    ]
  },
  {
    id: 4,
    icon: require('../assets/photo/c34.png'),
    title: "Figma Fundamentals",
    chapter: "Phase 1 | Chapter 2",
    chapterTitle: "FigJam Workspace Optimization",
    week: 2,
    bullets: [
      "Build logos, branding and UI screens",
      "Create clickable app and website demos",
      "Manage components, styles and typography",
    ]
  },
  {
    id: 5,
    icon: require('../assets/photo/c35.png'),
    title: "Figma Advanced",
    chapter: "Phase 1 | Chapter 2",
    chapterTitle: "FigJam Workspace Optimization",
    week: 2,
    bullets: [
      "Master Auto Layout for responsive design",
      "Build and maintain a full Design System",
      "Use Variables and Tokens for consistency",
    ]
  },
  {
    id: 6,
    icon: require('../assets/photo/c36.png'),
    title: "Figma Prototyping",
    chapter: "Phase 1 | Chapter 2",
    chapterTitle: "FigJam Workspace Optimization",
    week: 3,
    bullets: [
      "Create advanced interactive prototypes",
      "Add micro-animations and transitions",
      "Present designs professionally to clients",
    ]
  },
  {
    id: 7,
    icon: require('../assets/photo/c37.png'),
    title: "Framer Websites",
    chapter: "Phase 1 | Chapter 3",
    chapterTitle: "No-Code Web Design",
    week: 3,
    bullets: [
      "Build responsive layouts for all devices",
      "Add scroll effects and animations",
      "Generate full pages instantly with Framer AI",
    ]
  },
  {
    id: 8,
    icon: require('../assets/photo/c38.png'),
    title: "Webflow Basics",
    chapter: "Phase 1 | Chapter 3",
    chapterTitle: "No-Code Web Design",
    week: 4,
    bullets: [
      "Design production-ready websites visually",
      "Use CMS for dynamic content management",
      "Publish and host your website directly",
    ]
  },
  {
    id: 9,
    icon: require('../assets/photo/c39.png'),
    title: "Spline 3D",
    chapter: "Phase 1 | Chapter 3",
    chapterTitle: "No-Code Web Design",
    week: 4,
    bullets: [
      "Build 3D product models and scenes",
      "Embed 3D experiences into Framer",
      "Export to iOS, macOS and visionOS",
    ]
  },
  {
    id: 10,
    icon: require('../assets/photo/c40.png'),
    title: "Motion Design",
    chapter: "Phase 2 | Chapter 1",
    chapterTitle: "Video & Motion",
    week: 5,
    bullets: [
      "Create engaging motion graphics for brands",
      "Design animated logos and intros",
      "Build scroll-triggered animations",
    ]
  },
  {
    id: 11,
    icon: require('../assets/photo/c41.png'),
    title: "Premiere Pro",
    chapter: "Phase 2 | Chapter 1",
    chapterTitle: "Video & Motion",
    week: 5,
    bullets: [
      "Cut and arrange clips on the timeline",
      "Auto-transcribe and clean dialogue with AI",
      "Enhance audio clarity and quality",
    ]
  },
  {
    id: 12,
    icon: require('../assets/photo/c42.png'),
    title: "After Effects",
    chapter: "Phase 2 | Chapter 1",
    chapterTitle: "Video & Motion",
    week: 6,
    bullets: [
      "Create smooth cinematic motion with keyframes",
      "Animate logos and brand assets professionally",
      "Build intro, transition and reel templates",
    ]
  },
  {
    id: 13,
    icon: require('../assets/photo/c43.png'),
    title: "Photoshop",
    chapter: "Phase 2 | Chapter 2",
    chapterTitle: "Creative Tools",
    week: 6,
    bullets: [
      "Retouch and enhance photos professionally",
      "Add or remove objects using Generative Fill",
      "Create thumbnails and social media assets",
    ]
  },
  {
    id: 14,
    icon: require('../assets/photo/c44.png'),
    title: "Illustrator",
    chapter: "Phase 2 | Chapter 2",
    chapterTitle: "Creative Tools",
    week: 7,
    bullets: [
      "Design scalable vector logos and icons",
      "Create brand identity systems",
      "Master the Pen tool and Bezier curves",
    ]
  },
];
