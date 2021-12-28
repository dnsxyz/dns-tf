import {
    Box,
    Card,
    CardActionArea,
    CardMedia,
    Fade,
    makeStyles,
    useTheme,
    Typography,
  } from '@material-ui/core';
  import {useState} from 'react';
  import 'react-aspect-ratio/aspect-ratio.css';
  import AspectRatio from 'react-aspect-ratio';
  import {Token} from '../../types/queries';
  import {getImageUrl, shortenWallet} from '../utils';
  import {Link} from '../../controller/util/router';
  import {DomainCanvas} from './DomainCanvas';
  import {Domain} from '../../controller/hooks/walletToName/tezos';
  
  const useStyles = makeStyles(theme => ({
    root: {
      width: '100%',
    },
    infoContainer: {
      display: 'grid',
      height: '100%',
      width: '100%',
      cursor: 'pointer',
    },
    media: {
      height: '100%',
      width: '100%',
      objectFit: 'cover',
      objectPosition: 'center',
    },
    actions: {
      alignSelf: 'end',
    },
    imgOverlay: {
      backgroundColor: theme.palette.background.paper,
      width: '100%',
      borderBottomRightRadius: theme.shape.borderRadius,
      color: theme.palette.background.paper,
    },
    headMatter: {
      position: 'absolute',
      padding: '10px',
      color: 'white',
      width: '100%',
      height: '100%',
      backgroundColor: '#00000042',
    },
  }));
  
  type Props = {
    index?: number;
    collection?: string;
    domain?: Domain;
    token?: Token;
    market: 'hen' | 'td';
  };
  
  export function NftThumb(props: Props) {
    const {index, collection, market} = props;
    const classes = useStyles();
    const [hovering, setHovering] = useState(false);
    const theme = useTheme();
  
    const headMatter = (
      <>
        <Typography variant="h6">
          {market === 'hen' ? props?.token?.title : props.domain?.name}
        </Typography>
        <Typography variant="subtitle2">
          {market === 'hen'
            ? props.token?.creator?.name ||
              shortenWallet(props.token?.creator?.address || '')
            : shortenWallet(props.domain?.owner || '')}
        </Typography>
      </>
    );
    
    //Get the index in board and collection identifier. Currently only created and collected are supported
    const queryParams =
      collection && index !== undefined
        ? new URLSearchParams({
            b: collection,
            i: index.toString(),
          }).toString()
        : '';
  
    return (
      <AspectRatio ratio="1/1" className={classes.root}>
        <Card
          className={classes.root}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          <CardActionArea
            classes={{root: classes.media}}
            component={Link}
            to={`/nft/${market}/${
              market === 'hen' ? props.token?.id : props.domain?.name
            }?${queryParams}`}
          >
            <Fade in={hovering} timeout={theme.transitions.duration.short}>
              <Box className={classes.headMatter}>{headMatter}</Box>
            </Fade>
            {market === 'hen' ? (
              <CardMedia
                component="img"
                className={classes.media}
                src={getImageUrl(props.token?.display_uri)}
                image={getImageUrl(props.token?.display_uri)}
                loading="lazy"
                alt={props.token?.title}
              />
            ) : (
              <DomainCanvas id={props.domain?.name || ''} enableBorder={false} />
            )}
          </CardActionArea>
        </Card>
      </AspectRatio>
    );
  }
  