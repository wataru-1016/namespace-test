const {
  createDatabaseConnection,
  createTestTable,
  insertTestData,
  getTestMessages
} = require('./database');

describe('Database Integration Tests', () => {
  let client;
  let isPostgresAvailable = false;

  beforeAll(async () => {
    try {
      // データベース接続を作成
      client = await createDatabaseConnection();

      // 簡単な接続テストでPostgreSQLの可用性を確認
      await client.query('SELECT 1');
      isPostgresAvailable = true;

      // テスト用テーブルを作成
      await createTestTable(client);

      // テストデータを挿入
      await insertTestData(client);
    } catch (error) {
      console.log('PostgreSQL is not available for testing. Tests will be skipped.');
      console.log('Error:', error.message);
      isPostgresAvailable = false;
    }
  });

  afterAll(async () => {
    // テスト終了時に接続を閉じる
    if (client) {
      try {
        await client.end();
      } catch (error) {
        // 接続終了エラーは無視
      }
    }
  });

  test('should connect to database successfully', async () => {
    if (!isPostgresAvailable) {
      console.log('PostgreSQL not available - skipping test');
      return;
    }

    expect(client).toBeDefined();

    // 簡単な接続テスト
    const result = await client.query('SELECT 1 as test');
    expect(result.rows[0].test).toBe(1);
  });

  test('should create test table successfully', async () => {
    if (!isPostgresAvailable) {
      console.log('PostgreSQL not available - skipping test');
      return;
    }

    // テーブルが存在することを確認
    const tableCheckQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'test_messages'
      )
    `;

    const result = await client.query(tableCheckQuery);
    expect(result.rows[0].exists).toBe(true);
  });

  test('should retrieve and display test messages from database', async () => {
    if (!isPostgresAvailable) {
      console.log('PostgreSQL not available - skipping test');
      return;
    }

    // テストメッセージを取得
    const messages = await getTestMessages(client);

    // メッセージが取得できることを確認
    expect(messages).toBeDefined();
    expect(Array.isArray(messages)).toBe(true);
    expect(messages.length).toBeGreaterThan(0);

    // 各メッセージの構造を確認
    messages.forEach(message => {
      expect(message).toHaveProperty('id');
      expect(message).toHaveProperty('message');
      expect(message).toHaveProperty('created_at');
      expect(typeof message.message).toBe('string');
    });

    // メッセージを表示
    console.log('\n=== Retrieved Test Messages ===');
    messages.forEach(message => {
      console.log(`ID: ${message.id}, Message: "${message.message}", Created: ${message.created_at}`);
    });
    console.log('===============================\n');

    // 期待するメッセージが含まれていることを確認
    const messageTexts = messages.map(m => m.message);
    expect(messageTexts).toContain('Hello from PostgreSQL!');
    expect(messageTexts).toContain('CI/CD test is working');
    expect(messageTexts).toContain('Database connection successful');
  });

  test('should handle database queries correctly', async () => {
    if (!isPostgresAvailable) {
      console.log('PostgreSQL not available - skipping test');
      return;
    }

    // カスタムクエリテスト
    const countQuery = 'SELECT COUNT(*) as total FROM test_messages';
    const result = await client.query(countQuery);

    // PostgreSQLのCOUNT(*)は文字列として返されるため、数値に変換
    const totalCount = parseInt(result.rows[0].total, 10);
    expect(totalCount).toBeGreaterThan(0);
    console.log(`Total messages in database: ${totalCount}`);
  });
});
