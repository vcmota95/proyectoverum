import { supabase } from './supabase';
import { getRandomAvatar } from '../utils/avatars';

// Helper: convert DB profile row to frontend user shape
const toFrontendUser = (profile) => {
  if (!profile) return null;
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role || 'student',
    displayName: profile.display_name || profile.name?.split(' ')[0] || 'Usuario',
    avatar: profile.avatar || getRandomAvatar(),
    countryFlag: profile.country_flag || 'ar',
    privacySettings: profile.privacy_settings || { showRealName: false, showEmail: false },
    xp: profile.xp || 0,
    enrolledSubjects: profile.enrolled_subjects || [],
    passedSubjects: profile.passed_subjects || [],
    stats: profile.stats || { totalPosts: 0, confirmedPosts: 0, rejectedPosts: 0 },
    falsePostCount: profile.false_post_count || 0,
    sanctionBadge: profile.sanction_badge || null,
    suspendedUntil: profile.suspended_until || null,
    flaggedForReview: profile.flagged_for_review || false,
    adminMessages: profile._adminMessages || [],
    selectedCommissions: profile.selected_commissions || {}
  };
};

// Helper: convert DB post row + votes to frontend post shape
const toFrontendPost = (post) => {
  if (!post) return null;
  return {
    id: post.id,
    title: post.title,
    description: post.description,
    subjectId: post.subject_id,
    comision: post.comision || null,
    notificationWeight: post.notification_weight || 'informational',
    sourceUrl: post.source_url || '',
    sourceFileName: post.source_file_name || null,
    sourceFileContent: post.source_file_url || null,
    eventDate: post.event_date || '',
    authorId: post.author_id,
    status: post.status || 'pending',
    extractedComisiones: post.extracted_comisiones || [],
    createdAt: new Date(post.created_at).getTime(),
    votes: post._votes || { upvotes: [], downvotes: [] }
  };
};

// Helper: fetch admin messages for a user
const fetchAdminMessages = async (userId) => {
  const { data } = await supabase
    .from('admin_messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return (data || []).map(m => ({
    id: m.id,
    from: m.from_id,
    text: m.text,
    createdAt: m.created_at
  }));
};

// Helper: fetch votes for a post
const fetchVotesForPost = async (postId) => {
  const { data } = await supabase
    .from('votes')
    .select('user_id, is_upvote')
    .eq('post_id', postId);
  const upvotes = (data || []).filter(v => v.is_upvote).map(v => v.user_id);
  const downvotes = (data || []).filter(v => !v.is_upvote).map(v => v.user_id);
  return { upvotes, downvotes };
};

// Helper: fetch profile + messages
const fetchFullProfile = async (userId) => {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (!profile) return null;
    profile._adminMessages = await fetchAdminMessages(userId);
    return toFrontendUser(profile);
  } catch (e) {
    console.error('fetchFullProfile error:', e);
    return null;
  }
};

