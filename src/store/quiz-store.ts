import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TOTAL_QUESTIONS } from "@/lib/quiz-data";

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

  // answers being collected (index per question), -1 = unanswered/skipped
  answers: number[];
  setAnswer: (questionIndex: number, optionIndex: number) => void;
  currentQuestion: number;
  setCurrentQuestion: (i: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;

  // created quiz id
  quizId: string | null;
  setQuizId: (id: string) => void;

  // friend flow
  friendName: string;
  setFriendName: (name: string) => void;
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

      quizId: null,
      setQuizId: (quizId) => set({ quizId }),

      friendName: "",
      setFriendName: (friendName) => set({ friendName }),
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
          answers: emptyAnswers(),
          currentQuestion: 0,
        }),
    }),
    {
      name: "dont-block-me",
      partialize: (s) => ({ lang: s.lang, soundOn: s.soundOn }),
    }
  )
);
