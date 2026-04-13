const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'cms.sqlite');
const db = new Database(dbPath);

// Sample events data
const sampleEvents = [
  {
    title: "Sunday Worship Service",
    description: "Join us for our weekly worship service with powerful praise and worship, inspiring messages, and community fellowship.",
    startDate: "2024-12-29T10:00:00.000Z",
    endDate: "2024-12-29T12:00:00.000Z",
    location: "Main Sanctuary, WGC Church",
    type: "worship",
    status: "published",
    bannerImageUrl: "/assets/event-1.png",
    price: 0,
    capacity: 500
  },
  {
    title: "Youth Conference 2024",
    description: "A special youth conference focused on spiritual growth, leadership development, and building lasting friendships.",
    startDate: "2024-12-30T18:00:00.000Z",
    endDate: "2024-12-30T22:00:00.000Z",
    location: "Youth Center, WGC Church",
    type: "conference",
    status: "published",
    bannerImageUrl: "/assets/event-2.png",
    price: 25,
    capacity: 200
  },
  {
    title: "Christmas Carol Service",
    description: "Celebrate the Christmas season with beautiful carols, special music, and a message of hope and joy.",
    startDate: "2024-12-24T19:00:00.000Z",
    endDate: "2024-12-24T21:00:00.000Z",
    location: "Main Sanctuary, WGC Church",
    type: "special",
    status: "published",
    bannerImageUrl: "/assets/event-experience.png",
    price: 0,
    capacity: 400
  },
  {
    title: "Prayer and Fasting Week",
    description: "Join us for a week of focused prayer and fasting as we seek God's guidance and blessing for the coming year.",
    startDate: "2025-01-01T00:00:00.000Z",
    endDate: "2025-01-07T23:59:59.000Z",
    location: "Various locations",
    type: "prayer",
    status: "published",
    bannerImageUrl: "/assets/welcome-1.png",
    price: 0,
    capacity: null
  },
  {
    title: "New Year's Eve Watch Night",
    description: "Ring in the new year with prayer, worship, and fellowship as we thank God for the past year and look forward to the future.",
    startDate: "2024-12-31T22:00:00.000Z",
    endDate: "2025-01-01T01:00:00.000Z",
    location: "Main Sanctuary, WGC Church",
    type: "special",
    status: "published",
    bannerImageUrl: "/assets/community-1.png",
    price: 0,
    capacity: 300
  }
];

try {
  // Insert sample events
  const insertEvent = db.prepare(`
    INSERT INTO content_items (id, collection, title, slug, status, payload_json, created_by, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  sampleEvents.forEach(event => {
    const now = new Date().toISOString();
    const id = require('crypto').randomUUID();
    const slug = event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    insertEvent.run(
      id,
      'events',
      event.title,
      slug,
      event.status,
      JSON.stringify(event),
      'admin@wgc.local',
      now,
      now
    );
  });

  console.log(`✅ Added ${sampleEvents.length} sample events to the database`);

  // Verify the events were added
  const events = db.prepare('SELECT id, title, status FROM content_items WHERE collection = ?').all('events');
  console.log('📋 Current events in database:');
  events.forEach(event => {
    console.log(`  - ${event.title} (${event.status})`);
  });

} catch (error) {
  console.error('❌ Error adding sample events:', error);
} finally {
  db.close();
}