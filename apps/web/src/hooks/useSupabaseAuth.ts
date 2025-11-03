import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useSupabaseAuth() {
  const [profileId, setProfileId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const ensureSession = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        console.error('getSession error', sessionError)
      }

      if (!session) {
        const result = await supabase.auth.signInAnonymously()

        if (result.error) {
          console.error('Failed to sign in anonymously', result.error)
          if (mounted) {
            setError('匿名ログインに失敗しました。匿名サインインが有効か確認してください。')
            setLoading(false)
          }
          return
        }

        const user = result.data.user
        if (user && mounted) {
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({ id: user.id }, { onConflict: 'id' })

          if (profileError && profileError.code !== '23505') {
            console.error('Failed to upsert profile', profileError)
            setError('プロフィール作成に失敗しました。')
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
          .upsert({ id: userId }, { onConflict: 'id' })

        if (profileError && profileError.code !== '23505') {
          console.error('Failed to ensure profile', profileError)
          setError('プロフィール作成に失敗しました。')
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

  return { profileId, loading, error }
}
