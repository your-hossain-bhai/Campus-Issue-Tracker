export type EventCategory =
  | 'Workshops'
  | 'Hackathons'
  | 'Seminars & conferences'
  | 'Competitions'
  | 'Career & internships'
  | 'Club activities'
  | 'Cultural programs'
  | 'Sports'
  | 'Academic'
  | 'Other';

export type CampusSection = 'home' | 'events' | 'clubs' | 'issues' | 'activities' | 'about';
export type EventReviewStatus = 'approved' | 'pending';
export type EventRsvp = 'interested' | 'going';
export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  organizer: string;
  startDate: string;
  endDate: string;
  venue: string;
  coverImageUrl?: string;
  registrationUrl?: string;
  registrationDeadline?: string;
  capacity?: number;
  reviewStatus: EventReviewStatus;
  cancelled?: boolean;
  demoInterestedCount: number;
  demoGoingCount: number;
  createdAt: string;
}

export interface CampusClub {
  id: string;
  name: string;
  category: string;
  description: string;
  contactUrl?: string;
  upcomingEventIds: string[];
}

export interface EventDraft {
  title: string;
  description: string;
  category: EventCategory;
  organizer: string;
  startDate: string;
  endDate: string;
  venue: string;
  coverImageUrl: string;
  registrationUrl: string;
  registrationDeadline: string;
  capacity: string;
}
