"use client";
import React, { useState, useEffect } from "react";
import { UserAnswer } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { db } from "@/utils/db";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

function Feedback({ interviewId }) {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [overallRating, setOverallRating] = useState("N/A");
  const router = useRouter();

  useEffect(() => {
    if (interviewId) {
      GetFeedback();
    }
  }, [interviewId]);

  const GetFeedback = async () => {
    try {
      setLoading(true);
      const result = await db.select()
        .from(UserAnswer)
        .where(eq(UserAnswer.mockIdRef, String(interviewId)))
        .orderBy(UserAnswer.id);

      if (result && result.length > 0) {
        setFeedbackList(result);

        // Calculate overall rating
        const ratings = result.map(item => parseFloat(item.rating)).filter(r => !isNaN(r));
        if (ratings.length > 0) {
          const avgRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
          setOverallRating(avgRating.toFixed(1) + "/10");
        }
      }
    } catch (error) {
      setFeedbackList([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <span className="text-blue-600 text-lg font-semibold">Loading feedback...</span>
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-2xl shadow-lg mt-10">
      <h2 className="text-3xl font-bold text-green-600 mb-2">Congratulations!</h2>
      <h2 className="font-bold text-2xl mb-2">Here is your interview feedback</h2>
      <div className="bg-blue-50 p-4 rounded-lg my-4">
        <h2 className="text-blue-600 text-lg">
          Your Overall Interview Rating: <strong>{overallRating}</strong>
        </h2>
      </div>
      <h2 className="mb-6 text-gray-700">
        Find below each interview question, the correct answer, your answer, and feedback for improvement:
      </h2>

      {feedbackList.length === 0 ? (
        <div className="text-center p-6 bg-gray-50 rounded-lg border">
          No feedback available yet. Please check back later.
        </div>
      ) : (
        <div className="space-y-8">
          {feedbackList.map((item, index) => (
            <div key={index} className="p-6 rounded-xl border bg-gray-50 shadow">
              <div className="mb-2 text-lg font-semibold text-blue-700">
                Q{index + 1}: {item.question}
              </div>
              <div className="mb-2 text-sm text-gray-800">
                <span className="font-semibold text-blue-500">Rating:</span> {item.rating}/10
              </div>
              <div className="mb-2 text-sm text-gray-800">
                <span className="font-semibold text-red-500">Your Answer:</span> {item.userAns}
              </div>
              <div className="mb-2 text-sm text-gray-800">
                <span className="font-semibold text-green-600">Correct Answer:</span> {item.correctAns}
              </div>
              <div className="mb-2 text-sm text-gray-800">
                <span className="font-semibold text-blue-700">Feedback:</span> {item.feedback}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 flex justify-center">
        <Button
          onClick={() => router.replace('/dashboard')}
          className="px-8 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-full font-semibold text-lg shadow"
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
}

export default Feedback;