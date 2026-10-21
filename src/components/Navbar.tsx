import React from 'react';
import { ShoppingBag, MessageCircle, Settings, Store, Sparkles } from 'lucide-react';
import { StoreSettings } from '../types';
import { cleanPhoneNumber } from '../utils/shopLogic';

interface NavbarProps {
  settings: StoreSettings;
  cartCount: number;
  onOpenCart: () => void;
  isAdmin: boolean;
  onToggleAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  cartCount,
  onOpenCart,
  isAdmin,
  onToggleAdmin,
}) => {
  const whatsappUrl = `https://wa.me/${cleanPhoneNumber(settings.whatsappNumber)}?text=${encodeURIComponent(
    `Olá, ${settings.storeName}! Gostaria de tirar uma dúvida sobre as peças do catálogo.`
  )}`;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#F5D5DE]/60 shadow-xs">
      {/* Top Banner Notice */}
      {settings.bannerNotice && (
        <div className="bg-gradient-to-r from-[#FCE7EC] via-[#FDF0F3] to-[#FCE7EC] py-1.5 px-4 text-center border-b border-[#F7C6D2]/40 text-xs font-medium text-[#8C3A55] flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#C59B63]" />
          <span>{settings.bannerNotice}</span>
          <Sparkles className="w-3.5 h-3.5 text-[#C59B63]" />
        </div>
      )}

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (isAdmin) onToggleAdmin();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-3 text-left group transition-transform hover:scale-[1.01]"
          >
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#DFBA73] shadow-gold-sm bg-[#FFF0F3] shrink-0">
              <img
                src={settings.logoUrl || '/assets/aistudio/WhatsApp_Image_2026-09-11_at_10.11.39__1__6db93c46.jpeg'}
                alt={settings.storeName}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="block font-serif text-2xl font-bold tracking-tight text-[#4A1D2B] leading-none group-hover:text-[#9D723B] transition-colors">
                {settings.storeName}
              </span>
              {settings.tagline && settings.tagline !== 'Semijoias & Bijuterias Finas' && (
                <span className="block text-[11px] font-medium tracking-widest uppercase text-[#B58448] mt-1">
                  {settings.tagline}
                </span>
              )}
            </div>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Direct WhatsApp link */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 border border-[#25D366]/30 transition-all hover:shadow-xs"
            title="Falar no WhatsApp da Loja"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#25D366]"></span>
            </span>
            <MessageCircle className="w-4 h-4 text-[#25D366]" />
            <span>Falar no WhatsApp</span>
          </a>

          {/* Cart Button */}
          <button
            onClick={onOpenCart}
            aria-label={`Sacola de Compras com ${cartCount} itens`}
            className="relative flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#FFF0F3] hover:bg-[#FCE7EC] text-[#8C3A55] border border-[#F4B8C7] transition-all hover:scale-105 active:scale-95 shadow-xs"
          >
            <ShoppingBag className="w-5 h-5 text-[#B5486B]" />
            <span className="hidden md:inline text-xs font-semibold">Minha Sacola</span>
            {cartCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#DFBA73] to-[#C59B63] rounded-full shadow-xs">
                {cartCount}
              </span>
            )}
          </button>

          {/* Admin Toggle / Lock Button */}
          {isAdmin ? (
            <button
              onClick={onToggleAdmin}
              aria-label="Sair do Painel e Voltar para a Loja"
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-[#C59B63] to-[#DFBA73] text-white shadow-gold-sm hover:brightness-105 transition-all cursor-pointer"
            >
              <Store className="w-4 h-4" />
              <span className="hidden sm:inline">Ver Loja (Cliente)</span>
            </button>
          ) : (
            <button
              onClick={onToggleAdmin}
              aria-label="Acesso Restrito da Lojista"
              title="Acesso da Proprietária (Requer Senha)"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-full text-xs font-medium bg-white hover:bg-[#FDF2F4] text-[#7A5B35] border border-[#E8D4B8] transition-all cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-[#C59B63]" />
              <span className="hidden md:inline">Área da Lojista</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

