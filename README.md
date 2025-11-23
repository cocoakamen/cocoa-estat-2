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

### 2. `estat-config.json` (取得設定)
プロジェクトルートに `estat-config.json` を作成し、取得したい市町村と統計データの設定を記述してください。

```json
{
  "cityCode": "33214",
  "targets": [
    {
      "statsDataId": "0000020202",
      "cdCat01": "B1106"
    },
    {
      "statsDataId": "0003412313"
    }
  ]
}
```

- `cityCode`: データを取得したい市町村のコード（総務省の全国地方公共団体コード）。文字列で指定します。
- `targets`: 取得したい統計データのリスト。
  - `statsDataId`: 統計データID（必須）。
  - その他、APIのパラメータ（`cdCat01` など）を自由に追加できます。

## 使い方

以下のコマンドを実行すると、データ取得が開始されます。

```bash
npm start
```

## 出力ファイル

- **CSVデータ**: `output/estat_data_YYYYMMDD_HHmmss.csv`
- **ログ**: `logs/app.log`
