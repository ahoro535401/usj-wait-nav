# USJ待ち時間ナビ

USJの公開データをもとに、アトラクションの待ち時間、20分ごとの履歴、過去の日別・時間帯別の混雑傾向、営業時間、ショーの開始時刻を表示する個人運営の非公式サイトです。USJ付近の天気予報と、身長制限・チャイルドスイッチによる絞り込みも表示します。

公開URL: https://usj-wait-nav.kotaro-7436.workers.dev/

## 構成

- Cloudflare Workers: 表示と定期取得
- Cloudflare D1: 20分単位の待ち時間履歴と営業時間
- GitHub: ソース管理

待ち時間について、閲覧者の操作は保存済みデータの表示に限り、外部データ提供元への取得やD1への保存は定期ジョブが行います。取得は5分ごと、履歴の保存は営業時間帯の毎時0・20・40分です。取得失敗時は欠測として扱います。

天気は気象庁の大阪府予報と大阪観測所のアメダス実測値を表示し、USJ付近の時間別予報にはMET NorwayのLocationforecast APIを併用します。予報の詳細は折りたたみ表示とし、運行変更への注意文は常に表示します。気象庁データは10分、MET Norwayデータは提供元の `Expires` までD1にキャッシュします。MET Norwayの期限後は `If-Modified-Since` を使って再確認します。今後約6時間に平均風速7m/s以上または1時間降水量1mm以上の予報があれば注意、平均風速10m/s以上なら強い注意を表示します。最大瞬間風速が提供される場合は10m/s以上も強い注意の対象ですが、USJ付近のMET Norway予報には現在含まれないため、突風の自動判定はできません。数値は当サイトの目安であり、USJの運休基準や運休予測ではありません。お気に入りIDは閲覧者のブラウザーのローカルストレージにのみ保存します。

ショー開始時刻は開園前にも当日データが揃うまで5分間隔で確認します。画面では今日から7日間を選択できます。現在利用しているThemeParks.wikiのライブデータは当日分のみのため、先の日付は日付を指定したUSJ公式の日別スケジュールへ案内します。公式サイトは将来日の開始時刻を掲載していますが、公式APIの取得・再掲載は許諾確認が必要なため、本番の自動収集は無効にしています。許諾を得た正規データ提供を利用できる場合の表示処理は用意しています。

「過去の待ち時間・混雑傾向」では、記録済みの日付を選び、時間帯ごとの平均とアトラクション別の平均を確認できます。平均は保存された営業中の待ち時間から計算し、夜間版への推定振替は全体平均から除外します。記録のない時間帯は空欄として扱い、欠測を0分には換算しません。公開APIは集計値のみを返します。

## データ出典

- 待ち時間: [Queue-Times.com](https://queue-times.com/pages/api) と [ThemeParks.wiki](https://www.themeparks.wiki/)
- 営業時間・休止・イベント・ショーに関する参照先: [USJ公式サイト](https://www.usj.co.jp/web/ja/jp/)
- 天気予報: [Norwegian Meteorological Institute / MET Norway](https://api.met.no/)（[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)）
- 大阪府予報・大阪観測所のアメダス実測値: [気象庁](https://www.jma.go.jp/bosai/forecast/#area_type=offices&area_code=270000)（当サイトで表示形式を加工）
- 身長制限・チャイルドスイッチ: [USJ公式の身長制限](https://www.usj.co.jp/web/ja/jp/attractions/requirements/height-restriction)、[チャイルドスイッチ](https://www.usj.co.jp/web/ja/jp/attractions/how-to-fun/child-switch)

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
