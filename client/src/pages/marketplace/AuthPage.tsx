import React from 'react';
import { AuthModal } from '../../components/auth/AuthModal.js';
import { useNavigate } from 'react-router-dom';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FBF7EF] flex items-center justify-center py-12 px-4 sm:px-6">
      <AuthModal
        isOpen={true}
        onClose={() => navigate('/')}
        initialMode="signup"
      />
    </div>
  );
};
