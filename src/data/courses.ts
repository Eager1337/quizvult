export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

export type Question = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type Lesson = {
  title: string;
  content: string;
  duration: string;
};

export type Course = {
  id: string;
  title: string;
  categoryId: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  lessonsCount: number;
  questionsCount: number;
  lessons: Lesson[];
  questions: Question[];
};

export const categories: Category[] = [
  { id: 'science', name: 'Science', icon: '🔬', color: 'from-emerald-500 to-teal-600' },
  { id: 'technology', name: 'Technology', icon: '💻', color: 'from-blue-500 to-cyan-600' },
  { id: 'history', name: 'History', icon: '📜', color: 'from-amber-500 to-orange-600' },
  { id: 'ethical-hacking', name: 'Ethical Hacking', icon: '🛡️', color: 'from-red-500 to-rose-600' },
  { id: 'cyber-security', name: 'Cyber Security', icon: '🔒', color: 'from-violet-500 to-purple-600' },
  { id: 'economics', name: 'Economics', icon: '📊', color: 'from-green-500 to-emerald-600' },
  { id: 'relationships', name: 'Relationships', icon: '❤️', color: 'from-pink-500 to-rose-600' },
  { id: 'trading', name: 'Trading', icon: '📈', color: 'from-yellow-500 to-amber-600' },
  { id: 'machiavelli', name: 'Machiavelli & Strategy', icon: '♟️', color: 'from-slate-500 to-gray-700' },
  { id: 'money', name: 'Money Making', icon: '💰', color: 'from-lime-500 to-green-600' },
  { id: 'psychology', name: 'Psychology', icon: '🧠', color: 'from-indigo-500 to-blue-600' },
  { id: 'philosophy', name: 'Philosophy', icon: '💭', color: 'from-purple-500 to-indigo-600' },
  { id: 'mathematics', name: 'Mathematics', icon: '🔢', color: 'from-sky-500 to-blue-600' },
  { id: 'health', name: 'Health & Fitness', icon: '🏋️', color: 'from-teal-500 to-cyan-600' },
  { id: 'business', name: 'Business', icon: '🏢', color: 'from-stone-500 to-neutral-700' },
  { id: 'ai-ml', name: 'AI & Machine Learning', icon: '🤖', color: 'from-fuchsia-500 to-pink-600' },
  { id: 'languages', name: 'Languages', icon: '🌍', color: 'from-orange-500 to-red-600' },
  { id: 'art', name: 'Art & Design', icon: '🎨', color: 'from-rose-500 to-pink-600' },
  { id: 'music', name: 'Music', icon: '🎵', color: 'from-cyan-500 to-teal-600' },
  { id: 'law', name: 'Law & Politics', icon: '⚖️', color: 'from-gray-500 to-slate-600' },
];

// Template data generators for each category
const scienceCourses = [
  'Physics Fundamentals', 'Chemistry Basics', 'Biology 101', 'Quantum Mechanics', 'Organic Chemistry',
  'Genetics & DNA', 'Astronomy & Space', 'Environmental Science', 'Neuroscience Basics', 'Thermodynamics',
  'Electromagnetism', 'Cell Biology', 'Microbiology', 'Geology Essentials', 'Marine Biology',
  'Biochemistry', 'Nuclear Physics', 'Ecology & Ecosystems', 'Human Anatomy', 'Astrophysics',
  'Particle Physics', 'Molecular Biology', 'Zoology', 'Botany Essentials', 'Paleontology',
];

const technologyCourses = [
  'Web Development 101', 'Python Programming', 'JavaScript Mastery', 'React Framework', 'Database Design',
  'Cloud Computing AWS', 'DevOps Essentials', 'Mobile App Dev', 'API Design', 'Git & Version Control',
  'Docker & Containers', 'Linux Administration', 'TypeScript Advanced', 'GraphQL Fundamentals', 'Microservices',
  'Rust Programming', 'Go Language Basics', 'System Design', 'Blockchain Basics', 'IoT Development',
  'Kubernetes Mastery', 'CI/CD Pipelines', 'Serverless Architecture', 'Data Structures', 'Algorithm Design',
];

