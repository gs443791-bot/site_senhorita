import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Sparkles, X, ShieldAlert } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  correctPin: string;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveCorrectPin = correctPin || '1234';

    if (pin === effectiveCorrectPin) {
      setErrorMessage('');
      setPin('');
      onSuccess();
    } else {
      setErrorMessage('Senha incorreta. Apenas a dona da loja possui permissão para gerenciar o catálogo.');
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
            className="w-7 h-7 rounded-full hover:bg-white text-[#4A1D2B] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
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
                placeholder="Digite a senha..."
                className="w-full pl-3 pr-9 py-2.5 text-xs rounded-xl border border-[#F4CCD6] bg-[#FFF9FA] focus:outline-none focus:ring-2 focus:ring-[#DFBA73] font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPin((prev) => !prev)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A87E8C] hover:text-[#4A1D2B]"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {errorMessage ? (
              <div className="mt-2 text-[11px] text-red-600 flex items-start gap-1 font-medium">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            ) : (
              <p className="mt-1.5 text-[10px] text-[#8C5D6C]">
                Senha padrão inicial: <strong className="font-mono text-[#3B1522]">1234</strong> (você pode alterá-la nas configurações).
              </p>
            )}
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#8C3A55] hover:bg-[#FCE7EC]"
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
