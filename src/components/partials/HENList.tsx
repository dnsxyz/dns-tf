import {useQuery} from '@apollo/client';
import {Typography} from '@material-ui/core';
import {useCallback, useMemo, useState} from 'react';
import {useRouteMatch} from '../../../controller/util/router';
import {
  HEN_COLLECTED_QUERY,
  HEN_CREATED_QUERY,
} from '../../../controller/queryFragments/hen';
import {TokenHolderRes, PaginationVars, Token} from '../../../types/queries';
import {BoardList} from './BoardList';

const PAGE_SIZE = 15;

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
 * Display a list view of NFTs
 * @param param0 
 * @returns 
 */
export function HENList({
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
  const {params} = useRouteMatch<{id: string}>();
  const [page, setPage] = useState(0);

  const tokenCount = useMemo(
    () =>
      data
        ? colType === 'collected'
          ? data.hic_et_nunc_token_holder_aggregate.aggregate.count
          : data.hic_et_nunc_token_aggregate.aggregate.count
        : 0,
    [colType, data]
  );

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
    <BoardList
      tokens={tokens}
      hasMore={hasMore}
      board={`${params.id}/${colType}`}
      next={nextPage}
    />
  );
}
