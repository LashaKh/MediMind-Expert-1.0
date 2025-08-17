/**
 * News Interaction Tracking API
 * Tracks user interactions with medical news articles for analytics and engagement scoring
 */

import { HandlerEvent, HandlerResponse } from '@netlify/functions';
import { createSuccessResponse, createErrorResponse } from './utils/response';
import { parseRequest } from './utils/request';
import { logInfo, logError } from './utils/logger';
import { createRateLimit } from './utils/rateLimit';

// Supabase integration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

interface InteractionRequest {
  newsId: string;
  interactionType: 'click' | 'read_time' | 'share' | 'bookmark' | 'like' | 'comment' | 'save_later';
  interactionValue?: number; // For read_time in seconds, etc.
  interactionMetadata?: Record<string, any>; // Additional context
  sessionId?: string;
  referrerUrl?: string;
}

interface InteractionResponse {
  success: boolean;
  interactionId: string;
  updatedEngagementScore?: number;
  message: string;
}

// Validate interaction request
function validateInteractionRequest(body: any): InteractionRequest | null {
  if (!body.newsId || typeof body.newsId !== 'string') {
    return null;
  }
  
  const validInteractionTypes = ['click', 'read_time', 'share', 'bookmark', 'like', 'comment', 'save_later'];
  if (!body.interactionType || !validInteractionTypes.includes(body.interactionType)) {
    return null;
  }
  
  // Validate interaction value if provided
  if (body.interactionValue !== undefined) {
    if (typeof body.interactionValue !== 'number' || body.interactionValue < 0) {
      return null;
    }
    
    // Specific validation for read_time
    if (body.interactionType === 'read_time' && body.interactionValue > 3600) { // Max 1 hour
      return null;
    }
  }
  
  return {
    newsId: body.newsId,
    interactionType: body.interactionType,
    interactionValue: body.interactionValue,
    interactionMetadata: body.interactionMetadata,
    sessionId: body.sessionId,
    referrerUrl: body.referrerUrl
  };
}

// Extract user information from request
function extractUserInfo(event: HandlerEvent): {
  userId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
} {
  // Try to get user ID from JWT token (if authenticated)
  const authHeader = event.headers.authorization || event.headers.Authorization;
  const userId = extractUserIdFromToken(authHeader || '');
  
  const ipAddress = event.headers['x-forwarded-for'] || 
                   event.headers['x-real-ip'] || 
                   event.headers['client-ip'] || 
                   null;
  
  const userAgent = event.headers['user-agent'] || null;
  
  return { userId, ipAddress, userAgent };
}

// Store interaction in database
async function storeInteraction(
  interaction: InteractionRequest,
  userInfo: { userId: string | null; ipAddress: string | null; userAgent: string | null; }
): Promise<string> {
  try {
    const interactionData = {
      user_id: userInfo.userId,
      news_id: interaction.newsId,
      interaction_type: interaction.interactionType,
      interaction_value: interaction.interactionValue,
      interaction_metadata: interaction.interactionMetadata,
      session_id: interaction.sessionId,
      ip_address: userInfo.ipAddress,
      user_agent: userInfo.userAgent,
      referrer_url: interaction.referrerUrl
    };
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/news_user_interactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY!,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(interactionData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Database insert failed: ${response.status} - ${errorText}`);
    }
    
    const insertedInteraction = await response.json();
    const interactionId = insertedInteraction[0]?.id;
    
    if (!interactionId) {
      throw new Error('No interaction ID returned from database');
    }
    
    logInfo('Interaction stored', {
      interactionId,
      newsId: interaction.newsId,
      interactionType: interaction.interactionType,
      userId: userInfo.userId,
      hasValue: interaction.interactionValue !== undefined
    });
    
    return interactionId;
    
  } catch (error) {
    logError('Failed to store interaction', { error, interaction, userInfo });
    throw error;
  }
}

// Update click count for the article
async function updateClickCount(newsId: string): Promise<void> {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/medical_news?id=eq.${newsId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY!
      },
      body: JSON.stringify({
        click_count: 'click_count + 1'
      })
    });
    
    if (!response.ok) {
      logError('Failed to update click count', { 
        newsId, 
        status: response.status,
        statusText: response.statusText 
      });
    }
    
  } catch (error) {
    logError('Error updating click count', { error, newsId });
  }
}

// Calculate and update engagement score
async function updateEngagementScore(newsId: string): Promise<number | null> {
  try {
    // Call the database function to calculate engagement score
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/calculate_engagement_score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY!
      },
      body: JSON.stringify({
        news_id_param: newsId
      })
    });
    
    if (!response.ok) {
      logError('Failed to calculate engagement score', { 
        newsId, 
        status: response.status 
      });
      return null;
    }
    
    const result = await response.json();
    const engagementScore = result || 0;
    
    // Update the article with the new engagement score
    await fetch(`${SUPABASE_URL}/rest/v1/medical_news?id=eq.${newsId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY!
      },
      body: JSON.stringify({
        engagement_score: engagementScore
      })
    });
    
    return engagementScore;
    
  } catch (error) {
    logError('Error updating engagement score', { error, newsId });
    return null;
  }
}

