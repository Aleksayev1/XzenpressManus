import React from 'react';
import { ArrowLeft, Shield, Eye, Lock, Database, Globe } from 'lucide-react';

interface PrivacyPolicyPageProps {
    onPageChange: (page: string) => void;
}

export const

    PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onPageChange }) => {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-16">
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

                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-center mb-6">
                            <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
                                <Shield className="w-12 h-12" />
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold text-center mb-4">Política de Privacidade</h1>
                        <p className="text-blue-100 text-center text-lg">
                            LGPD & GDPR Compliant - Seus dados estão seguros
                        </p>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">

                        <div className="grid md:grid-cols-3 gap-6 mb-8">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <Lock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                                <h3 className="font-bold text-gray-900">Criptografado</h3>
                                <p className="text-sm text-gray-600">SSL/TLS</p>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <Database className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                <h3 className="font-bold text-gray-900">Seguro</h3>
                                <p className="text-sm text-gray-600">Supabase</p>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <Globe className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                                <h3 className="font-bold text-gray-900">Conforme</h3>
                                <p className="text-sm text-gray-600">LGPD/GDPR</p>
                            </div>
                        </div>

                        <div className="prose prose-lg max-w-none">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Quais dados coletamos</h2>
                            <ul className="list-disc pl-6 mb-6 text-gray-700">
                                <li><strong>Conta:</strong> Email, nome, método de autenticação</li>
                                <li><strong>Uso:</strong> Sessões de respiração, pontos acessados, preferências</li>
                                <li><strong>Pagamento:</strong> Histórico de transações (dados de cartão NÃO armazenados - processados pelo Stripe)</li>
                                <li><strong>Técnicos:</strong> IP, navegador, dispositivo (para segurança e análise)</li>
                            </ul>

                            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Como usamos seus dados</h2>
                            <ul className="list-disc pl-6 mb-6 text-gray-700">
                                <li>Fornecer e melhorar nossos serviços</li>
                                <li>Processar pagamentos e gerenciar assinaturas</li>
                                <li>Enviar atualizações importantes (não spam)</li>
                                <li>Personalizar sua experiência</li>
                                <li>Detectar fraudes e garantir segurança</li>
                            </ul>

                            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Seus Direitos (LGPD/GDPR)</h2>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                                <p className="font-bold text-blue-900 mb-3">Você tem direito a:</p>
                                <ul className="space-y-2 text-blue-800">
                                    <li>✓ <strong>Acessar</strong> seus dados</li>
                                    <li>✓ <strong>Exportar</strong> todos os seus dados</li>
                                    <li>✓ <strong>Corrigir</strong> informações incorretas</li>
                                    <li>✓ <strong>Deletar</strong> sua conta e dados</li>
                                    <li>✓ <strong>Revogar</strong> consentimento a qualquer momento</li>
                                </ul>
                                <p className="mt-4 text-sm text-blue-700">
                                    Para exercer seus direitos: <a href="mailto:contato@xzenpress.com" className="font-bold hover:underline">contato@xzenpress.com</a>
                                </p>
                            </div>

                            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Compartilhamento de Dados</h2>
                            <p className="text-gray-700 mb-4">
                                <strong>Nunca vendemos seus dados.</strong> Compartilhamos apenas com:
                            </p>
                            <ul className="list-disc pl-6 mb-6 text-gray-700">
                                <li><strong>Stripe:</strong> Para processar pagamentos (PCI-DSS Level 1)</li>
                                <li><strong>Supabase:</strong> Para armazenamento seguro de dados</li>
                                <li><strong>Netlify:</strong> Para hospedagem e entrega de conteúdo</li>
                            </ul>

                            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Segurança</h2>
                            <p className="text-gray-700 mb-6">
                                Utilizamos criptografia SSL/TLS, autenticação segura, backups regulares e monitoramento constante
                                para proteger seus dados contra acesso não autorizado.
                            </p>

                            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cookies</h2>
                            <p className="text-gray-700 mb-6">
                                Usamos cookies essenciais para autenticação e funcionamento do site.
                                Você pode desabilitar cookies no seu navegador, mas isso pode afetar funcionalidades.
                            </p>

                            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Contato</h2>
                            <p className="text-gray-700">
                                Dúvidas sobre privacidade? Email: <a href="mailto:contato@xzenpress.com" className="text-blue-600 hover:underline font-bold">contato@xzenpress.com</a>
                            </p>
                        </div>

                        <div className="mt-12 pt-8 border-t border-gray-200">
                            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                                <Eye className="w-5 h-5 text-blue-600" />
                                <span>Transparência total. Seus dados, suas regras.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };
