import { base64ToUint8Array } from '../../utils/base64';

describe('base64ToUint8Array', () => {
  it('should convert a simple base64 string to Uint8Array', () => {
    // "Hello" in base64
    const base64 = 'SGVsbG8=';
    const result = base64ToUint8Array(base64);
    
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(5);
    expect(String.fromCharCode(...result)).toBe('Hello');
  });

  it('should convert empty base64 string to empty Uint8Array', () => {
    const base64 = '';
    const result = base64ToUint8Array(base64);
    
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(0);
  });

  it('should convert base64 with special characters correctly', () => {
    // "Test@123" in base64
    const base64 = 'VGVzdEAxMjM=';
    const result = base64ToUint8Array(base64);
    
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(8);
    expect(String.fromCharCode(...result)).toBe('Test@123');
  });

  it('should handle base64 encoded binary data', () => {
    // Single byte: 0xFF
    const base64 = '/w==';
    const result = base64ToUint8Array(base64);
    
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(1);
    expect(result[0]).toBe(255);
  });

  it('should convert longer base64 strings correctly', () => {
    // "Hello World!" in base64
    const base64 = 'SGVsbG8gV29ybGQh';
    const result = base64ToUint8Array(base64);
    
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(12);
    expect(String.fromCharCode(...result)).toBe('Hello World!');
  });
});

