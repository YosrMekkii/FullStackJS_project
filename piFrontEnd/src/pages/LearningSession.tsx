import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import Editor from "@monaco-editor/react";
import Peer from 'peerjs';
import { io } from 'socket.io-client';
import { Stage, Container, Graphics } from '@pixi/react';
import * as PIXI from 'pixi.js';
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
  Eraser
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
  points: number[];
  color: string;
  width: number;
  tool: 'pen' | 'eraser';
}

function App() {
  const { sessionId } = useParams();
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

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const peerRef = useRef<Peer>();
  const streamRef = useRef<MediaStream>();
  const graphicsRef = useRef<PIXI.Graphics>();

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

      } catch (error) {
        console.error('Error accessing media devices:', error);
      }
    };

//<<<<<<< HEAD
//=======
    /* Initialize Fabric.js canvas
    if (canvasRef.current) {
      fabricCanvasRef.current = new fabric.Canvas(canvasRef.current, {
        isDrawingMode: true,
        width: 800,
        height: 600,
      });
    }*/

//>>>>>>> 564d96224ee9c112b6c3527e94b1b9cb465814af
    initializeWebRTC();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, []);

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
    if (graphicsRef.current) {
      graphicsRef.current.clear();
    }
  };

  const draw = (g: PIXI.Graphics) => {
    graphicsRef.current = g;
    g.clear();

    lines.forEach(line => {
      g.lineStyle({
        width: line.tool === 'eraser' ? 20 : 2,
        color: line.tool === 'eraser' ? 0xFFFFFF : parseInt(line.color.replace('#', '0x')),
        alpha: line.tool === 'eraser' ? 0 : 1,
        cap: PIXI.LINE_CAP.ROUND,
        join: PIXI.LINE_JOIN.ROUND,
      });

      for (let i = 0; i < line.points.length - 2; i += 2) {
        g.moveTo(line.points[i], line.points[i + 1]);
        g.lineTo(line.points[i + 2], line.points[i + 3]);
      }
    });

    if (currentLine) {
      g.lineStyle({
        width: currentLine.tool === 'eraser' ? 20 : 2,
        color: currentLine.tool === 'eraser' ? 0xFFFFFF : parseInt(currentLine.color.replace('#', '0x')),
        alpha: currentLine.tool === 'eraser' ? 0 : 1,
        cap: PIXI.LINE_CAP.ROUND,
        join: PIXI.LINE_JOIN.ROUND,
      });

      for (let i = 0; i < currentLine.points.length - 2; i += 2) {
        g.moveTo(currentLine.points[i], currentLine.points[i + 1]);
        g.lineTo(currentLine.points[i + 2], currentLine.points[i + 3]);
      }
    }
  };

  const handlePointerDown = (event: PIXI.FederatedPointerEvent) => {
    const newLine: DrawingLine = {
      points: [event.global.x, event.global.y],
      color: currentColor,
      width: tool === 'eraser' ? 20 : 2,
      tool
    };
    setCurrentLine(newLine);
  };

  const handlePointerMove = (event: PIXI.FederatedPointerEvent) => {
    if (currentLine) {
      const updatedLine = {
        ...currentLine,
        points: [...currentLine.points, event.global.x, event.global.y]
      };
      setCurrentLine(updatedLine);
    }
  };

  const handlePointerUp = () => {
    if (currentLine) {
      setLines([...lines, currentLine]);
      setCurrentLine(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
                    <div
                      ref={chatContainerRef}
                      className="flex-1 overflow-y-auto mb-4 space-y-4"
                    >
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.sender === 'You' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-xs px-4 py-2 rounded-lg ${
                              message.sender === 'You'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs mt-1 opacity-75">
                              {message.timestamp.toLocaleTimeString()}
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
                        <input
                          type="file"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
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
                    </div>
                    <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden">
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
                      <Stage
                        width={800}
                        height={520}
                        options={{ backgroundColor: 0xFFFFFF }}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerUpOutside={handlePointerUp}
                      >
                        <Container>
                          <Graphics draw={draw} />
                        </Container>
                      </Stage>
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