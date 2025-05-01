import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface ChallengeProps {
  challenge: {
    _id: string;
    title: string;
    description: string;
    type: 'coding' | 'quiz' | 'interactive';
    difficulty: string;
    xp: number;
    timeLimit: number;
    content?: {
      question?: string;
      options?: string[];
      code?: string;
      correctAnswer?: string | string[];
    };
  };
  onComplete: (challengeId: string, success: boolean) => void;
}

const ActiveChallenge: React.FC<ChallengeProps> = ({ challenge, onComplete }) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(challenge.timeLimit * 60);
  const [answer, setAnswer] = useState<string>('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [codeInput, setCodeInput] = useState<string>(challenge.content?.code || '');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'warning' | null; message: string }>({
    type: null,
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  // Timer effect
  useEffect(() => {
    if (timeRemaining > 0 && !hasSubmitted) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && !hasSubmitted) {
      // Time's up
      setFeedback({
        type: 'warning',
        message: 'Time\'s up! Challenge not completed.',
      });
      setHasSubmitted(true);
      onComplete(challenge._id, false);
    }
  }, [timeRemaining, hasSubmitted, challenge._id, onComplete]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Handle option selection for multiple choice questions
  const toggleOption = (option: string) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter((o) => o !== option));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  // Submit answer
  const handleSubmit = () => {
    setIsSubmitting(true);
    setHasSubmitted(true);
    
    try {
      let isCorrect = false;
      
      // Different validation based on challenge type
      if (challenge.type === 'quiz') {
        // For single answer questions
        if (typeof challenge.content?.correctAnswer === 'string') {
          isCorrect = answer === challenge.content?.correctAnswer;
        } 
        // For multiple choice questions
        else if (Array.isArray(challenge.content?.correctAnswer)) {
          // Check if selected options match the correct answers
          const correctAnswers = challenge.content?.correctAnswer || [];
          isCorrect = 
            selectedOptions.length === correctAnswers.length && 
            selectedOptions.every(option => correctAnswers.includes(option));
        }
      } 
      // For coding challenges, we would typically send to a backend for validation
      else if (challenge.type === 'coding') {
        // Simple validation for demonstration purposes
        // In a real app, this would be validated on the backend
        isCorrect = codeInput.includes('function') && codeInput.length > 20;
      }
      // For interactive challenges
      else if (challenge.type === 'interactive') {
        // Simple validation for demonstration
        isCorrect = answer.trim().length > 0;
      }
      
      // Set feedback based on result
      if (isCorrect) {
        setFeedback({
          type: 'success',
          message: 'Correct! Challenge completed successfully.',
        });
        // Notify parent component
        onComplete(challenge._id, true);
      } else {
        setFeedback({
          type: 'error',
          message: 'Not quite right. Try again or review the solution.',
        });
        // Notify parent component
        onComplete(challenge._id, false);
      }
    } catch (error) {
      console.error('Error submitting challenge:', error);
      setFeedback({
        type: 'error',
        message: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render different challenge types
  const renderChallengeContent = () => {
    switch (challenge.type) {
      case 'quiz':
        return (
          <div>
            <h3 className="text-lg font-medium mb-4">{challenge.content?.question}</h3>
            {challenge.content?.options?.map((option, index) => (
              <div key={index} className="mb-3">
                <label className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                  <input
                    type={Array.isArray(challenge.content?.correctAnswer) ? "checkbox" : "radio"}
                    name="quizOption"
                    value={option}
                    checked={
                      Array.isArray(challenge.content?.correctAnswer)
                        ? selectedOptions.includes(option)
                        : answer === option
                    }
                    onChange={() => {
                      if (Array.isArray(challenge.content?.correctAnswer)) {
                        toggleOption(option);
                      } else {
                        setAnswer(option);
                      }
                    }}
                    className="h-5 w-5 text-indigo-600"
                    disabled={hasSubmitted}
                  />
                  <span className="text-gray-800">{option}</span>
                </label>
              </div>
            ))}
          </div>
        );
      
      case 'coding':
        return (
          <div>
            <h3 className="text-lg font-medium mb-4">{challenge.content?.question}</h3>
            <div className="mb-4">
              <textarea
                className="w-full h-64 p-4 font-mono text-sm bg-gray-900 text-gray-100 rounded-lg"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                placeholder="Write your code here..."
                disabled={hasSubmitted}
              />
            </div>
          </div>
        );
      
      case 'interactive':
        return (
          <div>
            <h3 className="text-lg font-medium mb-4">{challenge.content?.question}</h3>
            <div className="mb-4">
              <textarea
                className="w-full h-32 p-4 border border-gray-300 rounded-lg"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Write your answer here..."
                disabled={hasSubmitted}
              />
            </div>
          </div>
        );
      
      default:
        return (
          <div className="flex items-center justify-center h-40">
            <p className="text-gray-500">Challenge content not available</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Timer */}
      <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-between">
        <div className="flex items-center">
          <Clock className="h-5 w-5 text-gray-600 mr-2" />
          <span className="font-medium">Time Remaining</span>
        </div>
        <div className={`font-mono text-xl font-bold ${timeRemaining < 60 ? 'text-red-600' : 'text-gray-800'}`}>
          {formatTime(timeRemaining)}
        </div>
      </div>

      {/* Challenge instructions */}
      <div className="bg-indigo-50 p-4 rounded-lg">
        <h3 className="font-medium text-indigo-800 mb-2">Instructions</h3>
        <p className="text-indigo-700">{challenge.description}</p>
      </div>

      {/* Challenge content */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {renderChallengeContent()}
      </div>

      {/* Feedback message */}
      {feedback.type && (
        <div className={`p-4 rounded-lg flex items-start space-x-3 ${
          feedback.type === 'success' ? 'bg-green-100 text-green-800' :
          feedback.type === 'error' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {feedback.type === 'success' ? (
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
          ) : feedback.type === 'error' ? (
            <XCircle className="h-5 w-5 flex-shrink-0" />
          ) : (
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          )}
          <p>{feedback.message}</p>
        </div>
      )}

      {/* Submit button */}
      <div className="flex justify-end">
        {!hasSubmitted ? (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Answer'}
          </button>
        ) : (
          <button
            onClick={() => onComplete(challenge._id, false)}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
};

export default ActiveChallenge;