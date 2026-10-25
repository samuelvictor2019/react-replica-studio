import * as fs from 'node:fs';
import * as path from 'node:path';
import * as handlebars from 'handlebars';

const templateDirectory = path.join(__dirname, 'templates');
const templateNames = fs
  .readdirSync(templateDirectory)
  .filter((file) => file.endsWith('.hbs'))
  .map((file) => path.basename(file, '.hbs'));

const sampleContext = {
  appName: 'WaterGate Church Community',
  firstName: 'Jordan',
  guestName: 'Jordan',
  recipientName: 'Jordan',
  fullName: 'Jordan Smith',
  ministerTitle: 'Pastor',
  ministerName: 'Taylor Morgan',
  sessionDate: 'Sunday, November 15, 2026',
  sessionTime: '11:30',
  durationMinutes: 30,
  purpose: 'Prayer and conversation',
  sessionId: 'SESSION-2048',
  title: 'Ethanim Gathering',
  programName: 'Community Sunday',
  eventName: 'Community Sunday',
  eventDate: 'November 15, 2026',
  eventTime: '10:00 am',
  timeRemaining: 'one week',
  daysRemaining: 7,
  location: 'Main Hall',
  startDate: '2026-11-15T10:00:00.000Z',
  endDate: '2026-11-15T15:00:00.000Z',
  selectedDays: ['2026-11-15T10:00:00.000Z'],
  registrationId: 'unused-legacy-id',
  ticketNumber: 'ETHANIM2601',
  registrationSequence: 1,
  formType: 'NEW_COMERS',
  subject: 'A note from WaterGate',
  category: 'LEADERSHIP_UPDATE',
  priority: 'NORMAL',
  htmlContent: '<p>A sample message for preview.</p>',
  preheader: 'A short preview message',
  description: 'A sample description.',
  reason: 'Schedule change',
  weekMessage: 'Have a thoughtful week.',
  monthMessage: 'May this month bring hope.',
  monthName: 'November',
  bibleVerse: 'Be strong and courageous.',
  bibleReference: 'Joshua 1:9',
  checklistItems: ['Bring your registration details'],
  actionUrl: 'https://example.com/event',
  bannerImageUrl: 'https://example.com/banner.jpg',
  year: 2026,
};

describe('email templates', () => {
  beforeAll(() => {
    handlebars.registerHelper('formatDate', (value: string) =>
      value ? new Date(value).toLocaleDateString('en-US') : '',
    );
    handlebars.registerHelper('formatGuid', (value: string) =>
      value ? value.split('-')[0].toUpperCase() : '',
    );
  });

  it.each(templateNames)('%s compiles and renders valid HTML', (templateName) => {
    const source = fs.readFileSync(
      path.join(templateDirectory, `${templateName}.hbs`),
      'utf8',
    );
    const rendered = handlebars.compile(source)(sampleContext);

    expect(rendered).toContain('<html lang="en">');
    expect(rendered).toContain('</html>');
  });

  it('renders the current ticket number instead of a legacy registration ID', () => {
    const source = fs.readFileSync(
      path.join(templateDirectory, 'registration-confirmation.hbs'),
      'utf8',
    );
    const rendered = handlebars.compile(source)(sampleContext);

    expect(rendered).toContain('ETHANIM2601');
    expect(rendered).not.toContain('unused-legacy-id');
  });
});
