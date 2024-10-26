import {useTokenModel} from '@/features/marketplace/contract';
import {BaseProduct} from '@/shared/api';
import {useConnectModal} from '@rainbow-me/rainbowkit';
import {useAccount} from 'wagmi';
import {CreditsNFTCard} from '../ui/credits-nft';

interface SmartCreditsNFT {
  product: BaseProduct;
}

export function SmartCreditsNFT({product}: SmartCreditsNFT) {
  const tokenBuy = useTokenModel({
    tokenId: product.token_id,
    contractAddress: product.contract_address,
  });
  const modal = useConnectModal();
  const {address} = useAccount();

  const handleBuyClick = async (product: BaseProduct) => {
    console.debug('buy:', {
      tokenPrice: tokenBuy.tokenPrice.data,
      tokenText: tokenBuy.tokenText.data,
    });
    if (!address && modal.openConnectModal) {
      modal.openConnectModal();
    } else {
      console.debug('doing buy');
      await tokenBuy.buy();
    }
  };

  return <CreditsNFTCard product={product} onBuyClick={handleBuyClick} />;
}
