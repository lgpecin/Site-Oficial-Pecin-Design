-- Alterar enum service_category para mudar "arte_estatica" para "estatico"
ALTER TYPE service_category RENAME VALUE 'arte_estatica' TO 'estatico';

-- Adicionar campos de destino (cliente) na tabela kanban_cards
ALTER TABLE kanban_cards 
ADD COLUMN client_name TEXT,
ADD COLUMN client_icon TEXT;