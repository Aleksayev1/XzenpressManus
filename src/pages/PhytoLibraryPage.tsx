import React, { useState } from 'react';
import { ArrowLeft, Leaf, Search, MapPin, AlertTriangle, BookOpen, Activity, Heart, Sprout, Dna, ShoppingCart } from 'lucide-react';
import { HERB_DATABASE, Herb } from '../data/herbLibrary';

interface PhytoLibraryPageProps {
    onPageChange?: (page: string) => void;
}

export const PhytoLibraryPage: React.FC<PhytoLibraryPageProps> = ({ onPageChange }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'Todos' | 'Brasil' | 'China (MTC)' | 'Peptídeos'>('Todos');

    const matchesSearch = (herb: Herb) =>
        herb.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        herb.scientificName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        herb.indications.some(i => i.toLowerCase().includes(searchTerm.toLowerCase()));

    const filteredHerbs = HERB_DATABASE.filter(herb => {
        let matchesTab = true;
        if (activeTab === 'Brasil') matchesTab = herb.origin === 'Brasil';
        if (activeTab === 'China (MTC)') matchesTab = herb.origin === 'China (MTC)';
        if (activeTab === 'Peptídeos') matchesTab = herb.origin === 'Peptídeo (Sintético/Bio-idêntico)';
        return matchesSearch(herb) && matchesTab;
    });

    // Grupos ordenados para a aba "Todos"
    const brasilHerbs = HERB_DATABASE.filter(h => h.origin === 'Brasil' && matchesSearch(h));
    const mtcHerbs = HERB_DATABASE.filter(h => h.origin === 'China (MTC)' && matchesSearch(h));
    const peptideHerbs = HERB_DATABASE.filter(h => h.origin === 'Peptídeo (Sintético/Bio-idêntico)' && matchesSearch(h));
    const isGroupedView = activeTab === 'Todos';

    const HerbCard = ({ herb }: { herb: Herb }) => {
        const isBrasil = herb.origin === 'Brasil';
        const isPeptide = herb.origin === 'Peptídeo (Sintético/Bio-idêntico)';

        let bgGradient = 'bg-gradient-to-r from-red-600 to-orange-500';
        let IconCard = Leaf;
        let iconColor = 'text-red-100';

        if (isBrasil) {
            bgGradient = 'bg-gradient-to-r from-emerald-600 to-green-500';
            IconCard = Sprout;
            iconColor = 'text-emerald-100';
        } else if (isPeptide) {
            bgGradient = 'bg-gradient-to-r from-indigo-600 to-blue-500';
            IconCard = Dna;
            iconColor = 'text-indigo-100';
        }

        return (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all flex flex-col">
                <div className={`p-4 text-white flex justify-between items-start ${bgGradient}`}>
                    <div>
                        <h3 className="text-xl font-bold">{herb.name}</h3>
                        <p className="text-sm opacity-90 italic">{herb.scientificName}</p>
                    </div>
                    <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                        <IconCard className={`w-6 h-6 ${iconColor}`} />
                    </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">
                        <MapPin className="w-4 h-4 mr-1" />
                        {herb.origin} • {herb.partUsed}
                    </div>

                    <div className="mb-4">
                        <h4 className="text-sm font-bold text-gray-900 flex items-center mb-1">
                            <Activity className="w-4 h-4 mr-1 text-blue-500" /> Ação Principal
                        </h4>
                        <p className="text-sm text-gray-700">{herb.mainAction}</p>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 flex-1">
                        {herb.description}
                    </p>

                    {/* MTC Specifics */}
                    {!isBrasil && !isPeptide && herb.nature && herb.tropism && (
                        <div className="mb-4 bg-orange-50 rounded-xl p-3 border border-orange-100">
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <span className="font-bold text-orange-900">Natureza:</span>
                                    <span className="ml-1 text-orange-800">{herb.nature}</span>
                                </div>
                                <div>
                                    <span className="font-bold text-orange-900">Sabor:</span>
                                    <span className="ml-1 text-orange-800">{herb.flavor?.join(', ')}</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="font-bold text-orange-900">Tropismo:</span>
                                    <span className="ml-1 text-orange-800">{herb.tropism.join(', ')}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3">
                        <div>
                            <h4 className="text-xs font-bold text-green-700 mb-1 flex items-center">
                                <Heart className="w-3 h-3 mr-1" /> Indicações
                            </h4>
                            <div className="flex flex-wrap gap-1">
                                {herb.indications.map(ind => (
                                    <span 
                                        key={ind} 
                                        onClick={() => setSearchTerm(ind)}
                                        className="bg-green-50 text-green-700 text-[10px] px-2 py-1 rounded-md border border-green-200 cursor-pointer hover:bg-green-100 hover:text-green-800 transition-colors"
                                        title={`Buscar por ${ind}`}
                                    >
                                        {ind}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-red-700 mb-1 flex items-center">
                                <AlertTriangle className="w-3 h-3 mr-1" /> Contraindicações
                            </h4>
                            <ul className="text-xs text-red-600 space-y-1 pl-4 list-disc marker:text-red-300">
                                {herb.contraindications.map(contra => (
                                    <li key={contra}>{contra}</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Mockup de Parceiro (Apenas para demonstração comercial) */}
                    <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between group hover:bg-indigo-50 transition-colors -mx-5 -mb-5">
                        <div className="flex items-center">
                            <div className="w-9 h-9 bg-white border border-dashed border-gray-300 rounded-xl flex items-center justify-center mr-3 group-hover:border-indigo-300 group-hover:bg-indigo-100 transition-all">
                                <ShoppingCart className="w-4 h-4 text-gray-400 group-hover:text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-[9px] text-gray-400 uppercase font-bold tracking-widest leading-none mb-1 group-hover:text-indigo-400">Oportunidade de Marca</p>
                                <p className="text-xs font-bold text-gray-500 group-hover:text-indigo-700 italic">Espaço para Parceiro Premium</p>
                            </div>
                        </div>
                        <div className="bg-white border border-gray-200 text-gray-400 text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-tighter group-hover:border-indigo-200 group-hover:text-indigo-600">
                            Disponível
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header / Back Button */}
                <div className="flex items-center mb-8">
                    {onPageChange && (
                        <button
                            onClick={() => onPageChange('home')}
                            className="p-2 mr-4 bg-white hover:bg-gray-100 rounded-full shadow-sm hover:shadow transition-all border border-gray-200"
                            title="Voltar"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                    )}
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                            <BookOpen className="w-8 h-8 mr-3 text-emerald-600" />
                            Biblioteca Integrativa (Botânica & Biohacking)
                        </h1>
                        <p className="text-gray-500 mt-1">Herbário completo com Fitoterapia e Banco de Peptídeos.</p>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
                    {/* Tabs */}
                    <div className="flex space-x-2 bg-gray-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
                        {['Todos', 'Brasil', 'China (MTC)', 'Peptídeos'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab
                                        ? 'bg-white text-emerald-700 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full md:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar planta, indicação ou nome científico..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors"
                        />
                    </div>
                </div>

                {/* Herbs Grid */}
                {isGroupedView ? (
                    // Vista agrupada por categoria na aba "Todos"
                    <div className="space-y-12">
                        {brasilHerbs.length > 0 && (
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="flex items-center gap-2 bg-emerald-100 border border-emerald-200 rounded-full px-4 py-1.5">
                                        <Sprout className="w-5 h-5 text-emerald-700" />
                                        <span className="font-bold text-emerald-800 text-sm uppercase tracking-widest">Fitoterapia Brasileira</span>
                                    </div>
                                    <span className="text-xs text-gray-400 font-mono">{brasilHerbs.length} plantas</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {brasilHerbs.map(herb => <HerbCard key={herb.id} herb={herb} />)}
                                </div>
                            </section>
                        )}
                        {mtcHerbs.length > 0 && (
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="flex items-center gap-2 bg-orange-100 border border-orange-200 rounded-full px-4 py-1.5">
                                        <Leaf className="w-5 h-5 text-orange-700" />
                                        <span className="font-bold text-orange-800 text-sm uppercase tracking-widest">Medicina Tradicional Chinesa</span>
                                    </div>
                                    <span className="text-xs text-gray-400 font-mono">{mtcHerbs.length} ervas</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {mtcHerbs.map(herb => <HerbCard key={herb.id} herb={herb} />)}
                                </div>
                            </section>
                        )}
                        {peptideHerbs.length > 0 && (
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="flex items-center gap-2 bg-indigo-100 border border-indigo-200 rounded-full px-4 py-1.5">
                                        <Dna className="w-5 h-5 text-indigo-700" />
                                        <span className="font-bold text-indigo-800 text-sm uppercase tracking-widest">Peptídeos & Biohacking</span>
                                    </div>
                                    <span className="text-xs text-gray-400 font-mono">{peptideHerbs.length} compostos</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {peptideHerbs.map(herb => <HerbCard key={herb.id} herb={herb} />)}
                                </div>
                            </section>
                        )}
                        {brasilHerbs.length === 0 && mtcHerbs.length === 0 && peptideHerbs.length === 0 && (
                            <div className="text-center py-20 bg-white rounded-3xl border border-gray-200">
                                <Leaf className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum item encontrado</h3>
                                <p className="text-gray-500">Tente buscar por outros termos.</p>
                                <button onClick={() => setSearchTerm('')} className="mt-4 text-emerald-600 font-bold hover:text-emerald-700">Limpar busca</button>
                            </div>
                        )}
                    </div>
                ) : filteredHerbs.length > 0 ? (
                    // Vista filtrada por aba específica
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredHerbs.map(herb => (
                            <HerbCard key={herb.id} herb={herb} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-200">
                        <Leaf className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhuma planta encontrada</h3>
                        <p className="text-gray-500">Tente buscar por outros termos ou verifique a ortografia.</p>
                        <button
                            onClick={() => { setSearchTerm(''); setActiveTab('Todos'); }}
                            className="mt-4 text-emerald-600 font-bold hover:text-emerald-700"
                        >
                            Limpar busca
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
