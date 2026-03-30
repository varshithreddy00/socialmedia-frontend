import React from 'react';

export default function Avatar({ user, size = 36 }) {
  const initial = user?.username?.[0]?.toUpperCase() || '?';
  const style   = { width: size, height: size, fontSize: Math.round(size * 0.38) };

  if (user?.profilePictureUrl) {
    return <img src={user.profilePictureUrl} alt={user.username} className="avatar" style={style} />;
  }
  return <div className="avatar-placeholder" style={style}>{initial}</div>;
}