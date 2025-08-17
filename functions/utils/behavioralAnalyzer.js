/**
 * Behavioral Analysis Module for Upload Security
 * Analyzes user upload patterns to detect suspicious activity and coordinated attacks
 */

const crypto = require('crypto');

// Behavioral pattern constants
const BEHAVIORAL_CONSTANTS = {
  // Time windows for analysis
  SHORT_WINDOW: 5 * 60 * 1000,     // 5 minutes
  MEDIUM_WINDOW: 30 * 60 * 1000,   // 30 minutes
  LONG_WINDOW: 2 * 60 * 60 * 1000, // 2 hours
  
  // Risk scoring thresholds
  LOW_RISK_THRESHOLD: 30,
  MEDIUM_RISK_THRESHOLD: 60,
  HIGH_RISK_THRESHOLD: 85,
  
  // Pattern detection limits
  MAX_UPLOADS_SHORT: 3,    // Max uploads in 5 minutes
  MAX_UPLOADS_MEDIUM: 8,   // Max uploads in 30 minutes
  MAX_SIZE_VARIANCE: 0.8,  // File size variance threshold
  MIN_TIME_BETWEEN: 10000, // Minimum time between uploads (10 seconds)
  
  // Anomaly detection parameters
  SUSPICIOUS_USER_AGENTS: [
    'bot', 'crawler', 'spider', 'scraper', 'automated', 'python', 'curl', 'wget'
  ],
  
  // File pattern analysis
  SUSPICIOUS_EXTENSIONS: ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com'],
  UNUSUAL_SIZES: {
    MIN_SUSPICIOUS: 50 * 1024 * 1024, // 50MB
    MAX_TINY: 100, // 100 bytes
  }
};

// In-memory storage for behavioral data (in production, use Redis or database)
class BehavioralDataStore {
  constructor() {
    this.userBehavior = new Map(); // userId -> BehaviorProfile
    this.ipBehavior = new Map();   // IP -> BehaviorProfile
    this.sessionData = new Map();  // sessionId -> SessionData
    this.cleanupInterval = setInterval(() => this.cleanup(), 10 * 60 * 1000); // Cleanup every 10 minutes
  }

  cleanup() {
    const now = Date.now();
    const cutoffTime = now - BEHAVIORAL_CONSTANTS.LONG_WINDOW * 2; // Keep data for 4 hours

    // Clean up old user behavior data
    for (const [key, profile] of this.userBehavior.entries()) {
      profile.uploads = profile.uploads.filter(upload => upload.timestamp > cutoffTime);
      if (profile.uploads.length === 0) {
        this.userBehavior.delete(key);
      }
    }

    // Clean up old IP behavior data
    for (const [key, profile] of this.ipBehavior.entries()) {
      profile.uploads = profile.uploads.filter(upload => upload.timestamp > cutoffTime);
      if (profile.uploads.length === 0) {
        this.ipBehavior.delete(key);
      }
    }

    console.log(`Behavioral data cleanup completed. Active users: ${this.userBehavior.size}, Active IPs: ${this.ipBehavior.size}`);
  }

  getUserProfile(userId) {
    if (!this.userBehavior.has(userId)) {
      this.userBehavior.set(userId, {
        userId,
        uploads: [],
        riskScore: 0,
        patterns: {},
        firstSeen: Date.now(),
        lastSeen: Date.now()
      });
    }
    return this.userBehavior.get(userId);
  }

  getIPProfile(ip) {
    if (!this.ipBehavior.has(ip)) {
      this.ipBehavior.set(ip, {
        ip,
        uploads: [],
        riskScore: 0,
        patterns: {},
        firstSeen: Date.now(),
        lastSeen: Date.now()
      });
    }
    return this.ipBehavior.get(ip);
  }

  recordUpload(userId, ip, uploadData) {
    const timestamp = Date.now();
    const upload = {
      timestamp,
      fileSize: uploadData.fileSize,
      fileType: uploadData.fileType,
      fileName: uploadData.fileName,
      userAgent: uploadData.userAgent,
      processingTime: uploadData.processingTime || 0
    };

    // Record for user
    const userProfile = this.getUserProfile(userId);
    userProfile.uploads.push(upload);
    userProfile.lastSeen = timestamp;

    // Record for IP
    const ipProfile = this.getIPProfile(ip);
    ipProfile.uploads.push(upload);
    ipProfile.lastSeen = timestamp;

    return { userProfile, ipProfile };
  }
}

// Global behavioral data store
const behavioralStore = new BehavioralDataStore();

/**
 * Analyze upload patterns for suspicious behavior
 */
