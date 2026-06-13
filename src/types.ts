export interface UserProfilePersonal {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  location: string;
  linkedin: string;
  portfolio: string;
  summary: string;
}

export interface UserProfileExperience {
  company: string;
  role: string;
  duration: string;
  description: string;
}

export interface UserProfileProject {
  name: string;
  techStack: string;
  description: string;
}

export interface UserProfileEducation {
  school: string;
  degree: string;
  graduationYear: string;
  gpa: string;
}

export interface UserProfile {
  personal: UserProfilePersonal;
  experience: UserProfileExperience[];
  projects: UserProfileProject[];
  education: UserProfileEducation[];
  skills: string[];
}

export interface WebFormField {
  id: string; // DOM ID, name, or computed CSS path
  name: string; // name attribute
  type: string; // text, email, tel, textarea, select-one, checkbox, radio, date
  label: string; // Resolved label text or surrounding text
  placeholder: string; // placeholder attribute
  ariaLabel: string; // aria-label or title
  context: string; // Parent context or description (e.g. "Work History Section")
  options?: string[]; // Dropdown options or radio button values
}

export interface FieldMapping {
  fieldId: string;
  value: string;
  confidence: number;
  reasoning: string;
}

export interface MappingResponse {
  mappings: FieldMapping[];
}

export interface DomainRule {
  domain: string;
  customInstruction: string;
}

export interface FormPreset {
  id: string;
  name: string;
  description: string;
  domain: string;
  fields: WebFormField[];
}
