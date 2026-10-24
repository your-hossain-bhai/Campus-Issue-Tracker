import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CampusEvent } from '../types/campus';
import { buildCalendarContent, getEventStatus, isSafeHttpUrl } from './campusEvents';

const event: CampusEvent = {
  id: 'test-event',
  title: 'A, test event',
  description: 'Details; one\\ntwo',
  category: 'Workshops',
  organizer: 'Demo Club',
  startDate: '2026-11-14T10:00:00.000Z',
  endDate: '2026-11-14T13:00:00.000Z',
  venue: 'Room 1, Building A',
  reviewStatus: 'approved',
  demoInterestedCount: 0,
  demoGoingCount: 0,
  createdAt: '2026-10-01T00:00:00.000Z',
};

test('event status uses start/end boundaries and cancellation', () => {
  assert.equal(getEventStatus(event, Date.parse('2026-11-14T09:59:59.000Z')), 'upcoming');
  assert.equal(getEventStatus(event, Date.parse('2026-11-14T11:00:00.000Z')), 'ongoing');
  assert.equal(getEventStatus(event, Date.parse('2026-11-14T13:00:01.000Z')), 'completed');
  assert.equal(getEventStatus({ ...event, cancelled: true }), 'cancelled');
  assert.equal(getEventStatus({ ...event, startDate: 'invalid' }), 'completed');
});

test('only HTTP and HTTPS links are accepted', () => {
  assert.equal(isSafeHttpUrl('https://example.com/events'), true);
  assert.equal(isSafeHttpUrl('http://example.com/events'), true);
  assert.equal(isSafeHttpUrl('javascript:alert(1)'), false);
  assert.equal(isSafeHttpUrl('/events'), false);
});

test('calendar export is valid UTC iCalendar text with escaped values', () => {
  const content = buildCalendarContent(event, new Date('2026-10-24T00:00:00.000Z'));
  assert.match(content, /BEGIN:VCALENDAR\r\nVERSION:2\.0/);
  assert.match(content, /DTSTART:20261114T100000Z/);
  assert.match(content, /SUMMARY:A\\, test event/);
  assert.match(content, /LOCATION:Room 1\\, Building A/);
  assert.match(content, /END:VEVENT\r\nEND:VCALENDAR$/);
});

test('calendar export rejects invalid or non-positive event durations', () => {
  assert.throws(() => buildCalendarContent({ ...event, startDate: 'invalid' }), /invalid dates/);
  assert.throws(() => buildCalendarContent({ ...event, endDate: event.startDate }), /invalid dates/);
});
