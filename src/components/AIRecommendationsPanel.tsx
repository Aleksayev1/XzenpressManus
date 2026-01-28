import React, { useState, useRef, useEffect } from 'react';
import { X, Brain, Send, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { acupressurePoints } from '../data/acupressurePoints';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIRecommendationsPanelProps {
  isVisible: boolean;
  onClose: () => void;
}

export const AIRecommendationsPanel: React.FC<AIRecommendationsPanelProps> = ({
  isVisible,
  onClose
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingQueries, setRemainingQueries] = useState<number | null>(null);
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Função para encontrar imagem do ponto
  const findPointImage = (pointName: string) => {
    const normalized = pointName.toLowerCase().replace(/[\s-]/g, '');
    const point = acupressurePoints.find((p: any) => {
      const pName = p.name.toLowerCase().replace(/[\s-]/g, '');
      const pId = p.id.toLowerCase().replace(/[\s-]/g, '');
      return pName.includes(normalized) || pId.includes(normalized) || (p.nameEn && p.nameEn.toLowerCase().includes(normalized));
    });
    return point?.image || null;
  };

  const renderMessageContent = (content: string) => {
    const pointRegex = /\b((?:IG|LI|VB|GB|VC|Ren|CV|Du|GV|P|LU|C|HT|HE|TA|SJ|TB|CS|PC|F|LR|LV|R|KI|BP|SP|E|ST|ID|SI|B|BL|YNSA)\s?-?\s?\d{1,2}[a-zA-Z]?|YNSA\s+[a-zA-Z]+)\b/gi;
    const parts = content.split(pointRegex);
    return parts.map((part, i) => {
      if (part.match(pointRegex)) {
        const imageUrl = findPointImage(part);
        if (imageUrl) {
          return (
            <button
              key={i}
              onClick={() => setPreviewImage({ url: imageUrl, title: part })}
              className="inline-flex items-center space-x-1 mx-1 px-1.5 py-0.5 bg-blue-100/50 hover:bg-blue-200 text-blue-700 rounded text-xs font-semibold transition-colors align-middle border border-blue-200/50"
              title="Ver imagem do ponto"
            >
              <span>{part}</span>
              <span className="text-[10px]">📸</span>
            </button>
          );
        }
      }
      return part;
    });
  };

  // Auto-scroll para última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mensagem inicial de boas-vindas
  useEffect(() => {
    if (isVisible && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: `Olá! Sou o **Self Oracle**, seu Assistente de Evolução Humana.
        
Minha missão é decifrar a biologia e a alma através de uma **Análise Multi-Dimensional**:
• **Científica:** Psiconeuroimunologia e biologia do estresse.
• **Metafísica:** Causalidade e padrões de consciência.
• **Integrativa:** Sinergia MTC e Valcapelli & Gasparetto.
• **Filosófica:** Maêutica evolutiva.
• **Espiritual:** Reforma Íntima (inspirado em Mauro Kwitiko).

⚠️ **Importante:** Sou uma ferramenta de autoconhecimento. Para diagnósticos médicos, consulte um profissional.`,
        timestamp: new Date()
      }]);
    }
  }, [isVisible]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      // Simulação para Localhost (Evita erro 404 da Netlify Function)
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        await new Promise(resolve => setTimeout(resolve, 1500)); // Delay artificial

        const mockResponses = [
          "No contexto da Medicina Tradicional Chinesa, esse ponto ajuda a equilibrar o Qi.",
          "Para essa condição, o ponto Yintang é frequentemente recomendado para acalmar a mente.",
          "A respiração 4-7-8 pode ser uma excelente prática complementar.",
          "Lembre-se que na MTC, observamos o corpo como um todo integrado."
        ];
        const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];

        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `[MODO SIMULAÇÃO LOCAL]\n\n${randomResponse}\n\n(A IA real funcionará após o deploy)`,
          timestamp: new Date()
        }]);
        setIsLoading(false);
        return;
      }

      // Preparar histórico de conversa para a API (formato OpenAI)
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch('/.netlify/functions/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: input.trim(),
          conversationHistory,
          userEmail: user?.email || null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar mensagem');
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.reply,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Atualizar contador de queries restantes
      if (data.remaining !== null && data.remaining !== undefined) {
        setRemainingQueries(data.remaining);
      }

    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.message || 'Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewConversation = () => {
    setMessages([{
      role: 'assistant',
      content: `Conversa reiniciada! Como posso ajudá-lo?`,
      timestamp: new Date()
    }]);
    setError(null);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* Modal de Preview de Imagem (Smart Link) */}
      {previewImage && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setPreviewImage(null)}>
          <div className="bg-white rounded-xl overflow-hidden max-w-sm w-full shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="p-3 bg-gray-100 flex justify-between items-center border-b">
              <h3 className="font-bold text-gray-800">{previewImage.title}</h3>
              <button onClick={() => setPreviewImage(null)} className="p-1 hover:bg-gray-200 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-1 bg-white">
              <img src={previewImage.url} alt={previewImage.title} className="w-full h-auto object-contain rounded-lg" />
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl max-w-3xl w-full h-[85vh] flex flex-col shadow-2xl relative z-10">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-50 to-blue-50 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Assistente IA YNSA/MTC</h2>
              <p className="text-sm text-gray-600">Especialista em Medicina Integrativa</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleNewConversation}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              title="Nova Conversa"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'bg-white text-gray-800 shadow-sm border border-gray-200'
                  }`}
              >
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {msg.role === 'assistant' ? renderMessageContent(msg.content) : msg.content}
                </div>
                <div
                  className={`text-xs mt-2 ${msg.role === 'user' ? 'text-blue-100' : 'text-gray-400'
                    }`}
                >
                  {msg.timestamp.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-200">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />
                  <span className="text-sm text-gray-600">Pensando...</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex justify-center">
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-start space-x-2 max-w-md">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-800 font-medium">Erro</p>
                  <p className="text-xs text-red-600 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
          {/* Warning Banner */}
          <div className="mb-3 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-800">
              <strong>Aviso:</strong> Este assistente fornece orientações educacionais.
              Não substitui consulta médica profissional.
            </p>
          </div>

          {/* Rate Limit Info */}
          {remainingQueries !== null && remainingQueries < 10 && (
            <div className="mb-2 text-xs text-gray-500 text-center">
              {remainingQueries > 0
                ? `${remainingQueries} perguntas restantes nesta hora`
                : 'Limite de perguntas atingido. Aguarde 1 hora.'}
            </div>
          )}

          {/* Input Field */}
          <div className="flex items-end space-x-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua pergunta sobre YNSA ou MTC..."
              className="flex-1 resize-none border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all max-h-32 text-gray-800 placeholder-gray-400"
              rows={2}
              disabled={isLoading || remainingQueries === 0}
            />
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading || remainingQueries === 0}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-2 text-center">
            Pressione Enter para enviar • Shift+Enter para nova linha
          </p>
        </div>
      </div>
    </div>
  );
};