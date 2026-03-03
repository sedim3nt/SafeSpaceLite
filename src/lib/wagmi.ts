import { http } from 'wagmi';
import { baseSepolia, base } from 'wagmi/chains';
import { createConfig } from '@privy-io/wagmi';

export const config = import.meta.env.PROD
  ? createConfig({
      chains: [base],
      transports: { [base.id]: http() },
    })
  : createConfig({
      chains: [baseSepolia],
      transports: { [baseSepolia.id]: http() },
    });
