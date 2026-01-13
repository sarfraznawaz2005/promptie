import * as fs from 'fs/promises';
import * as path from 'path';
import {
  ensureDir,
  readFile,
  writeFile,
  fileExists,
  deleteFile,
  readJsonFile,
  writeJsonFile,
  createAtomicWrite,
  getCurrentDirectory,
  resolvePath,
} from '../../src/utils/fs';

jest.mock('fs/promises');
jest.mock('path', () => ({
  join: jest.fn((...args: string[]) => args.join('/')),
  dirname: jest.fn((p: string) => p.replace(/[^/]+$/, '')),
  resolve: jest.fn((...args: string[]) => args.join('/')),
}));

const mockedFs = fs as jest.Mocked<typeof fs>;
const mockedPath = path as jest.Mocked<typeof path>;

// Mock console.warn to prevent test warnings
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = jest.fn();
});

afterAll(() => {
  console.warn = originalWarn;
});

describe('File System Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ensureDir', () => {
    it('should create directory if not exists', async () => {
      mockedFs.access.mockRejectedValue(new Error('Not found'));
      mockedFs.mkdir.mockResolvedValue(undefined);

      await ensureDir('/test/dir');

      expect(mockedFs.access).toHaveBeenCalledWith('/test/dir');
      expect(mockedFs.mkdir).toHaveBeenCalledWith('/test/dir', { recursive: true });
    });

    it('should not create directory if exists', async () => {
      mockedFs.access.mockResolvedValue(undefined);

      await ensureDir('/test/dir');

      expect(mockedFs.access).toHaveBeenCalledWith('/test/dir');
      expect(mockedFs.mkdir).not.toHaveBeenCalled();
    });
  });

  describe('readFile', () => {
    it('should read file successfully', async () => {
      mockedFs.readFile.mockResolvedValue('file content');

      const result = await readFile('/test/file.txt');

      expect(result).toBe('file content');
      expect(mockedFs.readFile).toHaveBeenCalledWith('/test/file.txt', 'utf-8');
    });

    it('should throw error on read failure', async () => {
      mockedFs.readFile.mockRejectedValue(new Error('Read failed'));

      await expect(readFile('/test/file.txt')).rejects.toThrow(
        'Failed to read file: /test/file.txt'
      );
    });
  });

  describe('writeFile', () => {
    it('should write file and create directory', async () => {
      mockedFs.access.mockRejectedValue(new Error('Not found'));
      mockedFs.mkdir.mockResolvedValue(undefined);
      mockedFs.writeFile.mockResolvedValue(undefined);
      mockedPath.dirname.mockReturnValue('/test');

      await writeFile('/test/file.txt', 'content');

      expect(mockedPath.dirname).toHaveBeenCalledWith('/test/file.txt');
      expect(mockedFs.mkdir).toHaveBeenCalledWith('/test', { recursive: true });
      expect(mockedFs.writeFile).toHaveBeenCalledWith('/test/file.txt', 'content', 'utf-8');
    });
  });

  describe('fileExists', () => {
    it('should return true when file exists', async () => {
      mockedFs.access.mockResolvedValue(undefined);

      const result = await fileExists('/test/file.txt');

      expect(result).toBe(true);
      expect(mockedFs.access).toHaveBeenCalledWith('/test/file.txt');
    });

    it('should return false when file does not exist', async () => {
      mockedFs.access.mockRejectedValue(new Error('Not found'));

      const result = await fileExists('/test/file.txt');

      expect(result).toBe(false);
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      mockedFs.unlink.mockResolvedValue(undefined);

      await deleteFile('/test/file.txt');

      expect(mockedFs.unlink).toHaveBeenCalledWith('/test/file.txt');
    });

    it('should throw error on delete failure', async () => {
      mockedFs.unlink.mockRejectedValue(new Error('Delete failed'));

      await expect(deleteFile('/test/file.txt')).rejects.toThrow(
        'Failed to delete file: /test/file.txt'
      );
    });
  });

  describe('readJsonFile', () => {
    it('should parse and return JSON', async () => {
      mockedFs.readFile.mockResolvedValue('{"name":"test"}');

      const result = await readJsonFile<{ name: string }>('/test/file.json');

      expect(result).toEqual({ name: 'test' });
    });

    it('should return null on parse error', async () => {
      mockedFs.readFile.mockResolvedValue('invalid json');

      const result = await readJsonFile<{ name: string }>('/test/file.json');

      expect(result).toBeNull();
    });

    it('should return null on file not found', async () => {
      mockedFs.readFile.mockRejectedValue(new Error('Not found'));

      const result = await readJsonFile<{ name: string }>('/test/file.json');

      expect(result).toBeNull();
    });
  });

  describe('writeJsonFile', () => {
    it('should write JSON with formatting using atomic writes', async () => {
      mockedFs.writeFile.mockResolvedValue(undefined);
      mockedFs.rename.mockResolvedValue(undefined);
      const data = { name: 'test', value: 123 };

      await writeJsonFile('/test/file.json', data);

      // Should write to temp file first
      expect(mockedFs.writeFile).toHaveBeenCalledWith(
        '/test/file.json.tmp',
        expect.stringContaining('"name"'),
        'utf-8'
      );
      // Should rename temp file to final file
      expect(mockedFs.rename).toHaveBeenCalledWith('/test/file.json.tmp', '/test/file.json');

      const writtenContent = mockedFs.writeFile.mock.calls[0][1];
      expect(writtenContent).toContain('"value"');
    });
  });

  describe('createAtomicWrite', () => {
    it('should write temp file then rename', async () => {
      mockedFs.writeFile.mockResolvedValue(undefined);
      mockedFs.rename.mockResolvedValue(undefined);

      await createAtomicWrite('/test/file.txt', 'content');

      expect(mockedFs.writeFile).toHaveBeenCalledWith('/test/file.txt.tmp', 'content', 'utf-8');
      expect(mockedFs.rename).toHaveBeenCalledWith('/test/file.txt.tmp', '/test/file.txt');
    });
  });

  describe('getCurrentDirectory', () => {
    it('should return current working directory', () => {
      const result = getCurrentDirectory();

      expect(result).toBe(process.cwd());
    });
  });

  describe('resolvePath', () => {
    it('should resolve path segments', () => {
      mockedPath.resolve.mockReturnValue('/base/sub/file.txt');

      const result = resolvePath('/base', 'sub', 'file.txt');

      expect(mockedPath.resolve).toHaveBeenCalledWith('/base', 'sub', 'file.txt');
      expect(result).toBe('/base/sub/file.txt');
    });
  });
});
