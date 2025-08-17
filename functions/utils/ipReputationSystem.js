/**
 * IP Reputation System
 * Tracks and analyzes IP addresses for suspicious behavior patterns and attack coordination
 */

const crypto = require('crypto');
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

// IP reputation configuration
const IP_REPUTATION_CONFIG = {
  // Reputation scoring thresholds
  REPUTATION_LEVELS: {
    EXCELLENT: { min: 90, max: 100 },
    GOOD: { min: 70, max: 89 },
    NEUTRAL: { min: 50, max: 69 },
    SUSPICIOUS: { min: 25, max: 49 },
    MALICIOUS: { min: 0, max: 24 }
  },

  // Time windows for analysis
  TIME_WINDOWS: {
    SHORT: 15 * 60 * 1000,      // 15 minutes
    MEDIUM: 2 * 60 * 60 * 1000, // 2 hours
    LONG: 24 * 60 * 60 * 1000,  // 24 hours
  },

  // Penalty scores for different violations
  VIOLATION_PENALTIES: {
    RATE_LIMIT_EXCEEDED: 10,
    CORS_VIOLATION: 15,
    CSRF_VIOLATION: 20,
    UNAUTHORIZED_ACCESS: 12,
    INVALID_TOKEN: 8,
    SUSPICIOUS_ACTIVITY: 25,
    BEHAVIORAL_HIGH_RISK: 30,
    BEHAVIORAL_CRITICAL_RISK: 50,
    FILE_SIGNATURE_MISMATCH: 20,
    MALWARE_DETECTED: 100,
    CONTENT_SCANNING_ALERT: 15
  },

  // Recovery factors (reputation can improve over time)
  RECOVERY_FACTORS: {
    GOOD_BEHAVIOR_BONUS: 2,     // Points per successful interaction
    TIME_DECAY_RATE: 0.1,       // Daily decay rate for penalties
    MAX_DAILY_RECOVERY: 10,     // Maximum reputation recovery per day
  },

  // Coordinated attack detection
  COORDINATION_THRESHOLDS: {
    MIN_IPS_FOR_COORDINATION: 3,        // Minimum IPs to consider coordination
    MAX_TIME_SPREAD: 5 * 60 * 1000,     // Max time spread for coordinated attacks (5 min)
    SIMILARITY_THRESHOLD: 0.8,          // Behavioral similarity threshold
    COORDINATION_PENALTY: 40,           // Extra penalty for coordinated attacks
  },

  // Geographic analysis (basic)
  GEOGRAPHIC_RISK_FACTORS: {
    HIGH_RISK_COUNTRIES: ['XX', 'YY'], // Placeholder for high-risk country codes
    VPN_DETECTION_PATTERNS: [
      /\b(?:vpn|proxy|tor|anonymous)\b/i,
      /\b(?:datacenter|hosting|cloud)\b/i
    ]
  }
};

// IP reputation storage
class IPReputationStore {
  constructor() {
    this.ipProfiles = new Map(); // IP -> IPProfile
    this.coordinationPatterns = new Map(); // pattern hash -> CoordinationGroup
    this.cleanupInterval = setInterval(() => this.cleanup(), 30 * 60 * 1000); // Cleanup every 30 minutes
  }

  cleanup() {
    const now = Date.now();
    const cutoffTime = now - (IP_REPUTATION_CONFIG.TIME_WINDOWS.LONG * 7); // Keep data for 7 days

    // Clean up old IP profiles
    for (const [ip, profile] of this.ipProfiles.entries()) {
      // Remove old events
      profile.events = profile.events.filter(event => event.timestamp > cutoffTime);
      profile.violations = profile.violations.filter(violation => violation.timestamp > cutoffTime);
      
      // Remove profile if no recent activity
      if (profile.events.length === 0 && (now - profile.lastSeen) > cutoffTime) {
        this.ipProfiles.delete(ip);
      }
    }

    // Clean up old coordination patterns
    for (const [hash, group] of this.coordinationPatterns.entries()) {
      if (now - group.lastActivity > IP_REPUTATION_CONFIG.TIME_WINDOWS.LONG) {
        this.coordinationPatterns.delete(hash);
      }
    }

    console.log(`IP reputation cleanup completed. Active IPs: ${this.ipProfiles.size}, Coordination patterns: ${this.coordinationPatterns.size}`);
  }

