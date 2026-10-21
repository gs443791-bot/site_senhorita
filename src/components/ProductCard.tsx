import React from 'react';
import { Product, StoreSettings } from '../types';
import { formatBRL, generateSingleProductWhatsAppUrl } from '../utils/shopLogic';
import { ShoppingBag, MessageCircle, Eye, AlertCircle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  settings: StoreSettings;
  onAddToCart: (product: Product) => void;
  onOpenDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  settings,
  onAddToCart,
  onOpenDetails,
}) => {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 3;
  const hasPromo = product.promotionalPrice && product.promotionalPrice < product.price;
  const discountPercent = hasPromo
    ? Math.round(((product.price - (product.promotionalPrice || 0)) / product.price) * 100)
    : 0;

  const activePrice = hasPromo ? product.promotionalPrice! : product.price;

  const whatsappUrl = generateSingleProductWhatsAppUrl(product, settings);

  const mainImage =
    product.images && product.images.length > 0
      ? product.images[0]
      : 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-[#F4D1DB]/70 hover:border-[#DFBA73] transition-all duration-300 hover:shadow-gold-md flex flex-col h-full">
      {/* Image container */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#FFF5F7]">
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges on top of image */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
          {hasPromo && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#B5486B] text-white shadow-xs">
              -{discountPercent}% OFF
            </span>
          )}
          {product.featured && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-[#DFBA73] to-[#C59B63] text-white shadow-xs">
              Destaque
            </span>
          )}
        </div>

        {/* Stock status indicator badge */}
        <div className="absolute top-2.5 right-2.5">
          {isOutOfStock ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-800 text-white shadow-xs">
              Esgotado
            </span>
          ) : isLowStock ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-600 text-white shadow-xs animate-pulse">
              Restam {product.stock} un!
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-600/90 text-white shadow-xs">
              {product.stock} em estoque
            </span>
          )}
        </div>

        {/* Quick view button overlay */}
        <button
          onClick={() => onOpenDetails(product)}
          className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
          aria-label={`Ver detalhes de ${product.name}`}
        >
          <span className="bg-white/95 text-[#4A1D2B] text-xs font-semibold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="w-3.5 h-3.5 text-[#B5486B]" />
            Ver Peça
          </span>
        </button>
      </div>

      {/* Content section */}
      <div className="p-4 flex flex-col flex-grow justify-between gap-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#A86F81] mb-1">
            {product.category} • {product.code}
          </div>

          <h3
            onClick={() => onOpenDetails(product)}
            className="font-serif text-base font-semibold text-[#3B1522] group-hover:text-[#9D723B] transition-colors line-clamp-2 cursor-pointer leading-snug"
          >
            {product.name}
          </h3>

          {product.materials && (
            <p className="text-[11px] text-[#7A5461] line-clamp-1 mt-1 font-normal">
              {product.materials}
            </p>
          )}
        </div>

        <div>
          {/* Price */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="font-serif text-lg font-bold text-[#8C3A55]">
              {formatBRL(activePrice)}
            </span>
            {hasPromo && (
              <span className="text-xs text-[#999] line-through">
                {formatBRL(product.price)}
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold text-white bg-[#25D366] hover:bg-[#20bd5a] transition-all flex items-center justify-center gap-1.5 shadow-xs"
              title="Pedir no WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-white" />
              <span>WhatsApp</span>
            </a>

            <button
              onClick={() => onAddToCart(product)}
              disabled={isOutOfStock}
              className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all border ${
                isOutOfStock
                  ? 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed'
                  : 'bg-[#FFF0F3] hover:bg-[#FCE7EC] text-[#8C3A55] border-[#F4CCD6] hover:border-[#DFBA73] cursor-pointer'
              }`}
              title={isOutOfStock ? 'Produto Esgotado' : 'Adicionar à Sacola'}
              aria-label={`Adicionar ${product.name} à sacola`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="sr-only sm:not-sr-only">Sacola</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
