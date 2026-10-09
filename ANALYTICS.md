# アクセス解析の運用設計（2026-10-09）

## 何を数えるか

- サイト全体のアクセス傾向は Cloudflare Web Analytics を参照する。GA4 は「解析を許可」した閲覧者だけを計測するため、両者の人数を合算・同一母数で比較しない。
- GA4 のユーザー、セッション、ページビュー、参照元、端末を基本指標とする。拡張計測はページ閲覧・スクロール・離脱クリック等を受信する。`/plan` の日付選択が URL を書き換えてもページビューにしないよう、ブラウザー履歴変更による自動ページビューは GA4 側で無効化した。
- 5分ごとの待ち時間更新は閲覧行動イベントを送らない。イベントは人が明示的に操作したときだけ送る。
- 計測開始前の閲覧や、拒否した閲覧者の行動は GA4 から復元できない。

## サイト固有のイベント

| イベント | 数える操作 | 主なパラメータ |
|---|---|---|
| `favorite_add` / `favorite_remove` | お気に入りの登録・解除 | `ride_id` |
| `ride_detail_open` | 待ち時間カードのグラフ・履歴を開く | `ride_id` |
| `view_mode_change` | カード・ヒートマップ、過去グラフ・表、ショー、地図の表示切替 | `view_mode` |
| `filter_apply` | 身長、チャイルドスイッチ、お気に入り、特徴、並び順、地図の飲食店表示の変更 | `filter_type` |
| `archive_past_select` / `archive_future_select` | 過去実績日・予定日をカレンダーから選ぶ | なし |
| `map_place_open` | 地図上のアトラクション・飲食店の詳細を開く | `place_type`, 該当時 `ride_id` |
| `map_location_request` / `map_location_success` / `map_location_failure` | GPSボタンの押下と結果 | なし |
| `walking_route_open` | 徒歩ルートへのリンクを押す | `place_type` |
| `share_click` | LINE・X・その他の共有操作を押す（投票ページを含む） | `share_channel`, `content_type`, 該当時 `ride_id` |

`share_click` は投稿・送信の完了数ではない。`walking_route_open` は実際の来店・乗車を意味しない。GA4 の自動 `click`（外部リンク）とサイト固有の `share_click` を加算しない。

GA4 のイベントスコープのカスタム ディメンションには `ride_id`、`view_mode`、`filter_type`、`place_type`、`share_channel`、`content_type` を登録済み。施設IDは公開データのIDに限る。GPS座標・精度、氏名、メールアドレス、お気に入り一覧は送らない。`public/analytics.js` はイベント名・パラメータ値を許可リストで制限する。

## 設定と品質確認

- GA4プロパティ `uniba-waittimes.com`、測定ID `G-9DC2RDYPXX`。個人サイト専用アカウントで運用する。
- GA4のイベントデータ・ユーザーデータの保持はともに14か月。設定の適用には最大24時間かかる。通常の集計レポートと探索レポートでは保持の影響が異なる。
- 既定の `Internal Traffic` フィルタはテスト状態。固定IPがないため、これを無条件で有効にしない。運営者は確認に使う端末・ブラウザーごとに `/privacy` から「許可しない」を選び、自分の行動がGA4に入らないようにする。テスト時のみ許可した場合、そのテストデータは集計に残る。
- 公開後は、許可前にGoogleタグがないこと、許可後のイベント受信、拒否後の停止、日付選択によるページビュー増加がないことを確認する。GA4管理画面のストリーム診断表示は新設直後に遅れることがあるため、リアルタイム受信と翌日の標準レポートを併せて確認する。
- 月次確認では、閲覧規模、参照元、端末、主要操作イベントを確認する。データが少ない期間は割合の上下を結論にせず、実数と計測条件を併記する。

## X自動投稿からの流入

- 待ち時間上位5施設の投稿URLには `utm_source=x&utm_medium=social&utm_campaign=live_waits`、混雑実績の投稿URLには `utm_source=x&utm_medium=social&utm_campaign=daily_recap` を付ける。表記は小文字で固定する。
- サイト内のX共有ボタンには同じ参照元・メディアと、内容別の `utm_campaign`（`share_site`、`share_top_waits`、`share_ride`、`share_archive_day`、`share_map`、`share_map_ride`、`share_poll`）を付ける。LINE・Threads・コピーのURLには付けない。
- GA4の「レポート > 集客 > トラフィック獲得」でセッションの参照元・メディアとキャンペーンを確認する。X上の閲覧数やリンククリック数とは異なり、GA4は解析を許可したサイト訪問のみを数える。
- Xはリンクを投稿文字数上23文字として扱うため、長いUTM付きURLでも本文の文字数判定には23文字を使う。出典: [GA4 URLビルダー](https://support.google.com/analytics/answer/10917952)、[Xのリンク投稿](https://help.x.com/en/using-twitter/how-to-tweet-a-link.html)（2026-10-10確認）。