  getIPProfile(ip) {
    if (!this.ipProfiles.has(ip)) {
      this.ipProfiles.set(ip, {
        ip,
        reputation: 70, // Start with neutral-good reputation
        reputationLevel: 'GOOD',
        events: [],
        violations: [],
        firstSeen: Date.now(),
        lastSeen: Date.now(),
        totalInteractions: 0,
        successfulInteractions: 0,
        failedInteractions: 0,
        userAgents: new Set(),
        behaviors: {
          uploadPatterns: [],
          timingPatterns: [],
          contentPatterns: []
        },
        geographic: {
          country: null,
          region: null,
          isVPN: false,
          isProxy: false
        },
        coordinationScore: 0,
        riskFactors: []
      });
    }
    return this.ipProfiles.get(ip);
  }

  recordEvent(ip, eventType, eventData = {}) {
    const profile = this.getIPProfile(ip);
    const timestamp = Date.now();

    const event = {
      timestamp,
      type: eventType,
      data: eventData,
      severity: eventData.severity || 'medium'
    };

    profile.events.push(event);
    profile.lastSeen = timestamp;
    profile.totalInteractions++;

    // Track user agents for fingerprinting
    if (eventData.userAgent) {
      profile.userAgents.add(eventData.userAgent);
    }

    // Update success/failure counts
    if (eventData.success === true) {
      profile.successfulInteractions++;
    } else if (eventData.success === false) {
      profile.failedInteractions++;
    }

    return profile;
  }

  recordViolation(ip, violationType, violationData = {}, event = null) {
    const profile = this.getIPProfile(ip);
    const timestamp = Date.now();

    const violation = {
      timestamp,
      type: violationType,
      data: violationData,
      penalty: IP_REPUTATION_CONFIG.VIOLATION_PENALTIES[violationType] || 10,
      severity: violationData.severity || 'medium'
    };

    profile.violations.push(violation);
    profile.failedInteractions++;

    // Apply reputation penalty
    this.adjustReputation(ip, -violation.penalty);

    // Log security event
    if (event) {
      logSecurityEvent(createSecurityEvent(
        SecurityEventType.SUSPICIOUS_ACTIVITY,
        event,
        {
          ip,
          violationType,
          reputationBefore: profile.reputation + violation.penalty,
          reputationAfter: profile.reputation,
          violationData
        },
        violation.severity
      ));
    }

    return violation;
  }

  adjustReputation(ip, delta) {
    const profile = this.getIPProfile(ip);
    const oldReputation = profile.reputation;
    
    profile.reputation = Math.max(0, Math.min(100, profile.reputation + delta));
    profile.reputationLevel = this.getReputationLevel(profile.reputation);

    // Log significant reputation changes
    if (Math.abs(oldReputation - profile.reputation) >= 10) {
      console.log(`IP ${ip} reputation changed: ${oldReputation} -> ${profile.reputation} (${profile.reputationLevel})`);
    }

    return profile.reputation;
  }

  getReputationLevel(score) {
    for (const [level, range] of Object.entries(IP_REPUTATION_CONFIG.REPUTATION_LEVELS)) {
      if (score >= range.min && score <= range.max) {
        return level;
      }
    }
    return 'SUSPICIOUS'; // Default fallback
  }
}

// Global IP reputation store
const ipReputationStore = new IPReputationStore();

/**
 * Analyze IP for reputation and risk factors
 */
