import React from 'react';
import { StoreSettings } from '../types';
import { Sparkles, MessageCircle, ShieldCheck, HeartHandshake, Gift, Truck } from 'lucide-react';
import { cleanPhoneNumber } from '../utils/shopLogic';

interface HeroBannerProps {
  settings: StoreSettings;
  onExploreClick: () => void;
  productsCount: number;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  settings,
  onExploreClick,
  productsCount,
}) => {
  const whatsappUrl = `https://wa.me/${cleanPhoneNumber(settings.whatsappNumber)}?text=${encodeURIComponent(
    `Olá, ${settings.storeName}! Adorei o site e gostaria de saber as novidades disponíveis para compra!`
  )}`;

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#FFF0F4] via-[#FDF5F7] to-[#FFF9FA] border-b border-[#F5D5DE]/70">
      {/* Decorative luxury elements */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-[#DFBA73]/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-[#F4B8C7]/30 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text */}
          <div className="lg:col-span-7 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FCE7EC] border border-[#F4CCD6] text-xs font-semibold text-[#8C3A55] mb-4">
              <Sparkles className="w-3.5 h-3.5 text-[#C59B63]" />
              <span>Coleção Exclusiva de Bijuterias & Semijoias Finas</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#3B1522] tracking-tight leading-none mb-4">
              Realce o seu brilho com a{' '}
              <span className="text-gold-gradient underline decoration-[#DFBA73]/40 decoration-wavy">
                {settings.storeName}
              </span>
            </h1>

            <p className="text-sm sm:text-base text-[#6E4250] max-w-2xl mx-auto lg:mx-0 leading-relaxed mb-6 font-normal">
              {settings.aboutText ||
                'Nossas peças combinam acabamento de alta joalheria, banho antialérgico e design refinado para você se sentir deslumbrante todos os dias.'}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5">
              <button
                onClick={onExploreClick}
                className="px-6 py-3 rounded-full text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#DFBA73] via-[#C59B63] to-[#9D723B] hover:brightness-110 transition-all shadow-gold-md hover:shadow-gold-lg cursor-pointer flex items-center gap-2"
              >
                <span>Ver Catálogo Completo</span>
                <Sparkles className="w-4 h-4" />
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-full text-xs sm:text-sm font-semibold bg-[#25D366] hover:bg-[#20bd5a] text-white transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Atendimento WhatsApp</span>
              </a>
            </div>

            {/* Quick trust metrics */}
            <div className="mt-8 pt-6 border-t border-[#F5D5DE]/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#FFF0F3] border border-[#F4CCD6] flex items-center justify-center text-[#9D723B] shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-[#4A1D2B]">Hipoalergênico</div>
                  <div className="text-[10px] text-[#8C5D6C]">Livre de níquel</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#FFF0F3] border border-[#F4CCD6] flex items-center justify-center text-[#9D723B] shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-[#4A1D2B]">Envio Rápido</div>
                  <div className="text-[10px] text-[#8C5D6C]">Todo o Brasil</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#FFF0F3] border border-[#F4CCD6] flex items-center justify-center text-[#9D723B] shrink-0">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-[#4A1D2B]">Atendimento VIP</div>
                  <div className="text-[10px] text-[#8C5D6C]">Direto no WhatsApp</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#FFF0F3] border border-[#F4CCD6] flex items-center justify-center text-[#9D723B] shrink-0">
                  <Gift className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-[#4A1D2B]">Embalagem Luxo</div>
                  <div className="text-[10px] text-[#8C5D6C]">Perfeita p/ presentear</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Logo Visual Showcase */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group">
              {/* Outer glowing halo */}
              <div className="absolute -inset-2 bg-gradient-to-r from-[#DFBA73] via-[#F4B8C7] to-[#DFBA73] rounded-full blur-md opacity-70 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>

              {/* Main Circular Medallion */}
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full overflow-hidden p-2.5 bg-gradient-to-br from-[#FFF0F3] via-white to-[#FCE7EC] border-4 border-[#DFBA73] shadow-blush-lg flex items-center justify-center">
                <img
                  src={settings.logoUrl || '/assets/aistudio/WhatsApp_Image_2026-09-11_at_10.11.39__1__6db93c46.jpeg'}
                  alt={settings.storeName}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>

              {/* Float badge */}
              <div className="absolute -bottom-3 right-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#DFBA73] shadow-gold-sm flex items-center gap-1.5 text-xs font-semibold text-[#8C3A55]">
                <Sparkles className="w-3.5 h-3.5 text-[#C59B63]" />
                <span>Pronta Entrega</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
