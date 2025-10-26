import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

interface SpeechRequest {
  theAudioDataAsBase64: string
  Language: string
  Autocorrect?: boolean
  Punctuation?: boolean
  Digits?: boolean
}

// Service Account Credentials
const SERVICE_ACCOUNT = {
  type: "service_account",
  project_id: "wide-song-473914-b6",
  private_key_id: "e8f9db23023ccbad7a98a53fed55741dc941e8f3",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCmpCiyqVB088Pr\n8zrDAmoOKZzYpjvsez8hNukjKj50j/OZkAR+iEDMnipMn9GCnpxzTPbPyCIyqyT8\nb1KkIjlpgeAXBo95ib0JO9nEnx2CuLLWBfjuGCcAHA6K+rBn6ebKqpUAKHCZa4Uy\ne345tL/9vMFL7NfyKDzL+mYgj/CKXvLvMVUTaNBsgIJZxFVSLf1naCyCBw/3ZR+E\npyI+QB6ksJ2G+Hg5vwQBYlS1KhNN/KhfFlOjoiYMvnbcDf53ZKoKRPa16tubP91o\niSZTmJ8Dheeaga5Du/bPgMfRQaC8FDEib7jxle9eM76xWhSAbCKW28LyrYPpo4Bf\nRR01mRJHAgMBAAECggEANZ6Jp986D7+l8YR8imX6+R6jpMRscK3BhO71ukZr/Taa\ng/VmtM4jx5M2+hvMnrJpleIUYow7kMEn7//kAAMxJQVQtSf7v3g19sQm0JEAPmEu\nzhXy4K2t0ue0ODzsySrmg5y6v+fDP2Js4+7/kRLbWgpDyinl3DndQicKeHzIQcVB\nhUtQ3iTeTaB51mAIfoxMlO8SclgWFOOwP5BEYnJ4Y07Q3cCYFJzxCoddnmuZtlfO\n7bQJC8TwXgf4LXq8izHOEAFdtomPQWGyCgP6cE+OCa/5z/MkArqSVTRnCVGgyce6\nYp0xlVjH82skUqOC/dQ+pmR+Pwn1L4f6izGnmgpzOQKBgQDSnS2Wcx9oYsBPP2WZ\njcTjD1KfgXXoEbeQofkJG8xPz+vsHL6GTM74onYwQYue7UiCCXeIIXMz8BIrfWym\npbX5hP+Q4KB8j4DzeLj6huOFZhpK1WuQBkNsb3lkkO5aStvBqFkYUqNuFvuNMvZp\nc9zRsiN5nwk5WKMidelr7QJXOQKBgQDKjSmEFPwTb2tDZxJL1JI+UVzl/Rg4GSEu\n0cZrzG/aMl7Zbus88QXBNvDZ0wFpTQAbExaKMsIgzvexWGpo5QkDZuXfVJR+cLto\nBnQwC4sol7VYEjSk9UYfcACJshSF02VEHXjhFtxYmFGl06+sqNcCJXdcUClE2UGO\nogcfV2k1fwKBgF9+etQTgLMgy1djRFraR+I36Vt/JInDtrpyZms12m55tNvKsKxO\nGS3s46+/mGHH7q9fQX5MxGJRQLvNU70/t4HaRtJWtw2jN3GtVBnrnS+3+sXhfLLB\n1EJPTPhHKntwI7Hr9fGsToO1EfuUltt7eCzwG1uiu1jwEo+mbN7NiNkpAoGACiMm\ngMXMF+zroWP3NnRdHWFVFO2l2KjpUD6Pf7Wro3AB7z/t5g7qCtGFHGHDIFIKP1Cl\nQCVqMdop62ZRbQ6JdPIhbxv8kpdxybMI/Z6WSGHPYakHmXntGIWygTG4dTovR0ly\nU1GhlY2KCJKfqDSLDkBxyNz6M8fr0Aer85WcXmECgYEA0Aqs0g6qj/FG44SMUvHQ\nxIq71Ylv7qfQUD8nrAIv+kbmjiT+OW00Ai7M7XZkuJ+AVGBzkbJh5GNkhC7WKlN/\n/Kx2NX3iOjPNoUF9/jdiVhwNsQx1jrT4ra+S3F5aKbnEuJDlMagHAXZwWKeGFc+1\nhtnCOSLIGocqakyq2cfVsyI=\n-----END PRIVATE KEY-----\n",
  client_email: "id-medimind-speech-v2@wide-song-473914-b6.iam.gserviceaccount.com",
  token_uri: "https://oauth2.googleapis.com/token"
}

