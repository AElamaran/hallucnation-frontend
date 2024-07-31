import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import './ChatInterface.css';

const ChatInterface = () => {
  const [inputText, setInputText] = useState('');
  const [hallucinationNotHandledChat, setHallucinationNotHandledChat] = useState([]);
  const [hallucinationHandledChat, setHallucinationHandledChat] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage = { type: 'user', content: inputText };
    setHallucinationNotHandledChat(prev => [...prev, newMessage]);
    setHallucinationHandledChat(prev => [...prev, newMessage]);

    try {
      // OOS Not Handled API call
      const hallucinationNotHandledResponse = await axios.post('http://127.0.0.1:5000/foundation_response', { query_text: inputText });
      const hallucinationNotHandledMessage = { type: 'bot', content: hallucinationNotHandledResponse.data.response.response };
      setHallucinationNotHandledChat(prev => [...prev, hallucinationNotHandledMessage]);

      // Only after receiving the response from the first API, send request to the second API
      const hallucinationHandledResponse = await axios.post('http://127.0.0.1:5000/rag_response', { query_text: inputText });

let handledContent;
if (hallucinationHandledResponse.data.response.final_response && hallucinationHandledResponse.data.response.response_type) {
  handledContent = `${hallucinationHandledResponse.data.response.final_response}: ${hallucinationHandledResponse.data.response.response_type}`;
} else if (hallucinationHandledResponse.data.response.response && hallucinationHandledResponse.data.response.response_type) {
  handledContent = `${hallucinationHandledResponse.data.response.response}: ${hallucinationHandledResponse.data.response.response_type}`;
} else {
  handledContent = "No valid response received.";
}

const hallucinationHandledMessage = { type: 'bot', content: handledContent };
setHallucinationHandledChat(prev => [...prev, hallucinationHandledMessage]);

    } catch (error) {
      console.error('Error fetching response:', error);
      // You might want to add error messages to the chat windows here
    }

    setInputText('');
  };

  const renderChatWindow = (title, chatMessages) => (
    <div className="chat-window">
      <h2 className="chat-title">{title}</h2>
      <div className="chat-messages">
        {chatMessages.map((msg, index) => (
          <div key={index} className={`message ${msg.type}`}>
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="chat-container">
      <div className="chat-windows">
        {renderChatWindow("Hallucination Not Handled Chat", hallucinationNotHandledChat)}
        {renderChatWindow("Hallucination Handled Chat", hallucinationHandledChat)}
      </div>
      <div className="input-container">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type here"
        />
        <button onClick={handleSubmit}>Send</button>
      </div>
    </div>
  );
};

export default ChatInterface;
