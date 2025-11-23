import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface CorporateLeadData {
  name: string
  position: string
  company: string
  cnpj: string
  email: string
  phone: string
  employees_count: string
  sector?: string
  specific_needs?: string
  plan_type: 'corporate' | 'analytics'
  selected_plan: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse request body
    const leadData: CorporateLeadData = await req.json()

    // Validate required fields
    const requiredFields = ['name', 'position', 'company', 'cnpj', 'email', 'phone', 'employees_count', 'plan_type', 'selected_plan']
    const missingFields = requiredFields.filter(field => !leadData[field as keyof CorporateLeadData])
    
    if (missingFields.length > 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Campos obrigatórios faltando', 
          missing_fields: missingFields 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Insert lead into database
    const { data, error } = await supabaseClient
      .from('corporate_leads')
      .insert([leadData])
      .select()

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ error: 'Erro ao salvar lead no banco de dados' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Send email notification (optional - implement if needed)
    try {
      await sendEmailNotification(leadData)
    } catch (emailError) {
      console.error('Email notification failed:', emailError)
      // Don't fail the request if email fails
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Lead corporativo enviado com sucesso!',
        lead_id: data[0]?.id 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function sendEmailNotification(leadData: CorporateLeadData) {
  // Implementar notificação por email se necessário
  // Pode usar Resend, SendGrid, ou outro serviço de email
  console.log('Novo lead corporativo recebido:', leadData.company)
  
  // Exemplo de integração com Resend:
  /*
  const resendApiKey = Deno.env.get('RESEND_API_KEY')
  if (resendApiKey) {
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'noreply@xzenpress.com',
        to: ['corporativo@xzenpress.com'],
        subject: `Novo Lead Corporativo: ${leadData.company}`,
        html: `
          <h2>Novo Lead Corporativo Recebido</h2>
          <p><strong>Empresa:</strong> ${leadData.company}</p>
          <p><strong>Responsável:</strong> ${leadData.name} (${leadData.position})</p>
          <p><strong>Email:</strong> ${leadData.email}</p>
          <p><strong>Telefone:</strong> ${leadData.phone}</p>
          <p><strong>Funcionários:</strong> ${leadData.employees_count}</p>
          <p><strong>Plano:</strong> ${leadData.selected_plan}</p>
          <p><strong>Necessidades:</strong> ${leadData.specific_needs || 'Não informado'}</p>
        `
      })
    })
  }
  */
}