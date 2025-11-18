/*
  # Criar tabela de leads corporativos

  1. Nova Tabela
    - `corporate_leads`
      - `id` (uuid, primary key)
      - `name` (text, nome do responsável)
      - `position` (text, cargo)
      - `company` (text, nome da empresa)
      - `cnpj` (text, CNPJ da empresa)
      - `email` (text, email corporativo)
      - `phone` (text, telefone)
      - `employees_count` (text, número de funcionários)
      - `sector` (text, setor da empresa)
      - `specific_needs` (text, necessidades específicas)
      - `plan_type` (text, tipo do plano: corporate ou analytics)
      - `selected_plan` (text, plano selecionado)
      - `status` (text, status do lead)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Segurança
    - Enable RLS na tabela `corporate_leads`
    - Política para permitir inserção pública (formulário)
    - Política para leitura apenas por usuários autenticados (admin)
*/

CREATE TABLE IF NOT EXISTS corporate_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  position text NOT NULL,
  company text NOT NULL,
  cnpj text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  employees_count text NOT NULL,
  sector text,
  specific_needs text,
  plan_type text NOT NULL CHECK (plan_type IN ('corporate', 'analytics')),
  selected_plan text NOT NULL,
  status text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'proposal_sent', 'closed_won', 'closed_lost')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE corporate_leads ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção pública (formulário de contato)
CREATE POLICY "Allow public insert for corporate leads"
  ON corporate_leads
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Política para leitura apenas por usuários autenticados (administradores)
CREATE POLICY "Allow authenticated read for corporate leads"
  ON corporate_leads
  FOR SELECT
  TO authenticated
  USING (true);

-- Política para atualização apenas por usuários autenticados
CREATE POLICY "Allow authenticated update for corporate leads"
  ON corporate_leads
  FOR UPDATE
  TO authenticated
  USING (true);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_corporate_leads_updated_at
    BEFORE UPDATE ON corporate_leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();