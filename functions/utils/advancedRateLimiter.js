/**
 * Advanced Rate Limiting Engine
 * Implements sophisticated rate limiting with behavioral analysis, resource awareness, and dynamic scoring
 */

const crypto = require('crypto');
const { analyzeBehavioralRisk, BEHAVIORAL_CONSTANTS } = require('./behavioralAnalyzer');
// Security monitoring - use simple implementation for compatibility
const SecurityEventType = {
  CORS_VIOLATION: 'CORS_VIOLATION',
  CSRF_VIOLATION: 'CSRF_VIOLATION',
  UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY'
};

function logSecurityEvent(event) {
  console.log('SECURITY_EVENT:', event);
}

function createSecurityEvent(type, event, details = {}, severity = 'medium') {
  return {
    type,
    timestamp: new Date().toISOString(),
    clientId: event.headers?.['x-forwarded-for'] || 'unknown',
    origin: event.headers?.origin,
    userAgent: event.headers?.['user-agent'],
    path: event.path,
    method: event.httpMethod,
    details,
    severity
  };
}

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  // Base rate limits (can be dynamically adjusted)
  DEFAULT_LIMITS: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxUploads: 10,
    maxTotalSize: 100 * 1024 * 1024, // 100MB total per window
    maxProcessingTime: 300 * 1000, // 5 minutes total processing time
  },

  // Dynamic adjustment factors
  ADJUSTMENT_FACTORS: {
    LOW_RISK: 1.0,      // No adjustment
    MEDIUM_RISK: 0.7,   // 30% stricter limits
    HIGH_RISK: 0.4,     // 60% stricter limits
    CRITICAL_RISK: 0.1, // 90% stricter limits
  },

  // Resource-based adjustments
  RESOURCE_FACTORS: {
    MEMORY_USAGE_THRESHOLD: 0.8,     // 80% memory usage
    CPU_USAGE_THRESHOLD: 0.75,       // 75% CPU usage
    DISK_USAGE_THRESHOLD: 0.9,       // 90% disk usage
    ACTIVE_UPLOADS_THRESHOLD: 20,     // Max concurrent uploads
  },

  // File size penalties
  SIZE_PENALTIES: {
    SMALL_FILE: 1.0,    // < 1MB
    MEDIUM_FILE: 1.5,   // 1-10MB
    LARGE_FILE: 2.0,    // 10-25MB
    HUGE_FILE: 3.0,     // > 25MB
  },

  // IP reputation adjustments
  IP_REPUTATION: {
    EXCELLENT: 1.2,     // 20% more lenient
    GOOD: 1.0,          // No adjustment
    SUSPICIOUS: 0.6,    // 40% stricter
    MALICIOUS: 0.1,     // 90% stricter
  }
};

// Advanced rate limiting storage
class AdvancedRateLimitStore {
  constructor() {
    this.rateLimitData = new Map(); // key -> RateLimitEntry
    this.systemMetrics = {
      memoryUsage: 0,
      cpuUsage: 0,
      diskUsage: 0,
      activeUploads: 0,
      lastUpdated: Date.now()
    };
    
    // Cleanup old entries every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
    
    // Update system metrics every 30 seconds
    this.metricsInterval = setInterval(() => this.updateSystemMetrics(), 30 * 1000);
  }

  cleanup() {
    const now = Date.now();
    const cutoffTime = now - (RATE_LIMIT_CONFIG.DEFAULT_LIMITS.windowMs * 2);

    for (const [key, entry] of this.rateLimitData.entries()) {
      // Remove old upload records
      entry.uploads = entry.uploads.filter(upload => upload.timestamp > cutoffTime);
      
      // Remove entry if no recent uploads
      if (entry.uploads.length === 0 && (now - entry.lastAccess) > cutoffTime) {
        this.rateLimitData.delete(key);
      }
    }

    console.log(`Rate limit cleanup completed. Active entries: ${this.rateLimitData.size}`);
  }

  updateSystemMetrics() {
    try {
      const memoryUsage = process.memoryUsage();
      this.systemMetrics = {
        memoryUsage: memoryUsage.heapUsed / memoryUsage.heapTotal,
        cpuUsage: process.cpuUsage ? this.calculateCPUUsage() : 0,
        diskUsage: 0, // Could implement disk usage check if needed
        activeUploads: this.countActiveUploads(),
        lastUpdated: Date.now()
      };
    } catch (error) {
      console.error('Failed to update system metrics:', error);
    }
  }

