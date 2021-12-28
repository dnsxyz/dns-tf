import {
    Card,
    CardActionArea,
    CardMedia,
    makeStyles,
    Typography,
    CardContent,
    Box,
  } from '@material-ui/core';
  import {Link} from 'react-router-dom';
  import {Domain} from '../../controller/hooks/walletToName/tezos';
  import {Token} from '../../types/queries';
  import {getImageUrl} from '../utils';
  import {DomainCanvas} from './widgets/DomainCanvas';
  
  const useStyles = makeStyles(theme => ({
    root: {
      display: 'flex',
      flexDirection: 'row',
      alignContent: 'center',
      justifyContent: 'flex-start',
    },
    media: {
      width: '128px',
      height: '128px',
    },
  }));
  
  type Props = {
    index?: number;
    collection?: string;
    market: 'hen' | 'td';
    token?: Token;
    domain?: Domain;
  };
  
  export function NftListItem(props: Props) {
    const {index, collection, market} = props;
    const classes = useStyles();
    const queryParams =
      collection && index !== undefined
        ? new URLSearchParams({
            b: collection,
            i: index.toString(),
          }).toString()
        : '';
  
    return (
      <Card key={index} square elevation={0}>
        <CardActionArea
          className={classes.root}
          component={Link}
          to={`/nft/${market}/${
            market === 'hen' ? props.token?.id : props.domain?.name
          }?${queryParams}`}
        >
          {market === 'hen' ? (
            <CardMedia
              className={classes.media}
              component="img"
              alt={props.token?.title}
              loading="lazy"
              image={getImageUrl(props.token?.display_uri)}
              src={getImageUrl(props.token?.display_uri)}
              title={props.token?.title}
            />
          ) : (
            <Box style={{width: '128px', height: '128px'}}>
              <DomainCanvas id={props.domain?.name || ''} enableBorder={true} />{' '}
            </Box>
          )}
  
          <CardContent>
            <Typography variant="h6" component="h2">
              {market === 'hen' ? props.token?.title : props.domain?.name}
            </Typography>
            <Typography variant="body2" component="p">
              {market === 'hen'
                ? props.token?.creator?.name || props.token?.creator?.address
                : props.domain?.owner}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    );
  }
  