function analyzeUploadPatterns(uploads, timeWindow = BEHAVIORAL_CONSTANTS.MEDIUM_WINDOW) {
  const now = Date.now();
  const recentUploads = uploads.filter(upload => now - upload.timestamp < timeWindow);
  
  if (recentUploads.length === 0) {
    return { suspicious: false, patterns: [] };
  }

  const patterns = [];
  let suspiciousScore = 0;

  // 1. Frequency analysis
  const uploadCount = recentUploads.length;
  const windowInMinutes = timeWindow / (60 * 1000);
  const uploadsPerMinute = uploadCount / windowInMinutes;

  if (uploadsPerMinute > 0.5) { // More than 1 upload per 2 minutes
    patterns.push({
      type: 'HIGH_FREQUENCY',
      description: `${uploadCount} uploads in ${windowInMinutes} minutes`,
      severity: uploadsPerMinute > 1 ? 'high' : 'medium',
      score: Math.min(30, uploadsPerMinute * 10)
    });
    suspiciousScore += patterns[patterns.length - 1].score;
  }

  // 2. Time pattern analysis
  const timeDifferences = [];
  for (let i = 1; i < recentUploads.length; i++) {
    timeDifferences.push(recentUploads[i].timestamp - recentUploads[i - 1].timestamp);
  }

  if (timeDifferences.length > 0) {
    const avgTimeDiff = timeDifferences.reduce((a, b) => a + b, 0) / timeDifferences.length;
    const variance = timeDifferences.reduce((sum, diff) => sum + Math.pow(diff - avgTimeDiff, 2), 0) / timeDifferences.length;
    const standardDeviation = Math.sqrt(variance);

    // Very regular intervals might indicate automation
    if (standardDeviation < 5000 && avgTimeDiff < 60000) { // Less than 5 second variance, under 1 minute intervals
      patterns.push({
        type: 'AUTOMATED_TIMING',
        description: `Regular upload intervals: ${(avgTimeDiff / 1000).toFixed(2)}s ±${(standardDeviation / 1000).toFixed(2)}s`,
        severity: 'high',
        score: 25
      });
      suspiciousScore += 25;
    }
  }

  // 3. File size pattern analysis
  const fileSizes = recentUploads.map(u => u.fileSize);
  if (fileSizes.length > 1) {
    const avgSize = fileSizes.reduce((a, b) => a + b, 0) / fileSizes.length;
    const sizeVariance = fileSizes.reduce((sum, size) => sum + Math.pow(size - avgSize, 2), 0) / fileSizes.length;
    const sizeStdDev = Math.sqrt(sizeVariance);
    
    // Very similar file sizes might indicate batch processing
    if (sizeStdDev / avgSize < 0.1 && fileSizes.length > 3) {
      patterns.push({
        type: 'UNIFORM_FILE_SIZES',
        description: `${fileSizes.length} files with similar sizes (avg: ${(avgSize / 1024).toFixed(2)}KB)`,
        severity: 'medium',
        score: 15
      });
      suspiciousScore += 15;
    }
  }

  // 4. File type diversity analysis
  const fileTypes = [...new Set(recentUploads.map(u => u.fileType))];
  if (fileTypes.length === 1 && recentUploads.length > 5) {
    patterns.push({
      type: 'SINGLE_FILE_TYPE_BULK',
      description: `${recentUploads.length} uploads of only ${fileTypes[0]}`,
      severity: 'medium',
      score: 10
    });
    suspiciousScore += 10;
  }

  // 5. User agent consistency
  const userAgents = [...new Set(recentUploads.map(u => u.userAgent).filter(Boolean))];
  if (userAgents.length === 1 && userAgents[0]) {
    const ua = userAgents[0].toLowerCase();
    const hasSuspiciousUA = BEHAVIORAL_CONSTANTS.SUSPICIOUS_USER_AGENTS.some(pattern => ua.includes(pattern));
    
    if (hasSuspiciousUA) {
      patterns.push({
        type: 'SUSPICIOUS_USER_AGENT',
        description: `Automated user agent detected: ${userAgents[0]}`,
        severity: 'high',
        score: 30
      });
      suspiciousScore += 30;
    }
  }

  return {
    suspicious: suspiciousScore > BEHAVIORAL_CONSTANTS.LOW_RISK_THRESHOLD,
    patterns,
    suspiciousScore,
    uploadCount
  };
}

/**
 * Calculate risk score for a user or IP based on behavior patterns
 */
