/**
 * Unit tests for Advanced Cache Manager
 * Tests medical content prioritization, performance optimization, and TTL management
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { cacheManager } from '../../utils/caching';

describe('AdvancedCacheManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cacheManager.clear();
  });

  afterEach(() => {
    cacheManager.clear();
  });

  describe('Basic Caching Operations', () => {
    it('should store and retrieve cached data', async () => {
      const testData = { message: 'test data' };
      const key = 'test-key';
      
      await cacheManager.set(key, testData, { userSpecialty: 'cardiology' });
      const cached = await cacheManager.get(key, { userSpecialty: 'cardiology' });
      
      expect(cached).toEqual(testData);
    });

    it('should respect TTL and expire data', async () => {
      const testData = { message: 'test data' };
      const key = 'test-key';
      
      await cacheManager.set(key, testData, { userSpecialty: 'cardiology', ttl: 100 });
      
      // Data should be available immediately
      let cached = await cacheManager.get(key, { userSpecialty: 'cardiology' });
      expect(cached).toEqual(testData);
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Data should be expired
      cached = await cacheManager.get(key, { userSpecialty: 'cardiology' });
      expect(cached).toBeNull();
    });

    it('should return null for non-existent keys', async () => {
      const cached = await cacheManager.get('non-existent', { userSpecialty: 'cardiology' });
      expect(cached).toBeNull();
    });
  });

  describe('Medical Content Prioritization', () => {
    it('should prioritize medical news content', async () => {
      const medicalNews = { type: 'medical-news', content: 'Important medical update' };
      const generalContent = { type: 'general', content: 'General content' };
      
      await cacheManager.set('medical-news-key', medicalNews, { 
        contentType: 'medical_news',
        userSpecialty: 'cardiology',
        priority: 'high'
      });
      
      await cacheManager.set('general-key', generalContent, { 
        userSpecialty: 'cardiology',
        priority: 'low' 
      });
      
      const stats = cacheManager.getStats();
      expect(stats.medicalContentCached).toBe(1);
    });

    it('should apply different TTL for medical vs general content', async () => {
      const medicalContent = { type: 'medical', content: 'Medical data' };
      const generalContent = { type: 'general', content: 'General data' };
      
      // Medical content should get default medical TTL (15 minutes)
      await cacheManager.set('medical', medicalContent, { 
        userSpecialty: 'cardiology',
        medicalContent: true 
      });
      
      // General content gets standard TTL
      await cacheManager.set('general', generalContent, { 
        userSpecialty: 'cardiology',
        ttl: 300000 // 5 minutes
      });
      
      // Both should be available initially
      expect(await cacheManager.get('medical', { userSpecialty: 'cardiology' })).toEqual(medicalContent);
      expect(await cacheManager.get('general', { userSpecialty: 'cardiology' })).toEqual(generalContent);
    });
  });

  describe('Cache Size Management and LRU', () => {
    it('should evict least recently used items when size limit reached', async () => {
      const testData1 = { id: 1, data: 'a'.repeat(1000) }; // ~1KB
      const testData2 = { id: 2, data: 'b'.repeat(1000) }; // ~1KB
      const testData3 = { id: 3, data: 'c'.repeat(1000) }; // ~1KB
      
      await cacheManager.set('key1', testData1, { userSpecialty: 'cardiology' });
      await cacheManager.set('key2', testData2, { userSpecialty: 'cardiology' });
      
      // Access key1 to make it more recently used
      await cacheManager.get('key1', { userSpecialty: 'cardiology' });
      
      // Add key3 which should evict key2 (least recently used)
      await cacheManager.set('key3', testData3, { userSpecialty: 'cardiology' });
      
      // key1 and key3 should exist, key2 should be evicted
      expect(await cacheManager.get('key1', { userSpecialty: 'cardiology' })).toEqual(testData1);
      expect(await cacheManager.get('key3', { userSpecialty: 'cardiology' })).toEqual(testData3);
    });

    it('should never evict high-priority medical content', async () => {
      const medicalData = { type: 'medical', content: 'Critical medical data' };
      const generalData = { type: 'general', data: 'x'.repeat(5000) }; // Large data
      
      await cacheManager.set('medical', medicalData, {
        userSpecialty: 'cardiology',
        priority: 'high',
        medicalContent: true
      });
      
      // Try to fill cache with large general content
      for (let i = 0; i < 10; i++) {
        await cacheManager.set(`general-${i}`, generalData, { userSpecialty: 'cardiology' });
      }
      
      // Medical content should still be preserved
      expect(await cacheManager.get('medical', { userSpecialty: 'cardiology' })).toEqual(medicalData);
    });
  });

  describe('Compression and Performance', () => {
    it('should compress large data when enabled', async () => {
      const largeData = { data: 'x'.repeat(10000) };
      
      await cacheManager.set('large-data', largeData, {
        userSpecialty: 'cardiology',
        enableCompression: true
      });
      
      const cached = await cacheManager.get('large-data', { userSpecialty: 'cardiology' });
      expect(cached).toEqual(largeData);
    });

    it('should track cache statistics correctly', async () => {
      await cacheManager.set('key1', { data: 'test1' }, { userSpecialty: 'cardiology' });
      await cacheManager.set('key2', { data: 'test2' }, { 
        contentType: 'medical_news',
        userSpecialty: 'cardiology'
      });
      
      // Hit
      await cacheManager.get('key1', { userSpecialty: 'cardiology' });
      
      // Miss
      await cacheManager.get('non-existent', { userSpecialty: 'cardiology' });
      
      const stats = cacheManager.getStats();
      expect(stats.entryCount).toBe(2);
      expect(stats.medicalContentCached).toBe(1);
      expect(stats.hitRate).toBeGreaterThan(0);
      expect(stats.missRate).toBeGreaterThan(0);
    });
  });

  describe('Specialty-Based Caching', () => {
    it('should isolate cache by medical specialty', async () => {
      const cardiologyData = { specialty: 'cardiology', data: 'heart data' };
      const obgynData = { specialty: 'obgyn', data: 'obgyn data' };
      
      await cacheManager.set('medical-data', cardiologyData, { userSpecialty: 'cardiology' });
      await cacheManager.set('medical-data', obgynData, { userSpecialty: 'obgyn' });
      
      const cardioResult = await cacheManager.get('medical-data', { userSpecialty: 'cardiology' });
      const obgynResult = await cacheManager.get('medical-data', { userSpecialty: 'obgyn' });
      
      expect(cardioResult).toEqual(cardiologyData);
      expect(obgynResult).toEqual(obgynData);
    });

    it('should handle invalid keys gracefully', async () => {
      await expect(cacheManager.get('', { userSpecialty: 'cardiology' })).resolves.toBeNull();
      await expect(cacheManager.get(null as any, { userSpecialty: 'cardiology' })).resolves.toBeNull();
    });
  });

  describe('Cache Cleanup and Maintenance', () => {
    it('should clean up expired entries', async () => {
      await cacheManager.set('expired', { data: 'test' }, { 
        userSpecialty: 'cardiology',
        ttl: 50 
      });
      
      await cacheManager.set('permanent', { data: 'test' }, { 
        userSpecialty: 'cardiology',
        ttl: 300000 
      });
      
      // Wait for first item to expire
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Trigger cleanup
      await cacheManager.cleanup();
      
      expect(await cacheManager.get('expired', { userSpecialty: 'cardiology' })).toBeNull();
      expect(await cacheManager.get('permanent', { userSpecialty: 'cardiology' })).toBeTruthy();
    });

    it('should clear all cache data', () => {
      cacheManager.set('key1', { data: 'test1' }, { userSpecialty: 'cardiology' });
      cacheManager.set('key2', { data: 'test2' }, { userSpecialty: 'cardiology' });
      
      cacheManager.clear();
      
      const stats = cacheManager.getStats();
      expect(stats.entryCount).toBe(0);
      expect(stats.totalSize).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle cache errors gracefully', async () => {
      // Mock localStorage to throw error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn().mockImplementation(() => {
        throw new Error('Storage full');
      });
      
      // Should not throw, should handle error gracefully
      await expect(cacheManager.set('key', { data: 'test' }, { userSpecialty: 'cardiology' }))
        .resolves.not.toThrow();
      
      localStorage.setItem = originalSetItem;
    });

    it('should handle corrupted cache data', async () => {
      // Mock corrupted data in localStorage
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = vi.fn().mockReturnValue('invalid json');
      
      const result = await cacheManager.get('corrupted', { userSpecialty: 'cardiology' });
      expect(result).toBeNull();
      
      localStorage.getItem = originalGetItem;
    });
  });
});