import { Lightbulb, Volume2 } from 'lucide-react'
import React from 'react'

function QuestionsSection({
  mockInterviewQuestion = [],
  activeQuestionIndex = 0,
  onJumpToQuestion
}) {
  const textToSpeech = (text) => {
    if ('speechSynthesis' in window) {
      const speech = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(speech)
    } else {
      alert('Your browser does not support text to speech')
    }
  }

  if (!mockInterviewQuestion.length) {
    return (
      <div className="p-8 border rounded-2xl my-10 bg-white shadow-lg max-w-2xl mx-auto text-center text-gray-500">
        No questions available for this interview.
      </div>
    );
  }

  return (
    <div className="p-8 border rounded-2xl my-10 bg-white shadow-lg max-w-2xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {mockInterviewQuestion.map((_, index) => (
          <button
            key={index}
            type="button"
            aria-current={activeQuestionIndex === index ? "step" : undefined}
            onClick={() => onJumpToQuestion && onJumpToQuestion(index)}
            className={`p-2 rounded-full text-xs md:text-sm text-center font-semibold cursor-pointer transition-colors outline-none
              ${activeQuestionIndex === index
                ? 'bg-blue-600 text-white shadow ring-2 ring-blue-400'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}
            `}
          >
            Question {index + 1}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-lg font-semibold flex-1">{mockInterviewQuestion[activeQuestionIndex]?.question}</h2>
        <button
          aria-label="Read question aloud"
          className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition"
          onClick={() => textToSpeech(mockInterviewQuestion[activeQuestionIndex]?.question)}
        >
          <Volume2 className="text-blue-600" />
        </button>
      </div>

      <div className="border rounded-xl p-5 bg-blue-50 flex items-start gap-3 mt-12">
        <Lightbulb className="text-blue-400 mt-1" />
        <div>
          <strong className="text-blue-700 block mb-1">Note:</strong>
          <span className="text-blue-700 text-sm">
            {process.env.NEXT_PUBLIC_QUESTION_NOTE || "Think out loud and answer confidently!"}
          </span>
        </div>
      </div>
    </div>
  )
}

export default QuestionsSection
