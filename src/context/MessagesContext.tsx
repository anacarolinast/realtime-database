import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../service/supabaseClient';

interface Message {
  id: number;
  username: string;
  content: string;
  created_at: string;
}

interface MessagesContextType {
  messages: Message[];
  addMessage: (message: Message) => void;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export const MessagesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  
  const addMessage = async (message: Message) => {
    setMessages((prevMessages) => [...prevMessages, message]);

    const { error } = await supabase.from('messages').insert([message]);

    if (error) {
      console.error('Erro ao inserir a mensagem:', error);
    }
  };

  const handleInserts = (payload: { new: Message }) => {
    setMessages((prevMessages) => {
      if (prevMessages.find(msg => msg.id === payload.new.id)) return prevMessages;
      return [...prevMessages, payload.new];
    });
  };

  useEffect(() => {
    const messageListener = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, handleInserts)
      .subscribe();

    console.log('Escutando no canal "public:messages"');

    return () => {
      messageListener.unsubscribe();
      console.log('Desinscrevendo do canal');
    };
  }, []);

  return (
    <MessagesContext.Provider value={{ messages, addMessage }}>
      {children}
    </MessagesContext.Provider>
  );
};

export const useMessages = (): MessagesContextType => {
  const context = useContext(MessagesContext);
  if (!context) {
    throw new Error('useMessages must be used within a MessagesProvider');
  }
  return context;
};
