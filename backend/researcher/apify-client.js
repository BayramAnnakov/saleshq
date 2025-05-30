import { APIFY_TOKEN } from './config.js';
import { ApifyClient } from 'apify-client';

/**
 * Apify MCP Client Configuration
 * 
 * This module provides configuration and helper functions for interacting with
 * Apify's Model Context Protocol (MCP) server and the website content crawler actor.
 */

console.log('[Apify Client] Initializing Apify client...');

// Initialize Apify client
const apifyClient = new ApifyClient({
  token: APIFY_TOKEN,
});

console.log('[Apify Client] Apify client initialized successfully');

// MCP server configuration
const MCP_CONFIG = {
  type: 'sse',
  url: 'https://mcp.apify.com/sse',
  headers: {
    'Authorization': `Bearer ${APIFY_TOKEN}`
  },
  client: apifyClient
};

// Website content crawler actor configuration
const WEBSITE_CRAWLER_ACTOR = {
  name: 'apify/website-content-crawler',
  input: {
    startUrls: [], // Will be populated with prospect's website
    maxCrawlPages: 3,
    maxConcurrency: 3,
    maxRequestRetries: 3,
    pageFunction: async function pageFunction({ page, data, item, helpers, pagePool, customData, label }) {
      console.log(`[Apify Crawler] Processing page: ${page.url()}`);
      return {
        url: page.url(),
        title: await page.$eval('title', el => el.textContent),
        content: await page.$eval('body', el => el.textContent),
        metadata: {
          lastModified: await page.$eval('meta[property="article:modified_time"]', el => el.content).catch(() => null),
          description: await page.$eval('meta[name="description"]', el => el.content).catch(() => null)
        }
      };
    }
  }
};

/**
 * Crawls a website using Apify's website content crawler actor
 * @param {string} websiteUrl - The URL of the website to crawl
 * @returns {Promise<Object>} The crawling results
 */
export async function crawlWebsite(websiteUrl) {
  console.log(`[Apify Client] Starting website crawl for: ${websiteUrl}`);
  try {
    // Configure the actor with the target website
    const actorInput = {
      ...WEBSITE_CRAWLER_ACTOR.input,
      startUrls: [{ url: websiteUrl }]
    };

    console.log('[Apify Client] Starting actor run...');
    // Start the actor run
    const run = await apifyClient.actor(WEBSITE_CRAWLER_ACTOR.name).call(actorInput);
    console.log(`[Apify Client] Actor run started with ID: ${run.id}`);

    console.log('[Apify Client] Waiting for results...');
    // Wait for the run to complete and get results
    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
    console.log(`[Apify Client] Retrieved ${items.length} items from crawl`);

    return items;
  } catch (error) {
    console.error('[Apify Client] Error crawling website:', error);
    console.error('[Apify Client] Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    throw error;
  }
}

/**
 * Initializes the MCP client with the provided configuration
 * @param {string} apiToken - Apify API token
 */
export function initializeMCPClient(apiToken) {
  console.log('[Apify Client] Initializing MCP client...');
  if (!apiToken) {
    console.error('[Apify Client] Error: No API token provided');
    throw new Error('Apify API token is required');
  }
  
  console.log('[Apify Client] Setting up MCP configuration...');
  MCP_CONFIG.headers.Authorization = `Bearer ${apiToken}`;
  MCP_CONFIG.client = apifyClient;
  console.log('[Apify Client] MCP client initialized successfully');
}

export { MCP_CONFIG, WEBSITE_CRAWLER_ACTOR }; 