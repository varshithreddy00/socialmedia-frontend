import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'timeago.js';
import {
  HiHeart, HiOutlineHeart,
  HiChatAlt2, HiOutlineChatAlt2,
  HiTrash, HiX,
} from 'react-icons/hi';
import { likeAPI, commentAPI, postAPI, userAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import toast from 'react-hot-toast';
import './PostCard.css';

// =============================================
// Follow Button Component
// =============================================
function FollowButton({ authorId }) {
  const [following, setFollowing] = useState(null);
  const [loading, setLoading]     = useState(false);

  useEffect(() => {
    userAPI.getFollowStatus(authorId)
      .then(res => setFollowing(res.data.data))
      .catch(() => setFollowing(false));
  }, [authorId]);

  const toggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    try {
      if (following) {
        await userAPI.unfollow(authorId);
        setFollowing(false);
        toast.success('Unfollowed');
      } else {
        await userAPI.follow(authorId);
        setFollowing(true);
        toast.success('Now following! 🎉');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  if (following === null) return null;

  return (
    <button
      className={`follow-btn ${following ? 'follow-btn--following' : ''}`}
      onClick={toggle}
      disabled={loading}
    >
      {following ? 'Following' : '+ Follow'}
    </button>
  );
}

// =============================================
// Main PostCard Component
// =============================================
export default function PostCard({ post, onDelete }) {
  const { user }                        = useAuth();
  const [liked, setLiked]               = useState(post.likedByCurrentUser);
  const [likesCount, setLikesCount]     = useState(post.likesCount);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments]         = useState([]);
  const [commentText, setCommentText]   = useState('');
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [loadingCmts, setLoadingCmts]   = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const [likeAnim, setLikeAnim]         = useState(false);

  const isOwner    = user?.username === post.authorUsername;
  const authorUser = {
    username: post.authorUsername,
    profilePictureUrl: post.authorProfilePictureUrl,
  };

  // ---- Like ----
  const handleLike = async () => {
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 350);
    try {
      if (liked) {
        await likeAPI.unlike(post.id);
        setLiked(false);
        setLikesCount(c => c - 1);
      } else {
        await likeAPI.like(post.id);
        setLiked(true);
        setLikesCount(c => c + 1);
      }
    } catch {
      toast.error('Could not update like');
    }
  };

  // ---- Comments ----
  const toggleComments = async () => {
    if (!commentsLoaded) {
      setLoadingCmts(true);
      try {
        const res = await commentAPI.getAll(post.id, 0, 30);
        setComments(res.data.data.content || []);
        setCommentsLoaded(true);
      } catch {
        toast.error('Could not load comments');
      } finally {
        setLoadingCmts(false);
      }
    }
    setShowComments(p => !p);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const res = await commentAPI.add(post.id, { content: commentText });
      setComments(p => [res.data.data, ...p]);
      setCommentText('');
    } catch {
      toast.error('Could not add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (cid) => {
    try {
      await commentAPI.delete(post.id, cid);
      setComments(p => p.filter(c => c.id !== cid));
    } catch {
      toast.error('Could not delete comment');
    }
  };

  // ---- Delete Post ----
  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await postAPI.delete(post.id);
      onDelete(post.id);
      toast.success('Post deleted');
    } catch {
      toast.error('Could not delete post');
    }
  };

  return (
    <article className="post-card">

      {/* ---- Header ---- */}
      <div className="pc-header">
        <Link to={`/profile/${post.authorUsername}`} className="pc-author">
          <Avatar user={authorUser} size={40} />
          <div className="pc-author-info">
            <span className="pc-username">@{post.authorUsername}</span>
            <span className="pc-time">{format(post.createdAt)}</span>
          </div>
        </Link>

        <div className="pc-header-right">
          {!isOwner && (
            <FollowButton authorId={post.authorId} />
          )}
          {isOwner && (
            <button
              className="pc-delete-btn"
              onClick={handleDelete}
              title="Delete post"
            >
              <HiTrash size={16} />
            </button>
          )}
        </div>
      </div>

      {/* ---- Content ---- */}
      <div className="pc-body">
        <p className="pc-text">{post.content}</p>
        {post.imageUrl && (
          <div className="pc-img-wrap">
            <img
              src={post.imageUrl}
              alt="post"
              className="pc-img"
              loading="lazy"
            />
          </div>
        )}
      </div>

      {/* ---- Stats ---- */}
      <div className="pc-stats">
        <span>{likesCount} {likesCount === 1 ? 'like' : 'likes'}</span>
        <span>{post.commentsCount} {post.commentsCount === 1 ? 'comment' : 'comments'}</span>
      </div>

      <div className="pc-divider" />

      {/* ---- Action Buttons ---- */}
      <div className="pc-actions">
        <button
          className={`pc-action-btn ${liked ? 'pc-action-btn--liked' : ''}`}
          onClick={handleLike}
        >
          <span className={`like-icon ${likeAnim ? 'like-pop' : ''}`}>
            {liked ? <HiHeart size={20} /> : <HiOutlineHeart size={20} />}
          </span>
          Like
        </button>

        <button className="pc-action-btn" onClick={toggleComments}>
          {showComments
            ? <HiChatAlt2 size={20} />
            : <HiOutlineChatAlt2 size={20} />}
          Comment
        </button>
      </div>

      {/* ---- Comments Section ---- */}
      {showComments && (
        <div className="pc-comments">
          <div className="pc-divider" />

          {/* Add Comment Form */}
          <form className="cmt-form" onSubmit={handleAddComment}>
            <Avatar user={user} size={32} />
            <input
              className="cmt-input"
              placeholder="Write a comment..."
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              disabled={submitting}
            />
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={!commentText.trim() || submitting}
            >
              {submitting ? '...' : 'Send'}
            </button>
          </form>

          {/* Comments List */}
          {loadingCmts ? (
            <div className="center-spinner">
              <div className="spinner" />
            </div>
          ) : comments.length === 0 ? (
            <p className="cmt-empty">No comments yet — be the first!</p>
          ) : (
            <ul className="cmt-list">
              {comments.map(c => (
                <li key={c.id} className="cmt-item">
                  <Avatar
                    user={{
                      username: c.authorUsername,
                      profilePictureUrl: c.authorProfilePictureUrl,
                    }}
                    size={30}
                  />
                  <div className="cmt-bubble">
                    <Link
                      to={`/profile/${c.authorUsername}`}
                      className="cmt-author"
                    >
                      @{c.authorUsername}
                    </Link>
                    <span className="cmt-text">{c.content}</span>
                    <span className="cmt-time">{format(c.createdAt)}</span>
                  </div>
                  {user?.username === c.authorUsername && (
                    <button
                      className="cmt-del"
                      onClick={() => handleDeleteComment(c.id)}
                    >
                      <HiX size={13} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

    </article>
  );
}