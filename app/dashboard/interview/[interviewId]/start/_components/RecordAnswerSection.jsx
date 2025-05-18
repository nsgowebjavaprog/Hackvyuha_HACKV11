"use client";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";
import useSpeechToText from "react-hook-speech-to-text";
import { toast } from "sonner";
import { ChatSession } from "@/utils/GeminiAIModal";
import { db } from "@/utils/db";
import { UserAnswer } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import moment from "moment";

function RecordAnswerSection({
  mockInterviewQuestion = [],
  activeQuestionIndex = 0,
  interviewData,
  onAnswerSaved
}) {
  const [userAnswer, setUserAnswer] = useState("");
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const debounceRef = useRef(false);

  const {
    error,
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
    setResults,
  } = useSpeechToText({ continuous: true, useLegacyResults: false });

  useEffect(() => {
    setUserAnswer("");
    setResults([]);
    setHasSubmitted(false);
    debounceRef.current = false;
  }, [activeQuestionIndex]);

  useEffect(() => {
    if (results && Array.isArray(results)) {
      const newTranscripts = results.map(result => result?.transcript || "").filter(Boolean);
      if (newTranscripts.length > 0) {
        setUserAnswer((prevAns) => prevAns + " " + newTranscripts.join(" "));
      }
    }
  }, [results]);

  useEffect(() => {
    if (!isRecording && userAnswer.length > 10 && !hasSubmitted && !debounceRef.current) {
      debounceRef.current = true;
      UpdateUserAnswer();
    }
    // eslint-disable-next-line
  }, [isRecording]);

  const StartStopRecording = async () => {
    if (isRecording) {
      stopSpeechToText();
    } else {
      setUserAnswer("");
      setResults([]);
      startSpeechToText();
    }
  };

  const UpdateUserAnswer = async () => {
    if (!userAnswer || userAnswer.trim().length < 10) {
      toast.error("Please record a longer answer before submitting.");
      return;
    }
    if (!mockInterviewQuestion[activeQuestionIndex]) {
      toast.error("No question found.");
      return;
    }
    if (!user) {
      toast.error("Please log in to submit your answer.");
      return;
    }
    setLoading(true);
    setHasSubmitted(true);

    try {
      const feedbackPrompt =
        "Question:" +
        mockInterviewQuestion[activeQuestionIndex]?.question +
        ",User Answer:" +
        userAnswer +
        ", Depends on question and user answer for given interview question" +
        " please give the rating for answer and feedback as area of improvement if any" +
        " in just 3 to 5 lines to improve it in JSON format with rating field and feedback field";

      const result = await ChatSession.sendMessage(feedbackPrompt);
      const mockJsonResp = (await result.response.text()).replace(/``````/g, "");
      let JsonFeedbackResp;
      try {
        JsonFeedbackResp = JSON.parse(mockJsonResp);
      } catch (e) {
        JsonFeedbackResp = { feedback: "Error processing feedback", rating: "N/A" };
      }

      // Use mockId, not id, and correct createdAt!
      await db.insert(UserAnswer).values({
        mockIdRef: String(interviewData?.mockId),
        question: mockInterviewQuestion[activeQuestionIndex]?.question,
        correctAns: mockInterviewQuestion[activeQuestionIndex]?.answer,
        userAns: userAnswer,
        feedback: JsonFeedbackResp?.feedback || "No feedback provided",
        rating: JsonFeedbackResp?.rating || "0",
        userEmail: user?.primaryEmailAddress?.emailAddress || user?.primaryAddress?.emailAddress || "anonymous",
        createdAt: moment().format("DD-MM-YYYY"),
      });

      toast.success("Answer recorded successfully!");
      setUserAnswer("");
      setResults([]);
      setHasSubmitted(false);
      debounceRef.current = false;

      if (onAnswerSaved) onAnswerSaved();
    } catch (error) {
      toast.error("Failed to save your answer. Please try again.");
      setHasSubmitted(false);
      debounceRef.current = false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center bg-white p-8 rounded-2xl shadow-lg max-w-2xl mx-auto mt-8">
      <div className="relative w-60 h-60 flex items-center justify-center mb-6">
        <Image
          src={"/webcam.jpg"}
          width={240}
          height={240}
          className="absolute rounded-xl"
          alt="Webcam background"
        />
        <Webcam
          mirrored={true}
          className="rounded-xl border-2 border-blue-200 shadow-lg relative z-10"
          style={{
            height: 240,
            width: 240,
          }}
        />
      </div>

      {userAnswer && (
        <div className="w-full mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 shadow">
          <h3 className="text-sm font-semibold mb-1">Your Answer:</h3>
          <p className="text-base">{userAnswer}</p>
        </div>
      )}

      <Button
        disabled={loading}
        variant="outline"
        className={`my-6 px-8 py-3 rounded-full font-semibold text-lg transition-colors
          ${isRecording ? 'bg-red-100 text-red-600 border-red-400' : 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600'}
        `}
        onClick={StartStopRecording}
      >
        {isRecording ? (
          <span className="flex items-center gap-2">
            <Mic className="animate-pulse" /> Stop Recording
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Mic /> Record Answer
          </span>
        )}
      </Button>
    </div>
  );
}

export default RecordAnswerSection;
