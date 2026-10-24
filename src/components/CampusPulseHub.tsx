import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Bookmark,
  CalendarDays,
  Check,
  Clock3,
  ExternalLink,
  MapPin,
  Plus,
  Search,
  Share2,
  Users,
  X,
} from 'lucide-react';
import { DEMO_CLUBS, DEMO_EVENTS } from '../data/mockCampus';
import { CampusClub, CampusEvent, CampusSection, EventCategory, EventDraft, EventRsvp } from '../types/campus';
import { CampusIssue } from '../types';
import { buildCalendarContent, EVENT_CATEGORIES, getEventStatus, isSafeHttpUrl } from '../utils/campusEvents';

type Section = CampusSection;
type EventStatusFilter = 'all' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
type ActivityFilter = 'saved' | 'interested' | 'going' | 'submitted';

interface CampusPulseHubProps {
  section: Section;
  onNavigate: (section: Section) => void;
  issues: CampusIssue[];
  myIssueIds: string[];
  onSelectIssue: (issue: CampusIssue) => void;
  onReportIssue: () => void;
}

const EVENTS_KEY = 'campuspulse_submitted_events_v1';
const BOOKMARKS_KEY = 'campuspulse_saved_events_v1';
const RSVP_KEY = 'campuspulse_event_rsvps_v1';

const emptyDraft: EventDraft = {
  title: '',
  description: '',
  category: 'Workshops',
  organizer: '',
  startDate: '',
  endDate: '',
  venue: '',
  coverImageUrl: '',
  registrationUrl: '',
  registrationDeadline: '',
  capacity: '',
};

function readLocal<T>(key: string, fallback: T, validate: (value: unknown) => value is T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    return validate(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isRsvpMap(value: unknown): value is Record<string, EventRsvp> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every((item) => item === 'interested' || item === 'going')
  );
}

function isCampusEvent(value: unknown): value is CampusEvent {
  if (!value || typeof value !== 'object') return false;
  const event = value as Partial<CampusEvent>;
  const startTime = typeof event.startDate === 'string' ? Date.parse(event.startDate) : Number.NaN;
  const endTime = typeof event.endDate === 'string' ? Date.parse(event.endDate) : Number.NaN;
  return (
    typeof event.id === 'string' &&
    typeof event.title === 'string' && Boolean(event.title.trim()) &&
    typeof event.description === 'string' &&
    EVENT_CATEGORIES.includes(event.category as EventCategory) &&
    typeof event.organizer === 'string' && Boolean(event.organizer.trim()) &&
    Number.isFinite(startTime) &&
    Number.isFinite(endTime) &&
    endTime > startTime &&
    typeof event.venue === 'string' && Boolean(event.venue.trim()) &&
    (event.coverImageUrl === undefined || typeof event.coverImageUrl === 'string') &&
    (event.registrationUrl === undefined || typeof event.registrationUrl === 'string') &&
    (event.registrationDeadline === undefined || (typeof event.registrationDeadline === 'string' && Number.isFinite(Date.parse(event.registrationDeadline)))) &&
    (event.capacity === undefined || (Number.isInteger(event.capacity) && event.capacity > 0)) &&
    (event.cancelled === undefined || typeof event.cancelled === 'boolean') &&
    (event.reviewStatus === 'pending' || event.reviewStatus === 'approved') &&
    typeof event.demoInterestedCount === 'number' && Number.isFinite(event.demoInterestedCount) && event.demoInterestedCount >= 0 &&
    typeof event.demoGoingCount === 'number' && Number.isFinite(event.demoGoingCount) && event.demoGoingCount >= 0 &&
    typeof event.createdAt === 'string' && Number.isFinite(Date.parse(event.createdAt))
  );
}

function isEventArray(value: unknown): value is CampusEvent[] {
  return Array.isArray(value) && value.every(isCampusEvent);
}

function safeUrl(value: string): boolean {
  return isSafeHttpUrl(value);
}

function eventStatus(event: CampusEvent, now = Date.now()): Exclude<EventStatusFilter, 'all'> {
  return getEventStatus(event, now);
}

function formatDate(value: string, options: Intl.DateTimeFormatOptions = {}) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return 'Date to be confirmed';
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  }).format(date);
}

