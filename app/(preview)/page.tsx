"use client";

import { useState } from "react";
import { experimental_useObject } from "ai/react";
import { questionsSchema } from "@/lib/schemas";
import { z } from "zod";
import { toast } from "sonner";
import { FileUp, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Quiz from "@/components/quiz";
import { Link } from "@/components/ui/link";
import NextLink from "next/link";
import { generateQuizTitle } from "./actions";
import { AnimatePresence, motion } from "framer-motion";
import { VercelIcon, GitIcon } from "@/components/icons";
import StudyModes from '@/components/study-modes';
import Flashcards from '@/components/flashcards';
import Learn from '@/components/learn';
import Match from '@/components/match';
import { XPProvider, useXP } from '@/lib/xp-context';
import { Star } from 'lucide-react';

function XPDisplay() {
  const { totalXP } = useXP();
  return (
    <div className="fixed top-4 right-4 bg-[#58CC02] text-white px-4 py-2 rounded-full font-bold text-lg flex items-center gap-2">
      <Star className="w-5 h-5 text-[#FFD700]" fill="currentColor" />
      {totalXP} XP
    </div>
  );
}

function UploadUI({ 
  files, 
  handleFileChange, 
  handleSubmitWithFiles, 
  isLoading, 
  progress, 
  partialQuestions, 
  isDragging,
  setIsDragging
}: { 
  files: File[];
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmitWithFiles: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  progress: number;
  partialQuestions: any;
  isDragging: boolean;
  setIsDragging: (value: boolean) => void;
}) {
  return (
    <div
      className="min-h-[100dvh] w-full flex justify-center"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragExit={() => setIsDragging(false)}
      onDragEnd={() => setIsDragging(false)}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileChange({
          target: { files: e.dataTransfer.files },
        } as React.ChangeEvent<HTMLInputElement>);
      }}
    >
      <AnimatePresence>
        {isDragging && (
          <motion.div
            className="fixed pointer-events-none dark:bg-zinc-900/90 h-dvh w-dvw z-10 justify-center items-center flex flex-col gap-1 bg-zinc-100/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div>Drag and drop files here</div>
            <div className="text-sm dark:text-zinc-400 text-zinc-500">
              {"(PDFs only)"}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <Card className="w-full max-w-md h-full border-0 sm:border sm:h-fit mt-12">
        <CardHeader className="text-center space-y-6">
          <div className="mx-auto flex items-center justify-center space-x-2">
            <div className="rounded-2xl bg-[#58CC02] p-4">
              <FileUp className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold">
              Learn from Any PDF
            </CardTitle>
            <CardDescription className="text-base">
              Upload a PDF and we'll create interactive exercises to help you learn the content
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitWithFiles} className="space-y-4">
            <div
              className={`relative flex flex-col items-center justify-center border-2 border-dashed border-[#58CC02]/25 rounded-xl p-6 transition-colors hover:border-[#58CC02]/50 bg-[#58CC02]/5`}
            >
              <input
                type="file"
                onChange={handleFileChange}
                accept="application/pdf"
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <FileUp className="h-8 w-8 mb-2 text-[#58CC02]" />
              <p className="text-sm text-center">
                {files.length > 0 ? (
                  <span className="font-medium text-[#58CC02]">
                    {files[0].name}
                  </span>
                ) : (
                  <span className="text-[#58CC02]/80">Drop your PDF here or click to browse</span>
                )}
              </p>
            </div>
            <Button
              type="submit"
              className="w-full bg-[#58CC02] hover:bg-[#58CC02]/90 text-white font-bold py-4 rounded-xl"
              disabled={files.length === 0}
            >
              {isLoading ? (
                <span className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating your exercises...</span>
                </span>
              ) : (
                "Start Learning"
              )}
            </Button>
          </form>
        </CardContent>
        {isLoading && (
          <CardFooter className="flex flex-col space-y-4">
            <div className="w-full space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-[#58CC02] font-medium">Progress</span>
                <span className="text-[#58CC02] font-medium">{Math.round(progress)}%</span>
              </div>
              <div className="relative w-full h-3 bg-[#58CC02]/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#58CC02] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <div className="w-full">
              <div className="flex items-center justify-center gap-2 text-sm">
                <div className="h-2 w-2 rounded-full bg-[#58CC02] animate-pulse" />
                <span className="text-[#58CC02] font-medium">
                  {partialQuestions
                    ? `Creating exercise ${partialQuestions.length + 1} of 4`
                    : "Analyzing your PDF"}
                </span>
              </div>
            </div>
          </CardFooter>
        )}
      </Card>
      <motion.div
        className="flex flex-row gap-4 items-center justify-between fixed bottom-6 text-xs"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <NextLink
          target="_blank"
          href="https://github.com/vercel-labs/ai-sdk-preview-pdf-support"
          className="flex flex-row gap-2 items-center border px-2 py-1.5 rounded-md hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800"
        >
          <GitIcon />
          View Source Code
        </NextLink>

        <NextLink
          target="_blank"
          href="https://vercel.com/templates/next.js/ai-quiz-generator"
          className="flex flex-row gap-2 items-center bg-zinc-900 px-2 py-1.5 rounded-md text-zinc-50 hover:bg-zinc-950 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-50"
        >
          <VercelIcon size={14} />
          Deploy with Vercel
        </NextLink>
      </motion.div>
    </div>
  );
}

