import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FileIcon, UploadIcon, Info } from "lucide-react";
import SubmissionGuidelines from "../components/SubmissionGuidelines";

const SubmitPage = () => {
    const { t } = useTranslation();
    const [fileName, setFileName] = useState("");
    const [showGuidelinesModal, setShowGuidelinesModal] = useState(false);

    return (
        <div className="min-h-screen bg-[#12131A]">
            <header className="relative h-screen">
                <div className="absolute inset-0 bg-[radial-gradient(#ff000033_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div
                        className="absolute inset-0 opacity-20"
                        style={{
                            background: `url('/images/gramsci-bg.jpg') no-repeat center center`,
                            backgroundSize: 'cover',
                            filter: 'brightness(0.7) contrast(1.2)',
                            mixBlendMode: 'soft-light'
                        }}
                    ></div>
                </div>

                

                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <div className="text-center space-y-8 max-w-4xl px-4 mb-16">
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">Submit Your Work</h1>
                        <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
                            "Every social class creates its own organic intellectuals."
                        </p>
                    </div>

                    <div className="input-div">
                        <input className="input" name="file" type="file" />
                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" strokeLinejoin="round" strokeLinecap="round" viewBox="0 0 24 24" strokeWidth="2" fill="none" stroke="currentColor" className="icon">
                            <polyline points="16 16 12 12 8 16"></polyline>
                            <line y2="21" x2="12" y1="12" x1="12"></line>
                            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path>
                            <polyline points="16 16 12 12 8 16"></polyline>
                        </svg>
                    </div>
                </div>
            </header>

            {/* Submission Form Section */}
            <section className="container mx-auto px-4 py-16">
                <div className="max-w-3xl mx-auto bg-black/30 backdrop-blur-sm p-8 rounded-lg border border-red-900/20">
                    {/* Guidelines Button */}
                    <div className="flex justify-end space-x-4 mb-6">
                        <button
                            onClick={() => setShowGuidelinesModal(true)}
                            className="flex items-center space-x-2 text-red-500 hover:text-red-400 transition-colors"
                        >
                            <Info className="w-5 h-5" />
                            <span>View Submission Guidelines</span>
                        </button>
                    </div>

                    {/* Form content remains the same */}
                    <form className="space-y-6">
                        {/* Category Selection */}
                        <div>
                            <label className="block text-white mb-2">Category</label>
                            <select className="w-full bg-black/50 border border-red-900/30 text-white rounded p-3 focus:border-red-500 transition-colors">
                                <option value="theory">Theory</option>
                                <option value="analysis">Analysis</option>
                                <option value="critique">Critique</option>
                                <option value="research">Research</option>
                            </select>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-white mb-2">Title</label>
                            <input 
                                type="text"
                                className="w-full bg-black/50 border border-red-900/30 text-white rounded p-3 focus:border-red-500 transition-colors"
                                placeholder="Enter your work's title"
                            />
                        </div>

                        {/* Abstract */}
                        <div>
                            <label className="block text-white mb-2">Abstract</label>
                            <textarea 
                                className="w-full bg-black/50 border border-red-900/30 text-white rounded p-3 focus:border-red-500 transition-colors h-32"
                                placeholder="Provide a brief abstract of your work"
                            />
                        </div>

                        {/* Keywords */}
                        <div>
                            <label className="block text-white mb-2">Keywords</label>
                            <input 
                                type="text"
                                className="w-full bg-black/50 border border-red-900/30 text-white rounded p-3 focus:border-red-500 transition-colors"
                                placeholder="Enter keywords separated by commas"
                            />
                        </div>

                        {/* File Upload Section */}
                        <div className="space-y-4">
                            <label className="block text-white mb-2">Upload Files</label>
                            <div className="flex items-center justify-center">
                                <div className="input-div">
                                    <input className="input" name="file" type="file" multiple />
                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" strokeLinejoin="round" strokeLinecap="round" viewBox="0 0 24 24" strokeWidth="2" fill="none" stroke="currentColor" className="icon"><polyline points="16 16 12 12 8 16"></polyline><line y2="21" x2="12" y1="12" x1="12"></line><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path><polyline points="16 16 12 12 8 16"></polyline></svg>
                                </div>
                            </div>
                            <p className="text-gray-400 text-sm text-center mt-2">
                                Supported formats: PDF, DOCX, MD (Max size: 10MB)
                            </p>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-center pt-6">
                            <button 
                                type="submit"
                                className="bg-red-600 text-white px-8 py-3 rounded-full hover:bg-red-700 transition-colors inline-flex items-center space-x-2"
                            >
                                <span>Submit Work</span>
                            </button>
                        </div>
                    </form>
                </div>
            </section>

            {/* Guidelines Modal */}
            <SubmissionGuidelines isOpen={showGuidelinesModal} onClose={() => setShowGuidelinesModal(false)} />

            

            <style jsx>{`
                .input-div {
                    position: relative;
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    border: 2px solid rgb(255, 0, 0);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    overflow: hidden;
                    box-shadow: 0px 0px 100px rgb(255, 0, 0), 
                               inset 0px 0px 10px rgb(255, 0, 0),
                               0px 0px 5px rgb(255, 255, 255);
                    animation: flicker 2s linear infinite;
                }

                .icon {
                    color: rgb(255, 0, 0);
                    font-size: 2rem;
                    cursor: pointer;
                    animation: iconflicker 2s linear infinite;
                }

                .input {
                    position: absolute;
                    opacity: 0;
                    width: 100%;
                    height: 100%;
                    cursor: pointer !important;
                }

                @keyframes flicker {
                    0% {
                        border: 2px solid rgb(255, 0, 0);
                        box-shadow: 0px 0px 100px rgb(255, 0, 0),
                                  inset 0px 0px 10px rgb(255, 0, 0),
                                  0px 0px 5px rgb(255, 255, 255);
                    }
                    5% {
                        border: none;
                        box-shadow: none;
                    }
                    10% {
                        border: 2px solid rgb(255, 0, 0);
                        box-shadow: 0px 0px 100px rgb(255, 0, 0),
                                  inset 0px 0px 10px rgb(255, 0, 0),
                                  0px 0px 5px rgb(255, 255, 255);
                    }
                    25% {
                        border: none;
                        box-shadow: none;
                    }
                    30% {
                        border: 2px solid rgb(255, 0, 0);
                        box-shadow: 0px 0px 100px rgb(255, 0, 0),
                                  inset 0px 0px 10px rgb(255, 0, 0),
                                  0px 0px 5px rgb(255, 255, 255);
                    }
                    100% {
                        border: 2px solid rgb(255, 0, 0);
                        box-shadow: 0px 0px 100px rgb(255, 0, 0),
                                  inset 0px 0px 10px rgb(255, 0, 0),
                                  0px 0px 5px rgb(255, 255, 255);
                    }
                }

                @keyframes iconflicker {
                    0% { opacity: 1; }
                    5% { opacity: 0.2; }
                    10% { opacity: 1; }
                    25% { opacity: 0.2; }
                    30% { opacity: 1; }
                    100% { opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default SubmitPage;