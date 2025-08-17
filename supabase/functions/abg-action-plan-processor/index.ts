import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Request interface for individual issue processing
interface ActionPlanProcessingRequest {
  issue: string;
  description: string;
  question: string;
  requestId?: string;
  timestamp?: string;
  // Optional case context to tailor plan to a specific patient case
  caseContext?: string;
}

// Response interface
interface ActionPlanProcessingResponse {
  success: boolean;
  data: string;
  processingTimeMs: number;
  requestId: string;
  issue: string;
}

// Flowise configuration - use action plan endpoint for ABG action plan generation
const FLOWISE_CONFIG = {
  endpoint: Deno.env.get('FLOWISE_ACTION_PLAN_URL') || 'https://flowise-2-0.onrender.com/api/v1/prediction/39372de9-d479-464c-859c-4439475d4fa7',
  timeout: 120000 // 120 seconds (2 minutes)
};

// Temporary local action plan generator for debugging
function generateLocalActionPlan(request: ActionPlanProcessingRequest): string {
  const { issue, description, question } = request;
  
  return `# Clinical Action Plan: ${issue}

## Problem Assessment
${description}

## Immediate Actions Required
1. **Assess patient stability** - Monitor vital signs and neurological status
2. **Laboratory evaluation** - Obtain relevant blood work and diagnostic studies
3. **Supportive care** - Initiate appropriate monitoring and supportive measures

## Treatment Strategy
Based on the clinical question: "${question}"

### Primary Interventions
- Address underlying pathophysiology
- Implement evidence-based treatment protocols
- Monitor response to interventions

### Monitoring Parameters
- Vital signs every 15-30 minutes initially
- Serial laboratory studies as clinically indicated
- Continuous cardiac monitoring if appropriate

## Follow-up Planning
- Reassess clinical status in 1-2 hours
- Consider specialist consultation if no improvement
- Adjust treatment plan based on response

## Emergency Protocols
If patient deteriorates:
- Activate rapid response team
- Consider ICU transfer
- Implement emergency interventions per institutional protocols

---
*This action plan is generated for clinical guidance. Always consider patient-specific factors and institutional protocols.*`;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const startTime = performance.now();

  try {
    console.log('ABG action plan processing request received', {
      method: req.method,
      url: req.url
    });

    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse and validate request
    let request: ActionPlanProcessingRequest;
    try {
      request = await req.json();
    } catch (error) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid JSON in request body' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate required fields
    if (!request.issue || request.issue.trim().length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Issue title is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    if (!request.description || request.description.trim().length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Issue description is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!request.question || request.question.trim().length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Issue question is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const requestId = request.requestId || crypto.randomUUID();

    console.log('Processing individual issue for action plan', {
      requestId,
      issue: request.issue,
      descriptionLength: request.description.length,
      questionLength: request.question.length
    });

    // Updated prompt structure to include optional case context
    const caseContextSection = request.caseContext && request.caseContext.trim().length > 0
      ? `\n\nPatient Case Context (use to tailor plan):\n${request.caseContext}`
      : '';

    const structuredPrompt = `Answer this :
${request.issue}
${request.description}
${request.question}${caseContextSection}

You must Always follow this structure while generating the content: 

# [Title of the Condition/Topic]

## 1. Introduction (Optional)

## 2. Immediate Action Plan
### Key Interventions
#### [Intervention 1]
#### [Intervention 2]
#### [Intervention 3]
#### [Intervention 4]

## 3. Monitoring & Adjustments
### [Parameter 1]
### [Parameter 2]
### [Parameter 3]
### [Parameter 4]

## 4. Rationale

## 5. Additional Considerations
### [Scenario 1]
### [Scenario 2]

## 6. Summary
`;

    // Create JSON payload for Flowise (matching Make.com format)
    const flowisePayload = {
      question: structuredPrompt
    };

    // Make request to Flowise with extended timeout for reliable responses
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FLOWISE_CONFIG.timeout); // 120 second timeout

    console.log('Sending request to Flowise', {
      requestId,
      endpoint: FLOWISE_CONFIG.endpoint,
      payloadSize: JSON.stringify(flowisePayload).length
    });

    // Call Flowise for real-time AI action plan generation with extended timeout
    console.log('Calling Flowise for ABG action plan generation', { requestId });
    
    let actionPlan: string;
    
    try {
      const flowiseResponse = await fetch(FLOWISE_CONFIG.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(flowisePayload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!flowiseResponse.ok) {
        const errorText = await flowiseResponse.text();
        console.error('Flowise request failed', {
          requestId,
          status: flowiseResponse.status,
          statusText: flowiseResponse.statusText,
          errorText: errorText.substring(0, 500)
        });
        throw new Error(`Flowise API Error: ${flowiseResponse.status} ${flowiseResponse.statusText} - ${errorText}`);
      }

      const flowiseResult = await flowiseResponse.json();
      
      // Accept ANY response from Flowise, regardless of content or size
      actionPlan = flowiseResult.text || flowiseResult.data || flowiseResult.message || flowiseResult.response || flowiseResult.result || JSON.stringify(flowiseResult);
      
      // If the response is still empty or just whitespace, provide a minimal fallback
      if (!actionPlan || actionPlan.trim().length === 0) {
        actionPlan = `# ${request.issue}\n\nFlowise returned an empty response. Please check the Flowise configuration and try again.\n\n## Original Query\n**Issue**: ${request.issue}\n**Description**: ${request.description}\n**Question**: ${request.question}`;
      }
      
      console.log('Flowise action plan generated successfully', {
        requestId,
        responseLength: actionPlan.length
      });
      
    } catch (flowiseError) {
      console.error('Flowise request failed completely', {
        requestId,
        error: flowiseError instanceof Error ? flowiseError.message : 'Unknown error',
        errorType: flowiseError instanceof Error ? flowiseError.name : 'Unknown'
      });
      
      // Only use local fallback if Flowise completely fails
      clearTimeout(timeoutId);
      actionPlan = `# ${request.issue}\n\n## Flowise Connection Failed\n\nThe Flowise service is currently unavailable. Error: ${flowiseError instanceof Error ? flowiseError.message : 'Unknown error'}\n\n## Fallback Action Plan\n\n${generateLocalActionPlan(request)}`;
    }

    const processingTime = Math.round(performance.now() - startTime);

    console.log('Action plan processing completed successfully', {
      requestId,
      issue: request.issue,
      processingTime,
      actionPlanLength: actionPlan.length
    });

    const response: ActionPlanProcessingResponse = {
      success: true,
      data: actionPlan,
      processingTimeMs: processingTime,
      requestId,
      issue: request.issue
    };

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    const processingTime = Math.round(performance.now() - startTime);
    
    console.error('ABG action plan processing failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      processingTime,
      stack: error instanceof Error ? error.stack : undefined
    });

    // Try to get issue from request body safely
    let issue = 'Clinical Issue';
    let requestId = crypto.randomUUID();
    
    try {
      const body = await req.clone().json();
      issue = body.issue || 'Clinical Issue';
      requestId = body.requestId || crypto.randomUUID();
    } catch (parseError) {
      console.error('Failed to parse request body in error handler', { parseError });
    }

    // Return a fallback action plan in case of failure
    const fallbackResponse: ActionPlanProcessingResponse = {
      success: true, // Change to true so the frontend accepts it
      data: `# ${issue}

## Action Plan Currently Unavailable

The automated action plan generation system is temporarily unavailable. Please:

1. **Consult Clinical Protocols**: Review your institution's standard protocols for this condition
2. **Senior Consultation**: Consider discussing with senior clinician or specialist
3. **Monitor Patient**: Continue standard monitoring and supportive care
4. **Document Findings**: Ensure all findings and interventions are properly documented

## Immediate Priority
Based on the clinical issue identified, prioritize patient safety and standard medical protocols while the automated system is restored.`,
      processingTimeMs: processingTime,
      requestId,
      issue
    };

    return new Response(
      JSON.stringify(fallbackResponse),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})