function analyzeIPReputation(ip, userAgent = null, additionalData = {}) {
  try {
    const profile = ipReputationStore.getIPProfile(ip);
    const now = Date.now();

    // Update profile with current interaction
    ipReputationStore.recordEvent(ip, 'INTERACTION', {
      userAgent,
      success: null, // Will be updated based on actual outcome
      ...additionalData
    });

    // Analyze behavioral patterns
    const behaviorAnalysis = analyzeIPBehavior(profile);
    
    // Check for coordination patterns
    const coordinationAnalysis = detectCoordinatedActivity(ip, profile);
    
    // Detect VPN/Proxy usage patterns
    const vpnProxyAnalysis = detectVPNProxy(profile);
    
    // Calculate overall risk score
    const riskScore = calculateIPRiskScore(profile, behaviorAnalysis, coordinationAnalysis);
    
    // Apply time-based reputation recovery
    applyReputationDecay(profile);
    
    // Generate recommendations
    const recommendations = generateIPRecommendations(profile, riskScore);

    return {
      ip,
      reputation: profile.reputation,
      reputationLevel: profile.reputationLevel,
      riskScore,
      behaviorAnalysis,
      coordinationAnalysis,
      vpnProxyAnalysis,
      recommendations,
      profile: {
        firstSeen: profile.firstSeen,
        lastSeen: profile.lastSeen,
        totalInteractions: profile.totalInteractions,
        successRate: profile.totalInteractions > 0 ? 
          (profile.successfulInteractions / profile.totalInteractions) : 0,
        userAgentCount: profile.userAgents.size,
        recentViolations: profile.violations.filter(v => now - v.timestamp < IP_REPUTATION_CONFIG.TIME_WINDOWS.MEDIUM).length
      },
      metadata: {
        timestamp: now,
        version: '1.0'
      }
    };

  } catch (error) {
    console.error('IP reputation analysis error:', error);
    
    return {
      ip,
      reputation: 50, // Neutral reputation on error
      reputationLevel: 'NEUTRAL',
      riskScore: 50,
      error: error.message,
      recommendations: ['Manual review recommended due to analysis failure'],
      metadata: {
        timestamp: Date.now(),
        version: '1.0',
        error: true
      }
    };
  }
}

/**
 * Analyze behavioral patterns for an IP
 */
function analyzeIPBehavior(profile) {
  const now = Date.now();
  const recentEvents = profile.events.filter(event => 
    now - event.timestamp < IP_REPUTATION_CONFIG.TIME_WINDOWS.MEDIUM
  );

  const patterns = [];
  let suspiciousScore = 0;

  // Analyze user agent diversity
  if (profile.userAgents.size > 10) {
    patterns.push({
      type: 'HIGH_USER_AGENT_DIVERSITY',
      description: `${profile.userAgents.size} different user agents`,
      severity: 'medium',
      score: 15
    });
    suspiciousScore += 15;
  } else if (profile.userAgents.size === 1 && profile.totalInteractions > 20) {
    patterns.push({
      type: 'SINGLE_USER_AGENT_HIGH_VOLUME',
      description: `${profile.totalInteractions} interactions with single user agent`,
      severity: 'medium',
      score: 10
    });
    suspiciousScore += 10;
  }

  // Analyze failure rate
  const failureRate = profile.totalInteractions > 0 ? 
    (profile.failedInteractions / profile.totalInteractions) : 0;
  
  if (failureRate > 0.5) {
    patterns.push({
      type: 'HIGH_FAILURE_RATE',
      description: `${(failureRate * 100).toFixed(1)}% failure rate`,
      severity: failureRate > 0.8 ? 'high' : 'medium',
      score: failureRate * 30
    });
    suspiciousScore += failureRate * 30;
  }

  // Analyze interaction frequency
  if (recentEvents.length > 50) {
    const frequency = recentEvents.length / (IP_REPUTATION_CONFIG.TIME_WINDOWS.MEDIUM / (60 * 1000));
    patterns.push({
      type: 'HIGH_FREQUENCY_INTERACTIONS',
      description: `${frequency.toFixed(2)} interactions per minute`,
      severity: frequency > 5 ? 'high' : 'medium',
      score: Math.min(25, frequency * 2)
    });
    suspiciousScore += Math.min(25, frequency * 2);
  }

  // Check for suspicious user agents
  const suspiciousUAs = Array.from(profile.userAgents).filter(ua => {
    const lowerUA = ua.toLowerCase();
    return IP_REPUTATION_CONFIG.GEOGRAPHIC_RISK_FACTORS.VPN_DETECTION_PATTERNS.some(pattern => 
      pattern.test(lowerUA)
    );
  });

  if (suspiciousUAs.length > 0) {
    patterns.push({
      type: 'SUSPICIOUS_USER_AGENTS',
      description: `${suspiciousUAs.length} suspicious user agents detected`,
      severity: 'high',
      score: 20
    });
    suspiciousScore += 20;
  }

  return {
    patterns,
    suspiciousScore: Math.min(100, suspiciousScore),
    behaviorSignature: generateBehaviorSignature(profile)
  };
}

