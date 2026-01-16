# 🏢 ARQUITETURA B2B MULTI-TENANT - XZenPress Corporate

## 📊 VISÃO GERAL

Sistema de gestão de assinaturas corporativas com isolamento de dados por empresa, controle de usuários, métricas individuais e dashboards administrativos.

---

## 🗄️ ESTRUTURA DE BANCO DE DADOS (Supabase)

### **1. Tabela: `companies` (Empresas)**

```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Dados da Empresa
  company_name VARCHAR(255) NOT NULL,
  cnpj VARCHAR(18) UNIQUE NOT NULL,
  trading_name VARCHAR(255),
  industry VARCHAR(100), -- Setor (TI, Saúde, Financeiro, etc)
  company_size VARCHAR(50), -- Pequena, Média, Grande
  
  -- Contato Principal
  primary_contact_name VARCHAR(255) NOT NULL,
  primary_contact_email VARCHAR(255) NOT NULL,
  primary_contact_phone VARCHAR(20),
  
  -- Endereço
  address_street VARCHAR(255),
  address_city VARCHAR(100),
  address_state VARCHAR(2),
  address_zip VARCHAR(10),
  
  -- Assinatura
  subscription_plan VARCHAR(50) NOT NULL, -- 'starter', 'professional', 'enterprise'
  subscription_status VARCHAR(20) DEFAULT 'active', -- 'active', 'suspended', 'cancelled'
  max_users INTEGER NOT NULL DEFAULT 10,
  current_users INTEGER DEFAULT 0,
  
  -- Financeiro
  monthly_price DECIMAL(10,2) NOT NULL,
  billing_cycle VARCHAR(20) DEFAULT 'monthly', -- 'monthly', 'quarterly', 'annual'
  payment_method VARCHAR(50), -- 'boleto', 'credit_card', 'pix'
  
  -- Datas
  contract_start_date TIMESTAMP NOT NULL DEFAULT NOW(),
  contract_end_date TIMESTAMP,
  next_billing_date TIMESTAMP,
  
  -- Configurações
  custom_branding JSONB, -- Logo, cores personalizadas
  features_enabled JSONB, -- Features específicas habilitadas
  
  -- Metadados
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Soft Delete
  deleted_at TIMESTAMP,
  
  CONSTRAINT valid_cnpj CHECK (cnpj ~ '^\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}$')
);

-- Índices
CREATE INDEX idx_companies_cnpj ON companies(cnpj);
CREATE INDEX idx_companies_status ON companies(subscription_status);
CREATE INDEX idx_companies_billing ON companies(next_billing_date);
```

---

### **2. Tabela: `company_users` (Usuários Corporativos)**

```sql
CREATE TABLE company_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relacionamentos
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Dados do Usuário na Empresa
  employee_id VARCHAR(50), -- Matrícula/ID interno da empresa
  department VARCHAR(100), -- RH, TI, Operações, etc
  position VARCHAR(100), -- Cargo
  
  -- Permissões
  role VARCHAR(50) DEFAULT 'user', -- 'admin', 'manager', 'user'
  permissions JSONB, -- Permissões específicas
  
  -- Status
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'suspended'
  
  -- Onboarding
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_completed_at TIMESTAMP,
  
  -- Datas
  joined_at TIMESTAMP DEFAULT NOW(),
  last_active_at TIMESTAMP,
  
  -- Metadados
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(company_id, user_id)
);

-- Índices
CREATE INDEX idx_company_users_company ON company_users(company_id);
CREATE INDEX idx_company_users_user ON company_users(user_id);
CREATE INDEX idx_company_users_status ON company_users(status);
```

---

### **3. Tabela: `user_sessions` (Sessões de Uso)**

```sql
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relacionamentos
  company_id UUID NOT NULL REFERENCES companies(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Dados da Sessão
  session_type VARCHAR(50) NOT NULL, -- 'acupressure', 'breathing', 'sounds', 'protocol'
  session_subtype VARCHAR(100), -- Ponto específico, protocolo, etc
  
  -- Duração
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMP,
  duration_seconds INTEGER,
  
  -- Dados Coletados
  initial_mood INTEGER, -- 1-10
  final_mood INTEGER, -- 1-10
  stress_level_before INTEGER, -- 1-10
  stress_level_after INTEGER, -- 1-10
  
  -- Contexto
  device_type VARCHAR(50), -- 'mobile', 'desktop', 'tablet'
  location VARCHAR(100), -- 'office', 'home', 'commute'
  
  -- Metadados
  session_data JSONB, -- Dados específicos da sessão
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_sessions_company ON user_sessions(company_id);
CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_sessions_date ON user_sessions(started_at);
CREATE INDEX idx_sessions_type ON user_sessions(session_type);
```

---

### **4. Tabela: `company_metrics` (Métricas Agregadas)**

```sql
CREATE TABLE company_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relacionamento
  company_id UUID NOT NULL REFERENCES companies(id),
  
  -- Período
  metric_date DATE NOT NULL,
  metric_type VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly'
  
  -- Métricas de Uso
  total_sessions INTEGER DEFAULT 0,
  total_active_users INTEGER DEFAULT 0,
  total_duration_minutes INTEGER DEFAULT 0,
  avg_session_duration_minutes DECIMAL(10,2),
  
  -- Métricas de Engajamento
  engagement_rate DECIMAL(5,2), -- % de usuários ativos
  retention_rate DECIMAL(5,2), -- % de usuários que retornam
  
  -- Métricas de Bem-estar
  avg_mood_improvement DECIMAL(5,2),
  avg_stress_reduction DECIMAL(5,2),
  
  -- Breakdown por Tipo
  sessions_by_type JSONB, -- {'acupressure': 50, 'breathing': 30, ...}
  
  -- Metadados
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(company_id, metric_date, metric_type)
);

-- Índices
CREATE INDEX idx_metrics_company ON company_metrics(company_id);
CREATE INDEX idx_metrics_date ON company_metrics(metric_date);
```

---

### **5. Tabela: `company_invoices` (Faturas)**

```sql
CREATE TABLE company_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relacionamento
  company_id UUID NOT NULL REFERENCES companies(id),
  
  -- Dados da Fatura
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  
  -- Valores
  subtotal DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  tax DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'overdue', 'cancelled'
  paid_at TIMESTAMP,
  payment_method VARCHAR(50),
  payment_reference VARCHAR(255),
  
  -- Itens
  line_items JSONB, -- Detalhamento dos itens
  
  -- Metadados
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_invoices_company ON company_invoices(company_id);
CREATE INDEX idx_invoices_status ON company_invoices(status);
CREATE INDEX idx_invoices_due_date ON company_invoices(due_date);
```

---

## 🔐 ROW LEVEL SECURITY (RLS)

### **Políticas de Segurança**

```sql
-- Companies: Apenas admins da empresa podem ver
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company admins can view their company"
  ON companies FOR SELECT
  USING (
    id IN (
      SELECT company_id FROM company_users
      WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Company Users: Usuários veem apenas colegas da mesma empresa
ALTER TABLE company_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view colleagues"
  ON company_users FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM company_users WHERE user_id = auth.uid()
    )
  );

-- User Sessions: Usuários veem apenas suas próprias sessões
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
  ON user_sessions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Company admins can view all company sessions"
  ON user_sessions FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM company_users
      WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Company Metrics: Apenas admins da empresa
ALTER TABLE company_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company admins can view metrics"
  ON company_metrics FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM company_users
      WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
    )
  );
```

---

## 🎯 PLANOS DE ASSINATURA

### **Starter (Pequenas Empresas)**
```json
{
  "name": "Starter",
  "max_users": 10,
  "price_per_user": 29.90,
  "min_users": 5,
  "features": {
    "acupressure_points": "basic", // 4 pontos gratuitos
    "breathing_exercises": true,
    "sound_library": "limited", // 3 sons
    "protocols": false,
    "ai_assistant": false,
    "analytics": "basic",
    "support": "email"
  }
}
```

### **Professional (Médias Empresas)**
```json
{
  "name": "Professional",
  "max_users": 50,
  "price_per_user": 24.90,
  "min_users": 11,
  "features": {
    "acupressure_points": "full", // Todos os 66 pontos
    "breathing_exercises": true,
    "sound_library": "full",
    "protocols": "standard", // 8 jornadas
    "ai_assistant": "limited", // 50 consultas/mês
    "analytics": "advanced",
    "support": "priority_email",
    "custom_branding": true
  }
}
```

### **Enterprise (Grandes Empresas)**
```json
{
  "name": "Enterprise",
  "max_users": "unlimited",
  "price_per_user": 19.90,
  "min_users": 51,
  "features": {
    "acupressure_points": "full",
    "breathing_exercises": true,
    "sound_library": "full",
    "protocols": "full", // Todas as 12 jornadas
    "ai_assistant": "unlimited",
    "analytics": "enterprise", // Dashboards customizados
    "support": "dedicated_manager",
    "custom_branding": true,
    "api_access": true,
    "sso": true, // Single Sign-On
    "custom_integrations": true
  }
}
```

