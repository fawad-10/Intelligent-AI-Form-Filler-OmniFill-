import { UserProfile, FormPreset } from './types';

export const INITIAL_PROFILE: UserProfile = {
  personal: {
    firstName: "Alex",
    lastName: "Chen",
    email: "alex.chen.dev@gmail.com",
    phone: "+1 (555) 321-7890",
    birthDate: "1997-08-24",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/alexchen-developer-ai",
    portfolio: "alexchen.dev",
    summary: "Senior Frontend Engineer with 5+ years of experience specializing in React, TypeScript, and developer tooling. Passionate about AI integrations, polished User Interfaces, and web accessibility. Built high-scale applications used by millions of DAU."
  },
  experience: [
    {
      company: "InnovateTech Inc.",
      role: "Senior React Developer",
      duration: "Jan 2022 - Present",
      description: "Led frontend development of core design system. Migrated multiple legacy products to Vite + Tailwind, reducing build times by 40%. Implemented responsive dashboard charts and micro-frontends."
    },
    {
      company: "ByteCraft Studio",
      role: "Software Engineer",
      duration: "Jun 2019 - Dec 2021",
      description: "Developed user authentication, profile settings, and payment checkouts. Integrated Stripe API and optimized client-side states using React Query and Context."
    }
  ],
  projects: [
    {
      name: "SchemaFill Chrome Extension",
      techStack: "TypeScript, Manifest V3, Gemini, Tailwind",
      description: "An open-source browser utility that analyzes complex client side web forms to automatically map them to nested user data with 94%+ mapping accuracy."
    },
    {
      name: "RetroSynth Beats",
      techStack: "React, Web Audio API, Framer Motion",
      description: "An interactive, web-based step sequencer synthesizer mapping keys to low-latency retro sci-fi sound frequencies."
    }
  ],
  education: [
    {
      school: "University of California, Berkeley",
      degree: "B.S. in Computer Science",
      graduationYear: "2019",
      gpa: "3.8"
    }
  ],
  skills: [
    "TypeScript",
    "JavaScript",
    "React",
    "Next.js",
    "Tailwind CSS",
    "Node.js",
    "Express",
    "Chrome Extensions",
    "Gemini API",
    "Git & CI/CD",
    "Vite",
    "RESTful APIs",
    "Responsive Design"
  ]
};

export const INSTALLED_CHROME_EXTENSION_STEPS = [
  {
    title: "1. Download Unpacked Extension",
    desc: "Click the 'Download unpacked ZIP' button in the toolbar to get a complete, customized Chrome Extension V3 repository."
  },
  {
    title: "2. Extract Zip File",
    desc: "Extract the downloaded zip archive (e.g. 'ai-form-filler-extension.zip') onto a local folder on your computer."
  },
  {
    title: "3. Enable Developer Mode",
    desc: "Open your Google Chrome browser and navigate to 'chrome://extensions'. In the top-right corner, toggle the 'Developer mode' switch to 'ON'."
  },
  {
    title: "4. Load Unpacked",
    desc: "Click the 'Load unpacked' button on the top left, select the extracted folder, and the AI Form-Filler icon will appear in your extensions list!"
  },
  {
    title: "5. Setup & Fill!",
    desc: "Pin the extension, load a job form in any tab, open the popup to add custom instruction offsets, and trigger high-accuracy forms filling!"
  }
];

