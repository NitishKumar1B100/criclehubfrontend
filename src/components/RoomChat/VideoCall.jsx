import { useEffect, useRef } from "react";

function VideoCall({ cameraTrack, micTrack, remoteTracks, localVideoEnabled }) {
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

      Object.entries(remoteTracks).forEach(([uid, {videoTrack, displayName }]) => {
        if (!videoTrack) return; // 👈 Skip if no videoTrack

        const wrapper = document.createElement("div");
        wrapper.className =
        "w-full h-72 bg-gray-700 rounded m-2 p-2 flex flex-col items-center justify-center";
      
        const videoDiv = document.createElement("div");
        videoDiv.className = "w-full h-70 bg-gray-800 rounded";

        wrapper.appendChild(videoDiv);
        
        if (videoTrack) {
          videoTrack.play(videoDiv);
        }
        
        const nameTag = document.createElement("p");
        nameTag.textContent = `${displayName}`;
        nameTag.className = "mt-2 text-white text-sm text-center";
        wrapper.appendChild(nameTag);

        remoteContainerRef.current.appendChild(wrapper);

      });
    }
  }, [remoteTracks]);

  return (
    <div className="w-full h-full flex flex-wrap items-start justify-center gap-4 p-4">
      {/* Local Video */}
{
  cameraTrack &&localVideoEnabled && (<div className="h-72 bg-gray-700 rounded p-2 flex flex-col items-center justify-center w-full sm:w-80">
  <div ref={localVideoRef} className="w-full h-70 bg-gray-800 rounded" />
    <p className="mt-2 text-white text-sm text-center">You</p>
</div>)
}

      {/* Remote Videos */}
      <div ref={remoteContainerRef} className="w-full flex flex-wrap justify-center items-start sm:w-80" />
    </div>
  );
}

export default VideoCall;
