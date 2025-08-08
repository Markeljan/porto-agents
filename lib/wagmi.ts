import { porto } from "porto/wagmi";
import { createConfig, http } from "wagmi";
import { base, baseSepolia, mainnet, sepolia } from "wagmi/chains";

export const config = createConfig({
	chains: [mainnet, base, baseSepolia, sepolia],
	connectors: [porto()],
	transports: {
		[mainnet.id]: http(),
		[base.id]: http(),
		[baseSepolia.id]: http(),
		[sepolia.id]: http(),
	},
});

declare module "wagmi" {
	interface Register {
		config: typeof config;
	}
}
