import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  ArrowLeft,
  Send,
  Edit,
  Trash,
  X,
  Save
} from 'lucide-react';

const QuestionDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      setLoading(true);
      axios.get(`http://localhost:3000/questions/${id}`)
        .then((response) => {
          setQuestion(response.data);
          // In a real app, you would fetch comments separately or they would be included
          // in the question data. This is a placeholder.
          if (response.data.comments) {
            setComments(response.data.comments);
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching question:", error);
          setError("Failed to load question. Please try again.");
          setLoading(false);
        });
    }
  }, [id]);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await axios.delete(`http://localhost:3000/questions/${id}`);
      navigate("/qa");
    } catch (error) {
      console.error("Error deleting question:", error);
      setError("Failed to delete question. Please try again.");
      setIsDeleting(false);
    }
  };

  const handleEdit = async () => {
    try {
      const response = await axios.put(`http://localhost:3000/questions/${id}`, {
        ...question,
        content: editedContent,
      });
      setQuestion(response.data);
      setEditing(false);
    } catch (error) {
      console.error("Error updating question:", error);
      setError("Failed to update question. Please try again.");
    }
  };

  const handleComment = () => {
    if (!newComment.trim()) return;

    const comment = {
      id: Date.now().toString(),
      content: newComment,
      author: {
        name: 'Current User',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop'
      },
      timestamp: new Date(),
      votes: 0
    };

    // In a real app, you would post this to your API
    // This is just for UI demonstration
    setComments([...comments, comment]);
    setNewComment('');
  };

  const handleVote = (commentId, increment) => {
    // In a real app, you would update votes via API call
    setComments(comments.map(comment => 
      comment.id === commentId
        ? { ...comment, votes: comment.votes + (increment ? 1 : -1) }
        : comment
    ));
  };

  const markAsAnswer = (commentId) => {
    // In a real app, you would update this via API call
    setComments(comments.map(comment => ({
      ...comment,
      isAnswer: comment.id === commentId
    })));
  };
  
  if (loading) return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500">Loading question...</p>
        </div>
      </div>  
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-red-500">{error}</p>
          <button 
            onClick={() => navigate("/qa")}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Back to Questions
          </button>
        </div>
      </div>  
    </div>
  );

  if (!question) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate("/qa")}
          className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Questions
        </button>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Question Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{question.title}</h1>
                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                  <span>Asked {new Date(question.createdAt || Date.now()).toLocaleDateString()}</span>
                  {question.views && <span>Viewed {question.views} times</span>}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => { setEditing(true); setEditedContent(question.content); }}
                  className="text-gray-400 hover:text-indigo-500"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Question Content */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex">
              {/* Voting */}
              <div className="flex flex-col items-center mr-6">
                <button className="p-2 hover:bg-gray-100 rounded">
                  <ThumbsUp className="h-5 w-5 text-gray-400" />
                </button>
                <span className="text-lg font-semibold my-2">{question.votes || 0}</span>
                <button className="p-2 hover:bg-gray-100 rounded">
                  <ThumbsDown className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1">
                {editing ? (
                  <div className="space-y-4">
                    <textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      rows={8}
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setEditing(false)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </button>
                      <button
                        onClick={handleEdit}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-wrap">{question.content}</p>
                  </div>
                )}

                <div className="mt-6 flex flex-wrap gap-2">
                  {question.tags && question.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {question.author && (
                  <div className="mt-6 flex items-center justify-end">
                    <div className="flex items-center space-x-2">
                      <img
                        src={question.author.avatar}
                        alt={question.author.name}
                        className="h-8 w-8 rounded-full"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{question.author.name}</p>
                        <p className="text-xs text-gray-500">{question.author.reputation} reputation</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Comments */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {comments.length} {comments.length === 1 ? 'Answer' : 'Answers'}
            </h2>

            <div className="space-y-6">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className={`flex space-x-4 p-4 rounded-lg ${
                    comment.isAnswer ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => handleVote(comment.id, true)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <ThumbsUp className="h-4 w-4 text-gray-400" />
                    </button>
                    <span className="text-sm font-medium my-1">{comment.votes}</span>
                    <button
                      onClick={() => handleVote(comment.id, false)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <ThumbsDown className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <img
                          src={comment.author.avatar}
                          alt={comment.author.name}
                          className="h-6 w-6 rounded-full"
                        />
                        <span className="text-sm font-medium text-gray-900">
                          {comment.author.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      {!comment.isAnswer && (
                        <button
                          onClick={() => markAsAnswer(comment.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                    <p className="mt-2 text-gray-700">{comment.content}</p>
                    {comment.isAnswer && (
                      <div className="mt-2 flex items-center text-green-700">
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        <span className="text-sm font-medium">Accepted Answer</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add Comment */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Answer</h3>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write your answer..."
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={4}
                  />
                </div>
                <button
                  onClick={handleComment}
                  disabled={!newComment.trim()}
                  className="self-end inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetail;