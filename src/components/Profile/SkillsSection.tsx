import React, { useState } from 'react';

interface SkillsSectionProps {
  initialSkills: string[];
  onUpdate: (skills: string[]) => void;
  isEditing: boolean;
}

const SkillsSection: React.FC<SkillsSectionProps> = ({ initialSkills, onUpdate, isEditing }) => {
  const [skills, setSkills] = useState(initialSkills);
  const [newSkill, setNewSkill] = useState('');

  const addSkill = () => {
    if (newSkill && !skills.includes(newSkill)) {
      const updatedSkills = [...skills, newSkill];
      setSkills(updatedSkills);
      onUpdate(updatedSkills);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const updatedSkills = skills.filter(skill => skill !== skillToRemove);
    setSkills(updatedSkills);
    onUpdate(updatedSkills);
  };

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-semibold mb-2">Skills</h2>
      <div className="flex flex-wrap gap-2">
        {skills.map(skill => (
          <span key={skill} className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {skill}
            {isEditing && (
              <button onClick={() => removeSkill(skill)} className="ml-2 text-red-500">×</button>
            )}
          </span>
        ))}
      </div>
      {isEditing && (
        <div className="mt-2 flex">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="Add a skill"
            className="border rounded px-2 py-1 mr-2"
          />
          <button onClick={addSkill} className="bg-blue-500 text-white px-2 py-1 rounded">Add</button>
        </div>
      )}
    </div>
  );
};

export default SkillsSection;