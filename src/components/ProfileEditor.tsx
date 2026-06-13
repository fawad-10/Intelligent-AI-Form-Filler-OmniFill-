import React, { useState } from 'react';
import { UserProfile, UserProfileExperience, UserProfileProject, UserProfileEducation } from '../types';
import { Plus, Trash2, Save, Sparkles, User, Briefcase, Code, GraduationCap, CheckSquare } from 'lucide-react';

interface ProfileEditorProps {
  profile: UserProfile;
  onChange: (updated: UserProfile) => void;
}

export default function ProfileEditor({ profile, onChange }: ProfileEditorProps) {
  const [activeSection, setActiveSection] = useState<'personal' | 'experience' | 'projects' | 'education' | 'skills'>('personal');
  const [skillsInput, setSkillsInput] = useState(profile.skills.join(', '));

  const handlePersonalChange = (field: keyof typeof profile.personal, value: string) => {
    onChange({
      ...profile,
      personal: {
        ...profile.personal,
        [field]: value
      }
    });
  };

  const handleUpdateExperience = (index: number, field: keyof UserProfileExperience, value: string) => {
    const updatedExp = [...profile.experience];
    updatedExp[index] = { ...updatedExp[index], [field]: value };
    onChange({ ...profile, experience: updatedExp });
  };

  const handleAddExperience = () => {
    const updatedExp = [
      ...profile.experience,
      { company: "New Enterprise", role: "Developer", duration: "2024 - Present", description: "Write summary..." }
    ];
    onChange({ ...profile, experience: updatedExp });
  };

  const handleRemoveExperience = (index: number) => {
    const updatedExp = profile.experience.filter((_, i) => i !== index);
    onChange({ ...profile, experience: updatedExp });
  };

  const handleUpdateProject = (index: number, field: keyof UserProfileProject, value: string) => {
    const updatedProj = [...profile.projects];
    updatedProj[index] = { ...updatedProj[index], [field]: value };
    onChange({ ...profile, projects: updatedProj });
  };

  const handleAddProject = () => {
    const updatedProj = [
      ...profile.projects,
      { name: "Awesome Web Application", techStack: "React, Vite, TS", description: "Completed project logic..." }
    ];
    onChange({ ...profile, projects: updatedProj });
  };

  const handleRemoveProject = (index: number) => {
    const updatedProj = profile.projects.filter((_, i) => i !== index);
    onChange({ ...profile, projects: updatedProj });
  };

  const handleUpdateEducation = (index: number, field: keyof UserProfileEducation, value: string) => {
    const updatedEdu = [...profile.education];
    updatedEdu[index] = { ...updatedEdu[index], [field]: value };
    onChange({ ...profile, education: updatedEdu });
  };

  const handleAddEducation = () => {
    const updatedEdu = [
      ...profile.education,
      { school: "State Institute", degree: "B.S. in Software Engineering", graduationYear: "2022", gpa: "3.7" }
    ];
    onChange({ ...profile, education: updatedEdu });
  };

  const handleRemoveEducation = (index: number) => {
    const updatedEdu = profile.education.filter((_, i) => i !== index);
    onChange({ ...profile, education: updatedEdu });
  };

  const handleSkillsSave = () => {
    const list = skillsInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    onChange({ ...profile, skills: list });
  };

  const sections = [
    { id: 'personal', name: 'Personal Particulars', icon: User },
    { id: 'experience', name: 'Work History', icon: Briefcase },
    { id: 'projects', name: 'Portfolio Projects', icon: Code },
    { id: 'education', name: 'Academic Records', icon: GraduationCap },
    { id: 'skills', name: 'Technical Skills', icon: CheckSquare }
  ] as const;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-1 md:p-6 bg-transparent min-h-[480px]">
      {/* Sidebar selection */}
      <div className="md:col-span-1 space-y-1">
        {sections.map(sec => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              id={`profile_sec_${sec.id}`}
              onClick={() => setActiveSection(sec.id)}
              className={`w-full flex items-center space-x-3 px-4.5 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-left transition-all ${
                isActive
                  ? 'bg-indigo-650 text-white shadow-lg shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{sec.name}</span>
            </button>
          );
        })}

        <div className="p-4 mt-6 bg-indigo-500/5 text-indigo-300 border border-indigo-500/10 rounded-2xl hidden md:block">
          <p className="text-[11px] leading-relaxed font-mono">
            💡 <strong className="text-white font-sans uppercase tracking-widest block mb-1 text-[10px]">Sandbox Profile Vault:</strong> Any details saved in this sheet are held secure in state memory and dynamically fed into the Chrome content scripts simulation.
          </p>
        </div>
      </div>

      {/* Editor Main Canvas */}
      <div className="md:col-span-3 border border-slate-805 rounded-3xl p-6 bg-slate-900 shadow-xl">
        {activeSection === 'personal' && (
          <div className="space-y-5">
            <h3 className="text-base font-black text-white border-b border-slate-800 pb-3 tracking-tight">Full Contact Particulars</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">First Name</label>
                <input
                  type="text"
                  id="profile_f_name"
                  value={profile.personal.firstName}
                  onChange={(e) => handlePersonalChange('firstName', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-750 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">Last Name</label>
                <input
                  type="text"
                  id="profile_l_name"
                  value={profile.personal.lastName}
                  onChange={(e) => handlePersonalChange('lastName', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-750 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">Email Address</label>
                <input
                  type="email"
                  id="profile_email"
                  value={profile.personal.email}
                  onChange={(e) => handlePersonalChange('email', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-750 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">Phone Number</label>
                <input
                  type="text"
                  id="profile_phone"
                  value={profile.personal.phone}
                  onChange={(e) => handlePersonalChange('phone', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-750 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">Birth Date</label>
                <input
                  type="date"
                  id="profile_birth"
                  value={profile.personal.birthDate}
                  onChange={(e) => handlePersonalChange('birthDate', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-750 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">Location (City, State/Country)</label>
                <input
                  type="text"
                  id="profile_loc"
                  value={profile.personal.location}
                  onChange={(e) => handlePersonalChange('location', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-750 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">LinkedIn Profile</label>
                <input
                  type="text"
                  id="profile_linkedin"
                  value={profile.personal.linkedin}
                  onChange={(e) => handlePersonalChange('linkedin', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-750 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">Portfolio (Personal Site)</label>
                <input
                  type="text"
                  id="profile_portfolio"
                  value={profile.personal.portfolio}
                  onChange={(e) => handlePersonalChange('portfolio', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-750 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
                />
              </div>
            </div>
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-400 mb-1.5">Professional Pitch & Summary</label>
              <textarea
                rows={3}
                id="profile_summary"
                value={profile.personal.summary}
                onChange={(e) => handlePersonalChange('summary', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-750 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
              />
            </div>
          </div>
        )}

        {activeSection === 'experience' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white tracking-tight">Career History Items</h3>
              <button
                type="button"
                id="add_exp_btn"
                onClick={handleAddExperience}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/15"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Job</span>
              </button>
            </div>

            {profile.experience.length === 0 ? (
              <p className="text-sm text-slate-550 text-center py-6 font-mono">No previous jobs defined. Add one to fill job experience fields!</p>
            ) : (
              <div className="space-y-6">
                {profile.experience.map((exp, idx) => (
                  <div key={idx} className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 relative shadow-inner">
                    <button
                      type="button"
                      onClick={() => handleRemoveExperience(idx)}
                      className="absolute top-4 right-4 text-rose-450 hover:text-rose-300 p-1.5 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Delete experience"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 pr-8">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1.5">Company</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => handleUpdateExperience(idx, 'company', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-semibold focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1.5">Role Title</label>
                        <input
                          type="text"
                          value={exp.role}
                          onChange={(e) => handleUpdateExperience(idx, 'role', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-semibold focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1.5">Employment Duration</label>
                        <input
                          type="text"
                          value={exp.duration}
                          onChange={(e) => handleUpdateExperience(idx, 'duration', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-semibold focus:ring-1 focus:ring-indigo-500"
                          placeholder="e.g. Jan 2021 - Present"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1.5">Role Responsibilities</label>
                      <textarea
                        rows={2}
                        value={exp.description}
                        onChange={(e) => handleUpdateExperience(idx, 'description', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-semibold focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'projects' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white tracking-tight">Featured Portfolio Work</h3>
              <button
                type="button"
                id="add_proj_btn"
                onClick={handleAddProject}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/15"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Project</span>
              </button>
            </div>

            {profile.projects.length === 0 ? (
              <p className="text-sm text-slate-550 text-center py-6 font-mono">No projects defined.</p>
            ) : (
              <div className="space-y-6">
                {profile.projects.map((proj, idx) => (
                  <div key={idx} className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 relative shadow-inner">
                    <button
                      type="button"
                      onClick={() => handleRemoveProject(idx)}
                      className="absolute top-4 right-4 text-rose-450 hover:text-rose-300 p-1.5 hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 pr-8">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1.5">Project Name</label>
                        <input
                          type="text"
                          value={proj.name}
                          onChange={(e) => handleUpdateProject(idx, 'name', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-semibold focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1.5">Technologies Used (Tech Stack)</label>
                        <input
                          type="text"
                          value={proj.techStack}
                          onChange={(e) => handleUpdateProject(idx, 'techStack', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-semibold focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1.5">Project Description</label>
                      <textarea
                        rows={2}
                        value={proj.description}
                        onChange={(e) => handleUpdateProject(idx, 'description', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-semibold focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'education' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white tracking-tight">Academic Education Detail</h3>
              <button
                type="button"
                id="add_edu_btn"
                onClick={handleAddEducation}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/15"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Education</span>
              </button>
            </div>

            {profile.education.length === 0 ? (
              <p className="text-sm text-slate-550 text-center py-6 font-mono">No academic items defined.</p>
            ) : (
              <div className="space-y-6">
                {profile.education.map((edu, idx) => (
                  <div key={idx} className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 relative shadow-inner">
                    <button
                      type="button"
                      onClick={() => handleRemoveEducation(idx)}
                      className="absolute top-4 right-4 text-rose-450 hover:text-rose-300 p-1.5 hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-8">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1.5">School / University</label>
                        <input
                          type="text"
                          value={edu.school}
                          onChange={(e) => handleUpdateEducation(idx, 'school', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-semibold focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1.5">Degree / Focus Degree</label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => handleUpdateEducation(idx, 'degree', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-semibold focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1.5">Graduation Year</label>
                        <input
                          type="text"
                          value={edu.graduationYear}
                          onChange={(e) => handleUpdateEducation(idx, 'graduationYear', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-semibold focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1.5">GPA / Score</label>
                        <input
                          type="text"
                          value={edu.gpa}
                          onChange={(e) => handleUpdateEducation(idx, 'gpa', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-semibold focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'skills' && (
          <div className="space-y-6">
            <h3 className="text-base font-black text-white border-b border-slate-800 pb-3 tracking-tight">Technical Core Skills</h3>
            
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">Comma-separated Technical competencies</label>
                <div className="flex space-x-2.5">
                  <input
                    type="text"
                    id="skills_input_box"
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 whitespace-nowrap"
                    placeholder="React, CSS, Django, Kotlin, AWS"
                  />
                  <button
                    type="button"
                    onClick={handleSkillsSave}
                    className="flex items-center space-x-1.5 px-4.5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/15"
                  >
                    <Save className="h-4 w-4" />
                    <span>Apply Types</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-450 mb-3">Active Skills Badges parsed ({profile.skills.length})</label>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <span key={index} className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
