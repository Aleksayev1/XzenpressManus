import { supabase } from '../lib/supabase';
import { BlogPost } from '../types';

export class BlogService {
  /**
   * Busca todos os posts publicados
   */
  static async getPublishedPosts(options?: {
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<BlogPost[]> {
    if (!supabase) {
      console.warn('Supabase não configurado. Retornando posts de exemplo.');
      return this.getMockPosts();
    }

    try {
      let query = supabase
        .from('posts_do_blog')
        .select('*')
        // .eq('published', true)
        .order('published_at', { ascending: false });

      if (options?.category) {
        query = query.eq('category', options.category);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(options.offset, (options.offset + (options.limit || 10)) - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar posts:', error);
        throw error;
      }

      return (data || []).map(this.mapDatabaseToPost);
    } catch (error) {
      console.error('Erro ao buscar posts do blog:', error);
      return this.getMockPosts();
    }
  }

  /**
   * Busca um post específico pelo slug
   */
  static async getPostBySlug(slug: string): Promise<BlogPost | null> {
    if (!supabase) {
      console.warn('Supabase não configurado. Retornando post de exemplo.');
      const mockPosts = this.getMockPosts();
      return mockPosts.find(post => post.slug === slug) || null;
    }

    try {
      const { data, error } = await supabase
        .from('posts_do_blog')
        .select('*')
        .eq('slug', slug)
      // .eq(\'published\', true)        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Post não encontrado
        }
        throw error;
      }

      // Incrementar visualizações
      await this.incrementViews(slug);

      return this.mapDatabaseToPost(data);
    } catch (error) {
      console.error('Erro ao buscar post:', error);
      return null;
    }
  }

  /**
   * Busca categorias disponíveis
   */
  static async getCategories(): Promise<string[]> {
    if (!supabase) {
      return ['acupressao', 'respiracao', 'cromoterapia', 'bem-estar-corporativo', 'saude-mental', 'medicina-tradicional-chinesa'];
    }

    try {
      const { data, error } = await supabase
        .from('posts_do_blog')
        .select('category');

      if (error) {
        throw error;
      }

      const categories = [...new Set(data?.map(item => item.category).filter(Boolean))];
      return categories;
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      return ['acupressao', 'respiracao', 'cromoterapia', 'bem-estar-corporativo', 'saude-mental'];
    }
  }

  /**
   * Incrementa o número de visualizações de um post
   */
  static async incrementViews(slug: string): Promise<void> {
    if (!supabase) return;

    try {
      await supabase.rpc('increment_blog_post_views', { post_slug: slug });
    } catch (error) {
      console.error('Erro ao incrementar visualizações:', error);
    }
  }

  /**
   * Busca posts relacionados baseado na categoria
   */
  static async getRelatedPosts(currentSlug: string, category: string, limit: number = 3): Promise<BlogPost[]> {
    if (!supabase) {
      const mockPosts = this.getMockPosts();
      return mockPosts
        .filter(post => post.slug !== currentSlug && post.category === category)
        .slice(0, limit);
    }

    try {
      const { data, error } = await supabase
        .from('posts_do_blog')
        .select('*')
        .eq('category', category)
        .neq('lesma', currentSlug) // Usando 'lesma' que é o nome da coluna no banco
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return (data || []).map(this.mapDatabaseToPost);
    } catch (error) {
      console.error('Erro ao buscar posts relacionados:', error);
      // Fallback para buscar posts recentes se não houver relacionados na mesma categoria
      try {
        const { data, error } = await supabase
          .from('posts_do_blog')
          .select('*')
          .neq('lesma', currentSlug)
          .order('published_at', { ascending: false })
          .limit(limit);

        if (!error && data) {
          return data.map(this.mapDatabaseToPost);
        }
      } catch (e) {
        console.error('Erro no fallback de posts relacionados:', e);
      }
      return [];
    }
  }



  /**
   * Busca posts por termo de pesquisa
   */
  static async searchPosts(searchTerm: string): Promise<BlogPost[]> {
    if (!supabase) {
      const mockPosts = this.getMockPosts();
      return mockPosts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    try {
      const { data, error } = await supabase
        .from('posts_do_blog')
        .select('*')
        // .eq('published', true)
        .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
        .order('published_at', { ascending: false });

      if (error) {
        throw error;
      }

      return (data || []).map(this.mapDatabaseToPost);
    } catch (error) {
      console.error('Erro ao pesquisar posts:', error);
      return [];
    }
  }

  /**
   * Mapeia dados do banco para o tipo BlogPost
   */
  private static mapDatabaseToPost(data: any): BlogPost {
    return {
      id: data.id,
      title: data.titulo || data.title,
      slug: data.lesma || data.slug,
      content: data.contente || data.content,
      excerpt: data.trecho || data.excerpt,
      author: data.autor || data.author || 'XZenPress',
      authorEmail: data.autor_email || data.author_email || 'aleksayevacupress@gmail.com',
      imageUrl: data.imagem_url || data.image_url,
      category: data.categoria || data.category,
      tags: data.tags || [],
      published: data.publicado !== undefined ? data.publicado : data.published !== undefined ? data.published : true,
      publishedAt: data.publicado_em || data.published_at,
      views: data.visualizacoes || data.views || 0,
      readingTime: data.tempo_leitura || data.reading_time || 5,
      createdAt: data.criado_em || data.created_at,
      updatedAt: data.atualizado_em || data.updated_at,
      isPremium: data.is_premium || data.isPremium || false,

      // Mapeamento de Traduções
      titleEn: data.title_en,
      contentEn: data.content_en,
      excerptEn: data.excerpt_en,

      titleEs: data.title_es,
      contentEs: data.content_es,
      excerptEs: data.excerpt_es,

      titleFr: data.title_fr,
      contentFr: data.content_fr,
      excerptFr: data.excerpt_fr,

      titleIt: data.title_it,
      contentIt: data.content_it,
      excerptIt: data.excerpt_it,

      titleDe: data.title_de,
      contentDe: data.content_de,
      excerptDe: data.excerpt_de,

      titleZh: data.title_zh,
      contentZh: data.content_zh,
      excerptZh: data.excerpt_zh,

      titleJa: data.title_ja,
      contentJa: data.content_ja,
      excerptJa: data.excerpt_ja,

      titleRu: data.title_ru,
      contentRu: data.content_ru,
      excerptRu: data.excerpt_ru,

      titleHi: data.title_hi,
      contentHi: data.content_hi,
      excerptHi: data.excerpt_hi,

      titleAr: data.title_ar,
      contentAr: data.content_ar,
      excerptAr: data.excerpt_ar,

      titleBn: data.title_bn,
      contentBn: data.content_bn,
      excerptBn: data.excerpt_bn
    };
  }

  /**
   * Posts de exemplo para quando Supabase não está configurado
   */
  private static getMockPosts(): BlogPost[] {
    return [
      /*
      {
        id: 'natal-2025',
        title: 'Legado de um Natal: 8.000 Dias para Mudar o Mundo',
        slug: 'legado-natal-8000-dias-mudar-mundo',
        content: `# Legado de um Natal...`,
        excerpt: 'Vivemos em um mundo global...',
        author: 'Alexandre Pinheiro',
        authorEmail: 'aleksayevacupress@gmail.com',
        imageUrl: '/Logo Xzenpress Natal.png',
        category: 'bem-estar-corporativo',
        tags: ['natal', 'propósito', 'legado', 'heróis', '8000-dias'],
        published: true,
        publishedAt: new Date().toISOString(),
        views: 0,
        readingTime: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      */
      {
        id: '1',
        title: '5 Pontos de Acupressão para Aliviar o Estresse Diário',
        slug: '5-pontos-acupressao-estresse-diario',
        content: `# 5 Pontos de Acupressão para Aliviar o Estresse Diário

O estresse é uma realidade constante na vida moderna. Felizmente, a Medicina Tradicional Chinesa oferece técnicas simples e eficazes para combatê-lo através da acupressão.

## 1. Yintang (EX-HN3) - O Ponto da Tranquilidade

Localizado entre as sobrancelhas, este ponto é conhecido como o "terceiro olho" na medicina chinesa. É extremamente eficaz para:

- Reduzir ansiedade imediata
- Acalmar a mente agitada
- Melhorar a concentração
- Aliviar dores de cabeça tensionais

**Como aplicar:** Pressione suavemente com o dedo médio por 1-2 minutos, respirando profundamente.

## 2. Shenmen (C7) - Portal do Espírito

Este ponto, localizado na dobra do punho do lado do dedo mínimo, é fundamental para:

- Equilibrar as emoções
- Reduzir palpitações cardíacas
- Melhorar a qualidade do sono
- Acalmar a ansiedade

**Como aplicar:** Pressione firmemente por 2-3 minutos em cada punho.

## 3. Laogong (PC8) - Palácio do Trabalho

No centro da palma da mão, este ponto é ideal para:

- Controlar ataques de pânico
- Reduzir sudorese excessiva
- Equilibrar a energia do coração
- Promover relaxamento imediato

**Como aplicar:** Pressione com o polegar da outra mão por 2-3 minutos.

## 4. Baihui (VG20) - Cem Reuniões

No topo da cabeça, este ponto mestre ajuda a:

- Elevar o humor
- Combater a fadiga mental
- Melhorar a clareza mental
- Fortalecer a energia vital

**Como aplicar:** Pressione suavemente o topo da cabeça por 2 minutos.

## 5. Yongquan (R1) - Fonte Borbulhante

Na sola do pé, este ponto de ancoragem é perfeito para:

- Acalmar a mente hiperativa
- Reduzir vertigens
- Promover o enraizamento energético
- Melhorar o sono

**Como aplicar:** Pressione firmemente a sola do pé por 3-5 minutos.

## Dica Extra: Combine com Respiração 4-7-8

Para potencializar os efeitos, combine a acupressão com a técnica de respiração 4-7-8:
- 4 segundos inspirando
- 7 segundos segurando
- 8 segundos expirando

Esta combinação ativa o sistema parassimpático e amplifica os benefícios terapêuticos.

## Conclusão

A acupressão é uma ferramenta poderosa e acessível para o gerenciamento do estresse. Pratique estes pontos regularmente e observe como sua qualidade de vida melhora significativamente.

*Experimente estes pontos na nossa plataforma XZenPress com timer integrado e cromoterapia!*`,
        excerpt: 'Descubra 5 pontos de acupressão fundamentais para combater o estresse diário de forma natural e eficaz.',
        author: 'Dr. XZenPress',
        authorEmail: 'aleksayevacupress@gmail.com',
        imageUrl: '/Logo Xzenpress oficial.png',
        category: 'acupressao',
        tags: ['acupressão', 'estresse', 'ansiedade', 'medicina-tradicional-chinesa'],
        published: true,
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        isPremium: false,
        views: 1247,
        readingTime: 8,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),

        // Traduções
        titleEn: '5 Acupressure Points to Relieve Daily Stress',
        excerptEn: 'Discover 5 key acupressure points to combat daily stress naturally and effectively.',
        contentEn: '# 5 Acupressure Points to Relieve Daily Stress\n\nStress is a constant reality in modern life. Fortunately, Traditional Chinese Medicine offers simple and effective techniques to combat it through acupressure.\n\n## 1. Yintang (EX-HN3)\nLocated between the eyebrows, this point is known as the "third eye". It is extremely effective for reducing anxiety and calming the mind.\n\n## 2. Shenmen (C7)\nLocated at the wrist crease, this point is fundamental for balancing emotions and improving sleep quality.\n\n## 3. Laogong (PC8)\nIn the center of the palm, this point is ideal for controlling panic attacks and promoting immediate relaxation.',

        titleEs: '5 Puntos de Acupresión para Aliviar el Estrés Diario',
        excerptEs: 'Descubre 5 puntos clave de acupresión para combatir el estrés diario de forma natural y efectiva.',
        contentEs: '# 5 Puntos de Acupresión para Aliviar el Estrés Diario\n\nEl estrés es una realidad constante en la vida moderna. Afortunadamente, la Medicina Tradicional China ofrece técnicas simples y efectivas para combatirlo.\n\n## 1. Yintang (EX-HN3)\nUbicado entre las cejas, este punto es conocido como el "tercer ojo". Es extremadamente efectivo para reducir la ansiedad.\n\n## 2. Shenmen (C7)\nUbicado en el pliegue de la muñeca, es fundamental para equilibrar las emociones.\n\n## 3. Laogong (PC8)\nEn el centro de la palma, ideal para controlar ataques de pánico.',

        titleZh: '缓解日常压力的5个指压点',
        excerptZh: '探索5个关键的指压点，自然有效地对抗日常压力。',
        contentZh: '# 缓解日常压力的5个指压点\n\n压力是现代生活中不变的现实。幸运的是，中医提供了简单有效的指压技术来对抗它。\n\n## 1. 印堂 (Yintang)\n位于眉间，被称为"第三只眼"。对减轻焦虑非常有效。'
      },
      {
        id: 'memoria-da-agua-consciencia',
        title: 'A Memória da Água e o Poder da Intenção',
        slug: 'memoria-da-agua-consciencia',
        content: `# A Memória da Água e o Poder da Intenção: Uma Jornada de Evolução

Você sabia que somos compostos por aproximadamente **75% de água**?

Essa substância fundamental não é apenas um veículo para hidratação física, mas um condutor de energia, vibração e, possivelmente, consciência.

## A Ciência por trás do Sal Integral

Muitos bebem "água morta" sem saber. A água filtrada comum, muitas vezes, perde seus minerais essenciais. É aqui que entra a importância do **Sal Integral (ou Sal Rosa do Himalaia)**.

Diferente do sal refinado (que é apenas cloreto de sódio isolado e inflamatório), o sal integral contém mais de **80 minerais** necessários para a condução elétrica no nosso corpo. Uma pitada na água devolve a ela a capacidade de nutrir nossas células eletricamente.

## Dr. Masaru Emoto e os Cristais de Água

O cientista japonês **Dr. Masaru Emoto** revolucionou nossa compreensão sobre a água. Em seus experimentos, ele expôs a água a diferentes palavras, músicas e intenções antes de congelá-la.

O resultado foi chocante:
- **Água exposta a "Amor e Gratidão":** Formou cristais geométricos perfeitos e belíssimos.
- **Água exposta a "Ódio e Você me enoja":** Formou estruturas caóticas e desarmônicas.

Se a água reage assim às palavras, imagine o que seus pensamentos fazem com a água dentro do **seu** corpo?

## O Experimento do Arroz

Qualquer um pode fazer este teste em casa. Coloque arroz cozido em dois potes limpos:
1. No Pote A, diga "Eu te amo, obrigado" todos os dias.
2. No Pote B, diga "Você é inútil, idiota" todos os dias.

Em poucas semanas, o arroz do Pote A geralmente fermenta com um cheiro agradável, enquanto o do Pote B apodrece e fica preto. É a prova física do poder da nossa energia.

## Bioeletrografia: A Prova dos Fótons

Nós somos seres de luz. Literalmente.

![Bioeletrografia GDV mostrando emissão de energia](/bioelectrografia-gdv.png)

A imagem acima, capturada através de **Bioeletrografia GDV (Gas Discharge Visualization)** de última geração, mostra a emissão de fótons (luz/energia) da ponta de um dedo humano enquanto a pessoa emana boas energias.

Não é misticismo, é física. Nós emitimos um campo bioelétrico que afeta tudo ao nosso redor.

## Evolução: O Nosso Propósito

Estamos aqui na Terra com um "timer". Nossa passagem é temporária. O objetivo de tudo isso? **Evoluir.**

Fazer da nossa relação conosco mesmos e com as pessoas do planeta a melhor possível. Energizar nossa água interna com bons pensamentos, nutrir nosso corpo com água de qualidade e emanar luz para o mundo não é apenas "saudável", é nossa responsabilidade espiritual e biofísica.

Beba água. Emane amor. Evolua.`,
        excerpt: 'Descubra como a ciência do Dr. Emoto, a bioeletrografia e a hidratação correta provam que somos condutores de energia e que nossa missão é evoluir.',
        author: 'Alexandre Pinheiro',
        authorEmail: 'aleksayevacupress@gmail.com',
        imageUrl: '/bioelectrografia-gdv.png',
        category: 'saude-mental',
        tags: ['agua', 'dr-emoto', 'espiritualidade', 'bioeletrografia', 'consciencia'],
        published: true,
        publishedAt: new Date().toISOString(),
        isPremium: false,
        views: 0,
        readingTime: 6,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Respiração 4-7-8: A Técnica Científica para Ansiedade',
        slug: 'respiracao-4-7-8-tecnica-cientifica-ansiedade',
        content: `# Respiração 4-7-8: A Técnica Científica para Ansiedade

A técnica de respiração 4-7-8, desenvolvida pelo Dr. Andrew Weil, é baseada em práticas antigas de pranayama e tem comprovação científica para redução da ansiedade.

## Como Funciona a Ciência

### Sistema Nervoso Parassimpático
A respiração controlada ativa o sistema nervoso parassimpático, responsável pelo relaxamento e recuperação do corpo.

### Redução do Cortisol
Estudos mostram que a prática regular reduz os níveis de cortisol, o hormônio do estresse.

### Melhoria da Variabilidade da Frequência Cardíaca
A técnica melhora a VFC, indicador de saúde cardiovascular e resiliência ao estresse.

## A Técnica Passo a Passo

### 1. Preparação
- Sente-se confortavelmente
- Coloque a língua atrás dos dentes superiores
- Expire completamente pela boca

### 2. Ciclo de Respiração
1. **Inspire pelo nariz por 4 segundos**
2. **Segure a respiração por 7 segundos**
3. **Expire pela boca por 8 segundos**

### 3. Repetição
- Repita o ciclo 4-8 vezes
- Pratique 2-3 vezes por dia

## Benefícios Comprovados

### Redução da Ansiedade
- 78% dos praticantes relatam redução significativa da ansiedade
- Efeito perceptível já na primeira sessão

### Melhoria do Sono
- 85% melhoram a qualidade do sono
- Redução do tempo para adormecer

### Controle da Pressão Arterial
- Redução média de 10-15 mmHg na pressão sistólica
- Melhoria da função cardiovascular

## Cromoterapia Integrada

No XZenPress, combinamos a respiração 4-7-8 com cromoterapia:

### Azul (Inspiração - 4s)
- Ativa o sistema parassimpático
- Reduz a pressão arterial
- Promove calma mental

### Verde (Retenção - 7s)
- Equilibra o sistema nervoso
- Harmoniza as emoções
- Estabiliza a energia

### Roxo (Expiração - 8s)
- Estimula a liberação de endorfinas
- Promove relaxamento profundo
- Facilita a liberação de tensões

## Quando Praticar

### Momentos Ideais
- Ao acordar (para começar o dia centrado)
- Antes de reuniões importantes
- Durante pausas no trabalho
- Antes de dormir

### Situações de Emergência
- Ataques de ansiedade
- Momentos de estresse agudo
- Insônia
- Irritabilidade

## Dicas Avançadas

### Combine com Acupressão
Pratique enquanto pressiona o ponto Yintang para potencializar os efeitos.

### Use Sons Harmonizantes
Adicione sons da natureza ou frequências binaurais para amplificar o relaxamento.

### Mantenha Regularidade
A prática consistente é mais importante que sessões longas esporádicas.

## Conclusão

A respiração 4-7-8 é uma ferramenta poderosa, gratuita e sempre disponível para o gerenciamento da ansiedade e estresse. Com a prática regular, torna-se um reflexo natural em momentos de tensão.

*Experimente agora na nossa plataforma com timer visual e cromoterapia integrada!*`,
        excerpt: 'Aprenda a técnica de respiração 4-7-8 com base científica para reduzir ansiedade e melhorar o bem-estar.',
        author: 'Equipe XZenPress',
        authorEmail: 'aleksayevacupress@gmail.com',
        imageUrl: '/Logo Xzenpress oficial.png',
        category: 'respiracao',
        tags: ['respiração', '4-7-8', 'ansiedade', 'ciência', 'bem-estar'],
        published: true,
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        isPremium: false,
        views: 892,
        readingTime: 6,
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        title: 'Lei 14.831/2024: Como Sua Empresa Pode Se Tornar Promotora da Saúde Mental',
        slug: 'lei-14831-2024-empresa-promotora-saude-mental',
        content: `# Lei 14.831/2024: Como Sua Empresa Pode Se Tornar Promotora da Saúde Mental

A Lei 14.831/2024 representa um marco na legislação brasileira sobre saúde mental no ambiente de trabalho. Entenda como sua empresa pode se beneficiar e se adequar.

## O que é a Lei 14.831/2024?

Esta lei estabelece diretrizes para que empresas se tornem **Empresas Promotoras da Saúde Mental**, criando um ambiente de trabalho mais saudável e produtivo.

### Principais Objetivos
- Reduzir o estresse ocupacional
- Prevenir transtornos mentais relacionados ao trabalho
- Promover bem-estar psicológico dos colaboradores
- Criar ambientes de trabalho mais humanizados

## Benefícios para as Empresas

### 1. Certificação Oficial
- Selo de Empresa Promotora da Saúde Mental
- Reconhecimento governamental
- Diferencial competitivo no mercado

### 2. Benefícios Fiscais
- Possíveis incentivos fiscais
- Redução de custos com afastamentos
- Menor rotatividade de funcionários

### 3. Melhoria do Clima Organizacional
- Aumento da produtividade
- Redução do absenteísmo
- Melhoria da imagem corporativa

## Como Se Adequar à Lei

### 1. Avaliação de Riscos Psicossociais
- Identificar fatores de estresse no ambiente de trabalho
- Mapear situações de risco para a saúde mental
- Documentar condições atuais

### 2. Implementação de Programas de Bem-estar
- Técnicas de relaxamento e mindfulness
- Programas de gestão do estresse
- Atividades de promoção da saúde mental

### 3. Treinamento e Capacitação
- Treinar líderes para identificar sinais de estresse
- Capacitar RH para lidar com questões de saúde mental
- Educar colaboradores sobre autocuidado

### 4. Monitoramento e Métricas
- Acompanhar indicadores de bem-estar
- Medir efetividade dos programas
- Gerar relatórios de conformidade

## Como o XZenPress Ajuda

### Compliance Completo
Nossa plataforma foi desenvolvida especificamente para atender aos requisitos da Lei 14.831/2024:

#### Programas Baseados em Evidências
- Acupressão MTC com base científica
- Respiração 4-7-8 com estudos comprobatórios
- Cromoterapia com fundamentação neurocientífica

#### Métricas e Relatórios
- Dashboard de acompanhamento
- Relatórios de uso e efetividade
- Métricas de engajamento dos colaboradores

#### Treinamento Integrado
- Conteúdo educativo sobre bem-estar
- Tutoriais de técnicas terapêuticas
- Suporte especializado

## Implementação Prática

### Fase 1: Diagnóstico (Semanas 1-2)
1. Avaliação do ambiente atual
2. Identificação de fatores de risco
3. Mapeamento de necessidades específicas

### Fase 2: Implementação (Semanas 3-6)
1. Lançamento da plataforma XZenPress
2. Treinamento inicial dos colaboradores
3. Configuração de métricas e relatórios

### Fase 3: Monitoramento (Contínuo)
1. Acompanhamento de indicadores
2. Ajustes baseados em feedback
3. Relatórios de conformidade

## ROI Esperado

### Redução de Custos
- 40% menos afastamentos por estresse
- 25% redução na rotatividade
- 30% menos gastos com planos de saúde

### Aumento de Produtividade
- 60% melhoria no engajamento
- 35% aumento na satisfação no trabalho
- 20% melhoria na performance geral

## Próximos Passos

1. **Avalie sua situação atual** em relação à saúde mental corporativa
2. **Entre em contato** com nossa equipe para uma consultoria gratuita
3. **Implemente** um programa piloto com o XZenPress
4. **Monitore** os resultados e ajuste conforme necessário

A adequação à Lei 14.831/2024 não é apenas uma obrigação legal, mas uma oportunidade de transformar sua empresa em um ambiente mais saudável e produtivo.

*Quer saber como implementar? Entre em contato conosco para uma consultoria personalizada!*`,
        excerpt: 'Entenda como a Lei 14.831/2024 pode transformar sua empresa em uma Promotora da Saúde Mental e os benefícios práticos dessa adequação.',
        author: 'Consultoria XZenPress',
        authorEmail: 'aleksayevacupress@gmail.com',
        imageUrl: '/Logo Xzenpress oficial.png',
        category: 'bem-estar-corporativo',
        tags: ['lei-14831', 'saúde-mental', 'corporativo', 'compliance', 'nr-1'],
        published: true,
        publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        views: 634,
        readingTime: 12,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        isPremium: false,
      },
      {
        id: '4',
        title: 'Cromoterapia: Como as Cores Afetam Nosso Bem-estar',
        slug: 'cromoterapia-cores-afetam-bem-estar',
        content: `# Cromoterapia: Como as Cores Afetam Nosso Bem-estar

A cromoterapia, ou terapia das cores, é uma prática terapêutica que utiliza as diferentes frequências de luz colorida para promover equilíbrio físico, mental e emocional.

## Base Científica da Cromoterapia

### Neurociência das Cores
Pesquisas em neurociência mostram que diferentes cores estimulam áreas específicas do cérebro:

- **Azul:** Ativa o córtex pré-frontal, promovendo calma
- **Verde:** Equilibra o sistema nervoso autônomo
- **Vermelho:** Estimula o sistema simpático e aumenta energia
- **Roxo:** Ativa a glândula pineal, melhorando o humor

### Efeitos Fisiológicos
As cores influenciam diretamente:
- Produção de hormônios
- Pressão arterial
- Frequência cardíaca
- Ondas cerebrais

## Cores Terapêuticas Principais

### 🔵 Azul - A Cor da Tranquilidade
**Efeitos:**
- Reduz pressão arterial
- Diminui ansiedade
- Melhora concentração
- Promove relaxamento

**Quando usar:**
- Momentos de estresse
- Dificuldade para dormir
- Hiperatividade mental
- Pressão alta

### 🟢 Verde - A Cor do Equilíbrio
**Efeitos:**
- Equilibra emoções
- Harmoniza energia
- Reduz fadiga ocular
- Promove recuperação

**Quando usar:**
- Desequilíbrios emocionais
- Fadiga mental
- Necessidade de renovação
- Processos de bem-estar

### 🟣 Roxo - A Cor da Transformação
**Efeitos:**
- Estimula criatividade
- Melhora intuição
- Promove transformação
- Eleva espiritualidade

**Quando usar:**
- Bloqueios criativos
- Necessidade de mudança
- Desenvolvimento pessoal
- Meditação profunda

### 🟡 Amarelo - A Cor da Energia
**Efeitos:**
- Aumenta energia mental
- Melhora humor
- Estimula digestão
- Promove otimismo

**Quando usar:**
- Depressão leve
- Falta de energia
- Problemas digestivos
- Necessidade de motivação

## Aplicação Prática no XZenPress

### Respiração 4-7-8 com Cromoterapia
Nossa plataforma sincroniza cores específicas com cada fase da respiração:

1. **Inspiração (4s) - Azul Intenso**
   - Ativa o parassimpático
   - Prepara para relaxamento

2. **Retenção (7s) - Verde Profundo**
   - Equilibra o sistema nervoso
   - Harmoniza energias

3. **Expiração (8s) - Roxo Vibrante**
   - Libera tensões
   - Promove transformação

### Acupressão com Cores
Cada ponto de acupressão pode ser potencializado com cores específicas:
- **Yintang + Azul:** Para ansiedade
- **Laogong + Verde:** Para equilíbrio emocional
- **Baihui + Amarelo:** Para energia mental

## Estudos e Pesquisas

### Pesquisa Hospitalar (2019)
Estudo com 200 pacientes mostrou:
- 65% redução na ansiedade pré-cirúrgica
- 40% melhoria na qualidade do sono
- 55% redução no uso de ansiolíticos

### Estudo Corporativo (2021)
Implementação em empresa de 500 funcionários:
- 45% redução no estresse ocupacional
- 30% melhoria no clima organizacional
- 25% redução em afastamentos

## Como Começar

### Para Uso Pessoal
1. Identifique sua necessidade principal
2. Escolha a cor correspondente
3. Pratique 10-15 minutos diários
4. Observe os efeitos ao longo de uma semana

### Para Empresas
1. Avalie o perfil de estresse da equipe
2. Implemente sessões de cromoterapia
3. Monitore indicadores de bem-estar
4. Ajuste cores baseado nos resultados

## Precauções e Contraindicações

### Cuidados Especiais
- Pessoas com epilepsia fotossensível
- Enxaquecas desencadeadas por luz
- Transtornos bipolares em fase maníaca

### Uso Responsável
- Comece com sessões curtas (5-10 minutos)
- Observe reações individuais
- Consulte profissional se necessário

## Conclusão

A cromoterapia é uma ferramenta poderosa e não invasiva para promover bem-estar. Quando combinada com técnicas como respiração e acupressão, seus efeitos são potencializados significativamente.

*Experimente a cromoterapia integrada na nossa plataforma XZenPress!*`,
        excerpt: 'Descubra como a cromoterapia funciona cientificamente e como as cores podem ser usadas terapeuticamente para melhorar seu bem-estar.',
        author: 'Dr. Terapia Integrativa',
        authorEmail: 'aleksayevacupress@gmail.com',
        imageUrl: 'https://dqjcbwjqrenubdzalicy.supabase.co/storage/v1/object/public/acupressure-images/Logo-Xzenpress-oficial.png',
        category: 'cromoterapia',
        tags: ['cromoterapia', 'cores', 'terapia', 'neurociência', 'bem-estar'],
        published: true,
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        views: 456,
        readingTime: 10,
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        isPremium: true,
      },
      {
        id: '5',
        title: 'Vida Após a Morte: Argumentos Científicos Contra o Suicídio',
        slug: 'vida-apos-morte-argumentos-cientificos-contra-suicidio',
        content: `# Vida Após a Morte: Argumentos Científicos Contra o Suicídio\n\nUma análise profunda sobre a continuidade da consciência e as implicações do suicídio sob uma perspectiva científica e espiritual.\n\n## A Continuidade da Consciência\nEstudos de Experiência de Quase Morte (EQM) sugerem que a consciência pode persistir além da morte física.\n\n## O Impacto do Suicídio\nO suicídio não encerra o sofrimento, apenas transfere a consciência para outro estado, muitas vezes carregando as mesmas angústias.\n\n## Busque Ajuda\nSe você está passando por um momento difícil, saiba que não está sozinho. A vida é preciosa e há soluções para o seu sofrimento.`,
        excerpt: 'Uma análise científica e espiritual sobre a continuidade da vida e por que o suicídio não é a solução.',
        author: 'Dr. XZenPress',
        authorEmail: 'aleksayevacupress@gmail.com',
        imageUrl: '/Logo Xzenpress oficial.png',
        category: 'saude-mental',
        tags: ['prevenção', 'suicídio', 'espiritualidade', 'ciência'],
        published: true,
        publishedAt: new Date().toISOString(),
        views: 1543,
        readingTime: 15,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPremium: false,

        // Traduções
        titleEn: 'Life After Death: Scientific Arguments Against Suicide',
        excerptEn: 'A deep analysis on the continuity of consciousness and the implications of suicide under a scientific and spiritual perspective.',
        contentEn: '# Life After Death: Scientific Arguments Against Suicide\n\nA deep analysis on the continuity of consciousness.\n\n## The Continuity of Consciousness\nNear-Death Experience (NDE) studies suggest that consciousness may persist beyond physical death.\n\n## The Impact of Suicide\nSuicide does not end suffering, it only transfers consciousness to another state.',

        titleEs: 'Vida Después de la Muerte: Argumentos Científicos Contra el Suicidio',
        excerptEs: 'Un análisis profundo sobre la continuidad de la conciencia y las implicaciones del suicidio bajo una perspectiva científica y espiritual.',
        contentEs: '# Vida Después de la Muerte: Argumentos Científicos Contra el Suicidio\n\nUn análisis profundo sobre la continuidad de la conciencia.\n\n## La Continuidad de la Conciencia\nEstudios de Experiencia Cercana a la Muerte (ECM) sugieren que la conciencia puede persistir más allá de la muerte física.\n\n## El Impacto del Suicidio\nEl suicidio no termina con el sufrimiento, solo transfiere la conciencia a otro estado.',

        titleZh: '死后的生活：反对自杀的科学论据',
        excerptZh: '从科学和精神的角度深入分析意识的连续性和自杀的影响。',
        contentZh: '# 死后的生活：反对自杀的科学论据\n\n深入分析意识的连续性。\n\n## 意识的连续性\n濒死体验 (NDE) 研究表明，意识可能会在肉体死亡后继续存在。\n\n## 自杀的影响\n自杀并不能结束痛苦，它只是将意识转移到另一种状态。'
      }
    ];
  }
}