import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import Editor from "@monaco-editor/react";
import Peer from 'peerjs';
import { io } from 'socket.io-client';
import { 
  Video,
  VideoOff,
  Mic,
  MicOff,
  MessageSquare,
  Share,
  Code,
  Pencil,
  Download,
  Send,
  X,
  Maximize2,
  Minimize2,
  Eraser,
  Play,
  Save,
  Bot,
  User,
  HelpCircle
} from 'lucide-react';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  isAI?: boolean;
}

interface FileShare {
  id: string;
  name: string;
  size: number;
  sender: string;
  url: string;
  timestamp: Date;
}

interface DrawingLine {
  points: { x: number, y: number }[];
  color: string;
  width: number;
  tool: 'pen' | 'eraser';
}

interface CompileResult {
  output: string;
  error: string;
  executionTime: number;
}

function StudentInterface() {
  const { sessionId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [files, setFiles] = useState<FileShare[]>([]);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<'chat' | 'code' | 'whiteboard' | 'ai-help'>('chat');
  const [code, setCode] = useState('// Start coding here\n');
  const [language, setLanguage] = useState('javascript');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [lines, setLines] = useState<DrawingLine[]>([]);
  const [currentLine, setCurrentLine] = useState<DrawingLine | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [compileResult, setCompileResult] = useState<CompileResult | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponding, setAiResponding] = useState(false);
  const [aiMessages, setAiMessages] = useState<Message[]>([
    {
      id: uuidv4(),
      sender: 'AI Assistant',
      content: "Hello! I'm your AI learning assistant. How can I help you with your studies today?",
      timestamp: new Date(),
      isAI: true
    }
  ]);
  const [mentorStatus, setMentorStatus] = useState<'online' | 'away' | 'offline'>('online');
  const [showChatOptions, setShowChatOptions] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const aiChatContainerRef = useRef<HTMLDivElement>(null);
  const peerRef = useRef<Peer>();
  const streamRef = useRef<MediaStream>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  // Initialize WebRTC and other effects
  useEffect(() => {
    const initializeWebRTC = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        const peer = new Peer(uuidv4());
        peerRef.current = peer;

        peer.on('call', (call) => {
          call.answer(stream);
          call.on('stream', (remoteStream) => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
            }
          });
        });

        // Simulate mentor connection after 3 seconds
        setTimeout(() => {
          // In a real app, this would be an actual connection event
          addSystemMessage("Your mentor has joined the session");
        }, 3000);

      } catch (error) {
        console.error('Error accessing media devices:', error);
        addSystemMessage("Unable to access camera or microphone. Please check your permissions.");
      }
    };

    initializeWebRTC();

    // Cleanup function
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, []);

  // Add system message helper
  const addSystemMessage = (content: string) => {
    const message: Message = {
      id: uuidv4(),
      sender: 'System',
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  // Scroll to bottom of chats when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (aiChatContainerRef.current) {
      aiChatContainerRef.current.scrollTop = aiChatContainerRef.current.scrollHeight;
    }
  }, [aiMessages]);

  // Scroll to bottom of output when compile result changes
  useEffect(() => {
    if (outputRef.current && compileResult) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [compileResult]);

  // Redraw canvas when lines change
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Redraw all lines
    lines.forEach(drawLine);
    
    function drawLine(line: DrawingLine) {
      if (!ctx) return;
      
      ctx.beginPath();
      ctx.lineWidth = line.tool === 'eraser' ? 20 : line.width;
      
      if (line.tool === 'eraser') {
        ctx.strokeStyle = '#FFFFFF';
        ctx.globalCompositeOperation = 'destination-out';
      } else {
        ctx.strokeStyle = line.color;
        ctx.globalCompositeOperation = 'source-over';
      }
      
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      for (let i = 0; i < line.points.length - 1; i++) {
        ctx.moveTo(line.points[i].x, line.points[i].y);
        ctx.lineTo(line.points[i + 1].x, line.points[i + 1].y);
      }
      
      ctx.stroke();
    }
    
    // Draw current line if it exists
    if (currentLine) {
      drawLine(currentLine);
    }
    
    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';
  }, [lines, currentLine]);

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: uuidv4(),
        sender: 'You',
        content: newMessage,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
      
      // Simulate mentor response after 2 seconds
      setTimeout(() => {
        simulateMentorResponse();
      }, 2000);
    }
  };

  const simulateMentorResponse = () => {
    // This would be replaced with actual response from the mentor
    const mentorResponses = [
      "Great question! Let's explore that concept further.",
      "I think you're on the right track. Have you considered trying a different approach?",
      "That's an excellent observation. Let me show you another way to think about this.",
      "Let's look at an example to clarify this concept.",
      "You're making good progress! Would you like to try solving the next part?"
    ];
    
    const response = mentorResponses[Math.floor(Math.random() * mentorResponses.length)];
    
    const message: Message = {
      id: uuidv4(),
      sender: 'Mentor',
      content: response,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, message]);
  };

  const handleAskAI = () => {
    if (aiQuestion.trim()) {
      // Add user question to AI chat
      const userQuestion: Message = {
        id: uuidv4(),
        sender: 'You',
        content: aiQuestion,
        timestamp: new Date()
      };
      
      setAiMessages(prev => [...prev, userQuestion]);
      setAiResponding(true);
      
      // Simulate AI thinking and responding
      setTimeout(() => {
        generateAIResponse(aiQuestion);
        setAiQuestion('');
        setAiResponding(false);
      }, 1500);
    }
  };

  const generateAIResponse = (question: string) => {
    // This would connect to an actual AI service in production
    const aiResponses = [
      `Based on your question about "${question.slice(0, 20)}...", I would recommend focusing on these key concepts: 1) Understanding the fundamentals first, 2) Practice with simple examples, 3) Then gradually tackle more complex problems.`,
      `Great question! When working with ${question.includes('code') ? 'this code' : 'this concept'}, remember that breaking down the problem into smaller parts will help you understand it better. Would you like me to explain a specific part in more detail?`,
      `I've analyzed your question about ${question.slice(0, 15)}... This is a common area where students face challenges. The most important thing to understand is the underlying principle rather than memorizing steps. Let me know if you'd like a specific example.`,
      `For your question, I'd recommend this approach: first, make sure you understand what the problem is asking for. Then, identify the key concepts involved. Finally, try solving simpler versions before tackling the full problem.`
    ];
    
    const response = aiResponses[Math.floor(Math.random() * aiResponses.length)];
    
    const aiMessage: Message = {
      id: uuidv4(),
      sender: 'AI Assistant',
      content: response,
      timestamp: new Date(),
      isAI: true
    };
    
    setAiMessages(prev => [...prev, aiMessage]);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileShare: FileShare = {
        id: uuidv4(),
        name: file.name,
        size: file.size,
        sender: 'You',
        url: URL.createObjectURL(file),
        timestamp: new Date(),
      };
      setFiles(prev => [...prev, fileShare]);
      
      // Add a message about the shared file
      addSystemMessage(`You shared a file: ${file.name}`);
    }
  };

  const handleCodeChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const clearWhiteboard = () => {
    setLines([]);
    
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
    
    addSystemMessage("You cleared the whiteboard");
  };

  // Code compilation function
  const compileCode = async () => {
    setIsCompiling(true);
    setShowOutput(true);
    
    try {
      // In a real application, you would send the code to a backend service
      const startTime = performance.now();
      
      // Mock API call to a code execution service
      const response = await mockCompileRequest(code, language);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      setCompileResult({
        output: response.output,
        error: response.error,
        executionTime: executionTime
      });
      
      // Add a message to the chat about the code execution
      if (!response.error) {
        addSystemMessage("Your code executed successfully");
      } else {
        addSystemMessage("Your code encountered an error during execution");
      }
      
    } catch (error) {
      setCompileResult({
        output: '',
        error: 'Error connecting to compilation service',
        executionTime: 0
      });
    } finally {
      setIsCompiling(false);
    }
  };
  
  // This is a mock function that simulates sending code to a backend
  const mockCompileRequest = async (code: string, language: string) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demonstration purposes only
    if (language === 'javascript') {
      try {
        let output = '';
        const consoleLog = console.log;
        // Override console.log to capture output
        console.log = (...args) => {
          output += args.join(' ') + '\n';
        };
        
        // WARNING: This is extremely unsafe and only for demo purposes
        // eslint-disable-next-line no-eval
        eval(code);
        
        // Restore console.log
        console.log = consoleLog;
        
        return { output, error: '' };
      } catch (err) {
        return { output: '', error: (err as Error).message };
      }
    }
    
    // For other languages, return a placeholder message
    return {
      output: `[Mock output] Running ${language} code...\nHello, world!`,
      error: ''
    };
  };

  const handleSaveCode = () => {
    // Create a blob and download the code file
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${getFileExtension(language)}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    addSystemMessage(`You saved your code as code.${getFileExtension(language)}`);
  };
  
  const getFileExtension = (lang: string) => {
    switch (lang) {
      case 'javascript': return 'js';
      case 'typescript': return 'ts';
      case 'python': return 'py';
      case 'java': return 'java';
      case 'cpp': return 'cpp';
      default: return 'txt';
    }
  };

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newLine: DrawingLine = {
      points: [{ x, y }],
      color: currentColor,
      width: tool === 'eraser' ? 20 : 2,
      tool
    };
    
    setCurrentLine(newLine);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentLine || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newPoint = { x, y };
    
    setCurrentLine(prevLine => {
      if (!prevLine) return null;
      
      const updatedLine = { 
        ...prevLine,
        points: [...prevLine.points, newPoint]
      };
      
      // Draw the latest segment immediately for smooth drawing
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const lastPoint = prevLine.points[prevLine.points.length - 1];
        
        ctx.beginPath();
        ctx.lineWidth = prevLine.tool === 'eraser' ? 20 : prevLine.width;
        
        if (prevLine.tool === 'eraser') {
          ctx.strokeStyle = '#FFFFFF';
          ctx.globalCompositeOperation = 'destination-out';
        } else {
          ctx.strokeStyle = prevLine.color;
          ctx.globalCompositeOperation = 'source-over';
        }
        
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(newPoint.x, newPoint.y);
        ctx.stroke();
        
        // Reset composite operation
        ctx.globalCompositeOperation = 'source-over';
      }
      
      return updatedLine;
    });
  };

  const endDrawing = () => {
    if (isDrawing && currentLine) {
      setLines(prevLines => [...prevLines, currentLine]);
      setCurrentLine(null);
      setIsDrawing(false);
    }
  };

  const handleAskForHelp = () => {
    // Prompt to get help with the current code
    const currentCodeHelp = code.trim() 
      ? `I need help understanding this ${language} code:\n\n${code.slice(0, 200)}${code.length > 200 ? '...' : ''}`
      : `I need help with ${language} programming.`;
    
    setAiQuestion(currentCodeHelp);
    setActiveTab('ai-help');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-3 gap-6">
          {/* Video Call Section */}
          <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'col-span-1'}`}>
            <div className="relative bg-black rounded-lg overflow-hidden">
              <div className="absolute top-4 left-4 bg-opacity-50 bg-black py-1 px-2 rounded-full">
                <div className="flex items-center">
                  <div className={`h-3 w-3 rounded-full mr-2 ${
                    mentorStatus === 'online' ? 'bg-green-500' : 
                    mentorStatus === 'away' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-white text-xs font-medium">
                    Mentor {mentorStatus === 'online' ? 'Online' : mentorStatus === 'away' ? 'Away' : 'Offline'}
                  </span>
                </div>
              </div>
              
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full aspect-video object-cover"
              />
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="absolute bottom-4 right-4 w-1/3 aspect-video object-cover rounded-lg border-2 border-white"
              />
              <div className="absolute bottom-4 left-4 flex space-x-2">
                <button
                  onClick={toggleVideo}
                  className={`p-2 rounded-full ${
                    isVideoEnabled ? 'bg-gray-800 text-white' : 'bg-red-600 text-white'
                  }`}
                >
                  {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                </button>
                <button
                  onClick={toggleAudio}
                  className={`p-2 rounded-full ${
                    isAudioEnabled ? 'bg-gray-800 text-white' : 'bg-red-600 text-white'
                  }`}
                >
                  {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                </button>
              </div>
              <button
                onClick={toggleFullscreen}
                className="absolute top-4 right-4 p-2 rounded-full bg-gray-800 text-white"
              >
                {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Main Content Section */}
          <div className={`${isFullscreen ? 'hidden' : 'col-span-2'}`}>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex items-center px-4 py-2 border-b-2 font-medium text-sm ${
                    activeTab === 'chat'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Chat with Mentor
                </button>
                <button
                  onClick={() => setActiveTab('code')}
                  className={`flex items-center px-4 py-2 border-b-2 font-medium text-sm ${
                    activeTab === 'code'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Code className="h-5 w-5 mr-2" />
                  Code Editor
                </button>
                <button
                  onClick={() => setActiveTab('whiteboard')}
                  className={`flex items-center px-4 py-2 border-b-2 font-medium text-sm ${
                    activeTab === 'whiteboard'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Pencil className="h-5 w-5 mr-2" />
                  Whiteboard
                </button>
                <button
                  onClick={() => setActiveTab('ai-help')}
                  className={`flex items-center px-4 py-2 border-b-2 font-medium text-sm ${
                    activeTab === 'ai-help'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Bot className="h-5 w-5 mr-2" />
                  AI Help
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-4">
                {activeTab === 'chat' && (
                  <div className="h-[600px] flex flex-col">
                    {/* Chat Messages */}
                    <div
                      ref={chatContainerRef}
                      className="flex-1 overflow-y-auto mb-4 space-y-4"
                    >
                      <div className="bg-indigo-50 p-3 rounded-lg mb-4">
                        <p className="text-sm text-indigo-800">
                          Welcome to your session! Your mentor is online and ready to help. Use the tabs above to switch between chat, code editor, whiteboard, and AI help.
                        </p>
                      </div>
                      
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.sender === 'You' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          {message.sender === 'System' ? (
                            <div className="max-w-full w-full text-center">
                              <div className="inline-block bg-gray-200 px-3 py-1 rounded-full">
                                <p className="text-xs text-gray-700">{message.content}</p>
                              </div>
                            </div>
                          ) : (
                            <div
                              className={`max-w-xs px-4 py-2 rounded-lg ${
                                message.sender === 'You'
                                  ? 'bg-indigo-600 text-white'
                                  : message.sender === 'Mentor'
                                  ? 'bg-green-600 text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              {message.sender !== 'You' && (
                                <p className="text-xs font-medium mb-1 opacity-75">{message.sender}</p>
                              )}
                              <p className="text-sm">{message.content}</p>
                              <p className="text-xs mt-1 opacity-75">
                                {message.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* File Sharing */}
                    {files.length > 0 && (
                      <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Shared Files</h3>
                        <div className="space-y-2">
                          {files.map((file) => (
                            <div
                              key={file.id}
                              className="flex items-center justify-between bg-gray-50 p-2 rounded-lg"
                            >
                              <div className="flex items-center">
                                <Share className="h-5 w-5 text-gray-400 mr-2" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                  <p className="text-xs text-gray-500">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                              </div>
                              <a
                                href={file.url}
                                download={file.name}
                                className="p-2 text-gray-400 hover:text-indigo-600"
                              >
                                <Download className="h-5 w-5" />
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Message Input */}
                    <div className="flex space-x-4">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder="Type a message to your mentor..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          onClick={() => setShowChatOptions(!showChatOptions)}
                          className="absolute right-3 top-2 text-gray-400 hover:text-gray-600"
                        >
                          <HelpCircle className="h-5 w-5" />
                        </button>
                        
                        {showChatOptions && (
                          <div className="absolute bottom-12 right-0 bg-white shadow-lg rounded-lg p-3 border border-gray-200 w-64">
                            <p className="text-sm font-medium text-gray-700 mb-2">Quick Messages:</p>
                            <div className="space-y-2">
                              {["I need help with this problem", "Could you explain the concept again?", "I'm stuck on this part", "Can we try a different approach?"].map((msg, i) => (
                                <button
                                  key={i}
                                  onClick={() => {
                                    setNewMessage(msg);
                                    setShowChatOptions(false);
                                  }}
                                  className="w-full text-left text-sm p-2 hover:bg-gray-100 rounded"
                                >
                                  {msg}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <label className="p-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 flex items-center justify-center">
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                        <Share className="h-5 w-5 text-gray-500" />
                      </label>
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'code' && (
                  <div className="h-[600px] flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex space-x-2 items-center">
                        <select
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="border border-gray-300 rounded px-2 py-1 text-sm"
                        >
                          <option value="javascript">JavaScript</option>
                          <option value="typescript">TypeScript</option>
                          <option value="python">Python</option>
                          <option value="java">Java</option>
                          <option value="cpp">C++</option>
                        </select>
                        <button
                          onClick={compileCode}
                          disabled={isCompiling}
                          className="flex items-center px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
                        >
                          {isCompiling ? 'Running...' : 'Run'}
                          {!isCompiling && <Play className="h-4 w-4 ml-1" />}
                        </button>
                        <button
                          onClick={handleSaveCode}
                          className="flex items-center px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                        >
                          Save
                          <Save className="h-4 w-4 ml-1" />
                        </button>
                      </div>
                      <button
                        onClick={handleAskForHelp}
                        className="flex items-center px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                      >
                        Ask for Help
                        <HelpCircle className="h-4 w-4 ml-1" />
                      </button>
                    </div>
                    
                    <div className="flex-1 border border-gray-300 rounded-lg overflow-hidden">
                      <Editor
                        height="100%"
                        defaultLanguage={language}
                        language={language}
                        value={code}
                        onChange={handleCodeChange}
                        theme="vs-light"
                        options={{
                          minimap: { enabled: false },
                          fontSize: 14,
                          wordWrap: 'on'
                        }}
                      />
                    </div>
                    
                    {showOutput && (
                      <div 
                        ref={outputRef}
                        className="mt-4 bg-black text-white p-3 rounded-lg h-32 overflow-y-auto font-mono text-sm"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-xs uppercase tracking-wider text-gray-400">
                            Output {compileResult && !compileResult.error && `(${compileResult.executionTime.toFixed(0)}ms)`}
                          </h3>
                          <button 
                            onClick={() => setShowOutput(false)}
                            className="text-gray-500 hover:text-white"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        {isCompiling ? (
                          <div className="text-yellow-300">Running your code...</div>
                        ) : compileResult ? (
                          <>
                            {compileResult.error ? (
                              <div className="text-red-400 whitespace-pre-wrap">{compileResult.error}</div>
                            ) : (
                              <div className="text-green-300 whitespace-pre-wrap">{compileResult.output}</div>
                            )}
                          </>
                        ) : (
                          <div className="text-gray-400">Click Run to execute your code</div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'whiteboard' && (
                  <div className="h-[600px] flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex space-x-2 items-center">
                        <button
                          onClick={() => setTool('pen')}
                          className={`p-2 rounded ${tool === 'pen' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-700'}`}
                        >
                          <Pencil className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setTool('eraser')}
                          className={`p-2 rounded ${tool === 'eraser' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-700'}`}
                        >
                          <Eraser className="h-5 w-5" />
                        </button>
                        <input 
                          type="color" 
                          value={currentColor}
                          onChange={(e) => setCurrentColor(e.target.value)}
                          className="border border-gray-300 rounded h-8 w-10 cursor-pointer"
                        />
                      </div>
                      <button
                        onClick={clearWhiteboard}
                        className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                      >
                        Clear
                      </button>
                    </div>
                    
                    <div className="flex-1 border border-gray-300 rounded-lg overflow-hidden bg-white">
                      <canvas
                        ref={canvasRef}
                        width={800}
                        height={500}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={endDrawing}
                        onMouseLeave={endDrawing}
                        className="w-full h-full cursor-crosshair"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'ai-help' && (
                  <div className="h-[600px] flex flex-col">
                    {/* AI Chat Messages */}
                    <div
                      ref={aiChatContainerRef}
                      className="flex-1 overflow-y-auto mb-4 space-y-4 p-2"
                    >
                      {aiMessages.map((message) => (
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
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <div className="flex items-center mb-1">
                              {message.isAI ? (
                                <Bot className="h-4 w-4 mr-1 opacity-75" />
                              ) : (
                                <User className="h-4 w-4 mr-1 opacity-75" />
                              )}
                              <p className="text-xs font-medium opacity-75">{message.sender}</p>
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            <p className="text-xs mt-1 opacity-75">
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      
                      {aiResponding && (
                        <div className="flex justify-start">
                          <div className="max-w-md px-4 py-2 rounded-lg bg-gray-100 text-gray-900">
                            <div className="flex items-center mb-1">
                              <Bot className="h-4 w-4 mr-1 opacity-75" />
                              <p className="text-xs font-medium opacity-75">AI Assistant</p>
                            </div>
                            <p className="text-sm">Thinking...</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* AI Question Input */}
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={aiQuestion}
                        onChange={(e) => setAiQuestion(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAskAI()}
                        placeholder="Ask the AI Assistant for help..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        onClick={handleAskAI}
                        disabled={!aiQuestion.trim() || aiResponding}
                        className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentInterface;