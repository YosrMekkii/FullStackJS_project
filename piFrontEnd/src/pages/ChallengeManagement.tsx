// src/pages/AdminChallenges.js
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/challengeApi'; // Import the API service and types
import {
  Plus,
  Save,
  Trash2,
  Edit,
  Code,
  Target,
  Zap,
  Filter,
  Search,
  X,
  AlertTriangle,
  CheckCircle  // Add this

} from 'lucide-react';
 // Adjust the import based on your API service location

// Challenge interface
interface Challenge {
  _id: string;
  title: string;
  description: string;
  type: 'coding' | 'quiz' | 'interactive';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  xp: number;
  timeLimit: number;
  category: string;
  tags: string[];
  content?: {
    question?: string;
    options?: string[];
    code?: string;
    correctAnswer?: string | string[];
  };
  dailyChallenge?: boolean;
}

// New challenge form state
interface ChallengeForm {
  title: string;
  description: string;
  type: Challenge['type'];
  difficulty: Challenge['difficulty'];
  xp: number;
  timeLimit: number;
  category: string;
  tags: string;
  dailyChallenge: boolean;
  question: string;
  options: string;
  code: string;
  correctAnswer: string;
}

const AdminChallenges = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  
  // Form state
  const [form, setForm] = useState<ChallengeForm>({
    title: '',
    description: '',
    type: 'quiz',
    difficulty: 'beginner',
    xp: 100,
    timeLimit: 10,
    category: 'programming',
    tags: '',
    dailyChallenge: false,
    question: '',
    options: '',
    code: '',
    correctAnswer: ''
  });
  
  // Current challenge being edited (if in edit mode)
  const [currentChallengeId, setCurrentChallengeId] = useState<string | null>(null);

  // Fetch all challenges
  useEffect(() => {
    const fetchAllChallenges = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (token) {
          api.setAuthToken(token);
        }
        // Use the correct endpoint for admin - no filter needed
        const allChallenges = await api.getAllChallenges();
        setChallenges(allChallenges);
      } catch (error) {
        console.error('Error fetching challenges:', error);
        showNotification('Failed to load challenges', 'error');
      } finally {
        setLoading(false);
      }
    };
  
    fetchAllChallenges();
  }, []); // 
  

  // Filter challenges based on search term and filters
  const filteredChallenges = challenges.filter(challenge => {
    const matchesSearch = challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         challenge.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || challenge.type === filterType;
    const matchesDifficulty = filterDifficulty === 'all' || challenge.difficulty === filterDifficulty;
    
    return matchesSearch && matchesType && matchesDifficulty;
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prevForm => ({
      ...prevForm,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setForm(prevForm => ({
      ...prevForm,
      [name]: checked
    }));
  };

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      type: 'quiz',
      difficulty: 'beginner',
      xp: 100,
      timeLimit: 10,
      category: 'programming',
      tags: '',
      dailyChallenge: false,
      question: '',
      options: '',
      code: '',
      correctAnswer: ''
    });
    setCurrentChallengeId(null);
    setEditMode(false);
  };

  const handleEditChallenge = (challenge: Challenge) => {
    // Transform challenge data to form format
    const tagsString = challenge.tags.join(', ');
    let optionsString = '';
    let correctAnswerString = '';
    
    if (challenge.content?.options) {
      optionsString = challenge.content.options.join('\n');
    }
    
    if (challenge.content?.correctAnswer) {
      if (Array.isArray(challenge.content.correctAnswer)) {
        correctAnswerString = challenge.content.correctAnswer.join(', ');
      } else {
        correctAnswerString = challenge.content.correctAnswer;
      }
    }
    
    setForm({
      title: challenge.title,
      description: challenge.description,
      type: challenge.type,
      difficulty: challenge.difficulty,
      xp: challenge.xp,
      timeLimit: challenge.timeLimit,
      category: challenge.category,
      tags: tagsString,
      dailyChallenge: challenge.dailyChallenge || false,
      question: challenge.content?.question || '',
      options: optionsString,
      code: challenge.content?.code || '',
      correctAnswer: correctAnswerString
    });
    
    setCurrentChallengeId(challenge._id);
    setEditMode(true);
    setShowForm(true);
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteChallenge = async (challengeId: string) => {
    if (!window.confirm('Are you sure you want to delete this challenge?')) {
      return;
    }
    
    try {
      // Call delete API
      await api.deleteChallenge(challengeId);
      
      // Update local state
      setChallenges(prevChallenges => 
        prevChallenges.filter(challenge => challenge._id !== challengeId)
      );
      
      showNotification('Challenge deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting challenge:', error);
      showNotification('Failed to delete challenge', 'error');
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({
      show: true,
      message,
      type
    });
    
    // Hide after 3 seconds
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Parse form data into challenge format
      const challengeData: Partial<Challenge> = {
        title: form.title,
        description: form.description,
        type: form.type,
        difficulty: form.difficulty,
        xp: Number(form.xp),
        timeLimit: Number(form.timeLimit),
        category: form.category,
        tags: form.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        dailyChallenge: form.dailyChallenge,
        content: {}
      };
      
      // Add content based on challenge type
      if (form.type === 'quiz') {
        challengeData.content = {
          question: form.question,
          options: form.options.split('\n').map(option => option.trim()).filter(option => option),
          correctAnswer: form.correctAnswer.includes(',') 
            ? form.correctAnswer.split(',').map(answer => answer.trim()) 
            : form.correctAnswer.trim()
        };
      } else if (form.type === 'coding') {
        challengeData.content = {
          question: form.question,
          code: form.code
        };
      } else if (form.type === 'interactive') {
        challengeData.content = {
          question: form.question
        };
      }
      
      let updatedChallenge;
      
      if (editMode && currentChallengeId) {
        // Update existing challenge
        updatedChallenge = await api.updateChallenge(currentChallengeId, challengeData);
        
        // Update challenges list
        setChallenges(prevChallenges => 
          prevChallenges.map(challenge => 
            challenge._id === currentChallengeId ? updatedChallenge : challenge
          )
        );
        
        showNotification('Challenge updated successfully', 'success');
      } else {
        // Create new challenge
        const newChallenge = await api.createChallenge(challengeData);
        
        // Add to challenges list
        setChallenges(prevChallenges => [...prevChallenges, newChallenge]);
        
        showNotification('Challenge created successfully', 'success');
      }
      
      // Reset form and state
      resetForm();
      setShowForm(false);
      
    } catch (error) {
      console.error('Error saving challenge:', error);
      showNotification('Failed to save challenge', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Challenge Management</h1>
          <button 
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
          >
            {showForm ? (
              <>
                <X className="h-5 w-5 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="h-5 w-5 mr-2" />
                Add Challenge
              </>
            )}
          </button>
        </div>
        
        {/* Notification */}
        {notification.show && (
          <div className={`p-4 mb-6 rounded-lg flex items-center justify-between ${
            notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <div className="flex items-center">
              {notification.type === 'success' ? (
                <CheckCircle className="h-5 w-5 mr-2" />
              ) : (
                <AlertTriangle className="h-5 w-5 mr-2" />
              )}
              <p>{notification.message}</p>
            </div>
            <button 
              onClick={() => setNotification(prev => ({ ...prev, show: false }))}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        
        {/* Challenge Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">{editMode ? 'Edit Challenge' : 'Create New Challenge'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Basic Info */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="programming">Programming</option>
                    <option value="language">Languages</option>
                    <option value="algorithms">Algorithms</option>
                    <option value="data-structures">Data Structures</option>
                    <option value="web-development">Web Development</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                
                {/* Challenge Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Challenge Type
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    <div 
                      className={`border rounded-lg p-3 flex flex-col items-center cursor-pointer ${
                        form.type === 'quiz' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
                      }`}
                      onClick={() => setForm(prev => ({ ...prev, type: 'quiz' }))}
                    >
                      <Target className={`h-6 w-6 ${form.type === 'quiz' ? 'text-indigo-600' : 'text-gray-500'}`} />
                      <span className="mt-1 text-sm font-medium">Quiz</span>
                    </div>
                    <div 
                      className={`border rounded-lg p-3 flex flex-col items-center cursor-pointer ${
                        form.type === 'coding' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
                      }`}
                      onClick={() => setForm(prev => ({ ...prev, type: 'coding' }))}
                    >
                      <Code className={`h-6 w-6 ${form.type === 'coding' ? 'text-indigo-600' : 'text-gray-500'}`} />
                      <span className="mt-1 text-sm font-medium">Coding</span>
                    </div>
                    <div 
                      className={`border rounded-lg p-3 flex flex-col items-center cursor-pointer ${
                        form.type === 'interactive' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
                      }`}
                      onClick={() => setForm(prev => ({ ...prev, type: 'interactive' }))}
                    >
                      <Zap className={`h-6 w-6 ${form.type === 'interactive' ? 'text-indigo-600' : 'text-gray-500'}`} />
                      <span className="mt-1 text-sm font-medium">Interactive</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty Level
                  </label>
                  <select
                    name="difficulty"
                    value={form.difficulty}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    XP Reward
                  </label>
                  <input
                    type="number"
                    name="xp"
                    value={form.xp}
                    onChange={handleInputChange}
                    min="10"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time Limit (minutes)
                  </label>
                  <input
                    type="number"
                    name="timeLimit"
                    value={form.timeLimit}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={form.tags}
                    onChange={handleInputChange}
                    placeholder="javascript, arrays, loops"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="dailyChallenge"
                      name="dailyChallenge"
                      checked={form.dailyChallenge}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="dailyChallenge" className="ml-2 block text-sm text-gray-900">
                      Set as Daily Challenge
                    </label>
                  </div>
                </div>
                
                <div className="md:col-span-2 border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium mb-4">Challenge Content</h3>
                  
                  {/* Question (for all types) */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Question / Instructions
                    </label>
                    <textarea
                      name="question"
                      value={form.question}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  
                  {/* Content based on challenge type */}
                  {form.type === 'quiz' && (
                    <>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Options (one per line)
                        </label>
                        <textarea
                          name="options"
                          value={form.options}
                          onChange={handleInputChange}
                          rows={4}
                          placeholder="Option 1&#10;Option 2&#10;Option 3&#10;Option 4"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Correct Answer(s) (comma separated for multiple answers)
                        </label>
                        <input
                          type="text"
                          name="correctAnswer"
                          value={form.correctAnswer}
                          onChange={handleInputChange}
                          placeholder="Option 1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                      </div>
                    </>
                  )}
                  
                  {form.type === 'coding' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Starter Code
                      </label>
                      <textarea
                        name="code"
                        value={form.code}
                        onChange={handleInputChange}
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                        placeholder="// Starter code for the challenge"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
                >
                  <Save className="h-5 w-5 mr-2" />
                  {editMode ? 'Update Challenge' : 'Create Challenge'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Challenge List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Search and Filters */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search challenges..."
                  className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Filter className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-500">Filters:</span>
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="quiz">Quiz</option>
                  <option value="coding">Coding</option>
                  <option value="interactive">Interactive</option>
                </select>
                <select
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  <option value="all">All Difficulties</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Challenge Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Challenge
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Difficulty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    XP
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Daily
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500"></div>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">Loading challenges...</p>
                    </td>
                  </tr>
                ) : filteredChallenges.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      No challenges found
                    </td>
                  </tr>
                ) : (
                  filteredChallenges.map((challenge) => (
                    <tr key={challenge._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{challenge.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{challenge.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          challenge.type === 'quiz' ? 'bg-purple-100 text-purple-800' :
                          challenge.type === 'coding' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {challenge.type === 'quiz' && <Target className="h-3 w-3 mr-1" />}
                          {challenge.type === 'coding' && <Code className="h-3 w-3 mr-1" />}
                          {challenge.type === 'interactive' && <Zap className="h-3 w-3 mr-1" />}
                          {challenge.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          challenge.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                          challenge.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {challenge.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {challenge.xp} XP
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {challenge.dailyChallenge ? (
                          <span className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full text-xs font-medium">
                            Daily
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                          onClick={() => handleEditChallenge(challenge)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteChallenge(challenge._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination could be added here */}
        </div>
      </div>
    </div>
  );
};

export default AdminChallenges;
                          