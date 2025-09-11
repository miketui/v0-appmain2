import { test, expect } from '@playwright/test';

// Test data
const testUsers = {
  admin: {
    email: 'admin@hausofbasquiat.com',
    password: 'admin123',
    role: 'Admin'
  },
  leader: {
    email: 'leader@hausofbasquiat.com', 
    password: 'leader123',
    role: 'Leader'
  },
  member: {
    email: 'member@hausofbasquiat.com',
    password: 'member123', 
    role: 'Member'
  },
  applicant: {
    email: 'applicant@hausofbasquiat.com',
    password: 'applicant123',
    role: 'Applicant'
  }
};

// Helper functions
async function loginUser(page, userType) {
  const user = testUsers[userType];
  await page.goto('/login');
  await page.fill('[data-testid="email-input"]', user.email);
  await page.click('[data-testid="login-button"]');
  
  // Wait for potential email verification or direct login
  await page.waitForURL(/\/(dashboard|apply)/, { timeout: 10000 });
}

async function createTestPost(page, content = 'Test post content', category = 'Performance') {
  await page.click('[data-testid="create-post-button"]');
  await page.fill('[data-testid="post-content"]', content);
  await page.selectOption('[data-testid="post-category"]', category);
  await page.click('[data-testid="submit-post"]');
  await page.waitForSelector('[data-testid="post-created-success"]');
}

async function uploadTestFile(page, fileName = 'test-image.jpg') {
  const fileInput = page.locator('[data-testid="file-input"]');
  await fileInput.setInputFiles({
    name: fileName,
    mimeType: 'image/jpeg',
    buffer: Buffer.from('fake-image-data')
  });
  await page.waitForSelector('[data-testid="file-uploaded"]');
}

