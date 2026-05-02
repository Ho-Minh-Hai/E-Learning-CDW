import React from 'react';

const AuthBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Subtle Gradient Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.03),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.02),transparent_50%)]" />
      
      {/* Soft Animated Blobs */}
      <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-indigo-100/30 rounded-full blur-[80px] animate-pulse" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-purple-100/30 rounded-full blur-[80px] animate-pulse [animation-delay:2s]" />
    </div>
  );
};

export default AuthBackground;
