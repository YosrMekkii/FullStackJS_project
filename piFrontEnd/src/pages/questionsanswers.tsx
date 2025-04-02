import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Code,
  Search,
  ThumbsUp,
  MessageSquare,
  Eye,
  CheckCircle2,
  Filter,
  TrendingUp,
  Clock,
  Tag,
  Plus,
  ChevronDown,
  Languages
} from 'lucide-react';

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
  category: 'Programming' | 'Languages';
}

const SAMPLE_QUESTIONS: Question[] = [
  {
    id: '1',
    title: 'How to implement async/await with TypeScript generics?',
    content: 'I\'m trying to create a generic function that handles API responses with TypeScript...',
    tags: ['typescript', 'async', 'generics', 'javascript'],
    author: {
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
      reputation: 1250
    },
    votes: 15,
    answers: 3,
    views: 142,
    solved: true,
    timestamp: new Date('2024-03-10T15:30:00'),
    category: 'Programming'
  },
  {
    id: '2',
    title: 'Best practices for React custom hooks with TypeScript',
    content: 'What are the current best practices for creating custom hooks in React when using TypeScript...',
    tags: ['react', 'typescript', 'hooks', 'javascript'],
    author: {
      name: 'Mike Wilson',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
      reputation: 3420
    },
    votes: 28,
    answers: 5,
    views: 312,
    solved: false,
    timestamp: new Date('2024-03-11T09:15:00'),
    category: 'Programming'
  },
  {
    id: '3',
    title: 'Understanding Python decorators and their use cases',
    content: 'I\'m trying to understand when and how to use decorators effectively in Python...',
    tags: ['python', 'decorators', 'advanced'],
    author: {
      name: 'Alex Thompson',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
      reputation: 892
    },
    votes: 42,
    answers: 7,
    views: 567,
    solved: true,
    timestamp: new Date('2024-03-11T11:20:00'),
    category: 'Programming'
  }
];

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

const QA = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'recent' | 'votes' | 'unanswered'>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredQuestions = SAMPLE_QUESTIONS
    .filter(question => 
      (selectedCategory === 'All' || question.tags.includes(selectedCategory.toLowerCase())) &&
      (searchQuery === '' || 
        question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        question.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
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

  return (
    <div className="min-h-screen bg-gray-50">
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
          {filteredQuestions.map((question) => (
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
                          {new Date(question.timestamp).toLocaleDateString()}
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
                      {question.tags.map((tag) => (
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
                      />
                      <span className="text-sm text-gray-600">{question.author.name}</span>
                      <span className="text-xs text-gray-500">{question.author.reputation} rep</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredQuestions.length === 0 && (
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