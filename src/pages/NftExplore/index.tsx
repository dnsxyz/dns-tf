import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import Slider from 'react-slick';

import {Link} from '../../../controller/util/router';

import {
  Button,
  Container,
  Typography,
  TypographyProps,
} from '@material-ui/core';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Grid from '@mui/material/Grid';

import {CreatorSpotlight} from '../home/CreatorSpotlight';
import CreatorAvatar from '../NftHome/CreatorAvatar';
import {PropsWithChildren, useState} from 'react';
import {LinkProps} from 'react-router-dom';
import {NftThumb} from '../../components/NftThumb';
import {Stack} from '@mui/material';
import {Token} from '../../../types/queries';
import {useQuery} from '@apollo/client';
import {
  HENTokenResult,
  HEN_GREATER_PRICE_QUERY,
  HEN_LESSER_PRICE_QUERY,
  HEN_LOW_EDITIONS_REMAINING_QUERY,
  HEN_TOP_SOLD_SINCE_QUERY,
  HEN_UNIQUE_EDITIONS_QUERY,
} from '../../../controller/queryFragments/hen';

import {subDays} from 'date-fns';
import {getImageUrl} from '../../utils';
import {v4 as uuid} from 'uuid';
import useAxios from 'axios-hooks';

const DNSCreators = [
  {
    name: 'PsychxnauT',
    img: 'https://ipfs.dns.pizza/ipfs/bafybeid55p6jiseearkk5wg34zfeokt362dzco2qtkefvp6nfojtciot7a',
    link: 'psychxnaut',
  },
  {
    name: 'ViNNi KiNiKi',
    img: 'https://ipfs.dns.pizza/ipfs/bafkreigxbcmu2vhivk3pnl62wmqlk6sg3iyo6omyz5i3j2mjs2fgdsm7gy',
    link: 'ViNNiKiNiKi',
  },
  {
    name: 'Xanderhizome',
    img: 'https://ipfs.dns.pizza/ipfs/bafybeia6w54qkxwqzcedgfjwsyu2x2j7brhzdi4exududqe2v2nvjkcnym',
    link: 'xanderhizome',
  },
];

const HIC_ET_CACHE_URL = 'https://hic-et-cache.dns.pizza';

const useStyles = makeStyles(theme => ({
  root: {
    '& > *': {
      margin: theme.spacing(4, 0),
    },
    marginBottom: theme.spacing(4),
  },
  slider: {
    boxShadow: theme.shadows[11],
    margin: '0px',
  },
  sliderArrowPrev: {
    '&::before': {
      color: theme.palette.text.primary,
      fontSize: '30px',
      marginLeft: '-0.5rem',
    },
  },
  sliderArrowNext: {
    '&::before': {
      color: theme.palette.text.primary,
      fontSize: '30px',
      marginLeft: '-0.2rem',
    },
  },
  barText: {
    fontFamily: 'Roboto',
    fontSize: '20px',
    fontWeight: 600,
    paddingTop: '50px',
    paddingBottom: '2px',
    marginBottom: '0px',
    //textTransform: 'uppercase',
  },
  nftRow: {
    width: '100%',
    /* [theme.breakpoints.down('md')]: {
      width: '80%'
    },
    [theme.breakpoints.up('md')]: {
    },*/
  },
  nftRank: {
    [theme.breakpoints.down('md')]: {
      display: 'none',
    },
    [theme.breakpoints.up('md')]: {
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
  nftText: {
    [theme.breakpoints.down('md')]: {
      fontSize: '1.15em',
    },
  },
  nftRowInfoBox: {
    marginLeft: theme.spacing(2.5),
  },
}));

function LinkButton({children, to, style}: PropsWithChildren<LinkProps>) {
  return (
    <Button
      fullWidth
      style={{
        textAlign: 'center',
        ...(style || {}),
      }}
      component={Link}
      to={to}
    >
      {children}
    </Button>
  );
}

function Carousel({
  title,
  data,
}: {
  title: string;
  data: Token[] | undefined;
  loading: boolean;
  error: any | undefined;
}) {
  const [id] = useState(() => uuid());
  const classes = useStyles();

  return (
    <>
      <TitleText>{title}</TitleText>
      <Slider
        infinite
        slidesToShow={1}
        slidesToScroll={1}
        autoplay
        autoplaySpeed={5000}
        className={classes.slider}
      >
        {data?.map(
          (token, index) =>
            index < 6 && (
              // FIXME: add creator name
              <CreatorSpotlight
                key={id + index}
                name={token.title}
                imageSrc={
                  getImageUrl(token.display_uri || token.artifact_uri) || ''
                }
                to={`/nft/hen/${token.id}`}
              >
                {token.description}
              </CreatorSpotlight>
            )
        )}
      </Slider>
    </>
  );
}

function TitleText({children, ...props}: PropsWithChildren<TypographyProps>) {
  const classes = useStyles();
  return (
    <Typography
      variant="subtitle2"
      gutterBottom
      className={classes.barText}
      {...props}
    >
      {children}
    </Typography>
  );
}

function Ranked({
  loading,
  data,
  error,
}: {
  loading?: boolean;
  data?: Token[];
  error?: any;
}) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={8}>
        <NftThumb market="hen" token={data?.[0]} />
      </Grid>
      <Grid item xs={4}>
        <Stack spacing={2}>
          <NftThumb market="hen" token={data?.[1]} />
          <NftThumb market="hen" token={data?.[2]} />
        </Stack>
      </Grid>
    </Grid>
  );
}

