import { CampusIssue } from '../types';

export const INITIAL_CAMPUS_ISSUES: CampusIssue[] = [
  {
    id: 'issue-1',
    title: 'Kumira Campus Bus Route Shortage & Extreme Peak-Hour Crowding',
    description:
      'Students travelling from Chittagong city (GEC, Chawkbazar, Agrabad) to Kumira campus are facing severe bus shortages between 7:45 AM and 8:30 AM. Over 300+ students are stranded daily at GEC circle, leading to missed morning quizzes and dangerous footboard traveling. We urgently require at least 4 additional double-decker or dedicated buses during the peak morning and 4:30 PM departure windows.',
    upvotes: 248,
    status: 'Pending',
    date: '2 hours ago',
    createdAtTimestamp: Date.now() - 2 * 60 * 60 * 1000,
    author: 'Student #C213042',
    isAnonymous: false,
    studentId: 'C213042',
    imageUrl:
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
    category: 'Transport',
    hasUserUpvoted: true,
    commentsCount: 3,
    comments: [
      {
        id: 'c-101',
        author: 'Student #C213009',
        text: 'Agreed 100%! Yesterday our batch was stranded for almost 45 minutes at GEC and missed the Operating Systems quiz.',
        timestamp: Date.now() - 90 * 60 * 1000,
        upvotes: 14,
        hasUserUpvoted: true,
      },
      {
        id: 'c-102',
        author: 'Anonymous Student',
        text: 'Footboard travel on Dhaka-Chittagong highway is terrifying. We need immediate proctorial intervention before an accident occurs.',
        timestamp: Date.now() - 45 * 60 * 1000,
        upvotes: 9,
      },
      {
        id: 'c-103',
        author: 'Student #C201088',
        text: 'Student representatives submitted the memorandum to Transport Office this morning. Waiting on the schedule release.',
        timestamp: Date.now() - 15 * 60 * 1000,
        upvotes: 6,
      },
    ],
    aiSummary: {
      main_demand:
        'সকাল ও বিকালের ব্যস্ত সময়ে চট্টগ্রাম শহর থেকে কুমিরা ক্যাম্পাসে যাতায়াতের জন্য অতিরিক্ত ৪টি বাস বরাদ্দের দাবি।',
      status: 'Pending',
      next_steps:
        'শিক্ষার্থীদের পরিবহন দপ্তরের নোটিশের জন্য অপেক্ষা করা এবং ছাত্রকল্যাণ উপদেষ্টার নিকট গণস্বাক্ষর জমা দেওয়ার পরামর্শ দেওয়া হচ্ছে।',
      generatedAt: 'Just now',
      modelUsed: 'AI Extraction Engine',
      isMockFallback: false,
    },
  },
  {
    id: 'issue-2',
    title: 'Central Library Study Hall Hours Extension During Midterm Exams (Till 10 PM)',
    description:
      'The central library currently closes at 5:00 PM on weekdays and remains shut on Saturdays. With midterm exams starting next week, students living in surrounding student messes and hostels have no quiet environment with stable electricity and Wi-Fi to prepare. We demand extending study room hours until 10:00 PM with security staff stationed.',
    upvotes: 189,
    status: 'Pending',
    date: '5 hours ago',
    createdAtTimestamp: Date.now() - 5 * 60 * 60 * 1000,
    author: 'Anonymous',
    isAnonymous: true,
    imageUrl:
      'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80',
    category: 'Library',
    hasUserUpvoted: false,
    commentsCount: 2,
    comments: [
      {
        id: 'c-201',
        author: 'Student #C221004',
        text: 'Power load shedding in student messes around Kumira makes it impossible to study after sunset. 10 PM library access is crucial.',
        timestamp: Date.now() - 3 * 60 * 60 * 1000,
        upvotes: 12,
      },
      {
        id: 'c-202',
        author: 'Student #C193021',
        text: 'The Chief Librarian indicated that security guards and AC technicians are ready once administrative clearance is signed.',
        timestamp: Date.now() - 1 * 60 * 60 * 1000,
        upvotes: 8,
      },
    ],
    aiSummary: {
      main_demand:
        'মিডটার্ম পরীক্ষার প্রস্তুতি নির্বিঘ্ন করতে কেন্দ্রীয় লাইব্রেরির পড়ার কক্ষ রাত ১০টা পর্যন্ত খোলা রাখার জোর দাবি।',
      status: 'Pending',
      next_steps:
        'লাইব্রেরিয়ান ও প্রক্টর স্যারের নিকট সম্মিলিত আবেদনপত্র পাঠিয়ে আনুষ্ঠানিক অনুমোদনের জন্য অপেক্ষা করুন।',
      generatedAt: '1 hour ago',
      modelUsed: 'AI Extraction Engine',
      isMockFallback: false,
    },
  },
  {
    id: 'issue-3',
    title: 'Central Cafeteria Food Hygiene Standards & Safe Reverse Osmosis Drinking Water',
    description:
      'Multiple students reported food poisoning symptoms last week after dining at the main campus cafeteria. The inspection revealed uncovered food trays and uncertified cooking oil. Following repeated complaints, the University Food Safety Committee inspected the premises, installed certified RO drinking water dispensers on all 3 floors, and instituted daily hygiene logs.',
    upvotes: 312,
    status: 'Resolved',
    date: '1 day ago',
    createdAtTimestamp: Date.now() - 26 * 60 * 60 * 1000,
    author: 'Student #C191015',
    isAnonymous: false,
    studentId: 'C191015',
    imageUrl:
      'https://images.unsplash.com/photo-1567521464027-f127ff144326?auto=format&fit=crop&w=1200&q=80',
    category: 'Cafeteria',
    hasUserUpvoted: false,
    commentsCount: 2,
    comments: [
      {
        id: 'c-301',
        author: 'Student #C211019',
        text: 'Can verify the new RO filters were installed on 2nd and 3rd floors yesterday. Water tastes pure and chilled.',
        timestamp: Date.now() - 20 * 60 * 60 * 1000,
        upvotes: 19,
      },
      {
        id: 'c-302',
        author: 'Anonymous Student',
        text: 'Huge gratitude to everyone who voted on this. Transparent community pressure works!',
        timestamp: Date.now() - 16 * 60 * 60 * 1000,
        upvotes: 15,
      },
    ],
    aiSummary: {
      main_demand:
        'ক্যাফেটেরিয়ার খাবারের স্বাস্থ্যকর মান নিশ্চিতকরণ এবং প্রতিটি ফ্লোরে বিশুদ্ধ আরও (RO) ফিল্টার পানি স্থাপনের দাবি।',
      status: 'Resolved',
      next_steps:
        'কর্তৃপক্ষ ফিল্টার স্থাপন ও মনিটরিং কমিটি গঠন করেছে; শিক্ষার্থীরা এখন নতুন পরিচ্ছন্ন খাবার কাউন্টার ব্যবহার করতে পারেন।',
      generatedAt: 'Yesterday',
      modelUsed: 'AI Extraction Engine',
      isMockFallback: false,
    },
  },
  {
    id: 'issue-4',
    title: 'Course Add/Drop Automation & Multi-Counter Token System for Fee Payment',
    description:
      'During the beginning of every semester, hundreds of students are forced to stand in a single serpentine queue in the scorching sun outside the Accounts Office just to get a bank voucher verified. We need a token management screen and full digital payment integration via bKash/Nagad on the student portal so no physical queuing is required.',
    upvotes: 145,
    status: 'Pending',
    date: '2 days ago',
    createdAtTimestamp: Date.now() - 48 * 60 * 60 * 1000,
    author: 'Anonymous',
    isAnonymous: true,
    imageUrl:
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
    category: 'Administration',
    hasUserUpvoted: false,
    commentsCount: 1,
    comments: [
      {
        id: 'c-401',
        author: 'Student #C203001',
        text: 'Why do we have a computer science department if we still pay vouchers with paper slips in 2026? Please automate this portal.',
        timestamp: Date.now() - 36 * 60 * 60 * 1000,
        upvotes: 21,
      },
    ],
    aiSummary: null,
  },
  {
    id: 'issue-5',
    title: 'High-Speed Wi-Fi & Additional Power Outlets in Department Computer Labs',
    description:
      'CSE Building 4th floor lab machines were frequently disconnecting during programming contest practices and machine learning hackathons. IT section has now laid dedicated gigabit fiber lines to Lab 1, Lab 2 and installed 60 grounded surge-protected laptop sockets for student developers.',
    upvotes: 178,
    status: 'Resolved',
    date: '3 days ago',
    createdAtTimestamp: Date.now() - 72 * 60 * 60 * 1000,
    author: 'Student #C222019',
    isAnonymous: false,
    studentId: 'C222019',
    imageUrl:
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
    category: 'Facilities',
    hasUserUpvoted: true,
    commentsCount: 1,
    comments: [
      {
        id: 'c-501',
        author: 'Student #C221045',
        text: 'Tested Lab 1 speed this morning: ping 4ms, 850 Mbps symmetrical. Ready for hackathons!',
        timestamp: Date.now() - 50 * 60 * 60 * 1000,
        upvotes: 11,
      },
    ],
    aiSummary: {
      main_demand:
        'কম্পিউটার ল্যাবে উচ্চগতির ইন্টারনেট ও প্রোগ্রামিং প্র্যাকটিসের জন্য মাল্টিপ্লাগ সকেট বাড়ানোর দাবি।',
      status: 'Resolved',
      next_steps:
        'আইটি ডিভিশন গিগাবিট ফাইবার ও সকেট স্থাপন সম্পন্ন করেছে; শিক্ষার্থীরা যেকোনো সমস্যার ক্ষেত্রে ল্যাব ইনচার্জকে অবহিত করুন।',
      generatedAt: '3 days ago',
      modelUsed: 'AI Extraction Engine',
      isMockFallback: false,
    },
  },
];
