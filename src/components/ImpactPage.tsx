import React from 'react';

export const ImpactPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-gray-200">
            <div className="max-w-4xl mx-auto px-6 py-24">
                {/* Header / Nav Placeholder */}
                <div className="mb-24 border-b border-gray-100 pb-6 flex justify-between items-center">
                    <div className="font-bold text-xl tracking-tight text-gray-900">XZenPress</div>
                    <div className="text-sm font-medium text-gray-500">Institutional Gateway</div>
                </div>

                {/* Section 1: Headline */}
                <section className="mb-24">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-6 text-gray-900">
                        A Scalable Platform Expanding Economic Opportunity for Underserved Communities
                    </h1>
                    <div className="w-24 h-1 bg-black mb-8"></div>
                </section>

                {/* Section 2: Problem */}
                <section className="mb-20 grid grid-cols-1 md:grid-cols-12 gap-8">
                    <div className="md:col-span-3">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">The Problem</h2>
                    </div>
                    <div className="md:col-span-9">
                        <p className="text-xl md:text-2xl font-light text-gray-700 leading-relaxed">
                            Millions of people remain excluded from formal employment systems due to structural barriers, lack of access, and inefficient matching mechanisms.
                        </p>
                    </div>
                </section>

                {/* Section 3: Solution */}
                <section className="mb-20 grid grid-cols-1 md:grid-cols-12 gap-8">
                    <div className="md:col-span-3">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">The Solution</h2>
                    </div>
                    <div className="md:col-span-9">
                        <p className="text-lg text-gray-800 leading-relaxed border-l-4 border-gray-900 pl-6">
                            XZenPress operates a digital platform that connects individuals to verified income-generating opportunities, enabling fast deployment, local adaptation, and measurable impact.
                        </p>
                    </div>
                </section>

                {/* Section 4: Impact Metrics */}
                <section className="mb-24 bg-gray-50 p-10 rounded-sm">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Structure</h3>
                            <p className="text-3xl font-bold text-gray-900">Platform-Driven</p>
                            <p className="text-sm text-gray-600 mt-1">Operational Scalability</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Deployment</h3>
                            <p className="text-3xl font-bold text-gray-900">Rapid</p>
                            <p className="text-sm text-gray-600 mt-1">Logistics & Adaptation</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Focus</h3>
                            <p className="text-3xl font-bold text-gray-900">Economic</p>
                            <p className="text-sm text-gray-600 mt-1">Measurable Inclusion</p>
                        </div>
                    </div>
                </section>

                {/* Section 5: Governance Signals */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-gray-100 pt-16">
                    <div>
                        <h3 className="font-bold text-lg mb-4">Key Performance Indicators</h3>
                        <ul className="space-y-3 text-gray-600 font-medium">
                            <li className="flex items-center">
                                <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                                Average income increase per participant
                            </li>
                            <li className="flex items-center">
                                <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                                Time to first earning opportunity
                            </li>
                            <li className="flex items-center">
                                <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                                Cost per beneficiary
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-4">Contact for Proposals</h3>
                        <p className="text-gray-600 mb-6">
                            For detailed impact reports and partnership inquiries, please contact our institutional relations office.
                        </p>
                        <a href="mailto:institutional@xzenpress.com" className="inline-block bg-black text-white px-8 py-3 font-semibold text-sm uppercase tracking-wider hover:bg-gray-800 transition-colors">
                            Request Impact Brief
                        </a>
                    </div>
                </section>

                <footer className="mt-32 pt-8 border-t border-gray-200 text-center text-gray-400 text-xs">
                    © {new Date().getFullYear()} XZenPress Institutional. All rights reserved. Access restricted to authorized partners.
                </footer>
            </div>
        </div>
    );
};
