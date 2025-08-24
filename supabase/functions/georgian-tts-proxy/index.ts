import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

interface AuthRequest {
  Email: string
  Password: string
  RememberMe: boolean
}

interface SpeechRequest {
  theAudioDataAsBase64: string
  Language: string
  Autocorrect: boolean
  Punctuation: boolean
  Digits: boolean
  Engine?: string
  Model?: string
}

const ENAGRAMM_API_BASE = 'https://enagramm.com/API'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const path = url.pathname.replace('/georgian-tts-proxy', '')
    
    // Extract the action from the path
    const action = path.replace('/', '')

    switch (action) {
      case 'login':
        return await handleLogin(req)
      
      case 'refresh-token':
        return await handleRefreshToken(req)
      
      case 'recognize-speech':
        return await handleRecognizeSpeech(req)
      
      case 'recognize-file':
        return await handleRecognizeFile(req)
      
      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action', action }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
    }
  } catch (error) {
    console.error('Georgian TTS Proxy Error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function handleLogin(req: Request) {
  const body: AuthRequest = await req.json()
  
  const response = await fetch(`${ENAGRAMM_API_BASE}/Account/Login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body)
  })

  const data = await response.json()
  
  return new Response(
    JSON.stringify(data),
    { 
      status: response.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

async function handleRefreshToken(req: Request) {
  const body = await req.json()
  
  const response = await fetch(`${ENAGRAMM_API_BASE}/Account/RefreshToken`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body)
  })

  const data = await response.json()
  
  return new Response(
    JSON.stringify(data),
    { 
      status: response.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

async function handleRecognizeSpeech(req: Request) {
  const georgianToken = req.headers.get('X-Georgian-Token')
  if (!georgianToken) {
    return new Response(
      JSON.stringify({ error: 'Georgian token required' }),
      { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  const body: SpeechRequest = await req.json()
  
  const response = await fetch(`${ENAGRAMM_API_BASE}/STT/RecognizeSpeech`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${georgianToken}`
    },
    body: JSON.stringify(body)
  })

  const data = await response.json()
  
  return new Response(
    JSON.stringify(data),
    { 
      status: response.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

async function handleRecognizeFile(req: Request) {
  const georgianToken = req.headers.get('X-Georgian-Token')
  if (!georgianToken) {
    return new Response(
      JSON.stringify({ error: 'Georgian token required' }),
      { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  // For file upload, we need to handle multipart/form-data
  const formData = await req.formData()
  
  const response = await fetch(`${ENAGRAMM_API_BASE}/STT/RecognizeSpeechFileSubmit`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${georgianToken}`
    },
    body: formData
  })

  const data = await response.json()
  
  return new Response(
    JSON.stringify(data),
    { 
      status: response.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}