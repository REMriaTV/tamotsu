# Supabase 連携セットアップ

タモツの原稿・チャットログを Supabase に保存するための手順です。ローカルの `localStorage` ベースから切り替える際に参照してください。

## 1. Supabase プロジェクトを作成
1. https://app.supabase.com/ にアクセスし、新規プロジェクトを作成。
2. プロジェクト名（例: `tamotsu`）、パスワード（忘れずに保管）、リージョン（Tokyo など近いエリア）を選択。
3. 作成後に表示される `Project URL` と `anon` キーを控える。

## 2. スキーマとポリシーを適用
リポジトリの `backend/supabase/` で以下を実行します。

```bash
cd backend/supabase
supabase link --project-ref <プロジェクトID>
supabase db push --file schema.sql
psql <接続文字列> -f policies.sql  # または supabase db push --file policies.sql
```

> `supabase` CLI がない場合は `brew install supabase/tap/supabase` でインストール。GUI で SQL Studio を開いてファイルの中身を貼り付けても OK。

## 3. 環境変数を設定
`apps/web/.env` を作り、控えておいた値を記入します。

```bash
cd apps/web
cp .env.example .env
# エディタで以下を埋める
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxxxxx
```

## 4. ライブラリをインストール
ターミナルで以下を実行。

```bash
cd apps/web
npm install @supabase/supabase-js
```

## 5. Supabase クライアント
`apps/web/src/lib/supabaseClient.ts` にクライアント初期化コードを用意してあります。`.env` が設定されていれば import するだけで利用可能です。

## 6. 今後の実装タスク
- [ ] `App.tsx` の `localStorage` を Supabase に置き換える（`manuscripts` / `chat_entries` テーブルを利用）。
- [ ] 先に `profiles` に `auth.uid()` と紐づくレコードを作成するハンドラを追加。
- [ ] Supabase Auth（Magic Link or ローカル専用 PIN）でシングルユーザーでもログイン状態を維持。
- [ ] オフライン時は `localStorage` に書き込み → 再接続時に同期する差分アップロード処理を検討。
- [ ] テーブルに `order_index` を設定し、ダッシュボードの並び順を管理。

## 7. 動作確認
`npm run dev` で起動し、チャット入力 → Supabase の `chat_entries` テーブルにレコードが作成されているか確認。問題があればブラウザコンソールにエラーが出ていないかチェックしてください。

これで Supabase とのデータ連携基盤が整います。次のステップとして、`App.tsx` をリファクタし、`supabase.from('chat_entries')` / `supabase.from('manuscripts')` を利用した CRUD を実装します。
