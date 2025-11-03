# タモツ Web 実装アーキテクチャ案

> Xcode や Apple Developer Program を使わず、ブラウザ経由で iPhone / Mac 双方から利用できる形でタモツを構築するためのプランです。

## 1. 基本方針
- **フロントエンド**: モバイルブラウザでも扱いやすい PWA（Progressive Web App）。React + Vite または Next.js での実装を想定。
- **バックエンド**: Supabase（PostgreSQL + Auth + Storage）を使用し、リアルタイム同期と認証を提供。
- **データ共有**: Supabase の Row Level Security で自分専用スペースを確保しつつ、将来的なユーザー追加にも備える。
- **オフライン対応**: IndexedDB + Service Worker で簡易キャッシュ。オフライン時はローカル保存→再接続で同期。

## 2. 技術スタック候補
| レイヤー | 選定案 | 理由 |
| --- | --- | --- |
| UI | React + Vite + TypeScript | スタートしやすく、Supabase SDK のサポートも厚い |
| 状態管理 | Zustand or Redux Toolkit Query | 入力フォームや同期状態を管理しやすい |
| UI コンポーネント | Mantine / Chakra UI / Tailwind | モバイルフレンドリーなコンポーネントを素早く導入 |
| バックエンド | Supabase | 認証、DB、Edge Functions を一体で利用可能 |
| 認証 | Supabase Auth（Email Magic Link など） | 将来的に複数アカウント運用に備えつつ、自分だけで使う期間はパスワードレスでシンプルに |
| デプロイ | Vercel or Netlify | GitHub 連携で自動デプロイ。PWA も対応 |

## 3. データモデル（Supabase 用）
Supabase SQL 例（`backend/supabase/schema.sql` に配置予定）:
```sql
create table tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null,
  title text not null,
  detail text,
  due_date date,
  first_action text,
  status text default 'pending',
  reason_tag_latest text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table reason_logs (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid references tasks(id) on delete cascade,
  reason_tag text not null,
  note text,
  energy_level int,
  created_at timestamptz default now()
);

create table checkins (
  id uuid primary key default uuid_generate_v4(),
  slot text check (slot in ('morning','noon','night')),
  mood_score int,
  energy_score int,
  note text,
  created_at timestamptz default now(),
  user_id uuid not null
);
```
※ RLS（Row Level Security）で `user_id = auth.uid()` のデータのみ読み書きできるように制限。

## 4. フロントエンド機能分割
- `features/tasks`: タスク一覧、登録、編集、先送り理由の記録。
- `features/checkins`: 朝・昼・夜チェックイン UI、履歴。
- `features/dashboard`: タグ別の滞り分析、感情トレンド。
- `features/reminders`: PWA の通知（Push API）＋カレンダー登録連携を検討。

## 5. ディレクトリ例（Vite + React）
```
apps/web/
  ├─ public/
  │   ├─ manifest.json
  │   └─ icons/
  ├─ src/
  │   ├─ app/
  │   │   ├─ routes/
  │   │   └─ store/
  │   ├─ features/
  │   │   ├─ tasks/
  │   │   ├─ checkins/
  │   │   ├─ dashboard/
  │   │   └─ reminders/
  │   ├─ components/
  │   ├─ hooks/
  │   └─ lib/
  ├─ supabase/
  │   └─ client.ts
  ├─ package.json
  ├─ tsconfig.json
  └─ vite.config.ts
```

## 6. 初期着手の流れ
1. `apps/web` に Vite で React + TS プロジェクトを作成。
2. `.env` で Supabase URL と anon key を管理（`.env.example` を用意）。
3. Supabase のテーブルと RLS ポリシーを `backend/supabase/` にまとめ、`supabase db push` で反映。
4. サインイン画面（シングルユーザーならシンプルな PIN コードでも良い）→タスク一覧の MVP を優先。
5. 自分の実タスクで 1 週間運用し、足りない点を Issue 化。

## 7. オフライン対策（任意）
- `idb-keyval` などを使いタスクを IndexedDB にキャッシュ。
- Service Worker で主要ルートをキャッシュし、オフラインでも起動だけは可能に。

## 8. iPhone での使い勝手
- Safari でホーム画面に追加 → 全画面表示の PWA として利用。
- iOS 17 以降は Web Push も利用可能。未読のタスクリマインダーを送信。
- フォントサイズやタップ領域を 44px 以上で設計。

## 9. Mac での使い勝手
- ブラウザ（Safari/Chrome）で常時起動し、キーボードショートカットを設定。
- 週次レビュー画面やチャートは広い画面向けレイアウトを用意。

## 10. 今すぐできること
1. Supabase プロジェクトを作成し、SQL を流してテーブルを用意。
2. `apps/web` に Vite プロジェクトを作成し、初期画面を作る。
3. GitHub リポジトリで Issue を切り、Week 1 のタスク（タスク CRUD + ローカル保存）を分解。
