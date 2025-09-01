import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

interface SpeechRequest {
  theAudioDataAsBase64: string
  Language: string
  Autocorrect: boolean
  Punctuation: boolean
  Digits: boolean
  Engine?: string
  Model?: string
  Speakers?: number  // Added for speaker diarization
  enableSpeakerDiarization?: boolean  // Flag to enable speaker detection
}

interface AuthResponse {
  Success: boolean
  ErrorCode: string
  Error: string
  Message: string
  AccessToken: string
  RefreshToken: string
  Email: string
  PackageID: number
}

interface SpeechResponse {
  Success: boolean
  ErrorCode: string
  Error: string
  Message: string
  Text: string
  WordsCount: number
  VoiceFilePath: string
}

interface SpeakerSegment {
  Speaker: string
  Text: string
  CanBeMultiple: boolean
  StartSeconds: number
  EndSeconds: number
}

interface SpeakerDiarizationResponse {
  Success: boolean
  ErrorCode: string
  Error: string
  Message: string
  lstSpeakers: SpeakerSegment[]
  VoiceFilePath: string
}

const ENAGRAMM_API_BASE = 'https://enagramm.com/API'

// Global token storage (in-memory for this instance)
let cachedAccessToken: string | null = null
let tokenExpiryTime: number | null = null

async function getValidToken(): Promise<string> {
  // Check if we have a valid cached token
  if (cachedAccessToken && tokenExpiryTime && Date.now() < (tokenExpiryTime - 60000)) {
    console.log('🎯 Using cached token')
    return cachedAccessToken
  }

  console.log('🔑 Getting fresh Enagramm token...')
  
  // Login to get fresh token
  const loginResponse = await fetch('https://enagramm.com/API/Account/Login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      Email: 'Lasha.khosht@gmail.com',
      Password: 'Dba545c5fde36242@',
      RememberMe: true
    })
  })

  if (!loginResponse.ok) {
    const errorText = await loginResponse.text()
    console.error('❌ Login failed:', errorText)
    throw new Error(`Login failed: ${loginResponse.status} - ${errorText}`)
  }

  const loginData: AuthResponse = await loginResponse.json()
  
  if (!loginData.Success || !loginData.AccessToken) {
    console.error('❌ Invalid login response:', loginData)
    throw new Error(`Login failed: ${loginData.Error || loginData.Message || 'Unknown error'}`)
  }

  // Cache the token with 29-minute expiry (tokens expire in 30 minutes)
  cachedAccessToken = loginData.AccessToken
  tokenExpiryTime = Date.now() + (29 * 60 * 1000)
  
  console.log('✅ Fresh token obtained')
  return cachedAccessToken
}

// Helper function to convert base64 to blob for file upload
function base64ToBlob(base64Data: string, mimeType: string): Blob {
  const byteCharacters = atob(base64Data)
  const byteNumbers = new Array(byteCharacters.length)
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  
  const byteArray = new Uint8Array(byteNumbers)
  return new Blob([byteArray], { type: mimeType })
}