---

## 📊 DASHBOARDS

### **1. Dashboard do Administrador da Empresa**

**Métricas Principais:**
- Total de usuários ativos (hoje, semana, mês)
- Taxa de engajamento
- Horas totais de uso
- Melhoria média de bem-estar

**Gráficos:**
- Uso por departamento
- Horários de pico
- Tipos de sessão mais populares
- Evolução do bem-estar ao longo do tempo

**Ações:**
- Adicionar/remover usuários
- Ver relatórios individuais
- Exportar dados (CSV, PDF)
- Configurar branding

### **2. Dashboard do Usuário Corporativo**

**Métricas Pessoais:**
- Minhas sessões (hoje, semana, mês)
- Minha evolução de bem-estar
- Streak (dias consecutivos)
- Conquistas

**Comparação:**
- Minha posição no ranking da empresa (opcional, anônimo)
- Média da empresa vs. minha média

---

## 🔄 FLUXO DE ONBOARDING CORPORATIVO

### **Passo 1: Contrato Fechado**
```
1. Empresa assina contrato
2. Admin XZenPress cria registro em `companies`
3. Gera link de convite único
4. Envia para contato principal da empresa
```

### **Passo 2: Setup Inicial**
```
1. Contato principal acessa link
2. Cria conta (torna-se admin da empresa)
3. Configura branding (logo, cores)
4. Define departamentos
5. Importa lista de colaboradores (CSV)
```

### **Passo 3: Convite aos Colaboradores**
```
1. Sistema envia emails de convite
2. Colaboradores criam contas
3. Associação automática à empresa
4. Onboarding guiado (tour da plataforma)
```

### **Passo 4: Monitoramento**
```
1. Dashboard ativado
2. Métricas começam a ser coletadas
3. Relatórios mensais automáticos
4. Alertas de baixo engajamento
```

---

## 💰 MODELO DE COBRANÇA

### **Cálculo Mensal:**
```typescript
function calculateMonthlyBill(company: Company): number {
  const activeUsers = company.current_users;
  const pricePerUser = getPricePerUser(company.subscription_plan, activeUsers);
  
  const subtotal = activeUsers * pricePerUser;
  const discount = calculateDiscount(company); // Desconto por volume
  const tax = subtotal * 0.05; // 5% de impostos
  
  return subtotal - discount + tax;
}
```

### **Descontos por Volume:**
```
10-20 usuários: 0%
21-50 usuários: 5%
51-100 usuários: 10%
101-200 usuários: 15%
201+ usuários: 20%
```

---

## 📈 MÉTRICAS DE SUCESSO (KPIs)

### **Para a Empresa Cliente:**
1. **Taxa de Adoção:** % de colaboradores que usam a plataforma
2. **Frequência de Uso:** Sessões por usuário por semana
3. **Melhoria de Bem-estar:** Δ stress level médio
4. **ROI:** Redução de absenteísmo × custo da plataforma

### **Para o XZenPress:**
1. **MRR (Monthly Recurring Revenue):** Receita recorrente mensal
2. **Churn Rate:** Taxa de cancelamento
3. **LTV (Lifetime Value):** Valor vitalício do cliente
4. **CAC (Customer Acquisition Cost):** Custo de aquisição

---

## 🛠️ IMPLEMENTAÇÃO TÉCNICA

### **Middleware de Tenant Isolation**

```typescript
// middleware/tenantIsolation.ts
export async function getTenantContext(userId: string) {
  const { data: companyUser } = await supabase
    .from('company_users')
    .select('company_id, role, permissions')
    .eq('user_id', userId)
    .single();
  
  return {
    companyId: companyUser.company_id,
    role: companyUser.role,
    permissions: companyUser.permissions
  };
}

export async function enforceCompanyAccess(
  userId: string,
  requiredCompanyId: string
) {
  const context = await getTenantContext(userId);
  
  if (context.companyId !== requiredCompanyId) {
    throw new Error('Unauthorized: Different company');
  }
  
  return context;
}
```

---

## 📋 PRÓXIMOS PASSOS

1. ✅ **Criar tabelas no Supabase**
2. ✅ **Implementar RLS policies**
3. ✅ **Criar componente CompanyDashboard.tsx**
4. ✅ **Criar componente UserManagement.tsx**
5. ✅ **Implementar sistema de convites**
6. ✅ **Criar relatórios automáticos**
7. ✅ **Integrar com Stripe para cobrança recorrente**

---

**Quer que eu implemente alguma parte específica agora?** 🚀
