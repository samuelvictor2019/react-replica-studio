const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/database.db');

db.all('SELECT collection, COUNT(*) as count FROM content WHERE status = "published" GROUP BY collection', (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Published content counts:', rows);
  }
  db.close();
});