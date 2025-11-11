// src/data/mockTickets.js
const MOCK_TICKETS = [
  {
    id: "TKT-1001",
    name: "Sarah Connor",
    time: "2 hours ago",
    message: "I can't reset my password, the link is broken.",
    status: "High",
    avatar: "https://placehold.co/100x100/3B82F6/ffffff?text=SC",
    conversation: [
      {
        sender: "Sarah",
        avatar: "https://placehold.co/100x100/3B82F6/ffffff?text=SC",
        text: "I received the password reset email, but when I click the link, it just takes me to a 404 page. Can you help me fix this?",
      },
      {
        sender: "Alex",
        avatar: "https://placehold.co/100x100/059669/ffffff?text=AG",
        text: "Hi Sarah, that sounds like a broken reset URL. I’ve manually reset your password. Please check your inbox for a temporary password and log in again.",
      },
      {
        sender: "Sarah",
        avatar: "https://placehold.co/100x100/3B82F6/ffffff?text=SC",
        text: "It worked! Thank you so much, Alex.",
      },
    ],
  },
  {
    id: "TKT-1002",
    name: "John Smith",
    time: "4 hours ago",
    message: "Billing error on the last invoice. I was overcharged $50.",
    status: "Medium",
    avatar: "https://placehold.co/100x100/F97316/ffffff?text=JS",
    conversation: [
      {
        sender: "John",
        avatar: "https://placehold.co/100x100/F97316/ffffff?text=JS",
        text: "My subscription is $99, but this month's invoice shows $149. Please correct this before the payment date.",
      },
      {
        sender: "Alex",
        avatar: "https://placehold.co/100x100/059669/ffffff?text=AG",
        text: "I see the error, John. It looks like a promo expired early. I’ve applied a credit and sent a corrected invoice to your email.",
      },
    ],
  },
  {
    id: "TKT-1003",
    name: "Lisa Brown",
    time: "1 day ago",
    message: "Feature request: dark mode for the dashboard.",
    status: "Low",
    avatar: "https://placehold.co/100x100/6366F1/ffffff?text=LB",
    conversation: [
      {
        sender: "Lisa",
        avatar: "https://placehold.co/100x100/6366F1/ffffff?text=LB",
        text: "The light theme is too bright for late-night work. Any plans to add dark mode?",
      },
      {
        sender: "Alex",
        avatar: "https://placehold.co/100x100/059669/ffffff?text=AG",
        text: "Thanks for suggesting this, Lisa! Dark mode is on our roadmap for Q1 next year.",
      },
    ],
  },
  {
    id: "TKT-1004",
    name: "Michael Chen",
    time: "3 hours ago",
    message: "App crashes when I upload a large file.",
    status: "High",
    avatar: "https://placehold.co/100x100/14B8A6/ffffff?text=MC",
    conversation: [
      {
        sender: "Michael",
        avatar: "https://placehold.co/100x100/14B8A6/ffffff?text=MC",
        text: "Whenever I try uploading a 200MB CSV, the app crashes halfway through. Smaller files work fine.",
      },
      {
        sender: "Alex",
        avatar: "https://placehold.co/100x100/059669/ffffff?text=AG",
        text: "Thanks for reporting this, Michael. We're aware of a memory issue with large uploads and have a fix rolling out tomorrow.",
      },
    ],
  },
  {
    id: "TKT-1005",
    name: "Emma Davis",
    time: "6 hours ago",
    message: "Unable to verify my email address.",
    status: "Medium",
    avatar: "https://placehold.co/100x100/EC4899/ffffff?text=ED",
    conversation: [
      {
        sender: "Emma",
        avatar: "https://placehold.co/100x100/EC4899/ffffff?text=ED",
        text: "I’ve clicked the verification link several times, but it still says my email isn’t verified.",
      },
      {
        sender: "Alex",
        avatar: "https://placehold.co/100x100/059669/ffffff?text=AG",
        text: "Hi Emma, I just manually verified your email on our end. Please log out and back in to refresh your session.",
      },
    ],
  },
  {
    id: "TKT-1006",
    name: "Carlos Ramirez",
    time: "8 hours ago",
    message: "Can’t connect to API — getting 401 Unauthorized.",
    status: "High",
    avatar: "https://placehold.co/100x100/F59E0B/ffffff?text=CR",
    conversation: [
      {
        sender: "Carlos",
        avatar: "https://placehold.co/100x100/F59E0B/ffffff?text=CR",
        text: "Our integration stopped working today. All API calls return 401 errors even though our key hasn’t changed.",
      },
      {
        sender: "Alex",
        avatar: "https://placehold.co/100x100/059669/ffffff?text=AG",
        text: "Thanks for flagging that, Carlos. We rotated API keys this morning for security reasons. Please generate a new key under your account settings.",
      },
    ],
  },
  {
    id: "TKT-1007",
    name: "Olivia Martinez",
    time: "2 days ago",
    message: "Can I add multiple users to one subscription?",
    status: "Low",
    avatar: "https://placehold.co/100x100/84CC16/ffffff?text=OM",
    conversation: [
      {
        sender: "Olivia",
        avatar: "https://placehold.co/100x100/84CC16/ffffff?text=OM",
        text: "We’re a small team of 5. Can I add my colleagues to my existing plan, or do they need separate accounts?",
      },
      {
        sender: "Alex",
        avatar: "https://placehold.co/100x100/059669/ffffff?text=AG",
        text: "You can add up to 10 users under a single team plan. Go to Billing > Team Members to invite them.",
      },
    ],
  },
  {
    id: "TKT-1008",
    name: "Daniel Wilson",
    time: "5 hours ago",
    message: "Mobile app notifications aren’t working.",
    status: "Medium",
    avatar: "https://placehold.co/100x100/06B6D4/ffffff?text=DW",
    conversation: [
      {
        sender: "Daniel",
        avatar: "https://placehold.co/100x100/06B6D4/ffffff?text=DW",
        text: "I’m not receiving push notifications on Android even though they’re enabled in settings.",
      },
      {
        sender: "Alex",
        avatar: "https://placehold.co/100x100/059669/ffffff?text=AG",
        text: "We recently released an update that fixes this issue. Please update the app to version 3.2.4 and restart your phone.",
      },
    ],
  },
  {
    id: "TKT-1009",
    name: "Priya Patel",
    time: "3 days ago",
    message: "Export to PDF is missing some charts.",
    status: "Medium",
    avatar: "https://placehold.co/100x100/EAB308/ffffff?text=PP",
    conversation: [
      {
        sender: "Priya",
        avatar: "https://placehold.co/100x100/EAB308/ffffff?text=PP",
        text: "When I export my dashboard to PDF, half of the charts don’t appear in the file.",
      },
      {
        sender: "Alex",
        avatar: "https://placehold.co/100x100/059669/ffffff?text=AG",
        text: "We’ve identified this as a rendering issue in Chrome’s PDF engine. A fix will be available next week.",
      },
    ],
  },
  {
    id: "TKT-1010",
    name: "Robert King",
    time: "5 days ago",
    message: "Requesting refund for duplicate charge.",
    status: "High",
    avatar: "https://placehold.co/100x100/DC2626/ffffff?text=RK",
    conversation: [
      {
        sender: "Robert",
        avatar: "https://placehold.co/100x100/DC2626/ffffff?text=RK",
        text: "I was charged twice for my annual renewal — once via PayPal and once via card. Please refund one of them.",
      },
      {
        sender: "Alex",
        avatar: "https://placehold.co/100x100/059669/ffffff?text=AG",
        text: "Sorry about that, Robert. I've initiated a refund for the duplicate payment. You’ll see it reflected within 3–5 business days.",
      },
    ],
  },
];

