/**
 * Comprime uma imagem mantendo alta qualidade
 * Converte para WebP para melhor compressão
 * Redimensiona se necessário mantendo proporção
 */
export async function compressImage(
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    convertToWebP?: boolean;
  } = {}
): Promise<File> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.92, // 92% de qualidade - imperceptível perda visual
    convertToWebP = true
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }

    img.onload = () => {
      // Calcular novas dimensões mantendo proporção
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const aspectRatio = width / height;
        
        if (width > height) {
          width = maxWidth;
          height = Math.round(width / aspectRatio);
        } else {
          height = maxHeight;
          width = Math.round(height * aspectRatio);
        }
      }

      // Configurar canvas com as novas dimensões
      canvas.width = width;
      canvas.height = height;

      // Habilitar suavização de alta qualidade
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Desenhar imagem no canvas
      ctx.drawImage(img, 0, 0, width, height);

      // Determinar formato de saída
      const outputType = convertToWebP && supportsWebP() ? 'image/webp' : 'image/jpeg';
      const fileExtension = outputType === 'image/webp' ? 'webp' : 'jpg';

      // Converter canvas para blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to compress image'));
            return;
          }

          // Criar arquivo com nome otimizado
          const originalName = file.name.split('.')[0];
          const compressedFile = new File(
            [blob],
            `${originalName}-compressed.${fileExtension}`,
            { type: outputType }
          );

          // Log de estatísticas de compressão
          const originalSize = (file.size / 1024).toFixed(2);
          const compressedSize = (blob.size / 1024).toFixed(2);
          const savings = ((1 - blob.size / file.size) * 100).toFixed(1);
          
          console.log('📦 Image Compression Stats:');
          console.log(`   Original: ${originalSize} KB`);
          console.log(`   Compressed: ${compressedSize} KB`);
          console.log(`   Savings: ${savings}%`);
          console.log(`   Format: ${outputType}`);
          console.log(`   Dimensions: ${width}x${height}`);

          resolve(compressedFile);
        },
        outputType,
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Carregar imagem do arquivo
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Verifica se o browser suporta WebP
 */
function supportsWebP(): boolean {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

/**
 * Comprime múltiplas imagens em paralelo
 */
export async function compressImages(
  files: File[],
  options?: Parameters<typeof compressImage>[1]
): Promise<File[]> {
  return Promise.all(files.map(file => compressImage(file, options)));
}
