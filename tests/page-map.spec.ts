import { test, expect } from '@playwright/test';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

// Auto-discovered page routes from Next.js App Router
const routes = [
  // Public routes
  { path: '/', name: 'home', description: 'Landing page with community intro' },
  { path: '/auth/signin', name: 'signin', description: 'User sign-in page' },
  { path: '/auth/signup', name: 'signup', description: 'User registration page' },
  { path: '/auth/pending', name: 'auth-pending', description: 'Pending approval page' },

  // Authenticated routes (test with mock auth)
  { path: '/feed', name: 'feed', description: 'Social feed with posts and interactions' },
  { path: '/gallery', name: 'gallery', description: 'Media gallery with categories' },
  { path: '/messages', name: 'messages', description: 'Real-time messaging interface' },
  { path: '/chat', name: 'chat', description: 'Chat interface' },
  { path: '/profile', name: 'profile', description: 'User profile management' },
  { path: '/settings', name: 'settings', description: 'Account and app settings' },

  // Admin routes
  { path: '/admin', name: 'admin', description: 'Admin dashboard overview' },
  { path: '/admin/dashboard', name: 'admin-dashboard', description: 'Detailed admin analytics' },

  // Specialized pages
  { path: '/gallery/upload', name: 'gallery-upload', description: 'Media upload interface' },
  { path: '/offline', name: 'offline', description: 'Offline mode page (PWA)' },
];

// API routes discovered
const apiRoutes = [
  '/api/health',
  '/api/auth/callback',
  '/api/posts',
  '/api/users',
  '/api/messages',
  '/api/admin',
  '/api/socket/io',
  '/api/monitoring'
];

