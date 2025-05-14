import React, { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Editor from "@monaco-editor/react";
import Peer from 'peerjs';
import { io } from 'socket.io-client';
import { useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { 
  Bot, 
  User, 
  Brain, 
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
  Maximize2,
  Minimize2,
  Eraser,
  Play,
  Save
} from 'lucide-react';

// Define interfaces
interface AIMessage {
  id: string;
  content: string;
  isAI: boolean;
  timestamp: Date;
}

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
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

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Initialize socket.io outside component to prevent multiple connections
const socket = io('http://172.20.10.2:3000', {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

function App() {
  const { sessionId } = useParams();
  const [userId] = useState(localStorage.getItem('userId') || uuidv4());
  const [activeTab, setActiveTab] = useState<'chat' | 'code' | 'whiteboard' | 'ai-help'>('chat');
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([
    {
      id: uuidv4(),
      content: "Hello! I'm your AI learning assistant. How can I help you today?",
      isAI: true,
      timestamp: new Date(),
    },
  ]);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponding, setAiResponding] = useState(false);
  const [aiTyping, setAiTyping] = useState(false);
  const [aiStream, setAiStream] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [files, setFiles] = useState<FileShare[]>([]);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
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
  const [remotePeers, setRemotePeers] = useState<string[]>([]);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const aiChatContainerRef = useRef<HTMLDivElement>(null);
  const peerRef = useRef<Peer>();
  const streamRef = useRef<MediaStream>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const peerConnections = useRef<Record<string, any>>({});

  // Save userId to localStorage
  useEffect(() => {
    if (!localStorage.getItem('userId')) {
      localStorage.setItem('userId', userId);
    }
  }, [userId]);

  // Initialize WebRTC connection
  useEffect(() => {
    const initializeWebRTC = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        const peerOptions = {
          host: '172.20.10.2',
          port: 9000,
          path: '/myapp',
          secure: false,
          debug: 3,
        };

        const peer = new Peer(`${userId}-${Date.now()}`, peerOptions);
        peerRef.current = peer;

        peer.on('open', (id) => {
          console.log('PeerJS connected with ID:', id);
          if (sessionId) {
            socket.emit('joinVideoRoom', { 
              roomId: sessionId, 
              userId, 
              peerId: id 
            });
          }
        });

        peer.on('connection', (conn) => {
          conn.on('data', (data) => {
            console.log('Received data:', data);
          });
          conn.on('open', () => {
            conn.send(`Hello from ${userId}`);
          });
        });

        peer.on('call', (call) => {
          console.log('Receiving call from:', call.peer);
          call.answer(stream);

          call.on('stream', (remoteStream) => {
            console.log('Received remote stream');
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
            }
          });

          call.on('error', (err) => {
            console.error('Call error:', err);
          });

          peerConnections.current[call.peer] = call;
        });

        peer.on('error', (err) => {
          console.error('Peer connection error:', err);
          if (err.type === 'unavailable-id' || err.type === 'id-taken') {
            const fallbackId = `${userId}-${Math.floor(Math.random() * 10000)}`;
            peerRef.current = new Peer(fallbackId, peerOptions);
          }
        });

      } catch (error) {
        console.error('Error accessing media devices:', error);
      }
    };

    initializeWebRTC();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      Object.values(peerConnections.current).forEach((call: any) => {
        if (call && typeof call.close === 'function') {
          call.close();
        }
      });
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, [userId, sessionId]);

  // Socket.io event listeners and message fetching
  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server');
      if (sessionId) {
        socket.emit('joinRoom', { roomId: sessionId, userId });
      }
    });

    socket.on('receiveMessage', (data) => {
      const newMessage: Message = {
        id: data.id || uuidv4(),
        sender: data.senderId === userId ? 'You' : 'Friend',
        content: data.content,
        timestamp: new Date(data.timestamp),
      };
      setMessages((prev) => [...prev, newMessage]);
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }, 100);
    });

    socket.on('peerJoined', ({ userId: remotePeerId, peerId }) => {
      if (remotePeerId === userId) return;
      setRemotePeers(prev => [...new Set([...prev, peerId])]);
      
      if (streamRef.current && peerRef.current) {
        const call = peerRef.current.call(peerId, streamRef.current);
        call.on('stream', (remoteStream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        });
        call.on('error', (err) => {
          console.error('Call error:', err);
        });
        peerConnections.current[peerId] = call;
      }
    });

    socket.on('peerLeft', ({ peerId }) => {
      setRemotePeers(prev => prev.filter(id => id !== peerId));
      if (peerConnections.current[peerId]) {
        peerConnections.current[peerId].close();
        delete peerConnections.current[peerId];
      }
    });

    // Fetch initial messages
    const fetchMessages = async () => {
      try {
        const response = await fetch(`http://172.20.10.2:3000/api/messages`);
        if (response.ok) {
          const messageHistory = await response.json();
          const formattedMessages = messageHistory.map((msg: any) => ({
            id: msg._id || uuidv4(),
            sender: msg.senderId === userId ? 'You' : 'Friend',
            content: msg.content,
            timestamp: new Date(msg.timestamp),
          }));
          setMessages(formattedMessages);
          setTimeout(() => {
            if (chatContainerRef.current) {
              chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
            }
          }, 100);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };
    fetchMessages();

    return () => {
      socket.off('connect');
      socket.off('receiveMessage');
      socket.off('peerJoined');
      socket.off('peerLeft');
    };
  }, [userId, sessionId]);

  // Auto-scroll for AI chat
  useEffect(() => {
    if (aiChatContainerRef.current) {
      aiChatContainerRef.current.scrollTop = aiChatContainerRef.current.scrollHeight;
    }
  }, [aiMessages, aiStream]);

  // Auto-scroll for regular chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Clear error message after 5 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // Handle asking the AI
  const handleAskAI = async () => {
    if (!aiQuestion.trim()) return;

    const userQuestion: AIMessage = {
      id: uuidv4(),
      content: aiQuestion,
      isAI: false,
      timestamp: new Date(),
    };

    setAiMessages((prev) => [...prev, userQuestion]);
    const updatedHistory = [...chatHistory, { role: 'user', content: aiQuestion }];
    setChatHistory(updatedHistory);

    setAiTyping(true);
    setAiResponding(true);
    setAiStream('');

    try {
      await callOpenAI(aiQuestion, updatedHistory);
    } catch (error) {
      console.error('Error calling AI API:', error);
      const errorMsg = "I'm sorry, I'm having trouble connecting right now. Please try again.";
      setErrorMessage(errorMsg);
      const errorMessageObj: AIMessage = {
        id: uuidv4(),
        content: errorMsg,
        isAI: true,
        timestamp: new Date(),
      };
      setAiMessages((prev) => [...prev, errorMessageObj]);
      setChatHistory((prev) => [...prev, { role: 'assistant', content: errorMsg }]);
    } finally {
      setAiQuestion('');
      setAiTyping(false);
      setAiResponding(false);
    }
  };

  // Call OpenAI API
  const callOpenAI = async (question: string, history: ChatMessage[]) => {
    try {
      const response = await fetch('http://192.168.1.15:3000/api/openai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, history }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch from backend');
      }

      const data = await response.json();
      const aiResponse = data.response;

      const aiMessage: AIMessage = {
        id: uuidv4(),
        content: aiResponse,
        isAI: true,
        timestamp: new Date(),
      };

      setAiMessages((prev) => [...prev, aiMessage]);
      setChatHistory((prev) => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      console.error('Error calling AI API:', error);
      throw error;
    }
  };

  // Send message
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const messageId = uuidv4();
    const messageData = {
      id: messageId,
      senderId: userId,
      roomId: sessionId || 'global',
      content: newMessage,
      timestamp: new Date(),
    };

    const message: Message = {
      id: messageId,
      sender: 'You',
      content: newMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, message]);
    socket.emit('sendMessage', messageData);
    setNewMessage('');

    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }, 100);
  };

  // File upload
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
      setFiles((prev) => [...prev, fileShare]);
    }
  };

  // Code editor
  const handleCodeChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
    }
  };

  const compileCode = async () => {
    setIsCompiling(true);
    setShowOutput(true);
    try {
      const startTime = performance.now();
      const response = await mockCompileRequest(code, language);
      const endTime = performance.now();
      setCompileResult({
        output: response.output,
        error: response.error,
        executionTime: endTime - startTime,
      });
    } catch (error) {
      setCompileResult({
        output: '',
        error: 'Error connecting to compilation service',
        executionTime: 0,
      });
    } finally {
      setIsCompiling(false);
    }
  };

  const mockCompileRequest = async (code: string, language: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (language === 'javascript') {
      try {
        let output = '';
        const consoleLog = console.log;
        console.log = (...args) => {
          output += args.join(' ') + '\n';
        };
        // WARNING: Unsafe, for demo only
        // eslint-disable-next-line no-eval
        eval(code);
        console.log = consoleLog;
        return { output, error: '' };
      } catch (err) {
        return { output: '', error: (err as Error).message };
      }
    }
    return {
      output: `[Mock output] Running ${language} code...\nHello, world!`,
      error: '',
    };
  };

  const handleSaveCode = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${getFileExtension(language)}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

  // Whiteboard
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    lines.forEach((line) => drawLine(line, ctx));
    if (currentLine) drawLine(currentLine, ctx);
  }, [lines, currentLine]);

  const drawLine = (line: DrawingLine, ctx: CanvasRenderingContext2D) => {
    ctx.beginPath();
    ctx.lineWidth = line.tool === 'eraser' ? 20 : line.width;
    ctx.strokeStyle = line.tool === 'eraser' ? '#FFFFFF' : line.color;
    ctx.globalCompositeOperation = line.tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let i = 0; i < line.points.length - 1; i++) {
      ctx.moveTo(line.points[i].x, line.points[i].y);
      ctx.lineTo(line.points[i + 1].x, line.points[i + 1].y);
    }
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
  };

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
      tool,
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
    setCurrentLine((prevLine) => {
      if (!prevLine) return null;
      const updatedLine = {
        ...prevLine,
        points: [...prevLine.points, { x, y }],
      };
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const lastPoint = prevLine.points[prevLine.points.length - 1];
        ctx.beginPath();
        ctx.lineWidth = prevLine.tool === 'eraser' ? 20 : prevLine.width;
        ctx.strokeStyle = prevLine.tool === 'eraser' ? '#FFFFFF' : prevLine.color;
        ctx.globalCompositeOperation = prevLine.tool === 'eraser' ? 'destination-out' : 'source-over';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
      }
      return updatedLine;
    });
  };

  const endDrawing = () => {
    if (isDrawing && currentLine) {
      setLines((prevLines) => [...prevLines, currentLine]);
      setCurrentLine(null);
      setIsDrawing(false);
    }
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
  };

  // Video controls
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

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {errorMessage && (
          <div className="fixed top-4 right-4 bg-red-500 text-white p-3 rounded-lg shadow-lg">
            {errorMessage}
          </div>
        )}
        <div className="grid grid-cols-3 gap-6">
          <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'col-span-1'}`}>
            <div className="relative bg-black rounded-lg overflow-hidden">
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

          <div className={`${isFullscreen ? 'hidden' : 'col-span-2'}`}>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
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
                  Chat
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
                  <Brain className="h-5 w-5 mr-2" />
                  AI Help
                </button>
              </div>

              <div className="p-4">
                {activeTab === 'chat' && (
                  <div className="h-[600px] flex flex-col">
                    <div ref={chatContainerRef} className="flex-1 overflow-y-auto mb-4 space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === 'You' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs px-4 py-2 rounded-lg ${
                              message.sender === 'You' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <div className="flex items-center mb-1">
                              <span className="text-xs font-medium">{message.sender}</span>
                            </div>
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs mt-1 opacity-75">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
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
                    <div className="flex space-x-4">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <label className="p-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input type="file" onChange={handleFileUpload} className="hidden" />
                        <Share className="h-5 w-5 text-gray-400" />
                      </label>
                      <button
                        onClick={handleSendMessage}
                        className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        <Send className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'code' && (
                  <div className="h-[600px] flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center space-x-2">
                        <select
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm"
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
                          className={`flex items-center px-3 py-1 rounded ${
                            isCompiling
                              ? 'bg-gray-300 text-gray-500'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          {isCompiling ? 'Running...' : 'Run Code'}
                        </button>
                        <button
                          onClick={handleSaveCode}
                          className="flex items-center px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                        >
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </button>
                      </div>
                      <button
                        onClick={() => setShowOutput(!showOutput)}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        {showOutput ? 'Hide Output' : 'Show Output'}
                      </button>
                    </div>
                    <div className={`flex flex-col flex-1 ${showOutput ? 'h-full' : ''}`}>
                      <div className={`border border-gray-200 rounded-lg overflow-hidden ${showOutput ? 'h-1/2' : 'h-full'}`}>
                        <Editor
                          height="100%"
                          language={language}
                          value={code}
                          onChange={handleCodeChange}
                          theme="vs-dark"
                          options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            lineNumbers: "on",
                            automaticLayout: true,
                          }}
                        />
                      </div>
                      {showOutput && (
                        <div className="mt-4 h-1/2 flex flex-col">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-gray-700">Output</h3>
                            {compileResult && (
                              <span className="text-xs text-gray-500">
                                {`Execution time: ${compileResult.executionTime.toFixed(2)}ms`}
                              </span>
                            )}
                          </div>
                          <div
                            ref={outputRef}
                            className="flex-1 mt-2 p-3 bg-gray-900 text-gray-100 font-mono text-sm rounded overflow-y-auto"
                          >
                            {isCompiling ? (
                              <div className="text-yellow-300">Compiling and running code...</div>
                            ) : compileResult ? (
                              <>
                                {compileResult.output && (
                                  <pre className="whitespace-pre-wrap text-green-300">{compileResult.output}</pre>
                                )}
                                {compileResult.error && (
                                  <pre className="whitespace-pre-wrap text-red-400">{compileResult.error}</pre>
                                )}
                              </>
                            ) : (
                              <div className="text-gray-400">Run your code to see output here</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'whiteboard' && (
                  <div className="h-[600px]">
                    <div className="mb-4 flex items-center space-x-4">
                      <button
                        onClick={() => setTool('pen')}
                        className={`p-2 rounded ${tool === 'pen' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
                      >
                        <Pencil className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setTool('eraser')}
                        className={`p-2 rounded ${tool === 'eraser' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
                      >
                        <Eraser className="h-5 w-5" />
                      </button>
                      <input
                        type="color"
                        value={currentColor}
                        onChange={(e) => setCurrentColor(e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer"
                      />
                      <button
                        onClick={clearWhiteboard}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <canvas
                        ref={canvasRef}
                        width={800}
                        height={520}
                        className="bg-white"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={endDrawing}
                        onMouseLeave={endDrawing}
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'ai-help' && (
                  <div className="h-[600px] flex flex-col">
                    <div ref={aiChatContainerRef} className="flex-1 overflow-y-auto mb-4 space-y-4">
                      {aiMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.isAI ? 'justify-start' : 'justify-end'}`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                              message.isAI ? 'bg-blue-50 text-gray-800' : 'bg-indigo-100 text-gray-800'
                            }`}
                          >
                            <div className="flex items-center mb-1">
                              {message.isAI ? (
                                <Bot className="h-4 w-4 mr-1 text-blue-600" />
                              ) : (
                                <User className="h-4 w-4 mr-1 text-indigo-600" />
                              )}
                              <div className="font-medium text-xs text-gray-500">
                                {message.isAI ? 'AI Assistant' : 'You'}
                              </div>
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            <div className="text-xs text-gray-500 mt-1 text-right">
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      ))}
                      {aiTyping && (
                        <div className="flex justify-start">
                          <div className="max-w-[80%] p-3 rounded-lg bg-blue-50 text-gray-800">
                            <div className="flex items-center mb-1">
                              <Bot className="h-4 w-4 mr-1 text-blue-600" />
                              <div className="font-medium text-xs text-gray-500">AI Assistant</div>
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{aiStream || '...'}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={aiQuestion}
                        onChange={(e) => setAiQuestion(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !aiResponding && handleAskAI()}
                        placeholder="Ask the AI assistant a question..."
                        className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        disabled={aiResponding}
                      />
                      <button
                        onClick={handleAskAI}
                        disabled={aiResponding || !aiQuestion.trim()}
                        className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-white rounded-full ${
                          aiResponding || !aiQuestion.trim() ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
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

export default App;