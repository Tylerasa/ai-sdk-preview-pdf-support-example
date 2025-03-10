import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface QuizScoreProps {
  correctAnswers: number;
  totalQuestions: number;
  earnedXP: number;
}

export default function QuizScore({
  correctAnswers,
  totalQuestions,
  earnedXP,
}: QuizScoreProps) {
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);

  const getMessage = () => {
    if (percentage === 100) return "Perfect score! Congratulations!";
    if (percentage >= 80) return "Great job! You did excellently!";
    if (percentage >= 60) return "Good effort! You're on the right track.";
    if (percentage >= 40) return "Not bad, but there's room for improvement.";
    return "Keep practicing, you'll get better!";
  };

  return (
    <div className="text-center space-y-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
      >
        <h2 className="text-4xl font-bold mb-2">
          {percentage}%
        </h2>
        <p className="text-xl text-muted-foreground">
          You got {correctAnswers} out of {totalQuestions} questions correct
        </p>
        {earnedXP > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 text-2xl font-bold text-[#58CC02] flex items-center justify-center gap-2"
          >
            <Star className="w-6 h-6 text-[#FFD700]" fill="currentColor" />
            +{earnedXP} XP
          </motion.div>
        )}
      </motion.div>
      <p className="text-center font-medium">{getMessage()}</p>
    </div>
  );
}