const historyCourses = [
  'Ancient Egypt', 'Roman Empire', 'Medieval Europe', 'Renaissance Era', 'French Revolution',
  'World War I', 'World War II', 'Cold War Era', 'Ancient Greece', 'Industrial Revolution',
  'American Revolution', 'Chinese Dynasties', 'Ottoman Empire', 'Viking Age', 'Aztec Civilization',
  'British Empire', 'Japanese History', 'African Kingdoms', 'Russian Revolution', 'Age of Exploration',
  'Mesopotamia', 'Byzantine Empire', 'Mongol Empire', 'Indian Independence', 'Korean War',
];

const ethicalHackingCourses = [
  'Penetration Testing', 'Network Scanning', 'Web App Hacking', 'SQL Injection', 'XSS Attacks',
  'Social Engineering', 'Wireless Hacking', 'Metasploit Framework', 'Kali Linux Tools', 'Bug Bounty Hunting',
  'OWASP Top 10', 'Reverse Engineering', 'Malware Analysis', 'Exploit Development', 'Red Team Ops',
  'Nmap Mastery', 'Burp Suite Pro', 'Password Cracking', 'Buffer Overflow', 'Privilege Escalation',
  'CTF Challenges', 'Forensics Basics', 'Phishing Defense', 'API Security Testing', 'Cloud Pentesting',
];

const cyberSecurityCourses = [
  'Network Security', 'Cryptography 101', 'Firewall Management', 'Incident Response', 'Security Policies',
  'Risk Assessment', 'SIEM Tools', 'Threat Intelligence', 'Zero Trust Model', 'Compliance & Audit',
  'Identity Management', 'Endpoint Security', 'SOC Operations', 'Vulnerability Management', 'Data Encryption',
  'Digital Forensics', 'Cloud Security', 'IoT Security', 'Security Architecture', 'Disaster Recovery',
  'Blue Team Defense', 'PKI Infrastructure', 'Security Automation', 'Threat Hunting', 'GRC Fundamentals',
];

const economicsCourses = [
  'Microeconomics', 'Macroeconomics', 'Supply & Demand', 'Fiscal Policy', 'Monetary Policy',
  'International Trade', 'Game Theory', 'Behavioral Economics', 'Development Economics', 'Labor Economics',
  'Public Finance', 'Econometrics', 'Financial Markets', 'Economic History', 'Environmental Economics',
  'Health Economics', 'Industrial Organization', 'Urban Economics', 'Agricultural Economics', 'Digital Economics',
  'Inflation & Deflation', 'GDP & Growth', 'Central Banking', 'Trade Agreements', 'Wealth Inequality',
];

const relationshipsCourses = [
  'Communication Skills', 'Emotional Intelligence', 'Conflict Resolution', 'Love Languages', 'Attachment Theory',
  'Building Trust', 'Dating Psychology', 'Marriage Counseling', 'Boundaries Setting', 'Self-Love Practices',
  'Body Language', 'Active Listening', 'Toxic Relationships', 'Long Distance Tips', 'Family Dynamics',
  'Forgiveness & Healing', 'Vulnerability Power', 'Social Skills', 'Networking Mastery', 'Empathy Training',
  'Partner Selection', 'Relationship Recovery', 'Co-Dependency', 'Healthy Breakups', 'Intimacy Building',
];

const tradingCourses = [
  'Stock Market Basics', 'Technical Analysis', 'Fundamental Analysis', 'Day Trading', 'Swing Trading',
  'Options Trading', 'Forex Basics', 'Crypto Trading', 'Risk Management', 'Candlestick Patterns',
  'Chart Patterns', 'Trading Psychology', 'Position Sizing', 'Algorithmic Trading', 'Futures Trading',
  'Dividend Investing', 'ETF Strategies', 'Value Investing', 'Growth Investing', 'Portfolio Management',
  'Market Indicators', 'Order Types', 'Margin Trading', 'Tax Strategies', 'Backtesting Methods',
];

const machiavelliCourses = [
  'The Prince Summary', 'Power Dynamics', 'Political Strategy', 'Art of War Sun Tzu', 'Strategic Thinking',
  'Manipulation Defense', 'Influence Tactics', 'Leadership Styles', 'Negotiation Power', 'Game Theory Applied',
  '48 Laws of Power', 'Dark Psychology', 'Persuasion Science', 'Authority Building', 'Strategic Alliances',
  'Decision Making', 'Risk Assessment', 'Deception Detection', 'Machiavellian Ethics', 'Modern Power Plays',
  'Corporate Strategy', 'Military Strategy', 'Diplomatic Arts', 'Propaganda Analysis', 'Power Structures',
];

