import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { dataService } from '../services/mock';
import { useAuth } from './AuthContext';
import { supabase } from '../services/supabase';

const FeedContext = createContext();

export const useFeed = () => useContext(FeedContext);

export const FeedProvider = ({ children }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSubjects = useCallback(async () => {
    try {
      const data = await dataService.getSubjects();
      setSubjects(data || []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  }, []);

  const fetchPosts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await dataService.getPosts(user.enrolledSubjects || [], true, user.role === 'admin');
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchSubjects();
      // Also load the Gemini API key from Supabase into localStorage
      dataService.loadGeminiApiKey?.().catch(() => {});
    }
  }, [fetchSubjects, user]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Real-time listener for Posts and Votes
  useEffect(() => {
    if (!user || !supabase) return;

    const channel = supabase
      .channel('feed_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts' },
        () => {
          fetchPosts(); // Reload all for now to keep order and filtering consistent
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'votes' },
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchPosts]);

  const checkSuspension = (u) => {
    if (u?.suspendedUntil && new Date(u.suspendedUntil) > new Date()) {
      const date = new Date(u.suspendedUntil).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
      throw new Error(`Tu cuenta está suspendida hasta el ${date}. No podés publicar ni votar durante este período.`);
    }
  };

  const createPost = async (postData) => {
    if (!user) return null;
    try {
      checkSuspension(user);
      const newPost = await dataService.createPost(postData, user.id);
      setPosts(prev => [newPost, ...prev]);
      return newPost;
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  };

  const voteOnPost = async (postId, isUpvote) => {
    if (!user) return;
    try {
      checkSuspension(user);
      const updatedPost = await dataService.voteOnPost(postId, user.id, isUpvote, user.role);
      setPosts(prev => prev.map(p => p.id === postId ? updatedPost : p));
    } catch (error) {
      console.error("Error voting on post:", error);
      throw error;
    }
  };

  const reportPost = async (postId, reason) => {
    if (!user) return;
    try {
      await dataService.reportPost(postId, reason, user.id);
    } catch (error) {
      console.error("Error reporting post:", error);
      throw error;
    }
  };

  return (
    <FeedContext.Provider value={{ posts, subjects, loading, fetchPosts, fetchSubjects, createPost, voteOnPost, reportPost }}>
      {children}
    </FeedContext.Provider>
  );
};