  calculateCPUUsage() {
    if (!this.lastCpuUsage) {
      this.lastCpuUsage = process.cpuUsage();
      return 0;
    }

    const currentUsage = process.cpuUsage(this.lastCpuUsage);
    const totalTime = currentUsage.user + currentUsage.system;
    const cpuPercent = totalTime / (1000 * 1000); // Convert to percentage
    
    this.lastCpuUsage = process.cpuUsage();
    return Math.min(1, cpuPercent);
  }

  countActiveUploads() {
    const now = Date.now();
    const activeThreshold = 60 * 1000; // 1 minute
    let activeCount = 0;

    for (const entry of this.rateLimitData.values()) {
      const recentUploads = entry.uploads.filter(upload => 
        now - upload.timestamp < activeThreshold && upload.isActive
      );
      activeCount += recentUploads.length;
    }

    return activeCount;
  }

  getRateLimitEntry(key) {
    if (!this.rateLimitData.has(key)) {
      this.rateLimitData.set(key, {
        uploads: [],
        totalSize: 0,
        totalProcessingTime: 0,
        riskScore: 0,
        ipReputation: 'GOOD',
        penalties: 0,
        lastAccess: Date.now(),
        violations: []
      });
    }

    const entry = this.rateLimitData.get(key);
    entry.lastAccess = Date.now();
    return entry;
  }

  recordUpload(key, uploadData) {
    const entry = this.getRateLimitEntry(key);
    const upload = {
      timestamp: Date.now(),
      fileSize: uploadData.fileSize,
      fileType: uploadData.fileType,
      processingTime: uploadData.processingTime || 0,
      isActive: true,
      riskScore: uploadData.riskScore || 0
    };

    entry.uploads.push(upload);
    entry.totalSize += uploadData.fileSize;
    entry.totalProcessingTime += upload.processingTime;
    entry.riskScore = Math.max(entry.riskScore, upload.riskScore);

    return entry;
  }

  markUploadComplete(key, uploadId) {
    const entry = this.rateLimitData.get(key);
    if (entry && entry.uploads[uploadId]) {
      entry.uploads[uploadId].isActive = false;
    }
  }

  getSystemMetrics() {
    return { ...this.systemMetrics };
  }
}

// Global rate limit store
const rateLimitStore = new AdvancedRateLimitStore();

/**
 * Calculate dynamic rate limits based on risk, resources, and reputation
 */
function calculateDynamicLimits(riskLevel, fileSize, ipReputation, systemMetrics) {
  const baseLimits = { ...RATE_LIMIT_CONFIG.DEFAULT_LIMITS };
  
  // Apply risk-based adjustments
  const riskFactor = RATE_LIMIT_CONFIG.ADJUSTMENT_FACTORS[riskLevel.toUpperCase()] || 1.0;
  
  // Apply file size penalties
  let sizeFactor = RATE_LIMIT_CONFIG.SIZE_PENALTIES.SMALL_FILE;
  if (fileSize > 25 * 1024 * 1024) {
    sizeFactor = RATE_LIMIT_CONFIG.SIZE_PENALTIES.HUGE_FILE;
  } else if (fileSize > 10 * 1024 * 1024) {
    sizeFactor = RATE_LIMIT_CONFIG.SIZE_PENALTIES.LARGE_FILE;
  } else if (fileSize > 1024 * 1024) {
    sizeFactor = RATE_LIMIT_CONFIG.SIZE_PENALTIES.MEDIUM_FILE;
  }
  
  // Apply IP reputation adjustments
  const ipFactor = RATE_LIMIT_CONFIG.IP_REPUTATION[ipReputation] || 1.0;
  
  // Apply system resource adjustments
  let resourceFactor = 1.0;
  if (systemMetrics.memoryUsage > RATE_LIMIT_CONFIG.RESOURCE_FACTORS.MEMORY_USAGE_THRESHOLD) {
    resourceFactor *= 0.5; // 50% stricter if memory is high
  }
  if (systemMetrics.cpuUsage > RATE_LIMIT_CONFIG.RESOURCE_FACTORS.CPU_USAGE_THRESHOLD) {
    resourceFactor *= 0.6; // 40% stricter if CPU is high
  }
  if (systemMetrics.activeUploads > RATE_LIMIT_CONFIG.RESOURCE_FACTORS.ACTIVE_UPLOADS_THRESHOLD) {
    resourceFactor *= 0.3; // 70% stricter if too many active uploads
  }
  
  // Calculate final adjustment factor
  const totalFactor = riskFactor * ipFactor * resourceFactor;
  const sizeAdjustment = 1 / sizeFactor; // Larger files count more against limits
  
  // Apply adjustments
  const dynamicLimits = {
    windowMs: baseLimits.windowMs,
    maxUploads: Math.max(1, Math.floor(baseLimits.maxUploads * totalFactor)),
    maxTotalSize: Math.max(fileSize, Math.floor(baseLimits.maxTotalSize * totalFactor * sizeAdjustment)),
    maxProcessingTime: Math.max(30000, Math.floor(baseLimits.maxProcessingTime * totalFactor))
  };
  
  return {
    limits: dynamicLimits,
    adjustments: {
      riskFactor,
      sizeFactor,
      ipFactor,
      resourceFactor,
      totalFactor
    }
  };
}

