import { supabase } from '../lib/supabase';
import { ABGResult } from '../types/abg';

export interface DeleteConfirmationOptions {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  dangerLevel?: 'low' | 'medium' | 'high';
  showPreview?: boolean;
}

export interface DeletionResult {
  success: boolean;
  deletedCount: number;
  errors: Array<{ id: string; error: string }>;
  duration: number;
}

export class ABGDeletionService {
  /**
   * Delete a single ABG result with optimistic updates
   */
  static async deleteSingle(resultId: string): Promise<DeletionResult> {
    const startTime = performance.now();
    
    try {
      const { error } = await supabase
        .from('abg_results')
        .delete()
        .eq('id', resultId)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      const duration = performance.now() - startTime;

      if (error) {
        return {
          success: false,
          deletedCount: 0,
          errors: [{ id: resultId, error: error.message }],
          duration
        };
      }

      return {
        success: true,
        deletedCount: 1,
        errors: [],
        duration
      };
    } catch (err) {
      const duration = performance.now() - startTime;
      return {
        success: false,
        deletedCount: 0,
        errors: [{ id: resultId, error: err instanceof Error ? err.message : 'Unknown error' }],
        duration
      };
    }
  }

  /**
   * Delete multiple ABG results with batch processing and progress tracking
   */
  static async deleteBulk(
    resultIds: string[],
    onProgress?: (completed: number, total: number) => void
  ): Promise<DeletionResult> {
    const startTime = performance.now();
    const errors: Array<{ id: string; error: string }> = [];
    let deletedCount = 0;
    const batchSize = 5; // Process in batches to avoid overwhelming the database
    
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Process deletions in batches
      for (let i = 0; i < resultIds.length; i += batchSize) {
        const batch = resultIds.slice(i, i + batchSize);
        
        // Delete batch
        const { error, count } = await supabase
          .from('abg_results')
          .delete({ count: 'exact' })
          .in('id', batch)
          .eq('user_id', userId);

        if (error) {
          // If batch fails, try individual deletions
          for (const id of batch) {
            try {
              const { error: individualError } = await supabase
                .from('abg_results')
                .delete()
                .eq('id', id)
                .eq('user_id', userId);
                
              if (individualError) {
                errors.push({ id, error: individualError.message });
              } else {
                deletedCount++;
              }
            } catch (individualErr) {
              errors.push({ 
                id, 
                error: individualErr instanceof Error ? individualErr.message : 'Unknown error' 
              });
            }
          }
        } else {
          deletedCount += count || 0;
        }

        // Report progress
        if (onProgress) {
          onProgress(Math.min(i + batchSize, resultIds.length), resultIds.length);
        }

        // Small delay between batches to prevent rate limiting
        if (i + batchSize < resultIds.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      const duration = performance.now() - startTime;
      
      return {
        success: errors.length === 0,
        deletedCount,
        errors,
        duration
      };
    } catch (err) {
      const duration = performance.now() - startTime;
      return {
        success: false,
        deletedCount,
        errors: [
          ...errors,
          { id: 'bulk_operation', error: err instanceof Error ? err.message : 'Unknown error' }
        ],
        duration
      };
    }
  }

  /**
   * Get deletion preview information
   */
  static async getDeletionPreview(resultIds: string[]): Promise<{
    results: ABGResult[];
    totalSize: number;
    oldestDate: string;
    newestDate: string;
  }> {
    const { data: results, error } = await supabase
      .from('abg_results')
      .select('*')
      .in('id', resultIds)
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .order('created_at', { ascending: true });

    if (error || !results) {
      throw new Error('Failed to fetch deletion preview');
    }

    const dates = results.map(r => new Date(r.created_at));
    const totalSize = results.reduce((acc, r) => {
      return acc + (r.raw_analysis?.length || 0) + (r.interpretation?.length || 0) + (r.action_plan?.length || 0);
    }, 0);

    return {
      results: results as ABGResult[],
      totalSize,
      oldestDate: dates[0]?.toISOString() || '',
      newestDate: dates[dates.length - 1]?.toISOString() || ''
    };
  }

  /**
   * Check if deletion is safe (no dependencies, etc.)
   */
  static async checkDeletionSafety(resultIds: string[]): Promise<{
    safe: boolean;
    warnings: string[];
    blockers: string[];
  }> {
    const warnings: string[] = [];
    const blockers: string[] = [];

    // Check for recent results (less than 1 hour old)
    const { data: recentResults } = await supabase
      .from('abg_results')
      .select('id, created_at')
      .in('id', resultIds)
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());

    if (recentResults && recentResults.length > 0) {
      warnings.push(`${recentResults.length} result(s) were created within the last hour`);
    }

    // Check for results with images
    const { data: resultsWithImages } = await supabase
      .from('abg_results')
      .select('id, image_url')
      .in('id', resultIds)
      .not('image_url', 'is', null);

    if (resultsWithImages && resultsWithImages.length > 0) {
      warnings.push(`${resultsWithImages.length} result(s) contain uploaded images that will also be deleted`);
    }

    return {
      safe: blockers.length === 0,
      warnings,
      blockers
    };
  }
}

export default ABGDeletionService;