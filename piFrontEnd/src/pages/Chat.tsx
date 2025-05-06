import React, { useEffect, useRef } from 'react';
import { Share, Send, Download } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

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

interface ChatProps {
  socket: any;
  roomId: string;
  messages: Message[];
  files: FileShare[];
  newMessage: string;
  setMessages: (messages: Message[]) => void;
  setNewMessage: (message: string) => void;
  setFiles: (files: FileShare[]) => void;
}

const Chat: React.FC<ChatProps> = ({
  socket,
  roomId,
  messages,
  files,
  newMessage,
  setMessages,
  setNewMessage,
  setFiles,
}) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socket.on('receive-message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      socket.off('receive-message');
    };
  }, [socket, setMessages]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: uuidv4(),
        sender: 'You',
        content: newMessage,
        timestamp: new Date(),
      };

      socket.emit('send-message', { roomId, message });
      setMessages(prev => [...prev, message]);
      setNewMessage('');
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
      
      // Emit file sharing event
      socket.emit('share-file', { roomId, fileShare });
    }
  };

  return (
    <div className="h-[600px] flex flex-col">
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto mb-4 space-y-4">
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
  );
};

export default Chat;