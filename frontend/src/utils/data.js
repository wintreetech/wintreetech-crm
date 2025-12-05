// Helper Functions
export const getAvatarUrl = (id) =>
  `https://api.dicebear.com/8.x/personas/svg?seed=${id}`;

export const getStatusIcon = (dueDate) => {
  if (dueDate === "Done") return "check_circle";
  if (dueDate === "Overdue") return "schedule";
  return "schedule";
};

// simple slugify (helper for making the workspace ids)
export const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

// ✅ default empty columns in your required format
export const makeEmptyColumns = () => [
  { id: "todo", tasks: [] },
  { id: "inprogress", tasks: [] },
  { id: "completed", tasks: [] },
];

// Initial State Data (MyTasks etc.)
export const initialColumns = [
  {
    id: "todo",
    title: "Todo",
    tasks: [
      {
        id: "1",
        title: "Design user profile page",
        description:
          "Create a high-fidelity mockup for the new user profile section.",
        tags: ["New"],
        assignees: ["1", "2"],
        attachments: [],
        dueDate: "2025-12-04",
        priority: "urgent",
        isCompleted: false,
      },
      {
        id: "2",
        title: "Implement API endpoints",
        description: "Set up the backend infrastructure for the new feature.",
        tags: [],
        assignees: ["3"],
        attachments: [],
        dueDate: "2025-12-07",
        priority: "medium",
        isCompleted: false,
      },
      {
        id: "3",
        title: "Write documentation",
        description: "Document the new API endpoints for the team.",
        tags: [],
        assignees: ["4"],
        attachments: [],
        dueDate: "2025-11-15",
        priority: "medium",
        isCompleted: false,
      },
    ],
  },
  {
    id: "inprogress",
    title: "In Progress",
    tasks: [
      {
        id: "4",
        title: "Review marketing copy",
        description:
          "Proofread and provide feedback on the latest ad campaign.",
        tags: [],
        assignees: ["5", "6"],
        attachments: [],
        dueDate: "2025-12-01",
        priority: "urgent",
        isCompleted: false,
      },
      {
        id: "5",
        title: "UX testing session",
        description: "Conduct user testing for the new onboarding flow.",
        tags: [],
        assignees: [],
        attachments: [],
        dueDate: "2025-12-02",
        priority: "low",
        isCompleted: false,
      },
    ],
  },
  {
    id: "completed",
    title: "Completed",
    tasks: [
      {
        id: "6",
        title: "Finalize Q4 budget",
        description: "Review and submit the final budget for the next quarter.",
        tags: [],
        assignees: ["7"],
        attachments: [],
        dueDate: "2025-11-25",
        priority: "urgent",
        isCompleted: true,
      },
    ],
  },
];

