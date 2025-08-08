"use client";

import { useEffect, useState } from "react";
import {
	type Address,
	encodePacked,
	formatEther,
	keccak256,
	parseEther,
} from "viem";
import { baseSepolia } from "viem/chains";
import {
	useAccount,
	useBalance,
	useChainId,
	useSendTransaction,
	useSwitchChain,
	useWaitForTransactionReceipt,
} from "wagmi";
import { ConnectButton } from "@/components/connect-button";

// Use Base Sepolia for testing
const TARGET_CHAIN = baseSepolia;

export default function Home() {
	const { address, isConnected } = useAccount();
	const chainId = useChainId();
	const { switchChain } = useSwitchChain();
	const {
		sendTransaction,
		data: txHash,
		isPending: isSending,
		error: sendError,
	} = useSendTransaction();
	const { isLoading: isConfirming, isSuccess: isConfirmed } =
		useWaitForTransactionReceipt({
			hash: txHash,
		});

	const [botToken, setBotToken] = useState("");
	const [depositAmount, setDepositAmount] = useState("0.001");
	const [derivedAddress, setDerivedAddress] = useState<Address | null>(null);
	const [botInfo, setBotInfo] = useState<{
		username?: string;
		id?: number;
	} | null>(null);
	const [isValidatingBot, setIsValidatingBot] = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	// Derive Porto account address from wallet + bot token
	const derivePortoAccount = (
		walletAddress: string,
		token: string,
	): Address => {
		// Create a deterministic address using keccak256
		// In production, use proper key derivation or smart contract wallets
		const hash = keccak256(
			encodePacked(["address", "string"], [walletAddress as Address, token]),
		);
		// Take the last 20 bytes of the hash as the address
		return `0x${hash.slice(-40)}` as Address;
	};

	// Validate bot token and get bot info
	const validateBotToken = async () => {
		if (!botToken || !address) return;

		setIsValidatingBot(true);
		try {
			// First, register the webhook
			const webhookResponse = await fetch(
				`/api/bot/${botToken}?register=true`,
				{
					method: "GET",
				},
			);

			if (webhookResponse.ok) {
				const webhookData = await webhookResponse.json();
				console.log("Webhook registered:", webhookData);

				// Get bot info
				const response = await fetch(`/api/bot/${botToken}`, {
					method: "GET",
				});

				if (response.ok) {
					const data = await response.json();
					setBotInfo(data.botInfo);

					// Derive the Porto account
					const derived = derivePortoAccount(address, botToken);
					setDerivedAddress(derived);

					// Update the bot with wallet info
					await fetch(`/api/bot/${botToken}`, {
						method: "PUT",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							walletAddress: address,
							derivedAddress: derived,
						}),
					});
				} else {
					alert("Invalid bot token. Please check and try again.");
					setBotInfo(null);
					setDerivedAddress(null);
				}
			} else {
				alert("Failed to register webhook. Please check your bot token.");
				setBotInfo(null);
				setDerivedAddress(null);
			}
		} catch (error) {
			console.error("Error validating bot:", error);
			alert("Failed to validate bot token. Make sure it's correct.");
		} finally {
			setIsValidatingBot(false);
		}
	};

	// Handle deposit
	const handleDeposit = async () => {
		if (!derivedAddress || !depositAmount || chainId !== TARGET_CHAIN.id) {
			if (chainId !== TARGET_CHAIN.id) {
				// Switch to the target chain
				switchChain?.({ chainId: TARGET_CHAIN.id });
			}
			return;
		}

		try {
			sendTransaction({
				to: derivedAddress,
				value: parseEther(depositAmount),
			});
		} catch (error) {
			console.error("Error sending transaction:", error);
		}
	};

	// Get balance of derived account
	const { data: derivedBalance } = useBalance({
		address: derivedAddress || undefined,
		chainId: TARGET_CHAIN.id,
	});

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
			{/* Header */}
			<header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
					<div className="flex justify-between items-center">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
								<span className="text-white font-bold text-xl">P</span>
							</div>
							<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
								Porto Agents
							</h1>
						</div>
						<ConnectButton />
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<div className="text-center mb-12">
					<h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
						Telegram Bot Agent Creator
					</h2>
					<p className="text-lg text-gray-600 dark:text-gray-300">
						Fund your Telegram bot with ETH using Porto
					</p>
				</div>

				{!mounted ? (
					// Loading state
					<div className="text-center py-16">
						<div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full mb-6 animate-pulse">
							<div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded" />
						</div>
					</div>
				) : isConnected ? (
					<div className="max-w-2xl mx-auto space-y-6">
						{/* Chain Warning */}
						{chainId !== TARGET_CHAIN.id && (
							<div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
								<p className="text-yellow-800 dark:text-yellow-200">
									⚠️ Please switch to {TARGET_CHAIN.name} to continue
								</p>
								<button
									type="button"
									onClick={() => switchChain?.({ chainId: TARGET_CHAIN.id })}
									className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
								>
									Switch Network
								</button>
							</div>
						)}

						{/* Bot Setup Card */}
						<div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
							<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
								Setup Your Telegram Bot
							</h3>

							<div className="space-y-4">
								{/* Bot Token Input */}
								<div>
									<label
										htmlFor="bot-token"
										className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
									>
										Telegram Bot Token:
									</label>
									<div className="flex gap-2">
										<input
											id="bot-token"
											type="text"
											value={botToken}
											onChange={(e) => setBotToken(e.target.value)}
											placeholder="Enter your bot token from @BotFather"
											className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
										/>
										<button
											type="button"
											onClick={validateBotToken}
											disabled={!botToken || isValidatingBot}
											className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
										>
											{isValidatingBot ? "Validating..." : "Validate"}
										</button>
									</div>
									<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
										Get a bot token from @BotFather on Telegram
									</p>
								</div>

								{/* Bot Info */}
								{botInfo && (
									<div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
										<p className="text-sm font-medium text-green-800 dark:text-green-300">
											✅ Bot validated: @{botInfo.username}
										</p>
									</div>
								)}

								{/* Derived Address */}
								{derivedAddress && (
									<div>
										<p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
											Bot's Porto Account:
										</p>
										<div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
											<p className="font-mono text-sm break-all">
												{derivedAddress}
											</p>
											<p className="text-xs text-gray-500 mt-1">
												Balance:{" "}
												{derivedBalance
													? formatEther(derivedBalance.value)
													: "0"}{" "}
												ETH
											</p>
										</div>
									</div>
								)}

								{/* Deposit Amount */}
								{derivedAddress && (
									<div>
										<label
											htmlFor="deposit-amount"
											className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
										>
											Deposit Amount (ETH):
										</label>
										<input
											id="deposit-amount"
											type="number"
											value={depositAmount}
											onChange={(e) => setDepositAmount(e.target.value)}
											step="0.001"
											min="0"
											className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
										/>
									</div>
								)}

								{/* Send Transaction Button */}
								{derivedAddress && (
									<button
										type="button"
										onClick={handleDeposit}
										disabled={
											isSending ||
											isConfirming ||
											!depositAmount ||
											Number(depositAmount) <= 0
										}
										className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 font-medium"
									>
										{isSending
											? "Sending..."
											: isConfirming
												? "Confirming..."
												: `Send ${depositAmount} ETH to Bot`}
									</button>
								)}

								{/* Transaction Status */}
								{txHash && (
									<div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
										<p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
											Transaction {isConfirmed ? "Confirmed" : "Pending"}
										</p>
										<a
											href={`${TARGET_CHAIN.blockExplorers?.default.url}/tx/${txHash}`}
											target="_blank"
											rel="noopener noreferrer"
											className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
										>
											View on Explorer →
										</a>
									</div>
								)}

								{/* Send Error */}
								{sendError && (
									<div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
										<p className="text-sm text-red-800 dark:text-red-300">
											Error: {sendError.message}
										</p>
									</div>
								)}
							</div>
						</div>

						{/* Instructions */}
						{botInfo && derivedAddress && (
							<div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
								<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
									How to Use Your Bot
								</h3>
								<ol className="space-y-2 text-gray-700 dark:text-gray-300">
									<li>
										1. Send ETH to your bot's Porto account using the form above
									</li>
									<li>2. Open Telegram and search for @{botInfo.username}</li>
									<li>3. Start a conversation with /start or say "balance"</li>
									<li>4. Your bot will respond with its current ETH balance</li>
								</ol>
							</div>
						)}
					</div>
				) : (
					<div className="text-center py-16">
						<div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full mb-6">
							<svg
								className="w-10 h-10 text-gray-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								aria-label="Wallet icon"
							>
								<title>Wallet icon</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
								/>
							</svg>
						</div>
						<h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
							No Wallet Connected
						</h3>
						<p className="text-gray-600 dark:text-gray-400 mb-6">
							Connect your wallet using Porto to get started
						</p>
						<div className="inline-block">
							<ConnectButton />
						</div>
					</div>
				)}
			</main>
		</div>
	);
}
