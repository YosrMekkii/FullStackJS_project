import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, X, AlertTriangle } from 'lucide-react';

interface ActiveChallengeProps {
  challenge: {
    id: string;
    title: string;
    description: string;
    type: 'coding' | 'quiz' | 'interactive';
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    xp: number;
    timeLimit: number;
    content?: {
      question?: string;
      options?: string[];
      code?: string;
      correctAnswer?: string | string[];
    };
  };
  onComplete: (success: boolean) => void;
  onClose: () => void;
}

const ActiveChallenge: React.FC<ActiveChallengeProps> = ({ challenge, onComplete, onClose }) => {
  const [timeLeft, setTimeLeft] = useState(challenge.timeLimit * 60); // Convert minutes to seconds
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!submitted) {
            handleSubmit();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const success = checkAnswer();
    setIsCorrect(success);
    onComplete(success);
  };

  const checkAnswer = () => {
    if (!challenge.content?.correctAnswer) return false;
    
    if (Array.isArray(challenge.content.correctAnswer)) {
      return challenge.content.correctAnswer.includes(answer);
    }
    
    return answer.toLowerCase() === challenge.content.correctAnswer.toLowerCase();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Challenge Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">{challenge.title}</h2>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 ${
                timeLeft < 60 ? 'text-red-600' : 'text-gray-600'
              }`}>
                <Clock className="h-5 w-5" />
                <span className="font-mono font-medium">{formatTime(timeLeft)}</span>
              </div>
              {!submitted && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Challenge Content */}
        <div className="p-6">
          {!submitted ? (
            <div className="space-y-6">
              <div className="prose max-w-none">
                <p className="text-gray-600">{challenge.description}</p>
              </div>

              {challenge.type === 'quiz' && challenge.content?.options && (
                <div className="space-y-3">
                  {challenge.content.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => setAnswer(option)}
                      className={`w-full p-4 text-left rounded-lg border ${
                        answer === option
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}

              {challenge.type === 'coding' && (
                <div className="space-y-4">
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap">{challenge.content?.code}</pre>
                  </div>
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Write your solution here..."
                    className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              )}

              {challenge.type === 'interactive' && (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type your answer..."
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              {isCorrect ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <div className="bg-green-100 rounded-full p-3">
                      <CheckCircle className="h-12 w-12 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Challenge Completed!</h3>
                  <p className="text-gray-600">You've earned {challenge.xp} XP</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <div className="bg-red-100 rounded-full p-3">
                      <AlertTriangle className="h-12 w-12 text-red-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Time's Up!</h3>
                  <p className="text-gray-600">Don't worry, you can try again later</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Challenge Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-end space-x-4">
            {submitted ? (
              <button
                onClick={onClose}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Close
              </button>
            ) : (
              <>
                <button
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Give Up
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Submit
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveChallenge;