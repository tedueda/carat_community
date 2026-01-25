/**
 * 画像を圧縮・リサイズするユーティリティ
 */

export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1
  maxSizeMB?: number;
}

const DEFAULT_OPTIONS: Required<ImageCompressionOptions> = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.85,
  maxSizeMB: 2,
};

/**
 * 画像ファイルを圧縮してリサイズする
 */
export async function compressImage(
  file: File,
  options: ImageCompressionOptions = {}
): Promise<File> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // 元のサイズを取得
        let width = img.width;
        let height = img.height;

        // アスペクト比を保持してリサイズ
        if (width > opts.maxWidth || height > opts.maxHeight) {
          const aspectRatio = width / height;
          
          if (width > height) {
            width = opts.maxWidth;
            height = width / aspectRatio;
          } else {
            height = opts.maxHeight;
            width = height * aspectRatio;
          }
        }

        // Canvasで画像をリサイズ
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // 高品質なリサイズ設定
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Blobに変換
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'));
              return;
            }

            // ファイルサイズチェック
            const sizeMB = blob.size / (1024 * 1024);
            if (sizeMB > opts.maxSizeMB) {
              // さらに品質を下げて再圧縮
              const newQuality = Math.max(0.5, opts.quality * (opts.maxSizeMB / sizeMB));
              canvas.toBlob(
                (retryBlob) => {
                  if (!retryBlob) {
                    reject(new Error('Failed to create blob on retry'));
                    return;
                  }
                  
                  const compressedFile = new File(
                    [retryBlob],
                    file.name,
                    { type: file.type }
                  );
                  
                  console.log(`📸 Image compressed: ${(file.size / 1024).toFixed(0)}KB → ${(retryBlob.size / 1024).toFixed(0)}KB`);
                  resolve(compressedFile);
                },
                file.type,
                newQuality
              );
            } else {
              const compressedFile = new File(
                [blob],
                file.name,
                { type: file.type }
              );
              
              console.log(`📸 Image compressed: ${(file.size / 1024).toFixed(0)}KB → ${(blob.size / 1024).toFixed(0)}KB`);
              resolve(compressedFile);
            }
          },
          file.type,
          opts.quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * 複数の画像を一括で圧縮
 */
export async function compressImages(
  files: File[],
  options: ImageCompressionOptions = {}
): Promise<File[]> {
  const promises = files.map(file => compressImage(file, options));
  return Promise.all(promises);
}
