import {AxiosRequestConfig} from 'axios';
import {DID} from 'dids';
import {HUNT_API} from '../../config';

export type HuntInfo = {
  _id: string;
  created_at: string;
  expire_at: string | null;
  series_id: string;
  series_seq: number;
};

export type HuntItemContent = {
  id: string;
  added_date: string;
  creator_id: string;
  hunt_Id: string;
  upvotes: number;
  rank: number;
};
export type HuntListItem = HuntItemContent & {
  already_voted: boolean;
};

export type HuntItem = {
  status: string;
  content: HuntItemContent;
  rank: number;
  alreadyVoted: boolean;
};

export type UserHuntActionHandler = (
  huntId: string,
  itemIdId: string
) => Promise<any>;

const API_ENDPOINT = `${HUNT_API}/api/`;
const API_VERSION = 'v0';
const API_URL = `${API_ENDPOINT}${API_VERSION}`;

export enum APICalls {
  // User interfaces
  GET_CURRENT_HUNT = '/current_hunt',
  GET_NFT_LIST = '/list_items',
  GET_NFT_ITEM = '/get_item',
  UPVOTE_NFT_ITEM = '/upvote_item',
  HUNT_NFT_ITEM = '/hunt_item',

  // Admin interfaces
  CREATE_NFT_HUNT = '/create_hunt',
  CLOSE_NFT_HUNT = '/close_hunt',
}

export type APICallParams = {
  [APICalls.GET_CURRENT_HUNT]: {};
  [APICalls.GET_NFT_LIST]: {
    huntId: string;
    start?: number;
    limit?: number;
  };
  [APICalls.GET_NFT_ITEM]: {
    huntId: string;
    itemId: string;
  };
  [APICalls.UPVOTE_NFT_ITEM]: {
    huntId: string;
    itemId: string;
  };
  [APICalls.HUNT_NFT_ITEM]: {
    huntId: string;
    itemId: string;
  };
  [APICalls.CREATE_NFT_HUNT]: {};
  [APICalls.CLOSE_NFT_HUNT]: {
    huntId: string;
  };
};

export type JWSSigner = typeof DID.prototype.createJWS;

export interface GlobalAPICallOptions {}

export interface AuthAPICallOptions extends GlobalAPICallOptions {
  sign: JWSSigner;
}

export type APICallOptions = {
  [APICalls.GET_CURRENT_HUNT]: GlobalAPICallOptions;
  [APICalls.GET_NFT_LIST]: GlobalAPICallOptions;
  [APICalls.GET_NFT_ITEM]: GlobalAPICallOptions;
  [APICalls.UPVOTE_NFT_ITEM]: AuthAPICallOptions;
  [APICalls.HUNT_NFT_ITEM]: AuthAPICallOptions;
  [APICalls.CREATE_NFT_HUNT]: AuthAPICallOptions;
  [APICalls.CLOSE_NFT_HUNT]: AuthAPICallOptions;
};

export type APICallResponse = {
  [APICalls.GET_CURRENT_HUNT]: {
    hunt_id: string;
  };
  [APICalls.GET_NFT_LIST]: HuntItem[];
  [APICalls.GET_NFT_ITEM]: HuntItem;
  [APICalls.UPVOTE_NFT_ITEM]: {};
  [APICalls.HUNT_NFT_ITEM]: {};
  [APICalls.CREATE_NFT_HUNT]: {
    huntId: string;
  };
  [APICalls.CLOSE_NFT_HUNT]: {};
};

// util functions

function strToSnakeCase(str: string): string {
  const result: string[] = [];
  for (let i = 0; i < str.length; i++) {
    const char = str.charAt(i);
    if (char.toUpperCase() === char) {
      result.push('_', char.toLowerCase());
    } else {
      result.push(char);
    }
  }
  return result.join('');
}

function strToCamelCase(str: string): string {
  const result: string[] = [];
  for (let i = 0; i < str.length; i++) {
    const char = str.charAt(i);
    if (char === '_') {
      result.push(str.charAt(++i).toUpperCase());
    } else {
      result.push(char);
    }
  }
  return result.join('');
}

function convertKeysToSnakeCase(obj: Record<string, any>) {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[strToSnakeCase(key)] = value;
  }
  return result;
}

function convertKeysToCamelCase(obj: Record<string, any>) {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[strToCamelCase(key)] = value;
  }
  return result;
}

// api calls

export async function callAPI(
  call: APICalls,
  params: APICallParams[typeof call],
  options: APICallOptions[typeof call] = {}
): Promise<AxiosRequestConfig> {
  switch (call) {
    case APICalls.GET_CURRENT_HUNT:
    case APICalls.GET_NFT_LIST:
    case APICalls.GET_NFT_ITEM: {
      return {
        method: 'GET',
        url: `${API_URL}${call}`,
        params: convertKeysToSnakeCase(params),
        transformResponse: convertKeysToCamelCase,
      };
    }
    case APICalls.UPVOTE_NFT_ITEM:
    case APICalls.HUNT_NFT_ITEM:
    case APICalls.CREATE_NFT_HUNT:
    case APICalls.CLOSE_NFT_HUNT: {
      const {sign} = options as AuthAPICallOptions; // FIXME not sure why TS doesn't understand `options`'s type
      return {
        method: 'POST',
        url: `${API_URL}${call}`,
        data: {jws: await sign(convertKeysToSnakeCase(params))},
        transformResponse: convertKeysToCamelCase,
      };
    }
  }
}
