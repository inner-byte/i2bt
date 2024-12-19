import React, { useState } from 'react';

interface Project {
  id: string;
  title: string;
  description: string;
  link: string;
}

interface ProjectsSectionProps {
  initialProjects: Project[];
  onUpdate: (projects: Project[]) => void;
  isEditing: boolean;
}

const ProjectsSection: React.FC<ProjectsSectionProps> = ({ initialProjects, onUpdate, isEditing }) => {
  const [projects, setProjects] = useState(initialProjects);
  const [newProject, setNewProject] = useState({ title: '', description: '', link: '' });

  const addProject = () => {
    if (newProject.title) {
      const projectWithId = { ...newProject, id: Date.now().toString() };
      const updatedProjects = [...projects, projectWithId];
      setProjects(updatedProjects);
      onUpdate(updatedProjects);
      setNewProject({ title: '', description: '', link: '' });
    }
  };

  const removeProject = (projectId: string) => {
    const updatedProjects = projects.filter(project => project.id !== projectId);
    setProjects(updatedProjects);
    onUpdate(updatedProjects);
  };

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-semibold mb-2">Projects</h2>
      {projects.map(project => (
        <div key={project.id} className="bg-gray-100 p-4 rounded mb-4">
          <h3 className="text-xl font-semibold">{project.title}</h3>
          <p className="mt-2">{project.description}</p>
          <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View Project</a>
          {isEditing && (
            <button onClick={() => removeProject(project.id)} className="ml-4 text-red-500">Remove</button>
          )}
        </div>
      ))}
      {isEditing && (
        <div className="mt-4">
          <input
            type="text"
            value={newProject.title}
            onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
            placeholder="Project Title"
            className="border rounded px-2 py-1 mr-2 mb-2"
          />
          <input
            type="text"
            value={newProject.description}
            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
            placeholder="Project Description"
            className="border rounded px-2 py-1 mr-2 mb-2"
          />
          <input
            type="text"
            value={newProject.link}
            onChange={(e) => setNewProject({ ...newProject, link: e.target.value })}
            placeholder="Project Link"
            className="border rounded px-2 py-1 mr-2 mb-2"
          />
          <button onClick={addProject} className="bg-green-500 text-white px-2 py-1 rounded">Add Project</button>
        </div>
      )}
    </div>
  );
};

export default ProjectsSection;