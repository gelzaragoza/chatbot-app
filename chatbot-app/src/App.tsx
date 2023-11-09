import { useState, useEffect } from "react";
import "./App.css";


type MessageModel = {
  message: string;
  sender: string;
  direction: "incoming" | "outgoing";
  position: "single" | "top" | "bottom" | "middle";
};

const OPENAI_API_KEY = "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";

function App() {
  const [isChatbotTyping, setIsChatbotTyping] = useState(false);
  const [chatMessages, setChatMessages] = useState<MessageModel[]>([
    {
      message: "Hello, I am ChatGPT! How can I assist you today?",
      sender: "ChatGPT",
      direction: "incoming",
      position: "single",
    },
  ]);

  useEffect(() => {
    // Simulate typing indicator
    const typingTimeout = setTimeout(() => {
      setIsChatbotTyping(false);
    }, 1500);

    return () => {
      clearTimeout(typingTimeout);
    };
  }, [isChatbotTyping]);

  const handleUserMessage = async (userMessage: string) => {
    const newUserMessage: MessageModel = {
      message: userMessage,
      sender: "user",
      direction: "outgoing",
      position: "single",
    };

    const updatedChatMessages = [...chatMessages, newUserMessage];
    setChatMessages(updatedChatMessages);

    setIsChatbotTyping(true);

    await processUserMessageToChatGPT(updatedChatMessages);
  };

  async function processUserMessageToChatGPT(messages: MessageModel[]) {
    let apiMessages = messages.map((messageObject: MessageModel) => {
      let role = "";
      if (messageObject.sender === "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message };
    });

    const systemMessage = {
      role: "system",
      content: "Explain all concepts in layman's terms",
    };

    const apiRequestBody = {
      model: "gpt-3.5-turbo",
      messages: [systemMessage, ...apiMessages],
    };

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + OPENAI_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiRequestBody),
      });

      if (response.ok) {
        const data = await response.json();

        setChatMessages([
          ...messages,
          {
            message: data.choices[0].message.content,
            sender: "ChatGPT",
            direction: "incoming",
            position: "single",
          },
        ]);

        setIsChatbotTyping(false);
      } else {
        console.error("Error in the API request");
      }
    } catch (error) {
      console.error("Error processing the request:", error);
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full sm:w-2/3 md:w-1/2 lg:w-1/3 p-4 border border-gray-200 bg-white rounded-lg shadow-lg">
        <div className="chat-container h-96 overflow-y-auto flex flex-col space-y-4">
          {chatMessages.map((message, i) => (
           <div
           key={i}
           className={`p-2 rounded-md max-w-md ${
             message.sender === "ChatGPT"
               ? "bg-blue-600 text-white self-start text-left" 
               : "bg-blue-200 text-black self-end"
           }`}
         >
           {message.message}
         </div>
          ))}
          {isChatbotTyping && (
            <div className="p-2 max-w-md self-start">
              <div className="flex items-center">
                <div className="bg-blue-600 text-white rounded-full p-2 mr-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
                </div>
                ChatGPT is thinking...
              </div>
            </div>
          )}
        </div>
        <input
          type="text"
          placeholder="Type your message..."
          className="border p-2 rounded-md w-full mt-2" 
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              handleUserMessage((e.target as HTMLInputElement).value);
              (e.target as HTMLInputElement).value = "";
            }
          }}
        />
      </div>
    </div>
  );
}

export default App;
