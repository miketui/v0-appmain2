# 🧩 Component Guide - Haus of Basquiat Portal

**Design System & Component Library Documentation for GitHub Spark**

---

## 🎨 Design System Overview

### Brand Identity
The Haus of Basquiat Portal uses a vibrant, inclusive design language that celebrates ballroom culture while maintaining premium aesthetics and accessibility.

### Color Palette

#### Primary Colors
```css
/* Gradients for authenticated areas */
--gradient-primary: linear-gradient(135deg, #8b5cf6 0%, #1f2937 50%, #fbbf24 100%);
--gradient-hero: linear-gradient(135deg, #dc2626 0%, #2563eb 50%, #fbbf24 100%);
--gradient-card: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(251, 191, 36, 0.1) 100%);

/* Solid colors */
--purple-600: #8b5cf6;
--gold-400: #fbbf24;
--red-600: #dc2626;
--blue-600: #2563eb;
--gray-800: #1f2937;
--gray-900: #111827;
```

#### Semantic Colors
```css
--success: #10b981;  /* Green for success states */
--warning: #f59e0b;  /* Amber for warnings */
--error: #ef4444;    /* Red for errors */
--info: #3b82f6;     /* Blue for information */
```

#### House Colors
```css
--house-eleganza: #8b5cf6;    /* Purple */
--house-avant-garde: #dc2626; /* Red */
--house-butch: #059669;       /* Emerald */
--house-femme: #db2777;       /* Pink */
--house-bizarre: #7c3aed;     /* Violet */
```

### Typography Scale

#### Font Families
```css
--font-sans: 'Geist Sans', system-ui, sans-serif;
--font-mono: 'Geist Mono', 'SF Mono', Consolas, monospace;
```

#### Size Scale
```css
--text-xs: 0.75rem;    /* 12px - Labels, badges */
--text-sm: 0.875rem;   /* 14px - Secondary text */
--text-base: 1rem;     /* 16px - Body text */
--text-lg: 1.125rem;   /* 18px - Large body */
--text-xl: 1.25rem;    /* 20px - Small headings */
--text-2xl: 1.5rem;    /* 24px - Card titles */
--text-3xl: 1.875rem;  /* 30px - Section headers */
--text-4xl: 2.25rem;   /* 36px - Page titles */
--text-5xl: 3rem;      /* 48px - Hero titles */
```

### Spacing System
```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

---

## 🧱 Base Components (shadcn/ui)

### Button
**File:** `components/ui/button.tsx`

#### Variants
```tsx
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
```

#### Sizes
```tsx
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon">🎭</Button>
```

#### Custom Gradient Buttons
```tsx
// Haus of Basquiat signature gradient
<Button className="bg-gradient-to-r from-purple-600 via-gray-800 to-yellow-600 text-white hover:from-purple-700 hover:via-gray-900 hover:to-yellow-700">
  Gradient Button
</Button>

// House-specific gradient
<Button className="bg-gradient-to-r from-red-600 to-yellow-600 text-white">
  House Action
</Button>
```

### Card
**File:** `components/ui/card.tsx`

#### Basic Usage
```tsx
<Card className="border-2 border-purple-200 hover:border-purple-300 transition-colors">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Crown className="w-5 h-5 text-yellow-500" />
      Title
    </CardTitle>
    <CardDescription>Description text</CardDescription>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
</Card>
```

#### Glassmorphism Variant
```tsx
<Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
  {/* Content */}
</Card>
```

### Input & Forms
**File:** `components/ui/input.tsx`, `components/ui/form.tsx`

#### Styled Input
```tsx
<div className="relative">
  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
  <Input
    type="email"
    placeholder="your@email.com"
    className="pl-10 border-purple-200 focus:border-purple-400"
  />
</div>
```

#### Form with Validation
```tsx
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="displayName"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Display Name</FormLabel>
          <FormControl>
            <Input placeholder="Enter your name" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

---

## 🎭 Feature Components

### Authentication Components

#### Landing Page Header
**File:** `app/page.tsx`

