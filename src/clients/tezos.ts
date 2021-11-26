import {
    BeaconEvent,
    DAppClientOptions,
    defaultEventCallbacks,
    NetworkType,
    P2PPairingRequest,
    PostMessagePairingRequest,
    Serializer,
    PermissionResponseOutput,
  } from '@airgap/beacon-sdk';
  import {
    PairingAlertInfo,
    PairingAlertWallet,
  } from '@airgap/beacon-sdk/dist/esm/ui/alert/Pairing';
  import {BeaconWallet} from './../util/beaconWallet';
  import Axios from 'axios';
  import {TEZOS_NETWORK} from './../reducers/auth/tezosAuth';
  import {Social} from '../../controller/hooks/socials';
  import {Profile} from '../../types/profile';
  
  export function networkTypeOrDefault(networkType?: string): NetworkType {
    switch (networkType) {
      case 'mainnet':
        return NetworkType.MAINNET;
      case 'testnet':
      default:
        return NetworkType.GRANADANET;
    }
  }
  
  export interface Tezos {
    beaconClient?: BeaconWallet;
    // could potentially move uiDescription to redux store
    // but this is fine for now
    uiDescription?: PairingAlertInfo & {qrData: string};
    permissionsPromise?: Promise<PermissionResponseOutput>;
  }
  
  const tezosObject: Tezos = {};
  
  export function getWalletProviderInfo(uiDescription: PairingAlertInfo) {
    const result: PairingAlertWallet[] = [];
    for (const {wallets} of uiDescription.walletLists) {
      result.push(...wallets);
    }
    // only show wallets that are enabled
    return result.filter(wallet => wallet.enabled);
  }
  
  const TEMP_FOR_TYPES: DAppClientOptions = {name: ''};
  type EventHandlers = typeof TEMP_FOR_TYPES.eventHandlers & {};
  
  /**
   * Handles login with beacon wallet
   * @param tezos 
   * @param network 
   * @param overrides 
   * @param additions 
   */
  export async function init(
    tezos: Tezos,
    network: NetworkType,
    overrides?: EventHandlers,
    additions?: EventHandlers
  ) {
    const options: DAppClientOptions = {
      name: 'DNS',
      eventHandlers: {},
      disableDefaultEvents: overrides !== undefined,
      preferredNetwork: network,
      // iconUrl: 'path/to/ourLogo',
      appUrl: 'dns.xyz',
    };
    // Reference: https://docs.walletbeacon.io/advanced/ui-elements
    if (options.eventHandlers && overrides !== undefined) {
      for (const key of Object.values(BeaconEvent)) {
        options.eventHandlers[key] = {
          // eslint-disable-next-line no-loop-func
          async handler(payload, extraArg) {
            console.log('event type:', key);
            console.log('payload:', payload);
            console.log('extraArg:', extraArg);
            if (overrides[key] !== undefined) {
              return await overrides[key]?.handler(payload as never, extraArg);
            } else {
              return await defaultEventCallbacks[key](payload as never, extraArg);
            }
          },
        };
      }
    }
    tezos.beaconClient = new BeaconWallet(options);
    if (additions !== undefined) {
      const promises: Promise<any>[] = [];
      for (const [event, {handler}] of Object.entries(additions)) {
        if (!BeaconEvent.hasOwnProperty(event)) {
          continue;
        }
        promises.push(
          tezos.beaconClient.client.subscribeToEvent(
            event as BeaconEvent,
            handler as any
          )
        );
      }
      await Promise.all(promises);
    }
  }
  
  export async function cleanUp(tezos: Tezos) {
    if (tezos.beaconClient !== undefined) {
      await tezos.beaconClient.disconnect();
    }
  }
  
  const serializer = new Serializer();
  
  // Also see: interface BeaconEventType<BeaconEvent.PAIR_INIT>
  // Reference: https://github.com/airgap-it/beacon-sdk/blob/f1366ebd17cdc02842e3f78b904ea91cc9e903c9/src/events.ts#L324
  export function generatePairingPayload(event: {
    p2pPeerInfo: () => Promise<P2PPairingRequest>;
    postmessagePeerInfo: () => Promise<PostMessagePairingRequest>;
    preferredNetwork: NetworkType;
  }) {
    return {
      p2pSyncCode: event.p2pPeerInfo,
      postmessageSyncCode: event.postmessagePeerInfo,
      preferredNetwork: event.preferredNetwork,
    };
  }
  
  // https://github.com/airgap-it/beacon-sdk/blob/9feca26d30a24575378f01383cb7a62034d43dcd/src/utils/get-tzip10-link.ts
  const getTzip10Link = (url: string, payload: string): string =>
    `${url}?type=tzip10&data=${payload}`;
  
  // https://github.com/airgap-it/beacon-sdk/blob/9feca26d30a24575378f01383cb7a62034d43dcd/src/ui/alert/PairingAlert.ts#L195L197
  export async function generateQrData(event: {
    p2pPeerInfo: () => Promise<P2PPairingRequest>;
  }): Promise<string> {
    const code = await serializer.serialize(await event.p2pPeerInfo());
    const uri = getTzip10Link('tezos://', code);
    return uri;
  }
  
  // TODO implement a state machine for the client
  // const beaconClient = new DAppClient(options);
  // await client.ready;
  // beaconClient.requestPermissions();
  // await client.clearActiveAccount();
  
  // Forcibly destroy the client. We probably shouldn't ever do this. TBD
  // await client.destroy();
  
  /**
   * Get User claims from their tzprofile
   */
  const GetUserClaims = async (walletAddr: string) => {
    return await Axios.post('https://indexer.tzprofiles.com/v1/graphql', {
      query: `query MyQuery { tzprofiles_by_pk(account: \"${walletAddr}\") { valid_claims } }`,
      variables: null,
      operationName: 'MyQuery',
    });
  };
  
  /**
   * Get User Metadata
   * 
   * Converts tzprofiles data to a easy to use/understandable format
   */
  export const GetUserMetadata = async (walletAddr: string) => {
    let tzktData = {} as any;
  
    let tzpData = {} as any;
    try {
      let claims = await GetUserClaims(walletAddr);
      if (claims.data.data.tzprofiles_by_pk !== null)
        for (const claim of claims.data.data.tzprofiles_by_pk.valid_claims) {
          let claimJSON = JSON.parse(claim[1]);
          if (claimJSON.type.includes('TwitterVerification')) {
            if (!tzktData.data || !tzktData.data.twitter) {
              tzpData['twitter'] = claimJSON.evidence.handle;
            }
          } else if (claimJSON.type.includes('BasicProfile')) {
            if (
              claimJSON.credentialSubject.alias !== '' &&
              !(tzktData.data && tzktData.data.alias)
            )
              tzpData['alias'] = claimJSON.credentialSubject.alias;
            tzpData['tzprofile'] = walletAddr;
            tzpData['description'] = claimJSON.credentialSubject.description;
            tzpData['website'] = claimJSON.credentialSubject.website;
            tzpData['logo'] = claimJSON.credentialSubject.logo;
          } 
          else if (claimJSON.type.includes('DiscordVerification')) {
            if (!tzktData.data) {
              tzpData['discord'] = claimJSON.evidence.handle;
            }
          } else if (claimJSON.type.includes('GitHubVerification')) {
            if (!tzktData.data) {
              tzpData['github'] = claimJSON.evidence.handle;
            }
          } else if (claimJSON.type.includes('DnsVerification')) {
            if (!tzktData.data) {
              tzpData['dns'] = claimJSON.credentialSubject.sameAs.slice(4);
            }
          }
        }
    } catch (e) {
      console.error(e, e.stack);
    }
  
    if (tzpData) {
      tzktData.data = tzpData;
    }
  
    if (tzktData.data !== '') {
      tzktData.data = {...tzpData, ...tzktData.data};
    } else if (tzpData) {
      tzktData.data = tzpData;
    }
    return tzktData;
  };
  const tzShadowSocials = [
    {
      f_key: 'github',
      key: 'github.com',
    },
    {
      f_key: 'discord',
      key: 'discord.com',
    },
    {
      f_key: 'twitter',
      key: 'twitter.com',
    },
  ];
  /**
   * handles conversion of socials to our internal format (roughly equates to Ceramic's schemas for basic profile and socials)
   * @param tzAddr 
   * @returns 
   */
  export async function getTezProfileAsProfile(tzAddr: string) {
    try {
      const {data} = await GetUserMetadata(tzAddr);
  
      const basicProfile: Profile = {};
  
      basicProfile.name = data.alias;
      basicProfile.description = data.description;
      basicProfile.url = data.website;
  
      const socials: Social[] = [];
      for (const field of tzShadowSocials) {
        if (data[field.f_key]) {
          socials.push({
            host: field.key,
            id: data[field.f_key],
          });
        }
      }
      return {
        basicProfile,
        socials,
        logoUrl: data.logo,
      };
    } catch {
      return null;
    }
  }
  
  export default tezosObject;
  