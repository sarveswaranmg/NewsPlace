import React, { useEffect, useState } from "react";
import { useQuery, gql } from "@apollo/client";
import { nhost } from "../../../utils/nhost";
import "./NewsPage.css";
import NewsPreferenceModal from "./NewsPreferenceModal";
import { Button } from "antd";
// GraphQL queries
const GET_USER_PREFERENCES = gql`
  query GetUserPreferences($userId: uuid!) {
    user_preferences(where: { user_id: { _eq: $userId } }) {
      preferred_categories
      preferred_keywords
    }
  }
`;

const GET_PERSONALIZED_NEWS = gql`
  query GetPersonalizedNews($categories: [String!], $keywords: String!) {
    news_articles(
      where: {
        _or: [
          { category: { _in: $categories } }
          { title: { _iregex: $keywords } }
          { content: { _iregex: $keywords } }
        ]
      }
      order_by: { published_at: desc }
    ) {
      id
      title
      content
      url
      image_url
      source
      category
      sentiment
      published_at
    }
  }
`;

const GET_ALL_NEWS = gql`
  query GetAllNews {
    news_articles(order_by: { published_at: desc }) {
      id
      title
      content
      url
      image_url
      source
      category
      sentiment
      published_at
    }
  }
`;

const CATEGORIES = [
  "business",
  "sports",
  "technology",
  "entertainment",
  "health",
];
const SENTIMENTS = ["Positive", "Negative", "Neutral"];
const scoreNewsItem = (news, preferences) => {
  let score = 0;

  if (preferences?.preferred_categories?.includes(news.category)) {
    score += 10;
  }

  const content = `${news.title} ${news.content}`.toLowerCase();
  preferences?.preferred_keywords?.forEach((keyword) => {
    if (content.includes(keyword.toLowerCase())) {
      score += 2;
    }
  });

  return score;
};
const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSentiment, setSelectedSentiment] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  const user = nhost.auth.getSession()?.user;

  // Fetch user preferences
  const { data: prefData, refetch: refetchPreferences } = useQuery(
    GET_USER_PREFERENCES,
    {
      variables: { userId: user?.id },
      skip: !user,
    }
  );

  const preferences = prefData?.user_preferences[0];
  const preferredCategories = preferences?.preferred_categories || [];
  const preferredKeywords = preferences?.preferred_keywords?.join("|") || ".*";
  const { data: personalizedData } = useQuery(GET_PERSONALIZED_NEWS, {
    variables: { categories: preferredCategories, keywords: preferredKeywords },
    skip: !preferredCategories.length,
  });

  const { data: allNewsData } = useQuery(GET_ALL_NEWS, {
    skip: personalizedData?.news_articles?.length > 0, // Skip all news fetch if personalized data exists
  });

  // Deduplicate and set the news list
  useEffect(() => {
    let combinedNews = [];

    if (personalizedData?.news_articles?.length) {
      combinedNews = personalizedData.news_articles;
    } else if (allNewsData?.news_articles?.length) {
      combinedNews = allNewsData.news_articles;
    }

    // Remove duplicates by ID
    const uniqueNewsMap = new Map();
    combinedNews.forEach((article) => {
      uniqueNewsMap.set(article.id, article);
    });

    const dedupedNews = Array.from(uniqueNewsMap.values());

    // Sort based on score
    const sortedNews = dedupedNews
      .map((article) => ({
        ...article,
        score: scoreNewsItem(article, preferences),
      }))
      .sort((a, b) => b.score - a.score);

    setNews(sortedNews);
    setLoading(false);
  }, [personalizedData, allNewsData, preferences]);

  // Toggle dark mode
  useEffect(() => {
    document.body.className = darkMode ? "dark-theme" : "light-theme";
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // Render sentiment badge
  const renderSentimentBadge = (sentiment) => {
    switch (sentiment) {
      case "Positive":
        return <span className="sentiment-badge positive">Positive</span>;
      case "Negative":
        return <span className="sentiment-badge negative">Negative</span>;
      default:
        return <span className="sentiment-badge neutral">Neutral</span>;
    }
  };

  if (loading) return <p className="loading">Loading news...</p>;

  return (
    <>
      <div className={`news-container ${darkMode ? "dark" : "light"}`}>
        {showModal && (
          <NewsPreferenceModal
            showModal={showModal}
            userId={user?.id}
            setShowModal={setShowModal}
            onClose={() => setShowModal(false)}
            refetchPreferences={refetchPreferences}
            initialPreferences={preferences}
          />
        )}

        {/* Theme Toggle Button */}
        <div className="header">
          <h1>
            📰 {news.length > 0 ? "Personalized News" : "Loading Latest News"}
          </h1>
          <button
            className="theme-toggle button-color"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>

        {/* Category Selector */}
        <div className="category-selector">
          <Button
            onClick={() => {
              setShowModal(true);
            }}
          >
            Set Preferences
          </Button>
          <div>
            <label>Search Articles </label>
            <input
              type="text"
              placeholder="Search by title or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <div>
            <label>Filter by Sentiment </label>
            <select
              onChange={(e) => setSelectedSentiment(e.target.value)}
              value={selectedSentiment || ""}
            >
              <option value="">All Sentiments</option>
              {SENTIMENTS.map((sentiment) => (
                <option key={sentiment} value={sentiment}>
                  {sentiment.toUpperCase()}
                </option>
              ))}
            </select>
            <label>Filter by Category </label>
            <select
              onChange={(e) => setSelectedCategory(e.target.value)}
              value={selectedCategory || ""}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* News Articles */}
        <div className="news-grid">
          {news
            .filter(
              (article) =>
                !selectedCategory || article.category === selectedCategory
            )
            .filter(
              (article) =>
                !selectedSentiment || article.sentiment === selectedSentiment
            )
            .filter(
              (article) =>
                article.title
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase()) ||
                article.content
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase())
            )
            .map((article) => (
              <div key={article.id} className="news-card">
                {article.image_url && (
                  <img src={article.image_url} alt={article.title} />
                )}
                <h3>{article.title}</h3>
                <p>{article.content.substring(0, 100)}...</p>
                {renderSentimentBadge(article.sentiment)}
                <a href={article.url} target="_blank" rel="noopener noreferrer">
                  Read More
                </a>
              </div>
            ))}
        </div>

        {news.length === 0 && <p>No news found.</p>}
      </div>
    </>
  );
};

export default NewsPage;