/**
 * Check if request should be rate limited
 */
function checkAdvancedRateLimit(userId, clientIP, uploadData, event) {
  try {
    const systemMetrics = rateLimitStore.getSystemMetrics();
    
    // Perform behavioral analysis
    const behavioralAnalysis = analyzeBehavioralRisk(userId, clientIP, uploadData);
    
    // Update upload data with risk score
    uploadData.riskScore = behavioralAnalysis.riskScore;
    
    // Generate rate limit key (user-based primarily, IP as fallback)
    const rateLimitKey = userId ? `user:${userId}` : `ip:${clientIP}`;
    
    // Get current rate limit entry
    const rateLimitEntry = rateLimitStore.getRateLimitEntry(rateLimitKey);
    
    // Calculate dynamic limits
    const { limits, adjustments } = calculateDynamicLimits(
      behavioralAnalysis.riskLevel,
      uploadData.fileSize,
      rateLimitEntry.ipReputation,
      systemMetrics
    );
    
    // Filter recent uploads within window
    const now = Date.now();
    const windowStart = now - limits.windowMs;
    const recentUploads = rateLimitEntry.uploads.filter(upload => upload.timestamp > windowStart);
    
    // Calculate current usage
    const currentUsage = {
      uploadCount: recentUploads.length,
      totalSize: recentUploads.reduce((sum, upload) => sum + upload.fileSize, 0),
      totalProcessingTime: recentUploads.reduce((sum, upload) => sum + upload.processingTime, 0)
    };
    
    // Check against limits
    const violations = [];
    
    if (currentUsage.uploadCount >= limits.maxUploads) {
      violations.push({
        type: 'UPLOAD_COUNT_EXCEEDED',
        current: currentUsage.uploadCount,
        limit: limits.maxUploads,
        severity: 'high'
      });
    }
    
    if (currentUsage.totalSize + uploadData.fileSize > limits.maxTotalSize) {
      violations.push({
        type: 'TOTAL_SIZE_EXCEEDED',
        current: currentUsage.totalSize + uploadData.fileSize,
        limit: limits.maxTotalSize,
        severity: 'medium'
      });
    }
    
    if (currentUsage.totalProcessingTime > limits.maxProcessingTime) {
      violations.push({
        type: 'PROCESSING_TIME_EXCEEDED',
        current: currentUsage.totalProcessingTime,
        limit: limits.maxProcessingTime,
        severity: 'medium'
      });
    }
    
    // Check for critical system resource constraints
    if (systemMetrics.memoryUsage > 0.95) {
      violations.push({
        type: 'SYSTEM_MEMORY_CRITICAL',
        current: systemMetrics.memoryUsage,
        limit: 0.95,
        severity: 'critical'
      });
    }
    
    if (systemMetrics.activeUploads > 50) {
      violations.push({
        type: 'SYSTEM_OVERLOAD',
        current: systemMetrics.activeUploads,
        limit: 50,
        severity: 'critical'
      });
    }
    
    // Determine if request should be blocked
    const isBlocked = violations.length > 0 || behavioralAnalysis.shouldBlock;
    
    // Log security events for violations
    if (isBlocked && violations.length > 0) {
      const criticalViolations = violations.filter(v => v.severity === 'critical');
      const severity = criticalViolations.length > 0 ? 'critical' : 'high';
      
      logSecurityEvent(createSecurityEvent(
        SecurityEventType.RATE_LIMIT_EXCEEDED,
        event,
        {
          rateLimitKey,
          violations,
          behavioralAnalysis: {
            riskScore: behavioralAnalysis.riskScore,
            riskLevel: behavioralAnalysis.riskLevel
          },
          limits,
          currentUsage,
          systemMetrics
        },
        severity
      ));
    }
    
    // Record the attempt (whether blocked or not)
    if (!isBlocked) {
      rateLimitStore.recordUpload(rateLimitKey, uploadData);
    } else {
      // Record violation
      rateLimitEntry.violations.push({
        timestamp: now,
        violations,
        riskScore: behavioralAnalysis.riskScore
      });
    }
    
    // Calculate reset time
    const oldestUpload = recentUploads.length > 0 ? 
      Math.min(...recentUploads.map(u => u.timestamp)) : now;
    const resetTime = oldestUpload + limits.windowMs;
    
    // Calculate remaining capacity
    const remaining = {
      uploads: Math.max(0, limits.maxUploads - currentUsage.uploadCount),
      size: Math.max(0, limits.maxTotalSize - currentUsage.totalSize),
      processingTime: Math.max(0, limits.maxProcessingTime - currentUsage.totalProcessingTime)
    };
    
    return {
      allowed: !isBlocked,
      rateLimitKey,
      limits,
      currentUsage,
      remaining,
      resetTime,
      violations,
      behavioralAnalysis,
      systemMetrics,
      adjustments,
      recommendations: isBlocked ? behavioralAnalysis.recommendations : [],
      metadata: {
        timestamp: now,
        version: '1.0'
      }
    };
    
  } catch (error) {
    console.error('Advanced rate limiting error:', error);
    
    // Fail-safe: use basic rate limiting
    return {
      allowed: false,
      error: error.message,
      recommendations: ['Manual review required due to rate limiting failure'],
      metadata: {
        timestamp: Date.now(),
        version: '1.0',
        failsafe: true
      }
    };
  }
}

