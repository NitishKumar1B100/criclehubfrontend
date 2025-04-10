// VideoCall.jsx
import { useEffect, useRef } from "react";

function VideoCall({ cameraTrack, micTrack, remoteTracks }) {
    const localVideoRef = useRef(null);
    const remoteContainerRef = useRef(null);
  
    useEffect(() => {
      if (cameraTrack && localVideoRef.current) {
        cameraTrack.play(localVideoRef.current);
      }
    }, [cameraTrack]);
  
    useEffect(() => {
        if (remoteTracks && remoteContainerRef.current) {
          remoteContainerRef.current.innerHTML = ""; // Clear old tracks
      
          Object.entries(remoteTracks).forEach(([uid, { videoTrack, displayName }]) => {
            const wrapper = document.createElement("div");
            wrapper.className = "w-64 h-50 bg-gray-800 rounded m-2 p-2 flex flex-col items-center justify-center";
      
            // Create video container
            const videoDiv = document.createElement("div");
            videoDiv.className = "w-full h-40 bg-gray-700 rounded";
            wrapper.appendChild(videoDiv);
      
            // Play video in the div
            if (videoTrack) {
              videoTrack.play(videoDiv);
            }
            // Name tag
            const nameTag = document.createElement("p");
            nameTag.textContent = `${displayName}`;
            nameTag.className = "mt-2 text-white text-sm text-center";
            wrapper.appendChild(nameTag);
      
            remoteContainerRef.current.appendChild(wrapper);
          });
        }
      }, [remoteTracks]);
      
      
  
    return (
      <div className="w-full h-full flex flex-row items-center justify-center gap-4 p-4">
        <div className="w-64 h-50 bg-gray-700 rounded p-2">
          <div ref={localVideoRef} className="w-full h-full" />
        <p className="mt-2 text-white text-sm text-center">You</p>
        </div>
  
        <div>
          <div ref={remoteContainerRef} className="flex flex-wrap" />
        </div>
      </div>
    );
  }
  

export default VideoCall;