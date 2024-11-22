import React, { useState, useEffect, CSSProperties } from "react";
import { useMessages } from "./context/MessagesContext";
import { supabase } from "./service/supabaseClient"; 

type Message = {
  id: number;
  username: string;
  content: string;
  created_at: string;
};

const App: React.FC = () => {
  const { messages, addMessage } = useMessages();  
  const [newMessage, setNewMessage] = useState<string>("");  
  const [username, setUsername] = useState<string>("");  
  const [isUsernameSet, setIsUsernameSet] = useState<boolean>(false);
  const [messagesLoaded, setMessagesLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (isUsernameSet) {
      fetchMessages(); 
    }
  }, [isUsernameSet]);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Erro ao buscar mensagens:", error.message);
    } else {
      data?.forEach((message: Message) => addMessage(message));
    }
  };

  useEffect(() => {
    if (!messagesLoaded) {
      fetchMessages();
      setMessagesLoaded(true); 
    }
  }, [messagesLoaded]);
  

  const sendMessage = async () => {
    if (newMessage.trim().length === 0) {
      return;
    }

    const newMsg: Message = {
      id: Date.now(),
      username,
      content: newMessage,
      created_at: new Date().toISOString(),
    };

    addMessage(newMsg);
    setNewMessage(""); 
  };

  const setUserName = () => {
    if (username.trim().length === 0) {
      alert("Por favor, insira um nome de usuário.");
      return;
    }
    setIsUsernameSet(true); 
  };

  return (
    <div style={styles.container}>
      {!isUsernameSet ? (
        <div style={styles.usernameForm}>
          <h1 style={styles.title}>Escolha seu nome de usuário</h1>
          <div style={styles.inputButtonContainer}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Digite seu nome de usuário"
              style={styles.input}
            />
            <button onClick={setUserName} style={styles.button}>
              Entrar
            </button>
          </div>
        </div>
      ) : (
        <div style={styles.chatContainer}>
          <h1 style={styles.title}>Chat em Tempo Real</h1>

          <div style={styles.usernameDisplay}>
            <strong>Username:</strong> {username}
          </div>

          <div style={styles.messageBox}>
            {messages.map((message) => (
              <div key={message.id} style={styles.message}>
                <strong>{message.username}:</strong> {message.content}
              </div>
            ))}
          </div>

          <div style={styles.messageInputContainer}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              style={styles.input}
            />
            <button onClick={sendMessage} style={styles.button}>
              Enviar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: CSSProperties } = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px",
    backgroundColor: "#f1f1f1",
    minHeight: "100vh",
  },
  usernameForm: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    marginBottom: "10px",
    fontSize: "24px",
    color: "#333",
  },
  inputButtonContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  input: {
    padding: "10px",
    width: "300px",
    margin: "10px 0",
    border: "1px solid #ddd",
    borderRadius: "5px",
    fontSize: "16px",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#4CAF50",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  chatContainer: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    width: "100%",
    maxWidth: "600px",
  },
  usernameDisplay: {
    marginBottom: "10px",
    fontSize: "18px",
    color: "#333",
  },
  messageBox: {
    maxHeight: "400px",
    marginBottom: "10px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    padding: "10px",
    backgroundColor: "#f9f9f9",
    fontSize: "16px",
    overflowY: "auto",
  },
  message: {
    marginBottom: "10px",
  },
  messageInputContainer: {
    display: "flex",
    gap: "10px",
    justifyContent: "space-between",
    alignItems: "center",
  },
};

export default App;
