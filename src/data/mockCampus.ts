import { CampusClub, CampusEvent } from '../types/campus';

const makeDate = (month: number, day: number, hour: number) =>
  new Date(2026, month - 1, day, hour).toISOString();

export const DEMO_EVENTS: CampusEvent[] = [
  {
    id: 'demo-event-design-workshop',
    title: 'Designing for people: a student workshop',
    description:
      'A hands-on introduction to user research, prototyping, and accessible interface design. Bring a laptop if you have one; beginners are welcome.',
    category: 'Workshops',
    organizer: 'Campus Design Circle (demo club)',
    startDate: makeDate(11, 14, 10),
    endDate: makeDate(11, 14, 13),
    venue: 'Innovation Lab · Building A',
    registrationDeadline: makeDate(11, 12, 23),
    capacity: 40,
    reviewStatus: 'approved',
    demoInterestedCount: 28,
    demoGoingCount: 16,
    createdAt: makeDate(10, 18, 9),
  },
  {
    id: 'demo-event-build-weekend',
    title: 'Build Weekend: ideas to prototypes',
    description:
      'Form a small team, explore a campus-life challenge, and build a working prototype during this two-day student hackathon.',
    category: 'Hackathons',
    organizer: 'Campus Makers (demo club)',
    startDate: makeDate(11, 21, 9),
    endDate: makeDate(11, 22, 17),
    venue: 'Engineering Block · Rooms 201–204',
    registrationDeadline: makeDate(11, 18, 23),
    capacity: 80,
    reviewStatus: 'approved',
    demoInterestedCount: 51,
    demoGoingCount: 32,
    createdAt: makeDate(10, 20, 12),
  },
  {
    id: 'demo-event-career-conversation',
    title: 'Career paths in technology: open conversation',
    description:
      'A student-led panel about early-career paths, portfolios, internships, and questions to ask when exploring your first role.',
    category: 'Career & internships',
    organizer: 'Student Career Network (demo club)',
    startDate: makeDate(12, 3, 15),
    endDate: makeDate(12, 3, 17),
    venue: 'Main Auditorium',
    registrationUrl: 'https://example.com/demo-career-event',
    registrationDeadline: makeDate(12, 1, 23),
    reviewStatus: 'approved',
    demoInterestedCount: 34,
    demoGoingCount: 20,
    createdAt: makeDate(10, 21, 14),
  },
  {
    id: 'demo-event-cultural-night',
    title: 'Open stage: music, poetry & stories',
    description:
      'An inclusive student open stage for music, poetry, storytelling, and short performances. Sample event listing for the CampusPulse demo.',
    category: 'Cultural programs',
    organizer: 'Campus Arts Collective (demo club)',
    startDate: makeDate(12, 10, 18),
    endDate: makeDate(12, 10, 20),
    venue: 'Student Commons',
    reviewStatus: 'approved',
    demoInterestedCount: 19,
    demoGoingCount: 12,
    createdAt: makeDate(10, 22, 10),
  },
];

export const DEMO_CLUBS: CampusClub[] = [
  {
    id: 'demo-club-design',
    name: 'Campus Design Circle',
    category: 'Design & creativity',
    description:
      'A sample student community for exploring user experience, visual design, accessibility, and creative collaboration.',
    contactUrl: 'https://example.com/demo-design-club',
    upcomingEventIds: ['demo-event-design-workshop'],
  },
  {
    id: 'demo-club-makers',
    name: 'Campus Makers',
    category: 'Technology',
    description:
      'A sample club for building practical projects, learning together, and sharing ideas across disciplines.',
    contactUrl: 'https://example.com/demo-makers-club',
    upcomingEventIds: ['demo-event-build-weekend'],
  },
  {
    id: 'demo-club-career',
    name: 'Student Career Network',
    category: 'Career & development',
    description:
      'A sample peer network for career conversations, portfolio practice, internship preparation, and professional skills.',
    upcomingEventIds: ['demo-event-career-conversation'],
  },
  {
    id: 'demo-club-arts',
    name: 'Campus Arts Collective',
    category: 'Arts & culture',
    description:
      'A sample creative community for music, performance, visual arts, poetry, and student-led cultural events.',
    contactUrl: 'https://example.com/demo-arts-collective',
    upcomingEventIds: ['demo-event-cultural-night'],
  },
];