```tsx
<div className="text-center">
  <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
  <h1 className="text-5xl font-bold mb-2">
    <span className="bg-gradient-to-r from-red-600 via-blue-600 to-yellow-600 bg-clip-text text-transparent">
      Haus
    </span>
  </h1>
  <h2 className="text-3xl font-bold mb-4">
    <span className="text-blue-600">of</span>{" "}
    <span className="bg-gradient-to-r from-red-600 via-blue-600 to-yellow-600 bg-clip-text text-transparent">
      Basquiat
    </span>
  </h2>
  <p className="text-gray-600">Enter your email to sign in or apply for membership</p>
</div>
```

#### Application Progress Steps
```tsx
<div className="flex justify-center mb-8">
  {[1, 2, 3].map((step) => (
    <div key={step} className="flex items-center">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
          step <= currentStep
            ? "bg-yellow-400 text-gray-900"
            : "bg-gray-200 text-gray-500 border-2 border-blue-200"
        }`}
      >
        {step}
      </div>
      {step < 3 && (
        <div className={`w-16 h-0.5 mx-2 ${step < currentStep ? "bg-yellow-400" : "bg-gray-200"}`} />
      )}
    </div>
  ))}
</div>
```

### Social Feed Components

#### Post Card
**File:** `components/feed/post-card.tsx`

```tsx
interface PostCardProps {
  post: {
    id: string
    content: string
    author: {
      displayName: string
      avatar?: string
      house?: { name: string; color: string }
    }
    mediaItems?: Array<{ url: string; type: 'IMAGE' | 'VIDEO' }>
    likes: number
    comments: number
    isLiked: boolean
    createdAt: string
  }
  onLike: (postId: string) => void
  onComment: (postId: string) => void
}

