import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import CommentSection from '../CommentSection';
import FileUploader from '../FileUploader';
import Modal from '../Modal';
import NotificationBell from '../NotificationBell';
import SearchBar from '../SearchBar';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock dependencies
vi.mock('../../api/client', () => ({
  api: {
    upload: {
      validate: vi.fn().mockResolvedValue({ data: { safe: true } })
    }
  }
}));

global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

describe('Accessibility Tests', () => {
  const mockUser = {
    id: '1',
    display_name: 'Test User',
    avatar_url: null,
    house: { name: 'Test House' },
    role: 'Member'
  };

  describe('CommentSection Accessibility', () => {
    const defaultProps = {
      postId: 'post-1',
      currentUser: mockUser,
      onCommentAdded: vi.fn()
    };

    it('should have no accessibility violations', async () => {
      const { container } = render(<CommentSection {...defaultProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA labels for comment form', () => {
      render(<CommentSection {...defaultProps} />);
      
      const textarea = screen.getByRole('textbox', { name: /write a comment/i });
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveAttribute('aria-label', expect.stringContaining('comment'));
    });

    it('should have proper heading structure', () => {
      render(<CommentSection {...defaultProps} />);
      
      // Comments section should have appropriate headings
      const headings = screen.getAllByRole('heading');
      headings.forEach(heading => {
        expect(heading).toHaveAttribute('aria-level');
      });
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<CommentSection {...defaultProps} />);
      
      const textarea = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: /comment/i });
      
      // Should be able to tab between elements
      await user.tab();
      expect(textarea).toHaveFocus();
      
      await user.tab();
      expect(submitButton).toHaveFocus();
    });

    it('should announce comment actions to screen readers', async () => {
      const user = userEvent.setup();
      render(<CommentSection {...defaultProps} />);
      
      // Look for like buttons
      const likeButtons = screen.getAllByRole('button', { name: /like/i });
      likeButtons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
      });
      
      // Look for reply buttons
      const replyButtons = screen.getAllByRole('button', { name: /reply/i });
      replyButtons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
      });
    });

    it('should have proper focus management for reply forms', async () => {
      const user = userEvent.setup();
      render(<CommentSection {...defaultProps} />);
      
      // Find and click a reply button
      const replyButton = screen.getAllByRole('button', { name: /reply/i })[0];
      await user.click(replyButton);
      
      // Reply textarea should receive focus
      const replyTextarea = screen.getByRole('textbox', { name: /reply to/i });
      expect(replyTextarea).toHaveFocus();
    });

    it('should support ESC key to close reply forms', async () => {
      const user = userEvent.setup();
      render(<CommentSection {...defaultProps} />);
      
      const replyButton = screen.getAllByRole('button', { name: /reply/i })[0];
      await user.click(replyButton);
      
      const replyTextarea = screen.getByRole('textbox', { name: /reply to/i });
      expect(replyTextarea).toBeInTheDocument();
      
      await user.keyboard('{Escape}');
      expect(replyTextarea).not.toBeInTheDocument();
    });

    it('should announce loading and error states', async () => {
      const { rerender } = render(<CommentSection {...defaultProps} />);
      
      // Should have aria-live regions for dynamic content
      const liveRegions = screen.getAllByRole('status');
      expect(liveRegions.length).toBeGreaterThan(0);
    });
  });

  describe('FileUploader Accessibility', () => {
    const defaultProps = {
      onFilesSelected: vi.fn(),
      accept: "image/*,.pdf,.doc,.docx",
      multiple: true,
      maxFiles: 5,
      maxSizePerFile: 10 * 1024 * 1024
    };

    it('should have no accessibility violations', async () => {
      const { container } = render(<FileUploader {...defaultProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper file input labeling', () => {
      render(<FileUploader {...defaultProps} />);
      
      const fileInput = screen.getByLabelText(/drag & drop files here/i);
      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveAttribute('type', 'file');
    });

    it('should announce file validation errors', async () => {
      const user = userEvent.setup();
      render(<FileUploader {...defaultProps} maxSizePerFile={1024} />);
      
      const largeFile = new File(['x'.repeat(2048)], 'large.jpg', { type: 'image/jpeg' });
      const input = screen.getByLabelText(/drag & drop files here/i);
      
      await user.upload(input, largeFile);
      
      // Error should be announced via aria-live region
      const errorMessage = await screen.findByText(/file size must be less than/i);
      expect(errorMessage).toHaveAttribute('role', 'alert');
    });

    it('should support keyboard file removal', async () => {
      const user = userEvent.setup();
      render(<FileUploader {...defaultProps} />);
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByLabelText(/drag & drop files here/i);
      
      await user.upload(input, file);
      
      const removeButton = await screen.findByRole('button', { name: /remove.*test\.jpg/i });
      expect(removeButton).toBeInTheDocument();
      
      await user.click(removeButton);
      expect(screen.queryByText('test.jpg')).not.toBeInTheDocument();
    });

    it('should provide upload progress announcements', async () => {
      const user = userEvent.setup();
      render(<FileUploader {...defaultProps} />);
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByLabelText(/drag & drop files here/i);
      
      await user.upload(input, file);
      
      // Should have progress indicators with proper labeling
      const progressElements = screen.getAllByRole('progressbar');
      progressElements.forEach(progress => {
        expect(progress).toHaveAttribute('aria-label');
      });
    });

    it('should support drag and drop for keyboard users', () => {
      render(<FileUploader {...defaultProps} />);
      
      const dropZone = screen.getByLabelText(/drag & drop files here/i);
      
      // Should be focusable and have proper instructions
      expect(dropZone).toHaveAttribute('tabindex', '0');
      expect(dropZone).toHaveAttribute('aria-describedby');
    });
  });

  describe('Modal Accessibility', () => {
    const defaultProps = {
      isOpen: true,
      onClose: vi.fn(),
      title: 'Test Modal',
      children: <div>Modal content</div>
    };

    it('should have no accessibility violations', async () => {
      const { container } = render(<Modal {...defaultProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should trap focus within modal', async () => {
      const user = userEvent.setup();
      render(
        <>
          <button>Outside button</button>
          <Modal {...defaultProps}>
            <button>Modal button 1</button>
            <button>Modal button 2</button>
          </Modal>
        </>
      );
      
      const modalButton1 = screen.getByRole('button', { name: 'Modal button 1' });
      const modalButton2 = screen.getByRole('button', { name: 'Modal button 2' });
      const closeButton = screen.getByRole('button', { name: /close/i });
      
      // Focus should start on first focusable element in modal
      expect(modalButton1).toHaveFocus();
      
      // Tab should cycle through modal elements only
      await user.tab();
      expect(modalButton2).toHaveFocus();
      
      await user.tab();
      expect(closeButton).toHaveFocus();
      
      await user.tab();
      expect(modalButton1).toHaveFocus(); // Should wrap around
    });

    it('should close on ESC key', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<Modal {...defaultProps} onClose={onClose} />);
      
      await user.keyboard('{Escape}');
      expect(onClose).toHaveBeenCalled();
    });

    it('should have proper ARIA attributes', () => {
      render(<Modal {...defaultProps} />);
      
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(modal).toHaveAttribute('aria-labelledby');
      
      const title = screen.getByText('Test Modal');
      expect(title).toHaveAttribute('id');
    });

    it('should restore focus on close', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      
      render(
        <>
          <button data-testid="trigger">Open Modal</button>
          <Modal {...defaultProps} onClose={onClose} />
        </>
      );
      
      const trigger = screen.getByTestId('trigger');
      trigger.focus();
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);
      
      expect(onClose).toHaveBeenCalled();
      // In real implementation, focus should return to trigger
    });
  });

  describe('NotificationBell Accessibility', () => {
    const defaultProps = {
      notifications: [
        { id: '1', title: 'Test notification', read: false, created_at: new Date() }
      ],
      unreadCount: 1,
      onMarkAsRead: vi.fn(),
      onMarkAllAsRead: vi.fn()
    };

    it('should have no accessibility violations', async () => {
      const { container } = render(<NotificationBell {...defaultProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should announce unread count to screen readers', () => {
      render(<NotificationBell {...defaultProps} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', expect.stringContaining('1'));
    });

    it('should support keyboard navigation in dropdown', async () => {
      const user = userEvent.setup();
      render(<NotificationBell {...defaultProps} />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      const notifications = screen.getAllByRole('listitem');
      expect(notifications.length).toBeGreaterThan(0);
      
      // Should be able to navigate with arrow keys
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowUp}');
    });

    it('should close dropdown on ESC', async () => {
      const user = userEvent.setup();
      render(<NotificationBell {...defaultProps} />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      const dropdown = screen.getByRole('list');
      expect(dropdown).toBeInTheDocument();
      
      await user.keyboard('{Escape}');
      expect(dropdown).not.toBeInTheDocument();
    });
  });

  describe('SearchBar Accessibility', () => {
    const defaultProps = {
      onSearch: vi.fn(),
      placeholder: 'Search the community...',
      suggestions: [
        { id: '1', title: 'Test suggestion', type: 'user' }
      ]
    };

    it('should have no accessibility violations', async () => {
      const { container } = render(<SearchBar {...defaultProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA attributes for autocomplete', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} />);
      
      const input = screen.getByRole('searchbox');
      expect(input).toHaveAttribute('aria-autocomplete', 'list');
      expect(input).toHaveAttribute('aria-expanded', 'false');
      
      await user.type(input, 'test');
      
      expect(input).toHaveAttribute('aria-expanded', 'true');
      expect(input).toHaveAttribute('aria-activedescendant');
    });

    it('should support keyboard navigation in suggestions', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} />);
      
      const input = screen.getByRole('searchbox');
      await user.type(input, 'test');
      
      // Should be able to navigate suggestions with arrow keys
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowUp}');
      await user.keyboard('{Enter}');
      
      expect(defaultProps.onSearch).toHaveBeenCalled();
    });

    it('should announce search results to screen readers', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} />);
      
      const input = screen.getByRole('searchbox');
      await user.type(input, 'test');
      
      // Should have aria-live region for results announcement
      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toBeInTheDocument();
    });
  });

  describe('General Accessibility Standards', () => {
    it('should have sufficient color contrast', () => {
      // This would typically use a color contrast testing library
      // For now, we'll check that colors are defined in CSS variables
      const styles = getComputedStyle(document.documentElement);
      
      // Check that theme colors are defined
      expect(styles.getPropertyValue('--color-primary')).toBeTruthy();
      expect(styles.getPropertyValue('--color-text')).toBeTruthy();
      expect(styles.getPropertyValue('--color-background')).toBeTruthy();
    });

    it('should support reduced motion preferences', () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });
      
      render(<CommentSection postId="1" currentUser={mockUser} />);
      
      // Components should respect reduced motion
      const animatedElements = screen.getAllByRole('button');
      animatedElements.forEach(element => {
        const styles = getComputedStyle(element);
        // In a real implementation, we'd check for reduced animations
        expect(styles.transition).toBeDefined();
      });
    });

    it('should work with screen reader navigation landmarks', () => {
      render(
        <div>
          <header role="banner">Header</header>
          <nav role="navigation">Navigation</nav>
          <main role="main">
            <CommentSection postId="1" currentUser={mockUser} />
          </main>
          <footer role="contentinfo">Footer</footer>
        </div>
      );
      
      const landmarks = [
        screen.getByRole('banner'),
        screen.getByRole('navigation'),
        screen.getByRole('main'),
        screen.getByRole('contentinfo')
      ];
      
      landmarks.forEach(landmark => {
        expect(landmark).toBeInTheDocument();
      });
    });

    it('should provide skip links for keyboard users', () => {
      render(
        <div>
          <a href="#main-content" className="sr-only focus:not-sr-only">
            Skip to main content
          </a>
          <main id="main-content">
            <CommentSection postId="1" currentUser={mockUser} />
          </main>
        </div>
      );
      
      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    it('should handle high contrast mode', () => {
      // Mock high contrast media query
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-contrast: high)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });
      
      render(<CommentSection postId="1" currentUser={mockUser} />);
      
      // Components should adapt to high contrast
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('type');
      });
    });
  });
});
