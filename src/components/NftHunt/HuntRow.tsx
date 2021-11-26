import {Box, Paper, Typography, Avatar} from '@material-ui/core';
import ArrowDropUpOutlinedIcon from '@mui/icons-material/ArrowDropUpOutlined';

interface HuntRowProps {
  title: string;
  author: string;
  authorAvatar: string;
  nftUrl: string;
  upvotes: number;
}
export function HuntRow(props: HuntRowProps) {
  return (
    <Paper style={{padding: '12px', display: 'flex', alignItems: 'center'}}>
        {
            // The nft image.
            // Gifs and images are only supported at this time for preview
        }
      <img
        src={props.nftUrl}
        style={{
          width: '120px',
          height: '120px',
        }}
        alt={props.title}
      />
      <Box style={{marginLeft: '5%', marginRight: '12px'}}>
        <Box style={{marginBottom: '16px'}}>
          <Typography variant="h6">{props.title}</Typography>
        </Box>
        <Box style={{display: 'flex'}}>
          <Typography variant="subtitle1">By</Typography>
          {
              // Author profile picture sourced from tzprofiles
          }
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
      </Box>
      <Paper
        style={{
          width: '100px',
          height: '100px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderColor: 'gray',
          borderStyle: 'solid',
          borderWidth: '0.5px',
          marginLeft: 'auto',
        }}
      >
        <ArrowDropUpOutlinedIcon
          height="58px"
          style={{width: '38px', height: '38px'}}
        />
        {props.upvotes}
      </Paper>
    </Paper>
  );
}
