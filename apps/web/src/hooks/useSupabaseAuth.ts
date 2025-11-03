import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useSupabaseAuth() {
  const [profileId, setProfileId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const ensureSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        const {
          data: { user },
          error,
        } = await supabase.auth.signInAnonymously()

        if (error) {
          console.error('Failed to sign in anonymously', error)
          setLoading(false)
          return
        }

        if (user && mounted) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({ id: user.id })
            .single()

          if (profileError && profileError.code !== '23505') {
            console.error('Failed to insert profile', profileError)
          }

          setProfileId(user.id)
          setLoading(false)
          return
        }
      }

      if (session && mounted) {
        const userId = session.user.id
        setProfileId(userId)

        const { error: profileError } = await supabase
          .from('profiles')
          .insert({ id: userId })
          .single()

        if (profileError && profileError.code !== '23505') {
          console.error('Failed to ensure profile', profileError)
        }

        setLoading(false)
      }
    }

    ensureSession()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      if (session?.user) {
        setProfileId(session.user.id)
      } else {
        setProfileId(null)
      }
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  return { profileId, loading }
}
