import React, { useState, useRef, useEffect } from 'react';
import { postAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import toast from 'react-hot-toast';
import { HiX, HiPhotograph, HiUpload } from 'react-icons/hi';
import './CreatePostModal.css';

export default function CreatePostModal({ onClose, onPostCreated }) {
  const { user }                      = useAuth();
  const [content, setContent]         = useState('');
  const [imageUrl, setImageUrl]       = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [uploading, setUploading]     = useState(false);
  const [dragOver, setDragOver]       = useState(false);
  const textareaRef                   = useRef(null);
  const fileInputRef                  = useRef(null);

  useEffect(() => { textareaRef.current?.focus(); }, []);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Convert file to Base64
  const handleFileChange = (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB');
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result);
      setImagePreview(reader.result);
      setUploading(false);
      toast.success('Image ready!');
    };
    reader.onerror = () => {
      toast.error('Could not read image');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) handleFileChange(file);
  };

  // Drag and drop
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileChange(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const removeImage = () => {
    setImageUrl('');
    setImagePreview('');
    setShowUrlInput(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      const res = await postAPI.create({
        content,
        imageUrl: imageUrl || null,
      });
      onPostCreated(res.data.data);
      toast.success('Post published! 🎉');
      onClose();
    } catch {
      toast.error('Could not publish post');
    } finally {
      setLoading(false);
    }
  };

  const charsLeft = 2000 - content.length;
  const isOver    = charsLeft < 0;
  const isNearEnd = charsLeft < 100 && charsLeft >= 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-head">
          <span className="modal-title">Create Post</span>
          <button className="modal-close-btn" onClick={onClose}>
            <HiX size={20} />
          </button>
        </div>
        <div className="modal-divider" />

        {/* Body */}
        <form onSubmit={handleSubmit} className="modal-body">

          <div className="modal-author">
            <Avatar user={user} size={44} />
            <div>
              <div className="modal-author-name">@{user?.username}</div>
              <div className="modal-author-sub">Posting publicly</div>
            </div>
          </div>

          <textarea
            ref={textareaRef}
            className="modal-textarea"
            placeholder="What's happening? Share your thoughts..."
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={5}
          />

          {/* Image preview */}
          {imagePreview ? (
            <div className="modal-preview">
              <img src={imagePreview} alt="preview" />
              <button type="button" className="preview-remove" onClick={removeImage}>
                <HiX size={14} />
              </button>
            </div>
          ) : (
            /* Drag and drop zone */
            <div
              className={`drop-zone ${dragOver ? 'drop-zone--active' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? (
                <div className="drop-zone-content">
                  <span className="drop-spinner" />
                  <span>Processing image...</span>
                </div>
              ) : (
                <div className="drop-zone-content">
                  <HiUpload size={24} className="drop-icon" />
                  <span className="drop-text">
                    Drop image here or <span className="drop-link">browse</span>
                  </span>
                  <span className="drop-hint">PNG, JPG, GIF up to 5MB</span>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                style={{ display: 'none' }}
              />
            </div>
          )}

          {/* URL input toggle */}
          {showUrlInput && !imagePreview && (
            <input
              className="form-input"
              placeholder="Or paste image URL — https://example.com/photo.jpg"
              value={imageUrl}
              onChange={e => {
                setImageUrl(e.target.value);
                setImagePreview(e.target.value);
              }}
            />
          )}

          {/* Footer */}
          <div className="modal-footer">
            <div className="modal-footer-left">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => fileInputRef.current?.click()}
                title="Upload from computer"
              >
                <HiPhotograph size={19} /> Photo
              </button>
            </div>

            <div className="modal-footer-right">
              <div className="char-ring-wrap">
                <svg viewBox="0 0 36 36" className="char-ring">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="var(--border)" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="14"
                    fill="none"
                    stroke={isOver ? 'var(--danger)' : isNearEnd ? '#f59e0b' : 'var(--accent)'}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${Math.max(0, Math.min(88, (content.length / 2000) * 88))} 88`}
                    strokeDashoffset="22"
                    style={{ transition: 'stroke-dasharray 0.2s' }}
                  />
                </svg>
                {(isNearEnd || isOver) && (
                  <span className={`char-count-text ${isOver ? 'over' : 'warn'}`}>
                    {charsLeft}
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={!content.trim() || isOver || loading}
              >
                {loading ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}