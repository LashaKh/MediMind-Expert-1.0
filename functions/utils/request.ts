import { HandlerEvent } from '@netlify/functions';

export interface ParsedRequest {
  body?: any;
  query: Record<string, string>;
  headers: Record<string, string>;
  method: string;
  path: string;
}

export function parseRequest(event: HandlerEvent): ParsedRequest {
  let body;
  
  // Parse body if it exists
  if (event.body) {
    try {
      body = JSON.parse(event.body);
    } catch (error) {
      // If JSON parsing fails, keep as string
      body = event.body;
    }
  }

  // Parse query parameters, filtering out undefined values
  const query: Record<string, string> = {};
  if (event.queryStringParameters) {
    Object.keys(event.queryStringParameters).forEach(key => {
      const value = event.queryStringParameters![key];
      if (value !== undefined) {
        query[key] = value;
      }
    });
  }

  // Extract headers (convert to lowercase for consistency)
  const headers: Record<string, string> = {};
  Object.keys(event.headers).forEach(key => {
    headers[key.toLowerCase()] = event.headers[key] || '';
  });

  return {
    body,
    query,
    headers,
    method: event.httpMethod,
    path: event.path
  };
}

export function getAuthToken(headers: Record<string, string>): string | null {
  const authHeader = headers.authorization || headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

export function validateRequiredFields(
  data: Record<string, any>,
  requiredFields: string[]
): string[] {
  const missingFields: string[] = [];
  
  requiredFields.forEach(field => {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      missingFields.push(field);
    }
  });

  return missingFields;
} 