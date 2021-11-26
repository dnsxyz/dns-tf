import {useQuery} from '@apollo/client';
import {Grid, makeStyles} from '@material-ui/core';
import {useCallback, useMemo, useState} from 'react';
import {
  HENCreatedResult,
  HEN_CREATED_QUERY,
} from '../../../controller/queryFragments/hen';
import {useNav} from '../../../controller/hooks/nav';
import {Token, PaginationVars} from '../../../types/queries';
import {NftThumb} from '../NftThumb';
import {NftCollection} from './NftCollection';

const useStyles = makeStyles(theme => ({
  square: {
    aspectRatio: '1 / 1',
  },
}));

type WalletsVars = PaginationVars & {wallets: string[]};

const TITLE = 'Created on Hic et Nunc';
const GRID_COLUMNS = 3;

export function HENCreated({tzWallets}: {tzWallets: string[]}) {
  const classes = useStyles();
  const [viewingIndex, setViewingIndex] = useState(0);
  const {loading, data, error, fetchMore} = useQuery<
    HENCreatedResult,
    WalletsVars
  >(HEN_CREATED_QUERY, {
    variables: {
      wallets: tzWallets,
      offset: 0,
      limit: GRID_COLUMNS * 2,
    },
  });

  const tokenCount = useMemo(
    () => (data ? data.hic_et_nunc_token_aggregate.aggregate.count : 0),
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

  return tokenCount > 0 ? (
    <NftCollection
      columns={GRID_COLUMNS}
      title={TITLE}
      index={viewingIndex}
      count={tokenCount}
      onNavigate={pageHandler}
      collectionLink={`${browsedDid}/created`}
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
        data.hic_et_nunc_token
          .slice(viewingIndex, viewingIndex + GRID_COLUMNS)
          .map((token: Token, index) => (
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
