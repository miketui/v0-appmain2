"use client"

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Video, 
  Music, 
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Camera,
  Palette,
  Zap
} from 'lucide-react'

interface UploadFile {
  id: string
  file: File
  preview: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  error?: string
  metadata?: {
    width?: number
    height?: number
    duration?: number
    size: number
  }
}

interface UploadFormData {
  title: string
  description: string
  category: string
  tags: string[]
  houseName?: string
  isPublic: boolean
  allowComments: boolean
  isPerformance: boolean
  eventDate?: string
}

export default function GalleryUploadPage() {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [formData, setFormData] = useState<UploadFormData>({
    title: '',
    description: '',
    category: '',
    tags: [],
    isPublic: true,
    allowComments: true,
    isPerformance: false
  })
  const [currentTag, setCurrentTag] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [overallProgress, setOverallProgress] = useState(0)

  const categories = [
    { value: 'performance', label: 'Performance', icon: <Zap className="w-4 h-4" /> },
    { value: 'runway', label: 'Runway', icon: <Camera className="w-4 h-4" /> },
    { value: 'fashion', label: 'Fashion', icon: <Palette className="w-4 h-4" /> },
    { value: 'lifestyle', label: 'Lifestyle', icon: <ImageIcon className="w-4 h-4" /> },
    { value: 'backstage', label: 'Backstage', icon: <Camera className="w-4 h-4" /> },
    { value: 'practice', label: 'Practice', icon: <Zap className="w-4 h-4" /> }
  ]

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map(file => ({
      id: `file_${Date.now()}_${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
      status: 'pending',
      progress: 0,
      metadata: {
        size: file.size
      }
    }))

    // Get image/video metadata
    newFiles.forEach(async (uploadFile) => {
      if (uploadFile.file.type.startsWith('image/')) {
        const img = new Image()
        img.onload = () => {
          uploadFile.metadata = {
            ...uploadFile.metadata,
            width: img.width,
            height: img.height
          }
          setFiles(prev => [...prev])
        }
        img.src = uploadFile.preview
      } else if (uploadFile.file.type.startsWith('video/')) {
        const video = document.createElement('video')
        video.onloadedmetadata = () => {
          uploadFile.metadata = {
            ...uploadFile.metadata,
            width: video.videoWidth,
            height: video.videoHeight,
            duration: video.duration
          }
          setFiles(prev => [...prev])
        }
        video.src = uploadFile.preview
      }
    })

    setFiles(prev => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'video/*': ['.mp4', '.mov', '.avi', '.mkv'],
      'audio/*': ['.mp3', '.wav', '.ogg']
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    multiple: true
  })

  const removeFile = (fileId: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === fileId)
      if (file) {
        URL.revokeObjectURL(file.preview)
      }
      return prev.filter(f => f.id !== fileId)
    })
  }

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }))
      setCurrentTag('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <ImageIcon className="w-5 h-5" />
    if (file.type.startsWith('video/')) return <Video className="w-5 h-5" />
    if (file.type.startsWith('audio/')) return <Music className="w-5 h-5" />
    return <FileText className="w-5 h-5" />
  }

  const simulateUpload = async (file: UploadFile) => {
    return new Promise<void>((resolve, reject) => {
      const interval = setInterval(() => {
        setFiles(prev => prev.map(f => 
          f.id === file.id 
            ? { ...f, progress: Math.min(f.progress + Math.random() * 15, 100) }
            : f
        ))
      }, 200)

      setTimeout(() => {
        clearInterval(interval)
        setFiles(prev => prev.map(f => 
          f.id === file.id 
            ? { ...f, status: 'success', progress: 100 }
            : f
        ))
        resolve()
      }, 2000 + Math.random() * 3000)
    })
  }

  const handleUpload = async () => {
    if (files.length === 0 || !formData.title.trim() || !formData.category) {
      alert('Please fill in required fields and add at least one file.')
      return
    }

    setIsUploading(true)
    
    // Update all files to uploading status
    setFiles(prev => prev.map(f => ({ ...f, status: 'uploading' as const })))

    try {
      // Simulate upload process for each file
      const uploadPromises = files.map(file => simulateUpload(file))
      await Promise.all(uploadPromises)

      // TODO: Replace with actual API call
      const uploadData = {
        ...formData,
        files: files.map(f => ({
          name: f.file.name,
          size: f.file.size,
          type: f.file.type,
          metadata: f.metadata
        }))
      }

      console.log('Upload data:', uploadData)
      
      // Success - redirect or show success message
      alert('Gallery upload successful!')
      
      // Reset form
      setFiles([])
      setFormData({
        title: '',
        description: '',
        category: '',
        tags: [],
        isPublic: true,
        allowComments: true,
        isPerformance: false
      })
      
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Upload to Gallery</h1>
        <p className="text-muted-foreground">
          Share your performances, fashion, and ballroom moments with the community
        </p>
      </div>

      <div className="space-y-6">
        {/* File Upload Area */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              {isDragActive ? (
                <p className="text-lg">Drop your files here...</p>
              ) : (
                <div>
                  <p className="text-lg mb-2">Drag & drop files here, or click to select</p>
                  <p className="text-sm text-muted-foreground">
                    Support for images, videos, and audio files up to 100MB each
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* File List */}
        {files.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Selected Files ({files.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {files.map(file => (
                  <div key={file.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="flex-shrink-0">
                      {file.file.type.startsWith('image/') ? (
                        <img 
                          src={file.preview} 
                          alt={file.file.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                          {getFileIcon(file.file)}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{file.file.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{formatFileSize(file.metadata?.size || 0)}</span>
                        {file.metadata?.width && file.metadata?.height && (
                          <span>{file.metadata.width} × {file.metadata.height}</span>
                        )}
                        {file.metadata?.duration && (
                          <span>{formatDuration(file.metadata.duration)}</span>
                        )}
                      </div>
                      
                      {file.status === 'uploading' && (
                        <Progress value={file.progress} className="mt-2" />
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {file.status === 'pending' && (
                        <Badge variant="secondary">Ready</Badge>
                      )}
                      {file.status === 'uploading' && (
                        <Badge variant="secondary">
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          Uploading
                        </Badge>
                      )}
                      {file.status === 'success' && (
                        <Badge variant="default">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Complete
                        </Badge>
                      )}
                      {file.status === 'error' && (
                        <Badge variant="destructive">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Error
                        </Badge>
                      )}
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFile(file.id)}
                        disabled={file.status === 'uploading'}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form Fields */}
        <Card>
          <CardHeader>
            <CardTitle>Gallery Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Give your upload a title..."
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center gap-2">
                          {cat.icon}
                          {cat.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your upload..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  id="tags"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  placeholder="Add tags..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} variant="outline">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                    {tag} <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="houseName">House Name</Label>
              <Input
                id="houseName"
                value={formData.houseName || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, houseName: e.target.value }))}
                placeholder="Your house name (optional)"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, isPublic: checked as boolean }))
                  }
                />
                <Label htmlFor="isPublic">Make this upload public</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allowComments"
                  checked={formData.allowComments}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, allowComments: checked as boolean }))
                  }
                />
                <Label htmlFor="allowComments">Allow comments</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPerformance"
                  checked={formData.isPerformance}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, isPerformance: checked as boolean }))
                  }
                />
                <Label htmlFor="isPerformance">This is a performance piece</Label>
              </div>
            </div>

            {formData.isPerformance && (
              <div>
                <Label htmlFor="eventDate">Event Date</Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={formData.eventDate || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, eventDate: e.target.value }))}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upload Button */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" disabled={isUploading}>
            Save as Draft
          </Button>
          <Button 
            onClick={handleUpload}
            disabled={isUploading || files.length === 0 || !formData.title.trim() || !formData.category}
            className="min-w-32"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload to Gallery
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}