// ✅ Workspaces with clean columns (NO title inside columns)
export const workspaces = [
  {
    id: 1,
    title: "Q4 Marketing Campaign",
    slug: `${slugify("Q4 Marketing Campaign")}-1`,
    createdOn: "Aug 15, 2023",
    createdBy: "Eleanor Vance",
    description:
      "Workspace for coordinating all marketing efforts for the fourth quarter.",

    // ✅ members as objects (3 from avatars + 3 extra)
    members: [
      {
        _id: "u-101",
        username: "Eleanor Vance",
        email: "eleanor.vance@company.com",
        role: "superadmin",
        department: "management",
      },
      {
        _id: "691d8fd419141539474741ad",
        username: "Himanshi Rai",
        email: "finance2@transactworld.com",
        role: "user",
        department: "sales",
      },
      {
        _id: "u-102",
        username: "Alisa Hester",
        email: "alisa.hester@company.com",
        role: "admin",
        department: "marketing",
      },
      {
        _id: "u-103",
        username: "Fariha Hopkins",
        email: "fariha.hopkins@company.com",
        role: "user",
        department: "marketing",
      },

      // extra users
      {
        _id: "u-104",
        username: "Leo Wilkinson",
        email: "leo.wilkinson@company.com",
        role: "user",
        department: "design",
      },
      {
        _id: "u-105",
        username: "Amara Vance",
        email: "amara.vance@company.com",
        role: "user",
        department: "seo",
      },
      {
        _id: "u-106",
        username: "Thomas Lean",
        email: "thomas.lean@company.com",
        role: "user",
        department: "product",
      },
    ],

    columns: makeEmptyColumns(), // ✅ clean format
  },

  {
    id: 2,
    title: 'Product Launch "Project Phoenix"',
    slug: `${slugify('Product Launch "Project Phoenix"')}-2`,
    createdOn: "Jul 22, 2023",
    createdBy: "Oliver Grant",
    description:
      "A strategic product launch initiative aimed at delivering an innovative, high-impact solution.",

    // ✅ members as objects (3 from avatars + 3 extra)
    members: [
      {
        _id: "u-201",
        username: "Alisa Hester",
        email: "alisa.hester@company.com",
        role: "admin",
        department: "marketing",
      },
      {
        _id: "u-202",
        username: "Fariha Hopkins",
        email: "fariha.hopkins@company.com",
        role: "user",
        department: "marketing",
      },
      {
        _id: "u-203",
        username: "Leo Wilkinson",
        email: "leo.wilkinson@company.com",
        role: "user",
        department: "design",
      },

      // extra users
      {
        _id: "u-204",
        username: "Amara Vance",
        email: "amara.vance@company.com",
        role: "user",
        department: "seo",
      },
      {
        _id: "u-205",
        username: "Oliver Grant",
        email: "oliver.grant@company.com",
        role: "superadmin",
        department: "management",
      },
      {
        _id: "u-206",
        username: "Thomas Lean",
        email: "thomas.lean@company.com",
        role: "user",
        department: "product",
      },
    ],

    columns: structuredClone(initialColumns),
  },

  {
    id: 3,
    title: "Website Redesign 2024",
    slug: `${slugify("Website Redesign 2024")}-3`,
    createdOn: "Jun 01, 2023",
    createdBy: "Lana Byrd",
    description: "",

    // ✅ members as objects (3 from avatars + 2 extra)
    members: [
      {
        _id: "u-301",
        username: "Lana Byrd",
        email: "lana.byrd@company.com",
        role: "admin",
        department: "design",
      },
      {
        _id: "u-302",
        username: "Leo Wilkinson",
        email: "leo.wilkinson@company.com",
        role: "user",
        department: "design",
      },
      {
        _id: "u-303",
        username: "Fariha Hopkins",
        email: "fariha.hopkins@company.com",
        role: "user",
        department: "marketing",
      },

      // extra users
      {
        _id: "u-304",
        username: "Amara Vance",
        email: "amara.vance@company.com",
        role: "user",
        department: "seo",
      },
      {
        _id: "u-305",
        username: "Thomas Lean",
        email: "thomas.lean@company.com",
        role: "user",
        department: "product",
      },
    ],

    columns: makeEmptyColumns(),
  },

  {
    id: 4,
    title: "Mobile App Development",
    slug: `${slugify("Mobile App Development")}-4`,
    createdOn: "Feb 10, 2023",
    createdBy: "Thomas Lean",
    description: "",

    // ✅ members as objects (3 from avatars + 3 extra)
    members: [
      {
        _id: "u-401",
        username: "Thomas Lean",
        email: "thomas.lean@company.com",
        role: "admin",
        department: "product",
      },
      {
        _id: "u-402",
        username: "Alisa Hester",
        email: "alisa.hester@company.com",
        role: "user",
        department: "marketing",
      },
      {
        _id: "u-403",
        username: "Leo Wilkinson",
        email: "leo.wilkinson@company.com",
        role: "user",
        department: "design",
      },

      // extra users
      {
        _id: "u-404",
        username: "Fariha Hopkins",
        email: "fariha.hopkins@company.com",
        role: "user",
        department: "marketing",
      },
      {
        _id: "u-405",
        username: "Amara Vance",
        email: "amara.vance@company.com",
        role: "user",
        department: "seo",
      },
      {
        _id: "u-406",
        username: "Oliver Grant",
        email: "oliver.grant@company.com",
        role: "superadmin",
        department: "management",
      },
    ],

    columns: makeEmptyColumns(),
  },
];

// -----My Tasks-----
// {
//   _id: "idsdcsojcnsdfvmdjvkzcmsdkvmfdikv",
//   username: "jhon doe",
//   email: "abc@xyz.com",
//   role: "superadmin",
//   department: "management",
//   columns: [
//     {
//       id: "todo",
//       tasks: [
//         {
//           id : "akmsdfksmdkf",
//           title : "akmsdfksmdkf",
//           description : "akmsdfksmdkf",
//           tags: ["New"],
//           priority: "urgent",
//           dueDate: "2025-12-02", (will look like this in the UI: 2 days left)
//           isCompleted: false,
//         },
//         {
//           id : "ssegsgsgsdgdsg",
//           title : "erfwegwrgrwg",
//           description : "sefsdfgfsgsdgd",
//           tags: [],
//           priority: "low",
//           dueDate: "2025-12-02", (will look like this in the UI: 2 days left)
//           isCompleted: false,
//         }
//       ]
//     },
//     {
//       id: "inprogress",
//       tasks: [
//         {
//           id : "akmsdfksmdkf",
//           title : "akmsdfksmdkf",
//           description : "akmsdfksmdkf",
//           tags: ["New"],
//           priority: "urgent",
//           dueDate: "1764940800", (will look like this in the UI: 2 days left)
//           isCompleted: false,
//         }
//       ]
//     },
//     {
//       id: "completed",
//       tasks: [
//         {
//           id : "akmsdfksmdkf",
//           title : "akmsdfksmdkf",
//           description : "akmsdfksmdkf",
//           tags: ["New"],
//           priority: "urgent",
//           dueDate: "1764940800", (will look like this in the UI: 2 days left)
//           isCompleted: true,
//         }
//       ]
//     }
//   ]
// }
