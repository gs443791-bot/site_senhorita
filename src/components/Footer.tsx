import React from 'react';
import { CATEGORIES, ProductCategory, StoreSettings } from '../types';
import { cleanPhoneNumber } from '../utils/shopLogic';
import { MessageCircle, Instagram, ShieldCheck, Heart, Sparkles, Settings } from 'lucide-react';

interface FooterProps {
  settings: StoreSettings;
  onSelectCategory: (category: ProductCategory | 'todos') => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onSelectCategory,
  onOpenAdmin,
}) => {
  const currentYear = new Date().getFullYear();
  const whatsappUrl = `https://wa.me/${cleanPhoneNumber(settings.whatsappNumber)}`;

  return (
    <footer className="bg-white border-t border-[#F5D5DE] text-[#4A1D2B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#DFBA73] shadow-gold-sm bg-[#FFF0F3] shrink-0">
                <img
                  src={settings.logoUrl || '/assets/aistudio/WhatsApp_Image_2026-09-11_at_10.11.39__1__6db93c46.jpeg'}
                  alt={settings.storeName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="block font-serif text-2xl font-bold tracking-tight text-[#3B1522]">
                  {settings.storeName}
                </span>
                <span className="block text-[11px] font-medium tracking-widest uppercase text-[#B58448]">
                  {settings.tagline}
                </span>
              </div>
            </div>

            <p className="text-xs text-[#7A5461] max-w-md leading-relaxed">
              {settings.aboutText ||
                'Catálogo exclusivo com peças finas, acabamento de alta qualidade e atendimento acolhedor. Escolha suas peças e finalize seu pedido com facilidade diretamente no WhatsApp.'}
            </p>

            <div className="flex items-center gap-3 pt-1">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white border border-[#25D366]/30 flex items-center justify-center transition-all"
                title="WhatsApp Oficial"
              >
                <MessageCircle className="w-4 h-4" />
              </a>

              {settings.instagramHandle && (
                <a
                  href={`https://instagram.com/${settings.instagramHandle.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-[#E1306C]/10 text-[#E1306C] hover:bg-[#E1306C] hover:text-white border border-[#E1306C]/30 flex items-center justify-center transition-all"
                  title="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Col 2: Categories */}
          <div>
            <h4 className="font-serif text-sm font-bold text-[#3B1522] uppercase tracking-wider mb-3">
              Sub-abas / Coleções
            </h4>
            <ul className="space-y-1.5 text-xs text-[#69424F]">
              {CATEGORIES.slice(1, 6).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => {
                      onSelectCategory(cat.id);
                      window.scrollTo({ top: 400, behavior: 'smooth' });
                    }}
                    className="hover:text-[#B5486B] hover:translate-x-1 transition-all"
                  >
                    {cat.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: More Categories & Security */}
          <div>
            <h4 className="font-serif text-sm font-bold text-[#3B1522] uppercase tracking-wider mb-3">
              Mais Peças & Segurança
            </h4>
            <ul className="space-y-1.5 text-xs text-[#69424F] mb-4">
              {CATEGORIES.slice(6).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => {
                      onSelectCategory(cat.id);
                      window.scrollTo({ top: 400, behavior: 'smooth' });
                    }}
                    className="hover:text-[#B5486B] hover:translate-x-1 transition-all"
                  >
                    {cat.label}
                  </button>
                </li>
              ))}
            </ul>

            <div className="p-3 rounded-2xl bg-[#FFF9FA] border border-[#F4CCD6] text-[11px] text-[#7A5461] space-y-1">
              <div className="font-bold text-[#8C3A55] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C59B63]" />
                <span>Compra & Atendimento Seguro</span>
              </div>
              <p>Finalização direta com a dona da loja no WhatsApp, com pagamento por PIX e envio rastreado.</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-[#F5D5DE] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8C5D6C]">
          <div className="flex items-center gap-1">
            <span>© {currentYear} {settings.storeName}. Feito com carinho para você</span>
            <Heart className="w-3.5 h-3.5 text-[#B5486B] fill-[#B5486B] inline" />
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onOpenAdmin}
              className="text-[#9D723B] hover:underline flex items-center gap-1 text-[11px]"
            >
              <Settings className="w-3 h-3" />
              <span>Acesso ao Painel Administrativo</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
