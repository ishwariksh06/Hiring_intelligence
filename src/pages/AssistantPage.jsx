import { useState } from 'react';
import { queryAssistant } from '../api/assistantApi';
import ChatWindow from '../components/chat/ChatWindow';

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  text: 'Hi! Ask me things like "Find candidates with Java and AWS" or "Show candidates with 3+ years experience".',
};

export default function AssistantPage() {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [loading, setLoading] = useState(false);

  async function handleSend(text) {
    const userMessage = { id: `u-${Date.now()}`, role: 'user', text };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    const result = await queryAssistant(text);

    const assistantMessage = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      text: result.answerText,
      candidates: result.candidates,
    };
    setMessages((prev) => [...prev, assistantMessage]);
    setLoading(false);
  }

  return <ChatWindow messages={messages} onSend={handleSend} loading={loading} />;
}
