import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ProfilePicture from '../components/Profile/ProfilePicture';
import SkillsSection from '../components/Profile/SkillsSection';
import ProjectsSection from '../components/Profile/ProjectsSection';

interface Project {
  id: string;
  title: string;
  description: string;
  link: string;
}

interface MemberProfile {
  uid: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  bio: string;
  skills: string[];
  projects: Project[];
  socialLinks: {
    github: string;
    linkedin: string;
    twitter: string;
  };
}

const fetchMemberProfile = async (id: string, token: string): Promise<MemberProfile> => {
  const { data } = await axios.get(`http://localhost:5000/api/members/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

const updateMemberProfile = async (id: string, profileData: Partial<MemberProfile>, token: string): Promise<MemberProfile> => {
  const { data } = await axios.put(`http://localhost:5000/api/members/${id}`, profileData, {
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });
  return data;
};

const Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<MemberProfile>>({});

  const { data: profile, isLoading, error } = useQuery<MemberProfile, Error>(
    ['profile', id],
    () => fetchMemberProfile(id!, user?.token || ''),
    { enabled: !!user && !!id }
  );

  const updateProfileMutation = useMutation(
    (updatedProfile: Partial<MemberProfile>) => updateMemberProfile(id!, updatedProfile, user?.token || ''),
    {
      onSuccess: (data) => {
        queryClient.setQueryData(['profile', id], data);
        setIsEditing(false);
      },
    }
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>An error occurred: {error.message}</div>;
  if (!profile) return <div>Profile not found</div>;

  const handleEdit = () => {
    setEditedProfile(profile);
    setIsEditing(true);
  };

  const handleSave = () => {
    updateProfileMutation.mutate(editedProfile);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile({});
  };

  const handleChange = (field: keyof MemberProfile, value: any) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{profile.name}'s Profile</h1>
      <ProfilePicture
        userId={profile.uid}
        currentUrl={profile.avatar}
        onUpdate={(url) => handleChange('avatar', url)}
        isEditing={isEditing}
      />
      <div className="mt-6">
        <h2 className="text-2xl font-semibold mb-2">Bio</h2>
        {isEditing ? (
          <textarea
            value={editedProfile.bio || profile.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            className="w-full p-2 border rounded"
          />
        ) : (
          <p>{profile.bio}</p>
        )}
      </div>
      <SkillsSection
        initialSkills={profile.skills}
        onUpdate={(skills) => handleChange('skills', skills)}
        isEditing={isEditing}
      />
      <ProjectsSection
        initialProjects={profile.projects}
        onUpdate={(projects) => handleChange('projects', projects)}
        isEditing={isEditing}
      />
      {user && user.uid === profile.uid && (
        <div className="mt-6">
          {isEditing ? (
            <>
              <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded mr-2">Save</button>
              <button onClick={handleCancel} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
            </>
          ) : (
            <button onClick={handleEdit} className="bg-green-500 text-white px-4 py-2 rounded">Edit Profile</button>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;