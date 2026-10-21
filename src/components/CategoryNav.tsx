import React from 'react';
import { CATEGORIES, ProductCategory } from '../types';
import {
  Sparkles,
  Sparkle,
  Gem,
  CircleDot,
  Disc,
  Crown,
  Watch,
  Shield,
  Layers,
  HeartHandshake,
  Search,
} from 'lucide-react';

interface CategoryNavProps {
  activeCategory: ProductCategory | 'todos';
  onSelectCategory: (cat: ProductCategory | 'todos') => void;
  searchTerm: string;
  onSearchChange: (query: string) => void;
  categoryCounts: Record<string, number>;
}

const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case 'Sparkles':
      return <Sparkles className="w-4 h-4" />;
    case 'Sparkle':
      return <Sparkle className="w-4 h-4" />;
    case 'Gem':
      return <Gem className="w-4 h-4" />;
    case 'CircleDot':
      return <CircleDot className="w-4 h-4" />;
    case 'Disc':
      return <Disc className="w-4 h-4" />;
    case 'Crown':
      return <Crown className="w-4 h-4" />;
    case 'Watch':
      return <Watch className="w-4 h-4" />;
    case 'Shield':
      return <Shield className="w-4 h-4" />;
    case 'Layers':
      return <Layers className="w-4 h-4" />;
    case 'HeartHandshake':
      return <HeartHandshake className="w-4 h-4" />;
    default:
      return <Sparkles className="w-4 h-4" />;
  }
};

export const CategoryNav: React.FC<CategoryNavProps> = ({
  activeCategory,
  onSelectCategory,
  searchTerm,
  onSearchChange,
  categoryCounts,
}) => {
  return (
    <div className="bg-[#FFFDFE] border-b border-[#F7E2E7] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        {/* Search bar & filter row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-3">
          <div className="text-xs text-[#8C3A55] font-medium hidden sm:flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#DFBA73] inline-block"></span>
            <span>Navegue pelas categorias ou busque seu modelo favorito</span>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#A87E8C]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por nome, banho, zircônia..."
              className="w-full pl-9 pr-4 py-2 rounded-full text-xs bg-[#FFF5F7] border border-[#F4CCD6] text-[#4A1D2B] placeholder:text-[#A87E8C] focus:outline-none focus:ring-2 focus:ring-[#DFBA73] focus:border-transparent transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#A87E8C] hover:text-[#4A1D2B]"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Sub-tabs horizontal scrollable list */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            const count = categoryCounts[cat.id] || 0;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#DFBA73] to-[#C59B63] text-white shadow-gold-sm font-semibold scale-[1.02]'
                    : 'bg-[#FFF0F3]/80 hover:bg-[#FCE7EC] text-[#692E41] border border-[#F7D5DE] hover:border-[#DFBA73]/50'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-[#C59B63]'}>
                  {getCategoryIcon(cat.iconName)}
                </span>
                <span>{cat.label}</span>
                {count > 0 && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-[#F9D5DE] text-[#7A1F3D]'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
