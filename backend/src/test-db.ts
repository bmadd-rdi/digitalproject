import postgres from 'postgres';

const users = ['postgres', 'admin', 'bma_app'];
const passwords = ['postgres', 'admin', 'root', '123456', 'password123', 'password', 'bma_app'];

async function test() {
  for (const user of users) {
    for (const pass of passwords) {
      try {
        const sql = postgres(`postgresql://${user}:${pass}@localhost:5432/postgres`, { connect_timeout: 2 });
        await sql`SELECT 1`;
        console.log(`SUCCESS: user=${user} pass=${pass}`);
        await sql.end();
        process.exit(0);
      } catch (e: any) {
        // try next
      }
    }
  }
  console.log('NO MATCHING CREDENTIALS FOUND');
  process.exit(1);
}

test();
