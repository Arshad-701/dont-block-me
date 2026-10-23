import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  TOTAL_QUESTIONS,
  QUESTION_POOL,
} from "@/lib/quiz-data";

export type Step =
  | "home"
  | "create" // name + gender input
  | "creating" // answering 10 questions
  | "share" // share link page
  | "quiz" // friend solver
  | "scoreboard" // scoreboard
  | "result"; // friend result page

type QuizStore = {
  // language
  lang: string;
  setLang: (lang: string) => void;

  // sound
  soundOn: boolean;
  setSoundOn: (v: boolean) => void;

  // creator info
  creatorName: string;
  creatorGender: "male" | "female" | null;
  setCreatorName: (name: string) => void;
  setCreatorGender: (g: "male" | "female") => void;

  // The 10 pool-question indices that form the active quiz (creator side).
  // Skipping a question REPLACES the current slot with an unused pool index
  // (it does not advance the step or register a -1).
  questionSelection: number[];
  // answers being collected (option index per active question), -1 = unanswered
  answers: number[];
  setAnswer: (questionIndex: number, optionIndex: number) => void;
  currentQuestion: number;
  setCurrentQuestion: (i: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  skipQuestion: () => void; // swap current question for an unused pool question, stay on step

  // created quiz id
  quizId: string | null;
  setQuizId: (id: string) => void;

  // friend flow
  friendName: string;
  setFriendName: (name: string) => void;
  friendGender: "male" | "female" | null;
  setFriendGender: (g: "male" | "female") => void;
  friendAnswers: number[];
  setFriendAnswer: (questionIndex: number, optionIndex: number) => void;
  friendCurrent: number;
  setFriendCurrent: (i: number) => void;
  friendScore: number | null;
  setFriendScore: (s: number) => void;

  // routing via query params is handled in the component, but we keep step for in-app nav
  step: Step;
  setStep: (s: Step) => void;

  resetCreator: () => void;
};

const emptyAnswers = (): number[] => Array(TOTAL_QUESTIONS).fill(-1);

// Pick TOTAL_QUESTIONS distinct random indices from the question pool.
function randomSelection(): number[] {
  const indices = QUESTION_POOL.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices.slice(0, TOTAL_QUESTIONS);
}

export const useQuizStore = create<QuizStore>()(
  persist(
    (set, get) => ({
      lang: "en",
      setLang: (lang) => set({ lang }),

      soundOn: true,
      setSoundOn: (soundOn) => set({ soundOn }),

      creatorName: "",
      creatorGender: null,
      setCreatorName: (creatorName) => set({ creatorName }),
      setCreatorGender: (creatorGender) => set({ creatorGender }),

      questionSelection: randomSelection(),
      answers: emptyAnswers(),
      setAnswer: (questionIndex, optionIndex) => {
        const answers = [...get().answers];
        answers[questionIndex] = optionIndex;
        set({ answers });
      },
      currentQuestion: 0,
      setCurrentQuestion: (currentQuestion) => set({ currentQuestion }),
      nextQuestion: () =>
        set((s) => ({ currentQuestion: Math.min(s.currentQuestion + 1, TOTAL_QUESTIONS - 1) })),
      prevQuestion: () =>
        set((s) => ({ currentQuestion: Math.max(s.currentQuestion - 1, 0) })),
      skipQuestion: () => {
        const sel = [...get().questionSelection];
        const current = get().currentQuestion;
        // find pool indices not currently in the active selection
        const used = new Set(sel);
        const available = QUESTION_POOL.map((_, i) => i).filter((i) => !used.has(i));
        if (available.length === 0) return; // pool exhausted — no replacement possible
        const newIdx = available[Math.floor(Math.random() * available.length)];
        sel[current] = newIdx;
        // reset the answer for the replaced slot (stays on the current step)
        const answers = [...get().answers];
        answers[current] = -1;
        set({ questionSelection: sel, answers });
      },

      quizId: null,
      setQuizId: (quizId) => set({ quizId }),

      friendName: "",
      setFriendName: (friendName) => set({ friendName }),
      friendGender: null,
      setFriendGender: (friendGender) => set({ friendGender }),
      friendAnswers: emptyAnswers(),
      setFriendAnswer: (questionIndex, optionIndex) => {
        const friendAnswers = [...get().friendAnswers];
        friendAnswers[questionIndex] = optionIndex;
        set({ friendAnswers });
      },
      friendCurrent: 0,
      setFriendCurrent: (friendCurrent) => set({ friendCurrent }),
      friendScore: null,
      setFriendScore: (friendScore) => set({ friendScore }),

      step: "home",
      setStep: (step) => set({ step }),

      resetCreator: () =>
        set({
          creatorName: "",
          creatorGender: null,
          questionSelection: randomSelection(),
          answers: emptyAnswers(),
          currentQuestion: 0,
        }),
    }),
    {
      name: "dont-block-me",
      // persist language, sound + the last quiz the creator made on this device
      // so they can revisit the scoreboard without retaking a quiz.
      partialize: (s) => ({
        lang: s.lang,
        soundOn: s.soundOn,
        quizId: s.quizId,
      }),
    }
  )
);