function MainContent() {
  const [files, setFiles] = useState<File[]>([]);
  const [questions, setQuestions] = useState<z.infer<typeof questionsSchema>>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [title, setTitle] = useState<string>();
  const [studyMode, setStudyMode] = useState<'flashcards' | 'learn' | 'match' | 'test' | null>(null);

  const encodeFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const {
    submit,
    object: partialQuestions,
    isLoading,
  } = experimental_useObject({
    api: "/api/generate-quiz",
    schema: questionsSchema,
    initialValue: undefined,
    onError: () => {
      toast.error("Failed to generate quiz. Please try again.");
      setFiles([]);
    },
    onFinish: ({ object }) => {
      setQuestions(object ?? []);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (isSafari && isDragging) {
      toast.error(
        "Safari does not support drag & drop. Please use the file picker.",
      );
      return;
    }

    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(
      (file) => file.type === "application/pdf" && file.size <= 5 * 1024 * 1024,
    );

    if (validFiles.length !== selectedFiles.length) {
      toast.error("Only PDF files under 5MB are allowed.");
    }

    setFiles(validFiles);
  };

  const handleSubmitWithFiles = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const encodedFiles = await Promise.all(
      files.map(async (file) => ({
        name: file.name,
        type: file.type,
        data: await encodeFileAsBase64(file),
      })),
    );
    submit({ files: encodedFiles });
    const generatedTitle = await generateQuizTitle(encodedFiles[0].name);
    setTitle(generatedTitle);
  };

  const clearPDF = () => {
    setFiles([]);
    setQuestions([]);
    setStudyMode(null);
  };

  const progress = partialQuestions ? (partialQuestions.length / 4) * 100 : 0;

  if (questions.length === 0) {
    return (
      <UploadUI
        files={files}
        handleFileChange={handleFileChange}
        handleSubmitWithFiles={handleSubmitWithFiles}
        isLoading={isLoading}
        progress={progress}
        partialQuestions={partialQuestions}
        isDragging={isDragging}
        setIsDragging={setIsDragging}
      />
    );
  }

  return (
    <div className="container mx-auto p-4">
      <XPDisplay />
      {!studyMode && (
        <StudyModes 
          title={title ?? "Quiz"}
          questions={questions}
          onModeSelect={setStudyMode}
          onBack={clearPDF}
        />
      )}
      {studyMode === 'flashcards' && (
        <Flashcards questions={questions} onBack={() => setStudyMode(null)} />
      )}
      {studyMode === 'match' && (
        <Match 
          questions={questions.map(q => ({
            ...q,
            question: q.question,
            answer: q.options[['A', 'B', 'C', 'D'].indexOf(q.answer)],
            options: q.options
          }))} 
          onBack={() => setStudyMode(null)} 
        />
      )}
      {studyMode === 'learn' && (
        <Learn questions={questions} onBack={() => setStudyMode(null)} />
      )}
      {studyMode === 'test' && (
        <Quiz
          title={title ?? "Quiz"}
          questions={questions}
          clearPDF={clearPDF}
          onBack={() => setStudyMode(null)}
        />
      )}
    </div>
  );
}

export default function Page() {
  return (
    <XPProvider>
      <MainContent />
    </XPProvider>
  );
}
