import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ArrowLeft, Timer, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MatchProps {
  questions: Array<{
    question: string;
    answer: string;
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
}

const Match: FC<MatchProps> = ({ questions, onBack }) => {
  const [matchItems, setMatchItems] = useState<MatchItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const shuffledItems = [...questions.flatMap((q, index) => [
      {
        id: `q${index}`,
        content: q.question,
        type: 'question' as const,
        isSelected: false,
        isMatched: false,
      },
      {
        id: `a${index}`,
        content: q.answer,
        type: 'answer' as const,
        isSelected: false,
        isMatched: false,
      },
    ])].sort(() => Math.random() - 0.5);
    
    setMatchItems(shuffledItems);
  }, [questions]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && !completed) {
      interval = setInterval(() => {
        setTimer((timer) => timer + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, completed]);

  const handleItemClick = (id: string) => {
    if (!isActive) {
      setIsActive(true);
    }

    const clickedItem = matchItems.find(item => item.id === id);
    if (!clickedItem || clickedItem.isMatched) return;

    if (!selectedItem) {
      setSelectedItem(id);
      setMatchItems(items =>
        items.map(item =>
          item.id === id ? { ...item, isSelected: true } : item
        )
      );
    } else {
      const firstItem = matchItems.find(item => item.id === selectedItem)!;
      const secondItem = clickedItem;

      if (
        (firstItem.id[0] === 'q' && secondItem.id[0] === 'a' ||
         firstItem.id[0] === 'a' && secondItem.id[0] === 'q') &&
        firstItem.id.slice(1) === secondItem.id.slice(1)
      ) {
        // Match found
        setMatchItems(items =>
          items.map(item =>
            item.id === selectedItem || item.id === id
              ? { ...item, isMatched: true, isSelected: false }
              : item
          )
        );

        // Check if all items are matched
        const allMatched = matchItems.every(
          item => (item.id === selectedItem || item.id === id) ? true : item.isMatched
        );
        if (allMatched) {
          setCompleted(true);
          setIsActive(false);
        }
      } else {
        // No match
        setMatchItems(items =>
          items.map(item =>
            item.id === selectedItem || item.id === id
              ? { ...item, isSelected: false }
              : item
          )
        );
      }
      setSelectedItem(null);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (completed) {
    return (
      <div className="container max-w-4xl mx-auto p-4">
        <Button variant="ghost" onClick={onBack} className="mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Study Modes
        </Button>
        <Card>
          <CardContent className="p-6 text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
            <h2 className="text-2xl font-bold mb-4">Congratulations!</h2>
            <p className="text-muted-foreground mb-2">
              You've matched all the pairs!
            </p>
            <p className="text-lg font-semibold mb-6">
              Time: {formatTime(timer)}
            </p>
            <Button onClick={() => {
              setCompleted(false);
              setTimer(0);
              setIsActive(false);
              const shuffledItems = [...matchItems].sort(() => Math.random() - 0.5)
                .map(item => ({ ...item, isMatched: false, isSelected: false }));
              setMatchItems(shuffledItems);
            }}>
              Play Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Study Modes
        </Button>
        <div className="flex items-center text-muted-foreground">
          <Timer className="w-4 h-4 mr-2" />
          {formatTime(timer)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {matchItems.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card
              className={cn(
                'cursor-pointer transition-all duration-200',
                item.isMatched && 'bg-green-100 dark:bg-green-900/30',
                item.isSelected && 'ring-2 ring-primary',
                !item.isMatched && 'hover:shadow-md'
              )}
              onClick={() => handleItemClick(item.id)}
            >
              <CardContent className="p-4">
                <p className={cn(
                  'text-sm',
                  item.isMatched && 'text-green-700 dark:text-green-300'
                )}>
                  {item.content}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Match; 