const moneyCourses = [
  'Passive Income 101', 'Side Hustles', 'Freelancing Guide', 'E-commerce Basics', 'Dropshipping',
  'Affiliate Marketing', 'Content Creation', 'Real Estate Investing', 'Personal Finance', 'Budgeting Mastery',
  'Wealth Building', 'Tax Optimization', 'Online Business', 'SaaS Building', 'Consulting Business',
  'Print on Demand', 'YouTube Monetization', 'App Monetization', 'Digital Products', 'Course Creation',
  'Rental Income', 'Peer Lending', 'Angel Investing', 'Flipping Business', 'Subscription Models',
];

const psychologyCourses = [
  'Cognitive Psychology', 'Social Psychology', 'Developmental Psych', 'Abnormal Psychology', 'Positive Psychology',
  'Clinical Psychology', 'Forensic Psychology', 'Sport Psychology', 'Health Psychology', 'Neuropsychology',
  'Behavioral Therapy', 'Psychoanalysis', 'Mindfulness & CBT', 'Memory & Learning', 'Motivation Theory',
  'Personality Types', 'Stress Management', 'Sleep Psychology', 'Addiction Psychology', 'Group Dynamics',
  'Decision Psychology', 'Consumer Psychology', 'Educational Psych', 'Evolutionary Psych', 'Color Psychology',
];

const philosophyCourses = [
  'Stoicism', 'Existentialism', 'Ethics & Morality', 'Logic & Reasoning', 'Eastern Philosophy',
  'Plato & Socrates', 'Nietzsche Studies', 'Epistemology', 'Metaphysics', 'Political Philosophy',
  'Philosophy of Mind', 'Aesthetics', 'Philosophy of Science', 'Utilitarianism', 'Kantian Ethics',
  'Taoism', 'Buddhism Philosophy', 'Phenomenology', 'Pragmatism', 'Absurdism',
  'Free Will Debate', 'Consciousness', 'Ethics of AI', 'Environmental Ethics', 'Virtue Ethics',
];

const mathematicsCourses = [
  'Algebra Basics', 'Calculus I', 'Calculus II', 'Linear Algebra', 'Statistics',
  'Probability Theory', 'Discrete Math', 'Number Theory', 'Geometry', 'Trigonometry',
  'Differential Equations', 'Abstract Algebra', 'Real Analysis', 'Complex Analysis', 'Topology',
  'Graph Theory', 'Combinatorics', 'Numerical Methods', 'Mathematical Logic', 'Set Theory',
  'Game Theory Math', 'Cryptography Math', 'Optimization', 'Fourier Analysis', 'Chaos Theory',
];

const healthCourses = [
  'Nutrition Basics', 'Strength Training', 'Cardio Fitness', 'Yoga & Flexibility', 'Mental Health',
  'Weight Management', 'Sleep Optimization', 'Stress Reduction', 'HIIT Training', 'Meditation Guide',
  'Meal Planning', 'Supplements Guide', 'Injury Prevention', 'Bodyweight Training', 'Running Guide',
  'Sports Nutrition', 'Fasting Methods', 'Posture Correction', 'Hydration Science', 'Recovery Methods',
  'Functional Fitness', 'Core Training', 'Swimming Fitness', 'Martial Arts Basics', 'Stretching Routines',
];

const businessCourses = [
  'Entrepreneurship', 'Marketing Strategy', 'Sales Techniques', 'Project Management', 'Leadership Skills',
  'Financial Accounting', 'HR Management', 'Operations Management', 'Supply Chain', 'Business Analytics',
  'Brand Building', 'Customer Service', 'Lean Startup', 'Pitch Deck Design', 'Venture Capital',
  'Product Management', 'Growth Hacking', 'B2B Sales', 'Market Research', 'Strategic Planning',
  'Franchise Model', 'Exit Strategies', 'Corporate Governance', 'Business Law', 'Innovation Management',
];

const aiMlCourses = [
  'Machine Learning 101', 'Deep Learning', 'Neural Networks', 'NLP Basics', 'Computer Vision',
  'TensorFlow Guide', 'PyTorch Essentials', 'Reinforcement Learning', 'Data Science', 'Feature Engineering',
  'Model Deployment', 'AI Ethics', 'Generative AI', 'LLM Fine-tuning', 'Prompt Engineering',
  'Time Series ML', 'Recommendation Systems', 'Transfer Learning', 'AutoML Tools', 'MLOps',
  'GANs & Diffusion', 'Edge AI', 'Federated Learning', 'AI in Healthcare', 'Autonomous Systems',
];

