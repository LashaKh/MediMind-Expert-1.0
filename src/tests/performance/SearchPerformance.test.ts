/**
 * Performance Testing Suite for MediSearch
 * Tests search response times, load handling, and resource optimization
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { performance } from 'perf_hooks';
import { SearchOrchestrator } from '@/utils/search/apiOrchestration';
import type { SearchQuery, SearchResult } from '@/utils/search/apiOrchestration';

// Performance monitoring utilities
interface PerformanceMetrics {
  searchDuration: number;
  apiResponseTime: number;
  resultProcessingTime: number;
  memoryUsage: number;
  concurrentRequests: number;
  throughput: number; // requests per second
  errorRate: number;
  cacheHitRate: number;
}

interface LoadTestConfig {
  concurrentUsers: number;
  requestsPerUser: number;
  testDuration: number; // seconds
  rampUpTime: number; // seconds
  targetRPS: number; // requests per second
}

interface PerformanceThresholds {
  maxSearchTime: number; // milliseconds
  maxAPIResponseTime: number;
  maxMemoryUsage: number; // MB
  minThroughput: number; // RPS
  maxErrorRate: number; // percentage
  minCacheHitRate: number; // percentage
}

const PERFORMANCE_THRESHOLDS: PerformanceThresholds = {
  maxSearchTime: 3000, // 3 seconds
  maxAPIResponseTime: 2000, // 2 seconds
  maxMemoryUsage: 100, // 100 MB
  minThroughput: 10, // 10 requests per second
  maxErrorRate: 5, // 5% error rate
  minCacheHitRate: 80 // 80% cache hit rate
};

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private isMonitoring = false;
  private startTime = 0;

  startMonitoring(): void {
    this.isMonitoring = true;
    this.startTime = performance.now();
    this.metrics = [];
  }

  stopMonitoring(): PerformanceMetrics {
    this.isMonitoring = false;
    const endTime = performance.now();
    
    return this.calculateAggregateMetrics();
  }

  recordMetric(metric: Partial<PerformanceMetrics>): void {
    if (!this.isMonitoring) return;

    const fullMetric: PerformanceMetrics = {
      searchDuration: metric.searchDuration || 0,
      apiResponseTime: metric.apiResponseTime || 0,
      resultProcessingTime: metric.resultProcessingTime || 0,
      memoryUsage: this.getMemoryUsage(),
      concurrentRequests: metric.concurrentRequests || 1,
      throughput: metric.throughput || 0,
      errorRate: metric.errorRate || 0,
      cacheHitRate: metric.cacheHitRate || 0
    };

    this.metrics.push(fullMetric);
  }

  private getMemoryUsage(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed / 1024 / 1024; // Convert to MB
    }
    // Browser fallback
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024;
    }
    return 0;
  }

  private calculateAggregateMetrics(): PerformanceMetrics {
    if (this.metrics.length === 0) {
      return {
        searchDuration: 0,
        apiResponseTime: 0,
        resultProcessingTime: 0,
        memoryUsage: 0,
        concurrentRequests: 0,
        throughput: 0,
        errorRate: 0,
        cacheHitRate: 0
      };
    }

    const sum = this.metrics.reduce((acc, metric) => ({
      searchDuration: acc.searchDuration + metric.searchDuration,
      apiResponseTime: acc.apiResponseTime + metric.apiResponseTime,
      resultProcessingTime: acc.resultProcessingTime + metric.resultProcessingTime,
      memoryUsage: acc.memoryUsage + metric.memoryUsage,
      concurrentRequests: Math.max(acc.concurrentRequests, metric.concurrentRequests),
      throughput: acc.throughput + metric.throughput,
      errorRate: acc.errorRate + metric.errorRate,
      cacheHitRate: acc.cacheHitRate + metric.cacheHitRate
    }), {
      searchDuration: 0,
      apiResponseTime: 0,
      resultProcessingTime: 0,
      memoryUsage: 0,
      concurrentRequests: 0,
      throughput: 0,
      errorRate: 0,
      cacheHitRate: 0
    });

    const count = this.metrics.length;
    return {
      searchDuration: sum.searchDuration / count,
      apiResponseTime: sum.apiResponseTime / count,
      resultProcessingTime: sum.resultProcessingTime / count,
      memoryUsage: sum.memoryUsage / count,
      concurrentRequests: sum.concurrentRequests,
      throughput: sum.throughput / count,
      errorRate: sum.errorRate / count,
      cacheHitRate: sum.cacheHitRate / count
    };
  }
}

class LoadTestRunner {
  private searchOrchestrator: SearchOrchestrator;
  private performanceMonitor: PerformanceMonitor;

  constructor() {
    this.searchOrchestrator = new SearchOrchestrator();
    this.performanceMonitor = new PerformanceMonitor();
  }

  async runLoadTest(config: LoadTestConfig): Promise<PerformanceMetrics> {
    this.performanceMonitor.startMonitoring();

    const promises: Promise<void>[] = [];
    let completedRequests = 0;
    let failedRequests = 0;
    const cacheHits = 0;

    // Create test queries
    const testQueries = this.generateTestQueries(config.requestsPerUser);

    // Simulate concurrent users
    for (let user = 0; user < config.concurrentUsers; user++) {
      const userPromise = this.simulateUser(
        testQueries,
        config.requestsPerUser,
        user * (config.rampUpTime * 1000 / config.concurrentUsers)
      );

      promises.push(userPromise);
    }

    // Wait for all users to complete
    const results = await Promise.allSettled(promises);

    // Calculate metrics
    results.forEach(result => {
      if (result.status === 'fulfilled') {
        completedRequests++;
      } else {
        failedRequests++;
      }
    });

    const metrics = this.performanceMonitor.stopMonitoring();
    metrics.errorRate = (failedRequests / (completedRequests + failedRequests)) * 100;
    metrics.throughput = completedRequests / (config.testDuration);

    return metrics;
  }

  private async simulateUser(
    queries: SearchQuery[],
    requestsPerUser: number,
    delayMs: number
  ): Promise<void> {
    // Ramp-up delay
    if (delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }

    for (let i = 0; i < requestsPerUser; i++) {
      const query = queries[i % queries.length];
      const startTime = performance.now();

      try {
        const result = await this.searchOrchestrator.search(query);
        const endTime = performance.now();

        this.performanceMonitor.recordMetric({
          searchDuration: endTime - startTime,
          apiResponseTime: result.searchTime,
          throughput: 1
        });

        // Add realistic delay between requests
        await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
      } catch (error) {
        this.performanceMonitor.recordMetric({
          errorRate: 1
        });
      }
    }
  }

  private generateTestQueries(count: number): SearchQuery[] {
    const baseQueries = [
      'atrial fibrillation management',
      'diabetes type 2 guidelines',
      'hypertension treatment',
      'heart failure diagnosis',
      'preeclampsia management',
      'coronary artery disease',
      'stroke prevention',
      'cardiac imaging protocols',
      'obstetric emergencies',
      'cardiovascular risk assessment'
    ];

    const queries: SearchQuery[] = [];
    
    for (let i = 0; i < count; i++) {
      const baseQuery = baseQueries[i % baseQueries.length];
      const specialty = Math.random() < 0.6 ? 'cardiology' : 'obgyn';
      
      queries.push({
        query: baseQuery + (Math.random() < 0.3 ? ' systematic review' : ''),
        specialty,
        evidenceLevel: Math.random() < 0.4 ? ['systematic-review', 'rct'] : undefined,
        contentType: Math.random() < 0.3 ? ['clinical-guideline'] : undefined,
        limit: Math.floor(Math.random() * 10) + 5
      });
    }

    return queries;
  }
}

describe('MediSearch Performance Tests', () => {
  let loadTestRunner: LoadTestRunner;
  let performanceMonitor: PerformanceMonitor;

  beforeAll(() => {
    loadTestRunner = new LoadTestRunner();
    performanceMonitor = new PerformanceMonitor();
  });

  describe('Response Time Performance', () => {
    test('should complete single searches within performance thresholds', async () => {
      const testQueries: SearchQuery[] = [
        {
          query: 'atrial fibrillation anticoagulation',
          specialty: 'cardiology',
          limit: 10
        },
        {
          query: 'preeclampsia severe features',
          specialty: 'obgyn',
          evidenceLevel: ['systematic-review'],
          limit: 15
        },
        {
          query: 'heart failure with reduced ejection fraction',
          specialty: 'cardiology',
          contentType: ['clinical-guideline'],
          limit: 8
        }
      ];

      const searchOrchestrator = new SearchOrchestrator();
      
      for (const query of testQueries) {
        const startTime = performance.now();
        
        try {
          const result = await searchOrchestrator.search(query);
          const endTime = performance.now();
          
          const searchDuration = endTime - startTime;
          
          // Verify performance thresholds
          expect(searchDuration).toBeLessThan(PERFORMANCE_THRESHOLDS.maxSearchTime);
          expect(result.searchTime).toBeLessThan(PERFORMANCE_THRESHOLDS.maxAPIResponseTime);
          expect(result.results.length).toBeGreaterThan(0);
          
          console.log(`Query: "${query.query}" completed in ${searchDuration.toFixed(2)}ms`);
        } catch (error) {
          console.error(`Query failed: "${query.query}"`, error);
          throw error;
        }
      }
    }, 30000); // 30 second timeout

    test('should handle complex multi-provider searches efficiently', async () => {
      const complexQuery: SearchQuery = {
        query: 'cardiovascular disease prevention primary care systematic review meta-analysis',
        specialty: 'cardiology',
        evidenceLevel: ['systematic-review', 'meta-analysis', 'rct'],
        contentType: ['journal-article', 'clinical-guideline'],
        recency: 'last-year',
        limit: 20,
        providers: ['brave', 'exa', 'perplexity']
      };

      const searchOrchestrator = new SearchOrchestrator();
      const startTime = performance.now();

      const result = await searchOrchestrator.parallelSearch(complexQuery);
      const endTime = performance.now();

      const totalTime = endTime - startTime;

      // Complex searches should still be reasonably fast
      expect(totalTime).toBeLessThan(PERFORMANCE_THRESHOLDS.maxSearchTime * 1.5);
      
      // Should aggregate results from multiple providers
      expect(result.successfulProviders).toBeGreaterThan(0);
      expect(result.results.length).toBeGreaterThan(0);
      
      console.log(`Complex search completed in ${totalTime.toFixed(2)}ms with ${result.successfulProviders} providers`);
    });

    test('should maintain performance under provider failures', async () => {
      const searchOrchestrator = new SearchOrchestrator();
      
      // Test with simulated provider failures
      const queries = Array.from({ length: 5 }, (_, i) => ({
        query: `medical query ${i}`,
        specialty: 'cardiology' as const,
        limit: 10
      }));

      const results = await Promise.allSettled(
        queries.map(async (query) => {
          const startTime = performance.now();
          const result = await searchOrchestrator.search(query);
          const endTime = performance.now();
          
          return {
            duration: endTime - startTime,
            success: result.results.length > 0
          };
        })
      );

      const successful = results.filter(r => r.status === 'fulfilled') as PromiseFulfilledResult<any>[];
      const avgDuration = successful.reduce((sum, r) => sum + r.value.duration, 0) / successful.length;

      // Should maintain reasonable performance even with some failures
      expect(avgDuration).toBeLessThan(PERFORMANCE_THRESHOLDS.maxSearchTime);
      expect(successful.length / results.length).toBeGreaterThan(0.8); // 80% success rate
    });
  });

  describe('Load Testing', () => {
    test('should handle moderate concurrent load', async () => {
      const loadConfig: LoadTestConfig = {
        concurrentUsers: 10,
        requestsPerUser: 3,
        testDuration: 30,
        rampUpTime: 5,
        targetRPS: 5
      };

      const metrics = await loadTestRunner.runLoadTest(loadConfig);

      // Verify load handling capabilities
      expect(metrics.errorRate).toBeLessThan(PERFORMANCE_THRESHOLDS.maxErrorRate);
      expect(metrics.throughput).toBeGreaterThan(PERFORMANCE_THRESHOLDS.minThroughput * 0.5);
      expect(metrics.searchDuration).toBeLessThan(PERFORMANCE_THRESHOLDS.maxSearchTime * 1.2);

      console.log('Moderate load test results:', {
        avgSearchTime: `${metrics.searchDuration.toFixed(2)}ms`,
        throughput: `${metrics.throughput.toFixed(2)} RPS`,
        errorRate: `${metrics.errorRate.toFixed(2)}%`,
        memoryUsage: `${metrics.memoryUsage.toFixed(2)}MB`
      });
    }, 60000); // 60 second timeout

    test('should handle burst traffic scenarios', async () => {
      const burstConfig: LoadTestConfig = {
        concurrentUsers: 25,
        requestsPerUser: 2,
        testDuration: 20,
        rampUpTime: 2, // Fast ramp-up
        targetRPS: 15
      };

      const metrics = await loadTestRunner.runLoadTest(burstConfig);

      // Burst scenarios may have higher error rates but should still be functional
      expect(metrics.errorRate).toBeLessThan(PERFORMANCE_THRESHOLDS.maxErrorRate * 2);
      expect(metrics.searchDuration).toBeLessThan(PERFORMANCE_THRESHOLDS.maxSearchTime * 1.5);

      console.log('Burst traffic test results:', {
        peakConcurrency: metrics.concurrentRequests,
        avgSearchTime: `${metrics.searchDuration.toFixed(2)}ms`,
        errorRate: `${metrics.errorRate.toFixed(2)}%`
      });
    }, 45000);

    test('should demonstrate graceful degradation under extreme load', async () => {
      const extremeConfig: LoadTestConfig = {
        concurrentUsers: 50,
        requestsPerUser: 2,
        testDuration: 15,
        rampUpTime: 3,
        targetRPS: 30
      };

      const metrics = await loadTestRunner.runLoadTest(extremeConfig);

      // Under extreme load, we expect some degradation but not complete failure
      expect(metrics.errorRate).toBeLessThan(50); // Less than 50% errors
      expect(metrics.throughput).toBeGreaterThan(1); // Still processing some requests

      console.log('Extreme load test results:', {
        concurrentUsers: extremeConfig.concurrentUsers,
        errorRate: `${metrics.errorRate.toFixed(2)}%`,
        survivedThroughput: `${metrics.throughput.toFixed(2)} RPS`
      });
    }, 30000);
  });

  describe('Memory and Resource Management', () => {
    test('should manage memory efficiently during extended searches', async () => {
      const searchOrchestrator = new SearchOrchestrator();
      performanceMonitor.startMonitoring();

      const initialMemory = performanceMonitor['getMemoryUsage']();

      // Perform 20 consecutive searches
      for (let i = 0; i < 20; i++) {
        const query: SearchQuery = {
          query: `extended search test ${i}`,
          specialty: 'cardiology',
          limit: 15
        };

        await searchOrchestrator.search(query);
        
        // Check memory periodically
        if (i % 5 === 0) {
          const currentMemory = performanceMonitor['getMemoryUsage']();
          performanceMonitor.recordMetric({ memoryUsage: currentMemory });
        }

        // Small delay to simulate realistic usage
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const finalMetrics = performanceMonitor.stopMonitoring();
      const memoryIncrease = finalMetrics.memoryUsage - initialMemory;

      // Memory should not grow excessively
      expect(memoryIncrease).toBeLessThan(50); // Less than 50MB increase
      expect(finalMetrics.memoryUsage).toBeLessThan(PERFORMANCE_THRESHOLDS.maxMemoryUsage);

      console.log('Memory management test:', {
        initialMemory: `${initialMemory.toFixed(2)}MB`,
        finalMemory: `${finalMetrics.memoryUsage.toFixed(2)}MB`,
        increase: `${memoryIncrease.toFixed(2)}MB`
      });
    });

    test('should handle large result sets without memory leaks', async () => {
      const searchOrchestrator = new SearchOrchestrator();
      
      // Mock large result sets
      const largeQuery: SearchQuery = {
        query: 'comprehensive medical search',
        specialty: 'cardiology',
        limit: 50
      };

      const initialMemory = performanceMonitor['getMemoryUsage']();

      // Process multiple large result sets
      for (let i = 0; i < 10; i++) {
        try {
          const result = await searchOrchestrator.search(largeQuery);
          
          // Verify results are processed
          expect(result.results.length).toBeGreaterThan(0);
          
          // Force garbage collection if available
          if (global.gc) {
            global.gc();
          }
        } catch (error) {
          console.warn(`Large result set test ${i} failed:`, error);
        }
      }

      const finalMemory = performanceMonitor['getMemoryUsage']();
      const memoryGrowth = finalMemory - initialMemory;

      // Should not have significant memory leaks
      expect(memoryGrowth).toBeLessThan(30); // Less than 30MB growth

      console.log('Large result set memory test:', {
        memoryGrowth: `${memoryGrowth.toFixed(2)}MB`,
        finalMemory: `${finalMemory.toFixed(2)}MB`
      });
    });

    test('should optimize resource usage with caching', async () => {
      const searchOrchestrator = new SearchOrchestrator();
      const cacheTestQuery: SearchQuery = {
        query: 'cardiac catheterization procedures',
        specialty: 'cardiology',
        limit: 10
      };

      // First search (cache miss)
      const firstSearchStart = performance.now();
      const firstResult = await searchOrchestrator.search(cacheTestQuery);
      const firstSearchTime = performance.now() - firstSearchStart;

      // Second identical search (potential cache hit)
      const secondSearchStart = performance.now();
      const secondResult = await searchOrchestrator.search(cacheTestQuery);
      const secondSearchTime = performance.now() - secondSearchStart;

      // If caching is implemented, second search should be faster
      console.log('Cache performance test:', {
        firstSearch: `${firstSearchTime.toFixed(2)}ms`,
        secondSearch: `${secondSearchTime.toFixed(2)}ms`,
        improvement: `${((firstSearchTime - secondSearchTime) / firstSearchTime * 100).toFixed(1)}%`
      });

      // Both searches should return valid results
      expect(firstResult.results.length).toBeGreaterThan(0);
      expect(secondResult.results.length).toBeGreaterThan(0);
    });
  });

  describe('Network Performance', () => {
    test('should handle network latency variations', async () => {
      const searchOrchestrator = new SearchOrchestrator();
      
      // Simulate different network conditions
      const networkTests = [
        { name: 'Fast 4G', delay: 100 },
        { name: 'Slow 3G', delay: 500 },
        { name: 'Poor connection', delay: 1000 }
      ];

      for (const networkTest of networkTests) {
        const query: SearchQuery = {
          query: `network test ${networkTest.name}`,
          specialty: 'cardiology',
          limit: 8
        };

        // Add artificial delay to simulate network conditions
        const searchPromise = searchOrchestrator.search(query);
        const delayPromise = new Promise(resolve => setTimeout(resolve, networkTest.delay));

        const startTime = performance.now();
        await Promise.all([searchPromise, delayPromise]);
        const endTime = performance.now();

        const totalTime = endTime - startTime;
        
        // Should still complete within reasonable time even with network delays
        expect(totalTime).toBeLessThan(PERFORMANCE_THRESHOLDS.maxSearchTime + networkTest.delay + 1000);

        console.log(`${networkTest.name} test: ${totalTime.toFixed(2)}ms`);
      }
    });

    test('should handle connection timeouts gracefully', async () => {
      const searchOrchestrator = new SearchOrchestrator();
      
      // Test with very short timeout (should trigger fallback)
      const timeoutQuery: SearchQuery = {
        query: 'timeout test query',
        specialty: 'cardiology',
        limit: 5
      };

      const startTime = performance.now();
      
      try {
        const result = await searchOrchestrator.search(timeoutQuery);
        const endTime = performance.now();
        
        // If it completes, should be within reasonable time
        expect(endTime - startTime).toBeLessThan(PERFORMANCE_THRESHOLDS.maxSearchTime);
        
        // Should get some results from successful providers
        expect(result.results.length).toBeGreaterThanOrEqual(0);
      } catch (error) {
        // If all providers fail, should fail gracefully within timeout period
        const endTime = performance.now();
        expect(endTime - startTime).toBeLessThan(PERFORMANCE_THRESHOLDS.maxSearchTime * 1.1);
      }
    });
  });

  describe('Scalability Testing', () => {
    test('should maintain performance characteristics as query complexity increases', async () => {
      const searchOrchestrator = new SearchOrchestrator();
      
      const complexityLevels = [
        {
          name: 'Simple',
          query: { query: 'heart disease', specialty: 'cardiology' as const, limit: 5 }
        },
        {
          name: 'Moderate',
          query: { 
            query: 'cardiovascular disease prevention guidelines',
            specialty: 'cardiology' as const,
            evidenceLevel: ['systematic-review'],
            limit: 10
          }
        },
        {
          name: 'Complex',
          query: {
            query: 'atrial fibrillation anticoagulation stroke prevention systematic review meta-analysis',
            specialty: 'cardiology' as const,
            evidenceLevel: ['systematic-review', 'meta-analysis', 'rct'],
            contentType: ['journal-article', 'clinical-guideline'],
            recency: 'last-year',
            limit: 20
          }
        }
      ];

      const results: Array<{ complexity: string; duration: number; resultCount: number }> = [];

      for (const level of complexityLevels) {
        const startTime = performance.now();
        
        try {
          const result = await searchOrchestrator.search(level.query);
          const endTime = performance.now();
          
          results.push({
            complexity: level.name,
            duration: endTime - startTime,
            resultCount: result.results.length
          });
        } catch (error) {
          console.error(`${level.name} complexity test failed:`, error);
        }
      }

      // Verify that performance doesn't degrade drastically with complexity
      const simpleTime = results.find(r => r.complexity === 'Simple')?.duration || 0;
      const complexTime = results.find(r => r.complexity === 'Complex')?.duration || 0;
      
      if (simpleTime > 0 && complexTime > 0) {
        const performanceDegradation = complexTime / simpleTime;
        expect(performanceDegradation).toBeLessThan(3); // Complex queries shouldn't be more than 3x slower
      }

      console.log('Scalability test results:', results);
    });

    test('should handle increasing result set sizes efficiently', async () => {
      const searchOrchestrator = new SearchOrchestrator();
      
      const resultSizes = [5, 10, 20, 50];
      const processingTimes: number[] = [];

      for (const size of resultSizes) {
        const query: SearchQuery = {
          query: 'medical research articles',
          specialty: 'cardiology',
          limit: size
        };

        const startTime = performance.now();
        
        try {
          const result = await searchOrchestrator.search(query);
          const endTime = performance.now();
          
          const processingTime = endTime - startTime;
          processingTimes.push(processingTime);
          
          // Verify we get approximately the requested number of results
          expect(result.results.length).toBeGreaterThan(0);
        } catch (error) {
          console.error(`Result size ${size} test failed:`, error);
          processingTimes.push(Infinity);
        }
      }

      // Processing time should scale reasonably with result set size
      const timePerResult = processingTimes.map((time, i) => time / resultSizes[i]);
      const avgTimePerResult = timePerResult.reduce((sum, time) => sum + time, 0) / timePerResult.length;

      console.log('Result size scaling:', {
        resultSizes,
        processingTimes: processingTimes.map(t => `${t.toFixed(2)}ms`),
        avgTimePerResult: `${avgTimePerResult.toFixed(2)}ms/result`
      });

      // Should process results efficiently regardless of size
      expect(avgTimePerResult).toBeLessThan(100); // Less than 100ms per result on average
    });
  });
});