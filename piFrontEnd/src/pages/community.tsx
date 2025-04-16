import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import {
  MessageSquare,
  Users,
  Search,
  ThumbsUp,

  Clock,
  CheckCircle2,
  Plus,
  MessagesSquare,
  Award,
  Eye,
  Code,
  Palette,
  Briefcase,
  Globe,
  User
} from 'lucide-react';

interface Thread {
  id: string;
  title: string;
  author: {
    name: string;
    avatar: string;
    isMentor: boolean;
  };
  category: string;
  tags: string[];
  upvotes: number;
  replies: number;
  views: number;
  timestamp: Date;
  solved?: boolean;
  preview: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  threadsCount: number;
  icon: React.ReactNode;
}

const Community = () => {
    const navigate = useNavigate(); // Initialize navigation
    const [activeTab, setActiveTab] = useState<'discussions' | 'qa'>('discussions');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'trending'>('recent');
    const [searchQuery, setSearchQuery] = useState('');
    const [showNewThreadModal, setShowNewThreadModal] = useState(false);
  
    const handleTabChange = (tab: 'discussions' | 'qa') => {
      setActiveTab(tab);
      if (tab === 'qa') navigate('/qa'); // Redirect to Q&A page
    };
  

  const categories: Category[] = [
    {
      id: 'tech',
      name: 'Technology',
      description: 'Programming, web development, and tech discussions',
      threadsCount: 1234,
      icon: <Code className="h-6 w-6" />
    },
    {
      id: 'design',
      name: 'Design',
      description: 'UI/UX, graphic design, and creative arts',
      threadsCount: 856,
      icon: <Palette className="h-6 w-6" />
    },
    {
      id: 'business',
      name: 'Business',
      description: 'Marketing, entrepreneurship, and management',
      threadsCount: 967,
      icon: <Briefcase className="h-6 w-6" />
    },
    {
      id: 'languages',
      name: 'Languages',
      description: 'Language learning and cultural exchange',
      threadsCount: 543,
      icon: <Globe className="h-6 w-6" />
    }
  ];

  const threads: Thread[] = [
    {
      id: '1',
      title: 'Best practices for React hooks in 2024',
      author: {
        name: 'Sarah Chen',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
        isMentor: true
      },
      category: 'tech',
      tags: ['react', 'javascript', 'frontend'],
      upvotes: 156,
      replies: 23,
      views: 1205,
      timestamp: new Date('2024-03-10T15:30:00'),
      solved: true,
      preview: 'Ive been working with React hooks for a while now, and I wanted to share some best practices Ive learned...'
    },
    {
      id: '2',
      title: 'How to structure a UX research plan?',
      author: {
        name: 'Mike Wilson',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
        isMentor: false
      },
      category: 'design',
      tags: ['ux-research', 'design-thinking'],
      upvotes: 89,
      replies: 15,
      views: 742,
      timestamp: new Date('2024-03-11T09:15:00'),
      preview: 'Im starting my first UX research project and need advice on structuring the research plan...'
    },
    {
      id: '3',
      title: 'Tips for learning Spanish pronunciation',
      author: {
        name: 'Elena Rodriguez',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
        isMentor: true
      },
      category: 'languages',
      tags: ['spanish', 'pronunciation', 'learning'],
      upvotes: 234,
      replies: 45,
      views: 1876,
      timestamp: new Date('2024-03-11T12:45:00'),
      solved: true,
      preview: 'After teaching Spanish for 10 years, here are my top tips for mastering pronunciation...'
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

  const filteredThreads = threads
    .filter(thread => 
      (selectedCategory === 'all' || thread.category === selectedCategory) &&
      (searchQuery === '' || 
        thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        thread.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.upvotes - a.upvotes;
        case 'trending':
          return (b.upvotes + b.replies) - (a.upvotes + a.replies);
        default:
          return b.timestamp.getTime() - a.timestamp.getTime();
      }
    });

  return (
    <div className="min-h-screen bg-gray-50">
            <Sidebar />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Community & Forums</h1>
              <p className="mt-2 text-gray-600">Join discussions, ask questions, and share knowledge</p>
            </div>
            <button
              onClick={() => setShowNewThreadModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Thread
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
                placeholder="Search discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'recent' | 'popular' | 'trending')}
                className="block pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="recent">Most Recent</option>
                <option value="popular">Most Popular</option>
                <option value="trending">Trending</option>
              </select>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('discussions')}
                className={`${
                  activeTab === 'discussions'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <MessageSquare className="h-5 w-5 mr-2" />
                Discussions
              </button>
              <button
                onClick={() => {
                setActiveTab('qa'); // Keep tab state management
                navigate('/qa'); // Navigate to Q&A page
                }}
                className={`${
                activeTab === 'qa'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                 } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
              <MessagesSquare className="h-5 w-5 mr-2" />
              Q&A
            </button>       
            </nav>
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
                    <Users className="h-5 w-5 text-gray-400" />
                    <span className="ml-3 text-sm font-medium text-gray-900">All Categories</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {threads.length}
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
                      {category.threadsCount}
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
                  {Array.from(new Set(threads.flatMap(t => t.tags))).map((tag) => (
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

            {/* Top Contributors */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Top Contributors</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {threads
                  .map(t => t.author)
                  .filter((author, index, self) => 
                    index === self.findIndex(a => a.name === author.name)
                  )
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
                          {author.isMentor && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                              Mentor
                            </span>
                          )}
                        </div>
                      </div>
                      <Award className="h-5 w-5 text-yellow-500" />
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Thread List */}
          <div className="col-span-3 space-y-4">
            {filteredThreads.map((thread) => (
              <div
                key={thread.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:border-indigo-200 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <img
                        src={thread.author.avatar}
                        alt={thread.author.name}
                        className="h-10 w-10 rounded-full"
                      />
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          <Link to={`/community/thread/${thread.id}`} className="hover:text-indigo-600">
                            {thread.title}
                          </Link>
                        </h3>
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {thread.author.name}
                            {thread.author.isMentor && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                                Mentor
                              </span>
                            )}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {formatTimestamp(thread.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 text-gray-600 line-clamp-2">{thread.preview}</p>
                    <div className="mt-4 flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {thread.tags.map((tag) => (
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
                        {thread.upvotes}
                      </span>
                      <span className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        {thread.replies}
                      </span>
                      <span className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {thread.views}
                      </span>
                    </div>
                    {thread.solved && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Solved
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredThreads.length === 0 && (
              <div className="text-center py-12">
                <MessagesSquare className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No threads found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;