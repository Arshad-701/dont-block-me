// 10 friendship quiz questions with cute options.
// Each question supports dynamic {name} replacement in the title.
// The creator selects their answer; friends try to guess the creator's answer.

export type QuizOption = {
  emoji: string;
  text: string;
  color: string; // tailwind gradient classes for the thumbnail bg
};

export type QuizQuestion = {
  id: number;
  emoji: string;
  title: string; // contains {name} placeholder
  options: QuizOption[];
};

export const QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    emoji: "🍕",
    title: "What is {name}'s favourite food?",
    options: [
      { emoji: "🍕", text: "Pizza", color: "from-orange-300 to-red-300" },
      { emoji: "🍔", text: "Burger", color: "from-yellow-300 to-orange-300" },
      { emoji: "🍣", text: "Sushi", color: "from-pink-300 to-rose-300" },
      { emoji: "🍦", text: "Ice Cream", color: "from-sky-300 to-indigo-300" },
    ],
  },
  {
    id: 2,
    emoji: "✈️",
    title: "Where does {name} dream to travel?",
    options: [
      { emoji: "🗼", text: "Tokyo", color: "from-pink-300 to-fuchsia-300" },
      { emoji: "🗼", text: "Paris", color: "from-violet-300 to-purple-300" },
      { emoji: "🗽", text: "New York", color: "from-cyan-300 to-blue-300" },
      { emoji: "🏝️", text: "Bali Beach", color: "from-emerald-300 to-teal-300" },
    ],
  },
  {
    id: 3,
    emoji: "😴",
    title: "What is {name}'s ideal weekend?",
    options: [
      { emoji: "😴", text: "Sleep all day", color: "from-indigo-300 to-violet-300" },
      { emoji: "🎉", text: "Party hard", color: "from-pink-300 to-rose-300" },
      { emoji: "🎬", text: "Binge movies", color: "from-sky-300 to-cyan-300" },
      { emoji: "🎮", text: "Gaming night", color: "from-emerald-300 to-green-300" },
    ],
  },
  {
    id: 4,
    emoji: "😱",
    title: "What scares {name} the most?",
    options: [
      { emoji: "🕷️", text: "Spiders", color: "from-gray-400 to-slate-500" },
      { emoji: "👻", text: "Ghosts", color: "from-violet-300 to-purple-400" },
      { emoji: "🏔️", text: "Heights", color: "from-sky-300 to-blue-400" },
      { emoji: "💔", text: "Being alone", color: "from-rose-300 to-pink-400" },
    ],
  },
  {
    id: 5,
    emoji: "🎨",
    title: "What is {name}'s favourite colour?",
    options: [
      { emoji: "💗", text: "Pretty Pink", color: "from-pink-300 to-rose-400" },
      { emoji: "💙", text: "Bubble Blue", color: "from-sky-300 to-blue-400" },
      { emoji: "💚", text: "Mint Green", color: "from-emerald-300 to-teal-400" },
      { emoji: "🖤", text: "Mystery Black", color: "from-gray-500 to-slate-700" },
    ],
  },
  {
    id: 6,
    emoji: "😤",
    title: "How does {name} react when angry?",
    options: [
      { emoji: "🤐", text: "Goes silent", color: "from-slate-300 to-gray-400" },
      { emoji: "😡", text: "Shouts loud", color: "from-red-300 to-rose-400" },
      { emoji: "😢", text: "Cries it out", color: "from-sky-300 to-cyan-400" },
      { emoji: "🚶", text: "Walks away", color: "from-emerald-300 to-green-400" },
    ],
  },
  {
    id: 7,
    emoji: "🌟",
    title: "What is {name}'s hidden talent?",
    options: [
      { emoji: "🎤", text: "Singing", color: "from-pink-300 to-fuchsia-400" },
      { emoji: "💃", text: "Dancing", color: "from-violet-300 to-purple-400" },
      { emoji: "🍳", text: "Cooking", color: "from-orange-300 to-amber-400" },
      { emoji: "🎨", text: "Drawing", color: "from-emerald-300 to-teal-400" },
    ],
  },
  {
    id: 8,
    emoji: "💬",
    title: "What is {name}'s love language?",
    options: [
      { emoji: "🎁", text: "Gifts", color: "from-rose-300 to-pink-400" },
      { emoji: "💬", text: "Sweet words", color: "from-sky-300 to-cyan-400" },
      { emoji: "⏰", text: "Quality time", color: "from-violet-300 to-purple-400" },
      { emoji: "🤗", text: "Big hugs", color: "from-orange-300 to-amber-400" },
    ],
  },
  {
    id: 9,
    emoji: "🔮",
    title: "What vibe does {name} give off?",
    options: [
      { emoji: "🦉", text: "Introvert", color: "from-indigo-300 to-violet-400" },
      { emoji: "🦜", text: "Extrovert", color: "from-amber-300 to-orange-400" },
      { emoji: "🦊", text: "Ambivert", color: "from-emerald-300 to-teal-400" },
      { emoji: "🐱", text: "Mysterious", color: "from-slate-400 to-gray-600" },
    ],
  },
  {
    id: 10,
    emoji: "💰",
    title: "If {name} had $1 million, they'd...",
    options: [
      { emoji: "🌴", text: "Travel the world", color: "from-emerald-300 to-teal-400" },
      { emoji: "📈", text: "Invest & grow", color: "from-sky-300 to-blue-400" },
      { emoji: "🤝", text: "Donate & help", color: "from-rose-300 to-pink-400" },
      { emoji: "🛍️", text: "Shop till drop", color: "from-fuchsia-300 to-purple-400" },
    ],
  },
];

export const TOTAL_QUESTIONS = QUESTIONS.length;
