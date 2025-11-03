import type { ReactNode } from 'react'
import './App.css'

type FocusTask = {
  title: string
  firstAction: string
  due: string
  note: string
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

const immediateTasks: FocusTask[] = [
  {
    title: '三井住友銀行オンライン口座 trunk の手続きを完了',
    firstAction: 'ビジネスダイレクトにログインし、申請ステータスと不足書類を確認する',
    due: '今日 11:00',
    note: '完了したら妻へ共有メモを Slack に残す',
  },
  {
    title: 'S金庫の件を前に進める',
    firstAction: '担当窓口へ電話して必要書類・期限を再確認する',
    due: '今日 13:00',
    note: '次の訪問日をその場で仮押さえする',
  },
  {
    title: '金田くんへ書類を送る',
    firstAction: '送付する PDF を見直し、メール本文の下書きを作る',
    due: '今日 16:00',
    note: '送付後はタスクを完了記録し、保管先にもアップロード',
  },
  {
    title: 'エジプトビザの対応を進める',
    firstAction: 'オンライン申請ページを開き、必要項目と書類をリスト化する',
    due: '明日 午前',
    note: 'パスポート画像と行程表をフォルダにまとめる',
  },
  {
    title: 'Amex を復旧させる',
    firstAction: 'サポート窓口へ電話し、再発行または解除の手順を確認する',
    due: '明日 15:00',
    note: '本人確認情報を手元に用意しておく',
  },
  {
    title: '万博の経費を計上',
    firstAction: '領収書をスキャンし、Notion の経費トラッカーに入力する',
    due: '今週 金曜',
    note: '金額と支払方法を確認し、妻へ共有する',
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
      <h2>{title}</h2>
      {description && <p className="section-description">{description}</p>}
      {children}
    </section>
  )
}

export default function App() {
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
        description="チェックボックスをひとつずつ埋める。どれも 15 分の第一歩から始める。"
      >
        <ul className="checklist">
          {immediateTasks.map((task) => (
            <li className="checklist-item" key={task.title}>
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
