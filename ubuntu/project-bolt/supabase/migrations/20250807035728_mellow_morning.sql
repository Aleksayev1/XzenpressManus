/*
  # Criar tabela de histórico de sessões

  1. Nova Tabela
    - `session_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key para auth.users)
      - `session_type` (text, tipo da sessão: breathing, acupressure, chromotherapy)
      - `duration_seconds` (integer, duração em segundos)
      - `effectiveness_rating` (numeric, avaliação 1-5)
      - `points_used` (text array, IDs dos pontos de acupressão usados)
      - `session_data` (jsonb, dados adicionais da sessão)
      - `completed_at` (timestamp, quando foi completada)
      - `created_at` (timestamp, criação do registro)

  2. Segurança
    - Enable RLS na tabela `session_history`
    - Política para usuários inserirem suas próprias sessões
    - Política para usuários lerem apenas suas próprias sessões

  3. Índices
    - Índice em user_id para consultas rápidas
    - Índice em completed_at para ordenação temporal
*/

CREATE TABLE IF NOT EXISTS session_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_type text NOT NULL CHECK (session_type IN ('breathing', 'acupressure', 'chromotherapy', 'integrated')),
  duration_seconds integer NOT NULL CHECK (duration_seconds > 0),
  effectiveness_rating numeric(2,1) CHECK (effectiveness_rating >= 1.0 AND effectiveness_rating <= 5.0),
  points_used text[] DEFAULT '{}',
  session_data jsonb DEFAULT '{}',
  completed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE session_history ENABLE ROW LEVEL SECURITY;

-- Política para usuários inserirem suas próprias sessões
CREATE POLICY "Users can insert own sessions"
  ON session_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Política para usuários lerem apenas suas próprias sessões
CREATE POLICY "Users can read own sessions"
  ON session_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Política para usuários atualizarem suas próprias sessões (para avaliações posteriores)
CREATE POLICY "Users can update own sessions"
  ON session_history
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_session_history_user_id ON session_history(user_id);
CREATE INDEX IF NOT EXISTS idx_session_history_completed_at ON session_history(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_session_history_user_completed ON session_history(user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_session_history_type ON session_history(session_type);

-- Trigger para atualizar created_at automaticamente
CREATE OR REPLACE FUNCTION update_session_history_created_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.created_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_session_history_created_at_trigger
    BEFORE UPDATE ON session_history
    FOR EACH ROW
    EXECUTE FUNCTION update_session_history_created_at();