test.describe('End-to-End User Workflows', () => {
  test.beforeEach(async ({ page }) => {
    // Set up mock API responses for consistent testing
    await page.route('**/api/**', (route) => {
      const url = route.request().url();
      
      // Mock authentication responses
      if (url.includes('/api/auth/login')) {
        route.fulfill({
          status: 200,
          body: JSON.stringify({ 
            token: 'mock-jwt-token',
            refreshToken: 'mock-refresh-token',
            user: { id: '1', email: route.request().postDataJSON()?.email }
          })
        });
        return;
      }
      
      // Mock profile responses based on email
      if (url.includes('/api/auth/profile')) {
        const email = route.request().headers()['authorization']?.includes('admin') ? 
          'admin@hausofbasquiat.com' : 'member@hausofbasquiat.com';
        
        const mockProfile = {
          id: '1',
          email,
          display_name: 'Test User',
          role: email.includes('admin') ? 'Admin' : 'Member',
          status: 'active',
          house_id: 'house-1'
        };
        
        route.fulfill({
          status: 200,
          body: JSON.stringify(mockProfile)
        });
        return;
      }
      
      // Continue with actual request for other URLs
      route.continue();
    });
  });

  test.describe('Member Application Workflow', () => {
    test('should complete full application process', async ({ page }) => {
      // Start application
      await page.goto('/');
      await page.click('[data-testid="apply-to-join"]');
      
      // Fill out application form
      await page.fill('[data-testid="display-name"]', 'Jordan Vogue');
      await page.fill('[data-testid="pronouns"]', 'they/them');
      await page.selectOption('[data-testid="house-preference"]', 'House of Mizrahi');
      await page.fill('[data-testid="experience-level"]', 'Intermediate');
      await page.fill('[data-testid="motivation"]', 'I want to learn more about ballroom culture and connect with the community.');
      
      // Upload verification documents
      await uploadTestFile(page, 'id-verification.jpg');
      
      // Submit application
      await page.click('[data-testid="submit-application"]');
      
      // Verify submission success
      await expect(page.locator('[data-testid="application-submitted"]')).toBeVisible();
      await expect(page.locator('text=Application Submitted Successfully')).toBeVisible();
      
      // Verify redirect to pending status page
      await page.waitForURL('/apply');
      await expect(page.locator('text=Application Under Review')).toBeVisible();
    });

    test('should handle application validation errors', async ({ page }) => {
      await page.goto('/apply');
      
      // Try to submit incomplete form
      await page.click('[data-testid="submit-application"]');
      
      // Check for validation errors
      await expect(page.locator('[data-testid="name-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="house-error"]')).toBeVisible();
      
      // Fill required fields and try again
      await page.fill('[data-testid="display-name"]', 'Test User');
      await page.selectOption('[data-testid="house-preference"]', 'House of Aviance');
      
      // Should now proceed to next step
      await page.click('[data-testid="continue-button"]');
      await expect(page.locator('[data-testid="step-2"]')).toBeVisible();
    });

    test('should save application progress', async ({ page }) => {
      await page.goto('/apply');
      
      // Fill partial form
      await page.fill('[data-testid="display-name"]', 'Test User');
      await page.selectOption('[data-testid="house-preference"]', 'House of Ninja');
      
      // Navigate away and back
      await page.goto('/');
      await page.goto('/apply');
      
      // Verify data was saved
      await expect(page.locator('[data-testid="display-name"]')).toHaveValue('Test User');
      await expect(page.locator('[data-testid="house-preference"]')).toHaveValue('House of Ninja');
    });
  });

  test.describe('Social Feed Workflow', () => {
    test.beforeEach(async ({ page }) => {
      await loginUser(page, 'member');
    });

    test('should create and interact with posts', async ({ page }) => {
      await page.goto('/');
      
      // Create a new post
      await createTestPost(page, 'Check out my latest runway walk! 💃✨', 'Fashion');
      
      // Verify post appears in feed
      await expect(page.locator('[data-testid="post-content"]').first()).toContainText('runway walk');
      
      // Like the post
      await page.click('[data-testid="like-button"]');
      await expect(page.locator('[data-testid="like-count"]')).toContainText('1');
      
      // Add a comment
      await page.fill('[data-testid="comment-input"]', 'Amazing work! The precision was flawless 🔥');
      await page.click('[data-testid="submit-comment"]');
      
      // Verify comment appears
      await expect(page.locator('[data-testid="comment-content"]')).toContainText('Amazing work');
      
      // Reply to comment
      await page.click('[data-testid="reply-button"]');
      await page.fill('[data-testid="reply-input"]', 'Thank you so much! 💜');
      await page.click('[data-testid="submit-reply"]');
      
      // Verify reply appears
      await expect(page.locator('[data-testid="reply-content"]')).toContainText('Thank you so much');
    });

    test('should handle media uploads in posts', async ({ page }) => {
      await page.goto('/');
      
      // Create post with media
      await page.click('[data-testid="create-post-button"]');
      await page.fill('[data-testid="post-content"]', 'Performance from last night 🌟');
      
      // Upload video file
      const fileInput = page.locator('[data-testid="media-upload"]');
      await fileInput.setInputFiles({
        name: 'performance.mp4',
        mimeType: 'video/mp4',
        buffer: Buffer.from('fake-video-data')
      });
      
      // Wait for upload processing
      await page.waitForSelector('[data-testid="upload-complete"]');
      
      // Submit post
      await page.click('[data-testid="submit-post"]');
      
      // Verify post with media appears
      await expect(page.locator('[data-testid="post-media"]')).toBeVisible();
      await expect(page.locator('[data-testid="media-thumbnail"]')).toBeVisible();
    });

    test('should filter posts by category', async ({ page }) => {
      await page.goto('/');
      
      // Create posts in different categories
      await createTestPost(page, 'Runway category post', 'Runway');
      await createTestPost(page, 'Performance category post', 'Performance');
      await createTestPost(page, 'Fashion category post', 'Fashion');
      
      // Filter by Performance
      await page.selectOption('[data-testid="category-filter"]', 'Performance');
      
      // Verify only Performance posts are shown
      await expect(page.locator('[data-testid="post-content"]')).toContainText('Performance category');
      await expect(page.locator('text=Runway category')).not.toBeVisible();
      
      // Filter by Fashion
      await page.selectOption('[data-testid="category-filter"]', 'Fashion');
      await expect(page.locator('[data-testid="post-content"]')).toContainText('Fashion category');
    });
  });

  test.describe('Real-time Messaging Workflow', () => {
    test.beforeEach(async ({ page }) => {
      await loginUser(page, 'member');
    });

    test('should send and receive messages', async ({ page, context }) => {
      // Open second page for another user
      const secondPage = await context.newPage();
      await loginUser(secondPage, 'leader');
      
      // Navigate to messages
      await page.goto('/messages');
      await secondPage.goto('/messages');
      
      // Start new conversation
      await page.click('[data-testid="new-conversation"]');
      await page.fill('[data-testid="recipient-search"]', 'leader@hausofbasquiat.com');
      await page.click('[data-testid="select-recipient"]');
      
      // Send message
      await page.fill('[data-testid="message-input"]', 'Hey! Excited about this weekend\'s ball 💃');
      await page.click('[data-testid="send-message"]');
      
      // Verify message appears in sender's view
      await expect(page.locator('[data-testid="message-content"]')).toContainText('weekend\'s ball');
      
      // Check if message appears in recipient's view (real-time)
      await secondPage.waitForSelector('[data-testid="new-message-notification"]');
      await secondPage.click('[data-testid="conversation-item"]');
      
      // Verify message received
      await expect(secondPage.locator('[data-testid="message-content"]')).toContainText('weekend\'s ball');
      
      // Reply from second user
      await secondPage.fill('[data-testid="message-input"]', 'Yes! Can\'t wait to see your performance 🔥');
      await secondPage.click('[data-testid="send-message"]');
      
      // Verify reply appears in original user's view
      await page.waitForSelector('text=Can\'t wait to see');
      await expect(page.locator('[data-testid="message-content"]').last()).toContainText('performance');
    });

    test('should handle file sharing in messages', async ({ page }) => {
      await page.goto('/messages');
      
      // Open existing conversation
      await page.click('[data-testid="conversation-item"]');
      
      // Upload file
      const fileInput = page.locator('[data-testid="file-attachment"]');
      await fileInput.setInputFiles({
        name: 'choreography-notes.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('fake-pdf-data')
      });
      
      // Send message with file
      await page.fill('[data-testid="message-input"]', 'Here are the choreography notes we discussed');
      await page.click('[data-testid="send-message"]');
      
      // Verify file attachment appears
      await expect(page.locator('[data-testid="file-attachment-preview"]')).toBeVisible();
      await expect(page.locator('text=choreography-notes.pdf')).toBeVisible();
    });

    test('should show typing indicators', async ({ page, context }) => {
      const secondPage = await context.newPage();
      await loginUser(secondPage, 'leader');
      
      await page.goto('/messages');
      await secondPage.goto('/messages');
      
      // Open same conversation
      await page.click('[data-testid="conversation-item"]');
      await secondPage.click('[data-testid="conversation-item"]');
      
      // Start typing on second page
      await secondPage.focus('[data-testid="message-input"]');
      await secondPage.type('[data-testid="message-input"]', 'I am typing...');
      
      // Check typing indicator appears on first page
      await page.waitForSelector('[data-testid="typing-indicator"]');
      await expect(page.locator('text=is typing...')).toBeVisible();
      
      // Stop typing and verify indicator disappears
      await secondPage.fill('[data-testid="message-input"]', '');
      await page.waitForSelector('[data-testid="typing-indicator"]', { state: 'hidden' });
    });
  });

  test.describe('Event Management Workflow', () => {
    test.beforeEach(async ({ page }) => {
      await loginUser(page, 'leader');
    });

    test('should create and manage events', async ({ page }) => {
      await page.goto('/events');
      
      // Create new event
      await page.click('[data-testid="create-event"]');
      await page.fill('[data-testid="event-title"]', 'Ballroom Workshop: Vogue Femme Basics');
      await page.fill('[data-testid="event-description"]', 'Learn the fundamentals of Vogue Femme with professional instruction');
      await page.fill('[data-testid="event-date"]', '2024-12-15');
      await page.fill('[data-testid="event-time"]', '19:00');
      await page.fill('[data-testid="event-location"]', 'Studio B, Dance Complex');
      await page.selectOption('[data-testid="event-category"]', 'Workshop');
      
      // Set ticket pricing
      await page.fill('[data-testid="ticket-price"]', '25');
      await page.fill('[data-testid="max-attendees"]', '20');
      
      // Submit event
      await page.click('[data-testid="submit-event"]');
      
      // Verify event creation
      await expect(page.locator('[data-testid="event-created-success"]')).toBeVisible();
      await expect(page.locator('text=Vogue Femme Basics')).toBeVisible();
      
      // Check event appears in calendar
      await page.goto('/events/calendar');
      await expect(page.locator('[data-testid="calendar-event"]')).toContainText('Vogue Femme');
    });

    test('should handle event registration and cancellation', async ({ page }) => {
      await loginUser(page, 'member'); // Switch to member for registration
      await page.goto('/events');
      
      // Find and register for event
      await page.click('[data-testid="event-card"]');
      await page.click('[data-testid="register-button"]');
      
      // Complete registration
      await page.fill('[data-testid="special-requirements"]', 'Vegetarian meal option please');
      await page.click('[data-testid="confirm-registration"]');
      
      // Verify registration success
      await expect(page.locator('[data-testid="registration-confirmed"]')).toBeVisible();
      await expect(page.locator('text=Registration Confirmed')).toBeVisible();
      
      // Check event appears in user's calendar
      await page.goto('/profile/events');
      await expect(page.locator('[data-testid="registered-event"]')).toBeVisible();
      
      // Cancel registration
      await page.click('[data-testid="cancel-registration"]');
      await page.click('[data-testid="confirm-cancellation"]');
      
      // Verify cancellation
      await expect(page.locator('[data-testid="cancellation-confirmed"]')).toBeVisible();
    });

    test('should stream live events', async ({ page }) => {
      await page.goto('/events/live/event-123');
      
      // Verify streaming interface loads
      await expect(page.locator('[data-testid="live-stream-player"]')).toBeVisible();
      await expect(page.locator('[data-testid="chat-sidebar"]')).toBeVisible();
      
      // Send chat message
      await page.fill('[data-testid="live-chat-input"]', 'This performance is incredible! 🔥');
      await page.click('[data-testid="send-chat-message"]');
      
      // Verify message appears in chat
      await expect(page.locator('[data-testid="chat-message"]')).toContainText('incredible');
      
      // Test stream controls
      await page.click('[data-testid="mute-button"]');
      await page.click('[data-testid="fullscreen-button"]');
      
      // Verify controls work
      await expect(page.locator('[data-testid="stream-muted"]')).toBeVisible();
    });
  });

  test.describe('File Upload and Gallery Workflow', () => {
    test.beforeEach(async ({ page }) => {
      await loginUser(page, 'member');
    });

    test('should upload and organize media in gallery', async ({ page }) => {
      await page.goto('/gallery');
      
      // Upload new media
      await page.click('[data-testid="upload-media"]');
      
      // Select multiple files
      const fileInputs = page.locator('[data-testid="file-input"]');
      await fileInputs.setInputFiles([
        {
          name: 'performance1.jpg',
          mimeType: 'image/jpeg',
          buffer: Buffer.from('fake-image-1')
        },
        {
          name: 'runway-look.jpg', 
          mimeType: 'image/jpeg',
          buffer: Buffer.from('fake-image-2')
        },
        {
          name: 'voguing-video.mp4',
          mimeType: 'video/mp4', 
          buffer: Buffer.from('fake-video')
        }
      ]);
      
      // Add metadata
      await page.fill('[data-testid="media-title"]', 'Ball Performance Collection');
      await page.fill('[data-testid="media-description"]', 'Highlights from recent ballroom competitions');
      await page.selectOption('[data-testid="media-category"]', 'Performance');
      await page.fill('[data-testid="media-tags"]', 'voguing, ballroom, performance, runway');
      
      // Submit upload
      await page.click('[data-testid="submit-upload"]');
      
      // Verify upload success
      await page.waitForSelector('[data-testid="upload-complete"]');
      await expect(page.locator('text=Upload completed successfully')).toBeVisible();
      
      // Check media appears in gallery
      await expect(page.locator('[data-testid="media-item"]')).toHaveCount(3);
      await expect(page.locator('text=Ball Performance Collection')).toBeVisible();
    });

    test('should handle large file uploads with progress', async ({ page }) => {
      await page.goto('/gallery/upload');
      
      // Mock large file upload
      const largeFile = {
        name: 'high-quality-performance.mov',
        mimeType: 'video/quicktime',
        buffer: Buffer.alloc(100 * 1024 * 1024) // 100MB mock file
      };
      
      const fileInput = page.locator('[data-testid="file-input"]');
      await fileInput.setInputFiles(largeFile);
      
      // Monitor upload progress
      await expect(page.locator('[data-testid="upload-progress"]')).toBeVisible();
      await expect(page.locator('[data-testid="progress-bar"]')).toBeVisible();
      
      // Wait for upload completion
      await page.waitForSelector('[data-testid="upload-complete"]', { timeout: 30000 });
      
      // Verify file processing
      await expect(page.locator('[data-testid="processing-status"]')).toContainText('Processing complete');
    });

    test('should filter and search gallery content', async ({ page }) => {
      await page.goto('/gallery');
      
      // Test category filter
      await page.selectOption('[data-testid="category-filter"]', 'Fashion');
      await expect(page.locator('[data-testid="media-item"]')).toHaveCount(2);
      
      // Test date filter
      await page.fill('[data-testid="date-from"]', '2024-01-01');
      await page.fill('[data-testid="date-to"]', '2024-06-30');
      await page.click('[data-testid="apply-date-filter"]');
      
      // Test search functionality
      await page.fill('[data-testid="search-input"]', 'runway');
      await page.click('[data-testid="search-button"]');
      
      // Verify search results
      await expect(page.locator('[data-testid="search-results"]')).toContainText('runway');
      
      // Test tag filtering
      await page.click('[data-testid="tag-voguing"]');
      await expect(page.locator('[data-testid="filtered-results"]')).toBeVisible();
    });
  });

  test.describe('Admin Management Workflow', () => {
    test.beforeEach(async ({ page }) => {
      await loginUser(page, 'admin');
    });

    test('should manage user applications', async ({ page }) => {
      await page.goto('/admin/applications');
      
      // Review pending application
      await page.click('[data-testid="application-item"]');
      
      // View application details
      await expect(page.locator('[data-testid="applicant-info"]')).toBeVisible();
      await expect(page.locator('[data-testid="application-responses"]')).toBeVisible();
      
      // Leave review notes
      await page.fill('[data-testid="review-notes"]', 'Strong application. Good understanding of ballroom culture.');
      
      // Approve application
      await page.click('[data-testid="approve-application"]');
      await page.selectOption('[data-testid="assign-house"]', 'House of Mizrahi');
      await page.click('[data-testid="confirm-approval"]');
      
      // Verify approval
      await expect(page.locator('[data-testid="approval-success"]')).toBeVisible();
      
      // Check user appears in members list
      await page.goto('/admin/members');
      await expect(page.locator('[data-testid="new-member"]')).toBeVisible();
    });

    test('should moderate content and handle reports', async ({ page }) => {
      await page.goto('/admin/moderation');
      
      // Review reported content
      await page.click('[data-testid="report-item"]');
      
      // View report details
      await expect(page.locator('[data-testid="reported-content"]')).toBeVisible();
      await expect(page.locator('[data-testid="report-reason"]')).toBeVisible();
      
      // Take moderation action
      await page.selectOption('[data-testid="moderation-action"]', 'Remove Content');
      await page.fill('[data-testid="moderation-reason"]', 'Content violates community guidelines regarding respectful behavior');
      
      // Send warning to user
      await page.check('[data-testid="send-warning"]');
      await page.fill('[data-testid="warning-message"]', 'Please review our community guidelines');
      
      // Submit moderation decision
      await page.click('[data-testid="submit-moderation"]');
      
      // Verify action taken
      await expect(page.locator('[data-testid="moderation-complete"]')).toBeVisible();
    });

    test('should view analytics and generate reports', async ({ page }) => {
      await page.goto('/admin/analytics');
      
      // Check dashboard metrics
      await expect(page.locator('[data-testid="total-members"]')).toBeVisible();
      await expect(page.locator('[data-testid="active-users"]')).toBeVisible();
      await expect(page.locator('[data-testid="engagement-metrics"]')).toBeVisible();
      
      // Generate custom report
      await page.click('[data-testid="generate-report"]');
      await page.selectOption('[data-testid="report-type"]', 'User Engagement');
      await page.fill('[data-testid="date-range-start"]', '2024-01-01');
      await page.fill('[data-testid="date-range-end"]', '2024-12-31');
      
      // Apply filters
      await page.selectOption('[data-testid="house-filter"]', 'All Houses');
      await page.selectOption('[data-testid="role-filter"]', 'All Roles');
      
      // Generate and download report
      await page.click('[data-testid="create-report"]');
      
      // Verify report generation
      await expect(page.locator('[data-testid="report-generating"]')).toBeVisible();
      await page.waitForSelector('[data-testid="report-ready"]');
      
      // Download report
      const downloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="download-report"]');
      const download = await downloadPromise;
      
      // Verify download
      expect(download.suggestedFilename()).toContain('user-engagement');
    });
  });

  test.describe('Performance and Load Testing', () => {
    test('should handle high-frequency real-time updates', async ({ page }) => {
      await loginUser(page, 'member');
      await page.goto('/');
      
      // Monitor for memory leaks during real-time updates
      const initialMemory = await page.evaluate(() => performance.memory?.usedJSHeapSize || 0);
      
      // Simulate high-frequency updates
      for (let i = 0; i < 50; i++) {
        await page.evaluate(() => {
          // Simulate real-time message/post updates
          window.dispatchEvent(new CustomEvent('realtime-update', {
            detail: { type: 'message', data: { id: Date.now(), content: 'Test message' } }
          }));
        });
        await page.waitForTimeout(100);
      }
      
      const finalMemory = await page.evaluate(() => performance.memory?.usedJSHeapSize || 0);
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });

    test('should maintain responsiveness under load', async ({ page }) => {
      await loginUser(page, 'member');
      await page.goto('/');
      
      // Measure initial load time
      const startTime = Date.now();
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      // Page should load within reasonable time
      expect(loadTime).toBeLessThan(5000);
      
      // Test UI responsiveness with rapid interactions
      for (let i = 0; i < 10; i++) {
        const interactionStart = Date.now();
        await page.click('[data-testid="like-button"]');
        await page.waitForSelector('[data-testid="like-animation"]');
        const interactionTime = Date.now() - interactionStart;
        
        // Each interaction should complete quickly
        expect(interactionTime).toBeLessThan(1000);
      }
    });
  });

  test.describe('Error Handling and Recovery', () => {
    test('should handle network failures gracefully', async ({ page }) => {
      await loginUser(page, 'member');
      await page.goto('/');
      
      // Simulate network failure
      await page.setOfflineMode(true);
      
      // Try to perform action that requires network
      await page.click('[data-testid="create-post-button"]');
      await page.fill('[data-testid="post-content"]', 'This should fail gracefully');
      await page.click('[data-testid="submit-post"]');
      
      // Verify error handling
      await expect(page.locator('[data-testid="network-error"]')).toBeVisible();
      await expect(page.locator('text=Network connection required')).toBeVisible();
      
      // Restore network and retry
      await page.setOfflineMode(false);
      await page.click('[data-testid="retry-action"]');
      
      // Verify action succeeds after network restoration
      await expect(page.locator('[data-testid="post-created-success"]')).toBeVisible();
    });

    test('should recover from session expiration', async ({ page }) => {
      await loginUser(page, 'member');
      await page.goto('/');
      
      // Simulate session expiration
      await page.evaluate(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      });
      
      // Try to perform authenticated action
      await page.click('[data-testid="create-post-button"]');
      
      // Should redirect to login
      await page.waitForURL('/login');
      await expect(page.locator('text=Session expired')).toBeVisible();
      
      // Log back in
      await loginUser(page, 'member');
      
      // Should be able to continue where left off
      await expect(page.locator('[data-testid="create-post-button"]')).toBeVisible();
    });
  });
});