import { z } from "zod"

// Define the environment schema
const envSchema = z.object({
  // Required environment variables
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("Invalid Supabase URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "Supabase anon key is required"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "Supabase service role key is required"),
  
  // App configuration
  NEXT_PUBLIC_APP_URL: z.string().url("Invalid app URL").default("http://localhost:3000"),
  NEXT_PUBLIC_API_URL: z.string().default("/api"),
  NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL: z.string().url("Invalid redirect URL").optional(),
  
  // Security
  JWT_SECRET: z.string().min(32, "JWT secret must be at least 32 characters"),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT refresh secret must be at least 32 characters").optional(),
  
  // Database (optional for client-side only apps)
  DATABASE_URL: z.string().optional(),
  DIRECT_URL: z.string().optional(),
  
  // Optional integrations
  UPSTASH_REDIS_URL: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url("Invalid Redis REST URL").optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  
  // AI APIs
  ANTHROPIC_API_KEY: z.string().optional(),
  CLAUDE_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  COPYLEAKS_API_KEY: z.string().optional(),
  
  // Email
  SENDGRID_API_KEY: z.string().optional(),
  SENDGRID_FROM_EMAIL: z.string().email("Invalid from email").optional(),
  
  // Payments
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  
  // Analytics
  GOOGLE_ANALYTICS_ID: z.string().optional(),
  NEXT_PUBLIC_GOOGLE_ANALYTICS_ID: z.string().optional(),
  SENTRY_DSN: z.string().url("Invalid Sentry DSN").optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url("Invalid Sentry DSN").optional(),
  
  // Media & Streaming
  SOCKET_IO_SECRET: z.string().optional(),
  LIVEPEER_API_KEY: z.string().optional(),
  BRAVE_SEARCH_API_KEY: z.string().optional(),
  
  // Backend specific (if using Express backend)
  CLIENT_URL: z.string().url("Invalid client URL").optional(),
  PORT: z.coerce.number().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  VITE_SUPABASE_URL: z.string().url("Invalid Vite Supabase URL").optional(), // Legacy support
  
  // Development flags
  SKIP_ENV_VALIDATION: z.coerce.boolean().default(false),
  ANALYZE: z.coerce.boolean().default(false),
  DISABLE_PWA: z.coerce.boolean().default(false),
})

// Client-side environment schema (only NEXT_PUBLIC_ variables)
const clientEnvSchema = envSchema.pick({
  NEXT_PUBLIC_SUPABASE_URL: true,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: true,
  NEXT_PUBLIC_APP_URL: true,
  NEXT_PUBLIC_API_URL: true,
  NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL: true,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: true,
  NEXT_PUBLIC_GOOGLE_ANALYTICS_ID: true,
  NEXT_PUBLIC_SENTRY_DSN: true,
})

// Type definitions
export type Env = z.infer<typeof envSchema>
export type ClientEnv = z.infer<typeof clientEnvSchema>

// Validation functions
function validateEnv(): Env {
  if (process.env.SKIP_ENV_VALIDATION === "true") {
    console.warn("⚠️ Skipping environment validation")
    return process.env as any
  }

  try {
    const parsed = envSchema.parse(process.env)
    console.log("✅ Environment variables validated successfully")
    return parsed
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(
        (err) => `${err.path.join(".")}: ${err.message}`
      )
      
      console.error("❌ Environment validation failed:")
      errorMessages.forEach((msg) => console.error(`  • ${msg}`))
      console.error("\nPlease check your .env.local file and ensure all required variables are set.")
      console.error("Copy .env.example to .env.local and fill in the required values.")
      
      throw new Error(`Environment validation failed: ${errorMessages.join(", ")}`)
    }
    throw error
  }
}

function validateClientEnv(): ClientEnv {
  try {
    const clientEnv = Object.fromEntries(
      Object.entries(process.env).filter(([key]) => key.startsWith("NEXT_PUBLIC_"))
    )
    
    const parsed = clientEnvSchema.parse(clientEnv)
    return parsed
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(
        (err) => `${err.path.join(".")}: ${err.message}`
      )
      
      console.error("❌ Client environment validation failed:")
      errorMessages.forEach((msg) => console.error(`  • ${msg}`))
      
      throw new Error(`Client environment validation failed: ${errorMessages.join(", ")}`)
    }
    throw error
  }
}

// Export validated environment variables
export const env = validateEnv()
export const clientEnv = validateClientEnv()

// Helper functions for common environment checks
export const isDevelopment = env.NODE_ENV === "development"
export const isProduction = env.NODE_ENV === "production"
export const isTest = env.NODE_ENV === "test"

export const hasRedis = !!(env.UPSTASH_REDIS_URL || env.UPSTASH_REDIS_REST_URL)
export const hasStripe = !!(env.STRIPE_SECRET_KEY && env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
export const hasAnalytics = !!(env.GOOGLE_ANALYTICS_ID || env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID)
export const hasSentry = !!(env.SENTRY_DSN || env.NEXT_PUBLIC_SENTRY_DSN)
export const hasAI = !!(env.ANTHROPIC_API_KEY || env.CLAUDE_API_KEY || env.OPENAI_API_KEY)
export const hasEmail = !!(env.SENDGRID_API_KEY && env.SENDGRID_FROM_EMAIL)

// Environment info for debugging
export const envInfo = {
  nodeEnv: env.NODE_ENV,
  appUrl: env.NEXT_PUBLIC_APP_URL,
  apiUrl: env.NEXT_PUBLIC_API_URL,
  supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL,
  features: {
    redis: hasRedis,
    stripe: hasStripe,
    analytics: hasAnalytics,
    sentry: hasSentry,
    ai: hasAI,
    email: hasEmail,
  },
}

// Development helper to log environment status
if (isDevelopment) {
  console.log("🌍 Environment Info:", envInfo)
}