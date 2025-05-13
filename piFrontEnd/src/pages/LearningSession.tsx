import React, { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Editor from "@monaco-editor/react";
import Peer from 'peerjs';
import { io } from 'socket.io-client';
import Sidebar from '../components/Sidebar'; // Import the Sidebar component
import { useParams } from 'react-router-dom';
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
  Maximize2,
  Minimize2,
  Eraser,
  Play,  // Added for the run button
  Save // Added for saving code
} from 'lucide-react';

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

function App() {
  const { sessionId } = useParams();
  const [userId, setUserId] = useState(localStorage.getItem('userId') || uuidv4());
  useEffect(() => {
    // Sauvegarde l'ID utilisateur dans le localStorage
    if (!localStorage.getItem('userId')) {
      localStorage.setItem('userId', userId);
    }
  }, [userId]);


  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [files, setFiles] = useState<FileShare[]>([]);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<'chat' | 'code' | 'whiteboard'>('chat');
  const [code, setCode] = useState('// Start coding here\n');
  const [language, setLanguage] = useState('javascript');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [lines, setLines] = useState<DrawingLine[]>([]);
  const [currentLine, setCurrentLine] = useState<DrawingLine | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  // Added for code compilation
  const [compileResult, setCompileResult] = useState<CompileResult | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [showOutput, setShowOutput] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const peerRef = useRef<Peer>();
  const streamRef = useRef<MediaStream>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);



  // // Initialize WebRTC and other effects
  // useEffect(() => {
  //   const initializeWebRTC = async () => {
  //     try {
  //       const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  //       streamRef.current = stream;
  //       if (localVideoRef.current) {
  //         localVideoRef.current.srcObject = stream;
  //       }

  //       const peer = new Peer(uuidv4());
  //       peerRef.current = peer;

  //       peer.on('call', (call) => {
  //         call.answer(stream);
  //         call.on('stream', (remoteStream) => {
  //           if (remoteVideoRef.current) {
  //             remoteVideoRef.current.srcObject = remoteStream;
  //           }
  //         });
  //       });

  //     } catch (error) {
  //       console.error('Error accessing media devices:', error);
  //     }
  //   };

  //   initializeWebRTC();

  //   return () => {
  //     if (streamRef.current) {
  //       streamRef.current.getTracks().forEach(track => track.stop());
  //     }
  //     if (peerRef.current) {
  //       peerRef.current.destroy();
  //     }
  //   };
  // }, []);

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


  // const socket = io(window.location.hostname.includes('localhost') 
  // ? `http://${window.location.hostname}:3000` 
  // : `https://${window.location.hostname}`);
  const hostname = window.location.hostname || 'localhost';
  const backendPort = 3000;
  
  const socket = io(`http://${hostname}:${backendPort}`);
  

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`http://${window.location.hostname}:3000/api/messages`);
        if (response.ok) {
          const messageHistory = await response.json();
          // Convertir les messages du format serveur au format de l'interface utilisateur
          const formattedMessages = messageHistory.map(msg => ({
            id: msg._id || uuidv4(),
            sender: msg.senderId === userId ? 'You' : 'Friend',
            content: msg.content,
            timestamp: new Date(msg.timestamp),
          }));
          setMessages(formattedMessages);
          
          // Auto-scroll après le chargement des messages
          setTimeout(() => {
            if (chatContainerRef.current) {
              chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
            }
          }, 100);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des messages:', error);
      }
    };
    
    fetchMessages();
  }, [userId]);




  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server');
      // Rejoindre une room basée sur l'ID de session
      if (sessionId) {
        socket.emit('joinRoom', { roomId: sessionId, userId });
      }
    });
  
    socket.on('receiveMessage', (data) => {
      console.log('Message received:', data);
      
      // Formater le message reçu
      const newMessage = {
        id: data.id || uuidv4(),
        sender: data.senderId === userId ? 'You' : 'Friend',
        content: data.content,
        timestamp: new Date(data.timestamp)
      };
      
      // Ajouter le message à l'état local
      setMessages(prev => [...prev, newMessage]);
      
      // Auto-scroll quand un nouveau message est reçu
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }, 100);
    });

  
    return () => {
      socket.off('receiveMessage');
    };
  }, [userId]); // Ajoutez userId comme dépendance



const handleSendMessage = () => {
  if (newMessage.trim()) {
    const messageId = uuidv4();
    
    // Données du message à envoyer au serveur
    const messageData = {
      id: messageId,
      senderId: userId,
      roomId: sessionId || 'global', // Utiliser l'ID de session comme ID de room
      content: newMessage,
      timestamp: new Date()
    };
    
    // Message à afficher localement
    const message = {
      id: messageId,
      sender: 'You',
      content: newMessage,
      timestamp: new Date(),
    };
    
    // Ajouter le message à l'état local
    setMessages(prev => [...prev, message]);
    
    // Envoyer le message via socket.io
    socket.emit('sendMessage', messageData);
    
    // Réinitialiser le champ de message
    setNewMessage('');
    
    // Auto-scroll
    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }, 100);
  }
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
  };

  // Code compilation function
  const compileCode = async () => {
    setIsCompiling(true);
    setShowOutput(true);
    
    try {
      // In a real application, you would send the code to a backend service
      // Here we're demonstrating a mock implementation
      
      const startTime = performance.now();
      
      // Mock API call to a code execution service
      // Replace with actual API call in production
      const response = await mockCompileRequest(code, language);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      setCompileResult({
        output: response.output,
        error: response.error,
        executionTime: executionTime
      });
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
  // In a real application, replace this with an actual API call
  const mockCompileRequest = async (code: string, language: string) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demonstration purposes only
    // Simple evaluation for JavaScript code (NEVER use eval in production)
    if (language === 'javascript') {
      try {
        // This is just for demo purposes, NEVER use in production
        // Ideally, code would be executed in a sandboxed environment on the backend
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

  return (
    <div className="min-h-screen bg-gray-50">
            <Sidebar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-3 gap-6">
          {/* Video Call Section */}
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
              </div>

    {/* Tab Content */}
    <div className="p-4">
    {activeTab === 'chat' && (
  <div className="h-[600px] flex flex-col">
    {/* Chat Messages */}
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
                    {/* Code Editor Controls */}
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

                    {/* Split View: Editor and Output */}
                    <div className={`flex flex-col flex-1 ${showOutput ? 'h-full' : ''}`}>
                      {/* Editor */}
                      <div className={`border border-gray-200 rounded-lg overflow-hidden ${
                        showOutput ? 'h-1/2' : 'h-full'
                      }`}>
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

                      {/* Output Panel */}
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
                        className={`p-2 rounded ${
                          tool === 'pen' ? 'bg-indigo-600 text-white' : 'bg-gray-200'
                        }`}
                      >
                        <Pencil className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setTool('eraser')}
                        className={`p-2 rounded ${
                          tool === 'eraser' ? 'bg-indigo-600 text-white' : 'bg-gray-200'
                        }`}
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

}

export default App;