const languagesCourses = [
  'Spanish Basics', 'French Beginner', 'German 101', 'Japanese Intro', 'Mandarin Chinese',
  'Italian Basics', 'Portuguese', 'Arabic Introduction', 'Korean Basics', 'Russian Beginner',
  'Hindi Basics', 'Turkish 101', 'Dutch Beginner', 'Swedish Intro', 'Polish Basics',
  'Greek Basics', 'Hebrew Introduction', 'Thai Beginner', 'Vietnamese 101', 'Swahili Basics',
  'Sign Language', 'Latin Basics', 'Esperanto', 'Indonesian', 'Finnish Basics',
];

const artCourses = [
  'Drawing Basics', 'Digital Art', 'UI/UX Design', 'Photography', 'Graphic Design',
  'Color Theory', 'Typography', 'Illustration', 'Animation Basics', '3D Modeling',
  'Logo Design', 'Watercolor Painting', 'Sketch Art', 'Adobe Photoshop', 'Figma Design',
  'Art History', 'Calligraphy', 'Character Design', 'Motion Graphics', 'Product Design',
  'Interior Design', 'Fashion Design', 'Film Making', 'Pixel Art', 'Concept Art',
];

const musicCourses = [
  'Music Theory', 'Guitar Basics', 'Piano Beginner', 'Drums 101', 'Singing Technique',
  'Music Production', 'DJ Mixing', 'Songwriting', 'Bass Guitar', 'Ukulele Basics',
  'Audio Engineering', 'Electronic Music', 'Jazz Theory', 'Classical Music', 'Hip Hop Production',
  'Violin Basics', 'Music Business', 'Sound Design', 'Ear Training', 'Rhythm & Timing',
  'Ableton Live', 'FL Studio', 'Logic Pro', 'Mixing & Mastering', 'Music Composition',
];

const lawCourses = [
  'Constitutional Law', 'Criminal Law', 'International Law', 'Human Rights', 'Corporate Law',
  'Intellectual Property', 'Tax Law Basics', 'Environmental Law', 'Contract Law', 'Family Law',
  'Labor Law', 'Cyber Law', 'Immigration Law', 'Media Law', 'Privacy Law',
  'Political Systems', 'Democracy Theory', 'Geopolitics', 'Diplomacy', 'Public Policy',
  'Election Systems', 'Lobbying & Advocacy', 'NGO Management', 'UN Systems', 'Civil Rights',
];

const allCoursesByCategory: Record<string, string[]> = {
  'science': scienceCourses,
  'technology': technologyCourses,
  'history': historyCourses,
  'ethical-hacking': ethicalHackingCourses,
  'cyber-security': cyberSecurityCourses,
  'economics': economicsCourses,
  'relationships': relationshipsCourses,
  'trading': tradingCourses,
  'machiavelli': machiavelliCourses,
  'money': moneyCourses,
  'psychology': psychologyCourses,
  'philosophy': philosophyCourses,
  'mathematics': mathematicsCourses,
  'health': healthCourses,
  'business': businessCourses,
  'ai-ml': aiMlCourses,
  'languages': languagesCourses,
  'art': artCourses,
  'music': musicCourses,
  'law': lawCourses,
};

