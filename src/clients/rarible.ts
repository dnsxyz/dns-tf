import {createRaribleSdk} from '@rarible/sdk';
import type {RaribleSdkEnvironment} from '@rarible/sdk/build/config/domain';
import {Maybe, toUnionAddress} from '@rarible/types';
import type {BlockchainWallet} from '@rarible/sdk-wallet';
import type {ConfigurationParameters} from '@rarible/api-client';
import type {GetAllItemsRequest} from '@rarible/api-client/build/apis/ItemControllerApi';
import {
  Blockchain,
  Item,
  Items,
  RestrictionCheckForm,
  RestrictionCheckResult,
  Royalties,
  UnionApiErrorBadRequest,
  UnionApiErrorEntityNotFound,
  UnionApiErrorServerError,
  Collections,
} from '@rarible/api-client/build/models';

const wallet: Maybe<BlockchainWallet> = undefined;

const env: RaribleSdkEnvironment = 'prod';

// FIXME: hack to disable Flow since it makes every request 15x longer
export const FUNCTIONAL_BLOCKCHAINS: Blockchain[] = [
  Blockchain.TEZOS,
  Blockchain.ETHEREUM,
];
const apiConfig: ConfigurationParameters = {};

export const sdk = createRaribleSdk(wallet, env, apiConfig);
