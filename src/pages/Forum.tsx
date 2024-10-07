import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { MessageSquare, User, ThumbsUp, Send } from 'lucide-react';
import io from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';

interface Comment {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  content: string;
  createdAt: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  createdAt: string;
  likes: number;
  comments: Comment[];
}

const ITEMS_PER_PAGE = 10;

const socket = io('http://localhost:5000');

const fetchPosts = async (page: number, token: string): Promise<{ posts: Post[], total: number, totalPages: number }> => {
  const { data } = await axios.get(`http://localhost:5000/api/posts?page=${page}&limit=${ITEMS_PER_PAGE}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

const createPost = async (newPost: Omit<Post, 'id' | 'createdAt' | 'likes' | 'comments'>, token: string): Promise<Post> => {
  const { data } = await axios.post('http://localhost:5000/api/posts', newPost, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

const createComment = async (postId: string, comment: Omit<Comment, 'id' | 'createdAt'>, token: string): Promise<Comment> => {
  const { data } = await axios.post(`http://localhost:5000/api/posts/${postId}/comments`, comment, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

const Forum: React.FC = () => {
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [newComments, setNewComments] = useState<{ [key: string]: string }>({});
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery<{ posts: Post[], total: number, totalPages: number }, Error>(
    ['posts', currentPage],
    () => fetchPosts(currentPage, user?.token || ''),
    { enabled: !!user }
  );

  const createPostMutation = useMutation(
    (postData: Omit<Post, 'id' | 'createdAt' | 'likes' | 'comments'>) => createPost(postData, user?.token || ''),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['posts']);
        setNewPost({ title: '', content: '' });
      },
    }
  );

  const createCommentMutation = useMutation(
    ({ postId, comment }: { postId: string; comment: Omit<Comment, 'id' | 'createdAt'> }) => 
      createComment(postId, comment, user?.token || ''),
    {
      onSuccess: (data, variables) => {
        queryClient.setQueryData<{ posts: Post[], total: number, totalPages: number } | undefined>(
          ['posts', currentPage],
          (oldData) => {
            if (!oldData) return undefined;
            return {
              ...oldData,
              posts: oldData.posts.map(post => 
                post.id === variables.postId
                  ? { ...post, comments: [...post.comments, data] }
                  : post
              )
            };
          }
        );
        setNewComments(prev => ({ ...prev, [variables.postId]: '' }));
      },
    }
  );

  useEffect(() => {
    socket.on('newPost', (post: Post) => {
      queryClient.setQueryData<{ posts: Post[], total: number, totalPages: number } | undefined>(
        ['posts', currentPage],
        (oldData) => {
          if (oldData) {
            return {
              ...oldData,
              posts: [post, ...oldData.posts.slice(0, ITEMS_PER_PAGE - 1)],
              total: oldData.total + 1
            };
          }
          return oldData;
        }
      );
    });

    socket.on('newComment', ({ postId, comment }: { postId: string, comment: Comment }) => {
      queryClient.setQueryData<{ posts: Post[], total: number, totalPages: number } | undefined>(
        ['posts', currentPage],
        (oldData) => {
          if (oldData) {
            return {
              ...oldData,
              posts: oldData.posts.map(post => 
                post.id === postId
                  ? { ...post, comments: [...post.comments, comment] }
                  : post
              )
            };
          }
          return oldData;
        }
      );
    });

    return () => {
      socket.off('newPost');
      socket.off('newComment');
    };
  }, [queryClient, currentPage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      createPostMutation.mutate({ ...newPost, author: user.uid });
    }
  };

  const handleCommentSubmit = (postId: string) => {
    if (user && newComments[postId]) {
      createCommentMutation.mutate({
        postId,
        comment: {
          author: user.uid,
          content: newComments[postId],
        }
      });
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-center text-red-500">Error: {error.message}</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold mb-6">Forum</h1>
      {user && (
        <form onSubmit={handleSubmit} className="card p-6 mb-8">
          <input
            type="text"
            placeholder="Post title"
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            className="input mb-4"
            required
          />
          <textarea
            placeholder="Post content"
            value={newPost.content}
            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
            className="input mb-4"
            rows={4}
            required
          ></textarea>
          <button type="submit" className="btn btn-primary">
            Create Post
          </button>
        </form>
      )}
      {data?.posts.map((post) => (
        <div key={post.id} className="card p-6">
          <h2 className="text-2xl font-semibold mb-2">{post.title}</h2>
          <p className="text-secondary-600 dark:text-secondary-400 mb-4">{post.content}</p>
          <div className="flex items-center justify-between text-sm text-secondary-500 dark:text-secondary-400 mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <User className="mr-1" size={16} />
                <span>{post.author.name}</span>
              </div>
              <div className="flex items-center">
                <MessageSquare className="mr-1" size={16} />
                <span>{new Date(post.createdAt).toLocaleString()}</span>
              </div>
            </div>
            <div className="flex items-center">
              <ThumbsUp className="mr-1" size={16} />
              <span>{post.likes}</span>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Comments</h3>
            {post.comments.map((comment, index) => (
              <div key={index} className="bg-secondary-100 dark:bg-secondary-700 p-3 rounded-lg mb-2">
                <div className="flex items-center mb-1">
                  <img src={comment.author.avatar} alt={comment.author.name} className="w-6 h-6 rounded-full mr-2" />
                  <span className="font-semibold">{comment.author.name}</span>
                  <span className="text-xs text-secondary-500 dark:text-secondary-400 ml-2">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-secondary-700 dark:text-secondary-300">{comment.content}</p>
              </div>
            ))}
            {user && (
              <div className="mt-2 flex">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={newComments[post.id] || ''}
                  onChange={(e) => setNewComments({ ...newComments, [post.id]: e.target.value })}
                  className="input flex-grow mr-2"
                />
                <button
                  onClick={() => handleCommentSubmit(post.id)}
                  className="btn btn-primary"
                  disabled={!newComments[post.id]}
                >
                  <Send size={18} />
                </button>
              </div>
            )}
          </div>
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

export default Forum;