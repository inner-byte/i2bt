import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import debounce from 'lodash/debounce';

interface Member {
  uid: string;
  name: string;
  role: string;
  avatar: string;
}

const ITEMS_PER_PAGE = 9;

const fetchMembers = async (page: number, search: string, token: string): Promise<{ members: Member[], total: number, totalPages: number }> => {
  const { data } = await axios.get(`http://localhost:5000/api/members?page=${page}&limit=${ITEMS_PER_PAGE}&search=${search}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

const createMember = async (newMember: FormData, token: string): Promise<Member> => {
  const { data } = await axios.post('http://localhost:5000/api/members', newMember, {
    headers: { 
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`
    },
  });
  return data;
};

const Members: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [newMember, setNewMember] = useState({ name: '', role: '' });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery<{ members: Member[], total: number, totalPages: number }, Error>(
    ['members', currentPage, searchTerm],
    () => fetchMembers(currentPage, searchTerm, user?.token || ''),
    { enabled: !!user }
  );

  const createMemberMutation = useMutation(
    (newMemberData: FormData) => createMember(newMemberData, user?.token || ''),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['members']);
        setNewMember({ name: '', role: '' });
        setAvatar(null);
      },
    }
  );

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchTerm(value);
      setCurrentPage(1);
    }, 300),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', newMember.name);
    formData.append('role', newMember.role);
    if (avatar) {
      formData.append('avatar', avatar);
    }
    createMemberMutation.mutate(formData);
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-center text-red-500">Error: {error.message}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Members</h1>
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search members..."
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {data?.members.map((member) => (
          <Link key={member.uid} to={`/profile/${member.uid}`} className="block">
            <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow">
              <img src={member.avatar} alt={member.name} className="w-24 h-24 rounded-full mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-center">{member.name}</h2>
              <p className="text-gray-600 text-center">{member.role}</p>
            </div>
          </Link>
        ))}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={data?.totalPages || 1}
        onPageChange={setCurrentPage}
      />
      <form onSubmit={handleSubmit} className="mt-8 bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Add New Member</h2>
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 font-bold mb-2">Name</label>
          <input
            type="text"
            id="name"
            value={newMember.name}
            onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="role" className="block text-gray-700 font-bold mb-2">Role</label>
          <input
            type="text"
            id="role"
            value={newMember.role}
            onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="avatar" className="block text-gray-700 font-bold mb-2">Avatar</label>
          <input
            type="file"
            id="avatar"
            onChange={(e) => setAvatar(e.target.files?.[0] || null)}
            className="w-full px-3 py-2 border rounded-lg"
            accept="image/*"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
          Add Member
        </button>
      </form>
    </div>
  );
};

export default Members;