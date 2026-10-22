import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Sparkles, X, ShieldAlert } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  correctPin?: string;
  onPasswordChanged?: (newPin: string) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  correctPin,
}) => {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  // The password is @Gaeldavi22 (or any custom pin saved by the owner)
  const storedPin = (localStorage.getItem('senhorita_admin_pin_v1') || '').trim();
  const effectiveCorrectPin = (
    storedPin && storedPin !== '1234'
      ? storedPin
      : (correctPin && correctPin !== '1234' ? correctPin : '@Gaeldavi22')
  ).trim();

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim() === effectiveCorrectPin) {
      setErrorMessage('');
      setPin('');
      onSuccess();
    } else {
      setErrorMessage(
        'Senha incorreta! Digite a senha cadastrada para o acesso lojista.'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        className="relative bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-[#F4CCD6] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#F5D5DE] flex items-center justify-between bg-[#FFF5F7]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#FCE7EC] border border-[#F4CCD6] flex items-center justify-center text-[#9D723B]">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-base font-bold text-[#3B1522]">
                Área Restrita da Lojista
              </h2>
              <p className="text-[10px] text-[#8C5D6C]">
                Painel exclusivo para a dona da loja
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full hover:bg-white text-[#4A1D2B] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="p-5 space-y-4">
          <div className="text-xs text-[#69424F] leading-relaxed">
            Para garantir a segurança, clientes não possuem acesso para cadastrar peças ou alterar preços. Digite sua senha de administradora:
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#4A1D2B] mb-1">
              Senha de Administradora
            </label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                autoFocus
                required
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="Digite sua senha..."
                className="w-full pl-3 pr-9 py-2.5 text-xs rounded-xl border border-[#F4CCD6] bg-[#FFF9FA] focus:outline-none focus:ring-2 focus:ring-[#DFBA73] font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPin((prev) => !prev)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A87E8C] hover:text-[#4A1D2B] cursor-pointer"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {errorMessage && (
              <div className="mt-2 text-[11px] text-red-600 flex items-start gap-1 font-medium">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#8C3A55] hover:bg-[#FCE7EC] cursor-pointer"
            >
              Voltar ao Catálogo
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#DFBA73] to-[#C59B63] hover:brightness-105 shadow-gold-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Entrar no Painel</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
