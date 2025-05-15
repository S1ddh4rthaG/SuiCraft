import { Wallet } from '@rainbow-me/rainbowkit';
import { Chain, configureChains, mainnet } from 'wagmi';
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { publicProvider } from 'wagmi/providers/public';

import { NETWORK_NAME, RPC_URL, CHAIN_ID, BLOCK_EXPLORER_URL, ICON } from './env';

const SpiderChainChain: Chain = {
  id: CHAIN_ID,
  name: NETWORK_NAME,
  network: 'botanix',
  rpcUrls: {
    default: {
      http: [RPC_URL],
    },
    public: {
      http: [RPC_URL],
    },
  },
  nativeCurrency: {
    name: 'BTC',
    symbol: 'BTC',
    decimals: 18,
  },
  blockExplorers: {
    default: { name: 'Botanix Block Explorer', url: BLOCK_EXPLORER_URL },
  },
};

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    {
      ...SpiderChainChain,
      iconUrl: ICON,
    },
    mainnet,
  ],
  [publicProvider()],
);

const coinbaseWalletConnector = new CoinbaseWalletConnector({ chains, options: { appName: 'wagmi' } });
const metaMaskWalletConnector = new MetaMaskConnector({ chains });

const trustWalletConnector = new InjectedConnector({
  chains,
  options: {
    name: 'GN',
    shimDisconnect: true,
    getProvider: () => (typeof window !== 'undefined' ? (window as any).trustwallet : undefined),
  },
});

const RainbowTrustWalletConnector = ({ chains, projectId }: MyWalletOptions): Wallet => ({
  id: '_trust-wallet',
  name: 'Trust Wallet',
  iconUrl: 'https://my-image.xyz',
  iconBackground: '#0c2f78',
  downloadUrls: {
    android: 'https://play.google.com/store/apps/details?id=my.wallet',
    ios: 'https://apps.apple.com/us/app/my-wallet',
    chrome: 'https://chrome.google.com/webstore/detail/my-wallet',
    qrCode: 'https://my-wallet/qr',
  },
  createConnector: () => {
    return {
      connector: trustWalletConnector,
    };
  },
});

export {
  chains, coinbaseWalletConnector, metaMaskWalletConnector, publicClient, RainbowTrustWalletConnector, trustWalletConnector, webSocketPublicClient
};