function calculateRiskScore(profile) {
  let riskScore = 0;
  const factors = [];

  // Analyze different time windows
  const shortWindowAnalysis = analyzeUploadPatterns(profile.uploads, BEHAVIORAL_CONSTANTS.SHORT_WINDOW);
  const mediumWindowAnalysis = analyzeUploadPatterns(profile.uploads, BEHAVIORAL_CONSTANTS.MEDIUM_WINDOW);
  const longWindowAnalysis = analyzeUploadPatterns(profile.uploads, BEHAVIORAL_CONSTANTS.LONG_WINDOW);

  // Weight recent activity more heavily
  riskScore += shortWindowAnalysis.suspiciousScore * 2;
  riskScore += mediumWindowAnalysis.suspiciousScore * 1.5;
  riskScore += longWindowAnalysis.suspiciousScore * 1;

  factors.push({
    factor: 'SHORT_TERM_PATTERNS',
    score: shortWindowAnalysis.suspiciousScore * 2,
    patterns: shortWindowAnalysis.patterns
  });

  factors.push({
    factor: 'MEDIUM_TERM_PATTERNS',
    score: mediumWindowAnalysis.suspiciousScore * 1.5,
    patterns: mediumWindowAnalysis.patterns
  });

  factors.push({
    factor: 'LONG_TERM_PATTERNS',
    score: longWindowAnalysis.suspiciousScore * 1,
    patterns: longWindowAnalysis.patterns
  });

  // Account age factor (newer accounts are slightly more risky)
  const accountAge = Date.now() - profile.firstSeen;
  const ageInDays = accountAge / (24 * 60 * 60 * 1000);
  
  if (ageInDays < 1) {
    const ageRisk = Math.max(0, 15 - (ageInDays * 15));
    riskScore += ageRisk;
    factors.push({
      factor: 'NEW_ACCOUNT',
      score: ageRisk,
      description: `Account age: ${ageInDays.toFixed(2)} days`
    });
  }

  // Volume factor (excessive uploads in long term)
  const totalUploads = profile.uploads.length;
  if (totalUploads > 50) {
    const volumeRisk = Math.min(20, (totalUploads - 50) * 0.5);
    riskScore += volumeRisk;
    factors.push({
      factor: 'HIGH_VOLUME',
      score: volumeRisk,
      description: `Total uploads: ${totalUploads}`
    });
  }

  // Normalize risk score to 0-100 range
  riskScore = Math.min(100, Math.max(0, riskScore));

  return {
    riskScore: Math.round(riskScore),
    riskLevel: getRiskLevel(riskScore),
    factors,
    analysis: {
      shortTerm: shortWindowAnalysis,
      mediumTerm: mediumWindowAnalysis,
      longTerm: longWindowAnalysis
    }
  };
}

/**
 * Convert numeric risk score to risk level
 */
function getRiskLevel(score) {
  if (score < BEHAVIORAL_CONSTANTS.LOW_RISK_THRESHOLD) return 'low';
  if (score < BEHAVIORAL_CONSTANTS.MEDIUM_RISK_THRESHOLD) return 'medium';
  if (score < BEHAVIORAL_CONSTANTS.HIGH_RISK_THRESHOLD) return 'high';
  return 'critical';
}

/**
 * Analyze behavioral patterns for a specific upload attempt
 */
function analyzeBehavioralRisk(userId, clientIP, uploadData) {
  try {
    // Record the upload attempt
    const { userProfile, ipProfile } = behavioralStore.recordUpload(userId, clientIP, uploadData);

    // Calculate risk scores
    const userRisk = calculateRiskScore(userProfile);
    const ipRisk = calculateRiskScore(ipProfile);

    // Combine user and IP risk (take the higher risk with some averaging)
    const combinedRiskScore = Math.max(userRisk.riskScore, ipRisk.riskScore) + 
                             (Math.min(userRisk.riskScore, ipRisk.riskScore) * 0.3);

    const finalRiskScore = Math.min(100, Math.round(combinedRiskScore));
    const finalRiskLevel = getRiskLevel(finalRiskScore);

    // Generate recommendations based on risk level
    const recommendations = generateRecommendations(finalRiskLevel, userRisk, ipRisk);

    // Determine if upload should be blocked
    const shouldBlock = finalRiskScore >= BEHAVIORAL_CONSTANTS.HIGH_RISK_THRESHOLD;

    return {
      riskScore: finalRiskScore,
      riskLevel: finalRiskLevel,
      shouldBlock,
      userAnalysis: userRisk,
      ipAnalysis: ipRisk,
      recommendations,
      metadata: {
        userId,
        clientIP,
        timestamp: Date.now(),
        analysisVersion: '1.0'
      }
    };

  } catch (error) {
    console.error('Behavioral analysis error:', error);
    
    // Fail safe - return medium risk if analysis fails
    return {
      riskScore: 50,
      riskLevel: 'medium',
      shouldBlock: false,
      error: error.message,
      recommendations: ['Manual review recommended due to analysis failure'],
      metadata: {
        userId,
        clientIP,
        timestamp: Date.now(),
        analysisVersion: '1.0',
        error: true
      }
    };
  }
}

/**
 * Generate security recommendations based on risk analysis
 */
