import React, { useState } from 'react';
import { X } from 'lucide-react';

// Reusable SVG Icon for the accordion arrow
const AccordionIcon = ({ isOpen }) => (
    <svg 
        className={`w-6 h-6 transform transition-transform text-red-300 ${isOpen ? 'rotate-180' : ''}`} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24" 
        xmlns="http://www.w3.org/2000/svg"
    >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
    </svg>
);

// Reusable Accordion Item Component
const AccordionItem = ({ title, children, isOpen, onClick }) => {
    return (
        <div className="bg-stone-900 border border-red-900/50 rounded-lg">
            <div className="flex justify-between items-center p-4 cursor-pointer" onClick={onClick}>
                <h2 className="text-xl font-semibold text-red-300">{title}</h2>
                <AccordionIcon isOpen={isOpen} />
            </div>
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-[2000px]' : 'max-h-0'}`}>
                <div className="p-4 border-t border-red-900/50">
                    {children}
                </div>
            </div>
        </div>
    );
};


// --- METHODOLOGICAL GUIDELINES COMPONENT ---
const MethodologicalGuidelines = () => {
    const [openAccordion, setOpenAccordion] = useState(null);

    const toggleAccordion = (index) => {
        setOpenAccordion(openAccordion === index ? null : index);
    };

    return (
        <>
            <h1 className="text-3xl font-bold text-center text-red-300 mb-6">Advanced Methodological & Theoretical Guidelines</h1>
            <AccordionItem title="I. Core Principles of Scientific Inquiry (All Submissions)" isOpen={openAccordion === 0} onClick={() => toggleAccordion(0)}>
                <p className="mb-4 text-gray-400">All submissions, regardless of discipline, must adhere to the following universal principles of scientific and scholarly rigor. These principles form the foundation of our collective's commitment to materialism and scientific inquiry.</p>
                <ul className="space-y-4">
                    <li className="flex items-start">
                        <span className="text-green-400 mr-3 mt-1">✓</span>
                        <div>
                            <h4 className="font-semibold text-gray-200">Materialist Grounding</h4>
                            <p className="text-gray-400">The analysis must be grounded in a material reality, whether it is the economic base of society, the physical processes of the natural world, or the axiomatic foundations of a formal system. The work must prioritize objective analysis over idealist speculation.</p>
                        </div>
                    </li>
                    <li className="flex items-start">
                         <span className="text-green-400 mr-3 mt-1">✓</span>
                        <div>
                            <h4 className="font-semibold text-gray-200">Analysis of System Dynamics and Contradiction</h4>
                            <p className="text-gray-400">Frameworks should treat their object of study as a dynamic system defined by internal processes and contradictions. The analysis must explain how opposing forces or tendencies drive development and transformation within the system.</p>
                        </div>
                    </li>
                    <li className="flex items-start">
                         <span className="text-green-400 mr-3 mt-1">✓</span>
                        <div>
                            <h4 className="font-semibold text-gray-200">Conceptual and Methodological Transparency</h4>
                            <p className="text-gray-400">All theoretical categories and methods must be explicitly defined and justified. Authors must demonstrate how their conclusions are derived logically from their premises and evidence.</p>
                        </div>
                    </li>
                    <li className="flex items-start">
                         <span className="text-green-400 mr-3 mt-1">✓</span>
                        <div>
                            <h4 className="font-semibold text-gray-200">Robust Evidentiary Basis & Critical Source Analysis</h4>
                            <p className="text-gray-400">Claims must be substantiated with high-quality, discipline-appropriate evidence (e.g., empirical data, historical archives, textual evidence, logical proofs). All sources must be critically evaluated for context and potential bias.</p>
                        </div>
                    </li>
                    <li className="flex items-start">
                         <span className="text-green-400 mr-3 mt-1">✓</span>
                        <div>
                            <h4 className="font-semibold text-gray-200">Engagement with Competing Paradigms</h4>
                            <p className="text-gray-400">Submissions must acknowledge and critically engage with the most plausible alternative explanations and existing literature within their field, demonstrating a comprehensive understanding of the scholarly landscape.</p>
                        </div>
                    </li>
                </ul>
            </AccordionItem>
            <AccordionItem title="II. Field-Specific Applications & Foundational Examples" isOpen={openAccordion === 1} onClick={() => toggleAccordion(1)}>
                <div className="space-y-6">
                    <p className="text-gray-400">The following sections illustrate how the core principles should be applied within specific domains. The texts mentioned are not universally required reading, but serve as benchmarks for the expected level of analytical depth and methodological rigor in that field.</p>
                    
                    <div>
                        <h3 className="font-bold text-lg text-red-300 mb-2">A. For Political Economy and Social Theory</h3>
                        <p className="text-gray-400">Submissions must analyze social phenomena based on the mode of production, class relations, and economic dynamics. Evidence should include economic data, policy analysis, and social statistics.
                        <br/><strong>Benchmark examples of method:</strong> K. Marx, <em>Das Kapital</em>; V.I. Lenin, <em>Imperialism, the Highest Stage of Capitalism</em>.</p>
                    </div>

                    <div>
                        <h3 className="font-bold text-lg text-red-300 mb-2">B. For Philosophical and Epistemological Inquiry</h3>
                        <p className="text-gray-400">Submissions must demonstrate rigorous conceptual analysis and logical coherence. Arguments should be situated within historical philosophical debates (e.g., materialism vs. idealism) and engage with contemporary findings from relevant sciences.
                        <br/><strong>Benchmark examples of method:</strong> K. Marx & F. Engels, <em>The German Ideology (Part I)</em>; F. Engels, <em>Anti-Dühring</em>; Papers like "On Free Will" that synthesize philosophy with neuroscience.</p>
                    </div>

                    <div>
                        <h3 className="font-bold text-lg text-red-300 mb-2">C. For Historical Analysis</h3>
                        <p className="text-gray-400">Submissions must apply historical materialist methods to specific events or periods, focusing on class struggle, technological change, and the relationship between base and superstructure. Evidence must be grounded in primary source documents and critical historiography.
                        <br/><strong>Benchmark examples of method:</strong> K. Marx, <em>The Eighteenth Brumaire of Louis Bonaparte</em>; F. Engels, <em>The Origin of the Family, Private Property and the State</em>.</p>
                    </div>

                    <div>
                        <h3 className="font-bold text-lg text-red-300 mb-2">D. For Natural and Formal Sciences</h3>
                        <p className="text-gray-400">Submissions should either present original research adhering to the scientific method (reproducibility, falsifiability) or provide a materialist critique/analysis of existing scientific fields. The analysis must engage with the current state of research and data in the relevant field.
                        <br/><strong>Benchmark examples of method:</strong> The formal, algebraic approach to social dynamics (e.g., Bordiga's "Passion and Algebra"); modern works in systems biology, computational neuroscience, or physics that explore dynamic systems and emergent properties.</p>
                    </div>
                </div>
            </AccordionItem>
        </>
    );
};

// --- FORMATTING GUIDELINES COMPONENT ---
const FormattingGuidelines = () => {
    const [openAccordion, setOpenAccordion] = useState(null);

    const toggleAccordion = (index) => {
        setOpenAccordion(openAccordion === index ? null : index);
    };

    return (
        <>
            <h1 className="text-3xl font-bold text-center text-red-300 mb-6">Official Submission & Formatting Guidelines</h1>
            <AccordionItem title="I. Document Structure & Formatting" isOpen={openAccordion === 0} onClick={() => toggleAccordion(0)}>
                 <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="font-semibold text-lg text-red-300 mb-2">Basic Formatting</h3>
                        <ul className="space-y-2 text-gray-400">
                            <li><strong>Font:</strong> Times New Roman, Arial, or Calibri (12pt)</li>
                            <li><strong>Headings:</strong> 14pt, bold</li>
                            <li><strong>Line Spacing:</strong> 1.5 or double-spaced</li>
                            <li><strong>Margins:</strong> 2.54 cm (1 inch) on all sides</li>
                            <li><strong>Alignment:</strong> Left-aligned or justified</li>
                            <li><strong>Page Numbers:</strong> Top or bottom right corner</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg text-red-300 mb-2">Component Order</h3>
                        <ol className="list-decimal list-inside space-y-2 text-gray-400">
                            <li>Title Page</li>
                            <li>Abstract (150-250 words)</li>
                            <li>Keywords (4-6 terms)</li>
                            <li>Table of Contents</li>
                            <li>Main Text Body</li>
                            <li>References</li>
                            <li>Appendices</li>
                        </ol>
                    </div>
                </div>
            </AccordionItem>
            <AccordionItem title="II. Citation Systems" isOpen={openAccordion === 1} onClick={() => toggleAccordion(1)}>
                <p className="mb-4 text-gray-400">Authors must adhere to one of the following citation systems consistently throughout the manuscript. Choose the system most appropriate for your discipline.</p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                        <h4 className="font-semibold text-gray-200">APA (7th Edition)</h4>
                        <p className="text-sm text-gray-400">In-text: (Author, Year, p. X)</p>
                        <p className="text-sm text-gray-400">Used in: Social sciences</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-200">Chicago (17th Edition)</h4>
                        <p className="text-sm text-gray-400">Notes & Bibliography or Author-Date</p>
                        <p className="text-sm text-gray-400">Used in: Humanities</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-200">MLA (9th Edition)</h4>
                        <p className="text-sm text-gray-400">In-text: (Author Page)</p>
                        <p className="text-sm text-gray-400">Used in: Literature, arts</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-200">IEEE</h4>
                        <p className="text-sm text-gray-400">In-text: [1]</p>
                        <p className="text-sm text-gray-400">Used in: Engineering, computer science</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-200">Vancouver</h4>
                        <p className="text-sm text-gray-400">In-text: (1) or [1]</p>
                        <p className="text-sm text-gray-400">Used in: Medicine, life sciences</p>
                    </div>
                </div>
            </AccordionItem>
            <AccordionItem title="III. Submission Package & Technical Specifications" isOpen={openAccordion === 2} onClick={() => toggleAccordion(2)}>
                 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div>
                        <h3 className="font-semibold text-lg text-red-300 mb-2">File Specifications</h3>
                        <ul className="space-y-2 text-gray-400">
                           <li><strong>Submission:</strong> PDF or DOCX</li>
                           <li><strong>Figures:</strong> TIFF, JPEG (300 dpi min)</li>
                           <li><strong>Tables:</strong> Editable format (not images)</li>
                           <li><strong>Word Count:</strong> 5,000–8,000 typical</li>
                           <li><strong>References:</strong> 40–60 typical</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg text-red-300 mb-2">Language Requirements</h3>
                        <ul className="space-y-2 text-gray-400">
                           <li>Primary text in submission language</li>
                           <li>Abstract must be provided in English</li>
                           <li>Technical terms defined at first use</li>
                           <li>Consistent terminology throughout</li>
                           <li>Professional, academic language required</li>
                        </ul>
                    </div>
                     <div>
                        <h3 className="font-semibold text-lg text-red-300 mb-2">Required Documents</h3>
                        <ul className="space-y-2 text-gray-400">
                           <li>Cover Letter</li>
                           <li>Manuscript (anonymized if required)</li>
                           <li>Figures (as separate files)</li>
                           <li>Tables (as separate files)</li>
                           <li>Author & Ethics Forms</li>
                           <li>Data Availability Statement</li>
                        </ul>
                    </div>
                </div>
            </AccordionItem>
            <AccordionItem title="IV. Ethical Conduct & Integrity" isOpen={openAccordion === 3} onClick={() => toggleAccordion(3)}>
                <p className="mb-4 text-gray-400">Adherence to the highest ethical standards is mandatory. All submissions will undergo checks for the following.</p>
                <ul className="list-disc list-inside space-y-3 text-gray-300">
                    <li><strong>Plagiarism:</strong> All submissions will be processed through plagiarism detection software. Originality is required.</li>
                    <li><strong>Ethics Committee Approval:</strong> For research involving human or animal subjects, official approval documentation from an ethics committee is mandatory.</li>
                    <li><strong>Conflict of Interest:</strong> Authors must declare any potential financial or non-financial conflicts of interest that could be perceived to bias their work.</li>
                    <li><strong>Funding Source Disclosure:</strong> All sources of funding for the research must be explicitly stated.</li>
                    <li><strong>Author Contributions:</strong> A statement detailing the specific contributions of each author to the manuscript is required.</li>
                </ul>
            </AccordionItem>
        </>
    );
};


// --- MAIN MODAL COMPONENT ---
const SubmissionGuidelines = ({ isOpen, onClose }) => {
    const [activeView, setActiveView] = useState('methodological'); // 'methodological' or 'submission'

    if (!isOpen) return null;

    const commonButtonStyles = "px-4 py-2 rounded-md transition-colors duration-200";
    const activeButtonStyles = "bg-red-500 text-white";
    const inactiveButtonStyles = "bg-stone-800 text-gray-300 hover:bg-stone-700";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-black border border-red-900/50 rounded-lg shadow-lg p-6 w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex justify-end mb-4">
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="flex-grow overflow-y-auto pr-4" style={{ fontFamily: "'Inter', sans-serif" }}>
                    <div className="max-w-4xl mx-auto">
                        <div className="flex justify-center mb-8 bg-stone-900 border border-red-900/50 p-2 rounded-lg space-x-2">
                            <button 
                                onClick={() => setActiveView('methodological')} 
                                className={`${commonButtonStyles} ${activeView === 'methodological' ? activeButtonStyles : inactiveButtonStyles}`}
                            >
                                Methodological Guidelines
                            </button>
                            <button 
                                onClick={() => setActiveView('submission')} 
                                className={`${commonButtonStyles} ${activeView === 'submission' ? activeButtonStyles : inactiveButtonStyles}`}
                            >
                                Submission Guidelines
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            {activeView === 'methodological' ? <MethodologicalGuidelines /> : <FormattingGuidelines />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SubmissionGuidelines;