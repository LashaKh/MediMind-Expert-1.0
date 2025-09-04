import { withMedicalSecurity } from './utils/middleware';
import { parseRequest } from './utils/request';
import { successResponse, errorResponse } from './utils/response';
import { handleError, ValidationError } from './utils/errors';
import { logger } from './utils/logger';
import OpenAI from 'openai';
import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

// Request interface matching the Make.com webhook format
interface IssuesExtractionRequest {
  interpretation: string;
  requestId?: string;
  timestamp?: string;
}

// Issue interface matching Make.com structure
interface IdentifiedIssue {
  issue: string;
  description: string;
  question: string;
}

// Response interface matching the webhook service
interface IssuesExtractionResponse {
  success: boolean;
  data: {
    issues?: IdentifiedIssue[];
    issue?: string;
    description?: string;
    question?: string;
  };
  processingTimeMs: number;
  requestId: string;
}

/**
 * ABG Issues Extraction using OpenAI GPT-4
 * Replicates the exact Make.com scenario for identifying clinical issues
 */
const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  const startTime = performance.now();

  try {
    logger.info('ABG issues extraction request received', {
      method: event.httpMethod,
      path: event.path,
      headers: event.headers
    });

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
      return errorResponse(405, 'Method not allowed', 'Only POST requests are supported');
    }

    // Parse and validate request
    const parsedRequest = parseRequest(event);
    if (!parsedRequest.body) {
      throw new ValidationError('Request body is required');
    }

    const request = parsedRequest.body as IssuesExtractionRequest;

    // Validate required fields
    if (!request.interpretation || request.interpretation.trim().length === 0) {
      throw new ValidationError('Interpretation data is required');
    }

    const requestId = request.requestId || crypto.randomUUID();

    logger.info('Processing ABG issues extraction', {
      requestId,
      interpretationLength: request.interpretation.length
    });

    // Updated system prompt to return JSON array format
    const systemPrompt = `# Identified Issues JSON Generator: System Prompt

You are the **Identified Issues JSON Generator Agent**. Your task is to analyze the comprehensive ABG interpretation output provided by the user and extract all identified significant issues along with their descriptions and questions. You must then output a JSON list where each entry is an object containing the following keys:

- **issue**: A short title for the identified issue.
- **description**: A detailed explanation of the issue based on the ABG analysis, including relevant lab values and clinical context.
- **question**: A specific question aimed at the Knowledge Base Agent, asking for detailed action plan recommendations and management strategies for the identified issue.

### Requirements:
1. **Input Analysis**: Read the ABG interpretation output, which includes sections such as Acid-Base Analysis, Oxygenation Analysis, Electrolyte & Metabolite Analysis, Summary Interpretation, and Most Important Details.
2. **Issue Identification**: Identify all clinically significant issues. In this example, these include:
3. **Output Format**: Return a JSON array of objects. Each object must have the keys "issue", "description", and "question".
4. **Clarity and Completeness**: Ensure that the descriptions and questions are clear and specific, aiding the downstream KB Agent in providing a detailed action plan.
5. **No Additional Commentary**: Output only the JSON data and nothing else.

### Example Expected JSON Structure:

[
  {
    "issue": "High Anion Gap Metabolic Acidosis",
    "description": "The blood gas analysis reveals a primary metabolic acidosis with a low pH (7.250), significantly reduced bicarbonate (14.9 mmol/L), and markedly elevated lactate (11.5 mmol/L), suggesting severe lactic acidosis and a likely high anion gap.",
    "question": "What is the most likely etiology of the lactic acidosis (e.g., sepsis, hypoperfusion, or mitochondrial dysfunction), and what urgent interventions (such as fluid resuscitation, appropriate antibiotic therapy, or other measures) are recommended to manage this condition?"
  },
  {
    "issue": "Mild Hypoxemia",
    "description": "Oxygenation parameters indicate mild hypoxemia, with pO₂ at 77.7 mmHg and sO₂ at 92.4%, which may contribute to tissue hypoxia in the setting of metabolic acidosis.",
    "question": "Should supplemental oxygen or additional diagnostic evaluations be initiated to improve oxygenation, and what monitoring strategy should be employed to reassess the patient's respiratory status?"
  },
  {
    "issue": "Metabolic Disturbances: Hyperglycemia and Hypocalcemia",
    "description": "The analysis shows mild hyperglycemia (Glucose = 6.5 mmol/L) and low ionized calcium (1.11 mmol/L, even lower at physiological pH), which could exacerbate the patient's metabolic imbalance.",
    "question": "What are the recommended management strategies for addressing the mild hyperglycemia and hypocalcemia in this clinical context, and should corrective therapies (such as glucose control measures or calcium supplementation) be initiated?"
  }
]

# Must Rules 
- You must never miss any important issues. If any problem is identified, you must create a JSON object entry for that specific issue.
- You must output a list of issues, ranked from the most important and life-threatening to the least.`;

    const userMessage = `Identify all important issues in this Blood Gas Analyzes Report : ${request.interpretation}`;

    // Make OpenAI API call with exact configuration from Make.com
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      temperature: 0.1,
      top_p: 1,
      max_tokens: 5048,
      n: 1,
      response_format: { type: "json_object" }
    });

    const issuesJson = completion.choices[0]?.message?.content || '{"issues": []}';
    
    let parsedIssues;
    try {
      parsedIssues = JSON.parse(issuesJson);
    } catch (parseError) {
      logger.error('Failed to parse JSON response from OpenAI', {
        requestId,
        rawResponse: issuesJson,
        error: parseError
      });
      throw new Error('Invalid JSON response from OpenAI');
    }

    const processingTime = Math.round(performance.now() - startTime);

    logger.info('ABG issues extraction completed successfully', {
      requestId,
      processingTime,
      issuesCount: parsedIssues.issues?.length || (parsedIssues.issue ? 1 : 0),
      tokensUsed: completion.usage?.total_tokens || 0
    });

    // Handle response format - expecting direct array format
    let responseData;
    if (Array.isArray(parsedIssues)) {
      // Direct array format (new expected format)
      responseData = {
        issues: parsedIssues
      };
      logger.info('Found issues in direct array format', {
        requestId,
        issuesCount: parsedIssues.length
      });
    } else if (parsedIssues.issues && Array.isArray(parsedIssues.issues)) {
      // Wrapped in issues object (fallback format)
      responseData = {
        issues: parsedIssues.issues
      };
      logger.info('Found multiple issues in wrapped array format', {
        requestId,
        issuesCount: parsedIssues.issues.length
      });
    } else if (parsedIssues.issue) {
      // Single issue format - convert to array format for consistency
      responseData = {
        issues: [{
          issue: parsedIssues.issue,
          description: parsedIssues.description,
          question: parsedIssues.question
        }]
      };
      logger.info('Found single issue, converted to array format', { requestId });
    } else {
      // No issues found
      responseData = {
        issues: []
      };
      logger.info('No issues identified in ABG interpretation', { requestId });
    }

    const response: IssuesExtractionResponse = {
      success: true,
      data: responseData,
      processingTimeMs: processingTime,
      requestId
    };

    return successResponse(response, 'ABG issues extraction completed successfully');

  } catch (error) {
    const processingTime = Math.round(performance.now() - startTime);
    
    logger.error('ABG issues extraction failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      processingTime,
      stack: error instanceof Error ? error.stack : undefined
    });

    return handleError(error, 'Failed to extract clinical issues from ABG interpretation');
  }
};

export { handler };
export default withMedicalSecurity(handler);