/**
 * Detect coordinated activity across multiple IPs
 */
function detectCoordinatedActivity(ip, profile) {
  const behaviorSignature = generateBehaviorSignature(profile);
  const now = Date.now();
  
  // Find other IPs with similar behavior signatures
  const similarIPs = [];
  
  for (const [otherIP, otherProfile] of ipReputationStore.ipProfiles.entries()) {
    if (otherIP === ip) continue;
    
    // Only consider recent activity
    if (now - otherProfile.lastSeen > IP_REPUTATION_CONFIG.TIME_WINDOWS.SHORT) continue;
    
    const otherSignature = generateBehaviorSignature(otherProfile);
    const similarity = calculateSignatureSimilarity(behaviorSignature, otherSignature);
    
    if (similarity >= IP_REPUTATION_CONFIG.COORDINATION_THRESHOLDS.SIMILARITY_THRESHOLD) {
      similarIPs.push({
        ip: otherIP,
        similarity,
        lastSeen: otherProfile.lastSeen
      });
    }
  }

  const isCoordinated = similarIPs.length >= IP_REPUTATION_CONFIG.COORDINATION_THRESHOLDS.MIN_IPS_FOR_COORDINATION - 1;
  
  if (isCoordinated) {
    // Create or update coordination pattern
    const patternHash = crypto.createHash('md5').update(JSON.stringify(behaviorSignature)).digest('hex');
    
    if (!ipReputationStore.coordinationPatterns.has(patternHash)) {
      ipReputationStore.coordinationPatterns.set(patternHash, {
        hash: patternHash,
        ips: new Set([ip]),
        firstDetected: now,
        lastActivity: now,
        behaviorSignature,
        totalEvents: 0
      });
    }
    
    const coordinationGroup = ipReputationStore.coordinationPatterns.get(patternHash);
    coordinationGroup.ips.add(ip);
    coordinationGroup.lastActivity = now;
    coordinationGroup.totalEvents++;
    
    // Apply coordination penalty
    ipReputationStore.adjustReputation(ip, -IP_REPUTATION_CONFIG.COORDINATION_THRESHOLDS.COORDINATION_PENALTY);
  }

  return {
    isCoordinated,
    similarIPs: similarIPs.slice(0, 10), // Limit to top 10 similar IPs
    coordinationScore: isCoordinated ? similarIPs.length * 10 : 0,
    behaviorSignature,
    patterns: isCoordinated ? [{
      type: 'COORDINATED_ATTACK',
      description: `Coordinated with ${similarIPs.length} other IPs`,
      severity: 'critical',
      score: 50
    }] : []
  };
}

/**
 * Generate behavioral signature for an IP
 */
function generateBehaviorSignature(profile) {
  const now = Date.now();
  const recentEvents = profile.events.filter(event => 
    now - event.timestamp < IP_REPUTATION_CONFIG.TIME_WINDOWS.SHORT
  );

  const signature = {
    eventFrequency: recentEvents.length,
    failureRate: profile.totalInteractions > 0 ? 
      (profile.failedInteractions / profile.totalInteractions) : 0,
    userAgentCount: profile.userAgents.size,
    primaryUserAgent: profile.userAgents.size > 0 ? 
      Array.from(profile.userAgents)[0] : null,
    interactionPattern: calculateInteractionPattern(recentEvents),
    riskLevel: profile.reputationLevel
  };

  return signature;
}

/**
 * Calculate interaction timing pattern
 */
function calculateInteractionPattern(events) {
  if (events.length < 2) return 'INSUFFICIENT_DATA';

  const intervals = [];
  for (let i = 1; i < events.length; i++) {
    intervals.push(events[i].timestamp - events[i - 1].timestamp);
  }

  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const variance = intervals.reduce((sum, interval) => 
    sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev < avgInterval * 0.1) {
    return 'HIGHLY_REGULAR'; // Very consistent timing - possibly automated
  } else if (stdDev < avgInterval * 0.3) {
    return 'REGULAR'; // Somewhat consistent timing
  } else if (stdDev > avgInterval * 2) {
    return 'HIGHLY_IRREGULAR'; // Very inconsistent timing
  } else {
    return 'IRREGULAR'; // Inconsistent timing - likely human
  }
}

