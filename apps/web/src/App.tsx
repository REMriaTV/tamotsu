import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import './App.css'
import { supabase } from './lib/supabaseClient'
import { useSupabaseAuth } from './hooks/useSupabaseAuth'

type FocusTask = {
  id: string
  slug: string
  title: string
  firstAction: string
  due: string
  note: string
  overview: string
  initialScript: string
}

type Blocker = {
  title: string
  tag: string
  note: string
}

type CheckIn = {
  slot: string
  mood: string
  energy: string
  note: string
}

type Reminder = {
  title: string
  detail: string
}

type SectionProps = {
  title: string
  description?: string
  children: ReactNode
}

type ChatEntry = {
  id: string
  text: string
  createdAt: Date
}

type ManuscriptRecord = {
  id: string
  script: string
}

const STORAGE_PREFIX = 'tamotsu-task-'

const immediateTasks: FocusTask[] = [
  {
    id: 'trunk',
    slug: 'trunk',
    title: '三井住友銀行オンライン口座 trunk の手続きを完了',
    firstAction: 'ビジネスダイレクトにログインし、申請ステータスと不足書類を確認する',
    due: '今日 11:00',
    note: '完了したら妻へ共有メモを Slack に残す',
    overview: 'オンライン口座の開設が止まっている。何が不足しているのかを確認し、今日中に動きを作る。',
    initialScript:
      'オンライン口座の申請画面を開き、落ち着いて現在地を確認する。止まっている理由をそのまま書き起こし、ひとつずつ潰していく。',
  },
  {
    id: 'skinko',
    slug: 'skinko',
    title: 'S金庫の件を前に進める',
    firstAction: '担当窓口へ電話して必要書類・期限を再確認する',
    due: '今日 13:00',
    note: '次の訪問日をその場で仮押さえする',
    overview: '信用金庫との手続きが宙ぶらん。先方の動きを待つのではなく、自分から次のアクションを作る。',
    initialScript:
      'S金庫の担当者に電話するまでの心のハードルを丁寧に下げていく。電話する理由、確認したいこと、終わった後の感情を書き留めておく。',
  },
  {
    id: 'kaneda',
    slug: 'kaneda',
    title: '金田くんへ書類を送る',
    firstAction: '送付する PDF を見直し、メール本文の下書きを作る',
    due: '今日 16:00',
    note: '送付後はタスクを完了記録し、保管先にもアップロード',
    overview: '取引先へ出す書類を溜めてしまっている。丁寧な言葉を添えて送り、信頼残高を積む。',
    initialScript:
      '書類を送ったあとの安堵を想像しながら、今の迷いと感謝を原稿に落とし込む。ひとつずつ丁寧に。',
  },
  {
    id: 'egypt-visa',
    slug: 'egypt-visa',
    title: 'エジプトビザの対応を進める',
    firstAction: 'オンライン申請ページを開き、必要項目と書類をリスト化する',
    due: '明日 午前',
    note: 'パスポート画像と行程表をフォルダにまとめる',
    overview: '旅程をスムーズに進めるための準備。未来の自分が困らないように、今できる整理を終わらせる。',
    initialScript:
      'エジプトの景色を思い浮かべながら、必要な書類をひとつずつリストにする。未来の自分に向けてメッセージを書く。',
  },
  {
    id: 'amex',
    slug: 'amex',
    title: 'Amex を復旧させる',
    firstAction: 'サポート窓口へ電話し、再発行または解除の手順を確認する',
    due: '明日 15:00',
    note: '本人確認情報を手元に用意しておく',
    overview: '止まったままのカードを復旧させ、日常の決済ストレスを取り除く。',
    initialScript:
      'サポートに電話する前の気持ちと、解決できたあとの自分の安心を原稿に綴る。',
  },
  {
    id: 'expo-expense',
    slug: 'expo-expense',
    title: '万博の経費を計上',
    firstAction: '領収書をスキャンし、Notion の経費トラッカーに入力する',
    due: '今週 金曜',
    note: '金額と支払方法を確認し、妻へ共有する',
    overview: 'イベントにかかったコストを整理し、キャッシュフローを見える化して安心感を取り戻す。',
    initialScript:
      '領収書の山をひとつずつ片付けながら、自分の頑張りを言葉に残す。経費計上が終わったあとの解放感を描写する。',
  },
]

const blockers: Blocker[] = [
  {
    title: '気力が出ない',
    tag: 'エネルギー不足',
    note: '寝不足で集中しづらい。5分の散歩と水分補給で立て直す。',
  },
  {
    title: '何から手を付けるかわからない',
    tag: '見通し不足',
    note: 'タスクを 15 分単位に分解してメモしてから着手する。',
  },
]