// --- MOCK GROUP DATA (for the Groups tab) ---
const MOCK_GROUPS = [
  {
    id: "GRP-1",
    name: "Product Support Channel",
    time: "5 mins ago",
    message: "New outage report from Asia region. Check dashboard.",
    members: 450,
    avatar: "https://placehold.co/100x100/334155/ffffff?text=G1",
    conversation: [
      {
        sender: "Moderator",
        avatar: "https://placehold.co/100x100/334155/ffffff?text=M",
        text: "Heads up: spike in 500s from Asia region.",
      },
      {
        sender: "Alex",
        avatar: "https://placehold.co/100x100/059669/ffffff?text=AG",
        text: "Acknowledged. Investigating API gateway timeouts.",
      },
      {
        sender: "Priya",
        avatar: "https://placehold.co/100x100/EAB308/ffffff?text=PP",
        text: "Seeing similar reports from India customers.",
      },
    ],
  },
  {
    id: "GRP-2",
    name: "Billing & Finance Queries",
    time: "3 hours ago",
    message: "A user asked about the enterprise pricing tier.",
    members: 120,
    avatar: "https://placehold.co/100x100/10B981/ffffff?text=G2",
    conversation: [
      {
        sender: "John",
        avatar: "https://placehold.co/100x100/F97316/ffffff?text=JS",
        text: "Any update on annual enterprise discount?",
      },
      {
        sender: "FinanceBot",
        avatar: "https://placehold.co/100x100/10B981/ffffff?text=FB",
        text: "Standard enterprise discount is 15% for >= 50 seats.",
      },
    ],
  },
  {
    id: "GRP-3",
    name: "Beta Testers Community",
    time: "Yesterday",
    message: "Feedback on the new v3.1 mobile app release is in.",
    members: 890,
    avatar: "https://placehold.co/100x100/FACC15/ffffff?text=G3",
    conversation: [
      {
        sender: "BetaUser01",
        avatar: "https://placehold.co/100x100/FACC15/ffffff?text=B1",
        text: "v3.1 fixed login glitch; animations feel smoother.",
      },
      {
        sender: "Alex",
        avatar: "https://placehold.co/100x100/059669/ffffff?text=AG",
        text: "Great! Keep the feedback coming in the thread.",
      },
    ],
  },
];

export { MOCK_TICKETS, MOCK_GROUPS };
