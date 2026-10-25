import React, { useState, useEffect, useRef } from 'react';
import { MCQ, ExamResult } from '../types/quiz.js';
import { toBengaliNumber, formatTimer, calculateAccuracy, calculateScoreXP } from '../utils/quizLogic.js';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Send,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  Maximize2,
  Minimize2,
  X,
  Loader2
} from 'lucide-react';

interface ExamHallProps {
  subject: string;
  chapter: string;
  initialQuestions: MCQ[];
  timeLimitSeconds: number;
  onFinishExam: (result: ExamResult) => void;
  onExitExam: () => void;
}

export const ExamHall: React.FC<ExamHallProps> = ({
  subject,
  chapter,
  initialQuestions,
  timeLimitSeconds,
  onFinishExam,
  onExitExam
}) => {
  const [questions, setQuestions] = useState<MCQ[]>(initialQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number | null>>({});
  const [timeLeft, setTimeLeft] = useState(timeLimitSeconds);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const startTimeRef = useRef(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentQ = questions[currentIndex];
  const totalQ = questions.length;
  const optionLetters = ['ক', 'খ', 'গ', 'ঘ'];

  const answeredCount = Object.values(userAnswers).filter((v) => v !== null && v !== undefined).length;
  const unansweredCount = totalQ - answeredCount;

  // Countdown timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [questions]);

  const handleSelectOption = (optionIndex: number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionIndex
    }));
  };

  const handleSkip = () => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: null
    }));
    if (currentIndex < totalQ - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalQ - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleFinalSubmit = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    const timeSpent = Math.max(1, Math.floor((Date.now() - startTimeRef.current) / 1000));
    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;

    const detailedAnswers = questions.map((q) => {
      const selected = userAnswers[q.id];
      if (selected === undefined || selected === null) {
        skippedCount++;
        return {
          question: q,
          selectedOptionIndex: null,
          isCorrect: false
        };
      } else if (selected === q.correctIndex) {
        correctCount++;
        return {
          question: q,
          selectedOptionIndex: selected,
          isCorrect: true
        };
      } else {
        wrongCount++;
        return {
          question: q,
          selectedOptionIndex: selected,
          isCorrect: false
        };
      }
    });

    const accuracy = calculateAccuracy(correctCount, totalQ);
    const scoreXP = calculateScoreXP(correctCount, wrongCount, true);

    const result: ExamResult = {
      id: `exam_${Date.now()}`,
      date: new Date().toLocaleDateString('bn-BD'),
      subject,
      chapter: chapter === 'all' ? 'সকল অধ্যায়' : chapter,
      totalQuestions: totalQ,
      correctCount,
      wrongCount,
      skippedCount,
      accuracy,
      scoreXP,
      timeTakenSeconds: timeSpent,
      answers: detailedAnswers
    };

    onFinishExam(result);
  };

  // AI MCQ Generator Feature
  const handleGenerateAiQuestions = async () => {
    setIsAiGenerating(true);
    setAiMessage(null);
    try {
      const targetChapter = chapter === 'all' ? currentQ.chapter : chapter;
      const res = await fetch('/api/generate-mcqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          chapter: targetChapter,
          count: 5
        })
      });

      const data = await res.json();
      if (data.mcqs && data.mcqs.length > 0) {
        const existingTexts = new Set(questions.map((q) => q.question.trim()));
        const newUnique = data.mcqs.filter((q: MCQ) => !existingTexts.has(q.question.trim()));

        if (newUnique.length > 0) {
          setQuestions((prev) => [...prev, ...newUnique]);
          setTimeLeft((prev) => prev + newUnique.length * 60);
          setAiMessage(`🎉 AI সফলভাবে "${targetChapter}" অধ্যায়ের আরও ${toBengaliNumber(newUnique.length)} টি নতুন প্রশ্ন ও সময় যোগ করেছে!`);
        } else {
          setAiMessage('নতুন প্রশ্ন তৈরি হয়েছে, কিন্তু ইতিমধ্যে অন্তর্ভুক্ত আছে।');
        }
      } else {
        setAiMessage('প্রশ্ন তৈরিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      }
    } catch (e) {
      console.error('Error generating AI MCQs:', e);
      setAiMessage('সার্ভারে যোগাযোগ করা যায়নি। অফলাইন প্রশ্ন দিয়ে চালিয়ে যান।');
    } finally {
      setIsAiGenerating(false);
      setTimeout(() => setAiMessage(null), 5000);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  const isTimeCritical = timeLeft <= 60;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-between overflow-x-hidden overflow-y-auto select-none transition-colors"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      {/* Sticky Top Header */}
      <header
        className="sticky top-0 z-20 border-b shadow-xs px-3 sm:px-6 py-2.5 sm:py-3 transition-colors"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--card-border)'
        }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          {/* Exit & Subject */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setIsExitModalOpen(true)}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer shrink-0"
              title="পরীক্ষা ত্যাগ করুন"
              aria-label="পরীক্ষা ত্যাগ করুন"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-extrabold text-xs sm:text-base truncate" style={{ color: 'var(--text-main)' }}>
                  {subject}
                </span>
                <span className="text-[10px] sm:text-xs font-bold bg-violet-100 dark:bg-violet-950/60 text-[#6C5CE7] px-2 py-0.5 rounded-md shrink-0">
                  {chapter === 'all' ? 'সকল অধ্যায়' : chapter}
                </span>
              </div>
            </div>
          </div>

          {/* Sticky Center Timer */}
          <div
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-2xl border font-bold text-xs sm:text-sm shrink-0 transition-all ${
              isTimeCritical
                ? 'bg-rose-50 border-rose-300 text-rose-600 animate-pulse dark:bg-rose-950/40'
                : 'bg-violet-50/80 border-violet-200 text-[#6C5CE7] dark:bg-violet-950/40 dark:border-violet-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-sm sm:text-base font-black font-mono">
              {formatTimer(timeLeft, true)}
            </span>
          </div>

          {/* AI Generator & Submit button */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handleGenerateAiQuestions}
              disabled={isAiGenerating}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
              title="AI দিয়ে আরও ৫টি নতুন প্রশ্ন যোগ করুন"
            >
              {isAiGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>তৈরি হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  <span>AI প্রশ্ন যোগ করো</span>
                </>
              )}
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 transition-colors hidden md:block"
              title={isFullscreen ? 'ফুলস্ক্রিন বন্ধ' : 'ফুলস্ক্রিন মোড'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="px-3 sm:px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              জমা দাও
            </button>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full mt-2 sm:mt-2.5 overflow-hidden max-w-5xl mx-auto">
          <div
            className="bg-[#6C5CE7] h-full rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / totalQ) * 100}%` }}
          />
        </div>
      </header>

      {/* AI Success Toast Message */}
      {aiMessage && (
        <div className="max-w-2xl mx-auto mt-3 px-4 w-full">
          <div className="p-3 bg-violet-600 text-white text-xs sm:text-sm font-semibold rounded-2xl shadow-lg flex items-center justify-between gap-2 animate-in slide-in-from-top-4">
            <span>{aiMessage}</span>
            <button onClick={() => setAiMessage(null)} className="text-white/80 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Middle Question Card Area */}
      <main className="flex-1 flex flex-col justify-center max-w-4xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div
          className="rounded-3xl p-4 sm:p-8 border shadow-xs relative transition-colors"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--card-border)'
          }}
        >
          {/* Question Metadata Header */}
          <div className="flex items-center justify-between pb-3 sm:pb-4 mb-4 border-b" style={{ borderColor: 'var(--card-border)' }}>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-violet-100 dark:bg-violet-950/60 text-[#6C5CE7] flex items-center justify-center font-bold text-xs sm:text-sm">
                {toBengaliNumber(currentIndex + 1)}
              </span>
              <span className="text-[11px] sm:text-xs font-medium text-slate-400">
                / {toBengaliNumber(totalQ)}
              </span>
              <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-md border" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--card-border)', color: 'var(--text-main)' }}>
                {currentQ.chapter}
              </span>
              {currentQ.isAiGenerated && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-600 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  AI প্রশ্ন
                </span>
              )}
            </div>

            <div className="text-[11px] sm:text-xs font-semibold text-slate-400">
              {currentQ.difficulty === 'easy' && 'সহজ'}
              {currentQ.difficulty === 'medium' && 'মধ্যম'}
              {currentQ.difficulty === 'hard' && 'কঠিন'}
            </div>
          </div>

          {/* Question Text (Large Bengali Typography with break-words) */}
          <h2 className="text-base sm:text-2xl font-bold leading-relaxed sm:leading-relaxed mb-5 sm:mb-6 break-words" style={{ color: 'var(--text-main)' }}>
            {currentQ.question}
          </h2>

          {/* 4 Full-Width Option Cards with Minimum 48px Tap Targets */}
          <div className="grid grid-cols-1 gap-2.5 sm:gap-3.5">
            {currentQ.options.map((option, idx) => {
              const isSelected = userAnswers[currentQ.id] === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full min-h-[50px] p-3.5 sm:p-4 rounded-2xl border text-left flex items-start gap-3 transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'border-[#6C5CE7] bg-violet-50/70 dark:bg-violet-950/60 shadow-xs ring-2 ring-[#6C5CE7]/30'
                      : 'hover:border-slate-400 hover:opacity-90'
                  }`}
                  style={
                    !isSelected
                      ? {
                          backgroundColor: 'var(--bg)',
                          borderColor: 'var(--card-border)',
                          color: 'var(--text-main)'
                        }
                      : { color: 'var(--text-main)' }
                  }
                >
                  {/* Option letter pill (ক, খ, গ, ঘ) */}
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 transition-all ${
                      isSelected
                        ? 'bg-[#6C5CE7] text-white shadow-xs'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {optionLetters[idx]}
                  </div>

                  {/* Option text */}
                  <span className="text-sm sm:text-lg font-medium pt-0.5 flex-1 leading-snug break-words">
                    {option}
                  </span>

                  {/* Checkmark indicator */}
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-[#6C5CE7] text-white flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 fill-current" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Question Palette / Number Strip */}
        <div
          className="mt-3.5 p-2.5 sm:p-3 rounded-2xl border shadow-xs flex items-center gap-1.5 overflow-x-auto scrollbar-none"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--card-border)'
          }}
        >
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 mr-1 whitespace-nowrap">
            প্রশ্ন:
          </span>
          {questions.map((q, idx) => {
            const isAnswered = userAnswers[q.id] !== undefined && userAnswers[q.id] !== null;
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  isCurrent
                    ? 'ring-2 ring-[#6C5CE7] ring-offset-2 bg-[#6C5CE7] text-white'
                    : isAnswered
                    ? 'bg-violet-100 dark:bg-violet-950/60 text-[#6C5CE7]'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:opacity-80'
                }`}
              >
                {toBengaliNumber(idx + 1)}
              </button>
            );
          })}
        </div>
      </main>

      {/* Bottom Floating Navigation Bar */}
      <footer
        className="sticky bottom-0 border-t p-3 sm:p-4 shadow-lg transition-colors"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--card-border)'
        }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          {/* Previous Button */}
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="px-3.5 sm:px-4 py-2.5 rounded-xl border font-semibold text-xs sm:text-sm disabled:opacity-40 transition-all flex items-center gap-1 cursor-pointer"
            style={{
              backgroundColor: 'var(--bg)',
              borderColor: 'var(--card-border)',
              color: 'var(--text-main)'
            }}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">পূর্ববর্তী</span>
          </button>

          {/* Center: Skip & AI Generate mobile */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSkip}
              className="px-3.5 sm:px-4 py-2.5 rounded-xl border font-semibold text-xs sm:text-sm hover:opacity-80 transition-all cursor-pointer"
              style={{
                backgroundColor: 'var(--bg)',
                borderColor: 'var(--card-border)',
                color: 'var(--text-muted)'
              }}
            >
              স্কিপ করো
            </button>

            <button
              onClick={handleGenerateAiQuestions}
              disabled={isAiGenerating}
              className="sm:hidden px-3 py-2 rounded-xl bg-violet-100 dark:bg-violet-950/60 text-[#6C5CE7] font-bold text-xs flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI প্রশ্ন</span>
            </button>
          </div>

          {/* Right: Next or Submit */}
          {currentIndex < totalQ - 1 ? (
            <button
              onClick={handleNext}
              className="px-4 sm:px-5 py-2.5 rounded-xl bg-[#6C5CE7] hover:bg-[#5848df] font-bold text-xs sm:text-sm text-white shadow-md shadow-indigo-100 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>পরবর্তী</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="px-4 sm:px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-xs sm:text-sm text-white shadow-md shadow-emerald-200 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>জমা দাও</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </footer>

      {/* Submit Confirmation Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div
            className="rounded-3xl p-6 max-w-md w-full shadow-2xl border text-center animate-in zoom-in-95"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--card-border)'
            }}
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>
              তুমি কি পরীক্ষা জমা দিতে চাও?
            </h3>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              জমা দিলে তাৎক্ষণিক ফলাফল, প্রতিটি প্রশ্নের সঠিক উত্তর এবং বিস্তারিত ব্যাখ্যা দেখতে পারবে।
            </p>

            <div
              className="mt-4 grid grid-cols-2 gap-2 text-center p-3 rounded-2xl border"
              style={{
                backgroundColor: 'var(--bg)',
                borderColor: 'var(--card-border)'
              }}
            >
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">উত্তর দেওয়া হয়েছে</span>
                <span className="text-lg font-bold text-emerald-600">{toBengaliNumber(answeredCount)} টি</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">বাকি বা স্কিপ</span>
                <span className="text-lg font-bold text-amber-600">{toBengaliNumber(unansweredCount)} টি</span>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2.5">
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border text-xs font-semibold hover:opacity-80 transition-all cursor-pointer"
                style={{
                  backgroundColor: 'var(--bg)',
                  borderColor: 'var(--card-border)',
                  color: 'var(--text-main)'
                }}
              >
                চালিয়ে যাও
              </button>
              <button
                onClick={() => {
                  setIsSubmitModalOpen(false);
                  handleFinalSubmit();
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white shadow-md transition-all cursor-pointer"
              >
                হ্যাঁ, জমা দাও
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exit Confirmation Modal */}
      {isExitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div
            className="rounded-3xl p-6 max-w-md w-full shadow-2xl border text-center animate-in zoom-in-95"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--card-border)'
            }}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>
              পরীক্ষা বাতিল করতে চাও?
            </h3>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              এখন বের হলে এই পরীক্ষার কোনো ফলাফল বা এক্সপি সংরক্ষিত হবে না।
            </p>

            <div className="mt-5 flex items-center gap-2.5">
              <button
                onClick={() => setIsExitModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border text-xs font-semibold hover:opacity-80 transition-all cursor-pointer"
                style={{
                  backgroundColor: 'var(--bg)',
                  borderColor: 'var(--card-border)',
                  color: 'var(--text-main)'
                }}
              >
                না, পরীক্ষা দেব
              </button>
              <button
                onClick={onExitExam}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 font-bold text-xs text-white shadow-md transition-all cursor-pointer"
              >
                হ্যাঁ, বের হও
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
