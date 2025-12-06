import axios from 'axios';
import { API_CONFIG, CATEGORIES } from '../config/apis.js';

/**
 * Fetch news events from News API
 * Requires free API key from https://newsapi.org
 */
export async function fetchNewsEvents() {
    if (!API_CONFIG.newsApi.enabled) {
        console.log('⚠️  News API disabled (no API key)');
        return [];
    }

    try {
        // Fetch top headlines
        const response = await axios.get(
            `${API_CONFIG.newsApi.baseUrl}/top-headlines`,
            {
                params: {
                    apiKey: API_CONFIG.newsApi.apiKey,
                    language: 'en',
                    pageSize: 10,
                    category: 'technology,business',
                },
            }
        );

        const articles = response.data.articles;
        const events = [];
        const now = Math.floor(Date.now() / 1000);

        // Generate prediction questions from headlines
        for (const article of articles.slice(0, 5)) {
            // Create a prediction question based on the headline
            const question = generatePredictionQuestion(article);

            if (question) {
                const deadline = now + (7 * 24 * 60 * 60); // 1 week

                events.push({
                    eventId: `news-${article.publishedAt}-${Math.random().toString(36).substr(2, 9)}`,
                    eventType: 'news',
                    source: 'newsapi',
                    question: question,
                    category: determineCategoryFromArticle(article),
                    closeTime: deadline,
                    sourceUrl: article.url,
                    metadata: {
                        title: article.title,
                        source: article.source.name,
                        publishedAt: article.publishedAt,
                    },
                });
            }
        }

        console.log(`✅ Fetched ${events.length} news events from News API`);
        return events;

    } catch (error) {
        console.error('❌ Error fetching news events:', error.message);
        return [];
    }
}

/**
 * Generate a prediction question from a news article
 */
function generatePredictionQuestion(article) {
    const title = article.title;

    // Simple heuristics to generate yes/no questions
    // In production, use NLP or GPT to generate better questions

    if (title.includes('will') || title.includes('to')) {
        // Already in question format
        return title.replace(/[.!]$/, '?');
    }

    // Skip articles that are hard to convert to predictions
    return null;
}

/**
 * Determine category from article
 */
function determineCategoryFromArticle(article) {
    const title = article.title.toLowerCase();
    const description = (article.description || '').toLowerCase();
    const text = title + ' ' + description;

    if (text.includes('crypto') || text.includes('bitcoin') || text.includes('ethereum')) {
        return CATEGORIES.CRYPTO;
    }
    if (text.includes('election') || text.includes('president') || text.includes('congress')) {
        return CATEGORIES.POLITICS;
    }
    if (text.includes('stock') || text.includes('market') || text.includes('economy')) {
        return CATEGORIES.ECONOMICS;
    }
    if (text.includes('tech') || text.includes('ai') || text.includes('software')) {
        return CATEGORIES.TECHNOLOGY;
    }

    return CATEGORIES.TECHNOLOGY; // Default
}
