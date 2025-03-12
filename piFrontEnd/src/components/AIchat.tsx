import React, { useEffect, useRef, useState } from 'react';
import { Bot, HelpCircle, Send, User } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  isAI?: boolean;
}

interface AIResponse {
  id: string;
  content: string;
  timestamp: Date;
}

interface AIRequestBody {
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
}

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uuidv4(),
      sender: 'AI Assistant',
      content: "Hello! I'm your AI learning assistant. How can I help you with your studies today?",
      timestamp: new Date(),
      isAI: true
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setShowSuggestions] = useState(false);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const API_ENDPOINT = process.env.REACT_APP_AI_API_ENDPOINT || 'https://api.example.com/ai/chat';
  const API_KEY = process.env.REACT_APP_AI_API_KEY;
  
  // Predefined suggestions for quick questions
  const questionSuggestions = [
    "Can you explain this concept in simpler terms?",
    "What are some examples of this in practice?",
    "What are the key points I should remember?",
    "Can you help me solve this problem step by step?",
    "I'm stuck on this assignment, can you help me?"
  ];

  useEffect(() => {
    // Scroll to the bottom when messages update
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const formatMessagesForAPI = () => {
    // Converting our messages to the format expected by AI API
    const formattedMessages = messages.map(msg => ({
      role: msg.isAI ? 'assistant' : 'user' as 'assistant' | 'user',
      content: msg.content
    }));
    
    // Add a system message to guide the AI's behavior
    return [
      {
        role: 'system' as const,
        content: 'You are a helpful education assistant specializing in tutoring students. Provide clear, concise explanations and encourage critical thinking. Focus on helping the student understand concepts rather than just giving answers.'
      },
      ...formattedMessages
    ];
  };

  const sendMessageToAI = async (userMessage: string) => {
    if (!userMessage.trim()) return;
    
    // Add user message to chat
    const newUserMessage: Message = {
      id: uuidv4(),
      sender: 'You',
      content: userMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);
    
    try {
      // Format message history for the API
      const messageHistory = formatMessagesForAPI();
      
      // Prepare the request body
      const requestBody: AIRequestBody = {
        messages: [
          ...messageHistory,
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 1000
      };
      
      // Make the API request
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        throw new Error(`AI service responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      const aiResponse: AIResponse = {
        id: uuidv4(),
        content: data.choices?.[0]?.message?.content || "I'm sorry, I couldn't generate a response.",
        timestamp: new Date()
      };
      
      // Add AI response to chat
      const newAIMessage: Message = {
        id: aiResponse.id,
        sender: 'AI Assistant',
        content: aiResponse.content,
        timestamp: aiResponse.timestamp,
        isAI: true
      };
      
      setMessages(prev => [...prev, newAIMessage]);
      
    } catch (err) {
      console.error('Error sending message to AI:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      
      // Add error message to chat
      const errorMessage: Message = {
        id: uuidv4(),
        sender: 'System',
        content: `Error: ${err instanceof Error ? err.message : 'Failed to connect to AI service'} - Please try again later.`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    sendMessageToAI(inputMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const selectSuggestion = (suggestion: string) => {
    setInputMessage(suggestion);
    setShowSuggestions(false);
  };

  const handleCodeHelp = (code: string, language: string) => {
    const codeQuestion = `Can you help me understand this ${language} code and explain what it does?\n\n\`\`\`${language}\n${code}\n\`\`\``;
    sendMessageToAI(codeQuestion);
  };

  return (
    <div className="h-[600px] flex flex-col">
      {/* Chat Messages Display */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto mb-4 space-y-4 p-2"
      >
        {/* Map and render messages */}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === 'You' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-md px-4 py-2 rounded-lg ${
                message.sender === 'You'
                  ? 'bg-indigo-600 text-white'
                  : message.sender === 'System'
                  ? 'bg-red-100 text-red-800 border border-red-300'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="flex items-center mb-1">
                {message.isAI ? (
                  <Bot className="h-4 w-4 mr-1 opacity-75" />
                ) : message.sender === 'System' ? (
                  <HelpCircle className="h-4 w-4 mr-1 opacity-75" />
                ) : (
                  <User className="h-4 w-4 mr-1 opacity-75" />
                )}
                <p className="text-xs font-medium opacity-75">{message.sender}</p>
              </div>
              {/* Render content with support for code blocks and formatting */}
              <div className="text-sm whitespace-pre-wrap">
                {renderMessageContent(message.content)}
              </div>
              <p className="text-xs mt-1 opacity-75">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-md px-4 py-2 rounded-lg bg-gray-100 text-gray-900">
              <div className="flex items-center mb-1">
                <Bot className="h-4 w-4 mr-1 opacity-75" />
                <p className="text-xs font-medium opacity-75">AI Assistant</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-indigo-600 rounded-full animate-bounce"></div>
                <div className="h-2 w-2 bg-indigo-600 rounded-full animate-bounce delay-100"></div>
                <div className="h-2 w-2 bg-indigo-600 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="flex flex-col">
        <div className="relative">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask the AI Assistant for help..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px] resize-none"
          />
          <button
            onClick={() => setShowSuggestions(!suggestions)}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
          >
            <HelpCircle className="h-5 w-5" />
          </button>
          
          {suggestions && (
            <div className="absolute bottom-[90px] right-0 bg-white shadow-lg rounded-lg p-3 border border-gray-200 w-64 z-10">
              <p className="text-sm font-medium text-gray-700 mb-2">Common Questions:</p>
              <div className="space-y-2">
                {questionSuggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => selectSuggestion(suggestion)}
                    className="w-full text-left text-sm p-2 hover:bg-gray-100 rounded"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-between mt-2">
          <div className="text-xs text-gray-500">
            {error && <span className="text-red-500">{error}</span>}
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <Send className="h-4 w-4 mr-1" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper function to render message content with formatting
const renderMessageContent = (content: string) => {
  // Simple markdown-like parsing for code blocks
  const parts = content.split(/```([\s\S]+?)```/);
  
  return (
    <>
      {parts.map((part, index) => {
        if (index % 2 === 0) {
          return <span key={index}>{part}</span>;
        } else {
          // This is a code block
          const lines = part.split('\n');
          const language = lines[0] ? lines[0].trim() : '';
          const code = lines.slice(1).join('\n');
          
          return (
            <div key={index} className="my-2 p-2 bg-gray-800 text-white rounded overflow-x-auto font-mono text-xs">
              {language && <div className="text-gray-400 mb-1">{language}</div>}
              <pre>{code}</pre>
            </div>
          );
        }
      })}
    </>
  );
};

export default AIChat;