"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation"; // Changed from next/router to next/navigation

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

// Added proper type definitions
interface Message {
  type: string;
  transcriptType?: string;
  role: string;
  transcript?: string;
}

interface AgentProps {
  userName: string;
  userId: string;
  type: string;
}

interface SavedMessage {
  role: "User" | "system" | "assistant";
  content: string;
}

const Agent = ({ userName, userId, type }: AgentProps) => {
  const router = useRouter();
  const [IsSpeaking, setIsSpeaking] = useState(false);  
  const [callStatus, setcallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const isSpeaking = true;

  useEffect(() => {
    // Only run client-side
    if (typeof window === 'undefined') return;
    
    // Import vapi dynamically to ensure it only loads on the client
    import("@/lib/vapi.sdk").then(({ vapi }) => {
      const onCallStart = () => setcallStatus(CallStatus.ACTIVE);
      const onCallEnd = () => setcallStatus(CallStatus.FINISHED);
      const onMessage = (message: Message) => {
        if (message.type === "transcript" && message.transcriptType === "final") {
          const newMessage: SavedMessage = { 
            role: message.role as "User" | "system" | "assistant",
            content: message.transcript || ""
          };
          setMessages((prev) => [...prev, newMessage]);
        }
      };
      const onSpeechStart = () => setIsSpeaking(true);
      const onSpeechEnd = () => setIsSpeaking(false);
      const onError = (error: Error) => console.log("Error");
      
      vapi.on("call-start", onCallStart);
      vapi.on("call-end", onCallEnd);
      vapi.on("message", onMessage);
      vapi.on("speech-start", onSpeechStart);
      vapi.on("speech-end", onSpeechEnd);
      vapi.on("error", onError);

      return () => {
        vapi.off("call-start", onCallStart);
        vapi.off("call-end", onCallEnd);
        vapi.off("message", onMessage);
        vapi.off("speech-start", onSpeechStart);
        vapi.off("speech-end", onSpeechEnd);
        vapi.off("error", onError);
      };
    });
  }, []);

  useEffect(() => {
    if(callStatus === CallStatus.FINISHED) router.push('/');
  }, [messages, callStatus, type, userId, router]);

  const handleCall = async() => { 
    setcallStatus(CallStatus.CONNECTING);
    // Import vapi dynamically to ensure it only loads on the client
    const { vapi } = await import("@/lib/vapi.sdk");
    await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
      variableValues : {
        userName : userName,
        userId: userId,
      }
    });
  };

  const handleDisconnect = async() => { 
    setcallStatus(CallStatus.FINISHED);
    // Import vapi dynamically to ensure it only loads on the client
    const { vapi } = await import("@/lib/vapi.sdk");
    vapi.stop();
  };
  
  const latestMessage = messages[messages.length-1]?.content;
  const isCallInactiveOrFinished = callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;

  return (
    <>
      <div className="call-view">
        <div className="card-interview">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="vapi"
              width={65}
              height={54}
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>Ai Interviewer</h3>
        </div>
        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user-avatar.png"
              alt="user"
              width={540}
              height={540}
              className=" object-cover size-[120px]"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>
      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p
              key={latestMessage}
              className={cn(
                "transition-opacity duration-500 opacity-0",
                "animate-fadeIn opacity-100"
              )}
            >
              {latestMessage}
            </p>
          </div>
        </div>
      )}
      <div className="w-full flex justify-center">
        {callStatus !== "ACTIVE" ? (
          <button className="realtive btn-call" onClick={handleCall}>
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                (callStatus !== "CONNECTING") && "hidden"
              )}
            />
            <span>
              {isCallInactiveOrFinished? "Call" : ". . ."}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={handleDisconnect}>End</button>
        )}
      </div>
    </>
  );
};

export default Agent;