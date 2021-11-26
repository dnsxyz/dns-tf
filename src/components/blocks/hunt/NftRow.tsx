import {Avatar, Box, Paper, Typography} from '@material-ui/core';
import makeStyles from '@material-ui/core/styles/makeStyles';
import ArrowDropUpOutlinedIcon from '@mui/icons-material/ArrowDropUpOutlined';
import {Link} from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';
import {useTheme} from '@mui/material/styles';
import {useTezosWalletToName} from '../../../../controller/hooks/walletToName/tezos';
import ANONYMOUS_ANAMALS from '../../../resources/animal-icons';
import {shortenWallet} from '../../../utils';
import {
  UpvoteBlock,
  UpvoteBubble,
  UpvoteMobile,
} from '../../widgets/NftHunt/voter';

const useStyles = makeStyles(theme => ({
  nftRow: {
    [theme.breakpoints.down('sm')]: {
      alignItems: 'unset',
      flexDirection: 'column',
    },
    [theme.breakpoints.up('sm')]: {
      alignItems: 'center',
      flexDirection: 'row',
      width: '85%',
    },
  },
  nftRank: {
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
    [theme.breakpoints.up('sm')]: {
      display: 'flex',
    },
    justifyContent: 'center',
    alignItems: 'center',
  },
  nftUpvote: {
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
    [theme.breakpoints.up('sm')]: {
      display: 'flex',
    },
  },
  nftMobile: {
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
    },
    [theme.breakpoints.up('sm')]: {
      display: 'none',
    },
  },

  nftText: {
    [theme.breakpoints.down('md')]: {
      fontSize: '1.15em',
    },
  },
  nftRowInfoBox: {
    marginLeft: theme.spacing(2.5),
  },
  container: {
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      flexDirection: 'column',
    },
    [theme.breakpoints.up('sm')]: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  },
  paperContainer: {
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      flexDirection: 'column',
    },
    [theme.breakpoints.up('sm')]: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  },
  tagColor: {
    color: theme.palette.text.primary,
  },
}));

interface NftRowProps {
  id: string;
  title: string;
  img?: string;
  creatorName?: string;
  creatorImg?: string;
  rank: number;
  upvotes: number;
  tezosAddress?: string;
  showRank?: boolean;
  huntId: string;
}

export function NftRow(props: NftRowProps) {
  const theme = useTheme();
  const classes = useStyles();

  const testData = Object.values(ANONYMOUS_ANAMALS);

  const randomBin = Buffer.from(props.tezosAddress || '', 'base64');
  const firstChar = randomBin[6];

  const selector = firstChar % 78;
  const AvatarPlaceholder = testData[selector] as any;

  const {result: displayName} = useTezosWalletToName(
    props.tezosAddress,
    props.creatorName
      ? props.creatorName + ' (HEN)'
      : props.tezosAddress
      ? shortenWallet(props.tezosAddress as string, 0, 6, 3)
      : ''
  );
  const matches = useMediaQuery(theme.breakpoints.down('sm'));
  return (
    <Box
      style={{
        display: 'flex',
        //alignItems: 'center',
        justifyContent: 'space-evenly',
        paddingTop: '12px',
        paddingBottom: '12px',
      }}
      className={classes.container}
    >
      {props.showRank ? (
        <Paper
          elevation={5}
          square
          className={classes.nftRank}
          style={{
            borderRadius: '50%',
            width: '70px',
            height: '70px',
            aspectRatio: '1/1',
            marginRight: '2%',
          }}
        >
          <Typography variant="h4">{props.rank}</Typography>
        </Paper>
      ) : (
        <div style={{marginRight: '2%', width: '70px', height: '70px'}}></div>
      )}
      <Paper
        elevation={16}
        square
        className={classes.nftRow}
        style={{
          padding: '12px',
          display: 'flex',
          flexWrap: matches ? 'wrap' : 'nowrap',
        }}
      >
        <Link
          to={`/nft/hen/${props.id}`}
          style={{textDecoration: 'none', display: 'contents'}}
          className={classes.tagColor}
        >
          <Box style={{display: 'flex', alignItems: 'center', width: '85%'}}>
            <img
              src={props.img}
              style={{
                width: '120px',
                height: '120px',
              }}
              alt={props.title}
              loading="lazy"
            />
            <Box
              className={classes.nftRowInfoBox}
              style={{marginRight: '12px'}}
            >
              <Box style={{marginBottom: '16px'}} className={classes.nftMobile}>
                <Typography variant="h6">{props.rank}</Typography>
              </Box>
              <Box style={{marginBottom: '16px'}}>
                <Typography variant="h6">{props.title}</Typography>
              </Box>
              <Box style={{display: 'flex', alignItems: 'center'}}>
                <Typography variant="subtitle1" className={classes.nftUpvote}>
                  By
                </Typography>

                {props.creatorImg ? (
                  <Avatar
                    style={{
                      width: '28px',
                      height: '28px',
                      marginRight: '6px',
                      marginLeft: '6px',
                    }}
                    src={props.creatorImg}
                  />
                ) : (
                  <>
                    <AvatarPlaceholder
                      fill={'black'}
                      style={{
                        width: '22px',
                        height: '22px',
                        marginRight: '6px',
                        marginLeft: '6px',
                      }}
                      alt="Avatar"
                    />
                  </>
                )}

                <Typography variant="h6">{displayName}</Typography>
              </Box>
            </Box>
          </Box>
        </Link>

        {matches ? (
          <UpvoteMobile huntId={props.huntId} nftId={props.id} />
        ) : (
          <UpvoteBlock huntId={props.huntId} nftId={props.id} />
        )}
      </Paper>
    </Box>
  );
}
