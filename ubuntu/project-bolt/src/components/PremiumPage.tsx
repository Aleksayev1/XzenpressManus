import React from 'react';
import { Crown, MessageCircle, FileText, Zap, Star, CheckCircle } from 'lucide-react';

interface PremiumPageProps {
  onPageChange: (page: string) => void;
}

export const PremiumPage: React.FC<PremiumPageProps> = ({ onPageChange }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 pt-16">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-600 via-orange-500 to-yellow-500 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
                <Crown className="w-16 h-16 text-yellow-200" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Desbloqueie Todo o Potencial
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-yellow-100">
              Acesso completo a consultas especializadas e pontos terapêuticos exclusivos
            </p>
            <div className="inline-flex items-center px-6 py-3 bg-white/20 rounded-full backdrop-blur-sm">
              <Crown className="w-5 h-5 mr-2 text-yellow-200" />
              <span className="font-semibold">Premium</span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* WhatsApp Consultation */}
          <div 
            onClick={() => onPageChange('whatsapp-consultation')}
            className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-green-200"
          >
            <div className="flex items-center mb-6">
              <div className="p-3 bg-green-100 rounded-xl group-hover:bg-green-200 transition-colors">
                <MessageCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold text-gray-900">Formulário Especializado</h3>
                <p className="text-green-600 font-medium">Consulta via WhatsApp</p>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              Formulário detalhado para casos complexos que precisam de atenção personalizada via WhatsApp
            </p>
            <div className="flex items-center text-green-600 font-medium group-hover:text-green-700">
              <span>Acessar formulário</span>
              <Zap className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Exclusive Points */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-amber-200">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-amber-100 rounded-xl">
                <Star className="w-8 h-8 text-amber-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold text-gray-900">Pontos Exclusivos</h3>
                <p className="text-amber-600 font-medium">Acesso Premium</p>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              Pontos de acupressão avançados e técnicas especializadas para casos específicos
            </p>
            <div className="flex items-center text-amber-600 font-medium">
              <span>Em breve</span>
              <Star className="w-4 h-4 ml-2" />
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Benefícios Premium
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="p-3 bg-green-100 rounded-xl w-fit mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Atendimento Especializado</h3>
              <p className="text-gray-600 text-sm">Profissional qualificado com 15+ anos de experiência</p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-blue-100 rounded-xl w-fit mx-auto mb-4">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Resposta Rápida</h3>
              <p className="text-gray-600 text-sm">Prioridade de resposta máxima</p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-purple-100 rounded-xl w-fit mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">WhatsApp Direto</h3>
              <p className="text-gray-600 text-sm">Atendimento personalizado via mensagem</p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-amber-100 rounded-xl w-fit mx-auto mb-4">
                <Star className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Conteúdo Exclusivo</h3>
              <p className="text-gray-600 text-sm">Acesso a técnicas e pontos avançados</p>
            </div>
          </div>
        </div>

        {/* Testimonial */}
        <div className="mt-16 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
              ))}
            </div>
            <blockquote className="text-xl text-gray-700 mb-4 italic">
              "Atendimento excepcional! Resolveu minha dor crônica em poucas sessões."
            </blockquote>
            <cite className="text-gray-600 font-medium">Maria S., São Paulo</cite>
          </div>
        </div>
      </div>
    </div>
  );
};