function downloadCalendar(event: CampusEvent) {
  const content = buildCalendarContent(event);
  const url = URL.createObjectURL(new Blob([content], { type: 'text/calendar;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'campus-event'}.ics`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function EventDate({ event }: { event: CampusEvent }) {
  const date = new Date(event.startDate);
  return (
    <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
      <span className="text-[10px] font-bold uppercase">{Number.isFinite(date.getTime()) ? date.toLocaleDateString(undefined, { month: 'short' }) : 'TBA'}</span>
      <span className="text-xl font-extrabold leading-5">{Number.isFinite(date.getTime()) ? date.getDate() : '—'}</span>
    </div>
  );
}

function EventCard({
  event,
  rsvp,
  saved,
  onSelect,
  onToggleSave,
}: {
  event: CampusEvent;
  rsvp?: EventRsvp;
  saved: boolean;
  onSelect: () => void;
  onToggleSave: () => void;
}) {
  const status = getEventStatus(event);
  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      {event.coverImageUrl && isSafeHttpUrl(event.coverImageUrl) && <img src={event.coverImageUrl} alt="" className="mb-3 max-h-44 w-full rounded-xl object-cover" onError={(imageEvent) => { imageEvent.currentTarget.hidden = true; }} />}
      <div className="flex gap-3">
        <EventDate event={event} />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800">{event.category}</span>
            <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-bold text-stone-600">Demo listing</span>
            {event.reviewStatus === 'pending' && <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-900">Pending review</span>}
            {status === 'cancelled' && <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[11px] font-bold text-rose-800">Cancelled</span>}
            {rsvp && <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold capitalize text-blue-800">{rsvp}</span>}
          </div>
          <button className="text-left text-base font-extrabold leading-snug text-stone-900 hover:text-emerald-800" onClick={onSelect}>{event.title}</button>
          <p className="mt-1 text-xs text-stone-600">Organized by <span className="font-semibold text-stone-800">{event.organizer}</span></p>
        </div>
        <button
          type="button"
          aria-label={saved ? 'Remove saved event' : 'Save event'}
          title={saved ? 'Remove saved event' : 'Save event'}
          onClick={onToggleSave}
          className={`h-9 w-9 shrink-0 rounded-xl border flex items-center justify-center ${saved ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-stone-200 text-stone-500 hover:bg-stone-50'}`}
        >
          <Bookmark className="h-4 w-4" fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>
      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-stone-600">{event.description}</p>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-stone-500">
        <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" />{formatDate(event.startDate, { hour: 'numeric', minute: '2-digit' })}</span>
        <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{event.venue}</span>
        <span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />{event.demoInterestedCount + event.demoGoingCount} demo responses</span>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-3">
        <span className="text-[11px] font-medium text-stone-500">
          {event.registrationDeadline ? `Registration deadline: ${formatDate(event.registrationDeadline)}` : 'Sample event listing'}
        </span>
        <button type="button" onClick={onSelect} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-50">
          Event details <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </article>
  );
}

export function CampusPulseHub({
  section,
  onNavigate,
  issues,
  myIssueIds,
  onSelectIssue,
  onReportIssue,
}: CampusPulseHubProps) {
  const [submittedEvents, setSubmittedEvents] = useState<CampusEvent[]>(() => readLocal(EVENTS_KEY, [], isEventArray));
  const [savedIds, setSavedIds] = useState<string[]>(() => readLocal(BOOKMARKS_KEY, [], isStringArray));
  const [rsvps, setRsvps] = useState<Record<string, EventRsvp>>(() => readLocal(RSVP_KEY, {}, isRsvpMap));
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'all' | EventCategory>('all');
  const [statusFilter, setStatusFilter] = useState<EventStatusFilter>('upcoming');
  const [sortOrder, setSortOrder] = useState<'date' | 'recent'>('date');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [activeEvent, setActiveEvent] = useState<CampusEvent | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [draft, setDraft] = useState<EventDraft>(emptyDraft);
  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState('');
  const [clubSearch, setClubSearch] = useState('');
  const [clubCategory, setClubCategory] = useState('all');
  const [selectedClub, setSelectedClub] = useState<CampusClub | null>(null);
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>('saved');
  const [activityTiming, setActivityTiming] = useState<'all' | 'upcoming' | 'past'>('all');

  const allEvents = useMemo(() => [...submittedEvents, ...DEMO_EVENTS], [submittedEvents]);
  useEffect(() => {
    const prefix = '#event-';
    if (!window.location.hash.startsWith(prefix)) return;
    try {
      const eventId = decodeURIComponent(window.location.hash.slice(prefix.length));
      const matched = allEvents.find((event) => event.id === eventId);
      if (matched) setActiveEvent(matched);
    } catch {
      notify('The shared event link is invalid.');
    }
  }, [allEvents]);
  useEffect(() => {
    if (!activeEvent && !showEventForm) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveEvent(null);
        setShowEventForm(false);
      }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [activeEvent, showEventForm]);
  const visibleEvents = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return allEvents
      .filter((event) => event.reviewStatus === 'approved')
      .filter((event) => {
        const matchesText = !query || [event.title, event.organizer, event.description, event.venue].some((value) => value.toLocaleLowerCase().includes(query));
        const matchesCategory = category === 'all' || event.category === category;
        const status = getEventStatus(event);
        const matchesStatus = statusFilter === 'all' || status === statusFilter;
        const date = Date.parse(event.startDate);
        const matchesFrom = !dateFrom || date >= new Date(`${dateFrom}T00:00:00`).getTime();
        const matchesTo = !dateTo || date <= new Date(`${dateTo}T23:59:59`).getTime();
        return matchesText && matchesCategory && matchesStatus && matchesFrom && matchesTo;
      })
      .sort((a, b) => sortOrder === 'date' ? Date.parse(a.startDate) - Date.parse(b.startDate) : Date.parse(b.createdAt) - Date.parse(a.createdAt));
  }, [allEvents, category, dateFrom, dateTo, search, sortOrder, statusFilter]);

  const upcomingEvents = useMemo(
    () => allEvents.filter((event) => event.reviewStatus === 'approved' && ['upcoming', 'ongoing'].includes(getEventStatus(event))).sort((a, b) => Date.parse(a.startDate) - Date.parse(b.startDate)),
    [allEvents],
  );
  const filteredClubs = useMemo(() => DEMO_CLUBS.filter((club) => {
    const query = clubSearch.trim().toLowerCase();
    const matchesQuery = !query || `${club.name} ${club.category} ${club.description}`.toLowerCase().includes(query);
    return matchesQuery && (clubCategory === 'all' || club.category === clubCategory);
  }), [clubCategory, clubSearch]);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast((current) => current === message ? '' : current), 3200);
  }

  function persist<T>(key: string, value: T, setValue: React.Dispatch<React.SetStateAction<T>>, message: string) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      setValue(value);
      notify(message);
    } catch {
      notify('Your browser could not save this change. Check local storage availability.');
    }
  }

  function toggleSaved(id: string) {
    const next = savedIds.includes(id) ? savedIds.filter((item) => item !== id) : [...savedIds, id];
    persist(BOOKMARKS_KEY, next, setSavedIds, next.includes(id) ? 'Event saved on this browser.' : 'Event removed from saved activities.');
  }

  function setRsvp(id: string, selection?: EventRsvp) {
    const next = { ...rsvps };
    if (selection && rsvps[id] !== selection) next[id] = selection;
    else delete next[id];
    persist(RSVP_KEY, next, setRsvps, selection ? `Marked as ${selection}. This is a local demo RSVP.` : 'Your RSVP was removed.');
  }

  async function shareEvent(event: CampusEvent) {
    const url = `${window.location.origin}${window.location.pathname}#event-${encodeURIComponent(event.id)}`;
    try {
      if (navigator.share) {
        try {
          await navigator.share({ title: event.title, text: event.description, url });
          return;
        } catch (error) {
          if (error instanceof DOMException && error.name === 'AbortError') return;
        }
      }
      if (!navigator.clipboard) throw new Error('Sharing and clipboard are not available in this browser.');
      await navigator.clipboard.writeText(url);
      notify('Event link copied.');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      notify(error instanceof Error ? error.message : 'Could not share this event.');
    }
  }

  function submitEvent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');
    const start = new Date(draft.startDate);
    const end = new Date(draft.endDate);
    if (!draft.title.trim() || !draft.description.trim() || !draft.organizer.trim() || !draft.venue.trim()) {
      setFormError('Complete the title, description, organizer, dates, and venue.');
      return;
    }
    if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end <= start) {
      setFormError('Enter valid start and end times. The end must be after the start.');
      return;
    }
    if (draft.registrationDeadline) {
      const deadline = new Date(draft.registrationDeadline);
      if (!Number.isFinite(deadline.getTime()) || deadline > start) {
        setFormError('The registration deadline must be a valid date before the event starts.');
        return;
      }
    }
    for (const [value, label] of [[draft.coverImageUrl, 'Cover image'], [draft.registrationUrl, 'Registration']] as const) {
      if (value.trim() && !isSafeHttpUrl(value.trim())) {
        setFormError(`${label} URL must begin with http:// or https://.`);
        return;
      }
    }
    const capacity = draft.capacity.trim() ? Number(draft.capacity) : undefined;
    if (capacity !== undefined && (!Number.isInteger(capacity) || capacity < 1)) {
      setFormError('Capacity must be a whole number greater than zero.');
      return;
    }
    const submitted: CampusEvent = {
      id: `submitted-${crypto.randomUUID()}`,
      title: draft.title.trim(),
      description: draft.description.trim(),
      category: draft.category,
      organizer: draft.organizer.trim(),
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      venue: draft.venue.trim(),
      coverImageUrl: draft.coverImageUrl.trim() || undefined,
      registrationUrl: draft.registrationUrl.trim() || undefined,
      registrationDeadline: draft.registrationDeadline ? new Date(draft.registrationDeadline).toISOString() : undefined,
      capacity,
      reviewStatus: 'pending',
      demoInterestedCount: 0,
      demoGoingCount: 0,
      createdAt: new Date().toISOString(),
    };
    const next = [submitted, ...submittedEvents];
    try {
      window.localStorage.setItem(EVENTS_KEY, JSON.stringify(next));
    } catch {
      setFormError('This browser could not save the submission. Your event was not saved.');
      return;
    }
    setSubmittedEvents(next);
    setDraft(emptyDraft);
    setShowEventForm(false);
    notify('Event submitted as Pending Review on this browser.');
    onNavigate('activities');
    setActivityFilter('submitted');
  }

  function reviewSubmittedEvent(id: string, approve: boolean) {
    const next = submittedEvents.map((event) => event.id === id ? { ...event, reviewStatus: approve ? 'approved' as const : 'pending' as const } : event);
    try {
      window.localStorage.setItem(EVENTS_KEY, JSON.stringify(next));
      setSubmittedEvents(next);
      notify(approve ? 'Approved in this local demo only.' : 'Submission kept pending in this local demo.');
    } catch {
      notify('Could not save review changes to this browser.');
    }
  }

  function resetEventFilters() {
    setSearch('');
    setCategory('all');
    setStatusFilter('upcoming');
    setSortOrder('date');
    setDateFrom('');
    setDateTo('');
  }

  const myIssues = issues.filter((issue) => myIssueIds.includes(issue.id));
  const activityEvents = allEvents.filter((event) => {
    const matchesSelection = activityFilter === 'saved'
      ? savedIds.includes(event.id)
      : activityFilter === 'interested' || activityFilter === 'going'
        ? rsvps[event.id] === activityFilter
        : submittedEvents.some((submitted) => submitted.id === event.id);
    const status = getEventStatus(event);
    const matchesTiming = activityTiming === 'all'
      || (activityTiming === 'upcoming' && ['upcoming', 'ongoing'].includes(status))
      || (activityTiming === 'past' && status === 'completed');
    return matchesSelection && matchesTiming;
  }).sort((a, b) => Date.parse(a.startDate) - Date.parse(b.startDate));
  const announcementEvents = upcomingEvents.slice(0, 3);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-7">
      {section === 'home' && (
        <div className="space-y-7">
          <section className="relative isolate overflow-hidden rounded-3xl bg-stone-900 px-6 py-8 text-white shadow-sm sm:px-10 sm:py-10 lg:grid lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-10">
            <div className="pointer-events-none absolute -right-20 -top-32 -z-10 h-96 w-96 rounded-full border border-white/10" aria-hidden="true" />
            <div className="pointer-events-none absolute -right-5 -top-16 -z-10 h-64 w-64 rounded-full border border-white/10" aria-hidden="true" />
            <div className="relative">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Campus life, in one place</p>
              <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-[3.35rem] lg:leading-[1.08]">Your Campus. Your Community.</h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-200 sm:text-base">Discover campus events, connect with student clubs, and help make your university a better place.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button onClick={() => onNavigate('events')} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-stone-900 transition-colors hover:bg-stone-100 focus-visible:outline-white">
                  Explore Events <ArrowRight className="h-4 w-4" />
                </button>
                <button onClick={onReportIssue} className="rounded-xl border border-white/30 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/10">Report an Issue</button>
              </div>
              <p className="mt-5 text-[11px] text-slate-300">Demo listings are illustrative and are not verified university information.</p>
            </div>
            {announcementEvents[0] && (
              <button
                type="button"
                onClick={() => setActiveEvent(announcementEvents[0])}
                className="mt-8 w-full rounded-2xl border border-white/15 bg-white p-4 text-left text-stone-900 shadow-lg transition-transform hover:-translate-y-0.5 focus-visible:outline-white lg:mt-0"
                aria-label={`View featured event: ${announcementEvents[0].title}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="inline-flex items-center gap-2 text-xs font-semibold text-stone-500"><CalendarDays className="h-4 w-4 text-orange-600" /> Coming up on campus</span>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800">{announcementEvents[0].category}</span>
                </div>
                <h2 className="mt-5 text-xl font-extrabold leading-snug text-stone-900">{announcementEvents[0].title}</h2>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-stone-600">{announcementEvents[0].description}</p>
                <div className="mt-5 flex items-center justify-between border-t border-stone-100 pt-4 text-xs font-semibold text-stone-600">
                  <span className="inline-flex items-center gap-1.5"><Clock3 className="h-4 w-4" /> {formatDate(announcementEvents[0].startDate)}</span>
                  <span className="inline-flex items-center gap-1 text-orange-700">Event details <ArrowRight className="h-3.5 w-3.5" /></span>
                </div>
              </button>
            )}
          </section>

          <section>
            <SectionHeading title="Coming up" subtitle="A few demo events to get your campus calendar started." action="See all events" onAction={() => onNavigate('events')} />
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {upcomingEvents.slice(0, 3).map((event) => <EventCard key={event.id} event={event} rsvp={rsvps[event.id]} saved={savedIds.includes(event.id)} onSelect={() => setActiveEvent(event)} onToggleSave={() => toggleSaved(event.id)} />)}
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-stone-200 bg-white p-5">
              <SectionHeading title="Clubs to explore" subtitle="Sample organizations, clearly marked as demo listings." action="Browse clubs" onAction={() => onNavigate('clubs')} />
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {DEMO_CLUBS.slice(0, 2).map((club) => <button key={club.id} onClick={() => { setSelectedClub(club); onNavigate('clubs'); }} className="rounded-xl border border-stone-200 p-4 text-left hover:border-emerald-300 hover:bg-emerald-50/40"><span className="text-sm font-extrabold text-stone-900">{club.name}</span><span className="mt-1 block text-xs font-semibold text-emerald-800">{club.category} · demo listing</span><span className="mt-2 line-clamp-2 block text-xs leading-relaxed text-stone-600">{club.description}</span></button>)}
              </div>
            </section>
            <section className="rounded-2xl border border-stone-200 bg-white p-5">
              <SectionHeading title="Opportunities & notices" subtitle="Sample announcements based on listed demo events." action="View events" onAction={() => onNavigate('events')} />
              <div className="mt-3 divide-y divide-stone-100">
                {announcementEvents.map((event) => <button key={event.id} onClick={() => setActiveEvent(event)} className="flex w-full items-start gap-3 py-3 text-left hover:bg-stone-50"><span className="mt-0.5 rounded-lg bg-amber-50 p-2 text-amber-800"><CalendarDays className="h-4 w-4" /></span><span><span className="block text-sm font-bold text-stone-800">{event.title}</span><span className="mt-1 block text-xs text-stone-500">Demo listing · {event.registrationDeadline ? `deadline ${formatDate(event.registrationDeadline)}` : formatDate(event.startDate)}</span></span></button>)}
                <p className="pt-3 text-[11px] text-stone-500">No external scholarships, internships, or official notices are represented as verified.</p>
              </div>
            </section>
          </div>

          <section>
            <SectionHeading title="Campus issues" subtitle="A welcoming place to report and follow practical campus concerns." action="Open issue board" onAction={() => onNavigate('issues')} />
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {issues.slice(0, 4).map((issue) => <button key={issue.id} onClick={() => onSelectIssue(issue)} className="rounded-xl border border-stone-200 bg-white p-4 text-left hover:border-orange-300"><span className="text-[11px] font-bold text-orange-700">{issue.category} · {issue.status}</span><span className="mt-1 block line-clamp-1 text-sm font-bold text-stone-900">{issue.title}</span><span className="mt-1 block text-xs text-stone-500">{issue.upvotes} demo-board upvotes · {issue.commentsCount} comments</span></button>)}
              {!issues.length && <button onClick={onReportIssue} className="rounded-xl border border-dashed border-stone-300 bg-white p-5 text-left text-sm font-semibold text-stone-700 hover:border-orange-300">Start a campus issue report <ArrowRight className="ml-2 inline h-4 w-4" /></button>}
            </div>
          </section>
        </div>
      )}

      {section === 'events' && (
        <div>
          <PageTitle title="Campus events" subtitle="Search activities, find a date that works, and keep your plans together." />
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-stone-500">Listings are illustrative, not verified university schedules. RSVPs and saved events stay in this browser only.</span>
            <button onClick={() => { setShowEventForm(true); setFormError(''); }} className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-900"><Plus className="h-4 w-4" /> Submit an event</button>
          </div>
          <div className="mb-5 rounded-2xl border border-stone-200 bg-white p-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="relative sm:col-span-2"><span className="sr-only">Search events</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title, organizer, details, venue" className="w-full rounded-xl border border-stone-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" /></label>
              <label><span className="sr-only">Event category</span><select value={category} onChange={(event) => setCategory(event.target.value as 'all' | EventCategory)} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm"><option value="all">All categories</option>{EVENT_CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></label>
              <label><span className="sr-only">Event status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as EventStatusFilter)} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm">{(['all', 'upcoming', 'ongoing', 'completed', 'cancelled'] as EventStatusFilter[]).map((item) => <option key={item} value={item}>{item === 'all' ? 'Any status' : item[0].toUpperCase() + item.slice(1)}</option>)}</select></label>
              <label className="text-xs font-semibold text-stone-600">From<input aria-label="Date from" type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className="mt-1 block w-full rounded-xl border border-stone-200 px-3 py-2 text-sm font-normal" /></label>
              <label className="text-xs font-semibold text-stone-600">Through<input aria-label="Date through" type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} className="mt-1 block w-full rounded-xl border border-stone-200 px-3 py-2 text-sm font-normal" /></label>
              <label className="text-xs font-semibold text-stone-600 sm:col-span-2">Sort<select value={sortOrder} onChange={(event) => setSortOrder(event.target.value as 'date' | 'recent')} className="mt-1 block w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm font-normal"><option value="date">Upcoming date</option><option value="recent">Recently added</option></select></label>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-stone-100 pt-3 text-xs"><span className="text-stone-500">{visibleEvents.length} event{visibleEvents.length === 1 ? '' : 's'} found</span><button onClick={resetEventFilters} className="inline-flex items-center gap-1 font-bold text-emerald-800 hover:text-emerald-950"><X className="h-3.5 w-3.5" /> Clear filters</button></div>
          </div>
          {visibleEvents.length ? <div className="grid gap-4 md:grid-cols-2">{visibleEvents.map((event) => <EventCard key={event.id} event={event} rsvp={rsvps[event.id]} saved={savedIds.includes(event.id)} onSelect={() => setActiveEvent(event)} onToggleSave={() => toggleSaved(event.id)} />)}</div> : <EmptyState title="No events match these filters" text="Try a different search or clear the filters to see more." onAction={resetEventFilters} />}
        </div>
      )}

      {section === 'clubs' && (
        <div>
          <PageTitle title="Clubs & communities" subtitle="Find a community to learn, make, compete, perform, or volunteer together." />
          <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-950"><strong>Demo directory:</strong> these sample clubs and links are illustrative, not verified university organizations. Submit a listing request to suggest an organization for a real, access-controlled directory.</div>
          <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_240px]">
            <label className="relative"><span className="sr-only">Search clubs</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" /><input value={clubSearch} onChange={(event) => setClubSearch(event.target.value)} placeholder="Search clubs, interests, and categories" className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" /></label>
            <label><span className="sr-only">Filter club category</span><select value={clubCategory} onChange={(event) => setClubCategory(event.target.value)} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm"><option value="all">All interests</option>{Array.from(new Set(DEMO_CLUBS.map((club) => club.category))).map((item) => <option key={item}>{item}</option>)}</select></label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {filteredClubs.map((club) => {
              const clubEvents = club.upcomingEventIds.map((id) => allEvents.find((event) => event.id === id)).filter((event): event is CampusEvent => Boolean(event));
              return <article key={club.id} className="rounded-2xl border border-stone-200 bg-white p-5"><div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><span aria-hidden="true" className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 text-lg font-extrabold text-emerald-900">{club.name.slice(0, 1)}</span><div><span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-bold text-violet-800">{club.category}</span><h2 className="mt-2 text-lg font-extrabold text-stone-900">{club.name}</h2></div></div><Users className="mt-1 h-5 w-5 text-emerald-700" /></div><p className="mt-2 text-sm leading-relaxed text-stone-600">{club.description}</p><p className="mt-2 text-[11px] text-stone-500">Sample organization · not a verified listing</p><div className="mt-4 flex flex-wrap gap-2">{club.contactUrl && safeUrl(club.contactUrl) && <a href={club.contactUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-stone-200 px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50">Demo contact link <ExternalLink className="h-3 w-3" /></a>}<button onClick={() => setSelectedClub(selectedClub?.id === club.id ? null : club)} className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-900 hover:bg-emerald-100">{selectedClub?.id === club.id ? 'Hide details' : 'Club details'}</button></div>{selectedClub?.id === club.id && <div className="mt-4 border-t border-stone-100 pt-3"><h3 className="text-xs font-bold text-stone-800">Upcoming club events</h3>{clubEvents.length ? clubEvents.map((event) => <button key={event.id} onClick={() => setActiveEvent(event)} className="mt-2 block text-left text-xs font-semibold text-emerald-800 hover:underline">{event.title} · {formatDate(event.startDate)}</button>) : <p className="mt-2 text-xs text-stone-500">No events listed yet.</p>}</div>}</article>;
            })}
            {!filteredClubs.length && <EmptyState title="No clubs found" text="Try a broader search or browse all categories." onAction={() => { setClubSearch(''); setClubCategory('all'); }} />}
          </div>
          <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-5"><h2 className="font-bold text-stone-900">Suggest a club listing</h2><p className="mt-1 text-sm text-stone-600">The demo directory is static. A production submission flow needs a shared backend and a verified organization contact.</p><button onClick={() => notify('Club listing requests are not stored in this local demo.')} className="mt-3 rounded-xl border border-stone-300 px-3 py-2 text-xs font-bold text-stone-700 hover:bg-stone-50">Request an organizer profile</button></div>
        </div>
      )}

      {section === 'activities' && (
        <div>
          <PageTitle title="My activities" subtitle="A browser-local overview of your saved events, RSVPs, submissions, and issue reports." />
          <div className="mb-5 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-xs leading-relaxed text-blue-950">Bookmarks, RSVP selections, and event submissions are stored only in this browser. They are not connected to a student account, shared with other students, or synchronized across devices.</div>
          <div className="mb-4 flex flex-wrap gap-2">
            {([
              ['saved', `Saved (${savedIds.length})`],
              ['interested', `Interested (${Object.values(rsvps).filter((item) => item === 'interested').length})`],
              ['going', `Going (${Object.values(rsvps).filter((item) => item === 'going').length})`],
              ['submitted', `My submissions (${submittedEvents.length})`],
            ] as [ActivityFilter, string][]).map(([filter, label]) => <button key={filter} onClick={() => setActivityFilter(filter)} className={`rounded-full px-4 py-2 text-xs font-bold ${activityFilter === filter ? 'bg-emerald-900 text-white' : 'bg-white text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50'}`}>{label}</button>)}
          </div>
          {activityFilter !== 'submitted' && <div className="mb-4 flex gap-2">
            {(['all', 'upcoming', 'past'] as const).map((timing) => <button key={timing} onClick={() => setActivityTiming(timing)} className={`rounded-full px-3 py-1.5 text-[11px] font-bold capitalize ${activityTiming === timing ? 'bg-stone-800 text-white' : 'bg-white text-stone-600 ring-1 ring-stone-200'}`}>{timing === 'all' ? 'All dates' : timing}</button>)}
          </div>}
          {activityFilter === 'submitted' ? (
            <div className="space-y-3">
              {submittedEvents.map((event) => <article key={event.id} className="rounded-2xl border border-stone-200 bg-white p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${event.reviewStatus === 'pending' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'}`}>{event.reviewStatus === 'pending' ? 'Pending Review' : 'Approved in demo'}</span><h2 className="mt-2 font-bold text-stone-900">{event.title}</h2><p className="mt-1 text-xs text-stone-500">{formatDate(event.startDate)} · {event.venue}</p></div>{event.reviewStatus === 'pending' && <div className="flex items-center gap-2"><button onClick={() => reviewSubmittedEvent(event.id, true)} className="rounded-lg bg-emerald-800 px-3 py-2 text-xs font-bold text-white">Approve (demo only)</button><button onClick={() => reviewSubmittedEvent(event.id, false)} className="rounded-lg border border-stone-200 px-3 py-2 text-xs font-bold text-stone-700">Keep pending</button></div>}</div><p className="mt-3 rounded-xl bg-amber-50 p-3 text-[11px] leading-relaxed text-amber-950">This review control is an unauthenticated demonstration, not a real admin workflow. Never use it to approve official events.</p></article>)}
              {!submittedEvents.length && <EmptyState title="No submissions yet" text="Submit an event listing and it will appear here as Pending Review." onAction={() => onNavigate('events')} actionLabel="Browse events" />}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">{activityEvents.map((event) => <EventCard key={event.id} event={event} rsvp={rsvps[event.id]} saved={savedIds.includes(event.id)} onSelect={() => setActiveEvent(event)} onToggleSave={() => toggleSaved(event.id)} />)}{!activityEvents.length && <EmptyState title="Nothing here yet" text="Save an event or mark yourself interested or going to see it here." onAction={() => onNavigate('events')} actionLabel="Discover events" />}</div>
          )}
          <section className="mt-8"><SectionHeading title="My campus issues" subtitle="Issues you submitted from this browser." action="Report an issue" onAction={onReportIssue} /><div className="mt-3 grid gap-3 md:grid-cols-2">{myIssues.map((issue) => <button key={issue.id} onClick={() => onSelectIssue(issue)} className="rounded-xl border border-stone-200 bg-white p-4 text-left hover:border-orange-300"><span className="text-[11px] font-bold text-orange-700">{issue.status} · {issue.category}</span><span className="mt-1 block text-sm font-bold text-stone-900">{issue.title}</span><span className="mt-1 block text-xs text-stone-500">{issue.upvotes} upvotes · {issue.commentsCount} comments</span></button>)}{!myIssues.length && <p className="rounded-xl border border-dashed border-stone-300 p-4 text-xs text-stone-500">No issue submissions from this browser yet. Issue tracking data is still local demo data.</p>}</div></section>
        </div>
      )}

      {section === 'about' && (
        <div className="mx-auto max-w-3xl rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">About CampusPulse</p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-stone-900">One platform for campus life.</h1>
          <p className="mt-4 text-sm leading-relaxed text-stone-600">CampusPulse brings student events, clubs, opportunities, and campus issue tracking into one approachable community space. Students can discover activities, save plans, and follow reported issues through their status updates.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2"><InfoTile title="Events & community" text="Browse activities, explore sample club listings, and keep event plans in your browser." /><InfoTile title="Campus issues" text="Report practical campus concerns, share feedback, and follow issue status in the existing tracker." /></div>
          <div className="mt-6 rounded-2xl bg-amber-50 p-4 text-xs leading-relaxed text-amber-950"><strong>Demo limitations:</strong> event and club listings are illustrative, while bookmarks, RSVPs, issue votes, comments, and submissions use browser-local storage. They are not shared, authenticated, or suitable for official university administration. Production use requires a trusted backend, identity and role controls, moderation, and persistent storage.</div>
          <button onClick={() => onNavigate('home')} className="mt-6 rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-900">Back to home</button>
        </div>
      )}

      {section === 'issues' && null}
      {showEventForm && <EventSubmissionModal draft={draft} setDraft={setDraft} error={formError} onClose={() => setShowEventForm(false)} onSubmit={submitEvent} />}
      {activeEvent && <EventDetailsModal event={activeEvent} rsvp={rsvps[activeEvent.id]} saved={savedIds.includes(activeEvent.id)} onClose={() => setActiveEvent(null)} onToggleSave={() => toggleSaved(activeEvent.id)} onSetRsvp={(selection) => setRsvp(activeEvent.id, selection)} onShare={() => void shareEvent(activeEvent)} onCalendar={() => { try { downloadCalendar(activeEvent); notify('Calendar file downloaded.'); } catch (error) { notify(error instanceof Error ? error.message : 'Could not create calendar file.'); } }} />}
      {toast && <div role="status" className="fixed bottom-5 right-5 z-[70] max-w-sm rounded-xl bg-stone-900 px-4 py-3 text-sm font-medium text-white shadow-xl">{toast}</div>}
    </main>
  );
}

function PageTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return <header className="mb-5"><h1 className="text-2xl font-extrabold tracking-tight text-stone-900 sm:text-3xl">{title}</h1><p className="mt-1 text-sm text-stone-600">{subtitle}</p></header>;
}

function SectionHeading({ title, subtitle, action, onAction }: { title: string; subtitle: string; action: string; onAction: () => void }) {
  return <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-xl font-extrabold text-stone-900">{title}</h2><p className="mt-1 text-xs text-stone-500">{subtitle}</p></div><button onClick={onAction} className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950">{action}<ArrowRight className="h-3.5 w-3.5" /></button></div>;
}

function EmptyState({ title, text, onAction, actionLabel = 'Clear filters' }: { title: string; text: string; onAction: () => void; actionLabel?: string }) {
  return <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-12 text-center md:col-span-2"><CalendarDays className="mx-auto h-8 w-8 text-stone-400" /><h2 className="mt-3 font-bold text-stone-900">{title}</h2><p className="mx-auto mt-1 max-w-md text-sm text-stone-500">{text}</p><button onClick={onAction} className="mt-4 rounded-lg bg-stone-100 px-3 py-2 text-xs font-bold text-stone-800 hover:bg-stone-200">{actionLabel}</button></div>;
}

function InfoTile({ title, text }: { title: string; text: string }) {
  return <div className="rounded-2xl bg-stone-50 p-4"><h2 className="font-bold text-stone-900">{title}</h2><p className="mt-2 text-sm leading-relaxed text-stone-600">{text}</p></div>;
}