const RECOGNIZER_NAME = 'medimind-chirp-georgian'
const LOCATION = 'us-central1' // Chirp is only available in regional locations, not 'global'
const PROJECT_ID = SERVICE_ACCOUNT.project_id

// Helper function to base64url encode from Uint8Array
function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

// Helper function to generate JWT token
async function createJWT(): Promise<string> {
  const header = {
    alg: 'RS256',
    typ: 'JWT'
  }

  const now = Math.floor(Date.now() / 1000)
  const expiry = now + 3600 // 1 hour

  const payload = {
    iss: SERVICE_ACCOUNT.client_email,
    sub: SERVICE_ACCOUNT.client_email,
    aud: SERVICE_ACCOUNT.token_uri,
    iat: now,
    exp: expiry,
    scope: 'https://www.googleapis.com/auth/cloud-platform'
  }

  const encoder = new TextEncoder()
  const encodedHeader = arrayBufferToBase64Url(encoder.encode(JSON.stringify(header)))
  const encodedPayload = arrayBufferToBase64Url(encoder.encode(JSON.stringify(payload)))
  const unsignedToken = `${encodedHeader}.${encodedPayload}`

  // Import private key
  const privateKey = SERVICE_ACCOUNT.private_key
  const pemHeader = "-----BEGIN PRIVATE KEY-----"
  const pemFooter = "-----END PRIVATE KEY-----"

  // Extract PEM contents by removing headers/footers and all whitespace
  const pemContents = privateKey
    .replace(pemHeader, '')
    .replace(pemFooter, '')
    .replace(/\s+/g, '') // Remove all whitespace including newlines
    .trim()

  // Decode base64 PEM contents
  const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0))

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryDer,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256'
    },
    false,
    ['sign']
  )

  // Sign the token
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    encoder.encode(unsignedToken)
  )

  // Convert signature bytes to base64url
  const encodedSignature = arrayBufferToBase64Url(signature)

  return `${unsignedToken}.${encodedSignature}`
}

