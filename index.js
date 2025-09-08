const {
  createDatabaseConnection,
  createTestTable,
  insertTestData,
  getTestMessages
} = require('./database');

async function main() {
  let client;

  try {
    console.log('Starting database test application...');

    // データベース接続
    client = await createDatabaseConnection();
    console.log('Connected to database successfully');

    // テーブル作成
    await createTestTable(client);

    // テストデータ挿入
    await insertTestData(client);

    // データ取得・表示
    const messages = await getTestMessages(client);

    console.log('\n=== Database Test Results ===');
    console.log(`Found ${messages.length} messages:`);

    messages.forEach((message, index) => {
      console.log(`${index + 1}. [ID: ${message.id}] ${message.message}`);
      console.log(`   Created at: ${message.created_at}`);
    });

    console.log('=============================\n');
    console.log('Database test completed successfully!');

  } catch (error) {
    console.error('Database test failed:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      await client.end();
      console.log('Database connection closed');
    }
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
