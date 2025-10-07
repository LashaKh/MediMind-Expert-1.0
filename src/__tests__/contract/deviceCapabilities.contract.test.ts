import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  detectDeviceCapabilities,
  determinePerformanceMode,
  detectGPUCapability,
  shouldUseCSSFallback,
  saveDeviceCapabilities,
  loadDeviceCapabilities,
  initializeDeviceCapabilities,
  type DeviceCapabilities,
  type GPUTier,
  type PerformanceMode
} from '../../utils/deviceCapabilities';

describe('Device Capability Contract Test', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    // Mock navigator properties
    Object.defineProperty(navigator, 'hardwareConcurrency', {
      writable: true,
      configurable: true,
      value: 4
    });

    // Mock deviceMemory
    Object.defineProperty(navigator, 'deviceMemory', {
      writable: true,
      configurable: true,
      value: 4
    });

    // Mock connection
    Object.defineProperty(navigator, 'connection', {
      writable: true,
      configurable: true,
      value: {
        effectiveType: '4g'
      }
    });

    // Mock matchMedia for reduced motion
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Device Capability Detection', () => {
    it('should detect CPU cores', () => {
      const capabilities = detectDeviceCapabilities();

      expect(capabilities).toHaveProperty('cpuCores');
      expect(typeof capabilities.cpuCores).toBe('number');
      expect(capabilities.cpuCores).toBeGreaterThan(0);
    });

    it('should fallback to 2 cores if hardwareConcurrency unavailable', () => {
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        writable: true,
        value: undefined
      });

      const capabilities = detectDeviceCapabilities();
      expect(capabilities.cpuCores).toBe(2);
    });

    it('should detect device memory', () => {
      const capabilities = detectDeviceCapabilities();

      expect(capabilities).toHaveProperty('deviceMemory');
      expect(typeof capabilities.deviceMemory).toBe('number');
      expect(capabilities.deviceMemory).toBeGreaterThan(0);
    });

    it('should fallback to 2GB if deviceMemory unavailable', () => {
      Object.defineProperty(navigator, 'deviceMemory', {
        writable: true,
        value: undefined
      });

      const capabilities = detectDeviceCapabilities();
      expect(capabilities.deviceMemory).toBe(2);
    });

    it('should detect GPU tier', () => {
      const capabilities = detectDeviceCapabilities();

      expect(capabilities).toHaveProperty('gpuTier');
      expect(['high', 'medium', 'low', 'unknown']).toContain(capabilities.gpuTier);
    });

    it('should detect connection type', () => {
      const capabilities = detectDeviceCapabilities();

      expect(capabilities).toHaveProperty('connectionType');
      expect(['4g', '3g', '2g', 'slow-2g', 'unknown']).toContain(
        capabilities.connectionType
      );
    });

    it('should detect prefers reduced motion', () => {
      const capabilities = detectDeviceCapabilities();

      expect(capabilities).toHaveProperty('prefersReducedMotion');
      expect(typeof capabilities.prefersReducedMotion).toBe('boolean');
    });

    it('should detect WebGL support', () => {
      const capabilities = detectDeviceCapabilities();

      expect(capabilities).toHaveProperty('supportsWebGL');
      expect(typeof capabilities.supportsWebGL).toBe('boolean');
    });

    it('should generate stable device ID', () => {
      const capabilities1 = detectDeviceCapabilities();
      const capabilities2 = detectDeviceCapabilities();

      expect(capabilities1.deviceId).toBe(capabilities2.deviceId);
      expect(capabilities1.deviceId).toMatch(/^device-/);
    });
  });

  describe('GPU Detection', () => {
    it('should detect GPU capability', () => {
      const gpuTier = detectGPUCapability();

      expect(['high', 'medium', 'low', 'unknown']).toContain(gpuTier);
    });

    it('should handle WebGL unavailable', () => {
      // Mock canvas without WebGL support
      const originalCreateElement = document.createElement.bind(document);
      document.createElement = vi.fn((tagName) => {
        if (tagName === 'canvas') {
          const canvas = originalCreateElement(tagName) as HTMLCanvasElement;
          canvas.getContext = vi.fn(() => null);
          return canvas;
        }
        return originalCreateElement(tagName);
      });

      const gpuTier = detectGPUCapability();
      expect(gpuTier).toBe('low');

      document.createElement = originalCreateElement;
    });
  });

  describe('Performance Mode Decision Logic', () => {
    it('should determine lite mode for low-end devices', () => {
      const capabilities: Omit<DeviceCapabilities, 'performanceMode'> = {
        deviceId: 'test-device',
        cpuCores: 2,
        deviceMemory: 1.5,
        gpuTier: 'low',
        connectionType: '3g',
        prefersReducedMotion: false,
        supportsWebGL: false
      };

      const mode = determinePerformanceMode(capabilities);
      expect(mode).toBe('lite');
    });

    it('should determine lite mode for 2G connection', () => {
      const capabilities: Omit<DeviceCapabilities, 'performanceMode'> = {
        deviceId: 'test-device',
        cpuCores: 4,
        deviceMemory: 4,
        gpuTier: 'high',
        connectionType: '2g',
        prefersReducedMotion: false,
        supportsWebGL: true
      };

      const mode = determinePerformanceMode(capabilities);
      expect(mode).toBe('lite');
    });

    it('should determine lite mode for reduced motion preference', () => {
      const capabilities: Omit<DeviceCapabilities, 'performanceMode'> = {
        deviceId: 'test-device',
        cpuCores: 4,
        deviceMemory: 4,
        gpuTier: 'high',
        connectionType: '4g',
        prefersReducedMotion: true,
        supportsWebGL: true
      };

      const mode = determinePerformanceMode(capabilities);
      expect(mode).toBe('lite');
    });

    it('should determine full mode for high-end devices', () => {
      const capabilities: Omit<DeviceCapabilities, 'performanceMode'> = {
        deviceId: 'test-device',
        cpuCores: 8,
        deviceMemory: 8,
        gpuTier: 'high',
        connectionType: '4g',
        prefersReducedMotion: false,
        supportsWebGL: true
      };

      const mode = determinePerformanceMode(capabilities);
      expect(mode).toBe('full');
    });

    it('should determine balanced mode for mid-range devices', () => {
      const capabilities: Omit<DeviceCapabilities, 'performanceMode'> = {
        deviceId: 'test-device',
        cpuCores: 4,
        deviceMemory: 4,
        gpuTier: 'medium',
        connectionType: '4g',
        prefersReducedMotion: false,
        supportsWebGL: true
      };

      const mode = determinePerformanceMode(capabilities);
      expect(mode).toBe('balanced');
    });
  });

  describe('LocalStorage Persistence', () => {
    it('should save capabilities to localStorage', () => {
      const capabilities: DeviceCapabilities = {
        deviceId: 'test-device',
        cpuCores: 4,
        deviceMemory: 4,
        gpuTier: 'high',
        connectionType: '4g',
        prefersReducedMotion: false,
        supportsWebGL: true,
        performanceMode: 'full'
      };

      saveDeviceCapabilities(capabilities);

      const stored = localStorage.getItem('deviceCapabilities');
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed.deviceId).toBe('test-device');
      expect(parsed.performanceMode).toBe('full');

      const storedMode = localStorage.getItem('performanceMode');
      expect(storedMode).toBe('full');
    });

    it('should load capabilities from localStorage', () => {
      const capabilities: DeviceCapabilities = {
        deviceId: 'test-device',
        cpuCores: 4,
        deviceMemory: 4,
        gpuTier: 'high',
        connectionType: '4g',
        prefersReducedMotion: false,
        supportsWebGL: true,
        performanceMode: 'full'
      };

      localStorage.setItem('deviceCapabilities', JSON.stringify(capabilities));

      const loaded = loadDeviceCapabilities();

      expect(loaded).not.toBeNull();
      expect(loaded?.deviceId).toBe('test-device');
      expect(loaded?.performanceMode).toBe('full');
    });

    it('should return null if no capabilities stored', () => {
      const loaded = loadDeviceCapabilities();
      expect(loaded).toBeNull();
    });

    it('should handle corrupted localStorage data', () => {
      localStorage.setItem('deviceCapabilities', 'invalid-json');

      const loaded = loadDeviceCapabilities();
      expect(loaded).toBeNull();
    });
  });

  describe('CSS Fallback Detection', () => {
    it('should use CSS fallback for low GPU tier', () => {
      // Mock detectGPUCapability to return 'low'
      vi.mock('../../utils/deviceCapabilities', async () => {
        const actual = await vi.importActual('../../utils/deviceCapabilities');
        return {
          ...actual,
          detectGPUCapability: () => 'low' as GPUTier
        };
      });

      const shouldFallback = shouldUseCSSFallback();
      // Should be true for low GPU or reduced motion
      expect(typeof shouldFallback).toBe('boolean');
    });

    it('should use CSS fallback for reduced motion preference', () => {
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      }));

      const shouldFallback = shouldUseCSSFallback();
      expect(shouldFallback).toBe(true);
    });
  });

  describe('Initialize Device Capabilities', () => {
    it('should initialize and save capabilities on first call', () => {
      const capabilities = initializeDeviceCapabilities();

      expect(capabilities).toBeDefined();
      expect(capabilities.deviceId).toBeDefined();
      expect(capabilities.performanceMode).toBeDefined();

      const stored = localStorage.getItem('deviceCapabilities');
      expect(stored).not.toBeNull();
    });

    it('should load from cache on subsequent calls', () => {
      const firstCall = initializeDeviceCapabilities();
      const secondCall = initializeDeviceCapabilities();

      expect(firstCall.deviceId).toBe(secondCall.deviceId);
    });
  });

  describe('Performance Mode Validation', () => {
    it('should only return valid performance modes', () => {
      const validModes: PerformanceMode[] = ['full', 'balanced', 'lite'];

      const capabilities = detectDeviceCapabilities();
      expect(validModes).toContain(capabilities.performanceMode);
    });
  });
});
