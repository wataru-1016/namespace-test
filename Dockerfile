# Node.js 18のLTSイメージを使用
FROM node:18-alpine

# 作業ディレクトリを設定
WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm ci --only=production

# アプリケーションのソースコードをコピー
COPY . .

# アプリケーションを実行するポートを公開
EXPOSE 3000

# 本番環境用の環境変数を設定
ENV NODE_ENV=production

# アプリケーションを起動
CMD ["npm", "start"]
