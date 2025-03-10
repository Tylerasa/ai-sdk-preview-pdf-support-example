import { FC, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { AudioButton } from './ui/audio-button';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

interface FlashcardsProps {
  questions: Array<{
    question: string;
    answer: string;
    explanation: string;
  }>;
  onBack: () => void;
}

const Flashcards: FC<FlashcardsProps> = ({ questions, onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

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
          <h1 className="text-2xl font-bold">Flashcards</h1>
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
          onClick={() => setIsFlipped(!isFlipped)}
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
            <p className="text-sm text-muted-foreground mt-4">Click to flip</p>
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
            <p className="text-sm text-muted-foreground mt-4">Click to flip</p>
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