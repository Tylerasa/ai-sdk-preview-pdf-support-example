import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Card, CardContent } from './ui/card';
import { Check, X, ArrowLeft, Brain, Star } from 'lucide-react';
import { AudioButton } from './ui/audio-button';
import { cn } from '@/lib/utils';
import { useXP } from '@/lib/xp-context';

interface LearnProps {
  questions: Array<{
    question: string;
    answer: string;
    options: string[];
    explanation: string;
  }>;
  onBack: () => void;
}

interface QuestionWithMetadata {
  question: string;
  answer: string;
  options: string[];
  explanation: string;
  interval: number;
  nextReview: Date;
  easeFactor: number;
  correctCount: number;
  incorrectCount: number;
}

const Learn: FC<LearnProps> = ({ questions, onBack }) => {
  const { addXP } = useXP();
  const [studyQueue, setStudyQueue] = useState<QuestionWithMetadata[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [stats, setStats] = useState({
    correct: 0,
    incorrect: 0,
    streak: 0,
  });

  // Initialize study queue with spaced repetition metadata
  useEffect(() => {
    if (questions.length > 0) {
      const initialQueue = questions.map(q => ({
        ...q,
        interval: 1,
        nextReview: new Date(),
        easeFactor: 2.5,
        correctCount: 0,
        incorrectCount: 0,
      }));
      setStudyQueue(initialQueue);
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setCompleted(false);
    }
  }, [questions]);

  const handleAnswerSelect = (answer: string) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answer);
    setIsAnswered(true);
    
    const correctAnswerIndex = ['A', 'B', 'C', 'D'].indexOf(studyQueue[currentIndex].answer);
    const isCorrect = answer === studyQueue[currentIndex].options[correctAnswerIndex];
    const question = studyQueue[currentIndex];

    // Update stats
    setStats(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (isCorrect ? 0 : 1),
      streak: isCorrect ? prev.streak + 1 : 0,
    }));

    // Update question metadata
    const updatedQuestion = {
      ...question,
      correctCount: question.correctCount + (isCorrect ? 1 : 0),
      incorrectCount: question.incorrectCount + (isCorrect ? 0 : 1),
    };

    // Update spaced repetition intervals
    if (isCorrect) {
      updatedQuestion.easeFactor = Math.max(1.3, question.easeFactor + 0.1);
      updatedQuestion.interval = question.interval * updatedQuestion.easeFactor;
    } else {
      updatedQuestion.easeFactor = Math.max(1.3, question.easeFactor - 0.2);
      updatedQuestion.interval = 1;
    }

    updatedQuestion.nextReview = new Date(Date.now() + updatedQuestion.interval * 24 * 60 * 60 * 1000);

    // Update queue
    setStudyQueue(prev => 
      prev.map((q, i) => i === currentIndex ? updatedQuestion : q)
    );

    // Show explanation after a brief delay
    setTimeout(() => {
      setShowExplanation(true);
    }, 500);
  };

  const moveToNext = () => {
    const now = new Date();
    const dueQuestions = studyQueue.filter(q => q.nextReview <= now);

    if (dueQuestions.length === 0) {
      setCompleted(true);
    } else {
      setCurrentIndex((currentIndex + 1) % studyQueue.length);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setShowExplanation(false);
    }
  };

  const shuffleArray = (array: string[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const calculateXP = () => {
    const baseXP = 10;
    const streakBonus = Math.floor(stats.streak / 2) * 5;
    const accuracyBonus = Math.floor((stats.correct / (stats.correct + stats.incorrect)) * 10);
    return baseXP + streakBonus + accuracyBonus;
  };

  useEffect(() => {
    if (completed && stats.correct > 0) {
      const earnedXP = calculateXP();
      addXP(earnedXP);
    }
  }, [completed, stats.correct]);

  if (!studyQueue.length) {
    return (
      <div className="container max-w-4xl mx-auto p-4">
        <Button variant="ghost" onClick={onBack} className="mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Study Modes
        </Button>
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">No questions available</h2>
            <p className="text-muted-foreground mb-6">
              Please generate some questions first.
            </p>
            <Button onClick={onBack}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (completed) {
    const earnedXP = calculateXP();
    
    return (
      <div className="container max-w-4xl mx-auto p-4">
        <Button variant="ghost" onClick={onBack} className="mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Study Modes
        </Button>
        <Card>
          <CardContent className="p-6 text-center">
            <Brain className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h2 className="text-2xl font-bold mb-4">Learning Complete!</h2>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-2xl font-bold text-[#58CC02] mb-4 flex items-center justify-center gap-2"
            >
              <Star className="w-6 h-6 text-[#FFD700]" fill="currentColor" />
              +{earnedXP} XP
            </motion.div>
            <div className="space-y-2 mb-6">
              <p className="text-muted-foreground">
                You've completed this study session. Here's how you did:
              </p>
              <div className="flex justify-center gap-8 text-lg">
                <div>
                  <span className="font-bold text-green-500">{stats.correct}</span> correct
                </div>
                <div>
                  <span className="font-bold text-red-500">{stats.incorrect}</span> incorrect
                </div>
                <div>
                  Best streak: <span className="font-bold">{stats.streak}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => {
                setCompleted(false);
                setCurrentIndex(0);
                setSelectedAnswer(null);
                setIsAnswered(false);
                setShowExplanation(false);
                setStats({ correct: 0, incorrect: 0, streak: 0 });
              }}>
                Study Again
              </Button>
              <Button variant="outline" onClick={onBack}>
                Back to Study Modes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = studyQueue[currentIndex];
  const progress = (stats.correct / (stats.correct + stats.incorrect)) * 100 || 0;
  const shuffledOptions = shuffleArray(currentQuestion.options);

  return (
    <div className="container max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Study Modes
        </Button>
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium">Correct: {stats.correct}</div>
          <div className="text-sm font-medium">Streak: {stats.streak}🔥</div>
        </div>
      </div>

      <Progress value={progress} className="mb-8" />

      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-start gap-2 mb-6">
            <h2 className="text-xl font-semibold flex-1">{currentQuestion.question}</h2>
            <AudioButton text={currentQuestion.question} className="shrink-0" />
          </div>

          <div className="grid gap-3">
            {shuffledOptions.map((option, index) => (
              <Button
                key={index}
                variant={
                  !isAnswered
                    ? selectedAnswer === option ? "secondary" : "outline"
                    : "outline"
                }
                className={cn(
                  "min-h-[3.5rem] py-2 px-4 justify-start text-left relative break-words",
                  isAnswered && option === studyQueue[currentIndex].options[['A', 'B', 'C', 'D'].indexOf(studyQueue[currentIndex].answer)] && "border-green-500 border-2 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20",
                  isAnswered && selectedAnswer === option && option !== studyQueue[currentIndex].options[['A', 'B', 'C', 'D'].indexOf(studyQueue[currentIndex].answer)] && "border-red-500 border-2 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20",
                  !isAnswered && "hover:bg-accent"
                )}
                onClick={() => handleAnswerSelect(option)}
                disabled={isAnswered}
              >
                <div className="flex items-center justify-between w-full gap-2">
                  <span className="line-clamp-3">{option}</span>
                  {isAnswered && option === studyQueue[currentIndex].options[['A', 'B', 'C', 'D'].indexOf(studyQueue[currentIndex].answer)] && (
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm text-green-600 dark:text-green-400">Correct</span>
                      <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                  )}
                  {isAnswered && selectedAnswer === option && option !== studyQueue[currentIndex].options[['A', 'B', 'C', 'D'].indexOf(studyQueue[currentIndex].answer)] && (
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm text-red-600 dark:text-red-400">Incorrect</span>
                      <X className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                  )}
                </div>
              </Button>
            ))}
          </div>

          <AnimatePresence>
            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6"
              >
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-medium mb-2">Explanation</h3>
                  <p className="text-sm text-muted-foreground">
                    {currentQuestion.explanation}
                  </p>
                </div>
                <Button
                  className="w-full mt-4"
                  onClick={moveToNext}
                >
                  Next Question
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
};

export default Learn; 