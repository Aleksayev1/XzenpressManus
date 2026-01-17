import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create client - ready for production
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Log configuration status
if (typeof window !== 'undefined') {
  console.log('🔍 Verificando configuração do Supabase...')
  console.log('URL:', supabaseUrl ? `${supabaseUrl.substring(0, 40)}...` : '❌ NÃO DEFINIDA')
  console.log('Anon Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : '❌ NÃO DEFINIDA')

  if (supabaseUrl && supabaseAnonKey) {
    console.log('✅ Supabase configurado e pronto para uso')
  } else {
    console.error('⚠️ ERRO: Supabase não configurado corretamente!')
    console.error('Verifique se as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão definidas no .env')
  }
}

export interface CorporateLeadData {
  name: string
  position: string
  company: string
  cnpj: string
  email: string
  phone: string
  employees_count: string
  sector: string
  specific_needs?: string
  plan_type: 'corporate' | 'analytics'
  selected_plan: string
  created_at?: string
}

export const submitCorporateLead = async (leadData: CorporateLeadData) => {
  // Check if Supabase is configured
  if (!supabase) {
    console.warn('Supabase not configured. Lead data:', leadData)
    // Simulate success for development
    return {
      success: true,
      data: { id: 'mock-' + Date.now() },
      message: 'Supabase não configurado - dados simulados para desenvolvimento'
    }
  }

  try {
    const { data, error } = await supabase.functions.invoke('handle-corporate-lead', {
      body: leadData
    })

    if (error) {
      throw error
    }

    return { success: true, data }
  } catch (error) {
    console.error('Erro ao enviar lead corporativo:', error)
    throw error
  }
}