const checkIns: CheckIn[] = [
  {
    slot: '朝',
    mood: '2 / 5',
    energy: '2 / 5',
    note: '寝起きが重い。深呼吸とストレッチで整える。',
  },
  {
    slot: '昼',
    mood: '3 / 5',
    energy: '3 / 5',
    note: '作業が散らかって不安。タスクを 3 つまで絞る。',
  },
  {
    slot: '夜',
    mood: '4 / 5',
    energy: '3 / 5',
    note: '請求書を送れた。小さな達成をログに残す。',
  },
]

const reminders: Reminder[] = [
  {
    title: '未来の自分メモ',
    detail: '明日の朝イチ、妻に進捗を共有するメッセージを送る。',
  },
  {
    title: 'リワードログ',
    detail: '請求書送付を達成 → 夜はお気に入りのラーメンを食べる。',
  },
]

function Section({ title, description, children }: SectionProps) {
  return (
    <section>
      <div className="section-heading">
        <h2>{title}</h2>
        {description && <p className="section-description">{description}</p>}
      </div>
      {children}
    </section>
  )
}

function useHashRoute(): [string | null, (id: string | null) => void] {
  const [taskId, setTaskId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    const hash = window.location.hash
    if (hash.startsWith('#task/')) {
      return hash.replace('#task/', '') || null
    }
    return null
  })

  useEffect(() => {
    const handler = () => {
      const hash = window.location.hash
      if (hash.startsWith('#task/')) {
        setTaskId(hash.replace('#task/', '') || null)
      } else {
        setTaskId(null)
      }
    }

    window.addEventListener('hashchange', handler)
    return () => window.removeEventListener('hashchange', handler)
  }, [])

  const navigate = (id: string | null) => {
    if (id) {
      window.location.hash = `#task/${id}`
      setTaskId(id)
    } else {
      window.location.hash = '#/'
      setTaskId(null)
    }
  }

  return [taskId, navigate]
}

const localFallbackKey = (taskId: string) => `${STORAGE_PREFIX}${taskId}`

async function fetchManuscript(profileId: string, slug: string): Promise<ManuscriptRecord | null> {
  const { data, error } = await supabase
    .from('manuscripts')
    .select('id, script, task_id, tasks!inner(slug)')
    .eq('profile_id', profileId)
    .eq('tasks.slug', slug)
    .maybeSingle()

  if (error && error.code !== 'PGRST116') {
    console.error('Failed to fetch manuscript', error)
  }

  if (!data) return null

  return { id: data.id, script: data.script }
}

type SupabaseChatRow = {
  id: string
  message: string
  created_at: string
}

async function fetchChatEntries(profileId: string, slug: string): Promise<ChatEntry[]> {
  const { data, error } = await supabase
    .from('chat_entries')
    .select('id, message, created_at, tasks!inner(slug)')
    .eq('profile_id', profileId)
    .eq('tasks.slug', slug)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch chat entries', error)
    return []
  }

  return (data ?? []).map((row: SupabaseChatRow) => ({
    id: row.id,
    text: row.message,
    createdAt: new Date(row.created_at),
  }))
}

async function ensureTask(task: FocusTask): Promise<string> {
  const { data } = await supabase
    .from('tasks')
    .select('id, slug')
    .eq('slug', task.slug)
    .maybeSingle()

  if (data) return data.id

  const { data: inserted, error } = await supabase
    .from('tasks')
    .insert({
      slug: task.slug,
      title: task.title,
      overview: task.overview,
      first_action: task.firstAction,
      due: task.due,
      note: task.note,
      initial_script: task.initialScript,
    })
    .select()
    .single()

  if (error || !inserted) {
    throw error ?? new Error('Failed to insert task')
  }

  return inserted.id
}

async function saveManuscript(
  profileId: string,
  task: FocusTask,
  manuscriptId: string | null,
  script: string,
): Promise<string> {
  const taskId = await ensureTask(task)

  if (manuscriptId) {
    const { data, error } = await supabase
      .from('manuscripts')
      .update({ script })
      .eq('id', manuscriptId)
      .eq('profile_id', profileId)
      .select('id')
      .maybeSingle()

    if (error) {
      console.error('Failed to update manuscript', error)
      throw error
    }

    return data?.id ?? manuscriptId
  }

  const { data, error } = await supabase
    .from('manuscripts')
    .insert({ profile_id: profileId, task_id: taskId, script })
    .select('id')
    .single()

  if (error || !data) {
    console.error('Failed to insert manuscript', error)
    throw error ?? new Error('Manuscript insert failed')
  }

  return data.id
}

async function saveChatEntry(profileId: string, task: FocusTask, text: string): Promise<ChatEntry> {
  const taskId = await ensureTask(task)

  const { data, error } = await supabase
    .from('chat_entries')
    .insert({ profile_id: profileId, task_id: taskId, message: text })
    .select('id, message, created_at')
    .single()

  if (error || !data) {
    console.error('Failed to insert chat entry', error)
    throw error ?? new Error('chat entry insert failed')
  }

  return {
    id: data.id,
    text: data.message,
    createdAt: new Date(data.created_at),
  }
}

