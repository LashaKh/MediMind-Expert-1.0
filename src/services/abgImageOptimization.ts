import { ABGImageOptimizationOptions, ABGOptimizationResult } from '../types/abg';

/**
 * ABG Image Optimization Service
 * Handles image compression and optimization for blood gas analysis uploads
 */

/**
 * Default optimization options for medical documents
 */
const DEFAULT_MEDICAL_OPTIONS: ABGImageOptimizationOptions = {
  maxWidth: 2048,
  maxHeight: 2048,
  quality: 0.85, // High quality for medical accuracy
  format: 'jpeg',
  preserveExif: false // Remove EXIF for privacy
};

/**
 * Create a canvas element for image processing
 */
const createCanvas = (width: number, height: number): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

/**
 * Load image from file into HTMLImageElement
 */
const loadImageFromFile = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Calculate optimal dimensions while maintaining aspect ratio
 */
const calculateOptimalDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } => {
  const { width, height } = { width: originalWidth, height: originalHeight };

  // If image is smaller than max dimensions, keep original size
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height };
  }

  // Calculate scaling factor
  const widthRatio = maxWidth / width;
  const heightRatio = maxHeight / height;
  const ratio = Math.min(widthRatio, heightRatio);

  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio)
  };
};

/**
 * Apply image filters to enhance medical document readability
 */
const applyMedicalDocumentFilters = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement
): void => {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Apply contrast enhancement and noise reduction for medical documents
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Convert to grayscale for better text recognition
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    
    // Apply contrast enhancement
    const contrast = 1.2;
    const enhancedGray = Math.min(255, Math.max(0, (gray - 128) * contrast + 128));
    
    // Slight color restoration for colored text
    data[i] = Math.min(255, enhancedGray + (r - gray) * 0.3);     // R
    data[i + 1] = Math.min(255, enhancedGray + (g - gray) * 0.3); // G
    data[i + 2] = Math.min(255, enhancedGray + (b - gray) * 0.3); // B
    // Alpha stays the same
  }

  ctx.putImageData(imageData, 0, 0);
};

/**
 * Convert canvas to file with specified format and quality
 */
const canvasToFile = (
  canvas: HTMLCanvasElement,
  originalFileName: string,
  format: string = 'jpeg',
  quality: number = 0.85
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
    
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to create blob from canvas'));
        return;
      }

      // Generate new filename with optimized suffix
      const extension = format === 'png' ? 'png' : 'jpg';
      const baseName = originalFileName.replace(/\.[^/.]+$/, '');
      const optimizedFileName = `${baseName}-optimized.${extension}`;

      const file = new File([blob], optimizedFileName, {
        type: mimeType,
        lastModified: Date.now()
      });

      resolve(file);
    }, mimeType, format === 'jpeg' ? quality : undefined);
  });
};

/**
 * Optimize image file for medical document processing
 */
