import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Brain, Sparkles, Heart, TrendingUp, Users, FileText, CheckCircle, Target, AlertCircle } from 'lucide-react';
import { enrollZSParticipant } from '../services/zsResearchService';

const HormonalResearchPage: React.FC = () => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        age: '',
        condition: '',
        severity: '',
        consent: false
    });
    const [submitted, setSubmitted] = useState(false);
    const [studyId, setStudyId] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await enrollZSParticipant({
                name: formData.name,
                email: formData.email,
                age: parseInt(formData.age),
                condition: formData.condition,
                severity: formData.severity,
                consent: formData.consent
            });

            if (result.success) {
                setStudyId(result.studyId || '');
                setSubmitted(true);
            } else {
                setError(result.error || 'Erro ao processar cadastro');
            }
        } catch (err) {
            console.error('Erro ao cadastrar:', err);
            setError('Erro inesperado. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-purple-900 via-indigo-900 to-black text-white pt-20 px-4">
                <div className="max-w-2xl mx-auto text-center py-20">
                    <CheckCircle className="w-20 h-20 mx-auto mb-6 text-green-400" />
                    <h1 className="text-4xl font-bold mb-4">🎉 Bem-vinda à História!</h1>
                    <p className="text-xl mb-6">
                        Você está oficialmente na lista de espera do Estudo Pioneiro XZenPress sobre o Ponto ZS.
                    </p>
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-6">
                        <h3 className="text-2xl font-bold mb-4">📧 Próximos Passos</h3>
                        <ul className="text-left space-y-3">
                            <li className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                                <span>Você receberá um email de confirmação em até 24h</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                                <span>Nossa equipe analisará seu perfil para elegibilidade</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                                <span>Protocolo ZS será liberado no seu Dashboard XZenPress</span>
                            </li>
                        </ul>
                    </div>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-4 rounded-full text-lg font-bold hover:scale-105 transition-transform"
                    >
                        Explorar XZenPress Agora
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-900 via-indigo-900 to-black text-white pt-20">
            {/* Hero Section */}
            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-pink-500/20 px-4 py-2 rounded-full mb-6">
                        <Sparkles className="w-5 h-5 text-pink-400" />
                        <span className="text-pink-300 font-semibold">Estudo Pioneiro 2026</span>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                        O "Ponto Mágico" Precisa de Prova
                    </h1>

                    <p className="text-2xl mb-4 text-purple-200">
                        Você Topa Desafiar a Ciência?
                    </p>

                    <div className="max-w-3xl mx-auto text-lg text-purple-100 leading-relaxed">
                        <p className="mb-4">
                            Há <strong className="text-pink-400">18 anos</strong>, dois cientistas alemães (Zeise & Suess) fizeram uma descoberta chocante:
                        </p>
                        <p className="text-2xl font-bold text-white mb-4">
                            Um único ponto na região temporal do crânio (YNSA) reverteu sintomas de menopausa e desequilíbrios hormonais em <span className="text-pink-400">99% de 271 mulheres</span>.
                        </p>
                        <p className="text-3xl font-black text-pink-400 mb-6">99%.</p>
                        <p>
                            Na ciência, isso é quase "bom demais para ser verdade". E desde 2008, <strong>ninguém tentou replicar esse estudo com rigor moderno</strong>.
                        </p>
                    </div>
                </div>

                {/* Missão XZenPress */}
                <div className="bg-gradient-to-r from-purple-800/50 to-pink-800/50 backdrop-blur-lg rounded-2xl p-8 mb-12 border border-purple-500/30">
                    <div className="flex items-center gap-3 mb-6">
                        <Target className="w-8 h-8 text-pink-400" />
                        <h2 className="text-3xl font-bold">🚀 A Missão XZenPress: Verdade ou Mito?</h2>
                    </div>

                    <p className="text-xl mb-6">
                        Nós não queremos apenas "acreditar". <strong className="text-pink-400">Queremos provar</strong>.
                    </p>

                    <p className="text-lg mb-4">
                        O XZenPress está montando o <strong>primeiro grupo de estudo digital do mundo</strong> para validar o protocolo "ZS Point" via acupressão de precisão.
                    </p>

                    <div className="bg-black/40 rounded-xl p-6 border-l-4 border-cyan-400">
                        <p className="text-lg">
                            <strong className="text-cyan-400">Não é magia. É neurofisiologia.</strong>
                        </p>
                        <p className="mt-2">
                            Queremos testar se a estimulação correta desse ponto pode realmente "reiniciar" o eixo <strong className="text-purple-300">Hipotálamo-Pituitária-Ovário</strong>, como teorizado.
                        </p>
                    </div>
                </div>

                {/* Quem Estamos Procurando */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-12">
                    <div className="flex items-center gap-3 mb-6">
                        <Users className="w-8 h-8 text-purple-400" />
                        <h2 className="text-3xl font-bold">👩🔬 Quem Estamos Procurando?</h2>
                    </div>

                    <p className="text-xl mb-6">
                        <strong>Mulheres visionárias</strong> que queiram ser pioneiras na ciência do bem-estar.
                    </p>

                    <p className="text-lg mb-4">Se você sofre com:</p>

                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 p-6 rounded-xl border border-pink-500/30">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="text-3xl">🔥</div>
                                <h3 className="text-xl font-bold">Menopausa</h3>
                            </div>
                            <p>Fogachos, insônia, oscilações de humor</p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500/20 to-cyan-500/20 p-6 rounded-xl border border-purple-500/30">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="text-3xl">📉</div>
                                <h3 className="text-xl font-bold">Libido Baixa</h3>
                            </div>
                            <p>Desejo sexual reduzido ou inexistente</p>
                        </div>

                        <div className="bg-gradient-to-br from-cyan-500/20 to-pink-500/20 p-6 rounded-xl border border-cyan-500/30">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="text-3xl">😣</div>
                                <h3 className="text-xl font-bold">TPM Severa</h3>
                            </div>
                            <p>Dor, irritabilidade, ciclos irregulares</p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-6 rounded-xl border border-purple-500/30">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="text-3xl">🩸</div>
                                <h3 className="text-xl font-bold">Amenorreia</h3>
                            </div>
                            <p>Falta de menstruação (não grávida)</p>
                        </div>
                    </div>

                    <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4">
                        <p className="text-yellow-200">
                            <strong>✨ Você pode ser elegível</strong> para o Protocolo Experimental ZS dentro do XZenPress.
                        </p>
                    </div>
                </div>

                {/* O Que Você Ganha */}
                <div className="bg-gradient-to-r from-cyan-800/50 to-purple-800/50 backdrop-blur-lg rounded-2xl p-8 mb-12 border border-cyan-500/30">
                    <div className="flex items-center gap-3 mb-6">
                        <Heart className="w-8 h-8 text-pink-400" />
                        <h2 className="text-3xl font-bold">🎁 O Que Você Ganha?</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="text-5xl mb-3">🚀</div>
                            <h3 className="text-xl font-bold mb-2">Acesso Antecipado</h3>
                            <p>Seja a primeira a testar o "Protocolo ZS" digital</p>
                        </div>

                        <div className="text-center">
                            <div className="text-5xl mb-3">📊</div>
                            <h3 className="text-xl font-bold mb-2">Monitoramento VIP</h3>
                            <p>Acompanhamento pelo nosso Dashboard Inteligente</p>
                        </div>

                        <div className="text-center">
                            <div className="text-5xl mb-3">🏛️</div>
                            <h3 className="text-xl font-bold mb-2">Legado Científico</h3>
                            <p>Seus dados ajudarão milhões de mulheres</p>
                        </div>
                    </div>
                </div>

                {/* Formulário de Cadastro */}
                <div className="bg-gradient-to-br from-pink-900/50 to-purple-900/50 backdrop-blur-lg rounded-2xl p-8 mb-12 border-2 border-pink-500/50">
                    <div className="text-center mb-8">
                        <h2 className="text-4xl font-bold mb-4">👇 Entre na Lista de Espera da Ciência</h2>
                        <p className="text-xl text-purple-200">
                            Estamos selecionando apenas <strong className="text-pink-400">500 participantes</strong> para a primeira fase.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
                        <div>
                            <label className="block text-lg font-semibold mb-2">Nome Completo *</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-purple-500/50 text-white focus:outline-none focus:border-pink-500"
                                placeholder="Seu nome"
                            />
                        </div>

                        <div>
                            <label className="block text-lg font-semibold mb-2">Email *</label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-purple-500/50 text-white focus:outline-none focus:border-pink-500"
                                placeholder="seu@email.com"
                            />
                        </div>

                        <div>
                            <label className="block text-lg font-semibold mb-2">
                                Idade *
                                <span className="text-sm font-normal text-purple-300 ml-2">(Requisito: 45 a 65 anos)</span>
                            </label>
                            <input
                                type="number"
                                required
                                min="45"
                                max="65"
                                value={formData.age}
                                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-purple-500/50 text-white focus:outline-none focus:border-pink-500"
                                placeholder="Ex: 52"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-500/20 border border-red-500 text-red-100 p-4 rounded-xl flex items-start gap-3 animate-pulse">
                                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-bold">Atenção</h4>
                                    <p>{error}</p>
                                    {error.includes('idade') && (
                                        <div className="mt-2 text-sm text-white/90">
                                            <p className="mb-1">Mas não desanime! O Ponto ZS também funciona para <strong>TPM, Libido e Cólicas</strong> em qualquer idade.</p>
                                            <a href="/acupressure" className="underline text-cyan-300 hover:text-cyan-200 font-bold">
                                                Acessar Guia do Ponto ZS agora &rarr;
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Bloco Alternativo Geral */}
                        <div className="bg-white/5 rounded-xl p-4 text-sm text-purple-200 border border-purple-500/30">
                            <p>
                                <strong>💡 Nota Importante:</strong> A restrição de idade (45-65) é <u>apenas para o estudo científico</u>.
                                Se você tem outra idade e quer usar o Ponto ZS para TPM, Libido ou Cólicas, ele já está disponível na nossa biblioteca de pontos.
                            </p>
                        </div>

                        <div>
                            <label className="block text-lg font-semibold mb-2">Principal Condição *</label>
                            <select
                                required
                                value={formData.condition}
                                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-purple-500/50 text-white focus:outline-none focus:border-pink-500"
                            >
                                <option value="">Selecione...</option>
                                <option value="menopausa">Menopausa / Fogachos</option>
                                <option value="libido">Libido Baixa</option>
                                <option value="tpm">TPM Severa</option>
                                <option value="amenorreia">Amenorreia (Falta de Menstruação)</option>
                                <option value="irregular">Ciclo Irregular</option>
                                <option value="outro">Outro Desequilíbrio Hormonal</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-lg font-semibold mb-2">Severidade dos Sintomas *</label>
                            <select
                                required
                                value={formData.severity}
                                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-purple-500/50 text-white focus:outline-none focus:border-pink-500"
                            >
                                <option value="">Selecione...</option>
                                <option value="leve">Leve (incomoda às vezes)</option>
                                <option value="moderada">Moderada (afeta qualidade de vida)</option>
                                <option value="severa">Severa (impacta significativamente o dia a dia)</option>
                            </select>
                        </div>

                        <div className="bg-purple-900/50 p-6 rounded-xl">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    required
                                    checked={formData.consent}
                                    onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                                    className="mt-1 w-5 h-5"
                                />
                                <span className="text-sm">
                                    Concordo em participar do estudo XZenPress, entendo que meus dados serão utilizados de forma <strong>anônima</strong> para pesquisa científica e validação do Protocolo ZS. Todos os dados serão tratados com total confidencialidade conforme LGPD.
                                </span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 px-8 py-5 rounded-full text-xl font-bold hover:scale-105 transition-transform shadow-2xl"
                        >
                            🚀 QUERO FAZER PARTE DA HISTÓRIA
                        </button>
                    </form>
                </div>

                {/* Enquanto Aguarda */}
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 text-center">
                    <h2 className="text-3xl font-bold mb-4">🏛️ Enquanto Aguarda, Explore Nossa Diversidade Pró-Saúde</h2>
                    <p className="text-xl mb-6 text-purple-200">
                        A ciência do XZenPress já está disponível hoje. Não espere o estudo começar para cuidar de você.
                    </p>
                    <p className="text-lg mb-8">
                        Nossa plataforma oferece <strong className="text-pink-400">22 Jornadas Clínicas</strong> completas e uma biblioteca de <strong className="text-cyan-400">sons neuro-acústicos</strong>.
                    </p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="bg-white text-purple-900 px-8 py-4 rounded-full text-lg font-bold hover:bg-purple-100 transition-colors"
                    >
                        Conhecer a Plataforma XZenPress →
                    </button>
                </div>

                {/* Credibilidade */}
                <div className="mt-16 text-center mb-16">
                    <p className="text-2xl font-bold mb-4 text-purple-200">
                        "Na XZenPress, nós não seguimos tendências. Nós as testamos, validamos e entregamos."
                    </p>
                    <p className="text-lg text-purple-300">
                        Camilla Vieira & Equipe XZenPress
                    </p>
                </div>

                {/* Medical Disclaimer Footer */}
                <div className="border-t border-white/10 pt-8 mt-12 text-center opacity-60 text-sm max-w-4xl mx-auto pb-12">
                    <p className="mb-2 font-bold">⚠️ Isenção de Responsabilidade Médica (Medical Disclaimer)</p>
                    <p>
                        O XZenPress e este estudo têm fins exclusivamente informativos, educacionais e de pesquisa.
                        As informações aqui apresentadas <strong>não substituem o aconselhamento, diagnóstico ou tratamento médico profissional</strong>.
                        Se você tem condições médicas preexistentes graves, consulte seu médico antes de iniciar qualquer nova prática complementar.
                        Os resultados do "Estudo Original de 2008" citados são históricos e estamos conduzindo esta nova pesquisa justamente para validar sua eficácia no contexto atual.
                        A participação é voluntária.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default HormonalResearchPage;
