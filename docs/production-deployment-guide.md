# Production Deployment Guide - MediMind Expert

## Overview

This guide covers the complete production deployment process for MediMind Expert, including security measures, monitoring setup, and HIPAA compliance requirements for medical applications.

## Pre-Deployment Checklist

### 1. Environment Configuration

#### Production Environment Variables
Configure the following in your Netlify dashboard under Site Settings > Environment Variables:

```bash
# Supabase Production
VITE_SUPABASE_URL=https://your-prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_URL=https://your-prod-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_production_service_key
SUPABASE_JWT_SECRET=your_production_jwt_secret

# OpenAI Production
OPENAI_API_KEY=sk-proj-your-production-openai-key

# Search Provider APIs (Multiple keys for high availability)
BRAVE_API_KEYS=key1,key2,key3
EXA_API_KEYS=key1,key2,key3
PERPLEXITY_API_KEYS=key1,key2,key3

# Monitoring (Required for production)
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
VITE_ANALYTICS_ID=your-analytics-id

# Security Configuration
VITE_HIPAA_COMPLIANT_MODE=true
VITE_ENABLE_CSRF_PROTECTION=true
VITE_AUDIT_LOGGING=true

# Performance Configuration
VITE_CDN_URL=https://your-cdn-domain.com
VITE_ENABLE_CACHE=true
VITE_CACHE_TTL=3600
```

#### Required Secrets Configuration
Set these in your repository secrets (GitHub Actions):

```bash
NETLIFY_AUTH_TOKEN=your-netlify-token
NETLIFY_SITE_ID=your-netlify-site-id
SLACK_WEBHOOK_URL=https://hooks.slack.com/your-webhook  # Optional
TEAMS_WEBHOOK_URL=https://your-teams-webhook  # Optional
```

### 2. Database Migration

#### Pre-Migration Steps
```bash
# 1. Create database backup
# This is handled automatically by the migration script

# 2. Test migration in development
npm run migrate:prod:dry

# 3. Apply migrations to production
npm run migrate:prod
```

#### Critical Tables Setup
Ensure these tables exist with proper RLS policies:
- `profiles` - User profiles with medical specialty
- `medical_news` - News content with compliance metadata
- `clinical_cases` - Medical case data with HIPAA protection
- `migrations` - Migration history tracking

### 3. Security Configuration

#### SSL/TLS Configuration
- ✅ Force HTTPS redirect configured in `netlify.production.toml`
- ✅ Security headers implemented for medical data protection
- ✅ CORS configuration for medical APIs

#### Rate Limiting
- **Search APIs**: 30-100 requests/minute (user type dependent)
- **Document Upload**: 10-30 requests/minute
- **AI Chat**: 50-150 requests/minute
- **Medical Calculators**: 200-500 requests/minute

#### Data Protection
- ✅ PHI detection and sanitization
- ✅ Audit logging for HIPAA compliance
- ✅ Data retention enforcement (7 years default)
- ✅ Breach detection monitoring

## Deployment Process

### Automated Deployment (Recommended)

The GitHub Actions workflow handles:

1. **Security Audit** - Dependency scanning and secret detection
2. **Medical Validation** - Calculator accuracy and medical compliance
3. **Quality Gates** - Linting, TypeScript, and unit tests
4. **Build & Performance** - Production build and bundle analysis
5. **E2E Testing** - Complete workflow validation
6. **Production Deployment** - Automated Netlify deployment
7. **Health Checks** - Post-deployment validation
8. **Smoke Tests** - Critical functionality verification

#### Trigger Deployment
```bash
# Commit to main branch triggers automatic deployment
git push origin main
```

### Manual Deployment (Emergency Only)

```bash
# 1. Run all tests
npm run test
npm run test:medical
npm run test:e2e

# 2. Build production
npm run build

# 3. Deploy to production
npm run deploy:prod

# 4. Verify health
npm run health:check
```

## Post-Deployment Validation

### 1. Health Check Validation
```bash
# Automated health check
curl https://medimindexpert.netlify.app/api/system/health

# Expected response: HTTP 200 with all services "healthy"
```

### 2. Critical Workflow Testing

#### Medical Calculator Validation
- Test each calculator type with known medical cases
- Verify accuracy against ACC/AHA guidelines
- Confirm mobile responsiveness

#### Search Functionality
- Test medical search queries across all providers
- Verify result filtering and categorization
- Confirm performance within 3-second target

#### AI Chat Integration
- Test specialty-specific chatbot routing
- Verify document attachment processing
- Confirm calculator suggestions work properly

#### Authentication & Security
- Test user registration and login
- Verify specialty-based workspace routing
- Confirm admin access controls

### 3. Performance Monitoring

