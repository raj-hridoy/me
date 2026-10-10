export const site = {
  name: "Raj Hridoy",
  role: "Independent Security Researcher",
  location: "Bangladesh",
  email: "rajhridoy404@wearehackerone.com",
  socials: [
    {
      label: "HackerOne",
      href: "https://hackerone.com/rajhridoy404?type=user",
    },
    { label: "Facebook", href: "https://www.facebook.com/0xrajhridoy/" },
    { label: "Instagram", href: "https://www.instagram.com/wzz_hridoy/" },
  ],
};
export const navigation = [
  { label: "Research", href: "/research" },
  { label: "About", href: "/about" },
  { label: "Methodology", href: "/methodology" },
  { label: "Recognition", href: "/recognition" },
];
export const recognitions = [
  {
    name: "U.S. Department of Defense",
    mark: "DoD",
    description:
      "Acknowledgment of independent vulnerability research through its vulnerability disclosure program.",
  },
  {
    name: "Sony",
    mark: "SONY",
    description:
      "Acknowledgment of independent vulnerability research through its vulnerability disclosure program.",
  },
];
export const categories = [
  "Web Application Security",
  "API Security",
  "Authentication and Identity",
  "Access Control",
  "Source-Code Analysis",
  "Cloud-Native Security",
] as const;
export type Category = (typeof categories)[number];
export const researchAreas: {
  title: Category;
  description: string;
  detail: string;
}[] = [
  {
    title: "Web Application Security",
    description: "Following the unexpected paths.",
    detail:
      "Application behavior, business logic, cross-site scripting, and the assumptions that connect them.",
  },
  {
    title: "API Security",
    description: "Beyond a valid response.",
    detail:
      "REST and GraphQL interfaces, object access, input handling, and the context behind every request.",
  },
  {
    title: "Authentication and Identity",
    description: "Identity is only the beginning.",
    detail:
      "Session lifecycles, OAuth flows, identity propagation, and the distinction between recognition and permission.",
  },
  {
    title: "Access Control",
    description: "The right action. The right resource.",
    detail:
      "IDOR, BOLA, role boundaries, tenant isolation, and policy enforcement across application layers.",
  },
  {
    title: "Source-Code Analysis",
    description: "Reading between the lines.",
    detail:
      "Tracing input and identity through code to examine security-critical assumptions and data flows.",
  },
  {
    title: "Cloud-Native Security",
    description: "Understanding connected infrastructure.",
    detail:
      "Research interests in Kubernetes, container boundaries, service identities, and deployment configuration.",
  },
];
export const workflow = [
  {
    title: "Understand",
    question: "What is the system supposed to do?",
    body: "Read the program policy, establish authorized scope, and map the application’s intended behavior. Identify the identities, assets, and boundaries that matter.",
    outcome: "A scoped model of the system and its trust assumptions.",
  },
  {
    title: "Investigate",
    question: "Where does an assumption become a decision?",
    body: "Follow requests, compare access contexts, inspect exposed interfaces, and review relevant source code when available. Build specific hypotheses rather than relying on indiscriminate testing.",
    outcome: "A focused hypothesis with a clear security boundary.",
  },
  {
    title: "Validate",
    question: "Can the behavior be reproduced safely?",
    body: "Use controlled accounts and the minimum evidence necessary to test a hypothesis within authorization. Stop when impact is demonstrated; avoid unrelated data and disruption.",
    outcome: "A repeatable observation with known limitations.",
  },
  {
    title: "Analyze",
    question: "What does the behavior actually permit?",
    body: "Separate the root cause from its symptoms. Identify prerequisites and realistic impact, and explain why the expected control did not hold.",
    outcome: "A precise explanation of cause, conditions, and impact.",
  },
  {
    title: "Document",
    question: "Can someone else understand and reproduce it?",
    body: "Write a structured report with affected functionality, minimal reproduction steps, expected and observed behavior, evidence, and remediation considerations. Redact secrets and unrelated information.",
    outcome: "A report that supports informed remediation.",
  },
  {
    title: "Disclose",
    question: "How does the finding reach the right people?",
    body: "Use the program’s approved reporting channel, communicate constructively, and follow its disclosure policy. Publish technical details only after explicit approval and appropriate redaction.",
    outcome: "Responsible communication, with publication only when approved.",
  },
];
