# Reorganização da aba Orçamentos

## Objetivo
Transformar a aba "Orçamentos e Serviços" em um fluxo centrado em **clientes**. Ao abrir, você vê a lista de clientes (criar/editar/excluir). Ao clicar em um cliente, você acessa os serviços **daquele cliente**, com preços próprios. Os serviços atuais viram **templates globais** reutilizáveis.

## Estrutura de dados (nova tabela)

Criar tabela `budget_clients`:
- `name`, `email`, `phone`, `company`, `notes`
- `user_id` (dono), timestamps
- RLS: cada usuário vê/edita só os seus

Criar tabela `client_services` (serviços por cliente):
- `client_id` → budget_clients
- `template_service_id` (opcional) → services (referência ao template de origem)
- `name`, `description`, `category`, `price`, `delivery_days`, `icon`, `color`, `display_order`
- RLS via dono do client

A tabela `services` existente permanece e passa a ser tratada como **biblioteca de templates**.

## Mudanças de UI

### Aba "Orçamentos e Serviços" → renomeada para "Orçamentos"
Duas sub-abas no topo:
1. **Clientes** (padrão ao abrir)
2. **Templates de Serviços** (a tela atual de serviços, sem mudanças funcionais — só rotulada como templates)

### Sub-aba Clientes
- Grid/lista de cards de clientes com busca
- Botão "Novo cliente" → modal com nome/empresa/email/telefone/notas
- Cada card: editar, excluir, e **Abrir** (entra na visão de serviços do cliente)

### Visão do cliente (após clicar em um cliente)
- Cabeçalho com dados do cliente + botão voltar
- Lista de serviços daquele cliente (mesmo visual atual: grid/lista, agrupado por categoria)
- Botões:
  - **Adicionar do template**: modal para escolher 1+ templates e copiá-los como serviços do cliente (com preço/prazo herdados, editáveis depois)
  - **Novo serviço personalizado**: cria do zero
  - **Calculadora de orçamento**: abre `BudgetCalculator` já filtrado nos serviços desse cliente
  - **Exportar PDF**: já existente dentro da calculadora

A calculadora e a exportação PDF passam a operar sobre `client_services` do cliente ativo.

## Arquivos

Novos:
- `src/components/admin/budgets/ClientsList.tsx`
- `src/components/admin/budgets/ClientForm.tsx`
- `src/components/admin/budgets/ClientServicesView.tsx`
- `src/components/admin/budgets/AddFromTemplateDialog.tsx`

Editados:
- `src/components/admin/ServicesSection.tsx` → vira shell com Tabs (Clientes | Templates) e roteia para ClientsList ou para a UI atual
- `src/components/admin/BudgetCalculator.tsx` → aceita lista de serviços do cliente em vez dos templates globais
- `src/components/admin/ServiceForm.tsx` → reutilizado para editar tanto template quanto serviço de cliente (prop opcional `clientId`)

Migration:
- Cria `budget_clients` e `client_services` com GRANTs, RLS por `user_id` (do dono do cliente), triggers `updated_at`.

## Fora do escopo (não mexer agora)
- Links compartilháveis públicos (`service_share_links`) continuam apontando para templates globais; podemos migrar depois se quiser.
- Histórico de orçamentos salvos: posso adicionar numa próxima etapa se quiser persistir cada cálculo.