/**
 * Update IP reputation based on observed behavior
 */
function updateIPReputation(clientIP, behavioralScore, violations = []) {
  const rateLimitKey = `ip:${clientIP}`;
  const entry = rateLimitStore.getRateLimitEntry(rateLimitKey);
  
  // Calculate reputation score based on behavior and violations
  let reputationScore = 100; // Start with perfect score
  
  // Deduct points for high risk behavior
  reputationScore -= behavioralScore * 0.5;
  
  // Deduct points for violations
  violations.forEach(violation => {
    switch (violation.severity) {
      case 'critical':
        reputationScore -= 30;
        break;
      case 'high':
        reputationScore -= 20;
        break;
      case 'medium':
        reputationScore -= 10;
        break;
      default:
        reputationScore -= 5;
    }
  });
  
  // Determine reputation level
  if (reputationScore >= 90) {
    entry.ipReputation = 'EXCELLENT';
  } else if (reputationScore >= 70) {
    entry.ipReputation = 'GOOD';
  } else if (reputationScore >= 40) {
    entry.ipReputation = 'SUSPICIOUS';
  } else {
    entry.ipReputation = 'MALICIOUS';
  }
  
  return entry.ipReputation;
}

/**
 * Get rate limiting statistics for monitoring
 */
function getRateLimitingStats() {
  const systemMetrics = rateLimitStore.getSystemMetrics();
  const entries = Array.from(rateLimitStore.rateLimitData.values());
  
  const stats = {
    systemMetrics,
    totalEntries: entries.length,
    activeUploads: systemMetrics.activeUploads,
    recentViolations: 0,
    riskDistribution: {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    },
    ipReputationDistribution: {
      EXCELLENT: 0,
      GOOD: 0,
      SUSPICIOUS: 0,
      MALICIOUS: 0
    },
    topViolators: []
  };
  
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  
  entries.forEach(entry => {
    // Count recent violations
    const recentViolations = entry.violations.filter(v => now - v.timestamp < oneHour);
    stats.recentViolations += recentViolations.length;
    
    // Risk distribution
    if (entry.riskScore < 30) stats.riskDistribution.low++;
    else if (entry.riskScore < 60) stats.riskDistribution.medium++;
    else if (entry.riskScore < 85) stats.riskDistribution.high++;
    else stats.riskDistribution.critical++;
    
    // IP reputation distribution
    stats.ipReputationDistribution[entry.ipReputation]++;
    
    // Track top violators
    if (recentViolations.length > 0) {
      stats.topViolators.push({
        key: entry.key,
        violations: recentViolations.length,
        riskScore: entry.riskScore,
        ipReputation: entry.ipReputation
      });
    }
  });
  
  // Sort top violators
  stats.topViolators.sort((a, b) => b.violations - a.violations);
  stats.topViolators = stats.topViolators.slice(0, 10);
  
  return stats;
}

/**
 * Clean shutdown function
 */
function shutdown() {
  if (rateLimitStore.cleanupInterval) {
    clearInterval(rateLimitStore.cleanupInterval);
  }
  if (rateLimitStore.metricsInterval) {
    clearInterval(rateLimitStore.metricsInterval);
  }
  console.log('Advanced rate limiter shutdown completed');
}

// Handle process termination
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

module.exports = {
  checkAdvancedRateLimit,
  updateIPReputation,
  getRateLimitingStats,
  calculateDynamicLimits,
  RATE_LIMIT_CONFIG,
  // Export for testing
  _internal: {
    rateLimitStore
  }
};