import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../../services/api';
import Avatar from './Avatar';
import { HiSearch, HiX } from 'react-icons/hi';
import './SearchBar.css';

export default function SearchBar() {
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [showDrop, setShowDrop] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const debounceRef             = useRef(null);
  const wrapRef                 = useRef(null);
  const navigate                = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setShowDrop(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Debounced search — waits 500ms after user stops typing
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShowDrop(false);
      setNotFound(false);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const res = await userAPI.getByUsername(query.trim());
        setResults([res.data.data]);
        setShowDrop(true);
      } catch {
        setResults([]);
        setNotFound(true);
        setShowDrop(true);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleSelect = (username) => {
    navigate(`/profile/${username}`);
    setQuery('');
    setShowDrop(false);
    setResults([]);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setShowDrop(false);
    setNotFound(false);
  };

  return (
    <div className="search-wrap" ref={wrapRef}>
      <div className="search-box">
        {loading
          ? <span className="search-spinner" />
          : <HiSearch size={16} className="search-icon" />
        }
        <input
          className="search-input"
          placeholder="Search users..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => query && setShowDrop(true)}
        />
        {query && (
          <button className="search-clear" onClick={handleClear}>
            <HiX size={14} />
          </button>
        )}
      </div>

      {showDrop && (
        <div className="search-dropdown">
          {notFound ? (
            <div className="search-empty">
              <span>😕</span>
              <span>No user found for "<strong>{query}</strong>"</span>
            </div>
          ) : (
            results.map(user => (
              <button
                key={user.id}
                className="search-result-item"
                onClick={() => handleSelect(user.username)}
              >
                <Avatar user={user} size={38} />
                <div className="search-result-info">
                  <span className="search-result-name">@{user.username}</span>
                  {user.bio && (
                    <span className="search-result-bio">{user.bio}</span>
                  )}
                </div>
                <div className="search-result-stats">
                  <span>{user.followersCount} followers</span>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}