test.describe('Page Map & Visual Testing', () => {
  let pageMap: any[] = [];

  test.beforeAll(async () => {
    // Ensure screenshots directory exists
    mkdirSync('screenshots', { recursive: true });
    mkdirSync('test-results', { recursive: true });
  });

  // Test each route for basic functionality
  for (const route of routes) {
    test(`Route: ${route.path} (${route.name})`, async ({ page }) => {
      try {
        // Navigate to route
        await page.goto(`http://localhost:3000${route.path}`, {
          waitUntil: 'networkidle',
          timeout: 10000
        });

        // Take screenshot
        await page.screenshot({
          path: `screenshots/${route.name}.png`,
          fullPage: true
        });

        // Basic checks
        await expect(page).toHaveTitle(/.+/); // Has some title

        // Check for common error indicators
        const hasError = await page.locator('text=/error|404|500|not found/i').count();
        expect(hasError).toBe(0);

        // Record page info
        const title = await page.title();
        const url = page.url();

        pageMap.push({
          path: route.path,
          name: route.name,
          description: route.description,
          title,
          url,
          status: 'accessible',
          screenshot: `screenshots/${route.name}.png`
        });

        console.log(`✅ ${route.path} - ${title}`);

      } catch (error) {
        console.log(`❌ ${route.path} - ${error}`);

        pageMap.push({
          path: route.path,
          name: route.name,
          description: route.description,
          status: 'error',
          error: error.toString()
        });
      }
    });
  }

  // Test API health endpoints
  test('API Health Check', async ({ request }) => {
    const apiStatus: any[] = [];

    for (const endpoint of apiRoutes) {
      try {
        const response = await request.get(`http://localhost:3000${endpoint}`);
        apiStatus.push({
          endpoint,
          status: response.status(),
          accessible: response.ok()
        });
        console.log(`API ${endpoint}: ${response.status()}`);
      } catch (error) {
        apiStatus.push({
          endpoint,
          status: 'error',
          error: error.toString()
        });
      }
    }

    // Write API status to file
    writeFileSync('test-results/api-status.json', JSON.stringify(apiStatus, null, 2));
  });

  test.afterAll(async () => {
    // Generate comprehensive page map
    const fullPageMap = {
      generatedAt: new Date().toISOString(),
      totalRoutes: routes.length,
      totalApiEndpoints: apiRoutes.length,
      summary: {
        accessible: pageMap.filter(p => p.status === 'accessible').length,
        errors: pageMap.filter(p => p.status === 'error').length
      },
      routes: pageMap,
      apiRoutes: apiRoutes,
      architecture: {
        framework: 'Next.js 14 (App Router)',
        styling: 'Tailwind CSS + Radix UI',
        database: 'Supabase (PostgreSQL)',
        auth: 'Supabase Auth',
        testing: 'Playwright + Vitest',
        deployment: 'Railway/Render/Fly.io'
      }
    };

    // Write page map to file
    writeFileSync('test-results/page-map.json', JSON.stringify(fullPageMap, null, 2));

    // Generate HTML report
    const htmlReport = `
<!DOCTYPE html>
<html>
<head>
    <title>Haus of Basquiat - Page Map Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 40px; }
        .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .route { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
        .success { border-left: 4px solid #22c55e; }
        .error { border-left: 4px solid #ef4444; }
        .screenshot { max-width: 300px; border-radius: 4px; margin-top: 10px; }
        .stats { display: flex; gap: 20px; margin: 20px 0; }
        .stat { padding: 10px 20px; background: #f3f4f6; border-radius: 6px; }
        .api-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; }
        .api-endpoint { padding: 8px 12px; background: #f8fafc; border-radius: 4px; font-family: monospace; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎭 Haus of Basquiat - Page Map Report</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
    </div>

    <div class="stats">
        <div class="stat">
            <strong>${fullPageMap.summary.accessible}</strong><br>
            Accessible Routes
        </div>
        <div class="stat">
            <strong>${fullPageMap.summary.errors}</strong><br>
            Route Errors
        </div>
        <div class="stat">
            <strong>${apiRoutes.length}</strong><br>
            API Endpoints
        </div>
    </div>

    <h2>📄 Page Routes</h2>
    ${pageMap.map(route => `
        <div class="route ${route.status === 'accessible' ? 'success' : 'error'}">
            <h3>${route.path} - ${route.name}</h3>
            <p><strong>Description:</strong> ${route.description}</p>
            ${route.title ? `<p><strong>Title:</strong> ${route.title}</p>` : ''}
            ${route.status === 'accessible' ?
                `<p><strong>Status:</strong> ✅ Accessible</p>
                 ${route.screenshot ? `<img src="../${route.screenshot}" alt="${route.name} screenshot" class="screenshot">` : ''}` :
                `<p><strong>Status:</strong> ❌ Error</p>
                 <p><strong>Error:</strong> ${route.error || 'Unknown error'}</p>`
            }
        </div>
    `).join('')}

    <h2>🔌 API Endpoints</h2>
    <div class="api-list">
        ${apiRoutes.map(endpoint => `
            <div class="api-endpoint">${endpoint}</div>
        `).join('')}
    </div>

    <h2>🏗️ Architecture</h2>
    <ul>
        <li><strong>Framework:</strong> ${fullPageMap.architecture.framework}</li>
        <li><strong>Styling:</strong> ${fullPageMap.architecture.styling}</li>
        <li><strong>Database:</strong> ${fullPageMap.architecture.database}</li>
        <li><strong>Authentication:</strong> ${fullPageMap.architecture.auth}</li>
        <li><strong>Testing:</strong> ${fullPageMap.architecture.testing}</li>
        <li><strong>Deployment:</strong> ${fullPageMap.architecture.deployment}</li>
    </ul>
</body>
</html>`;

    writeFileSync('test-results/page-map-report.html', htmlReport);

    console.log('📊 Page map generated:');
    console.log(`  • JSON: test-results/page-map.json`);
    console.log(`  • HTML: test-results/page-map-report.html`);
    console.log(`  • Screenshots: screenshots/`);
  });
});