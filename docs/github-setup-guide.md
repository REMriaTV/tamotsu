# GitHub リポジトリ作成ガイド（Tamotsu）

この手順ではブラウザから GitHub 上に新しいリポジトリを作成し、ローカルの `tamotsu/` ディレクトリを初期コミットするまでをまとめます。

## 1. GitHub でリポジトリを作成
1. ブラウザで https://github.com/new を開く。
2. `Account` を `remriatv` に設定。
3. `Repository name` に `tamotsu`（仮）を入力。
4. `Private` / `Public` を選択（個人用なら `Private` 推奨）。
5. `Add a README` などのチェックはすべて外す（空で作成する）。
6. `Create repository` をクリック。

> 補足: リポジトリ作成後に表示される `git` コマンド一覧は閉じずにコピーしておくと後で楽です。

## 2. SSH / HTTPS どちらで接続するか決める
- すでに `remriatv` で SSH 鍵を登録しているなら、SSH URL（例 `git@github.com:remriatv/tamotsu.git`）を使用。
- 登録していなければ、HTTPS URL（`https://github.com/remriatv/tamotsu.git`）を選び、都度パスワード or PAT を入力。

## 3. ローカルで初期セットアップ
以下はローカルの `twinpeach/` リポジトリ内で作業する前提です。

```bash
# 1. tamotsu ディレクトリへ移動
cd /Users/ootsukaumihei/twinpeach/tamotsu

# 2. 新しい git リポジトリを初期化
git init

# 3. GitHub のリモートを追加（SSH の例）
git remote add origin git@github.com:remriatv/tamotsu.git

# 4. 現状のファイルを確認
git status

# 5. 初回コミットを作成
git add .
git commit -m "chore: bootstrap tamotsu repository"

# 6. main ブランチとしてプッシュ
git branch -M main
git push -u origin main
```

## 4. 補足
- `git push` 時に認証で止まった場合は、GitHub 側で Personal Access Token (classic) を発行し、パスワードとして入力。
- 既に `tamotsu` でリポジトリを初期化済みの場合は、`git remote set-url origin <url>` で上書きしてからプッシュ。
- GitHub Pages 等で公開する想定がある場合は、`Settings > Pages` でブランチを指定。

## 5. 次のステップ
- `apps/` 以下に web アプリ or Swift プロジェクトを追加。
- Issue と Project を使ってロードマップ（MVP）を管理。
- 同期バックエンド（Supabase など）のリポジトリや環境変数を整備。

### 参考: GitHub 推奨セット（HTTPS の例）
```bash
echo "# tamotsu" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/REMriaTV/tamotsu.git
git push -u origin main
```