/**
 * Calculate similarity between behavior signatures
 */
function calculateSignatureSimilarity(sig1, sig2) {
  let similarity = 0;
  let factors = 0;

  // Compare event frequency (normalize to 0-1 scale)
  const freqDiff = Math.abs(sig1.eventFrequency - sig2.eventFrequency);
  const maxFreq = Math.max(sig1.eventFrequency, sig2.eventFrequency, 1);
  similarity += (1 - freqDiff / maxFreq) * 0.3;
  factors++;

  // Compare failure rates
  const failureDiff = Math.abs(sig1.failureRate - sig2.failureRate);
  similarity += (1 - failureDiff) * 0.2;
  factors++;

  // Compare user agent patterns
  if (sig1.primaryUserAgent === sig2.primaryUserAgent && sig1.primaryUserAgent) {
    similarity += 0.3;
  }
  factors++;

  // Compare interaction patterns
  if (sig1.interactionPattern === sig2.interactionPattern) {
    similarity += 0.2;
  }
  factors++;

  return similarity / factors;
}

/**
 * Detect VPN/Proxy usage
 */
function detectVPNProxy(profile) {
  const vpnIndicators = [];
  let vpnScore = 0;

  // Check user agents for VPN/Proxy indicators
  Array.from(profile.userAgents).forEach(ua => {
    IP_REPUTATION_CONFIG.GEOGRAPHIC_RISK_FACTORS.VPN_DETECTION_PATTERNS.forEach(pattern => {
      if (pattern.test(ua.toLowerCase())) {
        vpnIndicators.push({
          type: 'SUSPICIOUS_USER_AGENT',
          value: ua,
          confidence: 0.7
        });
        vpnScore += 20;
      }
    });
  });

  // Additional VPN detection logic could be added here
  // (e.g., IP range checks, geolocation inconsistencies, etc.)

  return {
    isVPN: vpnScore > 30,
    isProxy: vpnScore > 20,
    confidence: Math.min(1, vpnScore / 100),
    indicators: vpnIndicators,
    score: vpnScore
  };
}

/**
 * Calculate overall IP risk score
 */
function calculateIPRiskScore(profile, behaviorAnalysis, coordinationAnalysis) {
  let riskScore = 0;

  // Base risk from reputation (invert - lower reputation = higher risk)
  riskScore += (100 - profile.reputation) * 0.5;

  // Add behavioral risk
  riskScore += behaviorAnalysis.suspiciousScore * 0.3;

  // Add coordination risk
  riskScore += coordinationAnalysis.coordinationScore * 0.2;

  // Normalize to 0-100 scale
  return Math.min(100, Math.max(0, Math.round(riskScore)));
}

/**
 * Apply time-based reputation recovery
 */
function applyReputationDecay(profile) {
  const now = Date.now();
  const daysSinceLastInteraction = (now - profile.lastSeen) / (24 * 60 * 60 * 1000);
  
  if (daysSinceLastInteraction > 0 && profile.reputation < 100) {
    const recovery = Math.min(
      IP_REPUTATION_CONFIG.RECOVERY_FACTORS.MAX_DAILY_RECOVERY,
      daysSinceLastInteraction * IP_REPUTATION_CONFIG.RECOVERY_FACTORS.TIME_DECAY_RATE * 10
    );
    
    ipReputationStore.adjustReputation(profile.ip, recovery);
  }
}

/**
 * Generate recommendations based on IP analysis
 */
function generateIPRecommendations(profile, riskScore) {
  const recommendations = [];

  if (profile.reputationLevel === 'MALICIOUS') {
    recommendations.push('Block all traffic from this IP immediately');
    recommendations.push('Add to permanent blacklist');
    recommendations.push('Report to threat intelligence feeds');
  } else if (profile.reputationLevel === 'SUSPICIOUS') {
    recommendations.push('Apply strict rate limiting');
    recommendations.push('Require CAPTCHA for all requests');
    recommendations.push('Flag for security team review');
  } else if (riskScore > 70) {
    recommendations.push('Implement enhanced monitoring');
    recommendations.push('Apply moderate rate limiting');
    recommendations.push('Log detailed activity');
  } else if (riskScore > 40) {
    recommendations.push('Monitor for patterns');
    recommendations.push('Track behavioral changes');
  }

  return recommendations;
}

