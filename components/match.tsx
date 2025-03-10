import { FC, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ArrowLeft, Timer, Trophy, Heart, Star, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useXP } from '@/lib/xp-context';

interface MatchProps {
  questions: Array<{
    question: string;
    answer: string;
    options: string[];
    explanation: string;
  }>;
  onBack: () => void;
}

interface MatchItem {
  id: string;
  content: string;
  type: 'question' | 'answer';
  isSelected: boolean;
  isMatched: boolean;
  originalIndex: number;
  isWrong?: boolean;
}

const Match: FC<MatchProps> = ({ questions, onBack }) => {
  const { addXP } = useXP();
  const [matchItems, setMatchItems] = useState<MatchItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [streak, setStreak] = useState(0);
  const [showStreak, setShowStreak] = useState(false);

  // Initialize match items
  useEffect(() => {
    // Create array of questions and their correct answers
    const items = questions.flatMap((q, index) => [
      {
        id: `q${index}`,
        content: q.question,
        type: 'question' as const,
        isSelected: false,
        isMatched: false,
        originalIndex: index,
      },
      {
        id: `a${index}`,
        content: q.answer, // Use the direct answer
        type: 'answer' as const,
        isSelected: false,
        isMatched: false,
        originalIndex: index,
      },
    ]);
    
    // Keep questions in order, shuffle only the answers
    const questionItems = items.filter(item => item.type === 'question');
    const answerItems = shuffleArray(items.filter(item => item.type === 'answer'));
    
    setMatchItems([...questionItems, ...answerItems]);
    setMatchedPairs(0);
    setHearts(3);
    setStreak(0);
  }, [questions]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && !completed) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, completed]);

  const shuffleArray = <T extends unknown>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleItemClick = (id: string) => {
    const clickedItem = matchItems.find(item => item.id === id);
    if (!clickedItem || clickedItem.isMatched) return;

    if (!isActive) {
      setIsActive(true);
    }

    if (!selectedItem || selectedItem === id) {
      if (selectedItem) {
        const currentlySelected = matchItems.find(item => item.id === selectedItem);
        if (currentlySelected?.type === clickedItem.type) {
          return;
        }
      }
      
      setSelectedItem(selectedItem === id ? null : id);
      setMatchItems(items =>
        items.map(item =>
          item.id === id ? { ...item, isSelected: !item.isSelected, isWrong: false } : { ...item, isWrong: false }
        )
      );
      return;
    }

    const firstItem = matchItems.find(item => item.id === selectedItem)!;
    const secondItem = clickedItem;

    if (firstItem.type === secondItem.type) {
      return;
    }

    const isPair = firstItem.originalIndex === secondItem.originalIndex;

    if (isPair) {
      const newMatchedPairs = matchedPairs + 1;
      setMatchedPairs(newMatchedPairs);
      
      setMatchItems(items =>
        items.map(item =>
          item.id === selectedItem || item.id === id
            ? { ...item, isMatched: true, isSelected: false, isWrong: false }
            : { ...item, isWrong: false }
        )
      );

      // Update streak
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > 0 && newStreak % 3 === 0) {
        setShowStreak(true);
        setTimeout(() => setShowStreak(false), 2000);
      }
      
      if (newMatchedPairs === questions.length) {
        setCompleted(true);
        setIsActive(false);
      }
    } else {
      setMatchItems(items =>
        items.map(item =>
          item.id === id || item.id === selectedItem
            ? { ...item, isSelected: true, isWrong: true }
            : item
        )
      );
      
      setHearts(prev => Math.max(0, prev - 1));
      setStreak(0);

      setTimeout(() => {
        setMatchItems(items =>
          items.map(item =>
            (item.id === selectedItem || item.id === id) && !item.isMatched
              ? { ...item, isSelected: false, isWrong: false }
              : { ...item, isWrong: false }
          )
        );
      }, 1000);

      if (hearts <= 1) {
        setCompleted(true);
        setIsActive(false);
      }
    }
    
    setSelectedItem(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateXP = () => {
    const baseXP = 20;
    const timeBonus = Math.max(0, 50 - Math.floor(timer / 10));
    const streakBonus = Math.floor(streak / 3) * 5;
    const heartsBonus = hearts * 5;
    return baseXP + timeBonus + streakBonus + heartsBonus;
  };

  useEffect(() => {
    if (completed && matchedPairs === questions.length) {
      const earnedXP = calculateXP();
      addXP(earnedXP);
    }
  }, [completed, matchedPairs, questions.length]);

  const resetGame = () => {
    const questionItems = matchItems
      .filter(item => item.type === 'question')
      .map(item => ({ ...item, isMatched: false, isSelected: false, isWrong: false }));
    
    const answerItems = shuffleArray(
      matchItems
        .filter(item => item.type === 'answer')
        .map(item => ({ ...item, isMatched: false, isSelected: false, isWrong: false }))
    );
    
    setMatchItems([...questionItems, ...answerItems]);
    setSelectedItem(null);
    setCompleted(false);
    setTimer(0);
    setIsActive(false);
    setMatchedPairs(0);
    setHearts(3);
    setStreak(0);
  };

  if (completed) {
    const hasWon = matchedPairs === questions.length;
    const earnedXP = hasWon ? calculateXP() : 0;

    return (
      <div className="container max-w-2xl mx-auto p-4">
        <Card className="p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            {hasWon ? (
              <div className="relative">
                <Trophy className="w-24 h-24 mx-auto mb-6 text-[#FFD700]" />
                <motion.div
                  className="absolute inset-0"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  <Sparkles className="w-24 h-24 mx-auto text-[#FFD700] opacity-50" />
                </motion.div>
              </div>
            ) : (
              <div className="mb-6">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Heart className="w-24 h-24 mx-auto text-red-500" />
                </motion.div>
              </div>
            )}
            
            <h2 className="text-3xl font-bold mb-4">
              {hasWon ? "Great job!" : "Keep practicing!"}
            </h2>
            
            <div className="space-y-4 mb-8">
              {hasWon && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-[#58CC02]"
                >
                  +{earnedXP} XP
                </motion.div>
              )}
              <div className="flex justify-center gap-4 text-lg">
                <div className="flex items-center gap-2">
                  <Timer className="w-5 h-5 text-[#58CC02]" />
                  <span>{formatTime(timer)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  <span>{hearts}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-[#FFD700]" />
                  <span>{streak}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Button
                onClick={resetGame}
                className="bg-[#58CC02] hover:bg-[#58CC02]/90 text-white font-bold py-3 px-6 rounded-xl text-lg"
              >
                Practice Again
              </Button>
              <Button
                variant="outline"
                onClick={onBack}
                className="border-2 border-[#E5E5E5] hover:bg-[#E5E5E5]/10 font-bold py-3 px-6 rounded-xl text-lg"
              >
                Choose Another Exercise
              </Button>
            </div>
          </motion.div>
        </Card>
      </div>
    );
  }

  const questionItems = matchItems.filter(item => item.type === 'question');
  const answerItems = matchItems.filter(item => item.type === 'answer');

  return (
    <div className="container max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="flex items-center gap-4">
          <div className="flex -space-x-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart
                key={i}
                className={cn(
                  "w-6 h-6",
                  i < hearts ? "text-red-500" : "text-gray-300"
                )}
                fill={i < hearts ? "currentColor" : "none"}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 text-[#58CC02] font-bold">
            <Star className="w-5 h-5" />
            {streak}
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Timer className="w-4 h-4" />
            {formatTime(timer)}
          </div>
        </div>
      </div>

      {showStreak && (
        <motion.div
          initial={{ scale: 0, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0, y: 50 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#58CC02] text-white px-6 py-3 rounded-full font-bold text-lg flex items-center gap-2"
        >
          <Star className="w-6 h-6 text-[#FFD700]" />
          {streak} in a row!
        </motion.div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          {questionItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={cn(
                  'cursor-pointer transition-all duration-200 hover:shadow-md relative mb-2 min-h-[60px] border-2',
                  item.isMatched && 'bg-[#58CC02]/10 border-[#58CC02]',
                  item.isWrong && 'bg-red-100 border-red-500 shake',
                  item.isSelected && !item.isWrong && 'border-[#58CC02]',
                  !item.isMatched && !item.isSelected && 'hover:border-[#58CC02]/50'
                )}
                onClick={() => handleItemClick(item.id)}
              >
                <div className="p-3 flex items-center">
                  <span className="text-base font-bold text-muted-foreground mr-3">{index + 1}.</span>
                  <p className={cn(
                    'text-sm flex-1',
                    item.isMatched && 'text-[#58CC02] font-medium',
                    item.isWrong && 'text-red-500'
                  )}>
                    {item.content}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div>
          {answerItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={cn(
                  'cursor-pointer transition-all duration-200 hover:shadow-md relative mb-2 min-h-[60px] border-2',
                  item.isMatched && 'bg-[#58CC02]/10 border-[#58CC02]',
                  item.isWrong && 'bg-red-100 border-red-500 shake',
                  item.isSelected && !item.isWrong && 'border-[#58CC02]',
                  !item.isMatched && !item.isSelected && 'hover:border-[#58CC02]/50'
                )}
                onClick={() => handleItemClick(item.id)}
              >
                <div className="p-3 flex items-center">
                  <span className="text-base font-bold text-muted-foreground mr-3">{questionItems.length + index + 1}.</span>
                  <p className={cn(
                    'text-sm flex-1',
                    item.isMatched && 'text-[#58CC02] font-medium',
                    item.isWrong && 'text-red-500'
                  )}>
                    {item.content}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Match; 