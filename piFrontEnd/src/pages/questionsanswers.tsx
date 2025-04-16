import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import {
  Code,
  Search,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Eye,
  CheckCircle2,
  Filter,
  Plus,
  Clock,
  ArrowLeft,
  Send,
} from 'lucide-react';

// Define how the question data should look from your API
interface Question {
  id: string;
  title: string;
  content: string;
  tags: string[];
  author: {
    name: string;
    avatar: string;
    reputation: number;
  };
  votes: number;
  answers: number;
  views: number;
  solved: boolean;
  timestamp: Date;
  category?: 'Programming' | 'Languages';
}

interface Answer {
  id: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    reputation: number;
  };
  votes: number;
  isAccepted: boolean;
  timestamp: Date;
}

const PROGRAMMING_CATEGORIES = [
  'All',
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'C++',
  'Go',
  'Rust',
  'SQL'
];

// Mock answers data - this would normally come from your API
const MOCK_ANSWERS: Record<string, Answer[]> = {};

// QA Main Component
const QA = () => {
  const { questionId } = useParams<{ questionId: string }>();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'recent' | 'votes' | 'unanswered'>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [newAnswer, setNewAnswer] = useState('');

  // Fetch questions on component mount
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3000/questions');
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("API Response:", data); // Log the response for debugging
        
        // Transform and validate the data
        const processedData = data.map((q: any) => ({
          id: q.id || `temp-${Math.random()}`,
          title: q.title || "Untitled Question",
          content: q.content || "No content provided",
          tags: Array.isArray(q.tags) ? q.tags : [],
          author: q.author ? {
            name: q.author.name || "Anonymous",
            avatar: q.author.avatar || "/api/placeholder/32/32", // Use a placeholder image
            reputation: q.author.reputation || 0
          } : {
            name: "Anonymous",
            avatar: "/api/placeholder/32/32",
            reputation: 0
          },
          votes: q.votes || 0,
          answers: q.answers || 0,
          views: q.views || 0,
          solved: Boolean(q.solved),
          timestamp: q.timestamp ? new Date(q.timestamp) : new Date(),
          category: q.category || 'Programming'
        }));
        
        setQuestions(processedData);
        
        // Generate mock answers for each question
        processedData.forEach(q => {
          // Only create mock answers if they don't exist yet
          if (!MOCK_ANSWERS[q.id]) {
            const answerCount = q.answers || Math.floor(Math.random() * 3);
            MOCK_ANSWERS[q.id] = Array.from({ length: answerCount }, (_, i) => ({
              id: `answer-${q.id}-${i}`,
              content: `This is a sample answer ${i+1} for question "${q.title}". It contains mock content that would normally come from your database.`,
              author: {
                name: `User ${Math.floor(Math.random() * 1000)}`,
                avatar: "/api/placeholder/32/32",
                reputation: Math.floor(Math.random() * 5000)
              },
              votes: Math.floor(Math.random() * 10),
              isAccepted: i === 0 && q.solved,
              timestamp: new Date(Date.now() - Math.random() * 10000000000)
            }));
          }
        });
        
        setError(null);
      } catch (err) {
        setError('Failed to fetch questions. Please try again later.');
        console.error('Error fetching questions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // Load answers when viewing a specific question
  useEffect(() => {
    if (questionId && MOCK_ANSWERS[questionId]) {
      setAnswers(MOCK_ANSWERS[questionId]);
    } else if (questionId) {
      setAnswers([]);
    }
  }, [questionId]);

  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnswer.trim() || !questionId) return;
    
    // Create a new answer
    const mockAnswer: Answer = {
      id: `answer-${questionId}-${Date.now()}`,
      content: newAnswer,
      author: {
        name: "Current User",
        avatar: "/api/placeholder/32/32",
        reputation: 100
      },
      votes: 0,
      isAccepted: false,
      timestamp: new Date()
    };
    
    // Add to local state and mock data
    const updatedAnswers = [...answers, mockAnswer];
    setAnswers(updatedAnswers);
    MOCK_ANSWERS[questionId] = updatedAnswers;
    
    // Update the answers count in the questions list
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? { ...q, answers: (q.answers || 0) + 1 }
        : q
    ));
    
    setNewAnswer('');
  };

  const filteredQuestions = questions
    .filter(question => 
      (selectedCategory === 'All' || (question.tags && question.tags.includes(selectedCategory.toLowerCase()))) &&
      (searchQuery === '' || 
        question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (question.tags && question.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
      )
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'votes':
          return b.votes - a.votes;
        case 'unanswered':
          return (a.answers === 0 ? -1 : 1) - (b.answers === 0 ? -1 : 1);
        default:
          return b.timestamp.getTime() - a.timestamp.getTime();
      }
    });

  // Find current question when in detail view
  const currentQuestion = questionId ? questions.find(q => q.id === questionId) : null;

  // If in loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12 min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // If general error with API
  if (error && !questionId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="bg-red-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-2 text-sm text-red-700">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Question Detail View
  if (questionId) {
    // If question not found
    if (!currentQuestion) {
      return (
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white border-b border-gray-200 mb-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center">
                  <button 
                    onClick={() => navigate('/qa')}
                    className="mr-4 p-2 rounded-full hover:bg-gray-100"
                  >
                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                  </button>
                  <h1 className="text-xl font-bold text-gray-900">
                    Question Not Found
                  </h1>
                </div>
              </div>
            </div>
            <div className="text-center py-12">
              <div className="bg-yellow-50 p-4 rounded-md">
                <h3 className="text-sm font-medium text-yellow-800">Question Not Found</h3>
                <p className="mt-2 text-sm text-yellow-700">
                  The question you're looking for could not be found or may have been removed.
                </p>
                <button 
                  onClick={() => navigate('/qa')}
                  className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200"
                >
                  Back to Questions
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Show question detail view
    return (
      <div className="min-h-screen bg-gray-50">
              <Sidebar />

        {/* Header with Back Button */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center">
              <button 
                onClick={() => navigate('/qa')}
                className="mr-4 p-2 rounded-full hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <h1 className="text-xl font-bold text-gray-900 truncate">
                {currentQuestion.title}
              </h1>
            </div>
          </div>
        </div>

        {/* Question Detail */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start space-x-4">
              {/* Vote Controls */}
              <div className="flex flex-col items-center space-y-2">
                <button className="p-2 hover:bg-gray-100 rounded">
                  <ThumbsUp className="h-5 w-5 text-gray-400" />
                </button>
                <span className="text-lg font-semibold text-gray-900">{currentQuestion.votes}</span>
                <button className="p-2 hover:bg-gray-100 rounded">
                  <ThumbsDown className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              {/* Question Content */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <h2 className="text-2xl font-semibold text-gray-900">{currentQuestion.title}</h2>
                  {currentQuestion.solved && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Solved
                    </span>
                  )}
                </div>

                <div className="mt-4 prose max-w-none">
                  <p className="text-gray-700">{currentQuestion.content}</p>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {currentQuestion.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-4">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      {currentQuestion.answers} answers
                    </div>
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {currentQuestion.views} views
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {currentQuestion.timestamp.toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <img
                      src={currentQuestion.author.avatar}
                      alt={currentQuestion.author.name}
                      className="h-8 w-8 rounded-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/api/placeholder/32/32";
                      }}
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">{currentQuestion.author.name}</span>
                      <p className="text-xs text-gray-500">{currentQuestion.author.reputation} reputation</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Answers Section */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
            </h3>

            {answers.length > 0 ? (
              <div className="space-y-6">
                {answers.map((answer) => (
                  <div 
                    key={answer.id}
                    className={`bg-white rounded-lg shadow-sm border ${
                      answer.isAccepted ? 'border-green-300 ring-1 ring-green-300' : 'border-gray-200'
                    } p-6`}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Vote Controls */}
                      <div className="flex flex-col items-center space-y-2">
                        <button className="p-2 hover:bg-gray-100 rounded">
                          <ThumbsUp className="h-5 w-5 text-gray-400" />
                        </button>
                        <span className="text-lg font-semibold text-gray-900">{answer.votes}</span>
                        <button className="p-2 hover:bg-gray-100 rounded">
                          <ThumbsDown className="h-5 w-5 text-gray-400" />
                        </button>
                        {answer.isAccepted && (
                          <div className="mt-2">
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                          </div>
                        )}
                      </div>

                      {/* Answer Content */}
                      <div className="flex-1">
                        <div className="prose max-w-none">
                          <p className="text-gray-700">{answer.content}</p>
                        </div>

                        <div className="mt-6 flex items-center justify-end">
                          <div className="flex items-center space-x-2">
                            <img
                              src={answer.author.avatar}
                              alt={answer.author.name}
                              className="h-8 w-8 rounded-full"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/api/placeholder/32/32";
                              }}
                            />
                            <div>
                              <span className="text-sm font-medium text-gray-900">{answer.author.name}</span>
                              <p className="text-xs text-gray-500">{answer.author.reputation} reputation</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                <p className="text-gray-500">No answers yet. Be the first to answer!</p>
              </div>
            )}

            {/* Add New Answer Form */}
            <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Your Answer</h4>
              <form onSubmit={handleSubmitAnswer}>
                <textarea
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  rows={6}
                  placeholder="Write your answer here..."
                  className="w-full border border-gray-300 rounded-md shadow-sm p-4 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
                <div className="mt-4 flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Send className="h-5 w-5 mr-2" />
                    Submit Answer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Question List View
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Programming Q&A</h1>
              <p className="mt-2 text-gray-600">Get help with programming languages and technical challenges</p>
            </div>
            <Link
              to="/ask-question"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Ask Question
            </Link>
          </div>

          {/* Search and Filters */}
          <div className="mt-6 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="w-full sm:w-96 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'recent' | 'votes' | 'unanswered')}
                className="block pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="recent">Most Recent</option>
                <option value="votes">Most Votes</option>
                <option value="unanswered">Unanswered</option>
              </select>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </button>
            </div>
          </div>

          {/* Category Pills */}
          <div className="mt-6 flex flex-wrap gap-2">
            {PROGRAMMING_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedCategory === category
                    ? 'bg-indigo-100 text-indigo-800'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {filteredQuestions.length > 0 ? (
            filteredQuestions.map((question) => (
              <div
                key={question.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:border-indigo-200 transition-colors"
              >
                <div className="flex items-start space-x-4">
                  {/* Vote Counter */}
                  <div className="flex flex-col items-center space-y-2">
                    <button className="p-2 hover:bg-gray-100 rounded">
                      <ThumbsUp className="h-5 w-5 text-gray-400" />
                    </button>
                    <span className="text-lg font-semibold text-gray-900">{question.votes}</span>
                  </div>

                  {/* Question Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <Link
                          to={`/qa/${question.id}`}
                          className="text-xl font-semibold text-gray-900 hover:text-indigo-600"
                        >
                          {question.title}
                        </Link>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            {question.answers} answers
                          </div>
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            {question.views} views
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {question.timestamp.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      {question.solved && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Solved
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-gray-600 line-clamp-2">{question.content}</p>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {question.tags && question.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center space-x-2">
                        <img
                          src={question.author.avatar}
                          alt={question.author.name}
                          className="h-6 w-6 rounded-full"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/api/placeholder/32/32";
                          }}
                        />
                        <span className="text-sm text-gray-600">{question.author.name}</span>
                        <span className="text-xs text-gray-500">{question.author.reputation} rep</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Code className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No questions found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filters to find what you're looking for.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QA;