// Format speaker-diarized transcript for display
function formatSpeakerTranscript(speakers: SpeakerSegment[]): string {
  if (!speakers || speakers.length === 0) {
    return ''
  }

  // Sort by start time to ensure chronological order
  const sortedSpeakers = speakers.sort((a, b) => a.StartSeconds - b.StartSeconds)
  
  return sortedSpeakers
    .map(segment => `${segment.Speaker}: ${segment.Text}`)
    .join('\n\n')
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  try {
    const body: SpeechRequest = await req.json()
    
    console.log('📨 Received JSON request:', {
      audioSize: body.theAudioDataAsBase64?.length || 0,
      Language: body.Language,
      Autocorrect: body.Autocorrect,
      Punctuation: body.Punctuation,
      Digits: body.Digits,
      Speakers: body.Speakers,
      enableSpeakerDiarization: body.enableSpeakerDiarization
    })

    // Get valid token (cached or fresh)
    let accessToken: string
    try {
      accessToken = await getValidToken()
    } catch (error) {
      console.error('💥 Token acquisition failed:', error)
      
      // Check if this is a connection refused error (service down)
      const isConnectionRefused = error.message.includes('Connection refused') || 
                                 error.message.includes('ECONNREFUSED') ||
                                 error.code === 'ECONNREFUSED'
      
      if (isConnectionRefused) {
        return new Response(
          JSON.stringify({ 
            error: 'Service temporarily unavailable',
            message: 'The Georgian TTS service (enagramm.com) is currently unavailable. Please try again later.',
            details: 'This is likely a temporary service outage. The service should be back online shortly.',
            suggestion: 'You can try again in a few minutes or contact support if the issue persists.'
          }),
          { 
            status: 503, // Service Unavailable
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
      
      return new Response(
        JSON.stringify({ 
          error: 'Authentication failed',
          message: error.message,
          suggestion: 'Please verify your credentials and try again.'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Check if speaker diarization is requested - with detailed debugging
    console.log('🎭 Speaker diarization condition check:', {
      enableSpeakerDiarization: body.enableSpeakerDiarization,
      speakersValue: body.Speakers,
      speakersType: typeof body.Speakers,
      speakersGreaterThan1: body.Speakers > 1,
      allConditions: {
        hasEnableSpeakerDiarization: !!body.enableSpeakerDiarization,
        hasSpeakers: !!body.Speakers,
        speakersGreaterThan1: body.Speakers > 1
      },
      finalCondition: body.enableSpeakerDiarization === true && body.Speakers && body.Speakers >= 2
    })
    
    if (body.enableSpeakerDiarization === true && body.Speakers && body.Speakers >= 2) {
      console.log('🎭 Speaker diarization requested, using file upload endpoint...', {
        enableSpeakerDiarization: body.enableSpeakerDiarization,
        Speakers: body.Speakers,
        Language: body.Language,
        audioSize: body.theAudioDataAsBase64?.length || 0
      })
      
      // Convert base64 to blob for file upload
      const audioBlob = base64ToBlob(body.theAudioDataAsBase64, 'audio/webm')
      
      // Create form data for file upload
      const formData = new FormData()
      formData.append('AudioFile', audioBlob, 'audio.webm')
      formData.append('Speakers', body.Speakers.toString())
      formData.append('Language', body.Language === 'ka-GE' ? 'ka' : body.Language)
      formData.append('Autocorrect', body.Autocorrect.toString())
      formData.append('Punctuation', body.Punctuation.toString())
      formData.append('Digits', body.Digits.toString())
      if (body.Engine) {
        formData.append('Engine', body.Engine)
      }

      console.log('🚀 Sending to Enagramm RecognizeSpeechFileSubmit with speaker diarization...', {
        Speakers: body.Speakers,
        Language: body.Language === 'ka-GE' ? 'ka' : body.Language,
        Punctuation: body.Punctuation,
        Autocorrect: body.Autocorrect,
        Digits: body.Digits,
        audioDataLength: body.theAudioDataAsBase64?.length || 0
      })

      // Make the API call to Enagramm file upload endpoint
      const enagrammResponse = await fetch(`${ENAGRAMM_API_BASE}/STT/RecognizeSpeechFileSubmit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
          // Note: No Content-Type header for FormData - browser sets it automatically with boundary
        },
        body: formData
      })

      console.log('📡 Enagramm speaker diarization response status:', enagrammResponse.status)

      if (!enagrammResponse.ok) {
        const errorText = await enagrammResponse.text()
        console.error('❌ Enagramm speaker diarization API error:', {
          status: enagrammResponse.status,
          statusText: enagrammResponse.statusText,
          error: errorText
        })
        throw new Error(`Enagramm speaker diarization API error: ${enagrammResponse.status} - ${errorText}`)
      }

      const speakerData: SpeakerDiarizationResponse = await enagrammResponse.json()
      
      if (!speakerData.Success) {
        console.error('❌ Enagramm speaker diarization API returned failure:', speakerData)
        throw new Error(`Speaker diarization failed: ${speakerData.Error || speakerData.Message || 'Unknown error'}`)
      }

      console.log('✅ Speaker diarization successful:', {
        speakersFound: speakerData.lstSpeakers?.length || 0,
        speakers: speakerData.lstSpeakers?.map(s => s.Speaker).join(', ') || 'none'
      })

      // Format the speaker-diarized transcript
      const formattedTranscript = formatSpeakerTranscript(speakerData.lstSpeakers)
      
      // Return the formatted transcript as JSON with speaker metadata
      return new Response(JSON.stringify({
        text: formattedTranscript,
        speakers: speakerData.lstSpeakers,
        hasSpeakers: true
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' }
      })
    }

    // Fallback to regular speech recognition (no speaker diarization)
    console.log('🎤 Regular speech recognition requested...')
    
    // Prepare the request (REMOVED STT1 ENGINE REQUIREMENT)
    const speechRequest = {
      theAudioDataAsBase64: body.theAudioDataAsBase64,
      Language: body.Language === 'ka-GE' ? 'ka' : body.Language, // Convert ka-GE to ka for compatibility
      Punctuation: body.Punctuation,
      Autocorrect: body.Autocorrect,
      Digits: body.Digits
      // NOTE: Engine is NOT specified, letting Enagramm use default engine
    }

    console.log('🚀 Sending to Enagramm RecognizeSpeech endpoint...', {
      Engine: 'DEFAULT (no engine specified)', // FIXED: Use default engine instead of STT1
      Language: speechRequest.Language,
      Punctuation: speechRequest.Punctuation,
      Autocorrect: speechRequest.Autocorrect,
      Digits: speechRequest.Digits,
      audioDataLength: body.theAudioDataAsBase64?.length || 0
    })

    // Make the API call to Enagramm
    const enagrammResponse = await fetch(`${ENAGRAMM_API_BASE}/STT/RecognizeSpeech`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(speechRequest)
    })

    console.log('📡 Enagramm response status:', enagrammResponse.status)

    if (!enagrammResponse.ok) {
      const errorText = await enagrammResponse.text()
      let errorDetails
      
      try {
        errorDetails = JSON.parse(errorText)
      } catch {
        errorDetails = { error: errorText }
      }
      
      console.error('❌ Enagramm API error:', {
        status: enagrammResponse.status,
        statusText: enagrammResponse.statusText,
        error: errorText
      })

      // If authentication fails, clear cached token and retry once
      if (enagrammResponse.status === 401) {
        console.log('🔄 Authentication failed, clearing cache and retrying...')
        cachedAccessToken = null
        tokenExpiryTime = null
        
        try {
          const newToken = await getValidToken()
          
          const retryResponse = await fetch(`${ENAGRAMM_API_BASE}/STT/RecognizeSpeech`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${newToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(speechRequest)
          })
          
          if (retryResponse.ok) {
            const retryData: SpeechResponse = await retryResponse.json()
            return new Response(retryData.Text || '', {
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'text/plain; charset=utf-8' }
            })
          }
        } catch (retryError) {
          console.error('🔄 Retry failed:', retryError)
        }
      }
      
      throw new Error(`Enagramm API error: ${enagrammResponse.status} - ${errorText}`)
    }

    const speechData: SpeechResponse = await enagrammResponse.json()
    
    if (!speechData.Success) {
      console.error('❌ Enagramm API returned failure:', speechData)
      throw new Error(`Speech recognition failed: ${speechData.Error || speechData.Message || 'Unknown error'}`)
    }

    console.log('✅ Speech recognition successful:', speechData.Text?.substring(0, 50) + (speechData.Text?.length > 50 ? '...' : ''))
    
    // Return the recognized text as plain text (matching client expectations)
    return new Response(speechData.Text || '', {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'text/plain; charset=utf-8' }
    })
    
  } catch (error) {
    console.error('💥 Edge Function error:', error)
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