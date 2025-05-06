import React, { useEffect, useRef } from 'react';
import { Video, VideoOff, Mic, MicOff, Maximize2, Minimize2 } from 'lucide-react';
import Peer from 'peerjs';

interface VideoCallProps {
  socket: any;
  roomId: string;
  isFullscreen: boolean;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  toggleVideo: () => void;
  toggleAudio: () => void;
  toggleFullscreen: () => void;
}

const VideoCall: React.FC<VideoCallProps> = ({
  socket,
  roomId,
  isFullscreen,
  isVideoEnabled,
  isAudioEnabled,
  toggleVideo,
  toggleAudio,
  toggleFullscreen,
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<Peer>();
  const streamRef = useRef<MediaStream>();

  useEffect(() => {
    const initializeWebRTC = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        const peer = new Peer();
        peerRef.current = peer;

        peer.on('open', (peerId) => {
          socket.emit('join-room', { roomId, peerId });
        });

        socket.on('user-connected', (remotePeerId: string) => {
          const call = peer.call(remotePeerId, stream);
          call.on('stream', (remoteStream) => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
            }
          });
        });

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

    initializeWebRTC();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, [socket, roomId]);

  return (
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
  );
};

export default VideoCall;