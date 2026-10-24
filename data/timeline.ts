export type TimelineEvent = {
  id: string;
  title: string;
  start: string;
  end: string | null;
  size: "normal" | "small";
  detail: string;
  show: boolean;
};

export const timeline: readonly TimelineEvent[] = [
  {
    id: "faculty",
    title: "Computer Science, Zagazig University",
    start: "2019",
    end: "2023",
    size: "normal",
    detail:
      `B.Sc. in Computer Science at the Faculty of Computer & Information.
      Graduation project: Brain Tumor Classification using MRI Images, graded Excellent.`,
    show: true,
  },
  {
    id: "military",
    title: "Military service",
    start: "2023-10",
    end: "2025",
    size: "small",
    detail: "Completed military service.",
    show: true,
  },
  {
    id: "iti",
    title: "Frontend & Mobile Intern, ITI",
    start: "2025-03",
    end: "2025-09",
    size: "normal",
    detail:
      "Intensive training at the Information Technology Institute in front-end development and cross-platform mobile apps. Built and shipped projects with React.js and Flutter in a team. Graduation project: IBook, a book e-commerce and community platform (Next.js 15, Firebase, Paymob, plus a Flutter companion app).",
    show: true,
  },
  {
    id: "freelance",
    title: "Frontend Developer, Freelancer~",
    start: "2025",
    end: null,
    size: "normal",
    detail:
      "Built the PrufCoach admin dashboard from scratch (German learning platform): banners, users and exams with full CRUD, token-based authentication, and a responsive UI with React.js, Tailwind CSS, Shadcn UI and Axios. Delivered production-ready on schedule, working directly with the client.",
    show: true,
  },
];
