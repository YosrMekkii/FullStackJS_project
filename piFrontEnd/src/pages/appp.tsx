import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import VideoCall from './VideoCall';
import Chat from './Chat';
import Sidebar from './../components/Sidebar';
import { MessageSquare } from 'lucide-react';


// ... (rest of your imports)


function Appp() {
  const { sessionId } = useParams();
  const [socket, setSocket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [files, setFiles] = useState<any[]>([]);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<'chat' | 'code' | 'whiteboard'>('chat');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ... (rest of your state variables)

  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    if (sessionId) {
      newSocket.emit('join-room', { roomId: sessionId });
    }

    return () => {
      newSocket.close();
    };
  }, [sessionId]);

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (!socket) {
    return <div>Connecting...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-3 gap-6">
          <VideoCall
            socket={socket}
            roomId={sessionId || ''}
            isFullscreen={isFullscreen}
            isVideoEnabled={isVideoEnabled}
            isAudioEnabled={isAudioEnabled}
            toggleVideo={toggleVideo}
            toggleAudio={toggleAudio}
            toggleFullscreen={toggleFullscreen}
          />

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
                {/* ... (other tab buttons) */}
              </div>

              <div className="p-4">
                {activeTab === 'chat' && (
                  <Chat
                    socket={socket}
                    roomId={sessionId || ''}
                    messages={messages}
                    files={files}
                    newMessage={newMessage}
                    setMessages={setMessages}
                    setNewMessage={setNewMessage}
                    setFiles={setFiles}
                  />
                )}
                {/* ... (other tab content) */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Appp;