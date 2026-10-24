import { CampusEvent, EventCategory, EventStatus } from '../types/campus';

export const EVENT_CATEGORIES: EventCategory[] = [
  'Workshops',
  'Hackathons',
  'Seminars & conferences',
  'Competitions',
  'Career & internships',
  'Club activities',
  'Cultural programs',
  'Sports',
  'Academic',
  'Other',
];

export function isSafeHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

export function getEventStatus(event: CampusEvent, now = Date.now()): EventStatus {
  if (event.cancelled) return 'cancelled';
  const start = Date.parse(event.startDate);
  const end = Date.parse(event.endDate);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return 'completed';
  if (now < start) return 'upcoming';
  if (now <= end) return 'ongoing';
  return 'completed';
}

function escapeIcs(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

export function buildCalendarContent(event: CampusEvent, createdAt = new Date()): string {
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end <= start) {
    throw new Error('This event has invalid dates and cannot be added to a calendar.');
  }
  const toUtc = (date: Date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CampusPulse//Campus Events//EN',
    'BEGIN:VEVENT',
    `UID:${escapeIcs(event.id)}@campuspulse.local`,
    `DTSTAMP:${toUtc(createdAt)}`,
    `DTSTART:${toUtc(start)}`,
    `DTEND:${toUtc(end)}`,
    `SUMMARY:${escapeIcs(event.title)}`,
    `DESCRIPTION:${escapeIcs(event.description)}`,
    `LOCATION:${escapeIcs(event.venue)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}
