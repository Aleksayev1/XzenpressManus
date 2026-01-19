import React from 'react';
import { ArrowLeft, FileText, Shield, AlertCircle } from 'lucide-react';

interface TermsOfServicePageProps {
    onPageChange: (page: string) => void;
}

export const TermsOfServicePage: React.FC<TermsOfServicePageProps> = ({ onPageChange }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-16">
            {/* Back Button */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                <button
                    onClick={() => onPageChange('home')}
                    className="mb-4 flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors group"
                >
                    <div className="p-2 bg-white rounded-full shadow-md group-hover:shadow-lg transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                    <span className="font-medium">Voltar ao Início</span>
                </button>
            </div>

            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center mb-6">
                        <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
                            <FileText className="w-12 h-12" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-center mb-4">Termos de Serviço</h1>
                    <p className="text-blue-100 text-center text-lg">
                        Última atualização: 19 de janeiro de 2026
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">

                    {/* Important Notice */}
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
                        <div className="flex items-start">
                            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-yellow-800">Aviso Importante</h3>
                                <p className="mt-2 text-sm text-yellow-700">
                                    O XZenPress NÃO substitui consulta médica, diagnóstico ou tratamento profissional.
                                    Sempre consulte um profissional de saúde qualificado para condições médicas.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="prose prose-lg max-w-none">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Aceitação dos Termos</h2>
                        <p className="text-gray-700 mb-6">
                            Ao acessar e usar o XZenPress, você concorda em cumprir e estar vinculado a estes Termos de Serviço.
                            Se você não concordar com qualquer parte destes termos, não deve usar nossos serviços.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Descrição do Serviço</h2>
                        <p className="text-gray-700 mb-4">
                            O XZenPress é uma plataforma de bem-estar digital que oferece:
                        </p>
                        <ul className="list-disc pl-6 mb-6 text-gray-700">
                            <li>Orientações sobre pontos de acupressão baseados em YNSA (Yamamoto New Scalp Acupuncture)</li>
                            <li>Técnicas de respiração terapêutica</li>
                            <li>Sons e frequências para bem-estar</li>
                            <li>Conteúdo educacional sobre saúde integrativa</li>
                            <li>Recursos Premium mediante assinatura paga</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Contas de Usuário</h2>
                        <p className="text-gray-700 mb-4">
                            <strong>3.1 Registro:</strong> Você pode criar uma conta usando email, Google ou outros métodos de autenticação oferecidos.
                        </p>
                        <p className="text-gray-700 mb-4">
                            <strong>3.2 Responsabilidade:</strong> Você é responsável por manter a confidencialidade de suas credenciais de acesso.
                        </p>
                        <p className="text-gray-700 mb-6">
                            <strong>3.3 Uso Permitido:</strong> Você deve ter pelo menos 18 anos ou ter consentimento dos pais/responsáveis para usar nossos serviços.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Assinaturas e Pagamentos</h2>
                        <p className="text-gray-700 mb-4">
                            <strong>4.1 Planos Disponíveis:</strong>
                        </p>
                        <ul className="list-disc pl-6 mb-4 text-gray-700">
                            <li><strong>Gratuito:</strong> Acesso a recursos básicos</li>
                            <li><strong>Premium Mensal:</strong> Renovação automática mensal</li>
                            <li><strong>Premium Anual:</strong> Renovação automática anual com desconto</li>
                            <li><strong>Premium Lifetime:</strong> Acesso vitalício sem renovação</li>
                        </ul>
                        <p className="text-gray-700 mb-4">
                            <strong>4.2 Processamento de Pagamentos:</strong> Todos os pagamentos são processados de forma segura através do Stripe.
                        </p>
                        <p className="text-gray-700 mb-4">
                            <strong>4.3 Renovação Automática:</strong> Assinaturas mensais e anuais são renovadas automaticamente, a menos que canceladas antes do término do período atual.
                        </p>
                        <p className="text-gray-700 mb-6">
                            <strong>4.4 Cancelamento:</strong> Você pode cancelar sua assinatura a qualquer momento através das configurações da sua conta. O acesso Premium continuará até o final do período pago.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Política de Reembolso</h2>
                        <p className="text-gray-700 mb-6">
                            Consulte nossa <button onClick={() => onPageChange('refund-policy')} className="text-blue-600 hover:underline font-medium">Política de Reembolso</button> completa para detalhes sobre garantia de satisfação e processo de reembolso.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Propriedade Intelectual</h2>
                        <p className="text-gray-700 mb-4">
                            Todo o conteúdo do XZenPress, incluindo mas não limitado a textos, gráficos, imagens, sons e software, é propriedade do XZenPress ou de seus licenciadores e é protegido por leis de direitos autorais.
                        </p>
                        <p className="text-gray-700 mb-6">
                            Você não pode reproduzir, distribuir ou criar trabalhos derivados sem permissão expressa por escrito.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Isenção de Responsabilidade Médica</h2>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                            <p className="text-red-900 font-semibold mb-2">
                                ⚠️ IMPORTANTE: Isenção de Responsabilidade Médica
                            </p>
                            <p className="text-red-800 mb-2">
                                O XZenPress fornece informações educacionais sobre bem-estar e técnicas complementares.
                                NENHUM conteúdo nesta plataforma constitui aconselhamento médico profissional.
                            </p>
                            <p className="text-red-800">
                                Sempre consulte um médico ou profissional de saúde qualificado antes de iniciar qualquer programa de saúde,
                                tratamento ou mudança em sua rotina de bem-estar, especialmente se você tiver condições médicas pré-existentes.
                            </p>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Limitação de Responsabilidade</h2>
                        <p className="text-gray-700 mb-6">
                            O XZenPress não será responsável por quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos
                            resultantes do uso ou incapacidade de usar nossos serviços.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Privacidade</h2>
                        <p className="text-gray-700 mb-6">
                            O uso de nossos serviços também é regido por nossa <button onClick={() => onPageChange('privacy-policy')} className="text-blue-600 hover:underline font-medium">Política de Privacidade</button>,
                            que descreve como coletamos, usamos e protegemos suas informações pessoais.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Modificações dos Termos</h2>
                        <p className="text-gray-700 mb-6">
                            Reservamo-nos o direito de modificar estes termos a qualquer momento. Notificaremos os usuários sobre alterações significativas
                            através de email ou aviso na plataforma. O uso continuado após as alterações constitui aceitação dos novos termos.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Lei Aplicável</h2>
                        <p className="text-gray-700 mb-6">
                            Estes termos são regidos pelas leis do Brasil. Qualquer disputa será resolvida nos tribunais competentes do Brasil.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contato</h2>
                        <p className="text-gray-700">
                            Para questões sobre estes Termos de Serviço, entre em contato conosco em:{' '}
                            <a href="mailto:contato@xzenpress.com" className="text-blue-600 hover:underline">contato@xzenpress.com</a>
                        </p>
                    </div>

                    {/* Footer Notice */}
                    <div className="mt-12 pt-8 border-t border-gray-200">
                        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                            <Shield className="w-5 h-5 text-blue-600" />
                            <span>Seus direitos estão protegidos pela legislação brasileira de defesa do consumidor (CDC)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
