export type GPUTier = 'high' | 'medium' | 'low' | 'unknown';
export type ConnectionType = '4g' | '3g' | '2g' | 'slow-2g' | 'unknown';
export type PerformanceMode = 'full' | 'balanced' | 'lite';

export interface DeviceCapabilities {
  deviceId: string;
  cpuCores: number;
  deviceMemory: number; // GB
  gpuTier: GPUTier;
  connectionType: ConnectionType;
  prefersReducedMotion: boolean;
  supportsWebGL: boolean;
  performanceMode: PerformanceMode;
}

/**
 * Detects GPU capability using WebGL renderer information
 */
export function detectGPUCapability(): GPUTier {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (!gl) return 'low';

    // @ts-ignore - WEBGL_debug_renderer_info is not in TS types
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      // @ts-ignore
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

      // Dedicated GPUs (high performance)
      if (/NVIDIA|AMD Radeon|Radeon.*RX|GeForce/i.test(renderer)) {
        return 'high';
      }

      // Integrated GPUs (low performance)
      if (/Intel.*HD|Intel.*UHD|Intel.*Graphics/i.test(renderer)) {
        return 'low';
      }

      // Apple/ARM GPUs (medium-high)
      if (/Apple|Mali|Adreno/i.test(renderer)) {
        return 'medium';
      }
    }

    return 'medium'; // Unknown, assume medium
  } catch (error) {
    return 'unknown';
  }
}

/**
 * Determines if CSS fallbacks should be used based on GPU capability and user preferences
 */
export function shouldUseCSSFallback(): boolean {
  const gpuTier = detectGPUCapability();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return gpuTier === 'low' || reducedMotion;
}

/**
 * Detects comprehensive device capabilities
 */
export function detectDeviceCapabilities(): DeviceCapabilities {
  // Generate or retrieve stable device ID
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('deviceId', deviceId);
  }

  // CPU cores (default to 2 if unavailable)
  const cpuCores = navigator.hardwareConcurrency || 2;

  // Device memory (default to 2GB if unavailable)
  const deviceMemory = (navigator as any).deviceMemory || 2;

  // GPU tier
  const gpuTier = detectGPUCapability();

  // Connection type
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  const connectionType: ConnectionType = connection?.effectiveType || 'unknown';

  // Reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // WebGL support
  const canvas = document.createElement('canvas');
  const supportsWebGL = !!(
    canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
  );

  // Determine performance mode based on capabilities
  const capabilities: Omit<DeviceCapabilities, 'performanceMode'> = {
    deviceId,
    cpuCores,
    deviceMemory,
    gpuTier,
    connectionType,
    prefersReducedMotion,
    supportsWebGL
  };

  const performanceMode = determinePerformanceMode(capabilities);

  return {
    ...capabilities,
    performanceMode
  };
}

/**
 * Determines appropriate performance mode based on device capabilities
 */
export function determinePerformanceMode(
  caps: Omit<DeviceCapabilities, 'performanceMode'>
): PerformanceMode {
  // Lite mode: Low-end device
  if (
    caps.cpuCores <= 2 ||
    caps.deviceMemory < 2 ||
    caps.connectionType === '2g' ||
    caps.connectionType === 'slow-2g' ||
    caps.gpuTier === 'low' ||
    caps.prefersReducedMotion
  ) {
    return 'lite';
  }

  // Full mode: High-end device
  if (
    caps.cpuCores >= 4 &&
    caps.deviceMemory >= 4 &&
    caps.gpuTier === 'high' &&
    (caps.connectionType === '4g' || caps.connectionType === 'unknown')
  ) {
    return 'full';
  }

  // Balanced mode: Mid-range device (default)
  return 'balanced';
}

/**
 * Saves device capabilities to localStorage
 */
export function saveDeviceCapabilities(capabilities: DeviceCapabilities): void {
  try {
    localStorage.setItem('deviceCapabilities', JSON.stringify(capabilities));
    localStorage.setItem('performanceMode', capabilities.performanceMode);
  } catch (error) {
  }
}

/**
 * Loads device capabilities from localStorage
 */
export function loadDeviceCapabilities(): DeviceCapabilities | null {
  try {
    const stored = localStorage.getItem('deviceCapabilities');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
  }
  return null;
}

/**
 * Initializes device capabilities detection and saves to storage
 */
export function initializeDeviceCapabilities(): DeviceCapabilities {
  // Try to load from cache first
  const cached = loadDeviceCapabilities();
  if (cached) {
    return cached;
  }

  // Detect and save new capabilities
  const capabilities = detectDeviceCapabilities();
  saveDeviceCapabilities(capabilities);

  return capabilities;
}
