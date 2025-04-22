// Active Challenge Component
import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, X, AlertTriangle, Clock } from 'lucide-react';

interface ActiveChallengeProps {
  challenge: Challenge;
  onComplete: (success: boolean) => void;
  onClose: () => void;
}

const ActiveChallenge: React.FC<ActiveChallengeProps> = ({ challenge, onComplete, onClose }) => {
  const [timeLeft, setTimeLeft] = useState<number>(challenge.timeLimit * 60);
  const [answer, setAnswer] = useState<string>('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [codeValue, setCodeValue] = useState<string>(challenge.content?.code || '');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Format time as mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Set up timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Watch for timer completion
  useEffect(() => {
    if (timeLeft === 0) {
      handleSubmit();
    }
  }, [timeLeft]);

  const handleOptionToggle = (option: string) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter(item => item !== option));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    
    try {
      // We'll simulate checking the answer here
      // In a real app, you would validate with your API
      let isCorrect = false;
      
      if (challenge.type === 'quiz') {
        // For multiple choice questions
        if (Array.isArray(challenge.content?.correctAnswer)) {
          // Multi-select quiz
          isCorrect = JSON.stringify(selectedOptions.sort()) === 
                     JSON.stringify((challenge.content?.correctAnswer as string[]).sort());
        } else {
          // Single answer quiz
          isCorrect = answer === challenge.content?.correctAnswer;
        }
      } else if (challenge.type === 'coding') {
        // This would typically involve sending the code to an API for evaluation
        // For now, we'll just simulate success
        isCorrect = codeValue.length > 0;
      } else if (challenge.type === 'interactive') {
        // Custom validation for interactive challenges
        isCorrect = true; // Placeholder
      }
      
      // Complete the challenge
      onComplete(isCorrect);
      
    } catch (err) {
      setError('There was a problem submitting your answer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 p-4 flex justify-between items-center sticky top-0 bg-white z-10">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-semibold">{challenge.title}</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              challenge.difficulty === 'beginner' ? 'text-green-500 bg-green-100' :
              challenge.difficulty === 'intermediate' ? 'text-yellow-500 bg-yellow-100' :
              'text-red-500 bg-red-100'
            }`}>
              {challenge.difficulty}
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
              timeLeft < 60 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
            }`}>
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">{formatTime(timeLeft)}</span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-6">{challenge.description}</p>
          
          {/* Challenge type specific content */}
          {challenge.type === 'quiz' && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">{challenge.content?.question}</p>
              </div>
              
              {/* Quiz options */}
              <div className="space-y-2">
                {challenge.content?.options?.map((option, index) => (
                  <div 
                    key={index}
                    onClick={() => handleOptionToggle(option)}
                    className={`p-3 border rounded-lg cursor-pointer ${
                      selectedOptions.includes(option) 
                        ? 'border-indigo-500 bg-indigo-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`h-5 w-5 rounded-full flex items-center justify-center ${
                        selectedOptions.includes(option)
                          ? 'bg-indigo-500 text-white'
                          : 'border border-gray-400'
                      }`}>
                        {selectedOptions.includes(option) && (
                          <CheckCircle className="h-4 w-4" />
                        )}
                      </div>
                      <span>{option}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {challenge.type === 'coding' && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-800 text-white rounded-lg font-mono whitespace-pre-wrap overflow-x-auto">
                <p>{challenge.content?.question || 'Write your solution below:'}</p>
              </div>
              
              {/* Code editor */}
              <textarea
                value={codeValue}
                onChange={(e) => setCodeValue(e.target.value)}
                className="w-full h-64 p-4 font-mono text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="// Write your code here"
              />
            </div>
          )}
          
          {challenge.type === 'interactive' && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p>{challenge.content?.question || 'Complete the interactive challenge:'}</p>
              </div>
              
              {/* This would be replaced with an actual interactive component */}
              <div className="bg-gray-100 rounded-lg p-12 text-center">
                <p className="text-gray-500">Interactive challenge content would appear here</p>
              </div>
            </div>
          )}
          
          {/* Error message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="border-t border-gray-200 p-4 flex justify-end sticky bottom-0 bg-white">
          <button
            onClick={handleSubmit}
            disabled={submitting || timeLeft === 0}
            className={`px-6 py-2 rounded-lg font-medium ${
              submitting || timeLeft === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {submitting ? 'Submitting...' : 'Submit Answer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActiveChallenge;