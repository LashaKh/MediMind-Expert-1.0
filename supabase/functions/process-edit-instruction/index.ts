import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

interface EditInstructionRequest {
  edit_id: string
  instruction_text: string
  original_content: string
  flowise_endpoint: string
  voice_transcript?: string
  medical_specialty?: string
  user_id?: string
  session_id?: string
  validation_override?: boolean
}

interface FlowiseResponse {
  text: string
  success: boolean
  error?: string
}

interface ValidationResult {
  isValid: boolean
  warnings: string[]
  suggestions: string[]
  confidence: number
  riskLevel: 'low' | 'medium' | 'high'
}

interface ProcessingMetadata {
  tokens_used?: number
  model: string
  processing_time: number
  flowise_endpoint: string
  original_instruction: string
  voice_transcript?: string
  medical_specialty?: string
  validation_results?: ValidationResult
  session_id?: string
  user_id?: string
  retry_count?: number
  error_recovery_attempted?: boolean
}

interface ProcessingResponse {
  updated_content: string
  processing_metadata: ProcessingMetadata
  success: boolean
  error?: string
  validation_results?: ValidationResult
}

// Flowise endpoint mapping for specialties
const FLOWISE_ENDPOINTS = {
  'cardiology-diagnosis-agent': 'https://flowiseai-railway-production-928c.up.railway.app/api/v1/prediction/6b9cf62f-42cc-4c86-b50b-be1b4bb31ba5',
  'obgyn-diagnosis-agent': 'https://flowiseai-railway-production-928c.up.railway.app/api/v1/prediction/your-obgyn-endpoint-id',
  // Add more endpoint mappings as needed
}

// Medical validation function
function validateMedicalInstruction(
  instruction: string, 
  content: string, 
  specialty?: string
): ValidationResult {
  const validationResult: ValidationResult = {
    isValid: true,
    warnings: [],
    suggestions: [],
    confidence: 1.0,
    riskLevel: 'low'
  }

  // Medical terminology validation patterns
  const dangerousPatterns = [
    /delete\s+(all|everything|report)/i,
    /remove\s+(all|everything|content)/i,
    /ignore\s+(contraindications|allergies|warnings)/i,
    /disregard\s+(safety|warnings|protocols)/i,
    /increase\s+dose\s+to\s+maximum/i,
    /skip\s+(verification|validation|checks)/i
  ]

  const contradictedPatterns = [
    /change\s+diagnosis\s+to\s+[^.]*without/i,
    /ignore\s+patient\s+(history|allergies)/i,
    /remove\s+(medication|treatment)\s+warnings/i,
    /bypass\s+(safety|protocol)/i
  ]

  const unclearPatterns = [
    /^(fix|change|update|make)\s+(it|this|that)\s*\.?$/i,
    /^(do|make)\s+something/i,
    /^(improve|enhance)\s*\.?$/i,
    /^(better|good|nice)\s*\.?$/i
  ]

  const instructionLower = instruction.toLowerCase().trim()

  // Check for dangerous patterns
  dangerousPatterns.forEach(pattern => {
    if (pattern.test(instruction)) {
      validationResult.warnings.push(
        `⚠️ Potentially dangerous instruction detected. Please be specific about medical changes needed.`
      )
      validationResult.confidence -= 0.4
      validationResult.riskLevel = 'high'
    }
  })

  // Check for contraindicated patterns
  contradictedPatterns.forEach(pattern => {
    if (pattern.test(instruction)) {
      validationResult.warnings.push(
        `🚫 Contraindicated medical instruction. This may compromise patient safety.`
      )
      validationResult.confidence -= 0.6
      validationResult.riskLevel = 'high'
      validationResult.isValid = false
    }
  })

  // Check for unclear patterns
  unclearPatterns.forEach(pattern => {
    if (pattern.test(instruction)) {
      validationResult.suggestions.push(
        `💡 Please provide more specific medical instructions (e.g., "Add blood pressure readings", "Update medication dosage to X mg")`
      )
      validationResult.confidence -= 0.3
      if (validationResult.riskLevel === 'low') validationResult.riskLevel = 'medium'
    }
  })

  // Length and specificity checks
  if (instructionLower.length < 10) {
    validationResult.warnings.push(
      `⚠️ Instruction may be too brief for medical accuracy. Please provide more context.`
    )
    validationResult.confidence -= 0.2
  }

  if (instructionLower.length > 2000) {
    validationResult.warnings.push(
      `⚠️ Instruction is very long. Consider breaking into multiple focused edits.`
    )
    validationResult.confidence -= 0.1
  }

  // Medical specialty context validation
  if (specialty) {
    const specialtyTerms = {
      cardiology: /cardiac|heart|ecg|ekg|bp|blood\s+pressure|hypertension|arrhythmia|angina|myocardial/i,
      obgyn: /obstetric|gynecology|pregnancy|prenatal|labor|delivery|maternal|fetal|cervical|uterine/i
    }

    const hasSpecialtyContext = specialty === 'cardiology' ? 
      specialtyTerms.cardiology.test(content) : 
      specialtyTerms.obgyn.test(content)

    const instructionHasSpecialtyTerms = specialty === 'cardiology' ? 
      specialtyTerms.cardiology.test(instruction) : 
      specialtyTerms.obgyn.test(instruction)

    if (hasSpecialtyContext && !instructionHasSpecialtyTerms && instruction.length > 20) {
      validationResult.suggestions.push(
        `💡 Consider adding ${specialty}-specific context for better medical accuracy.`
      )
      validationResult.confidence -= 0.1
    }
  }

  // Check for medical action verbs
  const hasActionVerbs = /\b(add|update|correct|fix|clarify|specify|include|document|remove|change|modify|revise)\b/i.test(instruction)
  if (!hasActionVerbs && instruction.length > 15) {
    validationResult.suggestions.push(
      `💡 Use clear action words like "add", "update", "correct", or "clarify" for precise medical instructions.`
    )
    validationResult.confidence -= 0.15
  }

  // Ensure confidence doesn't go below 0
  validationResult.confidence = Math.max(0, validationResult.confidence)

  // Adjust risk level based on final confidence
  if (validationResult.confidence < 0.3) {
    validationResult.riskLevel = 'high'
  } else if (validationResult.confidence < 0.7) {
    validationResult.riskLevel = 'medium'
  }

  return validationResult
}

