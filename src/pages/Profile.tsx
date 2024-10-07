import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Phone, MapPin, Briefcase, Book, Github, Linkedin, Twitter, Edit, X } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

interface MemberProfile {
  uid: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  bio: string;
  skills: string[];
  socialLinks: {
    github: string;
    linkedin: string;
    twitter: string;
  };
}

const fetchMemberProfile = async (id: string): Promise<MemberProfile> => {
  const { data } = await axios.get(`http://localhost:5000/api/members/${id}`);
  return data;
};

const updateMemberProfile = async (id: string, profileData: FormData, token: string): Promise<MemberProfile> => {
  const { data } = await axios.put(`http://localhost:5000/api/members/${id}`, profileData, {
    headers: { 
      'Content-Type': 'multipart/form-data',
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
  const [newAvatar, setNewAvatar] = useState<File | null>(null);

  const { data: profile, isLoading, error } = useQuery<MemberProfile>(['profile', id], () => fetchMemberProfile(id!));

  const updateProfileMutation = useMutation(
    (updatedProfile: FormData) => updateMemberProfile(id!, updatedProfile, user?.token || ''),
    {
      onSuccess: (data) => {
        queryClient.setQueryData(['profile', id], data);
        setIsEditing(false);
      },
    }
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>An error occurred: {(error as Error).message}</div>;
  if (!profile) return <div>Profile not found</div>;

  const handleEdit = () => {
    setEditedProfile(profile);
    setIsEditing(true);
  };

  const handleSave = () => {
    const formData = new FormData();
    Object.entries(editedProfile).forEach(([key, value]) => {
      if (key === 'socialLinks') {
        formData.append(key, JSON.stringify(value));
      } else if (key === 'skills') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value as string);
      }
    });
    if (newAvatar) {
      formData.append('avatar', newAvatar);
    }
    updateProfileMutation.mutate(formData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile({});
    setNewAvatar(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSocialLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedProfile(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [name]: value }
    }));
  };

  const handleSkillChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const skills = e.target.value.split(',').map(skill => skill.trim());
    setEditedProfile(prev => ({ ...prev, skills }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewAvatar(e.target.files[0]);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{profile.name}</h1>
        {user && user.uid === profile.uid && !isEditing && (
          <button onClick={handleEdit} className="btn btn-primary flex items-center">
            <Edit className="mr-2" size={18} /> Edit Profile
          </button>
        )}
      </div>
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/3 mb-6 md:mb-0">
          <img src={profile.avatar} alt={profile.name} className="w-48 h-48 rounded-full mx-auto" />
          {isEditing && (
            <div className="mt-4">
              <label htmlFor="avatar" className="btn btn-secondary block text-center">
                Change Avatar
              </label>
              <input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
          )}
        </div>
        <div className="md:w-2/3 md:pl-6">
          {isEditing ? (
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="name">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={editedProfile.name || ''}
                  onChange={handleChange}
                  className="input w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="role">
                  Role
                </label>
                <input
                  type="text"
                  id="role"
                  name="role"
                  value={editedProfile.role || ''}
                  onChange={handleChange}
                  className="input w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="bio">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={editedProfile.bio || ''}
                  onChange={handleChange}
                  className="input w-full"
                  rows={4}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="skills">
                  Skills (comma-separated)
                </label>
                <input
                  type="text"
                  id="skills"
                  name="skills"
                  value={editedProfile.skills?.join(', ') || ''}
                  onChange={handleSkillChange}
                  className="input w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                  Social Links
                </label>
                <div className="flex space-x-4">
                  <input
                    type="text"
                    name="github"
                    placeholder="GitHub"
                    value={editedProfile.socialLinks?.github || ''}
                    onChange={handleSocialLinkChange}
                    className="input flex-1"
                  />
                  <input
                    type="text"
                    name="linkedin"
                    placeholder="LinkedIn"
                    value={editedProfile.socialLinks?.linkedin || ''}
                    onChange={handleSocialLinkChange}
                    className="input flex-1"
                  />
                  <input
                    type="text"
                    name="twitter"
                    placeholder="Twitter"
                    value={editedProfile.socialLinks?.twitter || ''}
                    onChange={handleSocialLinkChange}
                    className="input flex-1"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                <button type="button" onClick={handleCancel} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">{profile.role}</p>
              <p className="text-gray-700 dark:text-gray-300 mb-6">{profile.bio}</p>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Skills</h2>
                <div className="flex flex-wrap">
                  {profile.skills.map((skill, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 text-sm font-medium mr-2 mb-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Mail className="mr-2 text-blue-500" />
                  <span>{profile.email}</span>
                </div>
                <div className="flex items-center">
                  <Github className="mr-2 text-gray-700" />
                  <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    GitHub
                  </a>
                </div>
                <div className="flex items-center">
                  <Linkedin className="mr-2 text-blue-700" />
                  <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    LinkedIn
                  </a>
                </div>
                <div className="flex items-center">
                  <Twitter className="mr-2 text-blue-400" />
                  <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    Twitter
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;