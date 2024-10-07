import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, MessageSquare, Book, Award } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="space-y-8">
      <section className="text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white py-16 rounded-lg shadow-lg">
        <h1 className="text-5xl font-bold mb-4">Welcome to CS Student Association</h1>
        <p className="text-xl text-blue-100">Empowering future computer scientists</p>
      </section>

      <section className="grid md:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transform hover:scale-105 transition-transform duration-300">
          <Users className="w-12 h-12 text-blue-500 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Member Profiles</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Connect with fellow CS students and professionals.</p>
          <Link to="/members" className="text-blue-500 hover:underline flex items-center">
            View Members
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transform hover:scale-105 transition-transform duration-300">
          <Calendar className="w-12 h-12 text-green-500 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Upcoming Events</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Stay updated with our latest workshops and meetups.</p>
          <Link to="/events" className="text-green-500 hover:underline flex items-center">
            See Events
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transform hover:scale-105 transition-transform duration-300">
          <MessageSquare className="w-12 h-12 text-purple-500 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Discussion Forum</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Share ideas and resources with the community.</p>
          <Link to="/forum" className="text-purple-500 hover:underline flex items-center">
            Join Discussions
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      <section className="bg-blue-100 dark:bg-blue-900 p-8 rounded-lg shadow-inner">
        <h2 className="text-3xl font-bold mb-4 text-center">Get Involved</h2>
        <p className="text-xl mb-6 text-center text-gray-700 dark:text-gray-300">
          Join our vibrant community of computer science enthusiasts. Whether you're a beginner or an expert, there's a place for you here.
        </p>
        <div className="flex justify-center">
          <Link to="/signup" className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-300 transform hover:scale-105">
            Become a Member
          </Link>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-3xl font-bold mb-6 text-center">What We Offer</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <Book className="w-12 h-12 text-yellow-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Learning Resources</h3>
            <p className="text-gray-600 dark:text-gray-300">Access a curated collection of tutorials, articles, and study materials to enhance your CS skills.</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <Award className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Mentorship Program</h3>
            <p className="text-gray-600 dark:text-gray-300">Connect with experienced professionals and get guidance on your career path in computer science.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;