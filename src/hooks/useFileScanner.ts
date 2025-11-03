import { useState, useCallback } from 'react';
import { parseBlob } from 'music-metadata-browser';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ScannedFile {
  file: File;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  format: string;
  genre?: string;
  bpm?: number;
  thumbnailUrl?: string;
}

export interface ScanProgress {
  total: number;
  processed: number;
  current: string;
  indexed: number;
  errors: number;
}

export const useFileScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState<ScanProgress>({
    total: 0,
    processed: 0,
    current: '',
    indexed: 0,
    errors: 0,
  });

  const extractMetadata = async (file: File): Promise<ScannedFile | null> => {
    try {
      const metadata = await parseBlob(file);
      
      // Extract cover art if available
      let thumbnailUrl: string | undefined;
      if (metadata.common.picture && metadata.common.picture.length > 0) {
        const picture = metadata.common.picture[0];
        const blob = new Blob([new Uint8Array(picture.data)], { type: picture.format });
        thumbnailUrl = URL.createObjectURL(blob);
      }

      const title = metadata.common.title || file.name.replace(/\.[^/.]+$/, '');
      const artist = metadata.common.artist || 'Artista Desconhecido';
      const duration = metadata.format.duration || 0;
      const format = file.name.split('.').pop()?.toLowerCase() || 'unknown';

      return {
        file,
        title,
        artist,
        album: metadata.common.album,
        duration,
        format,
        genre: metadata.common.genre?.[0],
        bpm: metadata.common.bpm,
        thumbnailUrl,
      };
    } catch (error) {
      console.error('Error extracting metadata:', error);
      
      // Fallback to basic file info
      return {
        file,
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: 'Artista Desconhecido',
        duration: 0,
        format: file.name.split('.').pop()?.toLowerCase() || 'unknown',
      };
    }
  };

  const indexFile = async (scannedFile: ScannedFile): Promise<boolean> => {
    try {
      const fileExt = scannedFile.format;
      const fileName = `${Date.now()}-${scannedFile.file.name}`;
      const filePath = `songs/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('karaoke-songs')
        .upload(filePath, scannedFile.file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return false;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('karaoke-songs')
        .getPublicUrl(filePath);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Save to database
      const { error: dbError } = await supabase
        .from('songs')
        .insert([{
          title: scannedFile.title,
          artist: scannedFile.artist,
          album: scannedFile.album,
          duration: scannedFile.duration,
          file_path: publicUrl,
          source: 'local',
          format: fileExt as any,
          genre: scannedFile.genre,
          bpm: scannedFile.bpm,
          thumbnail_url: scannedFile.thumbnailUrl,
          tags: ['importado', 'local'],
          user_id: user.id,
        }]);

      if (dbError) {
        console.error('Database error:', dbError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Indexing error:', error);
      return false;
    }
  };

  const scanFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const supportedFormats = ['mp4', 'mov', 'mp3', 'wav', 'ogg', 'webm', 'm4a'];
    
    // Filter supported files
    const validFiles = fileArray.filter(file => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      return ext && supportedFormats.includes(ext);
    });

    if (validFiles.length === 0) {
      toast.error('Nenhum arquivo de áudio/vídeo válido encontrado');
      return;
    }

    setIsScanning(true);
    setProgress({
      total: validFiles.length,
      processed: 0,
      current: '',
      indexed: 0,
      errors: 0,
    });

    let indexed = 0;
    let errors = 0;

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      
      setProgress(prev => ({
        ...prev,
        current: file.name,
        processed: i,
      }));

      try {
        const metadata = await extractMetadata(file);
        
        if (metadata) {
          const success = await indexFile(metadata);
          if (success) {
            indexed++;
          } else {
            errors++;
          }
        } else {
          errors++;
        }
      } catch (error) {
        console.error('Error processing file:', file.name, error);
        errors++;
      }

      setProgress(prev => ({
        ...prev,
        processed: i + 1,
        indexed,
        errors,
      }));
    }

    setIsScanning(false);
    
    if (indexed > 0) {
      toast.success(`${indexed} ${indexed === 1 ? 'música indexada' : 'músicas indexadas'} com sucesso!`);
    }
    
    if (errors > 0) {
      toast.error(`${errors} ${errors === 1 ? 'arquivo falhou' : 'arquivos falharam'}`);
    }
  }, []);

  const scanFolder = useCallback(async () => {
    try {
      // @ts-ignore - File System Access API
      if (!window.showDirectoryPicker) {
        toast.error('Seu navegador não suporta seleção de pastas. Use o upload manual.');
        return;
      }

      // @ts-ignore
      const dirHandle = await window.showDirectoryPicker({
        mode: 'read',
      });

      const files: File[] = [];

      // @ts-ignore
      for await (const entry of dirHandle.values()) {
        if (entry.kind === 'file') {
          const file = await entry.getFile();
          files.push(file);
        }
      }

      if (files.length > 0) {
        await scanFiles(files);
      } else {
        toast.error('Nenhum arquivo encontrado na pasta');
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        toast.error('Erro ao acessar pasta: ' + error.message);
      }
    }
  }, [scanFiles]);

  return {
    isScanning,
    progress,
    scanFiles,
    scanFolder,
  };
};