function TaskDetail({ task, onBack, profileId }: { task: FocusTask; onBack: () => void; profileId: string }) {
  const [script, setScript] = useState<string>(task.initialScript)
  const [manuscriptId, setManuscriptId] = useState<string | null>(null)
  const [entries, setEntries] = useState<ChatEntry[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const localKey = localFallbackKey(task.id)

    const bootstrap = async () => {
      try {
        const manuscript = await fetchManuscript(profileId, task.slug)
        const chats = await fetchChatEntries(profileId, task.slug)

        if (mounted) {
          if (manuscript) {
            setScript(manuscript.script)
            setManuscriptId(manuscript.id)
          } else {
            setScript(task.initialScript)
            setManuscriptId(null)
          }

          setEntries(chats)
          setLoading(false)
        }
      } catch (err) {
        console.error(err)
        if (mounted) {
          setError('オンライン同期に失敗。ローカル保存へ切り替えます。')
          setLoading(false)

          if (typeof window !== 'undefined') {
            const fallback = window.localStorage.getItem(localKey)
            if (fallback) {
              try {
                const parsed = JSON.parse(fallback)
                setScript(parsed.script ?? task.initialScript)
                setEntries((parsed.entries ?? []).map((entry: any) => ({
                  id: entry.id,
                  text: entry.text,
                  createdAt: new Date(entry.createdAt),
                })))
              } catch (parseError) {
                console.error('Failed to parse local fallback', parseError)
              }
            }
          }
        }
      }
    }

    bootstrap()

    return () => {
      mounted = false
    }
  }, [profileId, task])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const payload = JSON.stringify({
      script,
      entries: entries.map((entry) => ({
        ...entry,
        createdAt: entry.createdAt.toISOString(),
      })),
    })
    window.localStorage.setItem(localFallbackKey(task.id), payload)
  }, [entries, script, task.id])

  const scriptParagraphs = useMemo(() => script.split(/\n+/).filter((line) => line.trim().length > 0), [script])

  const handleSubmit = async () => {
    const trimmed = input.trim()
    if (!trimmed) return

    setInput('')

    try {
      const manuscriptKey = await saveManuscript(profileId, task, manuscriptId, script ? `${script}\n\n${trimmed}` : trimmed)
      setManuscriptId(manuscriptKey)
      setScript((prev) => (prev ? `${prev}\n\n${trimmed}` : trimmed))

      const entry = await saveChatEntry(profileId, task, trimmed)
      setEntries((prev) => [entry, ...prev])
    } catch (err) {
      console.error(err)
      setError('投稿の保存に失敗しました。再度お試しください。')
      setScript((prev) => (prev ? `${prev}\n\n${trimmed}` : trimmed))

      const entry: ChatEntry = {
        id: `${Date.now()}`,
        text: trimmed,
        createdAt: new Date(),
      }
      setEntries((prev) => [entry, ...prev])
    }
  }

  return (
    <div className="detail">
      <button className="back-button" type="button" onClick={onBack}>
        ← リストに戻る
      </button>

      {error && <p className="error-banner">{error}</p>}

      <div className="detail-header">
        <div>
          <span className="detail-label">タスク</span>
          <h1>{task.title}</h1>
          <p className="detail-overview">{task.overview}</p>
        </div>
        <div className="detail-meta">
          <div>
            <span className="badge">最初の一歩</span>
            <p>{task.firstAction}</p>
          </div>
          <div>
            <span className="badge">期限</span>
            <p>{task.due}</p>
          </div>
        </div>
      </div>

      <div className="detail-grid">
        <section className="manuscript-section">
          <div className="section-heading">
            <h2>原稿</h2>
            <p className="section-description">縦書きで気持ちと手順を残す。チャットに書いた言葉がここに積み重なる。</p>
          </div>
          <div className="manuscript">
            {loading ? (
              <p className="manuscript-placeholder">読み込み中...</p>
            ) : scriptParagraphs.length === 0 ? (
              <p className="manuscript-placeholder">まだ原稿は空です。右側に書いた言葉がここに積もります。</p>
            ) : (
              scriptParagraphs.map((paragraph, index) => (
                <p key={index} className="manuscript-line">
                  {paragraph}
                </p>
              ))
            )}
          </div>
        </section>

        <section className="chat-section">
          <div className="section-heading">
            <h2>チャット & 日記</h2>
            <p className="section-description">感情・小さな一歩・気づきを書いたら Enter。原稿にそのまま反映される。</p>
          </div>

          <div className="chat-panel">
            <div className="chat-log" aria-live="polite">
              {entries.length === 0 ? (
                <p className="chat-placeholder">最初のひと言を書いてみよう。迷いや感謝、浮かんだ手順でもOK。</p>
              ) : (
                entries.map((entry) => (
                  <article key={entry.id} className="chat-entry">
                    <time>{entry.createdAt.toLocaleString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</time>
                    <p>{entry.text}</p>
                  </article>
                ))
              )}
            </div>
            <div className="chat-input">
              <textarea
                value={input}
                placeholder="ここに書いて Enter で原稿へ反映"
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    handleSubmit()
                  }
                }}
              />
              <button type="button" onClick={handleSubmit} disabled={!profileId}>
                送る
              </button>
            </div>
          </div>

          <div className="detail-note">
            <span className="badge">メモ</span>
            <p>{task.note}</p>
          </div>
        </section>
      </div>
    </div>
  )
}

