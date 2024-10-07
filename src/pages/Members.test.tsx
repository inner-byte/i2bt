import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import Members from './Members';

jest.mock('axios');

const mockMembers = [
  { id: '1', name: 'John Doe', role: 'Developer', avatar: 'avatar1.jpg' },
  { id: '2', name: 'Jane Smith', role: 'Designer', avatar: 'avatar2.jpg' },
];

const renderMembers = () => {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Members />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Members component', () => {
  beforeEach(() => {
    (axios.get as jest.Mock).mockResolvedValue({ data: mockMembers });
  });

  test('renders members list', async () => {
    renderMembers();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  test('filters members based on search input', async () => {
    renderMembers();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search members...');
    fireEvent.change(searchInput, { target: { value: 'John' } });

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
  });

  test('adds a new member', async () => {
    (axios.post as jest.Mock).mockResolvedValue({
      data: { id: '3', name: 'New Member', role: 'Tester', avatar: 'avatar3.jpg' },
    });

    renderMembers();

    const nameInput = screen.getByPlaceholderText('Name');
    const roleInput = screen.getByPlaceholderText('Role');
    const submitButton = screen.getByText('Add Member');

    fireEvent.change(nameInput, { target: { value: 'New Member' } });
    fireEvent.change(roleInput, { target: { value: 'Tester' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:5000/api/members',
        expect.any(FormData),
        expect.any(Object)
      );
    });
  });
});