
import { 
  handleUploadError, 
  handleStorageError, 
  handleDatabaseError, 
  handleAnalysisError 
} from '../errorHandler';
import { toast } from "@/hooks/use-toast";

// Mock the toast function
jest.mock("@/hooks/use-toast", () => ({
  toast: jest.fn()
}));

// Mock console.error to avoid polluting test output
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('Error Handler Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleUploadError', () => {
    it('should log error and show toast with error message', () => {
      const error = new Error('Upload failed due to network error');
      handleUploadError(error);
      
      expect(console.error).toHaveBeenCalledWith('Upload error:', error);
      expect(toast).toHaveBeenCalledWith({
        title: 'Upload failed',
        description: 'Upload failed due to network error',
        variant: 'destructive'
      });
    });

    it('should use default message when error has no message', () => {
      const error = { code: 500 };
      handleUploadError(error);
      
      expect(toast).toHaveBeenCalledWith({
        title: 'Upload failed',
        description: 'There was an error processing your design. Please try again.',
        variant: 'destructive'
      });
    });
  });

  describe('handleStorageError', () => {
    it('should return generic message for unspecified errors', () => {
      const error = new Error('Unknown error');
      const result = handleStorageError(error);
      
      expect(result).toBe('There was an error uploading your file.');
    });

    it('should return quota exceeded message', () => {
      const error = { message: 'storage quota exceeded' };
      const result = handleStorageError(error);
      
      expect(result).toBe('Storage quota exceeded. Please try a smaller file or contact support.');
    });

    it('should return not found message', () => {
      const error = { message: 'not found in bucket' };
      const result = handleStorageError(error);
      
      expect(result).toBe('Storage bucket not found. Please contact support.');
    });

    it('should return unauthorized message', () => {
      const error = { message: 'unauthorized access' };
      const result = handleStorageError(error);
      
      expect(result).toBe('You don\'t have permission to upload files. Please log in again.');
    });

    it('should return file size message', () => {
      const error = { message: 'file size exceeds limit' };
      const result = handleStorageError(error);
      
      expect(result).toBe('File is too large. Maximum size is 5MB.');
    });
  });

  describe('handleDatabaseError', () => {
    it('should return generic message for unspecified errors', () => {
      const error = new Error('Unknown database error');
      const result = handleDatabaseError(error);
      
      expect(result).toBe('Error saving your review to the database.');
    });

    it('should return duplicate key message', () => {
      const error = { message: 'duplicate key violation' };
      const result = handleDatabaseError(error);
      
      expect(result).toBe('A review with this title already exists. Please try again.');
    });

    it('should return foreign key message', () => {
      const error = { message: 'foreign key constraint' };
      const result = handleDatabaseError(error);
      
      expect(result).toBe('Database reference error. Please contact support.');
    });

    it('should return not-null message', () => {
      const error = { message: 'not-null constraint' };
      const result = handleDatabaseError(error);
      
      expect(result).toBe('Missing required fields. Please try again.');
    });
  });

  describe('handleAnalysisError', () => {
    it('should return generic message for unspecified errors', () => {
      const error = new Error('Unknown analysis error');
      const result = handleAnalysisError(error);
      
      expect(result).toBe('Error during AI analysis.');
    });

    it('should return timeout message', () => {
      const error = { message: 'request timeout occurred' };
      const result = handleAnalysisError(error);
      
      expect(result).toBe('Analysis timed out. Your design may be too complex or our service is busy.');
    });

    it('should return quota message', () => {
      const error = { message: 'quota exceeded for API' };
      const result = handleAnalysisError(error);
      
      expect(result).toBe('We\'ve reached our AI service quota. Please try again later.');
    });

    it('should return rate limit message', () => {
      const error = { message: 'rate limit reached' };
      const result = handleAnalysisError(error);
      
      expect(result).toBe('Too many requests. Please try again in a few minutes.');
    });
  });
});
