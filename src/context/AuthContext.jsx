import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { authService } from '../services/mock';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        if (!supabase) {
          console.warn('Supabase not initialized');
          if (mounted) setLoading(false);
          return;
        }
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Session error:", error);
          if (mounted) setLoading(false);
          return;
        }
        if (data?.session?.user) {
          const profile = await authService.getCurrentUser();
          if (mounted) setUser(profile);
        }
      } catch (error) {
        console.error("Auth init error:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    // Listen for auth state changes
    let subscription = null;
    try {
      if (supabase) {
        const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (!mounted) return;
          if (event === 'SIGNED_OUT') {
            setUser(null);
          }
        });
        subscription = data?.subscription;
      }
    } catch (e) {
      console.error("onAuthStateChange error:", e);
    }

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Real-time listener for Admin Messages
  useEffect(() => {
    if (!user || !supabase) return;

    const channel = supabase
      .channel(`admin_messages:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_messages',
          filter: `user_id=eq.${user.id}`
        },
        async () => {
          // Refresh user data when a new message arrives
          const updatedUser = await authService.getCurrentUser();
          setUser(updatedUser);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const login = async (email, password) => {
    const loggedInUser = await authService.login(email, password);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const register = async (userData) => {
    const registeredUser = await authService.register(userData);
    setUser(registeredUser);
    return registeredUser;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const updateSubjects = async (subjectIds) => {
    if (!user) return;
    const updatedUser = await authService.updateSubjects(user.id, subjectIds);
    setUser(updatedUser);
  };

  const updateProfile = async (profileData) => {
    if (!user) return;
    const updatedUser = await authService.updateProfile(user.id, profileData);
    setUser(updatedUser);
  };

  const makeAdmin = async () => {
    if (!user) return;
    const updatedUser = await authService.makeAdmin(user.id);
    setUser(updatedUser);
  };

  const updateAcademicRecord = async (subjectId, updateData) => {
    if (!user) return;
    const updatedUser = await authService.updateAcademicRecord(user.id, subjectId, updateData);
    setUser(updatedUser);
  };

  const deleteAcademicRecord = async (subjectId) => {
    if (!user) return;
    const updatedUser = await authService.deleteAcademicRecord(user.id, subjectId);
    setUser(updatedUser);
  };

  const dismissAdminMessage = async (messageId) => {
    if (!user) return;
    const updatedUser = await authService.dismissAdminMessage(user.id, messageId);
    setUser(updatedUser);
  };

  const updateUserCommission = async (subjectId, commissionName) => {
    if (!user) return;
    const updatedUser = await authService.updateUserCommission(user.id, subjectId, commissionName);
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateSubjects, updateProfile, makeAdmin, updateAcademicRecord, deleteAcademicRecord, dismissAdminMessage, updateUserCommission }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
