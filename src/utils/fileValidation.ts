import { z } from 'zod';

// File validation constants
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/m4a'];
export const ALLOWED_AUDIO_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.m4a'];

// Zod schemas for validation
export const audioFileSchema = z.object({
  size: z.number().max(MAX_FILE_SIZE, 'Arquivo muito grande (máximo 50MB)'),
  type: z.string().refine(
    (type) => ALLOWED_AUDIO_TYPES.includes(type),
    'Formato de áudio inválido. Use MP3, WAV, OGG ou M4A'
  ),
  name: z.string().refine(
    (name) => {
      const ext = name.toLowerCase().match(/\.[^.]+$/)?.[0];
      return ext && ALLOWED_AUDIO_EXTENSIONS.includes(ext);
    },
    'Extensão de arquivo inválida'
  ),
});

// File validation function
export const validateAudioFile = (file: File): { valid: boolean; error?: string } => {
  try {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: 'Arquivo muito grande (máximo 50MB)' };
    }

    // Validate MIME type
    if (!ALLOWED_AUDIO_TYPES.includes(file.type)) {
      return { valid: false, error: 'Formato de áudio inválido. Use MP3, WAV, OGG ou M4A' };
    }

    // Validate file extension
    const ext = file.name.toLowerCase().match(/\.[^.]+$/)?.[0];
    if (!ext || !ALLOWED_AUDIO_EXTENSIONS.includes(ext)) {
      return { valid: false, error: 'Extensão de arquivo inválida' };
    }

    // Validate using zod schema
    audioFileSchema.parse({
      size: file.size,
      type: file.type,
      name: file.name,
    });

    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.errors[0]?.message || 'Arquivo inválido' };
    }
    return { valid: false, error: 'Erro ao validar arquivo' };
  }
};

// Sanitize filename to prevent path traversal and injection attacks
export const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
    .replace(/\.{2,}/g, '.') // Prevent directory traversal (..)
    .replace(/^\.+/, '') // Remove leading dots
    .substring(0, 255); // Limit length
};

// Validate and sanitize metadata extracted from filename
export const sanitizeMetadata = (text: string, maxLength: number = 255): string => {
  return text
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML/script tags
    .substring(0, maxLength);
};

// URL validation schema
export const urlSchema = z.string().url('URL inválida').max(2048, 'URL muito longa');

export const validateUrl = (url: string): { valid: boolean; error?: string } => {
  try {
    urlSchema.parse(url);
    
    // Additional check: ensure it's from allowed domains (if needed)
    const urlObj = new URL(url);
    const allowedProtocols = ['http:', 'https:'];
    
    if (!allowedProtocols.includes(urlObj.protocol)) {
      return { valid: false, error: 'Protocolo de URL não permitido' };
    }
    
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.errors[0]?.message || 'URL inválida' };
    }
    return { valid: false, error: 'URL inválida' };
  }
};