function generateLesson(courseTitle: string, index: number): Lesson {
  const templates = [
    {
      title: `Introduction to ${courseTitle}`,
      content: `Welcome to this lesson on ${courseTitle}. In this section, we'll cover the fundamental concepts and build a strong foundation.\n\n## Key Concepts\n\n- Understanding the core principles behind ${courseTitle}\n- Historical context and why this matters today\n- Practical applications in real-world scenarios\n\n## Why This Matters\n\nMastering ${courseTitle} opens doors to deeper understanding and practical skills that can be applied across many domains. Whether you're a beginner or looking to refresh your knowledge, this lesson provides the essential framework.\n\n## Getting Started\n\nThe best approach is to take notes, pause to reflect on each concept, and try to connect what you learn here to things you already know. Active learning dramatically improves retention.`,
      duration: '8 min',
    },
    {
      title: `Core Principles of ${courseTitle}`,
      content: `In this lesson, we dive deeper into the core principles that underpin ${courseTitle}.\n\n## The Foundation\n\nEvery expert in this field started by mastering these fundamentals. Understanding the "why" behind each principle is just as important as knowing the "how."\n\n## Principle 1: First Principles Thinking\n\nBreak down complex problems into their most basic elements. This approach, used by experts from Aristotle to Elon Musk, allows you to build knowledge from the ground up.\n\n## Principle 2: Pattern Recognition\n\nAs you study more examples, you'll begin to see patterns emerge. These patterns are the key to mastery and will help you predict outcomes and make better decisions.\n\n## Practice Exercise\n\nTake a concept from this lesson and try to explain it to someone else. Teaching is one of the most effective ways to solidify your understanding.`,
      duration: '12 min',
    },
    {
      title: `Advanced ${courseTitle} Techniques`,
      content: `Now that you understand the basics, let's explore advanced techniques in ${courseTitle}.\n\n## Beyond the Basics\n\nAdvanced practitioners distinguish themselves through nuanced understanding and creative application of fundamental principles.\n\n## Technique 1: Systems Thinking\n\nInstead of looking at individual components, consider how everything connects. This holistic view often reveals insights that narrow focus misses.\n\n## Technique 2: Cross-Domain Application\n\nSome of the most innovative breakthroughs come from applying concepts from one field to another. Consider how ${courseTitle} principles might apply in unexpected areas.\n\n## Real-World Case Study\n\nLet's examine how industry leaders have applied these techniques to achieve remarkable results. The key takeaway: mastery comes from practice and application, not just theory.`,
      duration: '15 min',
    },
  ];
  return templates[index % templates.length];
}

