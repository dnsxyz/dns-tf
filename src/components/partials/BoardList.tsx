import {makeStyles} from '@material-ui/core';
import {Typography} from '@material-ui/core';
import clsx from 'clsx';
import InfiniteScroll from 'react-infinite-scroll-component';
import {Domain} from '../../../controller/hooks/walletToName/tezos';
import {Token} from '../../../types/queries';
import {NftListItem} from '../NftListItem';

const useStyles = makeStyles(theme => ({
  root: {
    '& > *': {
      marginBottom: theme.spacing(0.5),
    },
  },
}));

type Props = {
  tokens: Token[];
  board: string;
  next: () => void;
  hasMore: boolean;
  domains: Domain[];
};

export function BoardList({tokens, next, hasMore, board, domains}: Props) {
  const classes = useStyles();

  return (
    <InfiniteScroll
      className={clsx('MuiList-root', classes.root)}
      dataLength={tokens.length}
      hasMore={hasMore}
      next={next}
      loader={<Typography variant="h2">Loading...</Typography>}
    >
      {domains.map((domain, index) => (
          //For tezos domains
        <NftListItem
          market="td"
          domain={domain}
          key={domain.name}
          index={index}
          collection={board}
        />
      ))}
      {tokens.map((token, index) => (
        <NftListItem
          token={token}
          key={token.id}
          index={domains.length + index}
          collection={board}
          market="hen"
        />
      ))}
    </InfiniteScroll>
  );
}
