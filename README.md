# USJ待ち時間ナビ

USJの公開データをもとに、アトラクションの待ち時間、20分ごとの履歴、営業時間、ショーの開始時刻を表示する個人運営の非公式サイトです。

公開URL: https://usj-wait-nav.kotaro-7436.workers.dev/

## 構成

- Cloudflare Workers: 表示と定期取得
- Cloudflare D1: 20分単位の待ち時間履歴と営業時間
- GitHub: ソース管理

閲覧者の操作は保存済みデータの表示に限り、外部データ提供元への取得やD1への保存は定期ジョブが行います。取得は5分ごと、履歴の保存は営業時間帯の毎時0・20・40分です。取得失敗時は欠測として扱います。

## データ出典

- 待ち時間: [Queue-Times.com](https://queue-times.com/pages/api) と [ThemeParks.wiki](https://www.themeparks.wiki/)
- 営業時間・休止・イベント・ショーに関する参照先: [USJ公式サイト](https://www.usj.co.jp/web/ja/jp/)

本サイトの数値は提供元の掲載値で、現地の実測待機時間ではありません。データの再配布用APIとしては提供していません。

## 開発

Node.jsを使います。

```sh
npm ci
npx wrangler d1 execute usj-wait-nav-db --local --file migrations/0001_initial.sql
npm run dev
```

Cloudflareアカウントで実行する場合は `wrangler.jsonc` のD1データベースIDを自分のものに変更してください。`npm run build` は単一ファイルのWorkerを `dist/worker.js` に生成します。

## 運営

広告とアクセス解析は現在未設定です。お問い合わせは [GitHub Issues](https://github.com/ahoro535401/usj-wait-nav/issues) へ。プライバシーポリシーは公開サイトの `/privacy` を参照してください。
