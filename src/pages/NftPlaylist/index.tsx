import {useState} from 'react';

import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import {makeStyles} from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import PlaylistAddIcon from '@material-ui/icons/PlaylistAdd';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import ListIcon from '@material-ui/icons/List';
import PhotoLibraryIcon from '@material-ui/icons/PhotoLibrary';

import {useMatchParamsParser} from '../../../controller/hooks/useMatchParamsParser';
import {useTezAddr} from '../../../controller/util/useTezAddr';

import {HENGrid} from '../../components/partials/HENGrid';
import {HENList} from '../../components/partials/HENList';


const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    '@media (max-width: 768px)': {
      flexDirection: 'column',
    },
  },
  info: {
    padding: theme.spacing(2),
    width: 240,
    flexShrink: 0,
  },
  content: {
    flexShrink: 1,
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));
/**
 * Shows all NFts/Tezos domains of a user.
 * @param props 
 * @returns 
 */
export default function NftPlaylist(props: any) {
  const classes = useStyles();
  const {params} = useMatchParamsParser();

  const [viewMode, setViewMode] = useState('list');

  const tezAddrs = useTezAddr(params.id);

  return (
    <Box className={classes.root}>
      <div className={classes.info}>
        <Typography variant="h5">{props.collectionName} NFTs</Typography>
        <hr />
      </div>
      <Container className={classes.content} maxWidth="md">
        <div style={{display: 'flex', alignItems: 'center'}}>
          View:
          <IconButton onClick={() => setViewMode('list')}>
            <ListIcon />
          </IconButton>
          <IconButton onClick={() => setViewMode('grid')}>
            <PhotoLibraryIcon />
          </IconButton>
          <Box
            style={{width: '80%', display: 'flex', justifyContent: 'flex-end'}}
          >
            <FormControl className={classes.formControl}>
              <InputLabel shrink>Sort By:</InputLabel>
              <Select
                defaultValue="new"
                displayEmpty
                className={classes.selectEmpty}
              >
                <MenuItem value={'new'}>Newest</MenuItem>
                <MenuItem value={'old'}>Oldest</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </div>
        {viewMode === 'grid' ? (
          <HENGrid tzWallets={tezAddrs} colType={props.collectionName} />
        ) : (
          <HENList tzWallets={tezAddrs} colType={props.collectionName} />
        )}
      </Container>
    </Box>
  );
}
