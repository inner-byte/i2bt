import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
}

const fetchMembers = async (): Promise<Member[]> => {
  // In a real application, this would be an API call
  return [
    { id: '1', name: 'Alice Johnson', email: 'alice@example.com', role: 'President' },
    { id: '2', name: 'Bob Smith', email: 'bob@example.com', role: 'Vice President' },
    { id: '3', name: 'Charlie Brown', email: 'charlie@example.com', role: 'Secretary' },
  ];
};

const AdminPanel: React.FC = () => {
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const queryClient = useQueryClient();

  const { data: members, isLoading, error } = useQuery<Member[]>(['members'], fetchMembers);

  const addMemberMutation = useMutation(
    (newMember: Omit<Member, 'id'>) => {
      // In a real application, this would be an API call
      console.log('Adding member:', newMember);
      return Promise.resolve({ id: Date.now().toString(), ...newMember });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['members']);
        setIsAddingMember(false);
      },
    }
  );

  const updateMemberMutation = useMutation(
    (updatedMember: Member) => {
      // In a real application, this would be an API call
      console.log('Updating member:', updatedMember);
      return Promise.resolve(updatedMember);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['members']);
        setEditingMember(null);
      },
    }
  );

  const deleteMemberMutation = useMutation(
    (id: string) => {
      // In a real application, this would be an API call
      console.log('Deleting member:', id);
      return Promise.resolve();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['members']);
      },
    }
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error occurred: {(error as Error).message}</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
      <button
        className="bg-green-500 text-white px-4 py-2 rounded-lg mb-4 flex items-center"
        onClick={() => setIsAddingMember(true)}
      >
        <Plus className="mr-2" /> Add New Member
      </button>
      {isAddingMember && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            addMemberMutation.mutate({
              name: formData.get('name') as string,
              email: formData.get('email') as string,
              role: formData.get('role') as string,
            });
          }}
          className="bg-white p-4 rounded-lg shadow-md mb-4"
        >
          <input name="name" placeholder="Name" required className="w-full mb-2 p-2 border rounded" />
          <input name="email" type="email" placeholder="Email" required className="w-full mb-2 p-2 border rounded" />
          <input name="role" placeholder="Role" required className="w-full mb-2 p-2 border rounded" />
          <div className="flex justify-end">
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded mr-2">Save</button>
            <button type="button" onClick={() => setIsAddingMember(false)} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
          </div>
        </form>
      )}
      <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Role</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {members?.map((member) => (
            <tr key={member.id} className="border-t">
              <td className="p-3">{member.name}</td>
              <td className="p-3">{member.email}</td>
              <td className="p-3">{member.role}</td>
              <td className="p-3">
                <button
                  onClick={() => setEditingMember(member)}
                  className="text-blue-500 mr-2"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => deleteMemberMutation.mutate(member.id)}
                  className="text-red-500"
                >
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editingMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              updateMemberMutation.mutate({
                id: editingMember.id,
                name: formData.get('name') as string,
                email: formData.get('email') as string,
                role: formData.get('role') as string,
              });
            }}
            className="bg-white p-4 rounded-lg shadow-md"
          >
            <input name="name" defaultValue={editingMember.name} required className="w-full mb-2 p-2 border rounded" />
            <input name="email" type="email" defaultValue={editingMember.email} required className="w-full mb-2 p-2 border rounded" />
            <input name="role" defaultValue={editingMember.role} required className="w-full mb-2 p-2 border rounded" />
            <div className="flex justify-end">
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded mr-2">Update</button>
              <button type="button" onClick={() => setEditingMember(null)} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;