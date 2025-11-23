import React, { useState } from 'react';
import { ArrowLeft, MessageCircle, Clock, CheckCircle, Star, AlertTriangle, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface WhatsAppConsultationPageProps {
  onPageChange: (page: string) => void;
}

interface FormData {
  nome: string;
  email: string;
  whatsapp: string;
  urgencia: string;
  condicaoPrincipal: string;
  tempoSintomas: string;
  descricaoSintomas: string;
  tratamentosRealizados: string;
  medicamentosAtuais: string;
  horarioPreferencia: string;
}

export const WhatsAppConsultationPage: React.FC<WhatsAppConsultationPageProps> = ({ onPageChange }) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  // Verificar se usuário pagou Premium
  if (!user?.hasPaidPremium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-full">
                <MessageCircle className="w-16 h-16 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Consulta WhatsApp Premium
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Este recurso está disponível apenas para usuários que fizeram o pagamento Premium
            </p>
            
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-8 border border-green-200">
              <h3 className="font-semibold text-green-800 mb-2">💬 O que você terá acesso:</h3>
              <ul className="text-sm text-green-700 space-y-1 text-left max-w-md mx-auto">
                <li>• Formulário detalhado para casos complexos</li>
                <li>• Atendimento personalizado via WhatsApp</li>
                <li>• Profissional com 15+ anos de experiência</li>
                <li>• Resposta prioritária em até 24h</li>
                <li>• Acompanhamento contínuo do caso</li>
              </ul>
            </div>
            
            <button
              onClick={() => onPageChange('premium')}
              className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-green-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              💳 Fazer Pagamento Premium
            </button>
            
            <p className="text-sm text-gray-500 mt-4">
              Acesso imediato após confirmação do pagamento
            </p>
          </div>
        </div>
      </div>
    );
  }

  const [formData, setFormData] = useState<FormData>({
    nome: user?.name || '',
    email: user?.email || '',
    whatsapp: '',
    urgencia: '',
    condicaoPrincipal: '',
    tempoSintomas: '',
    descricaoSintomas: '',
    tratamentosRealizados: '',
    medicamentosAtuais: '',
    horarioPreferencia: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Criar mensagem formatada para WhatsApp
    const message = `🏥 *CONSULTA ESPECIALIZADA - XZENPRESS*

👤 *DADOS PESSOAIS:*
• Nome: ${formData.nome}
• Email: ${formData.email}
• WhatsApp: ${formData.whatsapp}
• Urgência: ${formData.urgencia}

🩺 *INFORMAÇÕES MÉDICAS:*
• Condição Principal: ${formData.condicaoPrincipal}
• Tempo dos Sintomas: ${formData.tempoSintomas}

📝 *DESCRIÇÃO DETALHADA:*
${formData.descricaoSintomas}

💊 *TRATAMENTOS JÁ REALIZADOS:*
${formData.tratamentosRealizados}

💉 *MEDICAMENTOS ATUAIS:*
${formData.medicamentosAtuais}

⏰ *PREFERÊNCIA DE HORÁRIO:*
${formData.horarioPreferencia}

---
*Solicitação enviada via XZenPress Premium*`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/5511999999999?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => onPageChange('premium')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t('whatsapp.back')}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-2xl p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">{t('whatsapp.consultation.title')}</h2>
              <p className="text-gray-600 text-sm mb-6">
                {t('whatsapp.consultation.description')}
              </p>

              {/* Features */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 text-sm">{t('whatsapp.features.specialized.title')}</div>
                    <div className="text-xs text-gray-600">{t('whatsapp.features.specialized.subtitle')}</div>
                    <div className="text-xs text-blue-600">{t('whatsapp.features.specialized.professional')}</div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Clock className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 text-sm">{t('whatsapp.features.fast.title')}</div>
                    <div className="text-xs text-gray-600">{t('whatsapp.features.fast.subtitle')}</div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MessageCircle className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 text-sm">{t('whatsapp.features.direct.title')}</div>
                    <div className="text-xs text-gray-600">{t('whatsapp.features.direct.subtitle')}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* When to Seek Help */}
            <div className="bg-white rounded-3xl shadow-2xl p-6 mb-6">
              <h3 className="font-bold text-gray-800 mb-4">{t('whatsapp.when.title')}</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-gray-600">{t('whatsapp.when.chronic')}</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-gray-600">{t('whatsapp.when.neurological')}</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-gray-600">{t('whatsapp.when.nonresponsive')}</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-gray-600">{t('whatsapp.when.personalized')}</span>
                </div>
              </div>
            </div>

            {/* Testimonial */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200">
              <div className="flex items-center space-x-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-sm text-gray-700 mb-3 italic">
                "{t('whatsapp.testimonial.text')}"
              </p>
              <div className="text-xs text-gray-600">{t('whatsapp.testimonial.author')}</div>
            </div>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('whatsapp.form.title')}</h2>
              <p className="text-gray-600 mb-8">
                {t('whatsapp.form.subtitle')}
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Data */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('whatsapp.form.name')} *
                    </label>
                    <input
                      type="text"
                      name="nome"
                      value={formData.nome}
                      onChange={handleInputChange}
                      placeholder={t('whatsapp.form.name.placeholder')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('whatsapp.form.email')}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder={t('whatsapp.form.email.placeholder')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('whatsapp.form.whatsapp')} *
                    </label>
                    <input
                      type="tel"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleInputChange}
                      placeholder={t('whatsapp.form.whatsapp.placeholder')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('whatsapp.form.urgency')} *
                    </label>
                    <select
                      name="urgencia"
                      value={formData.urgencia}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    >
                      <option value="">{t('whatsapp.form.urgency.select')}</option>
                      <option value="baixa">{t('whatsapp.form.urgency.low')}</option>
                      <option value="media">{t('whatsapp.form.urgency.medium')}</option>
                      <option value="alta">{t('whatsapp.form.urgency.high')}</option>
                      <option value="urgente">{t('whatsapp.form.urgency.urgent')}</option>
                    </select>
                  </div>
                </div>

                {/* Medical Information */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                      <span className="text-blue-600 text-sm">🩺</span>
                    </div>
                    {t('whatsapp.form.medical.title')}
                  </h3>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('whatsapp.form.medical.condition')} *
                      </label>
                      <input
                        type="text"
                        name="condicaoPrincipal"
                        value={formData.condicaoPrincipal}
                        onChange={handleInputChange}
                        placeholder={t('whatsapp.form.medical.condition.placeholder')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="text-orange-600">{t('whatsapp.form.medical.duration')}</span>
                      </label>
                      <input
                        type="text"
                        name="tempoSintomas"
                        value={formData.tempoSintomas}
                        onChange={handleInputChange}
                        placeholder={t('whatsapp.form.medical.duration.placeholder')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('whatsapp.form.medical.symptoms')} *
                      </label>
                      <textarea
                        name="descricaoSintomas"
                        value={formData.descricaoSintomas}
                        onChange={handleInputChange}
                        placeholder={t('whatsapp.form.medical.symptoms.placeholder')}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('whatsapp.form.medical.treatments')}
                      </label>
                      <textarea
                        name="tratamentosRealizados"
                        value={formData.tratamentosRealizados}
                        onChange={handleInputChange}
                        placeholder={t('whatsapp.form.medical.treatments.placeholder')}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('whatsapp.form.medical.medications')}
                      </label>
                      <textarea
                        name="medicamentosAtuais"
                        value={formData.medicamentosAtuais}
                        onChange={handleInputChange}
                        placeholder={t('whatsapp.form.medical.medications.placeholder')}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('whatsapp.form.medical.schedule')}
                      </label>
                      <select
                        name="horarioPreferencia"
                        value={formData.horarioPreferencia}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="">{t('whatsapp.form.medical.schedule.select')}</option>
                        <option value="manha">{t('whatsapp.form.medical.schedule.morning')}</option>
                        <option value="tarde">{t('whatsapp.form.medical.schedule.afternoon')}</option>
                        <option value="noite">{t('whatsapp.form.medical.schedule.evening')}</option>
                        <option value="qualquer">{t('whatsapp.form.medical.schedule.anytime')}</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Important Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-blue-800 text-sm">{t('whatsapp.form.notice.title')}</div>
                    <div className="text-blue-700 text-sm">
                      {t('whatsapp.form.notice.text')}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center space-x-2"
                >
                  <Send className="w-5 h-5" />
                  <span>{t('whatsapp.form.submit')}</span>
                </button>

                <p className="text-center text-sm text-gray-500">
                  {t('whatsapp.form.redirect')}
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};