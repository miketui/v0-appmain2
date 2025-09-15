interface ImageOptimizationOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'webp' | 'jpeg' | 'png'
  enableProgressive?: boolean
}

interface OptimizedImage {
  blob: Blob
  url: string
  width: number
  height: number
  size: number
  format: string
}

export class ImageOptimizer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D

  constructor() {
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')!
  }

  async optimizeImage(
    file: File, 
    options: ImageOptimizationOptions = {}
  ): Promise<OptimizedImage> {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8,
      format = 'webp',
      enableProgressive = true
    } = options

    return new Promise((resolve, reject) => {
      const img = new Image()
      
      img.onload = () => {
        try {
          // Calculate new dimensions while maintaining aspect ratio
          const { width: newWidth, height: newHeight } = this.calculateDimensions(
            img.width, 
            img.height, 
            maxWidth, 
            maxHeight
          )

          // Set canvas dimensions
          this.canvas.width = newWidth
          this.canvas.height = newHeight

          // Clear canvas and draw image
          this.ctx.clearRect(0, 0, newWidth, newHeight)
          this.ctx.drawImage(img, 0, 0, newWidth, newHeight)

          // Convert to blob with specified format and quality
          this.canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to optimize image'))
                return
              }

              resolve({
                blob,
                url: URL.createObjectURL(blob),
                width: newWidth,
                height: newHeight,
                size: blob.size,
                format: format
              })
            },
            this.getMimeType(format),
            quality
          )
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(file)
    })
  }

  async generateThumbnail(
    file: File,
    size: number = 300
  ): Promise<OptimizedImage> {
    return this.optimizeImage(file, {
      maxWidth: size,
      maxHeight: size,
      quality: 0.7,
      format: 'webp'
    })
  }

  async generateMultipleSizes(
    file: File,
    sizes: number[] = [300, 600, 1200]
  ): Promise<{ [key: string]: OptimizedImage }> {
    const results: { [key: string]: OptimizedImage } = {}
    
    for (const size of sizes) {
      const optimized = await this.optimizeImage(file, {
        maxWidth: size,
        maxHeight: size,
        quality: size <= 300 ? 0.7 : 0.8,
        format: 'webp'
      })
      
      results[`${size}w`] = optimized
    }
    
    return results
  }

  private calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    let { width, height } = { width: originalWidth, height: originalHeight }

    // If image is smaller than max dimensions, return original size
    if (width <= maxWidth && height <= maxHeight) {
      return { width, height }
    }

    // Calculate aspect ratio
    const aspectRatio = width / height

    // Determine limiting dimension
    if (width > height) {
      // Landscape or square
      width = Math.min(width, maxWidth)
      height = width / aspectRatio
    } else {
      // Portrait
      height = Math.min(height, maxHeight)
      width = height * aspectRatio
    }

    // Ensure we don't exceed max dimensions
    if (width > maxWidth) {
      width = maxWidth
      height = width / aspectRatio
    }
    if (height > maxHeight) {
      height = maxHeight
      width = height * aspectRatio
    }

    return {
      width: Math.round(width),
      height: Math.round(height)
    }
  }

  private getMimeType(format: string): string {
    switch (format) {
      case 'webp': return 'image/webp'
      case 'jpeg': return 'image/jpeg'
      case 'png': return 'image/png'
      default: return 'image/webp'
    }
  }

  // Cleanup method to revoke blob URLs
  cleanup() {
    // This should be called to clean up any created blob URLs
    // Individual URLs should be revoked when no longer needed
  }
}

// Utility functions for image analysis
export const analyzeImage = async (file: File): Promise<{
  width: number
  height: number
  aspectRatio: number
  format: string
  size: number
  estimatedOptimizedSize: number
}> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    img.onload = () => {
      const aspectRatio = img.width / img.height
      const estimatedOptimizedSize = Math.round(file.size * 0.3) // Rough estimate
      
      resolve({
        width: img.width,
        height: img.height,
        aspectRatio,
        format: file.type,
        size: file.size,
        estimatedOptimizedSize
      })
    }
    
    img.onerror = () => reject(new Error('Failed to analyze image'))
    img.src = URL.createObjectURL(file)
  })
}

export const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/')
}

export const getSupportedImageFormats = (): string[] => {
  const canvas = document.createElement('canvas')
  const formats = ['webp', 'jpeg', 'png']
  
  return formats.filter(format => {
    try {
      return canvas.toDataURL(`image/${format}`).indexOf(`data:image/${format}`) === 0
    } catch {
      return false
    }
  })
}

// Image categorization based on content analysis
export const categorizeImage = (file: File, width: number, height: number): {
  suggestedCategory: string
  confidence: number
  reasons: string[]
} => {
  const aspectRatio = width / height
  const fileName = file.name.toLowerCase()
  const fileSize = file.size
  
  let suggestedCategory = 'lifestyle'
  let confidence = 0.5
  const reasons: string[] = []

  // Analyze aspect ratio
  if (aspectRatio > 1.5) {
    suggestedCategory = 'runway'
    confidence += 0.2
    reasons.push('Wide aspect ratio suggests runway/landscape shot')
  } else if (aspectRatio < 0.7) {
    suggestedCategory = 'fashion'
    confidence += 0.2
    reasons.push('Portrait aspect ratio suggests fashion/portrait shot')
  }

  // Analyze filename
  const performanceKeywords = ['vogue', 'dance', 'ball', 'performance', 'stage']
  const fashionKeywords = ['outfit', 'look', 'fashion', 'style', 'dress']
  const runwayKeywords = ['runway', 'walk', 'catwalk', 'presentation']

  if (performanceKeywords.some(keyword => fileName.includes(keyword))) {
    suggestedCategory = 'performance'
    confidence += 0.3
    reasons.push('Filename suggests performance content')
  } else if (fashionKeywords.some(keyword => fileName.includes(keyword))) {
    suggestedCategory = 'fashion'
    confidence += 0.3
    reasons.push('Filename suggests fashion content')
  } else if (runwayKeywords.some(keyword => fileName.includes(keyword))) {
    suggestedCategory = 'runway'
    confidence += 0.3
    reasons.push('Filename suggests runway content')
  }

  // Analyze file size (higher resolution might indicate professional shots)
  if (fileSize > 5 * 1024 * 1024) { // > 5MB
    if (suggestedCategory === 'lifestyle') {
      suggestedCategory = 'performance'
      confidence += 0.1
      reasons.push('High resolution suggests performance/professional content')
    }
  }

  return {
    suggestedCategory,
    confidence: Math.min(confidence, 1),
    reasons
  }
}