import {useTokenModel} from '@/features/marketplace/contract';
import {BaseProduct} from '@/shared/api';
import {useConnectModal} from '@rainbow-me/rainbowkit';
import {useAccount} from 'wagmi';
import {CreditsNFTCard} from '../ui/credits-nft';
import {OwnedCreditsNFT} from '../ui/owned-credits-nft';

interface SmartCreditsNFT {
  product: BaseProduct;
}

export function SmartOwnedCreditsNFT({product}: SmartCreditsNFT) {
  const tokenModel = useTokenModel({
    tokenId: product.token_id,
    contractAddress: product.contract_address,
  });

  const modal = useConnectModal();
  const {address} = useAccount();

  const handleBuyClick = async (product: BaseProduct) => {
    if (!address && modal.openConnectModal) {
      modal.openConnectModal();
    } else {
      console.debug('doing buy');
      await tokenModel.buy();
    }
  };

  const listToMarket = async (price: bigint) => {
    await tokenModel.list(price);
  };

  const unlistFromMarket = async () => {
    await tokenModel.unlist();
  };

  return (
    <OwnedCreditsNFT
      product={product}
      isOnSale={tokenModel.isListedForSale}
      onUnlistForSaleClick={unlistFromMarket}
      onListForSaleClick={(_, price) => listToMarket(price)}
    />
  );
}