export function PostCard({ post, onLike, onComment }: PostCardProps) {
  return (
    <Card className="border-2 border-purple-200 hover:border-purple-300 transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={post.author.avatar} />
            <AvatarFallback className="bg-gradient-to-r from-purple-600 to-yellow-600 text-white">
              {post.author.displayName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold">{post.author.displayName}</span>
            {post.author.house && (
              <Badge 
                variant="secondary" 
                className="text-xs w-fit"
                style={{ backgroundColor: `${post.author.house.color}20`, color: post.author.house.color }}
              >
                {post.author.house.name}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-4">{post.content}</p>
        
        {/* Media Grid */}
        {post.mediaItems && post.mediaItems.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {post.mediaItems.map((media, index) => (
              <div key={index} className="relative rounded-lg overflow-hidden">
                {media.type === 'IMAGE' ? (
                  <img src={media.url} alt="" className="w-full h-48 object-cover" />
                ) : (
                  <video src={media.url} className="w-full h-48 object-cover" controls />
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Actions */}
        <div className="flex items-center gap-4 pt-3 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLike(post.id)}
            className={post.isLiked ? "text-red-600" : "text-gray-600"}
          >
            <Heart className={`w-4 h-4 mr-2 ${post.isLiked ? "fill-current" : ""}`} />
            {post.likes}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onComment(post.id)}>
            <MessageCircle className="w-4 h-4 mr-2" />
            {post.comments}
          </Button>
          <Button variant="ghost" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

#### Post Composer
**File:** `components/feed/post-composer.tsx`

```tsx
export function PostComposer({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [content, setContent] = useState("")
  const [visibility, setVisibility] = useState("PUBLIC")
  const [mediaFiles, setMediaFiles] = useState<File[]>([])

  return (
    <Card className="border-2 border-purple-200 mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Share with the community</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="What's happening in the ballroom world?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px] border-purple-200 focus:border-purple-400"
          />
          
          {/* Media Upload */}
          <div className="flex items-center gap-4">
            <Button type="button" variant="outline" size="sm">
              <ImageIcon className="w-4 h-4 mr-2" />
              Photo/Video
            </Button>
            <Select value={visibility} onValueChange={setVisibility}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PUBLIC">🌍 Public</SelectItem>
                <SelectItem value="HOUSE">🏠 House</SelectItem>
                <SelectItem value="PRIVATE">🔒 Private</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={!content.trim()}
              className="bg-gradient-to-r from-purple-600 to-yellow-600 text-white"
            >
              Share Post
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
```

### Messaging Components

#### Chat Bubble
```tsx
interface MessageBubbleProps {
  message: {
    content: string
    sender: { displayName: string; avatar?: string }
    sentAt: string
    isOwn: boolean
  }
}

export function MessageBubble({ message }: MessageBubbleProps) {
  return (
    <div className={`flex gap-3 mb-4 ${message.isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      <Avatar className="w-8 h-8">
        <AvatarImage src={message.sender.avatar} />
        <AvatarFallback className="bg-gradient-to-r from-purple-600 to-yellow-600 text-white text-sm">
          {message.sender.displayName.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <div className={`max-w-xs lg:max-w-md ${message.isOwn ? 'text-right' : 'text-left'}`}>
        <div
          className={`rounded-lg px-4 py-2 ${
            message.isOwn
              ? 'bg-gradient-to-r from-purple-600 to-yellow-600 text-white'
              : 'bg-gray-100 text-gray-900'
          }`}
        >
          <p>{message.content}</p>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {formatTime(message.sentAt)}
        </p>
      </div>
    </div>
  )
}
```

### Gallery Components

#### Media Grid
```tsx
export function MediaGrid({ items }: { items: MediaItem[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <Card key={item.id} className="group cursor-pointer hover:shadow-lg transition-all">
          <div className="relative overflow-hidden rounded-t-lg">
            {item.type === 'IMAGE' ? (
              <img 
                src={item.thumbnail || item.url} 
                alt={item.title}
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform" 
              />
            ) : (
              <div className="relative">
                <video 
                  src={item.url} 
                  className="w-full h-64 object-cover" 
                  poster={item.thumbnail}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Play className="w-12 h-12 text-white" />
                </div>
              </div>
            )}
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-white font-semibold">{item.title}</h3>
                <p className="text-white/80 text-sm">{item.author.displayName}</p>
              </div>
            </div>
          </div>
          
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {item.category}
                </Badge>
                {item.tags.slice(0, 2).map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Heart className="w-4 h-4" />
                {item.likes}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

### Admin Components

#### Stats Card
```tsx
interface StatsCardProps {
  title: string
  value: string | number
  change?: { value: number; period: string }
  icon: React.ReactNode
  color: string
}

export function StatsCard({ title, value, change, icon, color }: StatsCardProps) {
  return (
    <Card className="border-2 border-purple-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {change && (
              <p className={`text-sm flex items-center gap-1 ${
                change.value > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {change.value > 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                {Math.abs(change.value)}% from {change.period}
              </p>
            )}
          </div>
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center`} style={{ backgroundColor: `${color}20` }}>
            <div style={{ color }}>{icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

---

## 🎨 Layout Components

### Page Wrapper
```tsx
interface PageWrapperProps {
  title: string
  description?: string
  children: React.ReactNode
  headerActions?: React.ReactNode
}

export function PageWrapper({ title, description, children, headerActions }: PageWrapperProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-gray-50 to-yellow-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-gray-800 to-yellow-600 bg-clip-text text-transparent mb-2">
              {title}
            </h1>
            {description && <p className="text-gray-600">{description}</p>}
          </div>
          {headerActions}
        </div>
        
        {/* Content */}
        {children}
      </div>
    </div>
  )
}
```

### Loading States
```tsx
export function LoadingSpinner({ size = "default" }: { size?: "sm" | "default" | "lg" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-8 w-8", 
    lg: "h-12 w-12"
  }
  
  return (
    <div className="flex items-center justify-center">
      <div className={`animate-spin rounded-full border-b-2 border-yellow-400 ${sizeClasses[size]}`}></div>
    </div>
  )
}

export function LoadingCard() {
  return (
    <Card className="border-2 border-purple-200">
      <CardContent className="animate-pulse">
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </CardContent>
    </Card>
  )
}
```

---

## 🔧 Custom Hooks

### useAuth Hook Pattern
```tsx
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Implementation details...
  
  return {
    user,
    loading,
    signIn: async (email: string, password?: string) => { /* ... */ },
    signUp: async (data: SignUpData) => { /* ... */ },
    signOut: async () => { /* ... */ },
    signInWithMagicLink: async (email: string) => { /* ... */ }
  }
}
```

### useSocket Hook Pattern
```tsx
export function useSocket(threadId?: string) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  
  // Implementation details...
  
  return {
    socket,
    connected,
    sendMessage: (content: string) => { /* ... */ },
    joinThread: (id: string) => { /* ... */ },
    leaveThread: (id: string) => { /* ... */ }
  }
}
```

---

## 📱 Responsive Design Patterns

### Mobile-First Approach
```tsx
// Always start with mobile styles, then scale up
<div className="
  grid grid-cols-1          // Mobile: 1 column
  md:grid-cols-2            // Tablet: 2 columns  
  lg:grid-cols-3            // Desktop: 3 columns
  gap-4                     // Consistent spacing
">
```

### Breakpoint System
```css
/* Tailwind breakpoints used in the app */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */  
lg: 1024px  /* Small laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large screens */
```

### Touch-Friendly Design
```tsx
// Ensure interactive elements are at least 44px
<Button className="min-h-[44px] min-w-[44px]">
  <TouchIcon />
</Button>

// Add appropriate hover states for desktop
<Card className="hover:shadow-lg transition-shadow cursor-pointer">
```

---

## ♿ Accessibility Guidelines

### Semantic HTML
```tsx
// Use proper heading hierarchy
<h1>Page Title</h1>
<h2>Section Title</h2>
<h3>Subsection Title</h3>

// Use semantic elements
<main>
  <article>
    <header>
      <h1>Post Title</h1>
    </header>
    <section>
      Content...
    </section>
  </article>
</main>
```

### ARIA Labels
```tsx
<Button 
  aria-label="Like this post"
  aria-pressed={isLiked}
>
  <Heart className={isLiked ? "fill-current" : ""} />
</Button>

<input 
  aria-describedby="email-help"
  aria-invalid={hasError}
/>
<div id="email-help">Enter your email address</div>
```

### Keyboard Navigation
```tsx
// Ensure all interactive elements are keyboard accessible
<div 
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick()
    }
  }}
>
```

### Color Contrast
Always maintain WCAG AA standards:
- Normal text: 4.5:1 contrast ratio
- Large text: 3:1 contrast ratio
- Non-text elements: 3:1 contrast ratio

---

## 🧪 Testing Components

### Component Testing Pattern
```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { PostCard } from '@/components/feed/post-card'

describe('PostCard', () => {
  const mockPost = {
    id: '1',
    content: 'Test post',
    author: { displayName: 'Test User' },
    likes: 5,
    comments: 2,
    isLiked: false,
    createdAt: '2024-01-01T00:00:00Z'
  }

  it('renders post content', () => {
    render(<PostCard post={mockPost} onLike={jest.fn()} onComment={jest.fn()} />)
    expect(screen.getByText('Test post')).toBeInTheDocument()
  })

  it('handles like interaction', () => {
    const onLike = jest.fn()
    render(<PostCard post={mockPost} onLike={onLike} onComment={jest.fn()} />)
    
    fireEvent.click(screen.getByRole('button', { name: /like/i }))
    expect(onLike).toHaveBeenCalledWith('1')
  })
})
```

---

## 📦 Component Export Pattern

### Barrel Exports
```tsx
// components/feed/index.ts
export { PostCard } from './post-card'
export { PostComposer } from './post-composer'
export { FeedFilters } from './feed-filters'

// Usage
import { PostCard, PostComposer } from '@/components/feed'
```

---

*This component guide ensures consistent, accessible, and maintainable UI components throughout the Haus of Basquiat Portal. All components should follow these patterns when extending or creating new features.*