export const authService = {
  async register({ name, email, password }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    });
    if (error) throw new Error(error.message);
    
    // Wait a moment for the trigger to create the profile
    await new Promise(r => setTimeout(r, 500));

    // Update the profile with avatar
    const avatar = getRandomAvatar();
    await supabase.from('profiles').update({ avatar }).eq('id', data.user.id);

    return await fetchFullProfile(data.user.id);
  },

  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error('Credenciales inválidas');
    return await fetchFullProfile(data.user.id);
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    return await fetchFullProfile(user.id);
  },

  async logout() {
    await supabase.auth.signOut();
  },

  async updateProfile(userId, profileData) {
    const updates = {};
    if (profileData.displayName !== undefined) updates.display_name = profileData.displayName;
    if (profileData.avatar !== undefined) updates.avatar = profileData.avatar;
    if (profileData.countryFlag !== undefined) updates.country_flag = profileData.countryFlag;
    if (profileData.privacySettings !== undefined) updates.privacy_settings = profileData.privacySettings;
    if (profileData.role !== undefined) updates.role = profileData.role;
    if (profileData.xp !== undefined) updates.xp = profileData.xp;
    if (profileData.enrolledSubjects !== undefined) updates.enrolled_subjects = profileData.enrolledSubjects;
    if (profileData.passedSubjects !== undefined) updates.passed_subjects = profileData.passedSubjects;
    if (profileData.stats !== undefined) updates.stats = profileData.stats;
    if (profileData.sanctionBadge !== undefined) updates.sanction_badge = profileData.sanctionBadge;
    if (profileData.suspendedUntil !== undefined) updates.suspended_until = profileData.suspendedUntil;
    if (profileData.selectedCommissions !== undefined) updates.selected_commissions = profileData.selectedCommissions;
    if (profileData.falsePostCount !== undefined) updates.false_post_count = profileData.falsePostCount;
    if (profileData.flaggedForReview !== undefined) updates.flagged_for_review = profileData.flaggedForReview;

    if (Object.keys(updates).length > 0) {
      await supabase.from('profiles').update(updates).eq('id', userId);
    }
    return await fetchFullProfile(userId);
  },

  async updateSubjects(userId, subjectIds) {
    await supabase.from('profiles').update({ enrolled_subjects: subjectIds }).eq('id', userId);
    return await fetchFullProfile(userId);
  },

  async updateUserCommission(userId, subjectId, commissionName) {
    const { data: profile } = await supabase.from('profiles').select('selected_commissions').eq('id', userId).single();
    const commissions = profile?.selected_commissions || {};
    commissions[subjectId] = commissionName;
    await supabase.from('profiles').update({ selected_commissions: commissions }).eq('id', userId);
    return await fetchFullProfile(userId);
  },

  async updateAcademicRecord(userId, subjectId, updateData) {
    const { data: profile } = await supabase.from('profiles').select('passed_subjects, enrolled_subjects').eq('id', userId).single();
    let records = profile?.passed_subjects || [];
    const index = records.findIndex(r => r.subjectId === subjectId);
    
    if (index >= 0) {
      records[index] = { ...records[index], ...updateData };
    } else {
      records.push({ subjectId, ...updateData });
    }

    // If marked as approved/promoted, remove from enrolled if present
    let enrolled = profile?.enrolled_subjects || [];
    if (updateData.status === 'approved' || updateData.status === 'promoted' || (updateData.grade && updateData.grade >= 4)) {
      enrolled = enrolled.filter(id => id !== subjectId);
    }

    await supabase.from('profiles').update({ passed_subjects: records, enrolled_subjects: enrolled }).eq('id', userId);
    return await fetchFullProfile(userId);
  },

  async deleteAcademicRecord(userId, subjectId) {
    const { data: profile } = await supabase.from('profiles').select('passed_subjects').eq('id', userId).single();
    const records = (profile?.passed_subjects || []).filter(r => r.subjectId !== subjectId);
    await supabase.from('profiles').update({ passed_subjects: records }).eq('id', userId);
    return await fetchFullProfile(userId);
  },

  async makeAdmin(userId) {
    await supabase.from('profiles').update({ role: 'admin' }).eq('id', userId);
    return await fetchFullProfile(userId);
  },

  async updateRoleAndStatus(userId, role, sanctionBadge, suspendedUntil) {
    await supabase.from('profiles').update({
      role,
      sanction_badge: sanctionBadge,
      suspended_until: suspendedUntil
    }).eq('id', userId);
    return await fetchFullProfile(userId);
  },

  async sendAdminMessage(adminId, userId, messageText) {
    const { error } = await supabase.rpc('admin_send_message', {
      p_user_id: userId,
      p_text: messageText
    });
    if (error) throw new Error(error.message);
    return await fetchFullProfile(userId);
  },

  async dismissAdminMessage(userId, messageId) {
    await supabase.from('admin_messages').delete().eq('id', messageId).eq('user_id', userId);
    return await fetchFullProfile(userId);
  },

  async updateUserStats(userId, statType, increment = 1, xpChange = 0) {
    const { data: profile } = await supabase.from('profiles').select('stats, xp').eq('id', userId).single();
    if (!profile) return;
    const stats = profile.stats || { totalPosts: 0, confirmedPosts: 0, rejectedPosts: 0 };
    if (statType) {
      stats[statType] = (stats[statType] || 0) + increment;
    }
    const newXp = Math.max(0, (profile.xp || 0) + xpChange);
    await supabase.from('profiles').update({ stats, xp: newXp }).eq('id', userId);
  },

  async getUserById(userId) {
    return await fetchFullProfile(userId);
  },

  async applyUserSanction(userId) {
    const { data: profile } = await supabase.from('profiles').select('false_post_count, sanction_badge, suspended_until').eq('id', userId).single();
    if (!profile) return;
    
    const count = (profile.false_post_count || 0) + 1;
    const updates = { false_post_count: count };

    if (count >= 10) {
      updates.sanction_badge = 'suspended';
      const until = new Date();
      until.setDate(until.getDate() + 30);
      updates.suspended_until = until.toISOString();
      updates.flagged_for_review = true;
    } else if (count >= 6) {
      updates.sanction_badge = 'lowTrust';
      const until = new Date();
      until.setDate(until.getDate() + 7);
      updates.suspended_until = until.toISOString();
    } else if (count >= 3) {
      updates.sanction_badge = 'warning';
    }

    await supabase.from('profiles').update(updates).eq('id', userId);
  },

  async resetUserSanctions(userId) {
    await supabase.from('profiles').update({
      false_post_count: 0,
      sanction_badge: null,
      suspended_until: null,
      flagged_for_review: false
    }).eq('id', userId);
  }
};

