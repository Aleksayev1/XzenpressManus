import React from 'react';
import { Fingerprint, Dna, Sparkles } from 'lucide-react';

export const MiracleScienceSection: React.FC = () => {
    const pillars = [
        {
            icon: <Fingerprint className="w-10 h-10 text-purple-600" />,
            title: "Probabilidade Zero",
            description: "A chance matemática do universo e da sua vida existirem por acaso é estatisticamente nula. Você não é um acidente cósmico; é um evento intencional."
        },
        {
            icon: <Dna className="w-10 h-10 text-blue-600" />,
            title: "Equilíbrio Biológico",
            description: "Seu corpo possui mecanismos de recuperação natural que a ciência moderna valoriza cada vez mais. Nós não fazemos intervenções médicas; apenas ativamos o potencial de equilíbrio que já existe em seu organismo."
        },
        {
            icon: <Sparkles className="w-10 h-10 text-amber-500" />,
            title: "Energia Transcendental",
            description: "Somos mais que matéria. Somos frequências vibrando em uma realidade complexa. A verdadeira saúde une o corpo físico à sua essência energética."
        }
    ];

    return (
        <section className="py-20 bg-white relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
            <div className="absolute -left-20 top-40 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute -right-20 top-40 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
                        A Ciência do <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Equilíbrio</span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Não acreditamos em separação. A fé é a intuição do que a ciência está começando a comprovar.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                    {pillars.map((pillar, index) => (
                        <div
                            key={index}
                            className="group relative bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-purple-200 top-0 hover:-top-2"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                            <div className="relative z-10">
                                <div className="mb-6 inline-block p-4 bg-gray-50 rounded-2xl group-hover:bg-white group-hover:shadow-md transition-all duration-300 transform group-hover:scale-110">
                                    {pillar.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-purple-700 transition-colors">
                                    {pillar.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {pillar.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