function EventDetailsModal({
  event, rsvp, saved, onClose, onToggleSave, onSetRsvp, onShare, onCalendar,
}: {
  event: CampusEvent;
  rsvp?: EventRsvp;
  saved: boolean;
  onClose: () => void;
  onToggleSave: () => void;
  onSetRsvp: (selection?: EventRsvp) => void;
  onShare: () => void;
  onCalendar: () => void;
}) {
  const status = eventStatus(event);
  const deadlinePassed = Boolean(event.registrationDeadline && Date.parse(event.registrationDeadline) < Date.now());
  const capacityWarning = typeof event.capacity === 'number' && event.capacity > 0 && event.demoGoingCount >= event.capacity;
  return <div className="fixed inset-0 z-[60] flex items-end justify-center bg-stone-950/50 p-0 sm:items-center sm:p-4" onMouseDown={(eventClick) => { if (eventClick.target === eventClick.currentTarget) onClose(); }}><section role="dialog" aria-modal="true" aria-labelledby="event-detail-title" className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-7"><div className="flex items-start justify-between gap-4"><div><div className="flex flex-wrap gap-2"><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800">{event.category}</span><span className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-bold capitalize text-stone-700">{status}</span><span className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-bold text-stone-600">Demo listing</span>{event.reviewStatus === 'pending' && <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-900">Pending Review</span>}</div><h2 id="event-detail-title" className="mt-3 text-2xl font-extrabold text-stone-900">{event.title}</h2></div><button onClick={onClose} aria-label="Close event details" className="rounded-lg p-2 text-stone-500 hover:bg-stone-100"><X className="h-5 w-5" /></button></div>{event.coverImageUrl && safeUrl(event.coverImageUrl) && <img src={event.coverImageUrl} alt="" className="mt-5 max-h-64 w-full rounded-2xl object-cover" onError={(e) => { e.currentTarget.hidden = true; }} />}<p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-stone-700">{event.description}</p><dl className="mt-5 grid gap-3 rounded-2xl bg-stone-50 p-4 text-sm sm:grid-cols-2"><div><dt className="text-xs font-semibold text-stone-500">Organizer</dt><dd className="mt-1 font-bold text-stone-900">{event.organizer}</dd></div><div><dt className="text-xs font-semibold text-stone-500">Venue</dt><dd className="mt-1 font-bold text-stone-900">{event.venue}</dd></div><div><dt className="text-xs font-semibold text-stone-500">Starts</dt><dd className="mt-1 font-bold text-stone-900">{formatDate(event.startDate, { weekday: 'long', hour: 'numeric', minute: '2-digit' })}</dd></div><div><dt className="text-xs font-semibold text-stone-500">Ends</dt><dd className="mt-1 font-bold text-stone-900">{formatDate(event.endDate, { weekday: 'long', hour: 'numeric', minute: '2-digit' })}</dd></div>{event.registrationDeadline && <div><dt className="text-xs font-semibold text-stone-500">Registration deadline</dt><dd className="mt-1 font-bold text-stone-900">{formatDate(event.registrationDeadline, { hour: 'numeric', minute: '2-digit' })}</dd></div>}{event.capacity && <div><dt className="text-xs font-semibold text-stone-500">Capacity</dt><dd className="mt-1 font-bold text-stone-900">{event.capacity} places · sample data</dd></div>}</dl><p className="mt-3 text-xs text-stone-500">Interest: {event.demoInterestedCount} · Going: {event.demoGoingCount} <strong>(demo counts, not live registrations)</strong></p>{deadlinePassed && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-950">The listed registration deadline has passed.</p>}{capacityWarning && <p className="mt-3 rounded-xl bg-rose-50 p-3 text-xs text-rose-900">The sample capacity count has been reached. Confirm availability with the organizer.</p>}{event.registrationUrl && safeUrl(event.registrationUrl) && <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3"><p className="text-xs font-bold text-blue-950">External registration</p><p className="mt-1 text-xs leading-relaxed text-blue-900">Your CampusPulse RSVP does not register you on the organizer’s external site.</p><a href={event.registrationUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-blue-900 underline">Open registration link <ExternalLink className="h-3 w-3" /></a></div>}<div className="mt-5 flex flex-wrap gap-2"><button onClick={onToggleSave} className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 px-3 py-2 text-xs font-bold text-stone-800 hover:bg-stone-50"><Bookmark className="h-4 w-4" fill={saved ? 'currentColor' : 'none'} />{saved ? 'Saved' : 'Save event'}</button>{(['interested', 'going'] as EventRsvp[]).map((selection) => <button key={selection} onClick={() => onSetRsvp(selection)} className={`rounded-xl px-3 py-2 text-xs font-bold capitalize ${rsvp === selection ? 'bg-emerald-800 text-white' : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100'}`}>{rsvp === selection ? <Check className="mr-1 inline h-3.5 w-3.5" /> : null}{selection}</button>)}{rsvp && <button onClick={() => onSetRsvp(undefined)} className="rounded-xl px-3 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100">Remove RSVP</button>}<button onClick={onShare} className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 px-3 py-2 text-xs font-bold text-stone-800 hover:bg-stone-50"><Share2 className="h-4 w-4" />Share</button><button onClick={onCalendar} className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 px-3 py-2 text-xs font-bold text-stone-800 hover:bg-stone-50"><CalendarDays className="h-4 w-4" />Add to calendar</button></div></section></div>;
}

function EventSubmissionModal({
  draft, setDraft, error, onClose, onSubmit,
}: {
  draft: EventDraft;
  setDraft: React.Dispatch<React.SetStateAction<EventDraft>>;
  error: string;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  function update<K extends keyof EventDraft>(key: K, value: EventDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }
  return <div className="fixed inset-0 z-[60] flex items-end justify-center bg-stone-950/50 p-0 sm:items-center sm:p-4"><form role="dialog" aria-modal="true" aria-labelledby="event-submit-title" onSubmit={onSubmit} noValidate className="max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-7"><div className="flex items-start justify-between"><div><h2 id="event-submit-title" className="text-xl font-extrabold text-stone-900">Submit a campus event</h2><p className="mt-1 text-xs text-stone-500">New listings stay Pending Review in this browser-only demo.</p></div><button type="button" onClick={onClose} aria-label="Close event form" className="rounded-lg p-2 text-stone-500 hover:bg-stone-100"><X className="h-5 w-5" /></button></div>{error && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-900">{error}</p>}<div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="Event title" required value={draft.title} onChange={(value) => update('title', value)} /><Field label="Organizer or club" required value={draft.organizer} onChange={(value) => update('organizer', value)} /><label className="text-xs font-semibold text-stone-700">Category<select value={draft.category} onChange={(event) => update('category', event.target.value as EventCategory)} className="mt-1 block w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm">{EVENT_CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></label><Field label="Venue or online location" required value={draft.venue} onChange={(value) => update('venue', value)} /><Field label="Start date & time" required type="datetime-local" value={draft.startDate} onChange={(value) => update('startDate', value)} /><Field label="End date & time" required type="datetime-local" value={draft.endDate} onChange={(value) => update('endDate', value)} /><label className="text-xs font-semibold text-stone-700 sm:col-span-2">Description <span className="text-rose-700">*</span><textarea required maxLength={3000} value={draft.description} onChange={(event) => update('description', event.target.value)} rows={4} className="mt-1 block w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm" /></label><Field label="Cover image URL (optional)" type="url" value={draft.coverImageUrl} onChange={(value) => update('coverImageUrl', value)} /><Field label="Registration URL (optional)" type="url" value={draft.registrationUrl} onChange={(value) => update('registrationUrl', value)} /><Field label="Registration deadline (optional)" type="datetime-local" value={draft.registrationDeadline} onChange={(value) => update('registrationDeadline', value)} /><Field label="Capacity (optional)" type="number" value={draft.capacity} onChange={(value) => update('capacity', value)} /></div><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-bold text-stone-700">Cancel</button><button type="submit" className="rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-900">Submit for review</button></div></form></div>;
}

function Field({ label, required, value, onChange, type = 'text' }: { label: string; required?: boolean; value: string; onChange: (value: string) => void; type?: string }) {
  const numericProps = type === 'number' ? { min: 1, step: 1 } : {};
  return <label className="text-xs font-semibold text-stone-700">{label}{required && <span className="text-rose-700"> *</span>}<input required={required} type={type} {...numericProps} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 block w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" /></label>;
}
