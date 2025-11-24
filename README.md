# e-Stat Data Fetcher (cocoa-estat-2)

e-Statの公式APIを使って、指定した市町村の統計データを取得し、CSVファイルとして保存するNode.jsアプリケーションです。

## 概要

- **目的**: 指定した1つの市町村に対して、複数の統計データ（人口、森林面積など）をまとめて取得・保存する。
- **出力**: 
  - `output/` ディレクトリにCSVファイルを出力。
  - `logs/` ディレクトリに実行ログを出力。

## 前提条件

- Node.js がインストールされていること。
- e-StatのAPIキー（アプリケーションID）を取得していること。
  - [e-Stat API利用ガイド](https://www.e-stat.go.jp/api/api-info/api-guide)

## セットアップ

1. リポジトリをクローンまたはダウンロードします。
2. 依存パッケージをインストールします。
   ```bash
   npm install
   ```
3. 設定ファイルを作成します。

### 1. `secret.json` (APIキー設定)
プロジェクトルートに `secret.json` を作成し、APIキー（アプリケーションID）を記述してください。

```json
{
  "appId": "YOUR_API_KEY_HERE"
}
```

### 2. `configs/estat-config.json` (取得設定)
`configs` ディレクトリ内に `estat-config.json` (または任意の名前) を作成し、取得したい市町村と統計データの設定を記述してください。
**ファイル名は任意で、実行時に指定可能です。**

```json
{
  "cityCode": "33214",
  "targets": [
    {
      "description": "森林面積",
      "statsDataId": "0000020202",
      "cdCat01": "B1106"
    },
    {
      "description": "総人口",
      "statsDataId": "0000020201",
      "cdCat01": "A1101"
    }
  ]
}
```

- `cityCode`: データを取得したい市町村のコード（総務省の全国地方公共団体コード）。文字列で指定します。
- `targets`: 取得したい統計データのリスト。
  - `description`: データの説明（ログ表示用）。
  - `statsDataId`: 統計データID（必須）。
  - その他、APIのパラメータ（`cdCat01` など）を自由に追加できます。

## 使い方

### デフォルト設定 (`configs/estat-config.json`) を使う場合

```bash
npm start
```

### 別の設定ファイルを使う場合

設定ファイルのパスを引数として渡します。

```bash
npm start -- configs/another-city.json
```
※ `npm start` で引数を渡す場合は `--` が必要です。
または
```bash
node index.js configs/another-city.json
```

## 出力ファイル

- **CSVデータ**: `output/estat_data_YYYYMMDD_HHmmss.csv`
- **ログ**: `logs/app.log`

## 開発者向けガイド

このアプリケーションをメンテナンス・拡張する方向けの情報です。

### ファイル構成

```text
.
├── configs/             # 設定ファイル置き場
│   ├── estat-config.json # デフォルト設定
│   └── ...
├── logs/                # 実行ログ出力先
├── output/              # CSVデータ出力先
├── src/                 # ソースコード
│   ├── api.js           # API通信・データ処理ロジック
│   ├── config.js        # 設定読み込み・バリデーション
│   └── io.js            # ファイル入出力（CSV, ログ）
├── index.js             # エントリーポイント（メイン処理）
├── secret.json          # APIキー（Git管理外）
└── package.json         # 依存ライブラリ定義
```

### 各モジュールの役割

- **`index.js`**: アプリケーションのメインフローを制御します。設定の読み込み、API呼び出しのループ、結果の保存を順に行います。
- **`src/api.js`**: e-Stat APIへのリクエストを行い、レスポンスを整形します。
  - **ポイント**: 取得したデータの中から、各カテゴリの「最新時点」のデータのみを抽出するフィルタリング処理が含まれています。
- **`src/config.js`**: `secret.json` と指定された設定ファイル（`configs/*.json`）を読み込み、結合して返します。必須項目のチェックもここで行います。
- **`src/io.js`**: CSVファイルの生成と、ログ出力の設定を行います。

### メンテナンスのポイント

1. **新しい統計データを追加したい場合**
   - コードの修正は不要です。`configs/` 配下の設定ファイルに `targets` を追加してください。
   - `statsDataId` は e-Stat のURLなどから特定できます。
   - 必要に応じて `cdCat01` (カテゴリ) や `cdTimeFrom` (開始時期) を指定して、取得データを絞り込んでください。

2. **APIの仕様変更があった場合**
   - `src/api.js` の `fetchData` 関数を修正してください。
   - 特にレスポンスの構造（`GET_STATS_DATA` 配下）が変わった場合は、パース処理の修正が必要です。

3. **レートリミットについて**
   - e-Stat APIにはアクセス制限があります。短時間に大量のリクエストを送るとエラーになる可能性があります。
   - 現状はウェイト処理などを入れていないため、大量の `targets` を設定する場合は注意してください。
