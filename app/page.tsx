"use client";

import { useEffect, useState } from "react";
import { formatEther } from "viem";
import { useAccount, useBalance, useChainId, useSignMessage } from "wagmi";
import { ConnectButton } from "@/components/connect-button";

export default function Home() {
	const { address, isConnected } = useAccount();
	const chainId = useChainId();
	const { data: balance } = useBalance({ address });
	const {
		signMessage,
		data: signature,
		isPending: isSigning,
		isSuccess: hasSigned,
	} = useSignMessage();
	const [message, setMessage] = useState("Hello from Porto Agents!");
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const handleSignMessage = () => {
		signMessage({ message });
	};

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
						Welcome to Porto Agents
					</h2>
					<p className="text-lg text-gray-600 dark:text-gray-300">
						Connect your wallet using Porto to interact with Web3
					</p>
				</div>

				{!mounted ? (
					// Loading state - show a skeleton or spinner
					<div className="text-center py-16">
						<div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full mb-6 animate-pulse">
							<div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded" />
						</div>
						<div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-2 animate-pulse" />
						<div className="h-5 w-80 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-6 animate-pulse" />
					</div>
				) : isConnected ? (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Account Info Card */}
						<div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
							<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
								Account Information
							</h3>
							<div className="space-y-3">
								<div className="flex justify-between">
									<span className="text-gray-600 dark:text-gray-400">
										Address:
									</span>
									<span className="font-mono text-sm text-gray-900 dark:text-white">
										{address?.slice(0, 6)}...{address?.slice(-4)}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600 dark:text-gray-400">
										Chain ID:
									</span>
									<span className="text-gray-900 dark:text-white">
										{chainId}
									</span>
								</div>
								{balance && (
									<div className="flex justify-between">
										<span className="text-gray-600 dark:text-gray-400">
											Balance:
										</span>
										<span className="text-gray-900 dark:text-white">
											{parseFloat(formatEther(balance.value)).toFixed(6)}{" "}
											{balance.symbol}
										</span>
									</div>
								)}
							</div>
						</div>

						{/* Sign Message Card */}
						<div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
							<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
								Sign Message
							</h3>
							<div className="space-y-4">
								<div>
									<label
										htmlFor="message"
										className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
									>
										Message to sign:
									</label>
									<textarea
										id="message"
										value={message}
										onChange={(e) => setMessage(e.target.value)}
										className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										rows={3}
									/>
								</div>
								<button
									type="button"
									onClick={handleSignMessage}
									disabled={isSigning || !message}
									className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
								>
									{isSigning ? "Signing..." : "Sign Message"}
								</button>
								{hasSigned && signature && (
									<div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
										<p className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">
											Message signed successfully!
										</p>
										<p className="text-xs font-mono text-gray-600 dark:text-gray-400 break-all">
											{signature.slice(0, 20)}...{signature.slice(-20)}
										</p>
									</div>
								)}
							</div>
						</div>

						{/* Capabilities Card */}
						<div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:col-span-2">
							<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
								Porto Capabilities
							</h3>
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
								{[
									{
										title: "Multi-Chain Support",
										description: "Connect to multiple networks seamlessly",
									},
									{
										title: "Secure Signing",
										description: "Sign messages and transactions safely",
									},
									{
										title: "Account Management",
										description: "Manage multiple accounts with ease",
									},
									{
										title: "DApp Integration",
										description: "Integrate with decentralized applications",
									},
									{
										title: "ENS Support",
										description: "Resolve ENS names automatically",
									},
									{
										title: "Real-time Updates",
										description: "Get live balance and network updates",
									},
								].map((feature) => (
									<div
										key={feature.title}
										className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
									>
										<h4 className="font-semibold text-gray-900 dark:text-white mb-1">
											{feature.title}
										</h4>
										<p className="text-sm text-gray-600 dark:text-gray-400">
											{feature.description}
										</p>
									</div>
								))}
							</div>
						</div>
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
								role="img"
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
