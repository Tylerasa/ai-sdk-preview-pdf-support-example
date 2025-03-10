import { FC, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { AudioButton } from './ui/audio-button';
import { ChevronLeft, ChevronRight, RotateCcw, Keyboard, Star } from 'lucide-react';
import { useXP } from '@/lib/xp-context';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface FlashcardsProps {
  questions: Array<{
    question: string;
    answer: string;
    explanation: string;
  }>;
  onBack: () => void;
}

const Flashcards: FC<FlashcardsProps> = ({ questions, onBack }) => {
  const { addXP } = useXP();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [startTime] = useState<Date>(new Date());
  const [studyStats, setStudyStats] = useState({
    flips: 0,
    audioPlays: 0,
    timeSpent: 0,
    completedCards: new Set<number>(),
  });

  // Update time spent every second
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const timeSpent = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      setStudyStats(prev => ({ ...prev, timeSpent }));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'enter':
          e.preventDefault();
          handleCardClick(null);
          break;
        case 'arrowleft':
          e.preventDefault();
          previousCard();
          break;
        case 'arrowright':
          e.preventDefault();
          nextCard();
          break;
        case 'e':
          e.preventDefault();
          setShowExplanation(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, isFlipped]);

  const currentCard = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const nextCard = () => {
    if (currentIndex < questions.length - 1) {
      setIsFlipped(false);
      setShowExplanation(false);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const previousCard = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setShowExplanation(false);
      setCurrentIndex(currentIndex - 1);
    }
  };

  const resetCards = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowExplanation(false);
  };

  const calculateXP = () => {
    const baseXP = 5;
    const timeBonus = Math.min(20, Math.floor(studyStats.timeSpent / 60) * 2); // 2 XP per minute, max 20
    const completionBonus = studyStats.completedCards.size === questions.length ? 10 : 0;
    const flipBonus = Math.min(15, Math.floor(studyStats.flips / 5)); // 1 XP per 5 flips, max 15
    return baseXP + timeBonus + completionBonus + flipBonus;
  };

  const handleCardClick = (e: React.MouseEvent | null) => {
    if (e && (e.target as HTMLElement).closest('button')) {
      return;
    }
    setIsFlipped(!isFlipped);
    setStudyStats(prev => {
      const newCompletedCards = new Set(prev.completedCards);
      if (!isFlipped) {
        newCompletedCards.add(currentIndex);
      }
      return {
        ...prev,
        flips: prev.flips + 1,
        completedCards: newCompletedCards
      };
    });

    // Award XP when all cards have been viewed at least once
    if (!isFlipped && !studyStats.completedCards.has(currentIndex)) {
      const willBeComplete = studyStats.completedCards.size + 1 === questions.length;
      if (willBeComplete) {
        const earnedXP = calculateXP();
        addXP(earnedXP);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4"
        >
          ← Back to Study Modes
        </Button>
        <div className="flex justify-between items-center mb-4">
          <Button
            variant="outline"
            size="icon"
          >
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Keyboard className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Keyboard Shortcuts</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 items-center gap-4">
                    <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">Space</kbd>
                    <span>Flip card</span>
                  </div>
                  <div className="grid grid-cols-2 items-center gap-4">
                    <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">←</kbd>
                    <span>Previous card</span>
                  </div>
                  <div className="grid grid-cols-2 items-center gap-4">
                    <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">→</kbd>
                    <span>Next card</span>
                  </div>
                  <div className="grid grid-cols-2 items-center gap-4">
                    <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">E</kbd>
                    <span>Toggle explanation</span>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Flashcards</h1>
            <p className="text-sm text-muted-foreground">
              Session time: {formatTime(studyStats.timeSpent)} | Cards flipped: {studyStats.flips}
            </p>
            {studyStats.completedCards.size === questions.length && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[#58CC02] font-bold flex items-center gap-1 mt-1"
              >
                <Star className="w-4 h-4 text-[#FFD700]" fill="currentColor" />
                +{calculateXP()} XP
              </motion.div>
            )}
          </div>
          <span className="text-muted-foreground">
            {currentIndex + 1} of {questions.length}
          </span>
        </div>
        <div className="w-full bg-secondary h-2 rounded-full">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="relative min-h-[400px] w-full perspective-1000">
        <motion.div
          className="w-full h-full cursor-pointer"
          onClick={handleCardClick}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6 }}
          style={{
            transformStyle: 'preserve-3d',
          }}
        >
          <div
            className={`absolute w-full min-h-[400px] backface-hidden rounded-xl p-8 flex flex-col items-center justify-center text-center ${
              isFlipped ? 'invisible' : ''
            }`}
            style={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-semibold">Question</h2>
              <AudioButton text={currentCard.question} />
            </div>
            <p className="text-lg">{currentCard.question}</p>
            <p className="text-sm text-muted-foreground mt-4">Click card to flip</p>
          </div>

          <div
            className={`absolute w-full min-h-[400px] backface-hidden rounded-xl p-8 flex flex-col items-center justify-center text-center ${
              !isFlipped ? 'invisible' : ''
            }`}
            style={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              transform: 'rotateY(180deg)',
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-semibold">Answer</h2>
              <AudioButton text={currentCard.answer} />
            </div>
            <p className="text-lg">{currentCard.answer}</p>
            {currentCard.explanation && (
              <>
                <Button
                  variant="ghost"
                  className="mt-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowExplanation(!showExplanation);
                  }}
                >
                  {showExplanation ? 'Hide' : 'Show'} Explanation
                </Button>
                {showExplanation && (
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-sm font-medium">Explanation</p>
                      <AudioButton text={currentCard.explanation} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {currentCard.explanation}
                    </p>
                  </div>
                )}
              </>
            )}
            <p className="text-sm text-muted-foreground mt-4">Click card to flip</p>
          </div>
        </motion.div>
      </div>

      <div className="flex justify-between items-center mt-8">
        <Button
          variant="outline"
          onClick={previousCard}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button
          variant="ghost"
          onClick={resetCards}
          className="mx-2"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset
        </Button>
        <Button
          variant="outline"
          onClick={nextCard}
          disabled={currentIndex === questions.length - 1}
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Flashcards; 