function Dashboard({ onSelectTask }: { onSelectTask: (id: string) => void }) {
  return (
    <main>
      <header>
        <span className="product-name">tamotsu</span>
        <h1>モチベーションが揺らいだ自分を保つ、毎日の伴走ハブ</h1>
        <p>
          秋の繁忙期を乗り切るために、タスクと気分を見える化し、やれない理由を言語化。
          iPhone でも Mac でも同じ情報にアクセスできる、セルフマネジメント用のハックツールです。
        </p>
      </header>

      <Section
        title="直近で片づけるタスク"
        description="クリックすると原稿ページへ。15 分で動かす第一歩を書き出してある。"
      >
        <ul className="checklist">
          {immediateTasks.map((task) => (
            <li className="checklist-item" key={task.id}>
              <button className="checklist-button" type="button" onClick={() => onSelectTask(task.id)}>
                <div className="checklist-main">
                  <span className="checkbox" aria-hidden="true" />
                  <div className="checklist-content">
                    <p className="checklist-title">{task.title}</p>
                    <p className="checklist-action">{task.firstAction}</p>
                  </div>
                </div>
                <div className="checklist-meta">
                  <span className="badge">期限</span>
                  <span>{task.due}</span>
                </div>
                <p className="checklist-note">{task.note}</p>
              </button>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="やれない理由をほどく"
        description="理由タグを記録して可視化。決めておいた対処の引き出しから次のアクションへ。"
      >
        <div className="grid two">
          {blockers.map((item) => (
            <article className="note-card" key={item.title}>
              <span className="badge badge--outline">{item.tag}</span>
              <h3>{item.title}</h3>
              <p>{item.note}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section
        title="日次チェックイン"
        description="朝・昼・夜で気分とエネルギーを点検。アップダウンをログに残してセルフケア。"
      >
        <div className="grid three">
          {checkIns.map((item) => (
            <article className="note-card" key={item.slot}>
              <span className="badge">{item.slot}</span>
              <div className="mood">
                <span>気分 {item.mood}</span>
                <span>エネルギー {item.energy}</span>
              </div>
              <p>{item.note}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section title="未来の自分へ" description="行動のトリガーと小さなご褒美を忘れない。">
        <ul className="task-list">
          {reminders.map((item) => (
            <li className="task-card" key={item.title}>
              <div className="task-card__title">
                <strong>{item.title}</strong>
              </div>
              <span>{item.detail}</span>
            </li>
          ))}
        </ul>
      </Section>

      <footer>
        <p>
          コンセプトとロードマップは{' '}
          <a
            className="inline-link"
            href="https://github.com/REMriaTV/tamotsu/tree/main/docs"
            target="_blank"
            rel="noreferrer"
          >
            GitHub ドキュメント
          </a>
          にて更新中。
        </p>
        <p className="footer-note">
          タモツを使って、モチベーションが揺れた日も「自分を保つ」行動を積み上げていこう。
        </p>
      </footer>
    </main>
  )
}

export default function App() {
  const [currentTaskId, navigate] = useHashRoute()
  const { profileId, loading, error } = useSupabaseAuth()

  const activeTask = useMemo(
    () => immediateTasks.find((task) => task.id === currentTaskId) ?? null,
    [currentTaskId],
  )

  if (loading) {
    return (
      <div className="loading-screen">
        <p>セッションを準備中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="loading-screen">
        <p>{error}</p>
        <p className="loading-sub">Supabase の匿名サインイン設定を確認してから再読み込みしてください。</p>
      </div>
    )
  }

  if (!profileId) {
    return (
      <div className="loading-screen">
        <p>ログインに失敗しました。ページを再読み込みしてください。</p>
      </div>
    )
  }

  if (activeTask) {
    return <TaskDetail task={activeTask} onBack={() => navigate(null)} profileId={profileId} />
  }

  return <Dashboard onSelectTask={navigate} />
}
