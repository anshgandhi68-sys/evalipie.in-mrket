import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { DoorHero } from '../../components/hero/DoorHero.js';

export const ExperiencePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-[#F7F9FC]">
      {/* Floating Back Button */}
      <div className="fixed top-20 left-4 z-40">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/90 backdrop-blur-md border border-gray-200 shadow-sm text-xs font-semibold text-gray-800 hover:bg-white hover:border-gray-300 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Marketplace
        </button>
      </div>

      <DoorHero 
        onSelectCategory={(cat) => navigate(`/products?category=${cat}`)}
        onSearch={(q) => navigate(`/search?q=${encodeURIComponent(q)}`)}
      />
    </div>
  );
};

export default ExperiencePage;
