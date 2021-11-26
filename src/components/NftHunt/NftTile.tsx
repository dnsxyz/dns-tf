import {
    Box,
    Paper,
    Typography,
    Avatar,
    Button,
    Divider,
    TextField,
    FormControl,
    InputLabel,
    InputBase,
  } from '@material-ui/core';
  import ArrowDropUpOutlinedIcon from '@mui/icons-material/ArrowDropUpOutlined';
  import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
  
  interface HuntRowProps {
    title: string;
    author: string;
    authorAvatar: string;
    nftUrl: string;
    upvotes: number;
    rank: number;
  }
  
  export function NftTile(props: HuntRowProps) {
    return (
      <Paper style={{display: 'flex', flexDirection: 'column', width: '256px'}}>
        <img
          src={props.nftUrl}
          style={{width: '256px', height: '256px'}}
          alt="ramine party"
        />
        <Box
          style={{
            width: '80%',
            marginLeft: 'auto',
            marginRight: 'auto',
            paddingTop: '6px',
            paddingBottom: '12px',
          }}
        >
          <Box style={{display: 'flex', alignItems: 'center'}}>
            <Typography variant="subtitle1">{props.title}</Typography>
            <Box style={{marginLeft: 'auto'}}>
              {props.rank}{' '}
              <img
                src={props.authorAvatar}
                style={{
                  width: '16px',
                  height: '16px',
                  filter: 'brightness(0)',
                }}
              />
            </Box>
          </Box>
          <Box style={{display: 'flex'}}>
            <Typography variant="subtitle1">By</Typography>
            <Avatar
              style={{
                width: '28px',
                height: '28px',
                marginRight: '6px',
                marginLeft: '6px',
              }}
              src={props.authorAvatar}
            />
            <Typography variant="h6">{props.author}</Typography>
          </Box>
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: '16px',
              marginRight: '-15px',
            }}
          >
            <Button fullWidth variant="contained">
              Hunt
            </Button>
            <ShoppingCartIcon style={{marginLeft: '10px'}} />
          </Box>
        </Box>
      </Paper>
    );
  }
  