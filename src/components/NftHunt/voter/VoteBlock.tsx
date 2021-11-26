import {ComponentPropsWithoutRef} from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import {HuntedProps, NotHuntedProps} from './types';
import {OptTooltip} from '../../../snippets/OptTooltip';
import CircularProgress from '@mui/material/CircularProgress';
import SvgIcon, {SvgIconProps} from '@mui/material/SvgIcon';

function UpArrowIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 25.665 28.118">
      <g transform="translate(-48.168 -40.186)">
        <path d="m59.175 41.367c0.7069-1.5743 2.942-1.5743 3.649 0l10.83 24.118c0.5942 1.3234-0.3739 2.8193-1.8245 2.8193h-21.66c-1.4506 0-2.4187-1.4959-1.8245-2.8193z" />
      </g>
    </SvgIcon>
  );
}

const BlockButton = ({
  children,
  sx,
  ...props
}: ComponentPropsWithoutRef<typeof Button>) => (
  <Button
    {...props}
    sx={{
      ...sx,
      width: 124,
      height: 124,
    }}
  >
    <Stack>{children}</Stack>
  </Button>
);

export function NotHunted({remaining, onHunt}: NotHuntedProps) {
  const allowHunt = remaining > 0;
  return (
    <OptTooltip enabled={!allowHunt} title="You have no nominations left">
      <BlockButton onClick={onHunt} disabled={!allowHunt} variant="contained">
        <Typography variant="h2">
          Nomi-
          <wbr />
          nate
        </Typography>
      </BlockButton>
    </OptTooltip>
  );
}

export function Hunted({upvotes, alreadyVoted, onUpvote}: HuntedProps) {
  return (
    <OptTooltip enabled={alreadyVoted} title="You already voted">
      <BlockButton
        onClick={onUpvote}
        disabled={alreadyVoted}
        color={alreadyVoted ? 'secondary' : 'primary'}
        variant={alreadyVoted ? 'outlined' : 'contained'}
        sx={{
          '& > *': {color: alreadyVoted ? 'primary.main' : undefined},
          borderColor: 'primary.main',
        }}
      >
        <div>
          <UpArrowIcon />
        </div>
        <Typography variant="h5">{upvotes}</Typography>
      </BlockButton>
    </OptTooltip>
  );
}

export function Loading() {
  return (
    <BlockButton>
      <CircularProgress />
    </BlockButton>
  );
}
