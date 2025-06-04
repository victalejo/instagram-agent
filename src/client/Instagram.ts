import { Browser, DEFAULT_INTERCEPT_RESOLUTION_PRIORITY } from "puppeteer";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import AdblockerPlugin from "puppeteer-extra-plugin-adblocker";
import UserAgent from "user-agents";
import { Server } from "proxy-chain";
import { User, IInstagramAccount } from "../models/User";
import { TrainingData } from "../models/TrainingData";
import mongoose from 'mongoose';
import logger from "../config/logger";
import { loadCookies, saveCookies } from "../utils";
import { runAgent } from "../Agent";
import { getInstagramCommentSchema } from "../Agent/schema";
import fs from 'fs';
import path from 'path';

// Add stealth plugin to puppeteer
puppeteer.use(StealthPlugin());
puppeteer.use(
    AdblockerPlugin({
        // Optionally enable Cooperative Mode for several request interceptors
        interceptResolutionPriority: DEFAULT_INTERCEPT_RESOLUTION_PRIORITY,
    })
);

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function runInstagramForAllUsers() {
    try {
        // Get all users with active Instagram accounts
        const users = await User.find({
            'instagramAccounts.isActive': true
        });

        if (users.length === 0) {
            logger.info("No users with active Instagram accounts found.");
            return;
        }

        logger.info(`Found ${users.length} users with active Instagram accounts.`);

        // Process each user's Instagram accounts
        for (const user of users) {
            const activeAccounts = user.instagramAccounts.filter(acc => acc.isActive);
            
            for (const account of activeAccounts) {
                try {
                    logger.info(`Processing Instagram account: ${account.username} for user: ${user.username}`);
                    
                    // ✅ CORRECCIÓN: Asegurar conversión correcta de ObjectId a string
                    const userIdString = (user._id as mongoose.Types.ObjectId).toString();
                    
                    await runInstagramForAccount(userIdString, account);
                } catch (error) {
                    logger.error(`Error processing account ${account.username} for user ${user.username}:`, error);
                }
            }
        }
    } catch (error) {
        logger.error("Error in runInstagramForAllUsers:", error);
    }
}

async function runInstagramForAccount(userId: string | mongoose.Types.ObjectId, account: IInstagramAccount) {
    let server: Server | null = null;
    let browser: Browser | null = null;

    try {
        // ✅ CORRECCIÓN: Validar que userId sea string y no ObjectId
        const userIdString = typeof userId === 'string' ? userId : (userId as mongoose.Types.ObjectId).toString();
        
        const serverPort = 8000 + Math.floor(Math.random() * 1000); // Use different ports for different accounts
        server = new Server({ port: serverPort });
        await server.listen();
        const proxyUrl = `http://localhost:${serverPort}`;
        
        // Configure Puppeteer for Docker environment
        const puppeteerArgs = [
            `--proxy-server=${proxyUrl}`,
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            '--disable-features=TranslateUI',
            '--disable-ipc-flooding-protection'
        ];

        browser = await puppeteer.launch({
            headless: true,
            args: puppeteerArgs,
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
        });

        const page = await browser.newPage();
        
        // ✅ CORRECCIÓN: Usar userIdString validado
        const cookiesDir = path.join('./cookies', userIdString);
        if (!fs.existsSync(cookiesDir)) {
            fs.mkdirSync(cookiesDir, { recursive: true });
        }
        const cookiesPath = path.join(cookiesDir, `${account.username}_cookies.json`);

        const checkCookies = fs.existsSync(cookiesPath);
        logger.info(`Checking cookies existence for ${account.username}: ${checkCookies}`);

        if (checkCookies) {
            try {
                const cookies = await loadCookies(cookiesPath);
                await page.setCookie(...cookies);
                logger.info(`Cookies loaded for ${account.username}.`);

                // Navigate to Instagram to verify if cookies are valid
                await page.goto("https://www.instagram.com/", { waitUntil: 'networkidle2' });

                // Check if login was successful
                const isLoggedIn = await page.$("a[href='/direct/inbox/']");
                if (isLoggedIn) {
                    logger.info(`Login verified with cookies for ${account.username}.`);
                } else {
                    logger.warn(`Cookies invalid for ${account.username}. Logging in again...`);
                    await loginWithCredentials(page, browser, account, cookiesPath);
                }
            } catch (error) {
                logger.warn(`Error loading cookies for ${account.username}, logging in with credentials:`, error);
                await loginWithCredentials(page, browser, account, cookiesPath);
            }
        } else {
            // If no cookies are available, perform login with credentials
            await loginWithCredentials(page, browser, account, cookiesPath);
        }

        // Navigate to the Instagram homepage
        await page.goto("https://www.instagram.com/");

        // Get user-specific training data for personalized comments
        const trainingData = await TrainingData.find({
            userId: userIdString, // ✅ Usar userIdString validado
            instagramUsername: account.username
        }).limit(10); // Limit to recent training data for context

        // Interact with posts (limited iterations for each account)
        await interactWithPosts(page, account.username, trainingData, 5); // Limit to 5 posts per iteration

        // Update last active time
        await User.updateOne(
            { 
                _id: new mongoose.Types.ObjectId(userIdString), // ✅ Convertir explícitamente
                'instagramAccounts.username': account.username 
            },
            { 
                $set: { 'instagramAccounts.$.lastActive': new Date() }
            }
        );

        logger.info(`Completed processing for ${account.username}`);

    } catch (error) {
        logger.error(`Error in runInstagramForAccount for ${account.username}:`, error);
    } finally {
        // Clean up resources
        try {
            if (browser) {
                await browser.close();
            }
            if (server) {
                await server.close(true);
            }
        } catch (cleanupError) {
            logger.error("Error during cleanup:", cleanupError);
        }
    }
}

