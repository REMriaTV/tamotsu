# タモツ (Tamotsu)

> 自分を「保つ」ためのセルフマネジメント支援アプリ。iPhone と Mac の両方でタスクと感情を整え、低下したモチベーションをテクノロジーで立て直すことを目指します。

## 目指すこと
- タスクと気持ちの可視化で「何から始めれば良いか」をいつでも確認できるようにする。
- やれない理由を言語化し、対処アクションに変換できるようにする。
- 朝・昼・夜の小さなチェックインで自分の状態を把握し、セルフケアのサイクルを回す。

## プラットフォーム
- **iPhone**: すぐに入力・チェックできるクイック UI と通知を担当。
- **Mac**: 深い整理・週次レビュー・分析ダッシュボードを実現。
- **データ同期**: CloudKit（優先）または Supabase/PostgreSQL を想定。オフライン補完は SwiftData/CoreData。

## 現在の進捗
- コンセプト整理済み: [`docs/tamotsu-concept.md`](docs/tamotsu-concept.md)
- MVP の開発ロードマップとデータモデル案を定義済み。

## 次のステップ
1. GitHub に新規リポジトリを作成し、このディレクトリ構成を初期コミットする。
2. SwiftUI マルチプラットフォーム プロジェクト雛形を作成し、`apps` 配下へ配置。
3. `Task` モデルとローカル永続化（SwiftData/SwiftPersistence）を実装し、ユニットテストを追加。
4. CloudKit または Supabase の同期レイヤーを選定し、試験的に同期フローを構築。

### Supabase 連携の進め方
- `backend/supabase/schema.sql` と `policies.sql` を使ってテーブルと RLS を用意。
- `apps/web/.env.example` をもとに `.env` を作成し、`VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` を設定。
- `npm install @supabase/supabase-js` を実行して SDK をインストール。
- 詳細手順は `docs/supabase-setup.md` を参照。

## リポジトリ構成
```
 tamotsu/
 ├─ README.md                # プロジェクト概要
 ├─ docs/
 │   └─ tamotsu-concept.md   # コンセプトノート（詳細な背景と要件）
 ├─ apps/
 │   ├─ shared/              # Swift パッケージ（共通ロジック/モデル/スタイル）
 │   ├─ ios/                 # iPhone 向けターゲット
 │   └─ macos/               # Mac 向けターゲット
 ├─ backend/
 │   └─ supabase/            # Supabase スキーマや API 設定（CloudKit 不使用時）
 └─ scripts/                 # ビルド/テスト支援スクリプト
```

## ライセンス
未定（プライベート運用想定）。公開する場合は MIT などを検討してください。
# tamotsu
