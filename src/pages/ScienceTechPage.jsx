import React, { useState } from 'react';

import CourseBrowser from '../components/ScienceTech/CourseBrowser';
import TextbookBrowser from '../components/ScienceTech/TextbookBrowser';
import NewsFeed from '../components/ScienceTech/NewsFeed';
import { GraduationCap, BookOpen, Newspaper } from 'lucide-react';
import * as s from './ScienceTechPage.css.ts';

const tabs = [
  { id: 'courses', label: 'Courses', icon: GraduationCap },
  { id: 'textbooks', label: 'Textbooks', icon: BookOpen },
  { id: 'news', label: 'News', icon: Newspaper },
];

const ScienceTechPage = () => {
  const [activeTab, setActiveTab] = useState('courses');

  const renderContent = () => {
    switch (activeTab) {
      case 'courses':
        return <CourseBrowser />;
      case 'textbooks':
        return <TextbookBrowser />;
      case 'news':
        return <NewsFeed />;
      default:
        return <CourseBrowser />;
    }
  };

  return (
    <div className={s.page}>
      <div className={s.hero}>
        <div className={s.heroInner}>
          <h1 className={s.heroTitleCn}>科学技术</h1>
          <h2 className={s.heroTitleEn}>Science & Technology</h2>
          <p className={s.heroDesc}>
            Master the fundamentals of physics, chemistry, mathematics, computer science, and medicine through interactive courses.
          </p>
        </div>
      </div>

      <div className={s.tabBar}>
        <div className={s.tabBarInner}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${s.tabBtn} ${activeTab === tab.id ? s.tabBtnActive : ''}`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className={s.content}>
        {renderContent()}
      </div>
    </div>
  );
};

export default ScienceTechPage;