const loginWithCredentials = async (page: any, browser: Browser, account: IInstagramAccount, cookiesPath: string) => {
    try {
        await page.goto("https://www.instagram.com/accounts/login/");
        await page.waitForSelector('input[name="username"]', { timeout: 10000 });

        // Fill out the login form
        await page.type('input[name="username"]', account.username);
        await page.type('input[name="password"]', account.password);
        await page.click('button[type="submit"]');

        // Wait for navigation after login
        await page.waitForNavigation({ timeout: 15000 });

        // Save cookies after login
        const cookies = await browser.cookies();
        await saveCookies(cookiesPath, cookies);
        
        logger.info(`Login successful and cookies saved for ${account.username}`);
    } catch (error) {
        logger.error(`Error logging in with credentials for ${account.username}:`, error);
    }
}

async function interactWithPosts(page: any, instagramUsername: string, trainingData: any[], maxPosts: number = 5) {
    let postIndex = 1;

    while (postIndex <= maxPosts) {
        try {
            const postSelector = `article:nth-of-type(${postIndex})`;

            // Check if the post exists
            if (!(await page.$(postSelector))) {
                logger.info(`No more posts found for ${instagramUsername}. Ending iteration...`);
                return;
            }

            const likeButtonSelector = `${postSelector} svg[aria-label="Like"]`;
            const likeButton = await page.$(likeButtonSelector);
            const ariaLabel = await likeButton?.evaluate((el: Element) =>
                el.getAttribute("aria-label")
            );

            if (ariaLabel === "Like") {
                logger.info(`Liking post ${postIndex} for ${instagramUsername}...`);
                await likeButton.click();
                await page.keyboard.press("Enter");
                logger.info(`Post ${postIndex} liked for ${instagramUsername}.`);
            } else if (ariaLabel === "Unlike") {
                logger.info(`Post ${postIndex} is already liked for ${instagramUsername}.`);
            } else {
                logger.info(`Like button not found for post ${postIndex} for ${instagramUsername}.`);
            }

            // Extract and log the post caption
            const captionSelector = `${postSelector} div.x9f619 span._ap3a div span._ap3a`;
            const captionElement = await page.$(captionSelector);

            let caption = "";
            if (captionElement) {
                caption = await captionElement.evaluate((el: HTMLElement) => el.innerText);
                logger.info(`Caption for post ${postIndex} (${instagramUsername}): ${caption.substring(0, 100)}...`);
            } else {
                logger.info(`No caption found for post ${postIndex} for ${instagramUsername}.`);
            }

            // Check if there is a '...more' link to expand the caption
            const moreLinkSelector = `${postSelector} div.x9f619 span._ap3a span div span.x1lliihq`;
            const moreLink = await page.$(moreLinkSelector);
            if (moreLink) {
                logger.info(`Expanding caption for post ${postIndex} for ${instagramUsername}...`);
                await moreLink.click();
                const expandedCaption = await captionElement.evaluate(
                    (el: HTMLElement) => el.innerText
                );
                caption = expandedCaption;
            }

            // Comment on the post with personalized content
            const commentBoxSelector = `${postSelector} textarea`;
            const commentBox = await page.$(commentBoxSelector);
            if (commentBox) {
                logger.info(`Commenting on post ${postIndex} for ${instagramUsername}...`);
                
                // Create personalized prompt using training data
                let personalizedContext = "";
                if (trainingData.length > 0) {
                    const contextData = trainingData.slice(0, 3).map(data => data.content.substring(0, 200)).join(". ");
                    personalizedContext = ` Consider this background context about the account's personality and style: ${contextData}.`;
                }

                const prompt = `Craft a thoughtful, engaging, and mature reply to the following post: "${caption}". Ensure the reply is relevant, insightful, and adds value to the conversation. It should reflect empathy and professionalism, and avoid sounding too casual or superficial. The reply should be 300 characters or less and must not violate Instagram Community Standards on spam. Try to humanize the reply and make it sound authentic.${personalizedContext}`;
                
                const schema = getInstagramCommentSchema();
                const result = await runAgent(schema, prompt);
                const comment = result[0]?.comment;
                
                if (comment) {
                    await commentBox.type(comment);

                    // New selector approach for the post button
                    const postButton = await page.evaluateHandle(() => {
                        const buttons = Array.from(document.querySelectorAll('div[role="button"]'));
                        return buttons.find(button => button.textContent === 'Post' && !button.hasAttribute('disabled'));
                    });

                    if (postButton) {
                        logger.info(`Posting comment on post ${postIndex} for ${instagramUsername}...`);
                        await postButton.click();
                        logger.info(`Comment posted on post ${postIndex} for ${instagramUsername}.`);
                    } else {
                        logger.info(`Post button not found for ${instagramUsername}.`);
                    }
                }
            } else {
                logger.info(`Comment box not found for ${instagramUsername}.`);
            }

            // Wait before moving to the next post
            const waitTime = Math.floor(Math.random() * 5000) + 8000; // Increased wait time for safety
            logger.info(`Waiting ${waitTime / 1000} seconds before moving to the next post for ${instagramUsername}...`);
            await delay(waitTime);

            // Scroll to the next post
            await page.evaluate(() => {
                window.scrollBy(0, window.innerHeight);
            });

            postIndex++;
        } catch (error) {
            logger.error(`Error interacting with post ${postIndex} for ${instagramUsername}:`, error);
            break;
        }
    }
}

export { runInstagramForAllUsers };
