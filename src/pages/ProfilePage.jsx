import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { userAPI, postAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/post/PostCard';
import Avatar from '../components/common/Avatar';
import toast from 'react-hot-toast';
import { HiPencil, HiCheck, HiX, HiUserAdd, HiUserRemove, HiPhotograph } from 'react-icons/hi';
import './ProfilePage.css';

export default function ProfilePage() {
  const { username }              = useParams();
  const { user: me, refreshUser } = useAuth();
  const [profile, setProfile]     = useState(null);
  const [posts, setPosts]         = useState([]);
  const [following, setFollowing] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPosts, setLoadingPosts]     = useState(true);
  const [page, setPage]           = useState(0);
  const [hasMore, setHasMore]     = useState(true);
  const [editing, setEditing]     = useState(false);
  const [editForm, setEditForm]   = useState({ bio: '', profilePictureUrl: '' });
  const [saving, setSaving]       = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwn = me?.username === username;

  const fetchProfile = useCallback(async () => {
    setLoadingProfile(true);
    try {
      const res = await userAPI.getByUsername(username);
      const p   = res.data.data;
      setProfile(p);
      setEditForm({ bio: p.bio || '', profilePictureUrl: p.profilePictureUrl || '' });
    } catch { toast.error('User not found'); }
    finally   { setLoadingProfile(false); }
  }, [username]);

  const fetchPosts = useCallback(async (pg = 0, append = false) => {
    setLoadingPosts(true);
    try {
      const res  = await postAPI.getByUser(username, pg, 10);
      const data = res.data.data;
      setPosts(prev => append ? [...prev, ...data.content] : data.content);
      setHasMore(!data.last);
    } catch { toast.error('Could not load posts'); }
    finally   { setLoadingPosts(false); }
  }, [username]);

  const fetchFollowStatus = useCallback(async (profileId) => {
    if (isOwn || !me) return;
    try {
      const res = await userAPI.getFollowStatus(profileId);
      setFollowing(res.data.data);
    } catch {}
  }, [isOwn, me]);

  useEffect(() => {
    fetchProfile();
    fetchPosts(0);
    setPage(0);
    setPosts([]);
  }, [username]);

  useEffect(() => {
    if (profile) fetchFollowStatus(profile.id);
  }, [profile]);

  const handleFollow = async () => {
    setFollowLoading(true);
    try {
      if (following) {
        await userAPI.unfollow(profile.id);
        setFollowing(false);
        setProfile(p => ({ ...p, followersCount: p.followersCount - 1 }));
      } else {
        await userAPI.follow(profile.id);
        setFollowing(true);
        setProfile(p => ({ ...p, followersCount: p.followersCount + 1 }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally { setFollowLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await userAPI.updateProfile(editForm);
      setProfile(p => ({ ...p, ...res.data.data }));
      await refreshUser();
      setEditing(false);
      toast.success('Profile updated!');
    } catch { toast.error('Update failed'); }
    finally   { setSaving(false); }
  };

  const handleDeletePost = async (postId) => {
    try {
      await postAPI.delete(postId);
      setPosts(p => p.filter(post => post.id !== postId));
      setProfile(p => ({ ...p, postsCount: p.postsCount - 1 }));
      toast.success('Post deleted');
    } catch { toast.error('Could not delete post'); }
  };

  if (loadingProfile) return (
    <div className="profile-page">
      <div className="center-spinner"><div className="spinner" /></div>
    </div>
  );

  if (!profile) return (
    <div className="profile-page">
      <div className="center-spinner"><p className="muted">User not found.</p></div>
    </div>
  );

  return (
    <div className="profile-page">

      <div className="profile-card card">
        <div className="profile-cover" />
        <div className="profile-main">

          <div className="profile-avatar-wrap">
            <Avatar user={profile} size={88} />
          </div>

          <div className="profile-info">
            <div className="profile-top-row">
              <div>
                <h2 className="profile-name">@{profile.username}</h2>
                {profile.bio && !editing && <p className="profile-bio">{profile.bio}</p>}
              </div>

              {isOwn ? (
                editing ? (
                  <div className="profile-edit-actions">
                    <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                      <HiCheck size={15} /> {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>
                      <HiX size={15} /> Cancel
                    </button>
                  </div>
                ) : (
                  <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)}>
                    <HiPencil size={15} /> Edit Profile
                  </button>
                )
              ) : (
                <button
                  className={`btn btn-sm ${following ? 'btn-outline' : 'btn-primary'}`}
                  onClick={handleFollow}
                  disabled={followLoading}
                >
                  {following
                    ? <><HiUserRemove size={15} /> Unfollow</>
                    : <><HiUserAdd size={15} /> Follow</>}
                </button>
              )}
            </div>

            {editing && (
              <div className="profile-edit-form">
                <input
                  className="form-input"
                  placeholder="Write a bio..."
                  value={editForm.bio}
                  onChange={e => setEditForm(p => ({ ...p, bio: e.target.value }))}
                  maxLength={255}
                />
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <HiPhotograph style={{ position: 'absolute', left: 12, color: 'var(--text-muted)' }} size={16} />
                  <input
                    className="form-input"
                    style={{ paddingLeft: 38 }}
                    placeholder="Profile picture URL"
                    value={editForm.profilePictureUrl}
                    onChange={e => setEditForm(p => ({ ...p, profilePictureUrl: e.target.value }))}
                  />
                </div>
              </div>
            )}

            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-num">{profile.postsCount}</span>
                <span className="stat-lbl">Posts</span>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <span className="stat-num">{profile.followersCount}</span>
                <span className="stat-lbl">Followers</span>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <span className="stat-num">{profile.followingCount}</span>
                <span className="stat-lbl">Following</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-posts">
        <div className="posts-section-header">
          <span className="posts-section-title">Posts</span>
          <span className="posts-section-count">{profile.postsCount}</span>
        </div>

        {loadingPosts && posts.length === 0 ? (
          <div className="center-spinner"><div className="spinner" /></div>
        ) : posts.length === 0 ? (
          <div className="no-posts">
            <span>📭</span>
            <p>{isOwn ? "You haven't posted anything yet." : `@${profile.username} hasn't posted yet.`}</p>
          </div>
        ) : (
          <>
            {posts.map(p => (
              <PostCard key={p.id} post={p} onDelete={handleDeletePost} />
            ))}
            {hasMore && (
              <div style={{ paddingTop: 8 }}>
                <button
                  className="btn btn-outline btn-full"
                  onClick={() => { const n = page + 1; setPage(n); fetchPosts(n, true); }}
                  disabled={loadingPosts}
                >
                  Load more
                </button>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
}