#### Key Metrics to Monitor
- **Response Time**: <3s for medical workflows
- **Error Rate**: <1% for critical operations
- **Calculator Accuracy**: 100% validation success
- **Search Performance**: <2s average response time
- **Memory Usage**: <100MB per function instance

#### Monitoring Dashboards
- Netlify Functions dashboard for performance metrics
- Sentry dashboard for error tracking and user sessions
- Supabase dashboard for database performance
- Custom monitoring endpoint: `/api/monitoring/dashboard`

## Rollback Procedures

### Automatic Rollback Triggers
- Health check failure after deployment
- Critical error rate >5% within 30 minutes
- Medical calculator validation failure

### Manual Rollback Process
```bash
# Emergency rollback to previous deployment
npm run rollback:prod:dry  # Preview rollback
npm run rollback:prod --yes  # Execute rollback

# With database rollback (requires manual verification)
npm run rollback:prod --with-db --yes
```

### Rollback Validation
1. Health check passes on rolled-back deployment
2. Medical calculators function correctly
3. User authentication works properly
4. Critical medical workflows operational

## Security Compliance

### HIPAA Compliance Features
- ✅ **Encryption**: TLS 1.3 for data in transit, AES-256 for data at rest
- ✅ **Authentication**: JWT-based with medical specialty validation
- ✅ **Audit Logging**: All PHI access logged with user identification
- ✅ **Data Minimization**: Only collect necessary medical information
- ✅ **Breach Detection**: Automated monitoring for unauthorized access
- ✅ **Data Retention**: 7-year retention with automated cleanup

### Security Monitoring
- Failed authentication attempt tracking
- Unusual access pattern detection
- Large data export monitoring
- PHI access audit trail

## Performance Optimization

### CDN Configuration
- Static asset caching with 1-year expiration
- Medical calculator bundles optimized for quick loading
- Image compression for medical diagrams

### Database Optimization
- Connection pooling for high availability
- Query optimization for medical data retrieval
- Index optimization for search performance

### Function Optimization
- Reserved concurrency for critical medical functions
- Memory optimization for document processing
- Timeout configuration for medical workflows

## Monitoring and Alerting

### Critical Alerts (Immediate Response Required)
- Database connection failure
- Authentication system failure
- Medical calculator validation failure
- Search provider complete outage

### Warning Alerts (24-hour Response)
- High response times (>5 seconds)
- Elevated error rates (>1%)
- Memory usage warnings (>85%)
- Search provider degradation

### Information Alerts (Weekly Review)
- Performance trends
- Usage statistics
- User feedback summary
- System optimization opportunities

## Maintenance Procedures

### Weekly Tasks
- Review monitoring dashboards
- Check error logs and trends
- Validate medical calculator accuracy
- Review security audit logs

### Monthly Tasks
- Update dependencies and security patches
- Review HIPAA compliance reports
- Analyze performance trends
- Test disaster recovery procedures

### Quarterly Tasks
- Complete security audit
- Review and update medical guidelines compliance
- Performance optimization review
- User feedback analysis and improvements

## Emergency Procedures

### System Outage Response
1. Check Netlify status and deployment logs
2. Verify Supabase database connectivity
3. Test search provider availability
4. Review recent deployment changes
5. Execute rollback if necessary

### Security Incident Response
1. Isolate affected systems immediately
2. Collect audit logs and evidence
3. Notify stakeholders within 24 hours (HIPAA requirement)
4. Document incident for compliance
5. Implement preventive measures

### Data Breach Protocol
1. **Immediate Actions** (0-1 hour):
   - Contain the breach
   - Assess scope of PHI exposure
   - Document incident timeline
2. **Short-term Actions** (1-24 hours):
   - Notify affected individuals if required
   - Report to authorities if required
   - Implement immediate fixes
3. **Long-term Actions** (24+ hours):
   - Conduct thorough investigation
   - Update security measures
   - Provide user notifications
   - Submit compliance reports

## Contact Information

### Production Support Team
- **Technical Lead**: [Contact Information]
- **Security Officer**: [Contact Information]
- **HIPAA Compliance Officer**: [Contact Information]
- **Emergency Escalation**: [24/7 Contact]

### Service Provider Contacts
- **Netlify Support**: Enterprise support portal
- **Supabase Support**: Professional support portal
- **OpenAI Support**: API support portal
- **Sentry Support**: Error monitoring support

---

## Quick Reference Commands

```bash
# Deployment
npm run deploy:prod              # Deploy to production
npm run health:check            # Check production health

# Database
npm run migrate:prod:dry        # Preview migrations
npm run migrate:prod           # Apply migrations

# Emergency
npm run rollback:prod:dry      # Preview rollback
npm run rollback:prod --yes    # Execute rollback

# Testing
npm run test:medical           # Validate medical accuracy
npm run test:e2e              # End-to-end testing
npm run test:performance      # Performance validation
```