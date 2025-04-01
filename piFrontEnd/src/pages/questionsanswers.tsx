import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  Users,
  Search,
  ThumbsUp,
  Star,
  Clock,
  Tag,
  Filter,
  TrendingUp,
  CheckCircle2,
  Bell,
  Plus,
  ChevronRight,
  MessagesSquare,
  Award,
  Eye,
  Code,
  Palette,
  Briefcase,
  Globe,
  User,
  HelpCircle,
  AlertCircle,
  Lightbulb
} from 'lucide-react';

interface Question {
  id: string;
  title: string;
  author: {
    name: string;
    avatar: string;
    reputation: number;
    isMentor?: boolean;
  };
  category: string;
  tags: string[];
  upvotes: number;
  answers: number;
  views: number;
  timestamp: Date;
  solved: boolean;
  preview: string;
  bounty?: number;
}

interface Category {
  id: string;
  name: string;
  description: string;
  questionsCount: number;
  icon: React.ReactNode;
}

const QA = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'unanswered' | 'bounty'>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewQuestionModal, setShowNewQuestionModal] = useState(false);
  const [filterSolved, setFilterSolved] = useState<boolean | null>(null);

  const categories: Category[] = [
    {
      id: 'tech',
      name: 'Technology',
      description: 'Programming, web development, and tech discussions',
      questionsCount: 1234,
      icon: <Code className="h-6 w-6" />
    },
    {
      id: 'design',
      name: 'Design',
      description: 'UI/UX, graphic design, and creative arts',
      questionsCount: 856,
      icon: <Palette className="h-6 w-6" />
    },
    {
      id: 'business',
      name: 'Business',
      description: 'Marketing, entrepreneurship, and management',
      questionsCount: 967,
      icon: <Briefcase className="h-6 w-6" />
    },
    {
      id: 'languages',
      name: 'Languages',
      description: 'Language learning and cultural exchange',
      questionsCount: 543,
      icon: <Globe className="h-6 w-6" />
    }
  ];

  const questions: Question[] = [
    {
      id: '1',
      title: 'How to properly implement useEffect cleanup in React?',
      author: {
        name: 'Sarah Chen',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
        reputation: 1250,
        isMentor: true
      },
      category: 'tech',
      tags: ['react', 'hooks', 'javascript'],
      upvotes: 42,
      answers: 5,
      views: 1205,
      timestamp: new Date('2024-03-15T15:30:00'),
      solved: true,
      preview: 'I\'m having trouble understanding how to properly implement cleanup functions in useEffect hooks. My component seems to have memory leaks...'
    },
    {
      id: '2',
      title: 'What\'s the best approach for user research with limited resources?',
      author: {
        name: 'Mike Wilson',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
        reputation: 780
      },
      category: 'design',
      tags: ['ux-research', 'design-thinking', 'startup'],
      upvotes: 38,
      answers: 4,
      views: 942,
      timestamp: new Date('2024-03-14T09:15:00'),
      solved: false,
      preview: 'I\'m working at a small startup and need to conduct user research with very limited time and budget. What approaches would you recommend...',
      bounty: 50
    },
    {
      id: '3',
      title: 'How to roll your Rs in Spanish pronunciation?',
      author: {
        name: 'Elena Rodriguez',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
        reputation: 1560,
        isMentor: true
      },
      category: 'languages',
      tags: ['spanish', 'pronunciation', 'learning'],
      upvotes: 124,
      answers: 8,
      views: 2876,
      timestamp: new Date('2024-03-13T12:45:00'),
      solved: true,
      preview: 'I\'ve been studying Spanish for almost a year now, but I still can\'t properly roll my Rs. I\'ve tried various techniques but nothing seems to work...'
    },
    {
      id: '4',
      title: 'TypeScript generics with React components - best practices?',
      author: {
        name: 'David Kim',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
        reputation: 2100
      },
      category: 'tech',
      tags: ['typescript', 'react', 'generics'],
      upvotes: 87,
      answers: 3,
      views: 1560,
      timestamp: new Date('2024-03-12T16:20:00'),
      solved: false,
      preview: 'I\'m trying to create reusable components with TypeScript generics. I want to understand the best practices for properly typing props...',
      bounty: 100
    }
  ];

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };

  const filteredQuestions = questions
    .filter(question => 
      (selectedCategory === 'all' || question.category === selectedCategory) &&
      (filterSolved === null || question.solved === filterSolved) &&
      (searchQuery === '' || 
        question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        question.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.upvotes - a.upvotes;
        case 'unanswered':
          return (a.answers === 0 ? 0 : 1) - (b.answers === 0 ? 0 : 1) || b.timestamp.getTime() - a.timestamp.getTime();
        case 'bounty':
          return (b.bounty || 0) - (a.bounty || 0);
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
              <h1 className="text-3xl font-bold text-gray-900">Questions & Answers</h1>
              <p className="mt-2 text-gray-600">Get help from the community or share your knowledge</p>
            </div>
            <button
              onClick={() => setShowNewQuestionModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Ask Question
            </button>
          </div>

          {/* Search and Filters */}
          <div className="mt-6 flex items-center space-x-4">
            <div className="flex-1 relative">
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
            <div className="flex items-center space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'recent' | 'popular' | 'unanswered' | 'bounty')}
                className="block pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="recent">Most Recent</option>
                <option value="popular">Most Upvoted</option>
                <option value="unanswered">Unanswered</option>
                <option value="bounty">Highest Bounty</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={filterSolved === null ? 'all' : filterSolved ? 'solved' : 'unsolved'}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'all') setFilterSolved(null);
                  else if (value === 'solved') setFilterSolved(true);
                  else setFilterSolved(false);
                }}
                className="block pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="all">All Questions</option>
                <option value="solved">Solved Only</option>
                <option value="unsolved">Unsolved Only</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="col-span-1 space-y-8">
            {/* Categories */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Categories</h2>
              </div>
              <div className="divide-y divide-gray-200">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 ${
                    selectedCategory === 'all' ? 'bg-indigo-50' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <HelpCircle className="h-5 w-5 text-gray-400" />
                    <span className="ml-3 text-sm font-medium text-gray-900">All Categories</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {questions.length}
                  </span>
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 ${
                      selectedCategory === category.id ? 'bg-indigo-50' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      {category.icon}
                      <span className="ml-3 text-sm font-medium text-gray-900">{category.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {category.questionsCount}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Tags */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Popular Tags</h2>
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(questions.flatMap(q => q.tags))).map((tag) => (
                    <button
                      key={tag}
                      className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Experts */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Top Experts</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {questions
                  .map(q => q.author)
                  .filter((author, index, self) => 
                    index === self.findIndex(a => a.name === author.name)
                  )
                  .sort((a, b) => b.reputation - a.reputation)
                  .slice(0, 5)
                  .map((author) => (
                    <div key={author.name} className="p-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <img
                          src={author.avatar}
                          alt={author.name}
                          className="h-8 w-8 rounded-full"
                        />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{author.name}</p>
                          <p className="text-xs text-gray-500">{author.reputation.toLocaleString()} reputation</p>
                        </div>
                      </div>
                      {author.isMentor && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                          Expert
                        </span>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Question List */}
          <div className="col-span-3 space-y-4">
            {filteredQuestions.map((question) => (
              <div
                key={question.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:border-indigo-200 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <img
                        src={question.author.avatar}
                        alt={question.author.name}
                        className="h-10 w-10 rounded-full"
                      />
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          <Link to={`/qa/question/${question.id}`} className="hover:text-indigo-600">
                            {question.title}
                          </Link>
                          {question.bounty && (
                            <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              +{question.bounty} bounty
                            </span>
                          )}
                        </h3>
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {question.author.name}
                          </span>
                          <span className="flex items-center">
                            <Star className="h-4 w-4 mr-1" />
                            {question.author.reputation.toLocaleString()}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {formatTimestamp(question.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 text-gray-600 line-clamp-2">{question.preview}</p>
                    <div className="mt-4 flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {question.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="ml-6 flex flex-col items-end space-y-2">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        {question.upvotes}
                      </span>
                      <span className={`flex items-center ${question.answers === 0 ? 'text-orange-500 font-medium' : ''}`}>
                        <MessageSquare className="h-4 w-4 mr-1" />
                        {question.answers}
                      </span>
                      <span className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {question.views}
                      </span>
                    </div>
                    {question.solved ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Solved
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Unsolved
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredQuestions.length === 0 && (
              <div className="text-center py-12">
                <HelpCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No questions found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
                <button
                  onClick={() => setShowNewQuestionModal(true)}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Ask a new question
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QA;