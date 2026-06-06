export interface PhaseData {
  id: number;
  title: string;
  subtitle: string;
  phasedescription: string;
  description: string;
  skills: string[];
  company: string[];
}

export const PHASES_DATA: PhaseData[] = [
  {
    id: 1,
    title: "Phase 1",
    subtitle: "Vision & Design Mastery",
    phasedescription:"Turn ideas into clear product concepts and impactful designs. Build strong branding, UI/UX, and creative foundations.",
    description:
      "Turn ideas into clear product concepts and impactful designs. Build strong branding, UI/UX, and creative foundations.",
    skills: [
      "Learn to plan ANYTHING",
      "Learn Prompt Engineering: A skill to articulate your problem to AI and get the desired output to use in your project",
      "Learn how to generate image videos and 3D visuals using AI",
      "Learn UIUX Design & mobile UIUX design in Figma",
    ],
    company: [
      "Build your company's execution masterplan",
      "Decide your company name, tagline, insta bio & make it live",
      "Build your company's logo, identity design, pattern, typography & mockup designs",
      "Make your own website UIUX and Mobile UIUX design",
    ],
  },
  {
    id: 2,
    title: "Phase 2",
    subtitle: "AI Product Development",
    phasedescription:"Build products with AI-powered tools. Launch websites, apps, and digital experiences.",
    description:
      "Build products with AI-powered tools. Launch websites, apps, and digital experiences.",
    skills: [
      "Learn how to design no-code website landing pages",
      "Learn how to do programming in Android Studio, Xcode & Vscode without prior coding experience",
      "Learn how to use multiple AI platforms to launch your own app (React, Android, iOS)",
    ],
    company: [
      "Build your company's no code website & make it live on your domain.com",
      "Build your own product with AI",
      "Build your own custom GPTs",
      "Launch your app on Playstore and/or Appstore",
    ],
  },
  {
    id: 3,
    title: "Phase 3",
    subtitle: "Growth & Sales",
    phasedescription:"Create content that drives attention and trust. Grow through marketing, sales, and distribution.",
    description:
      "Create content that drives attention and trust. Grow through marketing, sales, and distribution.",
    skills: [
      "Learn video editing, photo editing, thumbnail creation, video animation using AI tools",
      "Learn behavior of social media platforms for SEO as well as digital marketing",
    ],
    company: [
      "Design your very own social media video edited templates & content flow",
      "Create your own social media funnel to bring customers using our content to commerce strategy",
    ],
  },
];