/**
 * Report security violation for IP reputation tracking
 */
function reportSecurityViolation(ip, violationType, violationData = {}, event = null) {
  return ipReputationStore.recordViolation(ip, violationType, violationData, event);
}

/**
 * Report successful interaction (improves reputation)
 */
function reportSuccessfulInteraction(ip, interactionData = {}) {
  const profile = ipReputationStore.getIPProfile(ip);
  
  ipReputationStore.recordEvent(ip, 'SUCCESS', {
    success: true,
    ...interactionData
  });

  // Small reputation bonus for good behavior
  ipReputationStore.adjustReputation(ip, IP_REPUTATION_CONFIG.RECOVERY_FACTORS.GOOD_BEHAVIOR_BONUS);
  
  return profile.reputation;
}

/**
 * Get IP reputation statistics
 */
function getIPReputationStats() {
  const profiles = Array.from(ipReputationStore.ipProfiles.values());
  const coordinations = Array.from(ipReputationStore.coordinationPatterns.values());

  const stats = {
    totalIPs: profiles.length,
    coordinationGroups: coordinations.length,
    reputationDistribution: {
      EXCELLENT: 0,
      GOOD: 0,
      NEUTRAL: 0,
      SUSPICIOUS: 0,
      MALICIOUS: 0
    },
    recentActivity: {
      last15min: 0,
      last2hours: 0,
      last24hours: 0
    },
    topMaliciousIPs: [],
    activeCoordinations: []
  };

  const now = Date.now();

  profiles.forEach(profile => {
    stats.reputationDistribution[profile.reputationLevel]++;

    // Count recent activity
    if (now - profile.lastSeen < IP_REPUTATION_CONFIG.TIME_WINDOWS.SHORT) {
      stats.recentActivity.last15min++;
    }
    if (now - profile.lastSeen < IP_REPUTATION_CONFIG.TIME_WINDOWS.MEDIUM) {
      stats.recentActivity.last2hours++;
    }
    if (now - profile.lastSeen < IP_REPUTATION_CONFIG.TIME_WINDOWS.LONG) {
      stats.recentActivity.last24hours++;
    }

    // Track malicious IPs
    if (profile.reputationLevel === 'MALICIOUS' || profile.reputationLevel === 'SUSPICIOUS') {
      stats.topMaliciousIPs.push({
        ip: profile.ip,
        reputation: profile.reputation,
        reputationLevel: profile.reputationLevel,
        violations: profile.violations.length,
        lastSeen: profile.lastSeen
      });
    }
  });

  // Sort malicious IPs by reputation (lowest first)
  stats.topMaliciousIPs.sort((a, b) => a.reputation - b.reputation);
  stats.topMaliciousIPs = stats.topMaliciousIPs.slice(0, 20);

  // Active coordination groups
  stats.activeCoordinations = coordinations.filter(group => 
    now - group.lastActivity < IP_REPUTATION_CONFIG.TIME_WINDOWS.MEDIUM
  ).map(group => ({
    hash: group.hash,
    ipCount: group.ips.size,
    firstDetected: group.firstDetected,
    lastActivity: group.lastActivity,
    totalEvents: group.totalEvents
  }));

  return stats;
}

/**
 * Clean shutdown function
 */
function shutdown() {
  if (ipReputationStore.cleanupInterval) {
    clearInterval(ipReputationStore.cleanupInterval);
  }
  console.log('IP reputation system shutdown completed');
}

// Handle process termination
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

module.exports = {
  analyzeIPReputation,
  reportSecurityViolation,
  reportSuccessfulInteraction,
  getIPReputationStats,
  IP_REPUTATION_CONFIG,
  // Export for testing
  _internal: {
    ipReputationStore,
    generateBehaviorSignature,
    calculateSignatureSimilarity,
    detectCoordinatedActivity
  }
};