function generateQuestions(courseTitle: string, categoryId: string): Question[] {
  const questionBank: Record<string, Question[]> = {
    'science': [
      { question: `What is the basic unit of life?`, options: ['Atom', 'Cell', 'Molecule', 'Organ'], correctIndex: 1, explanation: 'The cell is the basic structural and functional unit of all living organisms.' },
      { question: `Which planet is known as the Red Planet?`, options: ['Venus', 'Jupiter', 'Mars', 'Saturn'], correctIndex: 2, explanation: 'Mars is called the Red Planet due to iron oxide on its surface.' },
      { question: `What is the chemical symbol for gold?`, options: ['Go', 'Gd', 'Au', 'Ag'], correctIndex: 2, explanation: 'Au comes from the Latin word "aurum" meaning gold.' },
      { question: `What force keeps planets in orbit?`, options: ['Magnetism', 'Gravity', 'Friction', 'Inertia'], correctIndex: 1, explanation: 'Gravity is the force of attraction between masses.' },
      { question: `What is the speed of light approximately?`, options: ['300,000 km/s', '150,000 km/s', '500,000 km/s', '100,000 km/s'], correctIndex: 0, explanation: 'Light travels at approximately 300,000 kilometers per second in a vacuum.' },
    ],
    'technology': [
      { question: `What does HTML stand for?`, options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Hyper Transfer Markup Language', 'Home Tool Markup Language'], correctIndex: 0, explanation: 'HTML is the standard markup language for creating web pages.' },
      { question: `Which language is primarily used for AI/ML?`, options: ['Java', 'C++', 'Python', 'Ruby'], correctIndex: 2, explanation: 'Python has the most extensive AI/ML libraries and community support.' },
      { question: `What is an API?`, options: ['A Programming Interface', 'Application Programming Interface', 'Automated Program Integration', 'Application Process Integration'], correctIndex: 1, explanation: 'API allows different software systems to communicate with each other.' },
      { question: `What does CSS stand for?`, options: ['Computer Style Sheets', 'Cascading Style Sheets', 'Creative Style System', 'Colorful Style Sheets'], correctIndex: 1, explanation: 'CSS is used to style and layout web pages.' },
      { question: `What is Git used for?`, options: ['Web hosting', 'Version control', 'Database management', 'Email'], correctIndex: 1, explanation: 'Git is a distributed version control system for tracking code changes.' },
    ],
    'ethical-hacking': [
      { question: `What is the first phase of ethical hacking?`, options: ['Scanning', 'Reconnaissance', 'Exploitation', 'Reporting'], correctIndex: 1, explanation: 'Reconnaissance involves gathering information about the target system.' },
      { question: `What does SQL injection exploit?`, options: ['Network protocols', 'Database queries', 'Operating system', 'Browser cache'], correctIndex: 1, explanation: 'SQL injection exploits vulnerabilities in database query construction.' },
      { question: `What tool is commonly used for port scanning?`, options: ['Wireshark', 'Nmap', 'Photoshop', 'Excel'], correctIndex: 1, explanation: 'Nmap is the most popular open-source port scanner.' },
      { question: `What is a zero-day exploit?`, options: ['An old vulnerability', 'A patched bug', 'An unknown vulnerability', 'A false alarm'], correctIndex: 2, explanation: 'Zero-day exploits target vulnerabilities unknown to the vendor.' },
      { question: `What is social engineering?`, options: ['Building websites', 'Manipulating people for information', 'Network configuration', 'Code review'], correctIndex: 1, explanation: 'Social engineering manipulates people into divulging confidential information.' },
    ],
    'cyber-security': [
      { question: `What is the CIA triad in security?`, options: ['Central Intelligence Agency', 'Confidentiality, Integrity, Availability', 'Computer Information Access', 'Cyber Intelligence Assessment'], correctIndex: 1, explanation: 'The CIA triad is the foundation of information security.' },
      { question: `What type of attack floods a server?`, options: ['Phishing', 'DDoS', 'Malware', 'Spoofing'], correctIndex: 1, explanation: 'DDoS (Distributed Denial of Service) overwhelms servers with traffic.' },
      { question: `What is two-factor authentication?`, options: ['Two passwords', 'Two verification methods', 'Two usernames', 'Two devices'], correctIndex: 1, explanation: '2FA uses two different verification methods for enhanced security.' },
      { question: `What is encryption?`, options: ['Deleting data', 'Converting data to unreadable format', 'Compressing files', 'Backing up data'], correctIndex: 1, explanation: 'Encryption converts plaintext into ciphertext to protect data.' },
      { question: `What is a firewall?`, options: ['Antivirus software', 'Network security system', 'A web browser', 'An operating system'], correctIndex: 1, explanation: 'A firewall monitors and controls incoming and outgoing network traffic.' },
    ],
  };

  // Fallback generic questions
  const generic: Question[] = [
    { question: `What is a key principle of ${courseTitle}?`, options: ['Memorization only', 'Understanding fundamentals', 'Skipping basics', 'Random guessing'], correctIndex: 1, explanation: 'Understanding fundamentals is essential for mastery in any field.' },
    { question: `Which approach is best for learning ${courseTitle}?`, options: ['Passive reading', 'Active practice', 'Cramming', 'Ignoring theory'], correctIndex: 1, explanation: 'Active practice with feedback leads to the deepest learning.' },
    { question: `What distinguishes experts in this field?`, options: ['Natural talent only', 'Consistent deliberate practice', 'Expensive tools', 'Luck'], correctIndex: 1, explanation: 'Research shows deliberate practice is the primary driver of expertise.' },
    { question: `How should you approach complex topics?`, options: ['Skip them', 'Break into smaller parts', 'Memorize everything', 'Ask someone else'], correctIndex: 1, explanation: 'Breaking complex topics into manageable parts aids comprehension.' },
    { question: `What is the best study method?`, options: ['Re-reading notes', 'Spaced repetition', 'All-night cramming', 'Highlighting only'], correctIndex: 1, explanation: 'Spaced repetition has been proven most effective for long-term retention.' },
  ];

  return questionBank[categoryId] || generic;
}

function generateCourseId(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const difficulties: Course['difficulty'][] = ['Beginner', 'Intermediate', 'Advanced'];

export const courses: Course[] = Object.entries(allCoursesByCategory).flatMap(([categoryId, titles]) =>
  titles.map((title, i) => ({
    id: generateCourseId(title),
    title,
    categoryId,
    description: `Master ${title} with interactive lessons and challenging quizzes. This comprehensive course covers everything from fundamentals to advanced concepts.`,
    difficulty: difficulties[i % 3],
    lessonsCount: 3,
    questionsCount: 5,
    lessons: [0, 1, 2].map(j => generateLesson(title, j)),
    questions: generateQuestions(title, categoryId),
  }))
);

export function getCoursesByCategory(categoryId: string): Course[] {
  return courses.filter(c => c.categoryId === categoryId);
}

export function getCourseById(id: string): Course | undefined {
  return courses.find(c => c.id === id);
}

export function searchCourses(query: string): Course[] {
  const q = query.toLowerCase();
  return courses.filter(c =>
    c.title.toLowerCase().includes(q) ||
    c.categoryId.includes(q) ||
    c.description.toLowerCase().includes(q)
  );
}
