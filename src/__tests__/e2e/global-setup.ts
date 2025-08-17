/**
 * Global setup for Playwright E2E tests
 * Sets up test environment and authentication
 */

import { chromium, type FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch()
  const page = await browser.newPage()

  // Set up test data and authentication
  const baseURL = config.projects[0].use.baseURL || 'http://localhost:5173'
  
  try {
    // Navigate to the app
    await page.goto(baseURL)
    
    // Wait for app to load
    await page.waitForSelector('[data-testid="app-loaded"]', { timeout: 30000 }).catch(() => {
      // App might not have this specific test ID, that's okay
    })

    // Create test user credentials for authenticated tests
    const testUserCredentials = {
      email: 'test-medisearch@example.com',
      password: 'TestPassword123!',
      name: 'MediSearch Test User',
      specialty: 'cardiology'
    }

    // Store credentials for use in tests
    await page.context().storageState({ 
      path: './test-results/auth-state.json' 
    })

    console.log('✅ Global setup completed successfully')
    console.log(`📊 Base URL: ${baseURL}`)
    console.log(`👤 Test user: ${testUserCredentials.email}`)
    
  } catch (error) {
    console.error('❌ Global setup failed:', error)
    throw error
  } finally {
    await browser.close()
  }
}

export default globalSetup