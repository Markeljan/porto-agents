"use client";

import { useEffect, useState } from "react";
import { formatEther } from "viem";
import {
	useAccount,
	useBalance,
	useConnect,
	useDisconnect,
	useEnsName,
} from "wagmi";

export function ConnectButton() {
	const { address, isConnected, chain } = useAccount();
	const { connectors, connect, isPending: isConnecting } = useConnect();
	const { disconnect } = useDisconnect();
	const { data: ensName } = useEnsName({ address });
	const { data: balance } = useBalance({ address });
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const portoConnector = connectors.find((c) => c.id === "xyz.ithaca.porto");

	if (!mounted) {
		return (
			<button
				type="button"
				className="px-6 py-3 bg-gray-200 text-gray-500 rounded-lg font-medium cursor-not-allowed"
			>
				Loading...
			</button>
		);
	}

	if (isConnected && address) {
		return (
			<div className="flex items-center gap-4">
				<div className="flex flex-col items-end">
					<div className="text-sm text-gray-600">
						{chain?.name || "Unknown Network"}
					</div>
					<div className="font-mono text-sm">
						{ensName || `${address.slice(0, 6)}...${address.slice(-4)}`}
					</div>
					{balance && (
						<div className="text-xs text-gray-500">
							{parseFloat(formatEther(balance.value)).toFixed(4)}{" "}
							{balance.symbol}
						</div>
					)}
				</div>
				<button
					type="button"
					onClick={() => disconnect()}
					className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
				>
					Disconnect
				</button>
			</div>
		);
	}

	return (
		<button
			type="button"
			onClick={() => portoConnector && connect({ connector: portoConnector })}
			disabled={!portoConnector || isConnecting}
			className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
		>
			{isConnecting ? "Connecting..." : "Connect with Porto"}
		</button>
	);
}