export const PRESET_FORMS: FormPreset[] = [
  {
    id: "google_form",
    name: "Google Forms Style (Skills Evaluation)",
    description: "Standard Evaluation sheet with multi-select ticks, personal info boxes, and custom selections.",
    domain: "forms.google.com",
    fields: [
      {
        id: "g_first_name",
        name: "entry.1001",
        type: "text",
        label: "First Name",
        placeholder: "Your answer",
        ariaLabel: "First Name input field",
        context: "Personal Information Section"
      },
      {
        id: "g_last_name",
        name: "entry.1002",
        type: "text",
        label: "Last Name",
        placeholder: "Your answer",
        ariaLabel: "Last Name input field",
        context: "Personal Information Section"
      },
      {
        id: "g_email",
        name: "entry.1003",
        type: "email",
        label: "Your Email Address",
        placeholder: "Your email",
        ariaLabel: "Email input",
        context: "Contact points"
      },
      {
        id: "g_role",
        name: "entry.1004",
        type: "select-one",
        label: "Target Role",
        placeholder: "Choose",
        ariaLabel: "Dropdown selection for your desired role",
        context: "Application Focus",
        options: ["Frontend Developer", "Backend Developer", "Full Stack Architect", "UI/UX Designer", "Product Developer"]
      },
      {
        id: "g_experience_yrs",
        name: "entry.1005",
        type: "radio",
        label: "Years of Professional Experience",
        placeholder: "",
        ariaLabel: "Radio selector for experience bracket",
        context: "Experience Verification",
        options: ["Less than 1 year", "1-2 years", "3-5 years", "5+ years"]
      },
      {
        id: "g_summary",
        name: "entry.1006",
        type: "textarea",
        label: "Please outline your professional goals and core strengths",
        placeholder: "Enter short text summarizing yourself",
        ariaLabel: "Textarea summary input",
        context: "Personal Biography and pitch"
      }
    ]
  },
  {
    id: "jotform",
    name: "JotForm Style (Enterprise Job Submission)",
    description: "Multi-row workspace with layout structures containing detailed address grids and phone tags.",
    domain: "jotform.com",
    fields: [
      {
        id: "jf_fname",
        name: "q3_fullName[first]",
        type: "text",
        label: "First Name",
        placeholder: "Jane",
        ariaLabel: "First name",
        context: "Name fields inside JotForm table"
      },
      {
        id: "jf_lname",
        name: "q3_fullName[last]",
        type: "text",
        label: "Last Name",
        placeholder: "Doe",
        ariaLabel: "Last name",
        context: "Name fields inside JotForm table"
      },
      {
        id: "jf_phone",
        name: "q4_phoneNumber[phone]",
        type: "tel",
        label: "Phone Number",
        placeholder: "+1 (000) 000-0000",
        ariaLabel: "Phone",
        context: "Cell contact value"
      },
      {
        id: "jf_portfolio",
        name: "q5_portfolioLink",
        type: "text",
        label: "Portfolio URL or Personal Site",
        placeholder: "https://example.com",
        ariaLabel: "Web Link",
        context: "Portfolio details"
      },
      {
        id: "jf_skills_preferred",
        name: "q6_primary_skill",
        type: "select-one",
        label: "Primary Technical Skill Set",
        placeholder: "Please select standard tech",
        ariaLabel: "Skill set",
        context: "Primary developer category",
        options: ["TypeScript/React", "Node/Express", "Python/Django", "Java/Spring", "UI/UX Design"]
      }
    ]
  },
  {
    id: "job_board",
    name: "Workday / Job Board (Complex Application)",
    description: "Complex application form with separate work detail blocks, LinkedIn targets, and custom site prompts.",
    domain: "careers.linkedin.com",
    fields: [
      {
        id: "jb_fullname",
        name: "applicant_fullname",
        type: "text",
        label: "Full Name",
        placeholder: "First and Last Name",
        ariaLabel: "Full Name field",
        context: "Primary contact headers"
      },
      {
        id: "jb_linkedin",
        name: "linkedin_profile_url",
        type: "text",
        label: "LinkedIn Profile",
        placeholder: "https://linkedin.com/in/username",
        ariaLabel: "LinkedIn profiles URL",
        context: "Social URLs"
      },
      {
        id: "jb_prev_company",
        name: "experience_prev_company",
        type: "text",
        label: "Most Recent Employer / Company",
        placeholder: "Company Name Ltd.",
        ariaLabel: "Previous Company",
        context: "Work Experience segment"
      },
      {
        id: "jb_prev_role",
        name: "experience_prev_role",
        type: "text",
        label: "Most Recent Job Title / Role",
        placeholder: "Engineering Lead",
        ariaLabel: "Previous Role Title",
        context: "Work History details"
      },
      {
        id: "jb_school",
        name: "education_school_name",
        type: "text",
        label: "University or institution attended",
        placeholder: "State College",
        ariaLabel: "School Name",
        context: "Education history"
      },
      {
        id: "jb_skylines",
        name: "skills_list",
        type: "text",
        label: "Relevant Technologies / Skills (Comma Separated)",
        placeholder: "e.g. React, Python, Web Accessibility",
        ariaLabel: "Skills block",
        context: "Candidate skill matrices"
      }
    ]
  }
];
