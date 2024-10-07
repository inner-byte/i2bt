import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useGamification } from '../contexts/GamificationContext';
import GamificationWidget from '../components/GamificationWidget';
import LoadingSpinner from '../components/LoadingSpinner';
import { Calendar, MessageSquare, Folder, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

interface UserActivity {
  id: string;
  type: 'forum' | 'project' | 'event';
  description: string;
  date: string;
}

interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
}

const fetchUserData = async (userId: string) => {
  // Replace with actual API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        recentActivities: [
          { id: '1', type: 'forum', description: 'Commented on "Best practices for React"', date: '2023-04-15' },
          { id: '2', type: 'project', description: 'Created project "AI Chatbot"', date: '2023-04-14' },
          { id: '3', type: 'event', description: 'RSVP\'d to "Machine Learning Workshop"', date: '2023-04-13' },
        ],
        upcomingEvents: [
          { id: '1', title: 'Machine Learning Workshop', date: '2023-04-20' },
          { id: '2', title: 'Hackathon 2023', date: '2023-05-01' },
        ],
      });
    }, 1000);
  });
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { points, level } = useGamification();

  const { data, isLoading, error } = useQuery(['userData', user?.uid], () => fetchUserData(user!.uid), {
    enabled: !!user,
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>An error occurred: {(error as Error).message}</div>;

  const { recentActivities, upcomingEvents } = data as { recentActivities: UserActivity[], upcomingEvents: UpcomingEvent[] };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'forum':
        return <MessageSquare className="text-blue-500" size={20} />;
      case 'project':
        return <Folder className="text-green-500" size={20} />;
      case 'event':
        return <Calendar className="text-purple-500" size={20} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Welcome back, {user?.displayName}!</h2>
            <p className="text-gray-600 dark:text-gray-300">
              You're making great progress. Keep up the good work!
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
            <ul className="space-y-4">
              {recentActivities.map((activity) => (
                <li key={activity.id} className="flex items-start">
                  <div className="mr-3 mt-1">{getActivityIcon(activity.type)}</div>
                  <div>
                    <p className="text-gray-800 dark:text-gray-200">{activity.description}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{activity.date}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Upcoming Events</h2>
            <ul className="space-y-4">
              {upcomingEvents.map((event) => (
                <li key={event.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-800 dark:text-gray-200">{event.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{event.date}</p>
                  </div>
                  <Link to={`/events/${event.id}`} className="btn btn-primary btn-sm">
                    View Details
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="space-y-6">
          <GamificationWidget />
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Quick Links</h2>
            <ul className="space-y-2">
              <li>
                <Link to="/projects" className="flex items-center text-blue-500 hover:underline">
                  <Folder className="mr-2" size={20} />
                  My Projects
                </Link>
              </li>
              <li>
                <Link to="/mentorship" className="flex items-center text-blue-500 hover:underline">
                  <Users className="mr-2" size={20} />
                  Find a Mentor
                </Link>
              </li>
              <li>
                <Link to="/forum" className="flex items-center text-blue-500 hover:underline">
                  <MessageSquare className="mr-2" size={20} />
                  Discussion Forum
                </Link>
              </li>
              <li>
                <Link to="/events" className="flex items-center text-blue-500 hover:underline">
                  <Calendar className="mr-2" size={20} />
                  Upcoming Events
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;