import React, { useState, useEffect } from 'react';
import { Clock, Brain, Sparkles, ArrowLeft, Plus, Trash2, Info, AlertCircle, Sun, Moon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { NutrimingTrialService, TrialStatus } from '../services/nutrimingTrialService';

interface NutrimingPageProps {
    onPageChange: (page: string) => void;
}

interface Supplement {
    id: string;
    name: string;
    dosage: string;
    timing: 'morning' | 'afternoon' | 'evening' | 'with-meal' | 'empty-stomach';
    category: 'vitamin' | 'mineral' | 'herb' | 'amino' | 'probiotic' | 'other';
}

interface UserProfile {
    age: number;
    gender: 'male' | 'female' | 'other';
    symptoms: string[];
}

const SUPPLEMENT_DATABASE = {
    // Interações conhecidas (simplificado para MVP)
    conflicts: {
        'Cálcio': ['Ferro', 'Zinco'],
        'Ferro': ['Cálcio', 'Zinco', 'Chá Verde'],
        'Zinco': ['Cálcio', 'Ferro', 'Cobre'],
        'Magnésio': ['Antibióticos (tetraciclina)'],
        'Vitamina C': ['Vitamina B12 (alta dose)'],
    },
    // Timing otimizado (com variações comuns)
    optimalTiming: {
        // Vitaminas
        'Vitamina D': 'morning',
        'Vitamina D3': 'morning',
        'D3': 'morning',
        'Colecalciferol': 'morning',
        'Vitamina B12': 'morning',
        'B12': 'morning',
        'Cobalamina': 'morning',
        'B-Complex': 'morning',
        'Vitaminas do Complexo B': 'morning',
        'Complexo B': 'morning',
        'Vitamina C': 'morning',
        'Ácido Ascórbico': 'morning',

        // Minerais
        'Ferro': 'empty-stomach',
        'Sulfato Ferroso': 'empty-stomach',
        'Magnésio': 'evening',
        'Cloreto de Magnésio': 'evening',
        'Cloreto Magnésio': 'evening',
        'Magnésio Dimalato': 'evening',
        'Magnésio Quelado': 'evening',
        'Cálcio': 'evening',
        'Citrato de Cálcio': 'evening',
        'Carbonato de Cálcio': 'evening',
        'Zinco': 'with-meal',
        'Zinco Quelado': 'with-meal',

        // Ômega e Gorduras
        'Ômega-3': 'with-meal',
        'Ômega 3': 'with-meal',
        'Omega-3': 'with-meal',
        'Omega 3': 'with-meal',
        'Óleo de Peixe': 'with-meal',

        // Probióticos
        'Probióticos': 'morning',
        'Probiótico': 'morning',
        'Lactobacillus': 'morning',

        // Antioxidantes
        'Coenzima Q10': 'with-meal',
        'CoQ10': 'with-meal',
        'Ubiquinol': 'with-meal',
        'Curcumina': 'with-meal',
        'Cúrcuma': 'with-meal',

        // Aminoácidos
        'N-Acetilcisteína': 'morning',
        'N acetilcisteína': 'morning',
        'NAC': 'morning',
        'L-Teanina': 'evening',
        'Glicina': 'evening',

        // Adaptógenos
        'Ashwagandha': 'evening',
        'Rhodiola': 'morning',

        // Sono
        'Melatonina': 'evening',
    } as Record<string, string>,
    // Recomendações por idade
    ageRecommendations: {
        'child': ['Vitamina D', 'Ômega-3', 'Probióticos'], // 2-17 anos
        '18-30': ['B-Complex', 'Vitamina D', 'Ômega-3', 'Probióticos'],
        '30-45': ['B-Complex', 'Vitamina D', 'Ômega-3', 'Magnésio', 'Coenzima Q10'],
        '45-60': ['Vitamina D', 'Ômega-3', 'Magnésio', 'Coenzima Q10', 'Curcumina'],
        '60+': ['Vitamina D', 'Vitamina B12', 'Ômega-3', 'Magnésio', 'Coenzima Q10', 'Curcumina']
    } as Record<string, string[]>,
    // Recomendações por sexo
    genderRecommendations: {
        male: ['Zinco', 'Vitamina D', 'Magnésio', 'Creatina'],
        female: ['Ferro', 'Cálcio', 'Ácido Fólico', 'Vitamina B12'],
        other: ['Vitamina D', 'Ômega-3', 'B-Complex']
    } as Record<string, string[]>,
    // Suplementos por sintoma
    symptomSupplements: {
        'Ansiedade': ['Magnésio', 'L-Teanina', 'Ashwagandha', 'Vitamina B-Complex'],
        'Insônia': ['Magnésio', 'Melatonina', 'Glicina'],
        'Fadiga': ['B-Complex', 'Ferro', 'Coenzima Q10', 'Vitamina D'],
        'Dor nas articulações': ['Ômega-3', 'Curcumina', 'Glucosamina', 'Condroitina'],
        'Imunidade baixa': ['Vitamina D', 'Vitamina C', 'Zinco', 'Probióticos'],
        'Estresse': ['Magnésio', 'Ashwagandha', 'Rhodiola', 'Vitamina B-Complex'],
    } as Record<string, string[]>
};

export const NutrimingPage: React.FC<NutrimingPageProps> = ({ onPageChange }) => {
    const { user } = useAuth();
    const [supplements, setSupplements] = useState<Supplement[]>([]);
    const [userProfile, setUserProfile] = useState<UserProfile>({ age: 35, gender: 'other', symptoms: [] });
    const [showAddForm, setShowAddForm] = useState(false);
    const [newSupplement, setNewSupplement] = useState({ name: '', dosage: '', category: 'other' as Supplement['category'] });
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [trialStatus, setTrialStatus] = useState<TrialStatus>({ allowed: true, usesLeft: 3, isPremium: false });

    // Função para solicitar permissão de notificações
    const requestNotificationPermission = async () => {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                setNotificationsEnabled(true);
                scheduleNotifications();
                // Salvar preferência
                localStorage.setItem('nutriming_notifications', 'enabled');
            }
        } else {
            alert('Seu navegador não suporta notificações.');
        }
    };

    // Agendar notificações consolidadas
    const scheduleNotifications = () => {
        const grouped = groupByTiming();
        const timings = [
            { time: '08:00', period: 'morning', label: 'Matinais', icon: '🌅' },
            { time: '13:00', period: 'with-meal', label: 'com Refeição', icon: '🍽️' },
            { time: '19:00', period: 'evening', label: 'Noturnos', icon: '🌙' }
        ];

        timings.forEach(({ time, period, label, icon }) => {
            const supplements = grouped[period as keyof typeof grouped];
            if (supplements.length > 0) {
                scheduleNotification(time, `${icon} Suplementos ${label} (${supplements.length})`,
                    supplements.map(s => s.name).join(', '));
            }
        });
    };

    // Agendar notificação específica
    const scheduleNotification = (time: string, title: string, body: string) => {
        const [hours, minutes] = time.split(':').map(Number);
        const now = new Date();
        const scheduledTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);

        if (scheduledTime < now) {
            scheduledTime.setDate(scheduledTime.getDate() + 1);
        }

        const timeUntilNotification = scheduledTime.getTime() - now.getTime();

        setTimeout(() => {
            if (notificationsEnabled && Notification.permission === 'granted') {
                new Notification(title, {
                    body,
                    icon: '/robo-zen-meditando.png',
                    badge: '/robo-zen-meditando.png'
                });
            }
            // Re-agendar para amanhã
            setTimeout(() => scheduleNotification(time, title, body), 24 * 60 * 60 * 1000);
        }, timeUntilNotification);
    };

    // Calcular hidratação recomendada
    const calculateHydration = () => {
        const baseWater = 2; // Litros base
        const supplementBonus = supplements.length * 0.2; // 200ml por suplemento
        return Math.round((baseWater + supplementBonus) * 10) / 10; // Arredondar para 1 casa decimal
    };

    // Verificar autenticação - redirecionar para login se não estiver logado
    useEffect(() => {
        if (!user) {
            alert('⚠️ Acesso Restrito\n\nFaça login para acessar o Nutriming AI.');
            onPageChange('login');
        }
    }, [user, onPageChange]);

    // Verificar trial status e incrementar contador
    useEffect(() => {
        if (!user) return;

        const checkTrialStatus = async () => {
            const status = await NutrimingTrialService.canAccessNutriming(user.id, user.isPremium);

            if (!status.allowed) {
                // Redirecionar para Premium se esgotou usos
                alert('🎁 Teste Grátis Esgotado!\n\nVocê usou seus 3 testes gratuitos do Nutriming AI.\n\nAssine Premium para acesso ilimitado!');
                onPageChange('premium');
                return;
            }

            setTrialStatus(status);

            // Incrementar contador apenas se não for Premium
            if (!user.isPremium) {
                await NutrimingTrialService.incrementUsage(user.id);
                // Atualizar status após incremento
                const updatedStatus = await NutrimingTrialService.canAccessNutriming(user.id, user.isPremium);
                setTrialStatus(updatedStatus);
            }
        };

        checkTrialStatus();
    }, [user]);

    // Verificar permissão ao carregar (Service Worker)
    useEffect(() => {
        const saved = localStorage.getItem('nutriming_notifications');
        if (saved === 'enabled' && Notification.permission === 'granted') {
            setNotificationsEnabled(true);
            scheduleNotifications();
        }
    }, []);

    // Re-agendar quando suplementos mudarem
    useEffect(() => {
        if (notificationsEnabled) {
            scheduleNotifications();
        }
    }, [supplements, notificationsEnabled]);

    useEffect(() => {
        // Load from localStorage
        const stored = localStorage.getItem(`nutriming_${user?.id || 'guest'}`);
        if (stored) {
            const data = JSON.parse(stored);
            setSupplements(data.supplements || []);
            setUserProfile(data.profile || { age: 35, symptoms: [] });
        }
    }, [user]);

    const saveData = (sups: Supplement[], profile: UserProfile) => {
        localStorage.setItem(`nutriming_${user?.id || 'guest'}`, JSON.stringify({
            supplements: sups,
            profile
        }));
    };

    // Função auxiliar para matching inteligente
    const findOptimalTiming = (supplementName: string): Supplement['timing'] => {
        // 1. Busca exata
        if (SUPPLEMENT_DATABASE.optimalTiming[supplementName]) {
            return SUPPLEMENT_DATABASE.optimalTiming[supplementName] as Supplement['timing'];
        }

        // 2. Normalizar e buscar (remove acentos, lowercase)
        const normalize = (str: string) => str.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim();

        const normalizedInput = normalize(supplementName);

        // 3. Busca parcial (ex: "Cloreto Magnésio" contém "Magnésio")
        for (const [key, value] of Object.entries(SUPPLEMENT_DATABASE.optimalTiming)) {
            const normalizedKey = normalize(key);
            // Match se input contém a palavra-chave OU palavra-chave contém input
            if (normalizedInput.includes(normalizedKey) || normalizedKey.includes(normalizedInput)) {
                return value as Supplement['timing'];
            }
        }

        // 4. Default: manhã
        return 'morning';
    };

    const addSupplement = () => {
        if (!newSupplement.name) return;

        const timing = findOptimalTiming(newSupplement.name);
        const supplement: Supplement = {
            id: Date.now().toString(),
            name: newSupplement.name,
            dosage: newSupplement.dosage || '1x ao dia',
            timing,
            category: newSupplement.category
        };

        const updated = [...supplements, supplement];
        setSupplements(updated);
        saveData(updated, userProfile);
        setNewSupplement({ name: '', dosage: '', category: 'other' });
        setShowAddForm(false);
    };

    const removeSupplement = (id: string) => {
        const updated = supplements.filter(s => s.id !== id);
        setSupplements(updated);
        saveData(updated, userProfile);
    };

    const updateTiming = (id: string, timing: Supplement['timing']) => {
        const updated = supplements.map(s => s.id === id ? { ...s, timing } : s);
        setSupplements(updated);
        saveData(updated, userProfile);
    };

    const toggleSymptom = (symptom: string) => {
        const updated = userProfile.symptoms.includes(symptom)
            ? userProfile.symptoms.filter(s => s !== symptom)
            : [...userProfile.symptoms, symptom];
        const newProfile = { ...userProfile, symptoms: updated };
        setUserProfile(newProfile);
        saveData(supplements, newProfile);
    };

    const getConflicts = () => {
        const conflicts: string[] = [];
        supplements.forEach(sup => {
            const conflictsWith = SUPPLEMENT_DATABASE.conflicts[sup.name as keyof typeof SUPPLEMENT_DATABASE.conflicts] || [];
            conflictsWith.forEach(conflict => {
                if (supplements.some(s => s.name === conflict)) {
                    conflicts.push(`⚠️ ${sup.name} conflita com ${conflict} - evite tomar no mesmo horário`);
                }
            });
        });
        return [...new Set(conflicts)]; // Remove duplicates
    };

    const getRecommendations = () => {
        // Determinar grupo etário
        const ageGroup = userProfile.age < 18 ? 'child' :
            userProfile.age < 30 ? '18-30' :
                userProfile.age < 45 ? '30-45' :
                    userProfile.age < 60 ? '45-60' : '60+';

        const ageRecommended = SUPPLEMENT_DATABASE.ageRecommendations[ageGroup] || [];
        const genderRecommended = SUPPLEMENT_DATABASE.genderRecommendations[userProfile.gender] || [];
        const symptomRecommended = userProfile.symptoms.flatMap(symptom =>
            SUPPLEMENT_DATABASE.symptomSupplements[symptom] || []
        );

        const all = [...ageRecommended, ...genderRecommended, ...symptomRecommended];
        const missing = [...new Set(all)].filter(rec => !supplements.some(s => s.name === rec));

        return missing;
    };

    const groupByTiming = () => {
        const groups = {
            morning: supplements.filter(s => s.timing === 'morning'),
            afternoon: supplements.filter(s => s.timing === 'afternoon'),
            evening: supplements.filter(s => s.timing === 'evening'),
            'with-meal': supplements.filter(s => s.timing === 'with-meal'),
            'empty-stomach': supplements.filter(s => s.timing === 'empty-stomach'),
        };
        return groups;
    };

    const groups = groupByTiming();
    const conflicts = getConflicts();
    const recommendations = getRecommendations();

    const timingLabels = {
        morning: { icon: Sun, label: 'Manhã (6h-10h)', color: 'text-yellow-600' },
        afternoon: { icon: Sun, label: 'Tarde (12h-16h)', color: 'text-orange-600' },
        evening: { icon: Moon, label: 'Noite (18h-22h)', color: 'text-indigo-600' },
        'with-meal': { icon: Clock, label: 'Com refeição', color: 'text-green-600' },
        'empty-stomach': { icon: Clock, label: 'Estômago vazio', color: 'text-purple-600' },
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <button
                    onClick={() => onPageChange('home')}
                    className="flex items-center text-gray-600 hover:text-green-600 mb-8 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Voltar para Início
                </button>

                {/* Header */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
                    <div className="bg-gradient-to-r from-green-600 to-teal-600 p-8 text-white text-center">
                        <div className="flex justify-center mb-4">
                            <div className="p-4 bg-white/20 rounded-full backdrop-blur-md">
                                <Sparkles className="w-12 h-12 text-yellow-300" />
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold mb-2">Nutriming AI</h1>
                        <p className="text-xl text-green-100">Timing perfeito para sua suplementação</p>

                        {/* Trial Banner */}
                        {!user?.isPremium && trialStatus.usesLeft < 3 && (
                            <div className="mt-4 bg-yellow-400 text-yellow-900 px-6 py-3 rounded-xl font-semibold text-sm flex items-center justify-center space-x-2">
                                <span>🎁</span>
                                <span>
                                    {trialStatus.usesLeft > 0
                                        ? `Teste Grátis: ${trialStatus.usesLeft} ${trialStatus.usesLeft === 1 ? 'uso restante' : 'usos restantes'}`
                                        : 'Teste Grátis Esgotado'}
                                </span>
                                {trialStatus.usesLeft === 0 && (
                                    <button
                                        onClick={() => onPageChange('premium')}
                                        className="ml-3 bg-yellow-900 text-yellow-100 px-4 py-1 rounded-lg hover:bg-yellow-800 transition-colors"
                                    >
                                        Assinar Premium
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* DISCLAIMER LEGAL E FONTES */}
                    <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 mt-6">
                        <div className="flex items-start space-x-3">
                            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-yellow-900">
                                <p className="font-bold mb-2">⚠️ IMPORTANTE - Informações Educacionais</p>
                                <p className="mb-3">
                                    Este sistema fornece <strong>orientações gerais educacionais</strong> baseadas em literatura científica.
                                    <strong className="block mt-2">NÃO substitui consulta médica ou nutricional.</strong>
                                </p>
                                <p className="text-xs text-yellow-800 mb-2">
                                    <strong>Fontes:</strong> Timing baseado em estudos de cronobiologia nutricional, absorção de nutrientes e interações documentadas em:
                                </p>
                                <ul className="text-xs text-yellow-800 space-y-1 ml-4">
                                    <li>• National Institutes of Health (NIH) - Office of Dietary Supplements</li>
                                    <li>• Journal of the International Society of Sports Nutrition</li>
                                    <li>• European Journal of Clinical Nutrition</li>
                                    <li>• American Journal of Clinical Nutrition</li>
                                </ul>
                                <p className="text-xs text-yellow-800 mt-3 font-semibold">
                                    Sempre consulte seu médico antes de iniciar qualquer suplementação.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Perfil do Usuário */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Seu Perfil</h3>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Idade</label>
                                <input
                                    type="number"
                                    value={userProfile.age}
                                    onChange={(e) => {
                                        const newProfile = { ...userProfile, age: parseInt(e.target.value) || 0 };
                                        setUserProfile(newProfile);
                                        saveData(supplements, newProfile);
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
                                />
                            </div>

                            {/* Campo Sexo */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Sexo</label>
                                <select
                                    value={userProfile.gender}
                                    onChange={(e) => {
                                        const newProfile = { ...userProfile, gender: e.target.value as UserProfile['gender'] };
                                        setUserProfile(newProfile);
                                        saveData(supplements, newProfile);
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
                                >
                                    <option value="male">Masculino</option>
                                    <option value="female">Feminino</option>
                                    <option value="other">Outro/Prefiro não informar</option>
                                </select>
                            </div>

                            {/* Alerta Pediátrico */}
                            {userProfile.age < 18 && (
                                <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 mb-4">
                                    <div className="flex items-start space-x-2">
                                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                        <div className="text-sm text-red-900">
                                            <p className="font-bold">⚠️ ATENÇÃO: Menor de 18 anos</p>
                                            <p className="mt-1">
                                                Suplementação pediátrica requer <strong>acompanhamento médico obrigatório</strong>.
                                                Doses e necessidades são diferentes de adultos.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Sintomas/Objetivos</label>
                                <div className="space-y-2">
                                    {Object.keys(SUPPLEMENT_DATABASE.symptomSupplements).map(symptom => (
                                        <label key={symptom} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={userProfile.symptoms.includes(symptom)}
                                                onChange={() => toggleSymptom(symptom)}
                                                className="mr-2"
                                            />
                                            <span className="text-sm text-gray-700">{symptom}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Recommendations */}
                        {recommendations.length > 0 && (
                            <div className="bg-blue-50 rounded-2xl shadow-lg p-6 border border-blue-200">
                                <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
                                    <Info className="w-5 h-5 mr-2" />
                                    Recomendações para Você
                                </h3>
                                <p className="text-sm text-blue-700 mb-3">Baseado na sua idade ({userProfile.age} anos) e sintomas:</p>
                                <ul className="space-y-2">
                                    {recommendations.map(rec => (
                                        <li key={rec} className="text-sm text-blue-800 flex items-center">
                                            <Sparkles className="w-4 h-4 mr-2 text-yellow-500" />
                                            {rec}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Conflicts */}
                        {conflicts.length > 0 && (
                            <div className="bg-red-50 rounded-2xl shadow-lg p-6 border border-red-200 mt-6">
                                <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center">
                                    <AlertCircle className="w-5 h-5 mr-2" />
                                    Conflitos Detectados
                                </h3>
                                <ul className="space-y-2">
                                    {conflicts.map((conflict, idx) => (
                                        <li key={idx} className="text-sm text-red-800">{conflict}</li>
                                    ))}
                                </ul>
                            </div>
                        )}





                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Add Supplement */}
                        {!showAddForm ? (
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Adicionar Suplemento
                            </button>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Adicionar Novo Suplemento</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <input
                                        type="text"
                                        placeholder="Nome (ex: Vitamina D)"
                                        value={newSupplement.name}
                                        onChange={(e) => setNewSupplement({ ...newSupplement, name: e.target.value })}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 bg-white placeholder-gray-500"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Dosagem (ex: 5000 UI)"
                                        value={newSupplement.dosage}
                                        onChange={(e) => setNewSupplement({ ...newSupplement, dosage: e.target.value })}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 bg-white placeholder-gray-500"
                                    />
                                    <select
                                        value={newSupplement.category}
                                        onChange={(e) => setNewSupplement({ ...newSupplement, category: e.target.value as Supplement['category'] })}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
                                    >
                                        <option value="vitamin">Vitamina</option>
                                        <option value="mineral">Mineral</option>
                                        <option value="herb">Fitoterápico</option>
                                        <option value="amino">Aminoácido</option>
                                        <option value="probiotic">Probiótico</option>
                                        <option value="other">Outro</option>
                                    </select>
                                </div>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={addSupplement}
                                        className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                                    >
                                        Adicionar
                                    </button>
                                    <button
                                        onClick={() => setShowAddForm(false)}
                                        className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Schedule by Timing */}
                        {supplements.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                                <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">Adicione seus suplementos para ver o cronograma personalizado</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {Object.entries(groups).map(([timing, sups]) => {
                                    if (sups.length === 0) return null;
                                    const TimingIcon = timingLabels[timing as keyof typeof timingLabels].icon;
                                    return (
                                        <div key={timing} className="bg-white rounded-2xl shadow-lg p-6">
                                            <h3 className={`text-lg font-bold mb-4 flex items-center ${timingLabels[timing as keyof typeof timingLabels].color}`}>
                                                <TimingIcon className="w-6 h-6 mr-2" />
                                                {timingLabels[timing as keyof typeof timingLabels].label}
                                            </h3>
                                            <div className="space-y-3">
                                                {sups.map(sup => (
                                                    <div key={sup.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                        <div className="flex-1">
                                                            <p className="font-medium text-gray-900">{sup.name}</p>
                                                            <p className="text-sm text-gray-500">{sup.dosage}</p>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <select
                                                                value={sup.timing}
                                                                onChange={(e) => updateTiming(sup.id, e.target.value as Supplement['timing'])}
                                                                className="text-sm px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
                                                            >
                                                                <option value="morning">Manhã</option>
                                                                <option value="afternoon">Tarde</option>
                                                                <option value="evening">Noite</option>
                                                                <option value="with-meal">Com refeição</option>
                                                                <option value="empty-stomach">Estômago vazio</option>
                                                            </select>
                                                            <button
                                                                onClick={() => removeSupplement(sup.id)}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* MOVIDO: Grid 2 Colunas Desktop - Hidratação + Notificações */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            {/* Hydration Card - Coluna 1 */}
                            <div className="bg-cyan-50 rounded-2xl shadow-lg p-6 border border-cyan-200">
                                <h3 className="text-lg font-bold text-cyan-900 mb-4 flex items-center">
                                    💧 Hidratação Importante
                                </h3>
                                <p className="text-sm text-cyan-800 mb-3">
                                    {supplements.length > 0
                                        ? <span>Você está tomando <strong>{supplements.length} suplemento{supplements.length > 1 ? 's' : ''}</strong>.</span>
                                        : <span>Mantenha-se hidratado para melhor saúde.</span>
                                    }
                                </p>
                                <div className="bg-white rounded-lg p-4 mb-3">
                                    <p className="text-2xl font-bold text-cyan-600 mb-1">
                                        🚰 {calculateHydration()}L de água/dia
                                    </p>
                                    <p className="text-xs text-cyan-700">
                                        Base: 2L {supplements.length > 0 && `+ ${(supplements.length * 0.2).toFixed(1)}L (${supplements.length} × 200ml)`}
                                    </p>
                                </div>
                                <p className="text-xs text-cyan-800 mb-3">
                                    <strong>Por quê?</strong> Água ajuda na absorção de nutrientes e previne sobrecarga renal.
                                    <span className="block mt-1 font-semibold">Grande parte das doenças se originam da desidratação crônica.</span>
                                </p>
                                <p className="text-xs text-cyan-800 italic mb-4 p-2 bg-cyan-100 rounded-lg">
                                    "Energize sua água com bons pensamentos antes de beber."
                                    <br /><span className="font-bold not-italic">- Dr. Masaru Emoto 💧✨</span>
                                </p>


                                {/* Water Reminders Toggle */}
                                <div className="bg-cyan-100 rounded-lg p-3 text-xs border border-cyan-300">
                                    <p className="text-cyan-900 mb-2 font-semibold">💡 Lembretes de Água</p>
                                    <p className="text-cyan-800 mb-3">
                                        Para {calculateHydration()}L: <strong>{Math.ceil(calculateHydration() / 0.5)} copos</strong>
                                        {' '}(500ml a cada {Math.floor(12 / Math.ceil(calculateHydration() / 0.5))}h)
                                    </p>
                                    <button
                                        onClick={() => {
                                            alert('🚰 Em breve!\n\nSistema de lembretes de hidratação será ativado na próxima versão.');
                                        }}
                                        className="w-full bg-cyan-600 text-white py-2 rounded-lg font-semibold hover:bg-cyan-700 transition-colors"
                                    >
                                        Ativar Lembretes de Água
                                    </button>
                                </div>
                            </div>

                            {/* Notification Card - Coluna 2 */}
                            <div className="bg-purple-50 rounded-2xl shadow-lg p-6 border border-purple-200">
                                <h3 className="text-lg font-bold text-purple-900 mb-2">
                                    🔔 Lembretes de Suplementos
                                </h3>
                                <p className="text-sm text-purple-700 mb-3">
                                    Receba <strong>3 notificações consolidadas</strong> por dia
                                </p>
                                <div className="bg-purple-100 rounded-lg p-3 mb-3 text-xs text-purple-800">
                                    <p className="font-semibold mb-1">📱 Como funciona:</p>
                                    <ul className="space-y-1 ml-4">
                                        <li>• <strong>Notificação Web Push</strong> (via navegador)</li>
                                        <li>• Funciona mesmo com site fechado</li>
                                        <li>• Padrão: 8h, 13h, 19h</li>
                                    </ul>
                                </div>
                                <p className="text-xs text-purple-600 mb-4">
                                    Exemplo: "🌅 Suplementos Matinais (3)" às 8h
                                </p>
                                <button
                                    onClick={notificationsEnabled
                                        ? () => {
                                            setNotificationsEnabled(false);
                                            localStorage.removeItem('nutriming_notifications');
                                        }
                                        : requestNotificationPermission
                                    }
                                    className={`w-full px-6 py-3 rounded-xl font-semibold transition-all ${notificationsEnabled
                                        ? 'bg-green-500 text-white hover:bg-green-600'
                                        : 'bg-purple-600 text-white hover:bg-purple-700'
                                        }`}
                                >
                                    {notificationsEnabled ? '✅ Lembretes Ativos' : 'Ativar Lembretes'}
                                </button>
                                {notificationsEnabled && (
                                    <div className="bg-green-100 border border-green-300 rounded-lg p-3 text-xs text-green-800 mt-3">
                                        ✅ Você receberá notificações nos horários dos suplementos!
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Alerta Polypharmacy (> 8 suplementos) - FORA DO GRID */}
                        {supplements.length > 8 && (
                            <div className="bg-orange-50 rounded-2xl shadow-lg p-6 border border-orange-200 mt-6">
                                <div className="flex items-start space-x-3">
                                    <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-orange-900">
                                        <p className="font-bold mb-2">⚠️ Muitos Suplementos Simultâneos</p>
                                        <p className="mb-2">
                                            Você está tomando <strong>{supplements.length} suplementos</strong>.
                                            Estudos indicam que <strong>mais de 8 suplementos diários</strong> podem:
                                        </p>
                                        <ul className="text-xs space-y-1 ml-4 mb-3">
                                            <li>• Aumentar risco de interações não documentadas</li>
                                            <li>• Sobrecarregar fígado e rins</li>
                                            <li>• Dificultar adesão ao tratamento</li>
                                        </ul>
                                        <p className="text-xs font-semibold">
                                            Recomendação: Consulte um nutricionista para priorizar os mais importantes.
                                        </p>
                                        <p className="text-xs text-orange-700 mt-2">
                                            Fonte: J Am Geriatr Soc. 2019; European J Clin Nutr. 2020
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Wellness Awareness Section - Pilares Naturais */}
                        <div className="bg-emerald-50 rounded-2xl shadow-lg p-6 border border-emerald-200 mt-6">
                            <h3 className="text-lg font-bold text-emerald-900 mb-4 flex items-center">
                                🌿 Pilares do Bem-Estar (Além da Suplementação)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Movimento */}
                                <div className="bg-white p-4 rounded-xl text-center border border-emerald-100 hover:shadow-md transition-shadow">
                                    <span className="text-3xl mb-3 block">🧘</span>
                                    <p className="font-bold text-emerald-800 mb-1">Movimento Diário</p>
                                    <p className="text-xs text-emerald-600">
                                        <strong>Alongue seu corpo 1x ao dia.</strong>
                                        <br />Ativa a circulação e reduz o estresse físico.
                                    </p>
                                </div>

                                {/* Sol */}
                                <div className="bg-white p-4 rounded-xl text-center border border-emerald-100 hover:shadow-md transition-shadow">
                                    <span className="text-3xl mb-3 block">☀️</span>
                                    <p className="font-bold text-emerald-800 mb-1">Vitamina D Natural</p>
                                    <p className="text-xs text-emerald-600">
                                        <strong>15 min de sol pela manhã.</strong>
                                        <br />Melhor que qualquer pílula para imunidade e humor.
                                    </p>
                                </div>

                                {/* Sono */}
                                <div className="bg-white p-4 rounded-xl text-center border border-emerald-100 hover:shadow-md transition-shadow">
                                    <span className="text-3xl mb-3 block">📵</span>
                                    <p className="font-bold text-emerald-800 mb-1">Higiene do Sono</p>
                                    <p className="text-xs text-emerald-600">
                                        <strong>Zero telas 1h antes de dormir.</strong>
                                        <br />Luz azul bloqueia sua Melatonina natural.
                                    </p>
                                </div>
                            </div>
                            <p className="text-xs text-emerald-700 text-center mt-4 italic">
                                "O melhor remédio é um estilo de vida consciente."
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};
