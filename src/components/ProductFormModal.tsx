import React, { useState, useEffect } from 'react';
import { CATEGORIES, Product, ProductCategory } from '../types';
import { generateProductCode } from '../utils/shopLogic';
import { X, Upload, Image as ImageIcon, Sparkles, Check } from 'lucide-react';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
  onSave: (productData: Omit<Product, 'id' | 'createdAt'> & { id?: string }) => Promise<void>;
  existingProductsCount: number;
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
  existingProductsCount,
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

  useEffect(() => {
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
      setCode(generateProductCode('brincos', existingProductsCount));
      setPrice('');
      setPromotionalPrice('');
      setStock('5');
      setDescription('');
      setMaterials('Banhado a Ouro 18k com acabamento em verniz protetor');
      setImageUrl('');
      setFeatured(false);
    }
  }, [productToEdit, existingProductsCount, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Por favor, informe o nome do produto.');
      return;
    }
    const parsedPrice = parseFloat(price.replace(',', '.'));
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      alert('Por favor, informe um preço válido.');
      return;
    }

    const parsedStock = parseInt(stock, 10);
    const parsedPromo = promotionalPrice ? parseFloat(promotionalPrice.replace(',', '.')) : null;

    setIsSubmitting(true);
    try {
      await onSave({
        id: productToEdit?.id,
        name: name.trim(),
        category,
        code: code.trim() || generateProductCode(category, existingProductsCount),
        price: parsedPrice,
        promotionalPrice: parsedPromo && parsedPromo > 0 ? parsedPromo : null,
        stock: isNaN(parsedStock) ? 0 : parsedStock,
        description: description.trim(),
        materials: materials.trim(),
        images: imageUrl ? [imageUrl] : [PRESET_JEWELRY_PHOTOS[0]],
        featured,
      });
      onClose();
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Erro ao salvar produto.');
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
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white text-[#4A1D2B] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Product Name */}
          <div>
            <label className="block text-xs font-semibold text-[#4A1D2B] mb-1">
              Nome da Peça *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Brinco Argola Cravejada Zircônia Ouro"
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#F4CCD6] bg-[#FFF9FA] focus:outline-none focus:ring-2 focus:ring-[#DFBA73]"
            />
          </div>

          {/* Category & Reference Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#4A1D2B] mb-1">
                Sub-aba / Categoria *
              </label>
              <select
                value={category}
                onChange={(e) => {
                  const newCat = e.target.value as ProductCategory;
                  setCategory(newCat);
                  if (!productToEdit) {
                    setCode(generateProductCode(newCat, existingProductsCount));
                  }
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#F4CCD6] bg-[#FFF9FA] focus:outline-none focus:ring-2 focus:ring-[#DFBA73]"
              >
                {CATEGORIES.filter((c) => c.id !== 'todos').map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4A1D2B] mb-1">
                Código de Referência
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ex: BRI-001"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#F4CCD6] bg-[#FFF9FA] font-mono focus:outline-none focus:ring-2 focus:ring-[#DFBA73]"
              />
            </div>
          </div>

          {/* Pricing & Automatic Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#4A1D2B] mb-1">
                Preço Regular (R$) *
              </label>
              <input
                type="text"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="49,90"
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
            <label className="block text-xs font-semibold text-[#4A1D2B]">
              Foto do Produto
            </label>

            <div className="flex flex-col sm:flex-row gap-3 items-center">
              {/* Preview Box */}
              <div className="w-20 h-20 rounded-2xl bg-[#FFF5F7] border border-[#F4CCD6] overflow-hidden shrink-0 flex items-center justify-center">
                {imageUrl ? (
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-[#A86F81]" />
                )}
              </div>

              {/* Upload & URL Controls */}
              <div className="flex-1 space-y-2 w-full">
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-[#FFF0F3] hover:bg-[#FCE7EC] text-[#8C3A55] border border-[#F4CCD6]">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Carregar Foto do Computador ou Celular</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Ou cole o link direto da imagem..."
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
                    onClick={() => setImageUrl(preset)}
                    className="w-10 h-10 rounded-lg overflow-hidden border border-[#F4CCD6] hover:border-[#DFBA73] shrink-0"
                  >
                    <img src={preset} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
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
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#8C3A55] hover:bg-[#FCE7EC]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#DFBA73] to-[#C59B63] hover:brightness-105 shadow-gold-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Salvando...' : 'Salvar Peça'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
