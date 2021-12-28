import {useQuery} from '@apollo/client';
import {Typography} from '@material-ui/core';
import {useCallback, useState} from 'react';
import {useMemo} from 'react';
import {useRouteMatch} from 'react-router-dom';
import {
  HEN_COLLECTED_QUERY,
  HEN_CREATED_QUERY,
} from '../../../controller/queryFragments/hen';
import {TokenHolderRes, PaginationVars, Token} from '../../../types/queries';
import {BoardGrid} from './BoardGrid';

const PAGE_SIZE = 30;

type HENTokenHolderResult = {
  hic_et_nunc_token_holder: TokenHolderRes[];
  hic_et_nunc_token_holder_aggregate: {aggregate: {count: number}};
};
type HENTokenCreatorResult = {
  hic_et_nunc_token: Token[];
  hic_et_nunc_token_aggregate: {aggregate: {count: number}};
};
type WalletsVars = PaginationVars & {wallets: string[]};

type HENTokenCombined = HENTokenHolderResult & HENTokenCreatorResult;

/**
 * Displays a grid version of HEN NFTs
 * @param param0 
 * @returns 
 */
export function HENGrid({
  tzWallets,
  colType,
}: {
  tzWallets: string[];
  colType: string;
}) {
  const {loading, data, error, fetchMore} = useQuery<
    HENTokenCombined,
    WalletsVars
  >(colType === 'collected' ? HEN_COLLECTED_QUERY : HEN_CREATED_QUERY, {
    variables: {
      wallets: tzWallets,
      offset: 0,
      limit: PAGE_SIZE,
    },
  });
  //Parses params out of the URL. For example: /nft/:market/:id
  const {params} = useRouteMatch<{id: string}>();
  const [page, setPage] = useState(0); //page number for pagination

  //Counts tokens. Switch statement for handling created vs collected.
  const tokenCount = useMemo(
    () =>
      data
        ? colType === 'collected'
          ? data.hic_et_nunc_token_holder_aggregate.aggregate.count
          : data.hic_et_nunc_token_aggregate.aggregate.count
        : 0,
    [colType, data]
  );

  //Checks if there are more NFTs to show. If user has looked through all of nfts in a collection
  const hasMore = useMemo<boolean>(
    () =>
      data
        ? tokenCount >
          (colType === 'collected'
            ? data.hic_et_nunc_token_holder
            : data.hic_et_nunc_token
          ).length
        : false,
    [colType, data, tokenCount]
  );
  
  //Array of all tokens. (title, description, creator, display_uri, etc)
  const tokens = useMemo(
    () =>
      data
        ? colType === 'collected'
          ? data.hic_et_nunc_token_holder.map(x => x.token)
          : data.hic_et_nunc_token.map(x => x)
        : [],
    [colType, data]
  );

  const nextPage = useCallback(() => {
    const newPage = page + 1;
    fetchMore({variables: {offset: newPage * PAGE_SIZE}});
    setPage(newPage);
  }, [fetchMore, page]);
  return loading ? (
    <Typography variant="h2">Loading</Typography>
  ) : error ? (
    <Typography variant="h2">Error :(</Typography>
  ) : (
    <BoardGrid
      tokens={tokens}
      hasMore={hasMore}
      board={`${params.id}/${colType}`}
      next={nextPage}
    />
  );
}
