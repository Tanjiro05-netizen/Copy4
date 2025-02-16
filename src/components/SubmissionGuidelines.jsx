import React from 'react';
import { X, FileText, Quote, Users, BookOpen, FileCheck } from 'lucide-react';

const AcademicGuidelines = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-[#12131A] w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-lg border border-red-900/20">
                <div className="sticky top-0 bg-[#12131A] p-4 border-b border-red-900/20 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white">Academic Research Guidelines</h2>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-red-900/20 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 text-red-500" />
                    </button>
                </div>
                <div className="p-6 space-y-8">
                    {/* Document Structure */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <FileText className="w-6 h-6 text-red-500" />
                            <h3 className="text-xl text-red-500 font-semibold">Document Structure</h3>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-black/30 p-4 rounded-lg">
                                <h4 className="font-semibold text-white mb-3">Basic Formatting</h4>
                                <div className="space-y-2 text-gray-300">
                                    <p>• Font: Times New Roman, Arial, or Calibri (12pt)</p>
                                    <p>• Headings: 14pt bold</p>
                                    <p>• Line spacing: 1.5 or double-spaced</p>
                                    <p>• Margins: 2.54 cm (1 inch) all sides</p>
                                    <p>• Alignment: Left-aligned or justified</p>
                                    <p>• Page numbers: Top or bottom right</p>
                                </div>
                            </div>
                            <div className="bg-black/30 p-4 rounded-lg">
                                <h4 className="font-semibold text-white mb-3">Components Order</h4>
                                <div className="space-y-2 text-gray-300">
                                    <p>1. Title page</p>
                                    <p>2. Abstract (150-250 words)</p>
                                    <p>3. Keywords (4-6 terms)</p>
                                    <p>4. Table of contents</p>
                                    <p>5. Main text body</p>
                                    <p>6. References</p>
                                    <p>7. Appendices</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Citation Systems */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <Quote className="w-6 h-6 text-red-500" />
                            <h3 className="text-xl text-red-500 font-semibold">Citation Systems</h3>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="bg-black/30 p-4 rounded-lg">
                                <h4 className="font-semibold text-white mb-3">APA (7th Edition)</h4>
                                <div className="text-gray-300 text-sm">
                                    <p>• In-text: (Author, Year, p. X)</p>
                                    <p>• Reference: Author, A. A. (Year). Title. Publisher.</p>
                                    <p>• Used in: Social sciences</p>
                                </div>
                            </div>
                            <div className="bg-black/30 p-4 rounded-lg">
                                <h4 className="font-semibold text-white mb-3">Chicago (17th Edition)</h4>
                                <div className="text-gray-300 text-sm">
                                    <p>• Notes and Bibliography System</p>
                                    <p>• Author-Date System available</p>
                                    <p>• Used in: Humanities</p>
                                </div>
                            </div>
                            <div className="bg-black/30 p-4 rounded-lg">
                                <h4 className="font-semibold text-white mb-3">MLA (9th Edition)</h4>
                                <div className="text-gray-300 text-sm">
                                    <p>• In-text: (Author Page)</p>
                                    <p>• Reference: Author. Title. Publisher, Year.</p>
                                    <p>• Used in: Literature, arts</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Technical Requirements */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <FileCheck className="w-6 h-6 text-red-500" />
                            <h3 className="text-xl text-red-500 font-semibold">Technical Requirements</h3>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-black/30 p-4 rounded-lg">
                                <h4 className="font-semibold text-white mb-3">File Specifications</h4>
                                <div className="space-y-2 text-gray-300">
                                    <p>• Submission: PDF or DOCX</p>
                                    <p>• Figures: TIFF, JPEG (300 dpi min)</p>
                                    <p>• Tables: Editable format</p>
                                    <p>• Word count: 5,000-8,000 typical</p>
                                    <p>• References: 40-60 typical</p>
                                </div>
                            </div>
                            <div className="bg-black/30 p-4 rounded-lg">
                                <h4 className="font-semibold text-white mb-3">Language Requirements</h4>
                                <div className="space-y-2 text-gray-300">
                                    <p>• Primary text in submission language</p>
                                    <p>• Abstract in English (if different)</p>
                                    <p>• Technical terms defined at first use</p>
                                    <p>• Consistent terminology throughout</p>
                                    <p>• Professional academic language</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Review Process */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <Users className="w-6 h-6 text-red-500" />
                            <h3 className="text-xl text-red-500 font-semibold">Review Process</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-black/30 p-4 rounded-lg">
                                <h4 className="font-semibold text-white mb-2">Required Documents</h4>
                                <div className="grid md:grid-cols-2 gap-4 text-gray-300">
                                    <div>
                                        <p>• Cover letter</p>
                                        <p>• Manuscript</p>
                                        <p>• Figures (separate files)</p>
                                        <p>• Tables (separate files)</p>
                                    </div>
                                    <div>
                                        <p>• Supplementary materials</p>
                                        <p>• Author agreement forms</p>
                                        <p>• Ethics approval documents</p>
                                        <p>• Data availability statement</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Ethical Requirements */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <BookOpen className="w-6 h-6 text-red-500" />
                            <h3 className="text-xl text-red-500 font-semibold">Ethical Requirements</h3>
                        </div>
                        <div className="bg-black/30 p-4 rounded-lg">
                            <div className="space-y-2 text-gray-300">
                                <p>• Plagiarism check required</p>
                                <p>• Ethics committee approval when applicable</p>
                                <p>• Conflict of interest declaration</p>
                                <p>• Funding source disclosure</p>
                                <p>• Author contributions statement</p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default AcademicGuidelines;