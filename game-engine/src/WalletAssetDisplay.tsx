import { useCurrentAccount } from '@mysten/dapp-kit';
import { useEffect, useState } from 'react';

import './App.css';
import { AssetUploadAndFetch } from './components/AssetUploadAndFetch';
import { Wallet } from './components/Wallet';
import { WalrusAssetHandler } from './components/AssetUploadAndFetch/walrusAssets';

function WalletAssetDisplay() {
  const currentAccount = useCurrentAccount();
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    setIsConnected(currentAccount !== null);
  }, [currentAccount]);

  return (
    <>
      <div className='w-100 text-center standard-background px-2 py-2 mb-1'>
        <Wallet />
      </div>
      {/* {isConnected && <AssetUploadAndFetch />} */}
      {isConnected && <WalrusAssetHandler />}
    </>
  )
}

export default WalletAssetDisplay