async function processWithFlowise(
  instruction: string,
  originalContent: string,
  endpoint: string,
  voiceTranscript?: string,
  retryCount: number = 0,
  maxRetries: number = 3
): Promise<{ content: string; metadata: ProcessingMetadata }> {
  const flowiseUrl = FLOWISE_ENDPOINTS[endpoint] || FLOWISE_ENDPOINTS['cardiology-diagnosis-agent']
  
  // Prepare the instruction context for Flowise
  const contextualInstruction = `
Please edit the following medical report based on this instruction: "${instruction}"

${voiceTranscript ? `Original voice instruction (Georgian): "${voiceTranscript}"` : ''}

Current report content:
${originalContent}

Please provide the updated report content with the requested changes integrated naturally into the medical text. Maintain professional medical language and preserve the original structure where appropriate.

IMPORTANT: Return only the updated report content, without any additional explanations or metadata.
`

  const startTime = Date.now()
  let errorRecoveryAttempted = false
  
  try {
    console.log('🤖 Sending edit request to Flowise:', {
      endpoint,
      instructionLength: instruction.length,
      contentLength: originalContent.length,
      hasVoiceTranscript: !!voiceTranscript,
      retryCount,
      maxRetries
    })

    // Add timeout for the fetch request (30 seconds)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    const response = await fetch(flowiseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: contextualInstruction,
        history: [],
        chatId: `edit-${Date.now()}-${retryCount}` // Unique chat ID for this edit attempt
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)
    const processingTime = (Date.now() - startTime) / 1000

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Flowise API error:', {
        status: response.status,
        error: errorText,
        retryCount
      })

      // Attempt error recovery for specific error types
      if (response.status === 429 && retryCount < maxRetries) {
        console.log('🔄 Rate limit hit, implementing exponential backoff...')
        errorRecoveryAttempted = true
        const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), 10000) // Max 10 seconds
        await new Promise(resolve => setTimeout(resolve, backoffDelay))
        return processWithFlowise(instruction, originalContent, endpoint, voiceTranscript, retryCount + 1, maxRetries)
      }

      if (response.status === 502 || response.status === 503) {
        console.log('🔄 Server error, attempting retry...')
        errorRecoveryAttempted = true
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 2000)) // 2 second delay
          return processWithFlowise(instruction, originalContent, endpoint, voiceTranscript, retryCount + 1, maxRetries)
        }
      }
      
      throw new Error(`Flowise API error: ${response.status} - ${errorText}`)
    }

    const flowiseData = await response.json()
    
    if (!flowiseData.text) {
      console.error('❌ Invalid Flowise response:', flowiseData)
      
      // Attempt recovery for empty responses
      if (retryCount < maxRetries) {
        console.log('🔄 Empty response, retrying with simplified instruction...')
        errorRecoveryAttempted = true
        const simplifiedInstruction = `Please apply this edit to the medical report: ${instruction}\n\nReport: ${originalContent.substring(0, 1000)}...`
        return processWithFlowise(simplifiedInstruction, originalContent, endpoint, voiceTranscript, retryCount + 1, maxRetries)
      }
      
      throw new Error('Invalid response from Flowise AI')
    }

    console.log('✅ Flowise processing successful:', {
      processingTime,
      responseLength: flowiseData.text.length,
      finalRetryCount: retryCount
    })

    // Estimate token usage based on content length (rough approximation)
    const estimatedTokens = Math.ceil((instruction.length + originalContent.length + flowiseData.text.length) / 4)

    return {
      content: flowiseData.text.trim(),
      metadata: {
        model: endpoint,
        processing_time: processingTime,
        flowise_endpoint: endpoint,
        original_instruction: instruction,
        tokens_used: estimatedTokens,
        retry_count: retryCount,
        error_recovery_attempted: errorRecoveryAttempted,
        ...(voiceTranscript && { voice_transcript: voiceTranscript })
      } as ProcessingMetadata
    }
  } catch (error) {
    const processingTime = (Date.now() - startTime) / 1000
    console.error('💥 Flowise processing failed:', {
      error: error.message,
      retryCount,
      processingTime
    })

    // Final attempt with fallback processing if all retries failed
    if (retryCount >= maxRetries && error.name === 'AbortError') {
      throw new Error(`Processing timeout after ${maxRetries} attempts. The AI service may be overloaded.`)
    }
    
    if (retryCount >= maxRetries) {
      throw new Error(`AI processing failed after ${maxRetries} attempts: ${error.message}`)
    }
    
    throw new Error(`AI processing failed: ${error.message}`)
  }
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
    const body: EditInstructionRequest = await req.json()
    
    console.log('📨 Received edit instruction request:', {
      edit_id: body.edit_id,
      instruction_length: body.instruction_text?.length || 0,
      content_length: body.original_content?.length || 0,
      flowise_endpoint: body.flowise_endpoint,
      has_voice_transcript: !!body.voice_transcript,
      medical_specialty: body.medical_specialty,
      user_id: body.user_id,
      session_id: body.session_id
    })

    // Validate required fields
    if (!body.edit_id || !body.instruction_text || !body.original_content || !body.flowise_endpoint) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields',
          message: 'edit_id, instruction_text, original_content, and flowise_endpoint are required'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate content difference (instruction should modify the content)
    if (body.instruction_text.trim().length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid instruction',
          message: 'Instruction text cannot be empty'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Medical validation (T046)
    const validationResults = validateMedicalInstruction(
      body.instruction_text,
      body.original_content,
      body.medical_specialty
    )

    console.log('🏥 Medical validation results:', {
      isValid: validationResults.isValid,
      confidence: validationResults.confidence,
      riskLevel: validationResults.riskLevel,
      warningCount: validationResults.warnings.length,
      suggestionCount: validationResults.suggestions.length
    })

    // Block processing if validation fails and no override
    if (!validationResults.isValid && !body.validation_override) {
      return new Response(
        JSON.stringify({ 
          error: 'Medical validation failed',
          message: 'Instruction failed medical safety validation',
          validation_results: validationResults,
          suggestion: 'Please review the warnings and modify your instruction, or use validation_override=true if you are certain'
        }),
        { 
          status: 422, // Unprocessable Entity
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Process the edit instruction with Flowise AI (T047 - Enhanced error handling)
    const { content: updatedContent, metadata } = await processWithFlowise(
      body.instruction_text,
      body.original_content,
      body.flowise_endpoint,
      body.voice_transcript
    )

    // Add validation results and additional metadata
    metadata.validation_results = validationResults
    metadata.medical_specialty = body.medical_specialty
    metadata.session_id = body.session_id
    metadata.user_id = body.user_id

    // Validate that content was actually modified
    if (updatedContent.trim() === body.original_content.trim()) {
      console.warn('⚠️ AI processing returned unchanged content')
      return new Response(
        JSON.stringify({ 
          error: 'No changes applied',
          message: 'The AI was unable to apply the requested changes to the report',
          suggestion: 'Please try rephrasing your instruction or provide more specific details'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const response: ProcessingResponse = {
      updated_content: updatedContent,
      processing_metadata: metadata,
      validation_results: validationResults,
      success: true
    }

    console.log('✅ Edit instruction processed successfully:', {
      edit_id: body.edit_id,
      original_length: body.original_content.length,
      updated_length: updatedContent.length,
      processing_time: metadata.processing_time,
      tokens_used: metadata.tokens_used,
      validation_confidence: validationResults.confidence,
      validation_risk_level: validationResults.riskLevel,
      retry_count: metadata.retry_count,
      error_recovery_attempted: metadata.error_recovery_attempted
    })

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    console.error('💥 Edge Function error:', error)
    
    // Determine appropriate error status
    const status = error.message.includes('API error') ? 502 : 500
    
    return new Response(
      JSON.stringify({ 
        error: 'Processing failed',
        message: error.message,
        success: false
      }),
      { 
        status, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})