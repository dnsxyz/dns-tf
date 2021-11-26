import {useMemo} from 'react';

import {useQuery} from '@apollo/client';
import Stack from '@mui/material/Stack';

import {useNFTList} from '../../../../controller/hooks/nftHunt';
import {
  HEN_OBJKT_LIST,
  HENObjktListResult,
} from '../../../../controller/queryFragments/hen';
import {HuntListItem} from '../../../../state/clients/nftHunt';
import {DetailToken} from '../../../../types/queries';
import {getImageUrl} from '../../../utils';
import {NftRow} from './NftRow';

type IdList = {
  id: number[];
};
type FetcherProps = {
  items: HuntListItem[];
  rowRender(props: {
    token: DetailToken;
    huntItem: HuntListItem;
    rank: number;
  }): JSX.Element;
};
function NftDetailFetcher({items, rowRender: Row}: FetcherProps) {
  const {data} = useQuery<HENObjktListResult, IdList>(HEN_OBJKT_LIST, {
    variables: {
      id: items.map(item => parseInt(item.id)),
    },
    fetchPolicy: 'no-cache',
    nextFetchPolicy: 'no-cache',
  });
  const dataById = useMemo<{[id: string]: DetailToken}>(() => {
    const r: {[id: string]: DetailToken} = {};
    if (data) {
      data.hic_et_nunc_token.forEach(item => (r[String(item.id)] = item));
    }
    return r;
  }, [data]);

  return (
    <>
      {data &&
        items.map((item, index) => (
          <Row
            key={index}
            rank={index}
            huntItem={item}
            token={dataById[item.id]}
          />
        ))}
    </>
  );
}

type Props = {huntId: string; limit?: number; offset?: number; sort?: string};
export function HuntList({
  huntId,
  limit = 5,
  offset = 0,
  sort = 'score',
}: Props) {
  const {nftList} = useNFTList(huntId, {offset, limit, sort});
  return (
    <Stack spacing={2} alignItems="stretch">
      {nftList ? (
        <NftDetailFetcher
          items={nftList}
          rowRender={({token, huntItem, rank}) => (
            <NftRow
              id={huntItem.id}
              huntId={huntId}
              key={huntItem.id}
              title={token?.title}
              img={getImageUrl(token.display_uri)}
              creatorName={token.creator.name}
              tezosAddress={token.creator.address}
              rank={rank + 1}
              showRank={sort === 'added_date' ? false : true}
              upvotes={huntItem.upvotes}
            />
          )}
        />
      ) : null}
    </Stack>
  );
}
