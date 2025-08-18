import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Environment variables
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const FLOWISE_CARDIOLOGY_URL = Deno.env.get('FLOWISE_CARDIOLOGY_URL') || "https://flowise-2-0.onrender.com/api/v1/prediction/f8433523-af63-4c53-8db9-63ed3b923f2e"
const FLOWISE_OBGYN_URL = Deno.env.get('FLOWISE_OBGYN_URL') || "https://flowise-2-0.onrender.com/api/v1/prediction/57a1285c-971d-48d4-9519-feb7494afe8b"

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// Specialty endpoints
const FLOWISE_ENDPOINTS = {
  cardiology: FLOWISE_CARDIOLOGY_URL,
  'ob-gyn': FLOWISE_OBGYN_URL,
  'obgyn': FLOWISE_OBGYN_URL,
  default: FLOWISE_CARDIOLOGY_URL
}

// JWT decoder
function decodeSupabaseJWT(token: string) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const payload = JSON.parse(atob(parts[1]))
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.app_metadata?.role || payload.user_metadata?.role,
      specialty: payload.app_metadata?.specialty || payload.user_metadata?.specialty,
      exp: payload.exp
    }
  } catch (error) {
    console.error('JWT decode error:', error)
    return null
  }
}

// Get user profile
async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('medical_specialty, role, specialty')
      .eq('id', userId)
      .single()

    if (!error && data) {
      return {
        specialty: data?.medical_specialty || data?.specialty,
        role: data?.role
      }
    }
    return {}
  } catch (error) {
    console.error('Error getting user profile:', error)
    return {}
  }
}

// Get Flowise config
function getFlowiseConfig(specialty?: string) {
  const normalizedSpecialty = specialty?.toLowerCase().replace(/[^a-z-]/g, '')
  const url = FLOWISE_ENDPOINTS[normalizedSpecialty as keyof typeof FLOWISE_ENDPOINTS] || FLOWISE_ENDPOINTS.default
  
  return {
    url,
    specialty: normalizedSpecialty || 'cardiology'
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔐 Supabase Edge Function: flowise-auth called')

    // Check authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Decode JWT token
    const token = authHeader.replace('Bearer ', '')
    const jwtPayload = decodeSupabaseJWT(token)
    
    if (!jwtPayload) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check token expiration
    if (jwtPayload.exp && Date.now() >= jwtPayload.exp * 1000) {
      return new Response(
        JSON.stringify({ error: 'Token expired' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user profile
    const profile = await getUserProfile(jwtPayload.id)
    const user = {
      ...jwtPayload,
      specialty: profile.specialty || jwtPayload.specialty,
      role: profile.role || jwtPayload.role
    }

    // Get Flowise configuration
    const flowiseConfig = getFlowiseConfig(user.specialty)

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          flowiseUrl: flowiseConfig.url,
          specialty: flowiseConfig.specialty,
          userId: user.id,
          vectorStoreId: null,
          openaiApiKey: Deno.env.get('OPENAI_API_KEY')
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Supabase Edge Function error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})