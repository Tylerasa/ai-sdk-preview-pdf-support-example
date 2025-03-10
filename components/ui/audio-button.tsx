import { useState } from 'react';
import { Button } from './button';
import { Volume2, Loader2 } from 'lucide-react';
import { textToSpeech } from '@/lib/elevenlabs';
import { toast } from 'sonner';

interface AudioButtonProps {
  text: string;
  className?: string;
}

export function AudioButton({ text, className = '' }: AudioButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const handlePlay = async () => {
    try {
      if (audio) {
        audio.play();
        return;
      }

      setIsLoading(true);
      const audioUrl = await textToSpeech(text);
      const newAudio = new Audio(audioUrl);
      
      newAudio.addEventListener('ended', () => {
        URL.revokeObjectURL(audioUrl);
        setAudio(null);
      });

      setAudio(newAudio);
      newAudio.play();
    } catch (error) {
      toast.error('Failed to generate audio');
      console.error('Error generating audio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      className={className}
      onClick={handlePlay}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Volume2 className="h-4 w-4" />
      )}
    </Button>
  );
} 