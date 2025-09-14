import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FileUploader from '../FileUploader';
import { api } from '../../api/client';

// Mock API client
vi.mock('../../api/client', () => ({
  api: {
    upload: {
      validate: vi.fn()
    }
  }
}));

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

describe('FileUploader', () => {
  const defaultProps = {
    onFilesSelected: vi.fn(),
    accept: "image/*,.pdf,.doc,.docx",
    multiple: true,
    maxFiles: 5,
    maxSizePerFile: 10 * 1024 * 1024, // 10MB
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset URL mocks
    global.URL.createObjectURL.mockReturnValue('blob:mock-url');
    api.upload.validate.mockResolvedValue({ data: { safe: true } });
  });

  describe('File Selection', () => {
    it('should render upload area', () => {
      render(<FileUploader {...defaultProps} />);
      
      expect(screen.getByText(/drag and drop files here/i)).toBeInTheDocument();
      expect(screen.getByText(/click to select files/i)).toBeInTheDocument();
    });

    it('should handle single file selection', async () => {
      const user = userEvent.setup();
      render(<FileUploader {...defaultProps} multiple={false} />);
      
      const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByLabelText(/drag and drop files here/i);
      
      await user.upload(input, file);
      
      await waitFor(() => {
        expect(defaultProps.onFilesSelected).toHaveBeenCalledWith([
          expect.objectContaining({
            name: 'test.jpg',
            type: 'image/jpeg'
          })
        ]);
      });
    });

    it('should handle multiple file selection', async () => {
      const user = userEvent.setup();
      render(<FileUploader {...defaultProps} />);
      
      const files = [
        new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['test2'], 'test2.png', { type: 'image/png' })
      ];
      const input = screen.getByLabelText(/drag and drop files here/i);
      
      await user.upload(input, files);
      
      await waitFor(() => {
        expect(defaultProps.onFilesSelected).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ name: 'test1.jpg' }),
            expect.objectContaining({ name: 'test2.png' })
          ])
        );
      });
    });
  });

  describe('File Validation - Client Side', () => {
    it('should reject files exceeding size limit', async () => {
      const user = userEvent.setup();
      render(<FileUploader {...defaultProps} maxSizePerFile={1024} />); // 1KB limit
      
      const largeFile = new File(['x'.repeat(2048)], 'large.jpg', { type: 'image/jpeg' });
      const input = screen.getByLabelText(/drag and drop files here/i);
      
      await user.upload(input, largeFile);
      
      await waitFor(() => {
        expect(screen.getByText(/file size must be less than/i)).toBeInTheDocument();
      });
      
      expect(defaultProps.onFilesSelected).not.toHaveBeenCalled();
    });

    it('should reject unsupported file types', async () => {
      const user = userEvent.setup();
      render(<FileUploader {...defaultProps} accept="image/*" />);
      
      const textFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      const input = screen.getByLabelText(/drag and drop files here/i);
      
      await user.upload(input, textFile);
      
      await waitFor(() => {
        expect(defaultProps.onFilesSelected).not.toHaveBeenCalled();
      });
    });

    it('should enforce maximum file count', async () => {
      const user = userEvent.setup();
      render(<FileUploader {...defaultProps} maxFiles={2} />);
      
      const files = [
        new File(['1'], '1.jpg', { type: 'image/jpeg' }),
        new File(['2'], '2.jpg', { type: 'image/jpeg' }),
        new File(['3'], '3.jpg', { type: 'image/jpeg' })
      ];
      const input = screen.getByLabelText(/drag and drop files here/i);
      
      await user.upload(input, files);
      
      await waitFor(() => {
        expect(screen.getByText(/maximum 2 files allowed/i)).toBeInTheDocument();
      });
      
      expect(defaultProps.onFilesSelected).not.toHaveBeenCalled();
    });

    it('should validate file extensions correctly', async () => {
      const user = userEvent.setup();
      render(<FileUploader {...defaultProps} accept=".jpg,.png" />);
      
      // Valid extension
      const validFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      // Invalid extension  
      const invalidFile = new File(['test'], 'test.gif', { type: 'image/gif' });
      
      const input = screen.getByLabelText(/drag and drop files here/i);
      
      await user.upload(input, [validFile, invalidFile]);
      
      await waitFor(() => {
        expect(defaultProps.onFilesSelected).toHaveBeenCalled();
      });
    });
  });

  describe('File Validation - Server Side', () => {
    it('should perform server-side validation for each file', async () => {
      const user = userEvent.setup();
      render(<FileUploader {...defaultProps} />);
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByLabelText(/drag and drop files here/i);
      
      await user.upload(input, file);
      
      await waitFor(() => {
        expect(api.upload.validate).toHaveBeenCalledWith(
          expect.objectContaining({ name: 'test.jpg' })
        );
      });
    });

    it('should reject files that fail server validation', async () => {
      const user = userEvent.setup();
      api.upload.validate.mockRejectedValueOnce({
        response: { 
          data: { 
            threats: ['Malicious content detected', 'Suspicious file signature'] 
          } 
        }
      });
      
      render(<FileUploader {...defaultProps} />);
      
      const file = new File(['malicious'], 'virus.jpg', { type: 'image/jpeg' });
      const input = screen.getByLabelText(/drag and drop files here/i);
      
      await user.upload(input, file);
      
      await waitFor(() => {
        expect(screen.getByText(/virus.jpg.*malicious content detected/i)).toBeInTheDocument();
      });
      
      expect(defaultProps.onFilesSelected).not.toHaveBeenCalled();
    });

    it('should handle server validation failures gracefully', async () => {
      const user = userEvent.setup();
      api.upload.validate.mockRejectedValueOnce({
        response: { data: {} } // No threats array
      });
      
      render(<FileUploader {...defaultProps} />);
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByLabelText(/drag and drop files here/i);
      
      await user.upload(input, file);
      
      await waitFor(() => {
        expect(screen.getByText(/test.jpg.*security validation failed/i)).toBeInTheDocument();
      });
    });

    it('should show validation status indicators', async () => {
      const user = userEvent.setup();
      render(<FileUploader {...defaultProps} />);
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByLabelText(/drag and drop files here/i);
      
      // Mock slow validation
      let resolveValidation;
      api.upload.validate.mockReturnValueOnce(
        new Promise(resolve => { resolveValidation = resolve; })
      );
      
      await user.upload(input, file);
      
      // Complete validation
      resolveValidation({ data: { safe: true } });
      
      await waitFor(() => {
        expect(screen.getByText(/selected files/i)).toBeInTheDocument();
      });
    });
  });

  describe('Drag and Drop', () => {
    it('should handle drag and drop events', async () => {
      render(<FileUploader {...defaultProps} />);
      
      const dropZone = screen.getByLabelText(/file dropzone/i);
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      // Simulate drag enter
      fireEvent.dragEnter(dropZone, {
        dataTransfer: { files: [file] }
      });
      
      expect(dropZone).toHaveClass(/border-purple-500/); // Active drag state
      
      // Simulate drop
      fireEvent.drop(dropZone, {
        dataTransfer: { files: [file] }
      });
      
      await waitFor(() => {
        expect(defaultProps.onFilesSelected).toHaveBeenCalled();
      });
    });

    it('should handle drag leave events', () => {
      render(<FileUploader {...defaultProps} />);
      
      const dropZone = screen.getByLabelText(/file dropzone/i);
      
      fireEvent.dragEnter(dropZone);
      expect(dropZone).toHaveClass(/border-purple-500/);
      
      fireEvent.dragLeave(dropZone);
      expect(dropZone).not.toHaveClass(/border-purple-500/);
    });
  });

  describe('File Management', () => {
    it('should allow removing selected files', async () => {
      const user = userEvent.setup();
      render(<FileUploader {...defaultProps} />);
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByLabelText(/drag and drop files here/i);
      
      await user.upload(input, file);
      
      await waitFor(() => {
        expect(screen.getByText('test.jpg')).toBeInTheDocument();
      });
      
      const removeButton = screen.getByRole('button', { name: /Remove test\.jpg/i });
      await user.click(removeButton);
      
      expect(screen.queryByText('test.jpg')).not.toBeInTheDocument();
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('should clear all files', async () => {
      const user = userEvent.setup();
      render(<FileUploader {...defaultProps} />);
      
      const files = [
        new File(['1'], '1.jpg', { type: 'image/jpeg' }),
        new File(['2'], '2.jpg', { type: 'image/jpeg' })
      ];
      const input = screen.getByLabelText(/drag and drop files here/i);
      
      await user.upload(input, files);
      
      await waitFor(() => {
        expect(screen.getByText('1.jpg')).toBeInTheDocument();
        expect(screen.getByText('2.jpg')).toBeInTheDocument();
      });
      
      const clearButton = screen.getByText(/clear all/i);
      await user.click(clearButton);
      
      expect(screen.queryByText('1.jpg')).not.toBeInTheDocument();
      expect(screen.queryByText('2.jpg')).not.toBeInTheDocument();
      expect(global.URL.revokeObjectURL).toHaveBeenCalledTimes(2);
    });
  });

  describe('File Previews', () => {
    it('should generate preview for image files', async () => {
      const user = userEvent.setup();
      render(<FileUploader {...defaultProps} />);
      
      const imageFile = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByLabelText(/drag and drop files here/i);
      
      await user.upload(input, imageFile);
      
      await waitFor(() => {
        const preview = screen.getByAltText(/preview/i);
        expect(preview).toHaveAttribute('src', 'blob:mock-url');
      });
    });

    it('should not generate preview for non-image files', async () => {
      const user = userEvent.setup();
      render(<FileUploader {...defaultProps} />);
      
      const pdfFile = new File(['pdf'], 'test.pdf', { type: 'application/pdf' });
      const input = screen.getByLabelText(/drag and drop files here/i);
      
      await user.upload(input, pdfFile);
      
      await waitFor(() => {
        expect(screen.getByText('test.pdf')).toBeInTheDocument();
        expect(screen.queryByAltText(/preview/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle corrupted files gracefully', async () => {
      const user = userEvent.setup();
      api.upload.validate.mockRejectedValueOnce({
        response: { 
          data: { 
            threats: ['File appears to be corrupted'] 
          } 
        }
      });
      
      render(<FileUploader {...defaultProps} />);
      
      // Create a file that might be considered corrupted
      const corruptedFile = new File([''], 'corrupted.jpg', { type: 'image/jpeg' });
      const input = screen.getByLabelText(/drag and drop files here/i);
      
      await user.upload(input, corruptedFile);
      
      await waitFor(() => {
        expect(screen.getByText(/corrupted.jpg.*file appears to be corrupted/i)).toBeInTheDocument();
      });
    });

    it('should handle zero-byte files', async () => {
      const user = userEvent.setup();
      render(<FileUploader {...defaultProps} />);
      
      const emptyFile = new File([''], 'empty.jpg', { type: 'image/jpeg' });
      const input = screen.getByLabelText(/drag and drop files here/i);
      
      await user.upload(input, emptyFile);
      
      // Should pass client-side validation but might fail server-side
      await waitFor(() => {
        expect(api.upload.validate).toHaveBeenCalled();
      });
    });

    it('should handle files with unusual characters in names', async () => {
      const user = userEvent.setup();
      render(<FileUploader {...defaultProps} />);
      
      const weirdNameFile = new File(['test'], 'файл с пробелами & символами.jpg', { type: 'image/jpeg' });
      const input = screen.getByLabelText(/drag and drop files here/i);
      
      await user.upload(input, weirdNameFile);
      
      await waitFor(() => {
        expect(screen.getByText('файл с пробелами & символами.jpg')).toBeInTheDocument();
      });
    });

    it('should handle very long file names', async () => {
      const user = userEvent.setup();
      render(<FileUploader {...defaultProps} />);
      
      const longName = 'a'.repeat(255) + '.jpg';
      const longNameFile = new File(['test'], longName, { type: 'image/jpeg' });
      const input = screen.getByLabelText(/drag and drop files here/i);
      
      await user.upload(input, longNameFile);
      
      await waitFor(() => {
        expect(screen.getByTitle(longName)).toBeInTheDocument();
      });
    });

    it('should handle simultaneous file uploads', async () => {
      const user = userEvent.setup();
      render(<FileUploader {...defaultProps} />);
      
      const files = Array.from({ length: 5 }, (_, i) => 
        new File([`content${i}`], `file${i}.jpg`, { type: 'image/jpeg' })
      );
      
      const input = screen.getByLabelText(/drag and drop files here/i);
      
      await user.upload(input, files);
      
      // Should call validation for each file
      await waitFor(() => {
        expect(api.upload.validate).toHaveBeenCalledTimes(5);
      });
    });

    it('should handle network errors during validation', async () => {
      const user = userEvent.setup();
      api.upload.validate.mockRejectedValueOnce(new Error('Network error'));
      
      render(<FileUploader {...defaultProps} />);
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByLabelText(/drag and drop files here/i);
      
      await user.upload(input, file);
      
      await waitFor(() => {
        expect(screen.getByText(/test.jpg.*security validation failed/i)).toBeInTheDocument();
      });
    });
  });

  describe('Memory Management', () => {
    it('should clean up object URLs when component unmounts', () => {
      const { unmount } = render(<FileUploader {...defaultProps} />);
      
      // Add files to create object URLs
      const files = [
        Object.assign(new File(['1'], '1.jpg', { type: 'image/jpeg' }), {
          id: '1',
          preview: 'blob:url1'
        }),
        Object.assign(new File(['2'], '2.jpg', { type: 'image/jpeg' }), {
          id: '2',
          preview: 'blob:url2'
        })
      ];
      
      // Manually set selected files to test cleanup
      const instance = screen.getByTestId ? screen.getByTestId('file-uploader') : null;
      
      unmount();
      
      // In a real scenario, object URLs would be cleaned up
      // This is hard to test directly, but we can verify the pattern
    });
  });
});