export const dataService = {
  async getSubjects() {
    const { data } = await supabase.from('subjects').select('*').order('id');
    return (data || []).map(s => ({
      id: s.id,
      name: s.name,
      cycle: s.cycle,
      comisiones: s.comisiones || [],
      lastUpdated: s.last_updated
    }));
  },

  async getPostById(postId) {
    const { data: post } = await supabase.from('posts').select('*').eq('id', postId).single();
    if (!post) return null;
    post._votes = await fetchVotesForPost(postId);
    return toFrontendPost(post);
  },

  async getAllPosts() {
    const { data: posts } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    if (!posts) return [];
    const results = [];
    for (const post of posts) {
      post._votes = await fetchVotesForPost(post.id);
      results.push(toFrontendPost(post));
    }
    return results;
  },

  async getPosts(filterBySubjects = [], includeGlobal = true, isAdmin = false) {
    const { data: posts } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    if (!posts) return [];

    const results = [];
    for (const post of posts) {
      // Admins see everything. Students see urgent OR enrolled subjects.
      const pass = isAdmin || (includeGlobal && post.notification_weight === 'urgent') || filterBySubjects.includes(post.subject_id);
      if (!pass) continue;
      post._votes = await fetchVotesForPost(post.id);
      results.push(toFrontendPost(post));
    }
    return results;
  },

  async createPost(postData, userId) {
    let sourceFileUrl = null;
    if (postData.sourceFileContent) {
      // Upload file to Supabase Storage
      const fileName = `${Date.now()}_${postData.sourceFileName || 'file'}`;
      const match = postData.sourceFileContent.match(/^data:(.*?);base64,(.*)$/);
      if (match) {
        const mimeType = match[1];
        const base64Data = match[2];
        const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
        const { data: uploadData } = await supabase.storage
          .from('post-attachments')
          .upload(fileName, binaryData, { contentType: mimeType });
        if (uploadData) {
          const { data: urlData } = supabase.storage.from('post-attachments').getPublicUrl(fileName);
          sourceFileUrl = urlData?.publicUrl || null;
        }
      }
    }

    const { data: newPost, error } = await supabase.from('posts').insert({
      title: postData.title,
      description: postData.description,
      subject_id: postData.subjectId,
      comision: postData.comision || null,
      notification_weight: postData.notificationWeight || 'informational',
      source_url: postData.sourceUrl || null,
      source_file_name: postData.sourceFileName || null,
      source_file_url: sourceFileUrl,
      event_date: postData.eventDate || null,
      author_id: userId,
      extracted_comisiones: postData.extractedComisiones || []
    }).select().single();

    if (error) throw new Error(error.message);

    // Update user stats
    await authService.updateUserStats(userId, 'totalPosts', 1, 5);

    newPost._votes = { upvotes: [], downvotes: [] };
    return toFrontendPost(newPost);
  },

  async voteOnPost(postId, userId, isUpvote, userRole) {
    // Use server-side function for secure voting
    const { data, error } = await supabase.rpc('process_vote', {
      p_post_id: postId,
      p_is_upvote: isUpvote
    });

    if (error) throw new Error(error.message);

    // Convert the RPC result back to frontend shape
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      subjectId: data.subject_id,
      comision: data.comision || null,
      notificationWeight: data.notification_weight,
      sourceUrl: data.source_url || '',
      sourceFileName: data.source_file_name || null,
      sourceFileContent: data.source_file_url || null,
      eventDate: data.event_date || '',
      authorId: data.author_id,
      status: data.status,
      extractedComisiones: data.extracted_comisiones || [],
      createdAt: new Date(data.created_at).getTime(),
      votes: {
        upvotes: data.upvotes || [],
        downvotes: data.downvotes || []
      }
    };
  },

  async submitFeedback(feedbackData) {
    await supabase.from('feedbacks').insert({
      user_id: feedbackData.userId,
      category: feedbackData.category,
      description: feedbackData.description,
      screenshot_name: feedbackData.screenshotName || null
    });
  },

  async reportPost(postId, reason, userId) {
    await supabase.from('reports').insert({
      post_id: postId,
      reason,
      reported_by: userId
    });
  },

  async getOfficialDates() {
    const { data } = await supabase.from('official_dates').select('*').order('date');
    return (data || []).map(d => ({
      id: d.id,
      title: d.title,
      date: d.date,
      description: d.description || ''
    }));
  },

  async manageOfficialDate(dateData, action) {
    if (action === 'add') {
      await supabase.from('official_dates').insert({
        title: dateData.title,
        date: dateData.date,
        description: dateData.description || ''
      });
    } else if (action === 'remove') {
      await supabase.from('official_dates').delete().eq('id', dateData.id);
    }
  },

  async deletePost(postId) {
    const { error } = await supabase.rpc('admin_delete_post', { p_post_id: postId });
    if (error) throw new Error(error.message);
  },

  async getReports() {
    const { data } = await supabase.from('reports').select('*').order('created_at', { ascending: false });
    return (data || []).map(r => ({
      id: r.id,
      postId: r.post_id,
      reason: r.reason,
      reportedBy: r.reported_by,
      createdAt: new Date(r.created_at).getTime()
    }));
  },

  async resolveReport(reportId) {
    await supabase.from('reports').delete().eq('id', reportId);
  },

  async getFeedbacks() {
    const { data } = await supabase.from('feedbacks').select('*').order('created_at', { ascending: false });
    return (data || []).map(fb => ({
      id: fb.id,
      userId: fb.user_id,
      category: fb.category,
      description: fb.description,
      screenshotName: fb.screenshot_name,
      createdAt: new Date(fb.created_at).getTime()
    }));
  },

  async getAllUsers() {
    const { data: users } = await supabase.from('profiles').select('*').order('created_at');
    if (!users) return [];
    const results = [];
    for (const u of users) {
      u._adminMessages = await fetchAdminMessages(u.id);
      results.push(toFrontendUser(u));
    }
    return results;
  },

  async updateUserRole(userId, newRole) {
    await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
  },

  getGeminiApiKey() {
    // Priority: env var > localStorage > Supabase
    return import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('verum_gemini_api_key') || '';
  },

  setGeminiApiKey(key) {
    localStorage.setItem('verum_gemini_api_key', key);
    // Also persist to Supabase
    supabase.from('app_settings').upsert({ key: 'gemini_api_key', value: key }).then();
  },

  async loadGeminiApiKey() {
    // If env var is set, use that directly
    const envKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (envKey) return envKey;
    try {
      const { data } = await supabase.from('app_settings').select('value').eq('key', 'gemini_api_key').maybeSingle();
      if (data?.value) {
        localStorage.setItem('verum_gemini_api_key', data.value);
      }
      return data?.value || '';
    } catch (e) {
      console.warn('Could not load Gemini API key:', e);
      return '';
    }
  },

  async updateSubjectCommissionsManually(subjectId, comisiones) {
    await supabase.from('subjects').update({
      comisiones,
      last_updated: new Date().toISOString()
    }).eq('id', subjectId);
  }
};
