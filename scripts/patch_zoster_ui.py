import sys

FILE = r"C:\Users\Alexandre\.gemini\antigravity\scratch\XzenpressManus-GitHub\src\pages\ZosterMapPage.tsx"

with open(FILE, encoding="utf-8") as f:
    content = f.read()

# Find the TABS HEADER marker
marker = "{/* TABS HEADER */}"
if marker not in content:
    print("ERROR: Could not find TABS HEADER marker")
    sys.exit(1)

# Also find the end marker: the line "{activeTab === 'body' && ("
end_marker = "{activeTab === 'body' && ("
if end_marker not in content:
    print("ERROR: Could not find end marker")
    sys.exit(1)

# Find start and end indices
start = content.index(marker)
# Find the last occurrence before start (there should only be one) - use from marker start
end = content.index(end_marker, start)
end_pos = end + len(end_marker)

print(f"Replacing chars {start} to {end_pos}")
print("OLD snippet:", repr(content[start:start+80]))

NEW_BLOCK = """                {/* HERPES TYPE SELECTOR */}
                <div className="flex justify-center">
                    <div className="bg-gray-900 p-1 rounded-full border border-gray-700 flex gap-1">
                        <button onClick={() => { setHerpesType('zoster'); setSelectedRegion(null); }}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${herpesType === 'zoster' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >Zoster (VZV)</button>
                        <button onClick={() => setHerpesType('labial')}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${herpesType === 'labial' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >Labial (HSV-1)</button>
                        <button onClick={() => setHerpesType('genital')}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${herpesType === 'genital' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >Genital (HSV-2)</button>
                    </div>
                </div>

                {/* HSV-1 / HSV-2 Protocol Cards */}
                {herpesType !== 'zoster' && (
                    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className={`bg-gradient-to-br ${herpesType === 'labial' ? 'from-red-950 to-gray-900 border-red-500/40' : 'from-purple-950 to-gray-900 border-purple-500/40'} rounded-xl p-6 border shadow-xl space-y-4`}>
                            <div className="flex items-center gap-3 mb-2">
                                <div>
                                    <h2 className="text-xl font-bold text-white">
                                        {herpesType === 'labial' ? 'Herpes Labial (HSV-1)' : 'Herpes Genital (HSV-2)'}
                                    </h2>
                                    <p className="text-sm text-gray-400">
                                        {herpesType === 'labial'
                                            ? 'Protagonista: Ponto Sensorial Boca + NC Trig\u00eameo'
                                            : 'Protagonista: NC1 Rim + Eixo Jing / Sacral'}
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                                {(herpesType === 'labial'
                                    ? [
                                        { label: 'Sensorial Boca', role: 'Protagonista' },
                                        { label: 'NC5 Trig\u00eameo', role: 'Gate Control' },
                                        { label: 'NC1 Rim / Jing', role: 'Imunidade' },
                                        { label: 'VC17 Timo', role: 'C\u00e9lulas T' },
                                        { label: 'ZS Hormonal', role: 'Reset NK' },
                                        { label: 'Y-F\u00edgado/Vago', role: 'Sist\u00eamico' },
                                    ] : [
                                        { label: 'NC1 Rim / Jing', role: 'Protagonista' },
                                        { label: 'ZS Hormonal', role: 'Reset NK' },
                                        { label: 'BP6 Sanyinjiao', role: 'Ginecol\u00f3gico' },
                                        { label: 'VC17 Timo', role: 'C\u00e9lulas T' },
                                        { label: 'Y-F\u00edgado/Vago', role: 'Sist\u00eamico' },
                                        { label: 'NC5 Trig\u00eameo', role: 'Gate Control' },
                                    ]
                                ).map((p, i) => (
                                    <div key={i} className="bg-black/40 rounded-lg p-3 border border-gray-700 flex flex-col items-center text-center">
                                        <span className="font-semibold text-blue-200 text-xs mb-1">{p.label}</span>
                                        <span className="text-gray-500 text-xs">{p.role}</span>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => startHSVTherapy(herpesType as 'labial' | 'genital')}
                                className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${herpesType === 'labial' ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'} text-white`}
                            >
                                Iniciar Protocolo {herpesType === 'labial' ? 'HSV-1' : 'HSV-2'} (6 pontos)
                            </button>
                        </div>
                    </section>
                )}

                {/* TABS - apenas para Zoster */}
                {herpesType === 'zoster' && (
                <div className="flex justify-center mb-6">
                    <div className="bg-gray-900 p-1 rounded-full border border-gray-700 flex">
                        <button onClick={() => setActiveTab('body')}
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'body' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >Corpo & Derm\u00e1tomos</button>
                        <button onClick={() => setActiveTab('head')}
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'head' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >Cabe\u00e7a YNSA (Sist\u00eamico)</button>
                    </div>
                </div>)}

                {herpesType === 'zoster' && activeTab === 'body' && ("""

new_content = content[:start] + NEW_BLOCK + content[end_pos:]

with open(FILE, "w", encoding="utf-8") as f:
    f.write(new_content)

print("SUCCESS: UI block replaced with herpes type selector.")
print(f"New file size: {len(new_content)} chars (was {len(content)} chars)")
