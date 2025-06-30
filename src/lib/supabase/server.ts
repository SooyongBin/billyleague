import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

interface CustomCookies {
  get(name: string): string | undefined;
  set(name: string, value: string, options: CookieOptions): void;
  remove(name: string, options: CookieOptions): void;
}

export function createClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookieStore = cookies() as unknown as CustomCookies;
          return cookieStore.get(name);
        },
        set(name: string, value: string, options: CookieOptions) {
          const cookieStore = cookies() as unknown as CustomCookies;
          try {
            cookieStore.set(name, value, options);
          } catch (_) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          const cookieStore = cookies() as unknown as CustomCookies;
          try {
            cookieStore.remove(name, options);
          } catch (_) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