const EMPTY_GRID: Token[] = new Array(6).fill({});

type HENTradeResult = {
  hic_et_nunc_trade: {
    timestamp: Date;
    swap: {
      price: number;
    };
    token: Token;
  }[];
};

export function NftExplore() {
  const [date] = useState(subDays(new Date(), 1).toISOString());

  const [{data: mostSoldData, loading: mostSoldLoading, error: mostSoldError}] =
    useAxios<{data: HENTradeResult}>({
      url: `${HIC_ET_CACHE_URL}/explore/HEN_TOP_SOLD_SINCE_QUERY`,
    });
  const [{data: uniqueData, loading: uniqueLoading, error: uniqueError}] =
    useAxios<{data: HENTokenResult}>({
      url: `${HIC_ET_CACHE_URL}/explore/HEN_UNIQUE_EDITIONS_QUERY`,
    });
  const [{data: fewData}] = useAxios<{data: HENTokenResult}>({
    url: `${HIC_ET_CACHE_URL}/explore/HEN_LOW_EDITIONS_REMAINING_QUERY`,
  });

  const [{data: cheapData, loading: cheapLoading, error: cheapError}] =
    useAxios<{data: HENTokenResult}>({
      url: `${HIC_ET_CACHE_URL}/explore/HEN_LESSER_PRICE_QUERY`,
    });

  const [
    {data: expensiveData, loading: expensiveLoading, error: expensiveError},
  ] = useAxios<{data: HENTokenResult}>({
    url: `${HIC_ET_CACHE_URL}/explore/HEN_GREATER_PRICE_QUERY`,
  });

  const mostExpensive: Token[] = [];
  if (mostSoldData?.data) {
    for (const {token} of mostSoldData?.data?.hic_et_nunc_trade) {
      if (mostExpensive.findIndex(t => t.id === token.id) === -1) {
        mostExpensive.push(token);
      }
    }
  }

  const classes = useStyles();

  return (
    <Container maxWidth="md" className={classes.root}>
      <Typography
        style={{
          fontFamily: 'Roboto',
          fontSize: '36px',
          fontWeight: 700,
        }}
      >
        Explore
      </Typography>

      <TitleText
        style={{
          marginBottom: '1.2em',
          paddingTop: '1em',
        }}
      >
        ARTISTS TO KNOW
      </TitleText>
      <Grid container justifyContent="space-around" spacing={3}>
        {DNSCreators.map(eb => (
          <CreatorAvatar key={eb.name} imageSrc={eb.img} link={eb.link} />
        ))}
      </Grid>

      {/* <TitleText>MOST EDITIONS SOLD TODAY</TitleText> */}

      <TitleText>TODAY'S MOST EXPENSIVE</TitleText>
      <Ranked
        loading={mostSoldLoading}
        data={mostExpensive}
        error={mostSoldError}
      />

      <Carousel
        title="UNIQUE EDITIONS"
        loading={uniqueLoading}
        data={uniqueData?.data?.hic_et_nunc_token?.slice(0, 6) ?? EMPTY_GRID}
        error={uniqueError}
      />

      <TitleText>ONLY A FEW LEFT</TitleText>
      <Grid container spacing={2}>
        {fewData?.data?.hic_et_nunc_token?.slice(0, 6)?.map(
          (token, index) =>
            index < 6 && (
              <Grid item xs={4} key={token.id}>
                <NftThumb
                  market="hen"
                  token={token}
                  index={index}
                  // collection={board}
                />
              </Grid>
            )
        )}
      </Grid>

      <TitleText>LESS THAN 5 TEZ</TitleText>
      <Grid container spacing={2}>
        {cheapData?.data?.hic_et_nunc_token?.slice(0, 6)?.map(
          (token, index) =>
            index < 6 && (
              <Grid item xs={4} key={token.id}>
                <NftThumb
                  market="hen"
                  token={token}
                  index={index}
                  // collection={board}
                />
              </Grid>
            )
        )}
      </Grid>

      <Carousel
        title="100 TEZ OR MORE"
        loading={expensiveLoading}
        data={expensiveData?.data?.hic_et_nunc_token?.slice(0, 6) ?? EMPTY_GRID}
        error={expensiveError}
      />

      <div
        style={{
          paddingBottom: '24px',
        }}
      />
    </Container>
  );
}
