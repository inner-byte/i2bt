import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Calendar, MapPin, Clock, Plus, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import io from 'socket.io-client';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  attendees: string[];
  maxAttendees: number;
}

const ITEMS_PER_PAGE = 5;
const socket = io('http://localhost:5000');

const fetchEvents = async (page: number, token: string): Promise<{ events: Event[], total: number, totalPages: number }> => {
  const { data } = await axios.get(`http://localhost:5000/api/events?page=${page}&limit=${ITEMS_PER_PAGE}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

const createEvent = async (newEvent: Omit<Event, 'id' | 'attendees'>, token: string): Promise<Event> => {
  const { data } = await axios.post('http://localhost:5000/api/events', newEvent, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

const rsvpEvent = async (eventId: string, memberId: string, token: string): Promise<void> => {
  await axios.post(`http://localhost:5000/api/events/${eventId}/rsvp`, { memberId }, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

const cancelRsvp = async (eventId: string, memberId: string, token: string): Promise<void> => {
  await axios.delete(`http://localhost:5000/api/events/${eventId}/rsvp`, {
    data: { memberId },
    headers: { Authorization: `Bearer ${token}` }
  });
};

const Events: React.FC = () => {
  const [newEvent, setNewEvent] = useState({ title: '', description: '', date: '', location: '', maxAttendees: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery<{ events: Event[], total: number, totalPages: number }, Error>(
    ['events', currentPage],
    () => fetchEvents(currentPage, user?.token || ''),
    { enabled: !!user }
  );

  const createEventMutation = useMutation(
    (eventData: Omit<Event, 'id' | 'attendees'>) => createEvent(eventData, user?.token || ''),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['events']);
        setNewEvent({ title: '', description: '', date: '', location: '', maxAttendees: 0 });
      },
    }
  );

  const rsvpMutation = useMutation(
    ({ eventId, memberId }: { eventId: string; memberId: string }) => rsvpEvent(eventId, memberId, user?.token || ''),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['events']);
      },
    }
  );

  const cancelRsvpMutation = useMutation(
    ({ eventId, memberId }: { eventId: string; memberId: string }) => cancelRsvp(eventId, memberId, user?.token || ''),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['events']);
      },
    }
  );

  useEffect(() => {
    socket.on('eventUpdate', ({ eventId, attendees }) => {
      queryClient.setQueryData<{ events: Event[], total: number, totalPages: number } | undefined>(
        ['events', currentPage],
        (oldData) => {
          if (oldData) {
            return {
              ...oldData,
              events: oldData.events.map(event => 
                event.id === eventId
                  ? { ...event, attendees: Array(attendees).fill('') }
                  : event
              )
            };
          }
          return oldData;
        }
      );
    });

    return () => {
      socket.off('eventUpdate');
    };
  }, [queryClient, currentPage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createEventMutation.mutate(newEvent);
  };

  const handleRSVP = (eventId: string) => {
    if (user) {
      rsvpMutation.mutate({ eventId, memberId: user.uid });
    }
  };

  const handleCancelRSVP = (eventId: string) => {
    if (user) {
      cancelRsvpMutation.mutate({ eventId, memberId: user.uid });
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-center text-red-500">Error: {error.message}</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold mb-6">Upcoming Events</h1>
      {user && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold mb-4">Create New Event</h2>
          <input
            type="text"
            placeholder="Event Title"
            className="input mb-4"
            value={newEvent.title}
            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            required
          />
          <textarea
            placeholder="Event Description"
            className="input mb-4"
            value={newEvent.description}
            onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
            required
          ></textarea>
          <input
            type="datetime-local"
            className="input mb-4"
            value={newEvent.date}
            onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Event Location"
            className="input mb-4"
            value={newEvent.location}
            onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Max Attendees"
            className="input mb-4"
            value={newEvent.maxAttendees}
            onChange={(e) => setNewEvent({ ...newEvent, maxAttendees: parseInt(e.target.value) })}
            required
          />
          <button type="submit" className="btn btn-primary flex items-center">
            <Plus className="mr-2" size={18} />
            Create Event
          </button>
        </form>
      )}
      {data?.events.map((event) => (
        <div key={event.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-2">{event.title}</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{event.description}</p>
          <div className="flex flex-wrap items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <div className="flex items-center">
              <Calendar className="mr-1" size={16} />
              <span>{new Date(event.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center">
              <Clock className="mr-1" size={16} />
              <span>{new Date(event.date).toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="mr-1" size={16} />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center">
              <Users className="mr-1" size={16} />
              <span>{event.attendees.length} / {event.maxAttendees}</span>
            </div>
          </div>
          {user && (
            event.attendees.includes(user.uid) ? (
              <button
                onClick={() => handleCancelRSVP(event.id)}
                className="btn btn-secondary"
              >
                Cancel RSVP
              </button>
            ) : (
              <button
                onClick={() => handleRSVP(event.id)}
                className="btn btn-primary"
                disabled={event.attendees.length >= event.maxAttendees}
              >
                RSVP
              </button>
            )
          )}
        </div>
      ))}
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

export default Events;