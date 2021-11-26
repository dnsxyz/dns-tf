import {useQuery} from '@apollo/client';
import {Grid, makeStyles} from '@material-ui/core';
import {useCallback, useMemo, useState} from 'react';
import {
  HENCollectedResult,
  HEN_COLLECTED_QUERY,
} from '../../../controller/queryFragments/hen';
import {useNav} from '../../../controller/hooks/nav';
import {TokenHolderRes, PaginationVars} from '../../../types/queries';
import {NftThumb} from '../NftThumb';
import {NftCollection} from './NftCollection';

type WalletsVars = PaginationVars & {wallets: string[]};

const useStyles = makeStyles(_theme => ({
  square: {
    aspectRatio: '1 / 1',
  },
}));

const TITLE = 'Collected on Hic et Nunc';
const GRID_COLUMNS = 3;

export function HENCollected({tzWallets}: {tzWallets: string[]}) {
  const [viewingIndex, setViewingIndex] = useState(0);
  const {loading, data, error, fetchMore} = useQuery<
    HENCollectedResult,
    WalletsVars
  >(HEN_COLLECTED_QUERY, {
    variables: {
      wallets: tzWallets,
      offset: 0,
      limit: GRID_COLUMNS * 2,
    },
  });

  const tokenCount = useMemo(
    () => (data ? data.hic_et_nunc_token_holder_aggregate.aggregate.count : 0),
    [data]
  );

  const pageHandler = useCallback(
    (newIdx: number) => {
      setViewingIndex(newIdx);
      fetchMore({variables: {offset: newIdx}});
    },
    [fetchMore]
  );

  const {browsedDid} = useNav();

  const classes = useStyles();
  return tokenCount > 0 ? (
    <NftCollection
      columns={GRID_COLUMNS}
      title={TITLE}
      index={viewingIndex}
      count={tokenCount}
      onNavigate={pageHandler}
      collectionLink={`${browsedDid}/collected`}
    >
      {loading ? (
        <Grid item xs={4} className={classes.square}>
          Loading...
        </Grid>
      ) : error ? (
        <Grid item xs={4} className={classes.square}>
          Error!
        </Grid>
      ) : (
        data &&
        data.hic_et_nunc_token_holder
          .slice(viewingIndex, viewingIndex + GRID_COLUMNS)
          .map(({token}: TokenHolderRes, index) => (
            <Grid item xs={4} key={token.id}>
              <NftThumb
                token={token}
                index={index}
                collection={`${tzWallets[0]}/created`}
              />
            </Grid>
          ))
      )}
    </NftCollection>
  ) : null;
}