function generateRecommendations(riskLevel, userRisk, ipRisk) {
  const recommendations = [];

  switch (riskLevel) {
    case 'critical':
      recommendations.push('Block upload immediately');
      recommendations.push('Implement CAPTCHA for subsequent uploads');
      recommendations.push('Flag account for manual security review');
      recommendations.push('Monitor all activity from this IP address');
      break;

    case 'high':
      recommendations.push('Require additional verification (CAPTCHA)');
      recommendations.push('Implement stricter rate limiting');
      recommendations.push('Flag for security monitoring');
      recommendations.push('Consider temporary account restrictions');
      break;

    case 'medium':
      recommendations.push('Apply enhanced rate limiting');
      recommendations.push('Monitor for continued suspicious patterns');
      recommendations.push('Log detailed activity for analysis');
      break;

    case 'low':
      recommendations.push('Continue normal monitoring');
      break;
  }

  // Add specific recommendations based on detected patterns
  const allPatterns = [
    ...(userRisk.factors || []),
    ...(ipRisk.factors || [])
  ];

  allPatterns.forEach(factor => {
    if (factor.patterns) {
      factor.patterns.forEach(pattern => {
        switch (pattern.type) {
          case 'AUTOMATED_TIMING':
            recommendations.push('Implement variable delay requirements');
            break;
          case 'SUSPICIOUS_USER_AGENT':
            recommendations.push('Block or restrict automated clients');
            break;
          case 'HIGH_FREQUENCY':
            recommendations.push('Implement progressive rate limiting');
            break;
        }
      });
    }
  });

  return [...new Set(recommendations)]; // Remove duplicates
}

/**
 * Get behavioral statistics for monitoring
 */
function getBehavioralStats() {
  const userProfiles = Array.from(behavioralStore.userBehavior.values());
  const ipProfiles = Array.from(behavioralStore.ipBehavior.values());

  const stats = {
    totalUsers: userProfiles.length,
    totalIPs: ipProfiles.length,
    riskDistribution: {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    },
    recentActivity: {
      last5min: 0,
      last30min: 0,
      last2hours: 0
    },
    topRiskyUsers: [],
    topRiskyIPs: []
  };

  const now = Date.now();

  // Analyze user profiles
  userProfiles.forEach(profile => {
    const riskScore = calculateRiskScore(profile).riskScore;
    const riskLevel = getRiskLevel(riskScore);
    stats.riskDistribution[riskLevel]++;

    // Count recent activity
    profile.uploads.forEach(upload => {
      if (now - upload.timestamp < BEHAVIORAL_CONSTANTS.SHORT_WINDOW) {
        stats.recentActivity.last5min++;
      }
      if (now - upload.timestamp < BEHAVIORAL_CONSTANTS.MEDIUM_WINDOW) {
        stats.recentActivity.last30min++;
      }
      if (now - upload.timestamp < BEHAVIORAL_CONSTANTS.LONG_WINDOW) {
        stats.recentActivity.last2hours++;
      }
    });

    // Track high-risk users
    if (riskScore >= BEHAVIORAL_CONSTANTS.MEDIUM_RISK_THRESHOLD) {
      stats.topRiskyUsers.push({
        userId: profile.userId,
        riskScore,
        riskLevel,
        uploadCount: profile.uploads.length,
        lastSeen: profile.lastSeen
      });
    }
  });

  // Analyze IP profiles
  ipProfiles.forEach(profile => {
    const riskScore = calculateRiskScore(profile).riskScore;
    const riskLevel = getRiskLevel(riskScore);

    // Track high-risk IPs
    if (riskScore >= BEHAVIORAL_CONSTANTS.MEDIUM_RISK_THRESHOLD) {
      stats.topRiskyIPs.push({
        ip: profile.ip,
        riskScore,
        riskLevel,
        uploadCount: profile.uploads.length,
        lastSeen: profile.lastSeen
      });
    }
  });

  // Sort and limit top risky entities
  stats.topRiskyUsers.sort((a, b) => b.riskScore - a.riskScore).slice(0, 10);
  stats.topRiskyIPs.sort((a, b) => b.riskScore - a.riskScore).slice(0, 10);

  return stats;
}

/**
 * Clean shutdown function for graceful termination
 */
function shutdown() {
  if (behavioralStore.cleanupInterval) {
    clearInterval(behavioralStore.cleanupInterval);
  }
  console.log('Behavioral analyzer shutdown completed');
}

// Handle process termination
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

module.exports = {
  analyzeBehavioralRisk,
  getBehavioralStats,
  calculateRiskScore,
  BEHAVIORAL_CONSTANTS,
  // Export for testing
  _internal: {
    behavioralStore,
    analyzeUploadPatterns,
    generateRecommendations
  }
};