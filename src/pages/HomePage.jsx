import React, { useState, useEffect, useCallback } from 'react';
import { postAPI } from '../services/api';
import PostCard from '../components/post/PostCard';
import toast from 'react-hot-toast';
import { HiSparkles } from 'react-icons/hi';
import './HomePage.css';

export default function HomePage({ openCreatePost, newPost }) {
  const [posts, setPosts]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [page, setPage]               = useState(0);
  const [hasMore, setHasMore]         = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadFeed = useCallback(async (pageNum = 0, append = false) => {
    try {
      pageNum === 0 ? setLoading(true) : setLoadingMore(true);
      const res  = await postAPI.getFeed(pageNum, 10);
      const data = res.data.data;
      setPosts(prev => append ? [...prev, ...data.content] : data.content);
      setHasMore(!data.last);
    } catch {
      toast.error('Could not load feed');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => { loadFeed(0); }, [loadFeed]);

  useEffect(() => {
    if (newPost) setPosts(prev => [newPost, ...prev]);
  }, [newPost]);

  const handleDelete = (postId) =>
    setPosts(prev => prev.filter(p => p.id !== postId));

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    loadFeed(next, true);
  };

  if (loading) return (
    <div className="home-page">
      <div className="center-spinner"><div className="spinner" /></div>
    </div>
  );

  return (
    <div className="home-page">
      <div className="feed-wrap">

        <div className="feed-header">
          <HiSparkles size={18} className="feed-header-icon" />
          <span>Your Feed</span>
        </div>

        {posts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🌌</div>
            <h3>Your feed is empty</h3>
            <p>Follow some users or create your first post to fill it up!</p>
            <button className="btn btn-primary" onClick={openCreatePost}>
              Create First Post
            </button>
          </div>
        ) : (
          <>
            {posts.map(post => (
              <PostCard key={post.id} post={post} onDelete={handleDelete} />
            ))}

            {hasMore ? (
              <div className="load-more-wrap">
                <button
                  className="btn btn-outline btn-full"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore
                    ? <><span className="btn-spinner-dark" /> Loading...</>
                    : 'Load more posts'}
                </button>
              </div>
            ) : (
              <div className="feed-end">
                <span>✨</span>
                <span>You're all caught up!</span>
                <span>✨</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}