export const optimizeABGImage = async (
  file: File,
  options: ABGImageOptimizationOptions = {}
): Promise<ABGOptimizationResult> => {
  const startTime = performance.now();

  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File is not an image');
    }

    const finalOptions = { ...DEFAULT_MEDICAL_OPTIONS, ...options };
    const originalSize = file.size;

    // Load image
    const img = await loadImageFromFile(file);
    
    // Calculate optimal dimensions
    const { width, height } = calculateOptimalDimensions(
      img.naturalWidth,
      img.naturalHeight,
      finalOptions.maxWidth!,
      finalOptions.maxHeight!
    );

    // Create canvas and context
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // Configure canvas for high-quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Draw image on canvas
    ctx.drawImage(img, 0, 0, width, height);

    // Apply medical document filters for better OCR accuracy
    if (finalOptions.format !== 'png') {
      applyMedicalDocumentFilters(ctx, canvas);
    }

    // Clean up object URL
    URL.revokeObjectURL(img.src);

    // Convert canvas to optimized file
    const optimizedFile = await canvasToFile(
      canvas,
      file.name,
      finalOptions.format,
      finalOptions.quality
    );

    const processingTime = performance.now() - startTime;
    const compressionRatio = originalSize / optimizedFile.size;

    const result: ABGOptimizationResult = {
      originalSize,
      optimizedSize: optimizedFile.size,
      compressionRatio,
      processingTime: Math.round(processingTime),
      optimizedFile
    };

    }KB`,
      optimizedSize: `${Math.round(optimizedFile.size / 1024)}KB`,
      compressionRatio: `${compressionRatio.toFixed(2)}:1`,
      processingTime: `${Math.round(processingTime)}ms`
    });

    return result;
  } catch (error) {
    const processingTime = performance.now() - startTime;

    // Return original file as fallback
    return {
      originalSize: file.size,
      optimizedSize: file.size,
      compressionRatio: 1,
      processingTime: Math.round(processingTime),
      optimizedFile: file
    };
  }
};

/**
 * Check if image needs optimization
 */
export const shouldOptimizeImage = (
  file: File,
  options: ABGImageOptimizationOptions = {}
): boolean => {
  const finalOptions = { ...DEFAULT_MEDICAL_OPTIONS, ...options };
  const maxFileSize = 5 * 1024 * 1024; // 5MB threshold

  // Check file size
  if (file.size > maxFileSize) {
    return true;
  }

  // Check file format (convert all to optimized JPEG for consistency)
  if (file.type !== 'image/jpeg' && finalOptions.format === 'jpeg') {
    return true;
  }

  return false;
};

/**
 * Batch optimize multiple images
 */
export const batchOptimizeImages = async (
  files: File[],
  options: ABGImageOptimizationOptions = {}
): Promise<ABGOptimizationResult[]> => {
  const results: ABGOptimizationResult[] = [];
  
  for (const file of files) {
    try {
      const result = await optimizeABGImage(file, options);
      results.push(result);
    } catch (error) {

      // Add fallback result
      results.push({
        originalSize: file.size,
        optimizedSize: file.size,
        compressionRatio: 1,
        processingTime: 0,
        optimizedFile: file
      });
    }
  }

  return results;
};

/**
 * Get optimization preview info without processing
 */
export const getOptimizationPreview = async (
  file: File,
  options: ABGImageOptimizationOptions = {}
): Promise<{
  willOptimize: boolean;
  estimatedSize: number;
  estimatedCompressionRatio: number;
  recommendedSettings: ABGImageOptimizationOptions;
}> => {
  try {
    const finalOptions = { ...DEFAULT_MEDICAL_OPTIONS, ...options };
    const willOptimize = shouldOptimizeImage(file, finalOptions);
    
    if (!willOptimize) {
      return {
        willOptimize: false,
        estimatedSize: file.size,
        estimatedCompressionRatio: 1,
        recommendedSettings: finalOptions
      };
    }

    // Load image to get dimensions
    const img = await loadImageFromFile(file);
    
    // Calculate dimension reduction ratio
    const { width, height } = calculateOptimalDimensions(
      img.naturalWidth,
      img.naturalHeight,
      finalOptions.maxWidth!,
      finalOptions.maxHeight!
    );
    
    const dimensionRatio = (width * height) / (img.naturalWidth * img.naturalHeight);
    
    // Estimate compression based on quality and format
    let qualityRatio = finalOptions.quality || 0.85;
    
    // Format conversion estimates
    if (file.type === 'image/png' && finalOptions.format === 'jpeg') {
      qualityRatio *= 0.6; // PNG to JPEG typically saves significant space
    }

    const estimatedCompressionRatio = 1 / (dimensionRatio * qualityRatio);
    const estimatedSize = Math.round(file.size / estimatedCompressionRatio);

    // Clean up
    URL.revokeObjectURL(img.src);

    // Recommend settings based on file characteristics
    const recommendedSettings: ABGImageOptimizationOptions = { ...finalOptions };
    
    // For very large images, be more aggressive
    if (file.size > 10 * 1024 * 1024) { // 10MB+
      recommendedSettings.maxWidth = 1600;
      recommendedSettings.maxHeight = 1600;
      recommendedSettings.quality = 0.8;
    }
    
    // For screenshots or diagrams, prefer PNG
    if (file.type === 'image/png' && file.size < 2 * 1024 * 1024) {
      recommendedSettings.format = 'png';
      recommendedSettings.quality = 1.0;
    }

    return {
      willOptimize,
      estimatedSize,
      estimatedCompressionRatio,
      recommendedSettings
    };
  } catch (error) {

    return {
      willOptimize: false,
      estimatedSize: file.size,
      estimatedCompressionRatio: 1,
      recommendedSettings: DEFAULT_MEDICAL_OPTIONS
    };
  }
};

/**
 * Validate image quality for medical processing
 */
export const validateImageQuality = async (file: File): Promise<{
  isValid: boolean;
  warnings: string[];
  recommendations: string[];
}> => {
  const warnings: string[] = [];
  const recommendations: string[] = [];

  try {
    // Check file size
    if (file.size > 50 * 1024 * 1024) { // 50MB
      warnings.push('File size is very large, processing may be slow');
      recommendations.push('Consider resizing the image before upload');
    }

    if (file.size < 50 * 1024) { // 50KB
      warnings.push('File size is very small, image quality may be insufficient');
    }

    // Check image dimensions and quality
    const img = await loadImageFromFile(file);
    
    if (img.naturalWidth < 800 || img.naturalHeight < 600) {
      warnings.push('Image resolution may be too low for accurate text recognition');
      recommendations.push('Use higher resolution images (min 800x600) for better results');
    }

    if (img.naturalWidth > 4000 || img.naturalHeight > 4000) {
      recommendations.push('Consider optimizing image size for faster processing');
    }

    // Clean up
    URL.revokeObjectURL(img.src);

    return {
      isValid: warnings.length === 0,
      warnings,
      recommendations
    };
  } catch (error) {

    return {
      isValid: false,
      warnings: ['Unable to validate image'],
      recommendations: ['Please ensure the file is a valid image format']
    };
  }
};