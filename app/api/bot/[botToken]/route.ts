import { Bot } from "grammy";
import { type NextRequest, NextResponse } from "next/server";
import { DEPLOYMENT_URL } from "vercel-url";
import { type Address, createPublicClient, formatEther, http } from "viem";
import { baseSepolia } from "viem/chains";

// Use the chain you prefer - using Base Sepolia for testing
const CHAIN = baseSepolia;
const TELEGRAM_SECRET_TOKEN =
	process.env.TELEGRAM_SECRET_TOKEN || "development-secret";

// In-memory storage for bots (in production, use a database)
const botInstances = new Map<string, Bot>();

const CORS_HEADERS = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
	"Access-Control-Allow-Headers":
		"Content-Type, Authorization, x-telegram-bot-api-secret-token",
	"Access-Control-Max-Age": "86400",
	"Access-Control-Allow-Credentials": "true",
};

// Create a public client for reading blockchain data
const publicClient = createPublicClient({
	chain: CHAIN,
	transport: http(),
});

// Get or create bot instance
async function getBot(botToken: string): Promise<Bot> {
	const existingBot = botInstances.get(botToken);
	if (existingBot) {
		return existingBot;
	}

	const bot = new Bot(botToken);

	// Initialize bot info
	await bot.init();

	// Simple message handler - respond with wallet balance
	bot.on("message", async (ctx) => {
		try {
			// Derive the Porto account for this bot
			// In a real app, you'd store the association between bot and wallet
			// For demo, we'll just show how to check any derived account balance

			const message = ctx.message?.text || "";

			// Check if user is asking for balance
			if (message.toLowerCase().includes("balance") || message === "/start") {
				// Get the bot's derived account (you'd normally store this mapping)
				// For demo, we'll show a placeholder
				await ctx.reply(
					"🤖 Porto Agent Bot\n\n" +
						"To check my balance, first deposit ETH to my account from the Porto Agents web app.\n\n" +
						"Use the web interface to:\n" +
						"1. Connect your wallet\n" +
						"2. Enter this bot token\n" +
						"3. Send ETH to fund this bot\n\n" +
						"Then I'll be able to show you my balance!",
				);
			} else if (message.startsWith("/check")) {
				// Extract address if provided
				const parts = message.split(" ");
				if (parts.length > 1) {
					const address = parts[1] as Address;
					try {
						const balance = await publicClient.getBalance({
							address,
						});

						await ctx.reply(
							`💰 Balance for ${address}:\n` +
								`${formatEther(balance)} ETH on ${CHAIN.name}`,
						);
					} catch {
						await ctx.reply("❌ Invalid address or couldn't fetch balance");
					}
				} else {
					await ctx.reply("Usage: /check <address>");
				}
			} else {
				// Default response
				await ctx.reply(
					"👋 Hello! I'm your Porto Agent.\n\n" +
						"Commands:\n" +
						"• /start - Show info\n" +
						"• /check <address> - Check any address balance\n" +
						"• Say 'balance' to learn about funding this bot",
				);
			}
		} catch (err) {
			console.error("Error handling message:", err);
			await ctx.reply("❌ An error occurred. Please try again.");
		}
	});

	botInstances.set(botToken, bot);
	return bot;
}

// GET endpoint for bot info
export const GET = async (
	req: NextRequest,
	{ params }: { params: Promise<{ botToken: string }> },
) => {
	try {
		const botToken = (await params).botToken;
		const { searchParams } = new URL(req.url);
		const shouldRegister = searchParams.get("register") === "true";

		if (!botToken) {
			return NextResponse.json(
				{ ok: false, error: "Bot token is required" },
				{ status: 400, headers: CORS_HEADERS },
			);
		}

		const bot = await getBot(botToken);

		// Register webhook if requested
		if (shouldRegister) {
      // override http fallback in development
			const dynamicDeploymentUrl = DEPLOYMENT_URL.includes("https")
				? DEPLOYMENT_URL
				: `https://porto-agents.xyz`;
			const botUrl = `${dynamicDeploymentUrl}/api/bot/${botToken}`;

			try {
				await bot.api.setWebhook(botUrl, {
					secret_token: TELEGRAM_SECRET_TOKEN,
					drop_pending_updates: true,
					allowed_updates: ["message"],
				});

				const webhookInfo = await bot.api.getWebhookInfo();

				return NextResponse.json(
					{
						ok: true,
						message: "Webhook registered successfully",
						webhookUrl: botUrl,
						botInfo: bot.botInfo,
						webhookInfo,
					},
					{ headers: CORS_HEADERS },
				);
			} catch (webhookError) {
				console.error("Error setting webhook:", webhookError);
				return NextResponse.json(
					{
						ok: false,
						error:
							webhookError instanceof Error
								? webhookError.message
								: "Failed to set webhook",
					},
					{ status: 500, headers: CORS_HEADERS },
				);
			}
		}

		// Normal bot info request
		const webhookInfo = await bot.api.getWebhookInfo();

		return NextResponse.json(
			{
				ok: true,
				botInfo: bot.botInfo,
				webhookInfo,
			},
			{ headers: CORS_HEADERS },
		);
	} catch (error) {
		console.error("Error in GET /api/bot/[botToken]:", error);
		return NextResponse.json(
			{
				ok: false,
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500, headers: CORS_HEADERS },
		);
	}
};

