import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Check,
  ChevronRight,
  Flag,
  Globe,
  Image as ImageIcon,
  Landmark,
  Newspaper,
  Scale,
  Search,
  Sparkles,
  Users,
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import './PoliticsPage.css';
import * as s from './PoliticsPage.css.ts';

const categories = [
  { id: 'all', name: 'All Fronts', icon: Globe },
  { id: 'analysis', name: 'Political Analysis', icon: Scale },
  { id: 'movements', name: 'Movements', icon: Users },
  { id: 'international', name: 'International', icon: Flag },
  { id: 'theory', name: 'Theory', icon: Landmark },
];

const floralCategoryHints = new Set(['culture', 'community', 'society', 'local', 'movement']);

const fallbackExcerpt = (content) => {
  if (typeof content !== 'string' || !content.trim()) return 'No excerpt available for this dispatch yet.';
  return `${content.trim().slice(0, 180)}...`;
};

const formatDate = (value) => {
  if (!value) return 'Undated';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Undated';
  return parsed.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatIssueCode = (dateValue) => {
  const y = dateValue.getFullYear();
  const m = `${dateValue.getMonth() + 1}`.padStart(2, '0');
  const d = `${dateValue.getDate()}`.padStart(2, '0');
  return `${y}.${m}.${d}`;
};

const compactHeadline = (title, maxLength = 72) => {
  if (!title || title.length <= maxLength) return title;
  return `${title.slice(0, maxLength - 1)}...`;
};

const inferPlacement = (index) => {
  if (index === 0) return 'lead';
  if (index <= 4) return 'side';
  if (index <= 8) return 'bulletin';
  return 'late_edition';
};

const normalizePlacement = (placement, index) => {
  const normalized = `${placement || ''}`.trim().toLowerCase();
  if (['lead', 'side', 'bulletin', 'late_edition'].includes(normalized)) {
    return normalized;
  }
  return inferPlacement(index);
};

const editionDatePattern = /^\d{4}-\d{2}-\d{2}$/;

const isValidEditionDate = (value) => {
  if (!value || !editionDatePattern.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return false;
  return parsed.toISOString().slice(0, 10) === value;
};

const getTodayEditionDate = () => new Date().toISOString().slice(0, 10);

const getYesterdayEditionDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
};

const PoliticsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const editionQueryParam = searchParams.get('edition');
  const todayEditionDate = getTodayEditionDate();
  const yesterdayEditionDate = useMemo(() => getYesterdayEditionDate(), []);

  const [activeCategory, setActiveCategory] = useState('all');
  const [digestMode, setDigestMode] = useState('world');
  const [searchQuery, setSearchQuery] = useState('');
  const [editionDate, setEditionDate] = useState(
    isValidEditionDate(editionQueryParam) ? editionQueryParam : todayEditionDate
  );
  const [editionArchiveDates, setEditionArchiveDates] = useState([]);
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuizOption, setSelectedQuizOption] = useState('');
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => {
    if (!isValidEditionDate(editionQueryParam)) return;
    if (editionQueryParam === editionDate) return;
    setEditionDate(editionQueryParam);
  }, [editionDate, editionQueryParam]);

  useEffect(() => {
    if (!isValidEditionDate(editionDate)) return;
    if (editionDate === editionQueryParam) return;

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('edition', editionDate);
    setSearchParams(nextParams, { replace: true });
  }, [editionDate, editionQueryParam, searchParams, setSearchParams]);

  useEffect(() => {
    const fetchEditionArchive = async () => {
      try {
        const { data, error: archiveError } = await supabase
          .from('politics_articles')
          .select('edition_date')
          .order('edition_date', { ascending: false, nullsFirst: false })
          .limit(120);

        if (archiveError) throw archiveError;

        const uniqueDates = Array.from(
          new Set((data || []).map((item) => item.edition_date).filter((value) => isValidEditionDate(value)))
        );

        setEditionArchiveDates(uniqueDates);
      } catch (archiveLoadError) {
        console.error('Error fetching edition archive:', archiveLoadError);
      }
    };

    fetchEditionArchive();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let query = supabase
          .from('politics_articles')
          .select('*')
          .or('status.eq.published,status.is.null')
          .eq('edition_date', editionDate)
          .order('edition_date', { ascending: false, nullsFirst: false })
          .order('created_at', { ascending: false });

        if (searchQuery) {
          query = query.ilike('title', `%${searchQuery}%`);
        }
        if (activeCategory !== 'all') {
          query = query.eq('category', activeCategory);
        }

        const { data, error: fetchError } = await query;
        if (fetchError) throw fetchError;
        setArticles(data || []);
      } catch (err) {
        console.error('Error fetching politics articles:', err);
        setError('Failed to print today\'s edition. Please try again.');
        setArticles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeCategory, editionDate, searchQuery]);

  const normalizedArticles = useMemo(
    () =>
      (articles || []).map((article, index) => {
        const category = `${article.category || article.section || 'analysis'}`.toLowerCase();
        const categoryLabel = category.replace(/[_-]+/g, ' ');
        const digestType =
          article.digest_type ||
          (Array.from(floralCategoryHints).some((hint) => category.includes(hint)) ? 'floral' : 'world');

        return {
          id: article.id || `dispatch-${index}`,
          slug: article.slug || article.id || `dispatch-${index}`,
          title: article.title || article.headline || article.name || `Untitled Dispatch ${index + 1}`,
          excerpt:
            article.excerpt || article.summary || article.description || fallbackExcerpt(article.content),
          category,
          categoryLabel,
          source: article.source || article.author || 'Editorial Desk',
          imageUrl:
            article.image_url ||
            article.cover_image ||
            article.thumbnail_url ||
            article.hero_image ||
            null,
          createdAt: article.created_at || article.published_at || article.date || null,
          digestType,
          placement: normalizePlacement(article.placement, index),
        };
      }),
    [articles]
  );

  const filteredArticles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let next = normalizedArticles;

    if (query) {
      next = next.filter((article) => {
        const haystack = [article.title, article.excerpt, article.categoryLabel, article.source]
          .join(' ')
          .toLowerCase();
        return haystack.includes(query);
      });
    }

    if (digestMode === 'floral') {
      const floralSubset = next.filter((article) => article.digestType === 'floral');
      return floralSubset.length ? floralSubset : next.slice(0, Math.min(8, next.length));
    }

    return next;
  }, [digestMode, normalizedArticles, searchQuery]);

  const articleHrefForEdition = (slugValue) => `/politics/${slugValue}?edition=${editionDate}`;

  const hasEditionDispatches = normalizedArticles.length > 0;

  const archiveOptions = useMemo(() => {
    return Array.from(new Set([editionDate, todayEditionDate, yesterdayEditionDate, ...editionArchiveDates]))
      .filter((value) => isValidEditionDate(value))
      .sort((left, right) => (left > right ? -1 : 1));
  }, [editionArchiveDates, editionDate, todayEditionDate, yesterdayEditionDate]);

  const isTodayEdition = editionDate === todayEditionDate;
  const isYesterdayEdition = editionDate === yesterdayEditionDate;

  const { leadStory, sideStories, bulletinStories, lateEditionStories } = useMemo(() => {
    const usedIds = new Set();

    const fallbackLead = filteredArticles[0] || null;
    const preferredLead = filteredArticles.find((article) => article.placement === 'lead') || fallbackLead;

    if (preferredLead) {
      usedIds.add(preferredLead.id);
    }

    const pickStories = (placement, desiredCount) => {
      const picked = filteredArticles.filter(
        (article) => !usedIds.has(article.id) && article.placement === placement
      );

      const primary = picked.slice(0, desiredCount);
      primary.forEach((story) => usedIds.add(story.id));

      if (primary.length >= desiredCount) {
        return primary;
      }

      const fallback = filteredArticles
        .filter((article) => !usedIds.has(article.id))
        .slice(0, desiredCount - primary.length);

      fallback.forEach((story) => usedIds.add(story.id));
      return [...primary, ...fallback];
    };

    return {
      leadStory: preferredLead,
      sideStories: pickStories('side', 4),
      bulletinStories: pickStories('bulletin', 4),
      lateEditionStories: pickStories('late_edition', 6),
    };
  }, [filteredArticles]);

  const quizOptions = useMemo(() => {
    const options = [leadStory, ...sideStories]
      .filter(Boolean)
      .map((story) => compactHeadline(story.title, 64));
    return Array.from(new Set(options)).slice(0, 4);
  }, [leadStory, sideStories]);

  useEffect(() => {
    setSelectedQuizOption('');
    setQuizSubmitted(false);
  }, [digestMode, activeCategory, editionDate, searchQuery]);

  const editionDateObject = useMemo(() => {
    const parsed = new Date(`${editionDate}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  }, [editionDate]);

  const printDate = formatDate(editionDateObject);
  const issueCode = formatIssueCode(editionDateObject);

  return (
    <div className="min-h-screen politics-newspaper-page">
      <main className="pt-8 pb-12 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto politics-sheet rounded-2xl p-4 md:p-6 lg:p-8 animate-fadeIn">
          <header className="politics-masthead rounded-2xl px-5 py-5 mb-5 md:px-6">
            <div>
              <p className="politics-kicker">Tianxia Daily - Current Affairs</p>
              <h1 className="politics-title">The People&apos;s Digest</h1>
              <p className="politics-subtitle">
                <Newspaper className="w-4 h-4" />
                Front-page dispatches from across the Tianxia
              </p>
            </div>
            <div className="politics-meta md:text-right">
              <p>Print at: {printDate}</p>
              <p>{digestMode === 'world' ? 'World\'s Digest Edition' : 'Floral Annals Edition'}</p>
              <p>Issue: {issueCode}</p>
            </div>
          </header>

          <div className="flex flex-col gap-3 mb-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="digest-switch">
              <button
                type="button"
                onClick={() => setDigestMode('world')}
                className={`digest-pill ${digestMode === 'world' ? 'is-active' : ''}`}
              >
                World&apos;s Digest
              </button>
              <button
                type="button"
                onClick={() => setDigestMode('floral')}
                className={`digest-pill ${digestMode === 'floral' ? 'is-active' : ''}`}
              >
                Floral Annals
              </button>
            </div>

            <div className="flex w-full flex-col gap-3 lg:max-w-xl">
              <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative w-full lg:max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6f5a3e]" />
                  <input
                    type="text"
                    placeholder="Search dispatches, correspondents, or topics..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="paper-input"
                  />
                </div>

                <input
                  type="date"
                  value={editionDate}
                  onChange={(event) => setEditionDate(event.target.value)}
                  className="w-full lg:w-[188px] border border-[rgba(93,69,34,0.26)] bg-[rgba(255,251,240,0.82)] text-[var(--ink-strong)] rounded-xl px-3 py-2 text-sm"
                  aria-label="Edition date"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditionDate(todayEditionDate)}
                  className={`newspaper-chip ${isTodayEdition ? 'is-active' : ''}`}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setEditionDate(yesterdayEditionDate)}
                  className={`newspaper-chip ${isYesterdayEdition ? 'is-active' : ''}`}
                >
                  Yesterday
                </button>

                <select
                  value={editionDate}
                  onChange={(event) => setEditionDate(event.target.value)}
                  className="border border-[rgba(93,69,34,0.26)] bg-[rgba(255,251,240,0.82)] text-[var(--ink-strong)] rounded-xl px-3 py-2 text-sm"
                  aria-label="Edition archive"
                >
                  {archiveOptions.map((dateValue) => (
                    <option key={dateValue} value={dateValue}>
                      {dateValue}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 mb-5 no-scrollbar">
            {categories.map((category) => (
              <button
                type="button"
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`newspaper-chip ${activeCategory === category.id ? 'is-active' : ''}`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <category.icon className="w-3.5 h-3.5" />
                  {category.name}
                </span>
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="state-panel">
              <p className="font-semibold">Printing today&apos;s edition...</p>
              <p className="text-sm mt-2">Correspondents are filing updates from each front.</p>
            </div>
          ) : error ? (
            <div className="state-panel">
              <p className="font-semibold">{error}</p>
            </div>
          ) : !leadStory ? (
            <div className="state-panel">
              <p className="font-semibold">
                {hasEditionDispatches ? 'No dispatches matched this filter.' : 'No dispatches were published for this edition yet.'}
              </p>
              <p className="text-sm mt-2">
                {hasEditionDispatches
                  ? 'Try another section or broaden your search query.'
                  : 'Try Today/Yesterday or choose another archive date.'}
              </p>
            </div>
          ) : (
            <section className="newspaper-layout">
              <article className="politics-card lead-story">
                {leadStory.imageUrl ? (
                  <img src={leadStory.imageUrl} alt={leadStory.title} className="lead-story-image" />
                ) : (
                  <div className="lead-story-image lead-story-image--placeholder">
                    <ImageIcon className="w-10 h-10" />
                  </div>
                )}

                <div className="p-4 md:p-5">
                  <p className="story-badge">Popular Hit - {leadStory.categoryLabel}</p>
                  <h2 className="story-title">{leadStory.title}</h2>
                  <p className="story-excerpt">{leadStory.excerpt}</p>

                  <div className="story-meta">
                    <span>{leadStory.source}</span>
                    <span>{formatDate(leadStory.createdAt)}</span>
                  </div>

                  <Link to={articleHrefForEdition(leadStory.slug)} className="read-link">
                    Read dispatch <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </article>

              <aside className="politics-card p-4 md:p-5">
                <p className="section-label">In this issue</p>
                <h3 className="section-heading">Frontline Dispatches</h3>

                {sideStories.length === 0 ? (
                  <p className="story-excerpt">No additional dispatches in this section yet.</p>
                ) : (
                  <ul className="side-story-list">
                    {sideStories.map((story) => (
                      <li key={story.id} className="side-story-item">
                        <Link to={articleHrefForEdition(story.slug)}>
                          <h4 className="side-story-title">{story.title}</h4>
                          <p className="side-story-meta">
                            {story.categoryLabel} - {formatDate(story.createdAt)}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </aside>

              <aside className="politics-card p-4 md:p-5 quiz-column">
                <p className="section-label">Prize quiz</p>
                <h3 className="section-heading">Editor&apos;s Poll</h3>
                <p className="story-excerpt">
                  Which angle should lead tomorrow&apos;s front page?
                </p>

                <div className="mt-3 space-y-2">
                  {quizOptions.map((option) => (
                    <button
                      type="button"
                      key={option}
                      className={`quiz-option ${selectedQuizOption === option ? 'is-selected' : ''}`}
                      onClick={() => {
                        setSelectedQuizOption(option);
                        setQuizSubmitted(false);
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  className="quiz-submit"
                  disabled={!selectedQuizOption}
                  onClick={() => setQuizSubmitted(true)}
                >
                  Submit choice
                </button>

                {quizSubmitted && selectedQuizOption && (
                  <p className="quiz-result">
                    <Check className="w-4 h-4" />
                    Vote recorded for &quot;{selectedQuizOption}&quot;
                  </p>
                )}

                <div className="mt-6">
                  <p className="section-label">City briefings</p>
                  <h4 className="section-heading">Around the Tianxia</h4>

                  {bulletinStories.length === 0 ? (
                    <p className="story-excerpt">No side bulletins available for this edition.</p>
                  ) : (
                    <div className="bulletin-grid">
                      {bulletinStories.map((story) => (
                        <Link key={story.id} to={articleHrefForEdition(story.slug)} className="bulletin-item">
                          <p className="bulletin-title">{story.title}</p>
                          <p className="bulletin-meta">{formatDate(story.createdAt)}</p>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </aside>

              <section className="politics-card p-4 md:p-5 lg:col-span-3">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div>
                    <p className="section-label">Late edition</p>
                    <h3 className="section-heading">After-hours dispatches</h3>
                  </div>
                  <Sparkles className="w-5 h-5 text-[#8a6634]" />
                </div>

                {lateEditionStories.length === 0 ? (
                  <p className="story-excerpt">More stories will print as correspondents file updates.</p>
                ) : (
                  <div className="late-grid">
                    {lateEditionStories.map((story) => (
                      <Link key={story.id} to={articleHrefForEdition(story.slug)} className="late-card">
                        <h4>{story.title}</h4>
                        <p>{compactHeadline(story.excerpt, 130)}</p>
                        <p className="bulletin-meta mt-3">
                          {story.source} - {formatDate(story.createdAt)}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default PoliticsPage;
