export type IssueStatus = 'Pending' | 'Resolved';

export type IssueCategory =
  | 'Transport'
  | 'Library'
  | 'Cafeteria'
  | 'Academics'
  | 'Facilities'
  | 'Administration'
  | 'Student Life';

export interface AISummary {
  main_demand: string;
  status: IssueStatus | string;
  next_steps: string;
  generatedAt?: string;
  modelUsed?: string;
  isMockFallback?: boolean;
}

export interface IssueComment {
  id: string;
  author: string;
  text: string;
  timestamp: number;
  upvotes: number;
  hasUserUpvoted?: boolean;
}

export interface CampusIssue {
  id: string;
  title: string;
  description: string;
  upvotes: number;
  status: IssueStatus;
  date: string;
  createdAtTimestamp: number;
  author: string;
  isAnonymous: boolean;
  studentId?: string;
  imageUrl?: string;
  category: IssueCategory;
  hasUserUpvoted?: boolean;
  commentsCount: number;
  comments: IssueComment[];
  aiSummary?: AISummary | null;
}

export type SortOption = 'hot' | 'top' | 'newest';
