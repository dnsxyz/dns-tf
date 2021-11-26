import {
    ComponentProps,
    ComponentPropsWithoutRef,
    PropsWithChildren,
  } from 'react';
  
  import Tooltip from '@material-ui/core/Tooltip';
  import CircularProgress from '@mui/material/CircularProgress';
  import Button from '@mui/material/Button';
  import Typography from '@mui/material/Typography';
  import ArrowDropUpOutlinedIcon from '@mui/icons-material/ArrowDropUpOutlined';
  import CheckIcon from '@mui/icons-material/Check';
  
  import {Paper} from '@material-ui/core';
  import {HuntedProps, NotHuntedProps} from './types';
  import {OptTooltip} from '../../../snippets/OptTooltip';
  
  const Bubble = ({
    children,
    color,
    width = 400,
  }: ComponentProps<typeof Paper> & {
    color?: string;
    width?: string | number;
  }) => (
    <Paper
      elevation={2}
      style={{
        borderRadius: '40px',
        overflow: 'hidden',
        // marginTop: '-60px',
        width: '400px',
      }}
    >
      {children}
    </Paper>
  );
  
  const BubbleButton = ({
    children,
    ...props
  }: ComponentPropsWithoutRef<typeof Button>) => (
    <Bubble>
      <Button {...props} fullWidth>
        {children}
      </Button>
    </Bubble>
  );
  
  const ButtonContents = ({
    children,
    alreadyVoted,
  }: PropsWithChildren<{alreadyVoted?: boolean}>) => {
    return (
      <Typography variant="h6" component="span">
        {children}
      </Typography>
    );
  };
  
  export function Hunted({upvotes, alreadyVoted, onUpvote}: HuntedProps) {
    return (
      <OptTooltip enabled={alreadyVoted} title="You already voted">
        {/*tooltips don't work on disabled buttons*/}
        <BubbleButton
          onClick={onUpvote}
          disabled={alreadyVoted}
          startIcon={<ArrowDropUpOutlinedIcon />}
          variant={alreadyVoted ? undefined : 'contained'}
          color={alreadyVoted ? undefined : 'primary'}
          sx={{'& > *': {color: alreadyVoted ? 'primary.main' : undefined}}}
        >
          <ButtonContents alreadyVoted={alreadyVoted}>{upvotes}</ButtonContents>
        </BubbleButton>
      </OptTooltip>
    );
  }
  
  export function NotHunted({remaining, onHunt}: NotHuntedProps) {
    const allowHunt = remaining > 0;
    return (
      <OptTooltip enabled={!allowHunt} title="You have no hunts left">
        {/*tooltips don't work on disabled buttons*/}
        <BubbleButton
          fullWidth
          disabled={!allowHunt}
          onClick={onHunt}
          variant="contained"
          startIcon={<ArrowDropUpOutlinedIcon />}
        >
          <ButtonContents>Hunt This NFT</ButtonContents>
        </BubbleButton>
      </OptTooltip>
    );
  }
  
  export const Loading = () => (
    <BubbleButton disabled fullWidth>
      <CircularProgress style={{width: 32, height: 32}} />
    </BubbleButton>
  );
  