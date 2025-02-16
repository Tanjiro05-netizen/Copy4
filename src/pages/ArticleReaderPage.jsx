import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import { Clock, BookOpen, Quote, MessageSquare, Share2, Download, ChevronLeft, ChevronRight, Bookmark, FileText, ExternalLink, Copy } from 'lucide-react';

const ArticleReaderPage = () => {
    const { articleId } = useParams();
    const [article, setArticle] = useState(null);
    const [activeSection, setActiveSection] = useState(0);

    useEffect(() => {
        const loadArticle = async () => {
            try {
                const articleData = await import(`../data/articles/${articleId}-full.json`);
                setArticle(articleData.default);
            } catch (error) {
                console.error('Error loading article:', error);
            }
        };

        loadArticle();
    }, [articleId]);

    if (!article) {
        return (
            <div className="min-h-screen bg-[#12131A] flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#12131A]">
            <Header />
            
            <main className="container mx-auto px-4 py-16">
                {/* Article Header */}
                <div className="max-w-4xl mx-auto mb-12">
                    <div className="text-red-500 text-sm mb-2">{article.category}</div>
                    <h1 className="text-4xl font-bold text-white mb-4">{article.title}</h1>
                    
                    <div className="flex items-center space-x-4 text-gray-400 text-sm mb-6">
                        <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{article.readTime}</span>
                        </div>
                        <div className="flex items-center">
                            <Quote className="w-4 h-4 mr-1" />
                            <span>{article.citations} citations</span>
                        </div>
                        <div className="flex items-center">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            <span>{article.comments} comments</span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 mb-6">
                        {article.keywords.map((keyword, index) => (
                            <span key={index} className="text-xs bg-red-900/20 text-red-400 px-2 py-1 rounded">
                                {keyword}
                            </span>
                        ))}
                    </div>

                    <div className="text-gray-400 mb-8">
                        <p className="text-sm">By {article.author} • {article.date}</p>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-gray-300">{article.content.abstract}</p>
                    </div>
                </div>

                {/* Article Navigation */}
                <div className="flex gap-8 max-w-6xl mx-auto">
                    {/* Table of Contents */}
                    <div className="w-64 hidden lg:block">
                        <div className="sticky top-8">
                            <h3 className="text-white font-semibold mb-4">Table of Contents</h3>
                            <nav className="space-y-2">
                                {article.content.sections.map((section, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setActiveSection(index)}
                                        className={`block text-sm w-full text-left px-3 py-2 rounded transition-colors ${
                                            activeSection === index
                                                ? 'bg-red-900/20 text-red-400'
                                                : 'text-gray-400 hover:text-white'
                                        }`}
                                    >
                                        {section.title}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 max-w-4xl">
                        
                        <div className="fixed left-8 top-1/2 transform -translate-y-1/2 flex flex-col space-y-4">
                            <button className="p-3 bg-black/50 text-white rounded-lg hover:bg-red-600/20 hover:text-red-400 transition-colors group">
                                <Bookmark className="w-5 h-5" />
                                <span className="absolute left-full ml-2 bg-black/80 text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100">
                                    Save Article
                                </span>
                            </button>
                            <button className="p-3 bg-black/50 text-white rounded-lg hover:bg-red-600/20 hover:text-red-400 transition-colors group">
                                <Quote className="w-5 h-5" />
                                <span className="absolute left-full ml-2 bg-black/80 text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100">
                                    Cite Article
                                </span>
                            </button>
                            <button className="p-3 bg-black/50 text-white rounded-lg hover:bg-red-600/20 hover:text-red-400 transition-colors group">
                                <FileText className="w-5 h-5" />
                                <span className="absolute left-full ml-2 bg-black/80 text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100">
                                    Export PDF
                                </span>
                            </button>
                        </div>
                    
                        <div className="fixed top-0 left-0 w-full h-1 bg-black/30">
                            <div 
                                className="h-full bg-red-600 transition-all duration-300"
                                style={{ width: `${(activeSection / (article.content.sections.length - 1)) * 100}%` }}
                            ></div>
                        </div>
                        <div className="prose prose-invert max-w-none">
                            {article.content.sections.map((section, index) => (
                                <section key={index} className="mb-12">
                                    <h2 className="text-2xl font-bold text-white mb-4">{section.title}</h2>
                                    <p className="text-gray-300">{section.content}</p>
                                </section>
                            ))}

                            {/* References */}
                          
                            <section className="mt-16 bg-black/30 border border-red-900/20 rounded-lg p-6">
                                <h2 className="text-2xl font-bold text-white mb-6">References</h2>
                                <div className="space-y-4">
                                    {article.content.references.map((reference, index) => (
                                        <div key={index} className="flex items-start space-x-4 text-gray-300 p-4 hover:bg-black/30 rounded-lg group">
                                            <div className="text-gray-500">[{index + 1}]</div>
                                            <div className="flex-1">
                                                <div>{reference.author} ({reference.year}). <span className="italic">{reference.title}</span>. {reference.publisher}.</div>
                                                <div className="mt-2 flex items-center space-x-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="text-sm text-red-400 hover:text-red-500 flex items-center">
                                                        <ExternalLink className="w-4 h-4 mr-1" /> View Source
                                                    </button>
                                                    <button className="text-sm text-red-400 hover:text-red-500 flex items-center">
                                                        <Copy className="w-4 h-4 mr-1" /> Copy Citation
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>

                {/* Navigation Controls */}
                <div className="fixed bottom-8 right-8 flex space-x-4">
                    <button
                        onClick={() => setActiveSection(Math.max(0, activeSection - 1))}
                        className="p-3 bg-black/50 text-white rounded-full hover:bg-red-600 transition-colors"
                        disabled={activeSection === 0}
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={() => setActiveSection(Math.min(article.content.sections.length - 1, activeSection + 1))}
                        className="p-3 bg-black/50 text-white rounded-full hover:bg-red-600 transition-colors"
                        disabled={activeSection === article.content.sections.length - 1}
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
            </main>
        </div>
    );
};

export default ArticleReaderPage;