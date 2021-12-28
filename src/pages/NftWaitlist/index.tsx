import React, {useCallback, useState} from 'react';

import {Box, Typography, Paper, Button} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Axios from 'axios';
import {useTezAuth} from '../../../controller/hooks/tezosAuth';

const useStyles = makeStyles(theme => ({
  card: {
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column',
      //aspectRatio: '1 / 2'
    },
    [theme.breakpoints.up('md')]: {
      flexDirection: 'row',
      //paddingBottom: '10%',
      //paddingTop: '10%'
    },
    padding: '3%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aspectRatioCard: {
    [theme.breakpoints.down('md')]: {
      //aspectRatio: '1 / 2'
    },
    [theme.breakpoints.up('md')]: {
      //aspectRatio: '1 / 2'
    },
  },
  mediaCard: {
    aspectRatio: '1',
    [theme.breakpoints.down('md')]: {
      width: 'auto',
      //aspectRatio: '1 / 2'
    },
    [theme.breakpoints.up('md')]: {
      width: '50%',
      //paddingBottom: '10%',
      //paddingTop: '10%'
    },
  },
}));

export function NftWaitlist() {
  const classes = useStyles();
  const {
    changeProvider: changeTezProvider,
    initialized: tezInitialized,
    walletAddress,
  } = useTezAuth();

  const activateTezAdd = useCallback(async () => {
    try {
      await changeTezProvider();
      if (walletAddress) {
        await Axios.post(
          'https://nft-invite-backend.herokuapp.com/api/v0/register',
          {
            addr: walletAddress,
          }
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
    }
  }, [changeTezProvider, walletAddress]);

  return (
    <div style={{height: '100vh', display: 'flex', flexDirection: 'column'}}>
      <Box
        style={{
          display: 'flex',
          justifyContent: 'center',
          background:
            'linear-gradient(130deg,#06d8ff,rgba(69,52,245,.8) 48%,rgba(194,38,173,.7))',
        }}
      >
        <Box style={{marginTop: '5%', marginBottom: '5%', textAlign: 'center'}}>
          <Box
            style={{
              width: '100%',
              backgroundColor: 'red',
            }}
          ></Box>
          <Typography variant="h3" style={{fontWeight: 500}}>
            DNS Marketplace Airdrop!
          </Typography>
          <Typography variant="subtitle1">
            We are proud to announce DNS is launching its NFT marketplace! Soon
            you will be able to list your Tezos and Ethereum NFTs. We are
            partnering with Rarible DAO for this. We are planning a giveaway for
            our early adopters. Complete the following steps to be eligible for
            your NFT!
          </Typography>
        </Box>
      </Box>

      <Box style={{display: 'flex', flexDirection: 'column'}}>
        <Box
          style={{
            maxWidth: '800px',
            width: '90%',
            display: 'flex',
            padding: '2%',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          <Card className={classes.card} sx={{display: 'flex'}}>
            <CardMedia
              className={classes.mediaCard}
              component="img"
              sx={{width: '50%'}}
              image="https://lh3.googleusercontent.com/64h87Qhql8_bRPyeDf3KF0Br4-YpA59MCxk9bgo4ptBDKzEubDvSYLdC54o8BU62HJK5h-EAjgSmZxIMsAztzs25dsb0FZUxjECi=w1328"
              alt="Live from space album cover"
            />

            <CardContent
              sx={{
                flex: '1 1 50%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
              className={classes.aspectRatioCard}
            >
              <Typography variant="h4" style={{marginTop: 'auto'}}>
                DNS Genesis Drop
              </Typography>
              <Typography style={{marginTop: 'auto'}}>
                1. Join our Discord <br />
                2. RT this giveaway post, and tag three friends in a reply{' '}
                <br />
                3. Sign in with your wallet <br />
              </Typography>

              <Button
                variant="contained"
                fullWidth
                style={{marginTop: 'auto'}}
                onClick={activateTezAdd}
              >
                Connect
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Box>
      <footer
        style={{
          display: 'flex',
          justifyContent: 'center',
          //paddingTop: '35%',
          paddingBottom: '2%',
          //position: 'absolute',
          bottom: '10px',
          textAlign: 'center',
          //left: '50%'
          marginTop: 'auto',
          flexDirection: 'column',
        }}
      >
        <Box>
          <Typography variant="h4">DNS</Typography>
        </Box>
        <Box>
          <a href="https://discord.gg/dnsxyz" style={{color: 'inherit'}}>
            <span style={{marginRight: '0.5em'}}>Discord</span>
          </a>
          <a href="https://twitter.com/dns" style={{color: 'inherit'}}>
            <span style={{marginRight: '0.5em'}}>Twitter</span>
          </a>
          <a href="https://blog.dns.xyz" style={{color: 'inherit'}}>
            <span>Blog</span>
          </a>
        </Box>
      </footer>
    </div>
  );
}
