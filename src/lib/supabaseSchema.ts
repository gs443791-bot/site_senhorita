export const SUPABASE_SCHEMA_SQL = `-- ==========================================================
-- SENHORITA ACESSÓRIOS - SUPABASE DATABASE SCHEMA
-- Bijuterias Finas e Semijoias com Gestão de Estoque Automático
-- ==========================================================

-- 1. Tabela de Configurações da Loja
CREATE TABLE IF NOT EXISTS store_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  store_name TEXT NOT NULL DEFAULT 'Senhorita Acessórios',
  tagline TEXT DEFAULT '',
  whatsapp_number TEXT NOT NULL DEFAULT '5511999999999',
  instagram_handle TEXT DEFAULT '@acessorios.senhoritas',
  pix_key TEXT DEFAULT '',
  pix_key_type TEXT DEFAULT 'Telefone',
  pix_beneficiary TEXT DEFAULT 'Senhorita Acessórios',
  banner_notice TEXT DEFAULT 'Frete grátis para compras acima de R$ 150 | Enviamos para todo o Brasil ✨',
  about_text TEXT DEFAULT 'Bem-vinda à Senhorita Acessórios! Peças selecionadas com amor para realçar sua essência e beleza única.',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Tabela de Produtos (Bijuterias e Semijoias)
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'brincos',
    'colares',
    'pulseiras',
    'braceletes',
    'acessorios-cabelo',
    'relogio',
    'choker',
    'conjuntos',
    'aneis'
  )),
  price NUMERIC(10, 2) NOT NULL,
  promotional_price NUMERIC(10, 2),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  description TEXT DEFAULT '',
  materials TEXT DEFAULT '',
  images JSONB DEFAULT '[]'::jsonb,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Tabela de Clientes
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  address TEXT DEFAULT '',
  orders_count INTEGER DEFAULT 0,
  total_spent NUMERIC(10, 2) DEFAULT 0.00,
  last_order_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Tabela de Pedidos
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT DEFAULT '',
  customer_notes TEXT DEFAULT '',
  total_amount NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN (
    'pendente',
    'aguardando_pagamento',
    'pago',
    'enviado',
    'concluido',
    'cancelado'
  )),
  payment_method TEXT DEFAULT 'WhatsApp / PIX',
  whatsapp_message_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Itens do Pedido
CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_code TEXT NOT NULL,
  product_image TEXT DEFAULT '',
  unit_price NUMERIC(10, 2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  subtotal NUMERIC(10, 2) NOT NULL
);

-- 6. Trigger Automático: Baixa de estoque ao inserir item de pedido
CREATE OR REPLACE FUNCTION deduct_stock_on_order()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET stock = GREATEST(0, stock - NEW.quantity),
      updated_at = timezone('utc'::text, now())
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_deduct_stock ON order_items;
CREATE TRIGGER trg_deduct_stock
AFTER INSERT ON order_items
FOR EACH ROW
EXECUTE FUNCTION deduct_stock_on_order();

-- 7. Trigger Automático: Devolve estoque se pedido for cancelado
CREATE OR REPLACE FUNCTION restore_stock_on_cancel()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'cancelado' AND OLD.status != 'cancelado' THEN
    UPDATE products p
    SET stock = p.stock + oi.quantity,
        updated_at = timezone('utc'::text, now())
    FROM order_items oi
    WHERE oi.order_id = NEW.id AND oi.product_id = p.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_restore_stock ON orders;
CREATE TRIGGER trg_restore_stock
AFTER UPDATE OF status ON orders
FOR EACH ROW
EXECUTE FUNCTION restore_stock_on_cancel();

-- Políticas RLS (Row Level Security) - Leitura pública e gestão autenticada
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Regras anônimas para o catálogo online funcionar para todas as clientes
DROP POLICY IF EXISTS "Permitir leitura pública de configurações" ON store_settings;
CREATE POLICY "Permitir leitura pública de configurações" ON store_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir leitura pública de produtos" ON products;
CREATE POLICY "Permitir leitura pública de produtos" ON products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir criação de pedidos por clientes" ON orders;
CREATE POLICY "Permitir criação de pedidos por clientes" ON orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir inserção de itens de pedido" ON order_items;
CREATE POLICY "Permitir inserção de itens de pedido" ON order_items FOR INSERT WITH CHECK (true);

-- Regras gerais para a loja Senhorita Acessórios
DROP POLICY IF EXISTS "Acesso total aos produtos para administradores" ON products;
CREATE POLICY "Acesso total aos produtos para administradores" ON products FOR ALL USING (true);

DROP POLICY IF EXISTS "Acesso total aos pedidos para administradores" ON orders;
CREATE POLICY "Acesso total aos pedidos para administradores" ON orders FOR ALL USING (true);

DROP POLICY IF EXISTS "Acesso total aos clientes para administradores" ON customers;
CREATE POLICY "Acesso total aos clientes para administradores" ON customers FOR ALL USING (true);

DROP POLICY IF EXISTS "Acesso total às configurações para administradores" ON store_settings;
CREATE POLICY "Acesso total às configurações para administradores" ON store_settings FOR ALL USING (true);
`;
