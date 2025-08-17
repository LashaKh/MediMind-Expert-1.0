/**
 * Global teardown for Playwright E2E tests
 * Cleans up test environment and resources
 */

import { chromium, type FullConfig } from '@playwright/test'
import { promises as fs } from 'fs'
import path from 'path'

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown...')

  try {
    // Clean up test artifacts
    const testResultsDir = './test-results'
    const authStatePath = path.join(testResultsDir, 'auth-state.json')
    
    // Remove auth state file if it exists
    try {
      await fs.unlink(authStatePath)
      console.log('🗑️ Cleaned up auth state file')
    } catch (error) {
      // File might not exist, that's okay
    }

    // Optional: Clean up any test data from the application
    // This would depend on your specific test data cleanup needs
    
    console.log('✅ Global teardown completed successfully')
    
  } catch (error) {
    console.error('❌ Global teardown failed:', error)
    // Don't throw error in teardown to avoid masking test failures
  }
}

export default globalTeardown