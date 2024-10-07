import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Search, Upload } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import debounce from 'lodash/debounce';

interface Member {
  id: string;
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
    <div>
      <h1 className="text-3xl font-bold mb-6">Members Directory</h1>
      <div className="mb-6 relative">
        <input
          type="text"
          placeholder="Search members..."
          className="w-full p-2 pl-10 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          onChange={handleSearchChange}
        />
        <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
      </div>
      {user && (
        <form onSubmit={handleSubmit} className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Add New Member</h2>
          <input
            type="text"
            placeholder="Name"
            className="input mb-4"
            value={newMember.name}
            onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Role"
            className="input mb-4"
            value={newMember.role}
            onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
            required
          />
          <div className="mb-4">
            <label htmlFor="avatar" className="btn btn-secondary flex items-center justify-center">
              <Upload className="mr-2" size={20} />
              Upload Avatar
            </label>
            <input
              id="avatar"
              type="file"
              className="hidden"
              onChange={(e) => setAvatar(e.target.files ? e.target.files[0] : null)}
            />
            {avatar && <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{avatar.name}</p>}
          </div>
          <button type="submit" className="btn btn-primary">Add Member</button>
        </form>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.members.map(member => (
          <Link key={member.id} to={`/profile/${member.id}`} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition duration-300">
            <div className="flex items-center space-x-4">
              <img src={member.avatar} alt={member.name} className="w-16 h-16 rounded-full object-cover" />
              <div>
                <h2 className="text-xl font-semibold dark:text-white">{member.name}</h2>
                <p className="text-gray-600 dark:text-gray-300">{member.role}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {data && (
        <Pagination
          currentPage={currentPage}
          totalPages={data.totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default Members;