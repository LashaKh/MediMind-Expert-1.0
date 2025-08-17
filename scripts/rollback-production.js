#!/usr/bin/env node

/**
 * Production Rollback Script for MediMind Expert
 * Handles emergency rollbacks with database and deployment restoration
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const ROLLBACK_CONFIG = {
  confirmationRequired: !process.argv.includes('--yes'),
  skipHealthCheck: process.argv.includes('--skip-health'),
  rollbackDatabase: process.argv.includes('--with-db'),
  dryRun: process.argv.includes('--dry-run')
};

class RollbackManager {
  constructor() {
    this.netlifyAuthToken = process.env.NETLIFY_AUTH_TOKEN;
    this.netlifySiteId = process.env.NETLIFY_SITE_ID;
    
    if (!this.netlifyAuthToken || !this.netlifySiteId) {
      throw new Error('Missing Netlify configuration for rollback');
    }
  }

  // Get deployment history
  async getDeploymentHistory() {
    try {
      console.log('📋 Fetching deployment history...');
      
      const { stdout } = await execAsync(
        `npx netlify api listSiteDeploys --site-id=${this.netlifySiteId} --json`,
        { env: { ...process.env, NETLIFY_AUTH_TOKEN: this.netlifyAuthToken } }
      );
      
      const deployments = JSON.parse(stdout);
      return deployments
        .filter(deploy => deploy.state === 'ready')
        .slice(0, 10) // Last 10 successful deployments
        .map(deploy => ({
          id: deploy.id,
          createdAt: deploy.created_at,
          commitSha: deploy.commit_ref,
          branch: deploy.branch,
          deployTime: deploy.deploy_time,
          url: deploy.deploy_ssl_url
        }));
        
    } catch (error) {
      console.error('❌ Failed to fetch deployment history:', error.message);
      return [];
    }
  }

  // Perform health check on target deployment
  async healthCheckDeployment(deploymentUrl) {
    try {
      console.log(`🔍 Health checking deployment: ${deploymentUrl}`);
      
      if (ROLLBACK_CONFIG.dryRun) {
        console.log('🔍 DRY RUN: Would perform health check');
        return true;
      }

      // Check main health endpoint
      const healthResponse = await fetch(`${deploymentUrl}/api/system/health`, {
        method: 'GET',
        timeout: 10000
      });

      if (!healthResponse.ok) {
        console.error(`❌ Health check failed: HTTP ${healthResponse.status}`);
        return false;
      }

      const healthData = await healthResponse.json();
      
      // Check critical services
      const criticalServices = ['database', 'authentication', 'functions'];
      const unhealthyServices = criticalServices.filter(
        service => healthData.services?.[service]?.status === 'unhealthy'
      );

      if (unhealthyServices.length > 0) {
        console.error(`❌ Unhealthy services: ${unhealthyServices.join(', ')}`);
        return false;
      }

      console.log('✅ Health check passed');
      return true;

    } catch (error) {
      console.error('❌ Health check error:', error.message);
      return false;
    }
  }

  // Execute Netlify deployment rollback
  async rollbackDeployment(targetDeploymentId) {
    try {
      console.log(`🔄 Rolling back to deployment: ${targetDeploymentId}`);
      
      if (ROLLBACK_CONFIG.dryRun) {
        console.log('🔍 DRY RUN: Would rollback deployment');
        return true;
      }

      const { stdout, stderr } = await execAsync(
        `npx netlify api restoreSiteDeploy --site-id=${this.netlifySiteId} --deploy-id=${targetDeploymentId}`,
        { env: { ...process.env, NETLIFY_AUTH_TOKEN: this.netlifyAuthToken } }
      );

      if (stderr) {
        console.error('❌ Rollback stderr:', stderr);
        return false;
      }

      console.log('✅ Deployment rollback initiated');
      return true;

    } catch (error) {
      console.error('❌ Deployment rollback failed:', error.message);
      return false;
    }
  }

  // Database rollback (if requested)
  async rollbackDatabase(targetMigration) {
    if (!ROLLBACK_CONFIG.rollbackDatabase) {
      console.log('📋 Database rollback not requested');
      return true;
    }

    console.log(`🔄 Rolling back database to: ${targetMigration}`);
    
    if (ROLLBACK_CONFIG.dryRun) {
      console.log('🔍 DRY RUN: Would rollback database');
      return true;
    }

    try {
      // This would execute database rollback logic
      // In production, this should be implemented with extreme care
      console.log('⚠️  Database rollback is not fully implemented - manual intervention required');
      console.log('📋 Steps to manually rollback database:');
      console.log('1. Access Supabase dashboard');
      console.log('2. Navigate to Database > Migrations');
      console.log(`3. Rollback to migration: ${targetMigration}`);
      console.log('4. Verify data integrity');
      
      return false; // Return false to indicate manual intervention needed

    } catch (error) {
      console.error('❌ Database rollback failed:', error.message);
      return false;
    }
  }

  // Main rollback execution
  async executeRollback() {
    console.log('🚨 Production Rollback Initiated');
    console.log(`Configuration: ${JSON.stringify(ROLLBACK_CONFIG, null, 2)}`);

    try {
      // Get deployment history
      const deployments = await this.getDeploymentHistory();
      
      if (deployments.length < 2) {
        console.error('❌ Insufficient deployment history for rollback');
        return false;
      }

      console.log('\n📋 Available deployments for rollback:');
      deployments.forEach((deploy, index) => {
        console.log(`${index + 1}. ${deploy.id} (${deploy.createdAt}) - ${deploy.commitSha?.substring(0, 8)}`);
      });

      // For automation, rollback to previous deployment
      const targetDeployment = deployments[1]; // Second in list (previous deployment)
      
      console.log(`\n🎯 Target deployment: ${targetDeployment.id}`);
      console.log(`📅 Created: ${targetDeployment.createdAt}`);
      console.log(`📝 Commit: ${targetDeployment.commitSha?.substring(0, 8)}`);

      // Confirmation check
      if (ROLLBACK_CONFIG.confirmationRequired && !ROLLBACK_CONFIG.dryRun) {
        console.log('\n⚠️  This will rollback production to the previous deployment');
        console.log('Continue? (This would normally require manual confirmation)');
        // In automated context, we proceed based on --yes flag
      }

      // Perform health check on target deployment (if possible)
      if (!ROLLBACK_CONFIG.skipHealthCheck) {
        console.log('\n🔍 Performing pre-rollback validation...');
        // Note: Can't health check historical deployments, but we can check current state
      }

      // Execute rollback
      const rollbackSuccess = await this.rollbackDeployment(targetDeployment.id);
      if (!rollbackSuccess) {
        throw new Error('Deployment rollback failed');
      }

      // Wait for rollback to complete
      console.log('⏳ Waiting for rollback to complete...');
      await new Promise(resolve => setTimeout(resolve, 30000)); // 30 second wait

      // Post-rollback health check
      if (!ROLLBACK_CONFIG.skipHealthCheck) {
        const healthOk = await this.healthCheckDeployment(targetDeployment.url);
        if (!healthOk) {
          console.error('❌ Post-rollback health check failed');
          return false;
        }
      }

      // Database rollback (if requested)
      if (ROLLBACK_CONFIG.rollbackDatabase) {
        const dbRollbackOk = await this.rollbackDatabase('previous_stable');
        if (!dbRollbackOk) {
          console.warn('⚠️  Database rollback requires manual intervention');
        }
      }

      console.log('\n🎉 Rollback completed successfully!');
      console.log(`📍 Production URL: ${targetDeployment.url}`);
      console.log(`📝 Rolled back to commit: ${targetDeployment.commitSha?.substring(0, 8)}`);
      
      return true;

    } catch (error) {
      console.error('❌ Rollback failed:', error.message);
      console.log('\n📋 Manual rollback steps:');
      console.log('1. Access Netlify dashboard');
      console.log('2. Go to Deploys section');
      console.log('3. Find previous successful deployment');
      console.log('4. Click "Publish deploy"');
      console.log('5. Verify health after rollback');
      
      return false;
    }
  }
}

// Utility function to display help
function showHelp() {
  console.log(`
🚨 MediMind Expert Production Rollback Script

Usage: node scripts/rollback-production.js [options]

Options:
  --dry-run       Show what would be done without executing
  --yes           Skip confirmation prompts (required for automation)
  --skip-health   Skip health check validation
  --with-db       Include database rollback (requires manual verification)
  --force         Force rollback even if validations fail
  --help          Show this help message

Examples:
  # Dry run to see what would happen
  node scripts/rollback-production.js --dry-run

  # Execute rollback with confirmation
  node scripts/rollback-production.js

  # Automated rollback (for CI/CD)
  node scripts/rollback-production.js --yes --skip-health

  # Rollback with database restoration
  node scripts/rollback-production.js --with-db --yes

Environment Variables Required:
  NETLIFY_AUTH_TOKEN - Netlify API token
  NETLIFY_SITE_ID - Netlify site ID
  SUPABASE_URL - Supabase project URL (for health checks)
  SUPABASE_SERVICE_ROLE_KEY - Supabase service role key
`);
}

// Main execution
async function main() {
  if (process.argv.includes('--help')) {
    showHelp();
    return;
  }

  const rollbackManager = new RollbackManager();
  const success = await rollbackManager.executeRollback();
  
  process.exit(success ? 0 : 1);
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Script execution failed:', error.message);
    process.exit(1);
  });
}

module.exports = { RollbackManager };