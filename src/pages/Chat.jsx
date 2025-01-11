import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function Chat() {
    const [messages, setMessages] = useState(() => {
        // localStorage에서 저장된 메시지를 불러옴
        const savedMessages = localStorage.getItem('messages');
        return savedMessages ? JSON.parse(savedMessages) : [];
    });
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        // 메시지 목록 변경 시 localStorage에 저장
        localStorage.setItem('messages', JSON.stringify(messages));
    }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const userMessage = {
            id: `msg${messages.length + 1}`,
            content: newMessage,
            createdAt: new Date().toISOString(),
            isMyMessage: true,
        };

        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setNewMessage('');
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:8070/api/v1/chat/rooms/ai', {
                content: userMessage.content,
            });

            const gptResponse = {
                id: `msg${messages.length + 2}`,
                content: response.data.response,
                createdAt: new Date().toISOString(),
                isMyMessage: false,
            };

            setMessages((prevMessages) => [...prevMessages, gptResponse]);
        } catch (error) {
            console.error('Error communicating with GPT:', error);
            const errorMessage = {
                id: `msg${messages.length + 2}`,
                content: 'GPT와의 통신에 실패했습니다. 다시 시도해주세요.',
                createdAt: new Date().toISOString(),
                isMyMessage: false,
            };

            setMessages((prevMessages) => [...prevMessages, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-indigo-600 text-white p-4">
                    <h1 className="text-xl font-bold">AI와의 대화</h1>
                </div>
                <div className="h-[600px] overflow-y-auto p-4 bg-gray-50">
                    <div className="space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${
                                    message.isMyMessage ? 'justify-end' : 'justify-start'
                                } items-end space-x-2`}
                            >
                                <div
                                    className={`max-w-[70%] ${
                                        message.isMyMessage
                                            ? 'bg-indigo-500 text-white rounded-l-lg rounded-tr-lg'
                                            : 'bg-white text-gray-800 rounded-r-lg rounded-tl-lg'
                                    } p-3 shadow-md`}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                    <p className="text-xs text-right mt-1 opacity-75">
                                        {new Date(message.createdAt).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="p-4 bg-white border-t">
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="메시지를 입력하세요..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            className="px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            disabled={loading}
                        >
                            {loading ? '응답 대기 중...' : '전송'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Chat;
