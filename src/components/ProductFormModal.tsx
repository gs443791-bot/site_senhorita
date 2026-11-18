import React, { useState, useEffect, useRef } from 'react';
import { CATEGORIES, Product, ProductCategory } from '../types';
import { generateProductCode } from '../utils/shopLogic';
import { compressImage } from '../utils/imageCompressor';
import { X, Upload, Image as ImageIcon, Sparkles, Check, AlertCircle, Loader2, Trash2 } from 'lucide-react';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
  onSave: (productData: Omit<Product, 'id' | 'createdAt'> & { id?: string }) => Promise<void>;
  existingProductsCount?: number;
  existingCodes?: string[];
}

const PRESET_JEWELRY_PHOTOS = [
  'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1611591475870-c752678622c1?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
  onSave,
  existingProductsCount = 0,
  existingCodes = [],
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('brincos');
  const [code, setCode] = useState('');
  const [price, setPrice] = useState('');
  const [promotionalPrice, setPromotionalPrice] = useState('');
  const [stock, setStock] = useState('5');
  const [description, setDescription] = useState('');
  const [materials, setMaterials] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [featured, setFeatured] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const codesPool = existingCodes.length > 0 ? existingCodes : existingProductsCount;
  const initializedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      initializedKeyRef.current = null;
      return;
    }

    const initKey = productToEdit ? `edit:${productToEdit.id}` : 'new';
    if (initializedKeyRef.current === initKey) {
      return;
    }
    initializedKeyRef.current = initKey;

    setErrorMessage('');
    if (productToEdit) {
      setName(productToEdit.name);
      setCategory(productToEdit.category);
      setCode(productToEdit.code);
      setPrice(String(productToEdit.price));
      setPromotionalPrice(productToEdit.promotionalPrice ? String(productToEdit.promotionalPrice) : '');
      setStock(String(productToEdit.stock));
      setDescription(productToEdit.description || '');
      setMaterials(productToEdit.materials || '');
      setImageUrl(productToEdit.images[0] || '');
      setFeatured(Boolean(productToEdit.featured));
    } else {
      setName('');
      setCategory('brincos');
      setCode(generateProductCode('brincos', codesPool));
      setPrice('');
      setPromotionalPrice('');
      setStock('5');
      setDescription('');
      setMaterials('Banhado a Ouro 18k com acabamento em verniz protetor');
      setImageUrl('');
      setFeatured(false);
    }
  }, [isOpen, productToEdit, existingProductsCount, existingCodes]);

  if (!isOpen) return null;

  const isUploadedDataUrl = imageUrl.startsWith('data:');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset input value so re-selecting the same photo works
    e.target.value = '';
    if (!file) return;

    setIsCompressing(true);
    setErrorMessage('');
    try {
      // Automatically optimize & compress photo to prevent quota errors
      const compressedDataUrl = await compressImage(file, {
        maxWidth: 1080,
        maxHeight: 1080,
        quality: 0.82,
        mimeType: 'image/jpeg',
      });
      setImageUrl(compressedDataUrl);
    } catch (err: any) {
      console.error('Error compressing image:', err);
      setErrorMessage(
        err?.message || 'Não foi possível processar esta imagem. Tente outra foto ou cole um link.'
      );
    } finally {
      setIsCompressing(false);
    }
  };

  const parseNumber = (val: string): number => {
    if (!val) return NaN;
    // Strip R$, spaces, and convert comma to dot
    const cleaned = val.replace(/[^\d.,]/g, '').replace(',', '.');
    return parseFloat(cleaned);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Por favor, informe o nome do produto.');
      return;
    }

    const parsedPrice = parseNumber(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setErrorMessage('Por favor, informe um preço de venda válido (ex: 25,00).');
      return;
    }

    if (!imageUrl.trim()) {
      setErrorMessage(
        'Por favor, carregue a foto da peça (ou cole um link / escolha um modelo) antes de salvar.'
      );
      return;
    }

    const parsedStock = parseInt(stock, 10);
    const parsedPromo = promotionalPrice ? parseNumber(promotionalPrice) : null;

    setIsSubmitting(true);
    try {
      await onSave({
        id: productToEdit?.id,
        name: name.trim(),
        category,
        code: code.trim() || generateProductCode(category, codesPool),
        price: parsedPrice,
        promotionalPrice: parsedPromo && parsedPromo > 0 ? parsedPromo : null,
        stock: isNaN(parsedStock) ? 0 : parsedStock,
        description: description.trim(),
        materials: materials.trim(),
        images: [imageUrl.trim()],
        featured,
      });
      onClose();
    } catch (err: any) {
      console.error('Error saving product:', err);
      const msg =
        err?.message && !err.message.includes('object')
          ? err.message
          : 'Erro ao salvar produto. Verifique os dados e tente novamente.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        className="relative bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-[#F4CCD6] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#F5D5DE] flex items-center justify-between bg-[#FFF5F7]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#FCE7EC] border border-[#F4CCD6] flex items-center justify-center text-[#9D723B]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-[#3B1522]">
                {productToEdit ? 'Editar Peça' : 'Cadastrar Nova Peça'}
              </h2>
              <p className="text-[11px] text-[#8C5D6C]">
                Adicione detalhes, fotos e quantidade em estoque da joia
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar formulário"
            className="w-8 h-8 rounded-full hover:bg-white text-[#4A1D2B] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Notification Banner if any */}
        {errorMessage && (
          <div className="mx-5 mt-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#4A1D2B] mb-1">
                Nome da Peça *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="Ex: Brinco Argola Cravejada Zircônia Ouro"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#F4CCD6] bg-[#FFF9FA] focus:outline-none focus:ring-2 focus:ring-[#DFBA73]"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-[#4A1D2B] mb-1">
                Categoria *
              </label>
              <select
                value={category}
                onChange={(e) => {
                  const newCat = e.target.value as ProductCategory;
                  setCategory(newCat);
                  if (!productToEdit) {
                    setCode(generateProductCode(newCat, codesPool));
                  }
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#F4CCD6] bg-[#FFF9FA] focus:outline-none focus:ring-2 focus:ring-[#DFBA73] capitalize"
              >
                {CATEGORIES.filter((c) => c.id !== 'todos').map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Code */}
            <div>
              <label className="block text-xs font-semibold text-[#4A1D2B] mb-1">
                Código / Referência *
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ex: BRI-001"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#F4CCD6] bg-[#FFF9FA] focus:outline-none focus:ring-2 focus:ring-[#DFBA73] font-mono uppercase"
              />
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#4A1D2B] mb-1">
                Preço Venda (R$) *
              </label>
              <input
                type="text"
                required
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="Ex: 49,90"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#F4CCD6] bg-[#FFF9FA] focus:outline-none focus:ring-2 focus:ring-[#DFBA73]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4A1D2B] mb-1">
                Preço Promo (R$)
              </label>
              <input
                type="text"
                value={promotionalPrice}
                onChange={(e) => setPromotionalPrice(e.target.value)}
                placeholder="39,90 (opcional)"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#F4CCD6] bg-[#FFF9FA] focus:outline-none focus:ring-2 focus:ring-[#DFBA73]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4A1D2B] mb-1">
                Estoque Inicial (un) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#F4CCD6] bg-[#FFF9FA] focus:outline-none focus:ring-2 focus:ring-[#DFBA73]"
              />
            </div>
          </div>

          {/* Materials & Specifications */}
          <div>
            <label className="block text-xs font-semibold text-[#4A1D2B] mb-1">
              Material & Banho
            </label>
            <input
              type="text"
              value={materials}
              onChange={(e) => setMaterials(e.target.value)}
              placeholder="Ex: Banhado a Ouro 18k, verniz protetor italiano, zircônias de alto brilho"
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#F4CCD6] bg-[#FFF9FA] focus:outline-none focus:ring-2 focus:ring-[#DFBA73]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#4A1D2B] mb-1">
              Descrição Detalhada
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes sobre tamanho, medidas, fechamento e caimento..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#F4CCD6] bg-[#FFF9FA] focus:outline-none focus:ring-2 focus:ring-[#DFBA73] resize-none"
            />
          </div>

          {/* Photo Management: Upload or URL */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[#4A1D2B]">
                Foto do Produto *
              </label>
              {isCompressing && (
                <span className="text-[11px] text-[#C59B63] font-medium flex items-center gap-1.5 animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Otimizando foto...</span>
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-center">
              {/* Preview Box */}
              <div className="relative w-20 h-20 rounded-2xl bg-[#FFF5F7] border border-[#F4CCD6] overflow-hidden shrink-0 flex items-center justify-center">
                {imageUrl ? (
                  <>
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      aria-label="Remover foto"
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer"
                      title="Remover foto"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <ImageIcon className="w-6 h-6 text-[#A86F81]" />
                )}
              </div>

              {/* Upload & URL Controls */}
              <div className="flex-1 space-y-2 w-full">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-[#FFF0F3] hover:bg-[#FCE7EC] text-[#8C3A55] border border-[#F4CCD6] transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Carregar Foto do Computador ou Celular</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={isCompressing || isSubmitting}
                      className="hidden"
                    />
                  </label>
                  {isUploadedDataUrl && (
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Foto carregada
                    </span>
                  )}
                </div>

                <input
                  type="url"
                  value={isUploadedDataUrl ? '' : imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder={
                    isUploadedDataUrl
                      ? 'Foto carregada da galeria (clique na lixeira para remover)'
                      : 'Ou cole o link direto da imagem (https://...)'
                  }
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#F4CCD6] bg-[#FFF9FA] focus:outline-none focus:ring-2 focus:ring-[#DFBA73]"
                />
              </div>
            </div>

            {/* Quick Presets */}
            <div className="pt-1">
              <span className="text-[10px] text-[#8C5D6C] block mb-1">
                Ou selecione uma foto de semijoia pronta:
              </span>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {PRESET_JEWELRY_PHOTOS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    aria-label={`Selecionar foto modelo ${idx + 1}`}
                    onClick={() => {
                      setImageUrl(preset);
                      if (errorMessage) setErrorMessage('');
                    }}
                    className={`w-10 h-10 rounded-lg overflow-hidden border shrink-0 cursor-pointer ${
                      imageUrl === preset
                        ? 'border-[#C59B63] ring-2 ring-[#DFBA73]'
                        : 'border-[#F4CCD6] hover:border-[#DFBA73]'
                    }`}
                  >
                    <img src={preset} alt={`Modelo ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Featured checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="featured-checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="w-4 h-4 text-[#C59B63] rounded border-gray-300 focus:ring-[#DFBA73]"
            />
            <label htmlFor="featured-checkbox" className="text-xs text-[#4A1D2B] font-medium cursor-pointer">
              Destacar esta peça na página inicial e topo da coleção
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#F5D5DE] flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#8C3A55] hover:bg-[#FCE7EC] cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isCompressing}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#DFBA73] to-[#C59B63] hover:brightness-105 shadow-gold-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Salvando Peça...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Salvar Peça</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
