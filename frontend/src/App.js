import './App.css';
import { io } from 'socket.io-client';
import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

//const socket = io('http://localhost:3000');
const socket = io('/');

const AppWrapper = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;

const ChatBox = styled.div`
  width: 100%;
  max-width: 600px;
  background: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin: 20px 0;
`;

const MessageList = styled.ul`
  list-style: none;
  padding: 0;
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 20px;
`;

const MessageItem = styled.li`
  padding: 10px;
  margin-bottom: 10px;
  background: #e1ffc7;
  border-radius: 5px;
  text-align: left;
`;

const InputBox = styled.div`
  display: flex;
  align-items: center;
`;

const TextInput = styled.input`
  flex: 1;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ddd;
  margin-right: 10px;
`;

const SendButton = styled.button`
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background: #0056b3;
  }
`;

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [mensajes, setMensajes] = useState([]);
  const [usuario, setUsuario] = useState('');
  const mensajesEndRef = useRef(null);

  useEffect(() => {
    socket.on('connect', () => setIsConnected(true));
    socket.on('chat_message', (data) => {
      setMensajes((mensajes) => [...mensajes, data]);
    });

    return () => {
      socket.off('connect');
      socket.off('chat_message');
    };
  }, []);

  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const enviarMensaje = () => {
    if (nuevoMensaje.trim()) {
      socket.emit('chat_message', {
        usuario: usuario || 'Anonimo',
        mensaje: nuevoMensaje,
      });
      setNuevoMensaje('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      enviarMensaje();
    }
  };

  return (
    <AppWrapper>
      <h2>{isConnected ? 'CONECTADO' : 'NO CONECTADO'}</h2>
      <ChatBox>
        <MessageList>
          {mensajes.map((mensaje, index) => (
            <MessageItem key={index}>
              <strong>{mensaje.usuario}:</strong> {mensaje.mensaje}
            </MessageItem>
          ))}
          <div ref={mensajesEndRef} />
        </MessageList>
        <InputBox>
          <TextInput
            type="text"
            placeholder="Escribe tu mensaje..."
            value={nuevoMensaje}
            onChange={(e) => setNuevoMensaje(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <SendButton onClick={enviarMensaje}>Enviar</SendButton>
        </InputBox>
      </ChatBox>
    </AppWrapper>
  );
}

export default App;