// Helper function to get OAuth access token
async function getAccessToken(): Promise<string> {
  const jwt = await createJWT()

  const response = await fetch(SERVICE_ACCOUNT.token_uri, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to get access token: ${error}`)
  }

  const data = await response.json()
  return data.access_token
}

// Helper function to ensure recognizer exists
async function ensureRecognizer(accessToken: string): Promise<void> {
  const recognizerPath = `projects/${PROJECT_ID}/locations/${LOCATION}/recognizers/${RECOGNIZER_NAME}`
  const endpoint = `https://${LOCATION}-speech.googleapis.com/v2/${recognizerPath}`

  // Check if recognizer exists
  const checkResponse = await fetch(endpoint, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  })

  if (checkResponse.ok) {
    console.log('✅ Recognizer already exists:', recognizerPath)
    return
  }

  // Create recognizer if it doesn't exist
  console.log('🔧 Creating recognizer:', recognizerPath)

  const createEndpoint = `https://${LOCATION}-speech.googleapis.com/v2/projects/${PROJECT_ID}/locations/${LOCATION}/recognizers?recognizerId=${RECOGNIZER_NAME}`

  const recognizerConfig = {
    model: 'chirp',
    languageCodes: ['en-US', 'ka-GE', 'ru-RU'], // Multi-language support for MediMind AI
    defaultRecognitionConfig: {
      features: {
        enableAutomaticPunctuation: true
      }
    }
  }

  const createResponse = await fetch(createEndpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(recognizerConfig)
  })

  if (!createResponse.ok) {
    const error = await createResponse.text()
    console.error('❌ Failed to create recognizer:', error)
    throw new Error(`Failed to create recognizer: ${error}`)
  }

  // Wait for operation to complete
  const operation = await createResponse.json()
  console.log('✅ Recognizer creation initiated:', operation)
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

    const audioSizeKB = Math.round((body.theAudioDataAsBase64?.length || 0) / 1024)

    console.log('📨 Google STT V2 request received:', {
      audioSizeKB: audioSizeKB,
      Language: body.Language,
      Punctuation: body.Punctuation
    })

    // Validate required fields
    if (!body.theAudioDataAsBase64) {
      return new Response(
        JSON.stringify({ error: 'Missing audio data' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // V2 API also has 1-minute limit for synchronous recognition
    const maxSafeAudioSizeKB = 480
    if (audioSizeKB > maxSafeAudioSizeKB) {
      console.warn(`⚠️ Audio too long for Google STT V2: ${audioSizeKB}KB (max: ${maxSafeAudioSizeKB}KB)`)
      return new Response(
        JSON.stringify({
          error: 'Audio too long',
          message: `Audio segment is ${audioSizeKB}KB. Google STT V2 requires audio under 1 minute (~${maxSafeAudioSizeKB}KB).`
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get OAuth access token
    console.log('🔑 Getting OAuth access token...')
    const accessToken = await getAccessToken()

    // Ensure recognizer exists
    await ensureRecognizer(accessToken)

    // Prepare V2 API request
    const recognizerPath = `projects/${PROJECT_ID}/locations/${LOCATION}/recognizers/${RECOGNIZER_NAME}`
    const endpoint = `https://${LOCATION}-speech.googleapis.com/v2/${recognizerPath}:recognize`

    // Ensure language code is valid (default to en-US if not provided)
    const languageCode = body.Language || 'en-US'

    const requestBody = {
      config: {
        auto_decoding_config: {}, // Required: tells API to auto-detect audio format
        languageCodes: [languageCode], // CRITICAL: Specify which language to recognize
        features: {
          enableAutomaticPunctuation: body.Punctuation !== false
        }
      },
      content: body.theAudioDataAsBase64
    }

    console.log('🚀 Sending to Google Speech-to-Text V2 API (Chirp model)...', {
      recognizer: recognizerPath,
      languageCode: languageCode,
      enableAutomaticPunctuation: body.Punctuation !== false,
      audioDataLength: body.theAudioDataAsBase64.length
    })

    // Call Google Speech-to-Text V2 API
    const googleResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    console.log('📡 Google STT V2 response status:', googleResponse.status)

    if (!googleResponse.ok) {
      const errorText = await googleResponse.text()
      let errorData: any

      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { error: errorText }
      }

      console.error('❌ Google STT V2 API error:', {
        status: googleResponse.status,
        statusText: googleResponse.statusText,
        error: errorData
      })

      let userMessage = 'Speech recognition failed'
      if (googleResponse.status === 400) {
        userMessage = 'Invalid audio format. Please try recording again.'
      } else if (googleResponse.status === 401 || googleResponse.status === 403) {
        userMessage = 'API authentication failed. Please contact support.'
      } else if (googleResponse.status === 429) {
        userMessage = 'Too many requests. Please wait a moment and try again.'
      }

      return new Response(
        JSON.stringify({
          error: 'Google STT V2 API error',
          message: userMessage,
          details: errorData.error?.message || errorText
        }),
        {
          status: googleResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const googleData = await googleResponse.json()

    // Check for API-level errors
    if (googleData.error) {
      console.error('❌ Google STT V2 returned error:', googleData.error)
      return new Response(
        JSON.stringify({
          error: 'Speech recognition failed',
          message: googleData.error.message
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Extract transcript from response
    const transcript = googleData.results?.[0]?.alternatives?.[0]?.transcript || ''
    const confidence = googleData.results?.[0]?.alternatives?.[0]?.confidence || 0

    console.log('✅ Google STT V2 (Chirp) successful:', {
      transcriptLength: transcript.length,
      confidence: confidence,
      preview: transcript.substring(0, 50) + (transcript.length > 50 ? '...' : '')
    })

    // Return the transcript as plain text (matching Enagram format)
    return new Response(transcript || '', {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'text/plain; charset=utf-8' }
    })

  } catch (error) {
    console.error('💥 Google STT V2 Edge Function error:', error)
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