// Check if news article exists
async function validateNewsExists(newsId: string): Promise<boolean> {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/medical_news?id=eq.${newsId}&select=id`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY!
      }
    });
    
    if (!response.ok) {
      return false;
    }
    
    const articles = await response.json();
    return articles.length > 0;
    
  } catch (error) {
    logError('Error validating news existence', { error, newsId });
    return false;
  }
}

// Get bookmarked news for user
async function getBookmarkedNews(userId: string): Promise<any[]> {
  try {
    // First get the user's bookmark interactions
    const interactionsResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/news_user_interactions?user_id=eq.${userId}&interaction_type=eq.bookmark&select=news_id,created_at`, 
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': SUPABASE_SERVICE_ROLE_KEY!
        }
      }
    );
    
    if (!interactionsResponse.ok) {
      throw new Error(`Failed to fetch bookmark interactions: ${interactionsResponse.status}`);
    }
    
    const interactions = await interactionsResponse.json();
    
    if (interactions.length === 0) {
      return [];
    }
    
    // Get the news articles for these bookmarks
    const newsIds = interactions.map((interaction: any) => interaction.news_id);
    const newsIdsFilter = newsIds.map((id: string) => `id.eq.${id}`).join(',');
    
    const newsResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/medical_news?or=(${newsIdsFilter})&processing_status=eq.processed&order=published_date.desc`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': SUPABASE_SERVICE_ROLE_KEY!
        }
      }
    );
    
    if (!newsResponse.ok) {
      throw new Error(`Failed to fetch bookmarked news: ${newsResponse.status}`);
    }
    
    const newsArticles = await newsResponse.json();
    
    // Transform database fields to match TypeScript interface and add bookmark timestamp
    const bookmarkedArticles = newsArticles.map((article: any) => {
      const interaction = interactions.find((int: any) => int.news_id === article.id);
      return {
        id: article.id,
        title: article.title,
        summary: article.summary,
        sourceUrl: article.source_url,
        sourceName: article.source_name,
        category: article.category,
        specialty: article.specialty,
        publishedDate: article.published_date,
        createdAt: article.created_at,
        clickCount: article.click_count,
        engagementScore: article.engagement_score,
        keywords: article.keywords,
        authorName: article.author_name,
        authorAffiliation: article.author_affiliation,
        publicationName: article.publication_name,
        relevanceScore: article.relevance_score,
        credibilityScore: article.credibility_score,
        contentType: article.content_type,
        evidenceLevel: article.evidence_level,
        processingStatus: article.processing_status,
        bookmarkedAt: interaction?.created_at
      };
    });
    
    logInfo('Retrieved bookmarked news', {
      userId,
      count: bookmarkedArticles.length
    });
    
    return bookmarkedArticles;
    
  } catch (error) {
    logError('Error fetching bookmarked news', { error, userId });
    throw error;
  }
}

// Remove bookmark for user
async function removeBookmark(userId: string, newsId: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/news_user_interactions?user_id=eq.${userId}&news_id=eq.${newsId}&interaction_type=eq.bookmark`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': SUPABASE_SERVICE_ROLE_KEY!
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to remove bookmark: ${response.status}`);
    }
    
    logInfo('Bookmark removed', { userId, newsId });
    return true;
    
  } catch (error) {
    logError('Error removing bookmark', { error, userId, newsId });
    throw error;
  }
}

// Extract user ID from JWT token
function extractUserIdFromToken(authHeader: string): string | null {
  try {
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.substring(7);
    
    // Decode JWT payload (without verification - this is just for user ID extraction)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    return payload.sub || null;
    
  } catch (error) {
    logError('Error extracting user ID from token', { error });
    return null;
  }
}

// Main handler
const baseHandler = async (event: HandlerEvent): Promise<HandlerResponse> => {
  try {
    const { method } = parseRequest(event);
    
    // Handle GET requests for fetching bookmarked news
    if (method === 'GET') {
      const authHeader = event.headers.authorization || event.headers.Authorization;
      const userId = extractUserIdFromToken(authHeader || '');
      
      if (!userId) {
        return createErrorResponse('Authentication required', 401);
      }
      
      const bookmarkedArticles = await getBookmarkedNews(userId);
      
      return createSuccessResponse({
        bookmarkedArticles,
        totalCount: bookmarkedArticles.length
      });
    }
    
    // Handle DELETE requests for removing bookmarks
    if (method === 'DELETE') {
      const authHeader = event.headers.authorization || event.headers.Authorization;
      const userId = extractUserIdFromToken(authHeader || '');
      
      if (!userId) {
        return createErrorResponse('Authentication required', 401);
      }
      
      const body = JSON.parse(event.body || '{}');
      if (!body.newsId || !body.interactionType || body.interactionType !== 'bookmark') {
        return createErrorResponse('Invalid delete request', 400);
      }
      
      const success = await removeBookmark(userId, body.newsId);
      
      return createSuccessResponse({
        success,
        message: 'Bookmark removed successfully'
      });
    }
    
    // Handle POST requests for creating interactions
    if (method !== 'POST') {
      return createErrorResponse('Method not allowed', 405);
    }
    
    const body = JSON.parse(event.body || '{}');
    
    // Validate interaction request
    const interaction = validateInteractionRequest(body);
    if (!interaction) {
      return createErrorResponse('Invalid interaction request', 400);
    }
    
    // Extract user information
    const userInfo = extractUserInfo(event);
    
    // Validate that the news article exists
    const newsExists = await validateNewsExists(interaction.newsId);
    if (!newsExists) {
      return createErrorResponse('News article not found', 404);
    }
    
    // Store the interaction
    const interactionId = await storeInteraction(interaction, userInfo);
    
    // Update click count for click interactions
    if (interaction.interactionType === 'click') {
      await updateClickCount(interaction.newsId);
    }
    
    // Update engagement score for significant interactions
    let updatedEngagementScore: number | null = null;
    if (['click', 'read_time', 'share', 'bookmark', 'like'].includes(interaction.interactionType)) {
      updatedEngagementScore = await updateEngagementScore(interaction.newsId);
    }
    
    const response: InteractionResponse = {
      success: true,
      interactionId,
      updatedEngagementScore: updatedEngagementScore || undefined,
      message: 'Interaction recorded successfully'
    };
    
    logInfo('News interaction processed', {
      interactionId,
      newsId: interaction.newsId,
      interactionType: interaction.interactionType,
      userId: userInfo.userId,
      engagementScore: updatedEngagementScore
    });
    
    return createSuccessResponse(response);
    
  } catch (error) {
    logError('News interaction error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return createErrorResponse('Failed to record interaction', 500);
  }
};

// Apply dynamic rate limiting based on interaction type
const handler = async (event: HandlerEvent): Promise<HandlerResponse> => {
  try {
    const body = JSON.parse(event.body || '{}');
    const interactionType = body.interactionType;
    
    // Get appropriate rate limit config based on interaction type
    let rateLimitType = 'search'; // Default
    
    switch (interactionType) {
      case 'click':
        rateLimitType = 'search'; // More permissive for clicks
        break;
      case 'read_time':
      case 'share':
      case 'bookmark':
      case 'like':
      case 'save_later':
        rateLimitType = 'upload'; // More restrictive for engagement actions
        break;
      default:
        rateLimitType = 'search';
    }
    
    const rateLimitedHandler = createRateLimit(rateLimitType);
    return rateLimitedHandler(baseHandler)(event);
  } catch (error) {
    // If we can't parse the body, use default rate limiting
    const defaultRateLimitedHandler = createRateLimit('search');
    return defaultRateLimitedHandler(baseHandler)(event);
  }
};

export { handler };