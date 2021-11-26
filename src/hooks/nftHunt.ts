import Axios, {AxiosRequestConfig} from 'axios';
import useAxios from 'axios-hooks';
import {useCallback, useEffect, useState} from 'react';

import {HUNT_API} from '../../config';
import {
  APICalls,
  AuthAPICallOptions,
  callAPI,
  HuntInfo,
  HuntItem,
  HuntListItem,
  JWSSigner,
} from '../../state/clients/nftHunt';
import {
  decrementRemainingHunts,
  fetchHunterInfo,
  selectHunt,
} from '../../state/reducers/nftHunt';
import {useCeramic} from './ceramic';
import {useAppDispatch, useAppSelector} from './store';

export function useNFTUserActions(sign?: JWSSigner) {
  const dispatch = useAppDispatch();
  return {
    upvoteNFTItem: useCallback(
      async (huntId: string, itemId: string) => {
        if (!sign) {
          throw new Error('User is not authenticated');
        }
        const params = {huntId, itemId};
        const options: AuthAPICallOptions = {sign};
        return Axios(await callAPI(APICalls.UPVOTE_NFT_ITEM, params, options));
      },
      [sign]
    ),
    huntNFTItem: useCallback(
      async (huntId: string, itemId: string) => {
        if (!sign) {
          throw new Error('User is not authenticated');
        }
        const params = {huntId, itemId};
        const options: AuthAPICallOptions = {sign};
        const r = Axios(await callAPI(APICalls.HUNT_NFT_ITEM, params, options));
        dispatch(decrementRemainingHunts());
        return r;
      },
      [dispatch, sign]
    ),
  };
}

export function useNFTAdminActions(sign?: JWSSigner) {
  return {
    createNFTHunt: useCallback(async () => {
      if (!sign) {
        throw new Error('User is not authenticated');
      }
      const params = {};
      const options: AuthAPICallOptions = {sign};
      return (
        await Axios(await callAPI(APICalls.CREATE_NFT_HUNT, params, options))
      ).data;
    }, [sign]),
    closeNFTHunt: useCallback(
      async (huntId: string) => {
        if (!sign) {
          throw new Error('User is not authenticated');
        }
        const params = {huntId};
        const options: AuthAPICallOptions = {sign};
        return Axios(await callAPI(APICalls.CLOSE_NFT_HUNT, params, options));
      },
      [sign]
    ),
  };
}

function useAPICall(getConfig?: Promise<AxiosRequestConfig>) {
  const [{data, loading}, refetch] = useAxios(
    {},
    {
      manual: true,
    }
  );

  const [expectingReq, setExpectingReq] = useState<boolean>(false);
  const [, setNameCheckPid] = useState<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!getConfig) {
      return;
    }
    setExpectingReq(true);
    setNameCheckPid(oldPid => {
      if (oldPid) {
        clearTimeout(oldPid);
      } else {
        getConfig.then(config => {
          refetch(config);
          setExpectingReq(false);
        });
        return setTimeout(() => {}, 0);
      }
      return setTimeout(() => {
        getConfig.then(config => {
          refetch(config);
          setExpectingReq(false);
        });
      }, 700);
    });
  }, [getConfig, refetch]);

  return {
    data: data ? JSON.parse(Object.values(data).join('')) : undefined,
    loading: loading || expectingReq,
  };
}

export function useNFTList(
  huntId: string,
  {offset, limit, sort}: {offset: number; limit: number; sort: string}
) {
  const {userDid} = useCeramic();
  const [{data, loading}] = useAxios<HuntListItem[]>({
    url: `${HUNT_API}/api/v0/list_items`,
    params: {
      hunt_id: huntId,
      start: offset,
      limit,
      viewer_id: userDid,
      sort_by: sort,
    },
  });

  return {
    nftList: data, // FIXME unsafe cast
    loading,
  };
}

export function useHuntInfo() {
  const [{data, loading}] = useAxios<HuntInfo>({
    url: `${HUNT_API}/api/v0/current_hunt`,
  });

  return {
    huntInfo: data,
    loading,
  };
}

export function useNFTItem(
  huntId?: string,
  itemId?: string,
  viewerId?: string
) {
  const [getConfig, setGetConfig] = useState<Promise<AxiosRequestConfig>>();

  useEffect(() => {
    if (huntId && itemId) {
      const ourRequest = Axios.CancelToken.source();
      setGetConfig(
        callAPI.bind(
          null,
          APICalls.GET_NFT_ITEM,
          {huntId, itemId, viewerId},
          {cancelToken: ourRequest.token}
        )
      );

      return () => {
        ourRequest.cancel();
      };
    }
  }, [huntId, itemId, viewerId]);

  const {data, loading} = useAPICall(getConfig);

  return {
    nftItem: data as HuntItem, // FIXME unsafe cast
    done: !loading,
  };
}

export function useHuntState() {
  const dispatch = useAppDispatch();
  const {userRemainingHunts} = useAppSelector(selectHunt); //Number of remaining hunts a user has
  const {userDid} = useCeramic();
  return {
    userRemainingHunts,
    fetchHunterInfo: useCallback(() => {
      if (!userDid) {
        throw new Error('User is not authenticated');
      }
      return dispatch(fetchHunterInfo(userDid));
    }, [dispatch, userDid]),
  };
}