// POST endpoint for handling Telegram webhook callbacks
export const POST = async (
	req: NextRequest,
	{ params }: { params: Promise<{ botToken: string }> },
): Promise<NextResponse> => {
	try {
		const secretToken = req.headers.get("x-telegram-bot-api-secret-token");
		const botToken = (await params).botToken;

		if (!botToken) {
			return NextResponse.json(
				{ ok: false, error: "Bot token is required" },
				{ status: 400, headers: CORS_HEADERS },
			);
		}

		// Validate secret token (optional for development)
		if (secretToken !== TELEGRAM_SECRET_TOKEN) {
			console.warn("Invalid or missing secret token");
			// In production, you might want to reject the request
			// return NextResponse.json(
			//   { ok: false, error: "Invalid secret token" },
			//   { status: 403, headers: CORS_HEADERS },
			// );
		}

		const [bot, update] = await Promise.all([getBot(botToken), req.json()]);

		// Handle the update
		await bot.handleUpdate(update);

		return NextResponse.json({ ok: true }, { headers: CORS_HEADERS });
	} catch (error) {
		console.error("Error in POST /api/bot/[botToken]:", error);
		return NextResponse.json(
			{
				ok: false,
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500, headers: CORS_HEADERS },
		);
	}
};

// OPTIONS endpoint for CORS
export async function OPTIONS() {
	return new NextResponse(null, {
		status: 200,
		headers: CORS_HEADERS,
	});
}

// PUT endpoint for updating bot with wallet info
export const PUT = async (
	req: NextRequest,
	{ params }: { params: Promise<{ botToken: string }> },
): Promise<NextResponse> => {
	try {
		const botToken = (await params).botToken;
		const { walletAddress, derivedAddress } = await req.json();

		if (!botToken || !walletAddress || !derivedAddress) {
			return NextResponse.json(
				{
					ok: false,
					error: "Bot token, wallet address, and derived address are required",
				},
				{ status: 400, headers: CORS_HEADERS },
			);
		}

		// Get or create the bot
		const bot = await getBot(botToken);

		// Update the bot's message handler to include the derived address
		bot.on("message", async (ctx) => {
			try {
				const message = ctx.message?.text || "";

				if (message.toLowerCase().includes("balance") || message === "/start") {
					// Check the balance of the derived account
					const balance = await publicClient.getBalance({
						address: derivedAddress as Address,
					});

					await ctx.reply(
						`🤖 Porto Agent Bot\n\n` +
							`💼 My Address: ${derivedAddress}\n` +
							`💰 Balance: ${formatEther(balance)} ETH\n` +
							`🔗 Chain: ${CHAIN.name}\n\n` +
							`Funded by: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
					);
				} else if (message.startsWith("/check")) {
					const parts = message.split(" ");
					if (parts.length > 1) {
						const address = parts[1] as Address;
						try {
							const balance = await publicClient.getBalance({
								address,
							});

							await ctx.reply(
								`💰 Balance for ${address}:\n` +
									`${formatEther(balance)} ETH on ${CHAIN.name}`,
							);
						} catch {
							await ctx.reply("❌ Invalid address or couldn't fetch balance");
						}
					} else {
						await ctx.reply("Usage: /check <address>");
					}
				} else {
					await ctx.reply(
						`👋 Hello! I'm your Porto Agent.\n\n` +
							`My address: ${derivedAddress}\n\n` +
							`Commands:\n` +
							`• /start or 'balance' - Show my balance\n` +
							`• /check <address> - Check any address balance`,
					);
				}
			} catch (err) {
				console.error("Error handling message:", err);
				await ctx.reply("❌ An error occurred. Please try again.");
			}
		});

		return NextResponse.json(
			{
				ok: true,
				message: "Bot updated with wallet info",
				derivedAddress,
			},
			{ headers: CORS_HEADERS },
		);
	} catch (error) {
		console.error("Error in PUT /api/bot/[botToken]:", error);
		return NextResponse.json(
			{
				ok: false,
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500, headers: CORS_HEADERS },
		);
	}
};
