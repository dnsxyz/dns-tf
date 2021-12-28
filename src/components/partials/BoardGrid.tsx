import {Grid} from '@material-ui/core';
import clsx from 'clsx';
import InfiniteScroll from 'react-infinite-scroll-component';
import {Domain} from '../../../controller/hooks/walletToName/tezos';
import {Token} from '../../../types/queries';
import {NftThumb} from '../NftThumb';

type Props = {
  domains: Domain[];
  tokens: Token[];
  board: string;
  next: () => void;
  hasMore: boolean;
};

export function BoardGrid({tokens, next, hasMore, board, domains}: Props) {
  return (
    <InfiniteScroll
      className={clsx(
        'MuiGrid-root',
        'MuiGrid-container',
        'MuiGrid-spacing-xs-2'
      )}
      dataLength={tokens.length}
      hasMore={hasMore}
      next={next}
      loader={
        <Grid item xs={12} key="__loading__">
          Loading...
        </Grid>
      }
    >
      {domains.map((domain, index) => (
        <Grid item xs={4} key={domain.name}>
          <NftThumb
            market="td"
            domain={domain}
            index={index}
            collection={board}
          />
        </Grid>
      ))}
      {tokens.map((token, index) => (
        <Grid item xs={4} key={token.id}>
          <NftThumb
            market="hen"
            token={token}
            index={domains.length + index}
            collection={board}
          />
        </Grid>
      ))}
    </InfiniteScroll>
  );
}
