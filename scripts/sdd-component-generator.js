#!/usr/bin/env node

/**
 * SDD Component Generator for GitHub Spark
 * Generates consistent components following Haus of Basquiat patterns
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Component templates
const templates = {
  page: (name, props) => `"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ${props.icons.join(', ')} } from "lucide-react"

export default function ${name}Page() {
  const { user, loading } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-gray-50 to-yellow-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-gray-800 to-yellow-600 bg-clip-text text-transparent mb-2">
            ${name}
          </h1>
          <p className="text-gray-600">${props.description}</p>
        </div>

        {/* Main Content */}
        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <${props.icons[0]} className="w-5 h-5 text-purple-600" />
              ${name} Content
            </CardTitle>
            <CardDescription>
              ${props.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* TODO: Implement ${name.toLowerCase()} functionality */}
            <div className="text-center py-8 text-gray-500">
              ${name} content goes here
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
`,

  component: (name, props) => `"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ${props.icons.join(', ')} } from "lucide-react"

interface ${name}Props {
  ${props.propsInterface}
}

export function ${name}({ ${props.propsParams} }: ${name}Props) {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <Card className="border-2 border-purple-200 hover:border-purple-300 transition-colors">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <${props.icons[0]} className="w-5 h-5 text-purple-600" />
          ${name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* TODO: Implement ${name} functionality */}
        <div className="space-y-4">
          <p className="text-gray-600">${props.description}</p>
          
          <Button 
            onClick={() => console.log('${name} action')}
            disabled={isLoading}
            className="bg-gradient-to-r from-purple-600 to-yellow-600 text-white hover:from-purple-700 hover:to-yellow-700"
          >
            {isLoading ? "Loading..." : "${name} Action"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
`,

  hook: (name, props) => `"use client"

import { useState, useEffect, useCallback } from "react"
import { apiClient } from "@/lib/api"

interface ${name}State {
  data: any[]
  loading: boolean
  error: string | null
}

export function use${name}() {
  const [state, setState] = useState<${name}State>({
    data: [],
    loading: true,
    error: null
  })

  const load${name} = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      // TODO: Implement API call
      const data = await apiClient.get('/${name.toLowerCase()}')
      setState({ data, loading: false, error: null })
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }))
    }
  }, [])

  const create${name} = useCallback(async (item: any) => {
    try {
      // TODO: Implement create functionality  
      const newItem = await apiClient.post('/${name.toLowerCase()}', item)
      setState(prev => ({ 
        ...prev, 
        data: [...prev.data, newItem] 
      }))
      return newItem
    } catch (error) {
      throw error
    }
  }, [])

  const update${name} = useCallback(async (id: string, updates: any) => {
    try {
      // TODO: Implement update functionality
      const updatedItem = await apiClient.put(\`/${name.toLowerCase()}/\${id}\`, updates)
      setState(prev => ({
        ...prev,
        data: prev.data.map(item => item.id === id ? updatedItem : item)
      }))
      return updatedItem
    } catch (error) {
      throw error
    }
  }, [])

  const delete${name} = useCallback(async (id: string) => {
    try {
      // TODO: Implement delete functionality
      await apiClient.delete(\`/${name.toLowerCase()}/\${id}\`)
      setState(prev => ({
        ...prev,
        data: prev.data.filter(item => item.id !== id)
      }))
    } catch (error) {
      throw error
    }
  }, [])

  useEffect(() => {
    load${name}()
  }, [load${name}])

  return {
    ...state,
    load${name},
    create${name},
    update${name},
    delete${name}
  }
}
`,

  apiRoute: (name, props) => `import { NextRequest, NextResponse } from 'next/server'
import { authMiddleware } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /${name.toLowerCase()}
export async function GET(request: NextRequest) {
  try {
    const user = await authMiddleware(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Implement GET logic for ${name}
    const items = await prisma.${name.toLowerCase()}.findMany({
      // Add appropriate filters and includes
    })

    return NextResponse.json({ data: items })
  } catch (error) {
    console.error('${name} GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /${name.toLowerCase()}
export async function POST(request: NextRequest) {
  try {
    const user = await authMiddleware(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // TODO: Add validation
    // TODO: Implement POST logic for ${name}
    const item = await prisma.${name.toLowerCase()}.create({
      data: {
        ...body,
        userId: user.id,
      }
    })

    return NextResponse.json({ data: item }, { status: 201 })
  } catch (error) {
    console.error('${name} POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /${name.toLowerCase()}/[id]
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await authMiddleware(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id } = params

    // TODO: Add ownership/permission checks
    // TODO: Implement PUT logic for ${name}
    const item = await prisma.${name.toLowerCase()}.update({
      where: { id },
      data: body
    })

    return NextResponse.json({ data: item })
  } catch (error) {
    console.error('${name} PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /${name.toLowerCase()}/[id]
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await authMiddleware(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    // TODO: Add ownership/permission checks
    // TODO: Implement DELETE logic for ${name}
    await prisma.${name.toLowerCase()}.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('${name} DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
`
};

// Utility functions
function toPascalCase(str) {
  return str.replace(/(?:^|\s)\w/g, match => match.toUpperCase().replace(/\s/g, ''));
}

function toCamelCase(str) {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function ask(question) {
  return new Promise(resolve => {
    rl.question(question, resolve);
  });
}

async function generateComponent() {
  console.log('🎭 Haus of Basquiat Component Generator\n');
  
  const componentType = await ask('Component type (page/component/hook/api): ');
  const componentName = await ask('Component name: ');
  const description = await ask('Description: ');
  const icons = (await ask('Lucide icons (comma separated): ') || 'Star').split(',').map(s => s.trim());
  
  const name = toPascalCase(componentName);
  const props = {
    description,
    icons,
    propsInterface: 'className?: string',
    propsParams: 'className'
  };

  if (!templates[componentType]) {
    console.error('Invalid component type. Use: page, component, hook, or api');
    process.exit(1);
  }

  const content = templates[componentType](name, props);
  
  let filePath;
  switch (componentType) {
    case 'page':
      filePath = `app/${componentName.toLowerCase()}/page.tsx`;
      break;
    case 'component':
      filePath = `components/${componentName.toLowerCase()}.tsx`;
      break;
    case 'hook':
      filePath = `hooks/use-${componentName.toLowerCase()}.tsx`;
      break;
    case 'api':
      filePath = `app/api/${componentName.toLowerCase()}/route.ts`;
      break;
  }

  // Create directory if it doesn't exist
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Write file
  fs.writeFileSync(filePath, content);
  
  console.log(`✅ Generated ${componentType}: ${filePath}`);
  
  // Generate test file
  if (componentType === 'component' || componentType === 'hook') {
    const testPath = `tests/unit/${componentName.toLowerCase()}.test.tsx`;
    const testContent = generateTestTemplate(name, componentType);
    
    const testDir = path.dirname(testPath);
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    
    fs.writeFileSync(testPath, testContent);
    console.log(`✅ Generated test: ${testPath}`);
  }

  rl.close();
}

function generateTestTemplate(name, type) {
  if (type === 'component') {
    return `import { render, screen } from '@testing-library/react'
import { ${name} } from '@/components/${name.toLowerCase()}'

describe('${name}', () => {
  it('renders correctly', () => {
    render(<${name} />)
    expect(screen.getByText('${name}')).toBeInTheDocument()
  })

  it('handles user interactions', () => {
    // TODO: Add interaction tests
  })
})
`;
  }

  if (type === 'hook') {
    return `import { renderHook, act } from '@testing-library/react'
import { use${name} } from '@/hooks/use-${name.toLowerCase()}'

describe('use${name}', () => {
  it('initializes with default state', () => {
    const { result } = renderHook(() => use${name}())
    
    expect(result.current.loading).toBe(true)
    expect(result.current.data).toEqual([])
    expect(result.current.error).toBe(null)
  })

  it('handles data loading', async () => {
    // TODO: Add data loading tests
  })
})
`;
  }
}

// Run the generator
generateComponent().catch(console.error);