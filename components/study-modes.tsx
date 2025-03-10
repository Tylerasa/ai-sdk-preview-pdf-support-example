import { FC } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { ScrollText, Brain, Gamepad2, TestTube, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Progress } from './ui/progress';
import { useXP } from '@/lib/xp-context';

interface StudyModesProps {
  title: string;
  questions: Array<{
    question: string;
    answer: string;
    options: string[];
    explanation: string;
  }>;
  onModeSelect: (mode: 'flashcards' | 'learn' | 'match' | 'test') => void;
  onBack: () => void;
}

const StudyModes: FC<StudyModesProps> = ({ title, onModeSelect, onBack }) => {
  const { totalXP } = useXP();

  const modes = [
    {
      name: 'Flashcards',
      description: 'Review with interactive cards',
      icon: ScrollText,
      mode: 'flashcards' as const,
      color: 'bg-[#58CC02]',
      textColor: 'text-[#58CC02]',
      progress: 0,
      xpRange: '5-50 XP',
      xpDescription: 'Based on time spent and cards reviewed'
    },
    {
      name: 'Learn',
      description: 'Practice with multiple choice',
      icon: Brain,
      mode: 'learn' as const,
      color: 'bg-[#CE82FF]',
      textColor: 'text-[#CE82FF]',
      progress: 0,
      xpRange: '10-40 XP',
      xpDescription: 'Based on correct answers and streaks'
    },
    {
      name: 'Match',
      description: 'Match pairs quickly',
      icon: Gamepad2,
      mode: 'match' as const,
      color: 'bg-[#FF9600]',
      textColor: 'text-[#FF9600]',
      progress: 0,
      xpRange: '20-75 XP',
      xpDescription: 'Based on speed, hearts, and streaks'
    },
    {
      name: 'Test',
      description: 'Test your knowledge',
      icon: TestTube,
      mode: 'test' as const,
      color: 'bg-[#FF4B4B]',
      textColor: 'text-[#FF4B4B]',
      progress: 0,
      xpRange: '15-60 XP',
      xpDescription: 'Based on test performance'
    },
  ];

  return (
    <div className="container max-w-2xl mx-auto p-4">
      <div className="mb-8 text-center">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4"
        >
          ← Back to Upload
        </Button>
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        <p className="text-muted-foreground">
          Choose an exercise to begin
        </p>
      </div>

      <div className="space-y-4">
        {modes.map((mode) => (
          <motion.div
            key={mode.name}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-[#E5E5E5]"
              onClick={() => onModeSelect(mode.mode)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`${mode.color} p-4 rounded-2xl shrink-0`}>
                    <mode.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold mb-1">{mode.name}</h2>
                    <p className="text-sm text-muted-foreground mb-2">
                      {mode.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="w-4 h-4 text-[#FFD700]" fill="currentColor" />
                      <span className={`font-medium ${mode.textColor}`}>{mode.xpRange}</span>
                      <span className="text-muted-foreground text-xs">• {mode.xpDescription}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-center gap-2 shrink-0">
                    <Progress value={mode.progress} className="w-16 h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFF4E5] text-[#FF9600] rounded-lg">
          <Star className="h-5 w-5 text-[#FFD700]" fill="currentColor" />
          <span className="font-medium">Total XP: {totalXP}</span>
        </div>
      </div>
    </div>
  );
};

export default StudyModes; 