import clsx from 'clsx';
import {useCallback} from 'react';
import {
  Box,
  Button,
  Fab,
  makeStyles,
  Grid,
  Typography,
} from '@material-ui/core';
import {Apps, ArrowForwardIos, ArrowBackIos} from '@material-ui/icons';
import {Link} from '../../../controller/util/router';
import {
  BaseShowcase,
  ShowcaseSubtitle,
  ShowcaseTitle,
  ShowcaseTitleBox,
} from './BaseShowcase';

const useStyles = makeStyles(theme => ({
  collectionName: {
    fontWeight: 'bold',
    fontSize: theme.typography.h6.fontSize,
  },
  pageButton: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    margin: 'auto 0',
    fontSize: '12px',
  },
  pageLeft: {
    left: '0px',
    transform: 'translate(-50%, 0px)',
  },
  pageRight: {
    right: '0px',
    transform: 'translate(50%, 0px)',
  },
  navButtonPlaceholder: {
    width: '40px',
    opacity: 0,
  },
}));

type ColumnCounts = 1 | 2 | 3 | 4 | 6 | 12;

interface NftCollectionProps {
  columns: ColumnCounts;
  children?: JSX.Element | JSX.Element[];
  title: string;
  count?: number;
  index: number;
  loading?: boolean;
  error?: boolean;
  onNavigate: (index: number) => void;
  collectionLink?: string;
}

export function NftCollection({
  children,
  collectionLink,
  columns,
  count,
  error,
  index,
  loading,
  onNavigate,
  title,
}: NftCollectionProps) {
  const incIndex = useCallback(() => {
    if (count && index < count - columns) {
      const newIdx = index + 1;
      onNavigate(newIdx);
    }
  }, [columns, count, index, onNavigate]);

  const decIndex = useCallback(() => {
    if (index > 0) {
      const newIdx = index - 1;
      onNavigate(newIdx);
    }
  }, [index, onNavigate]);
  const classes = useStyles();
  return (
    <BaseShowcase>
      <ShowcaseTitleBox>
        <ShowcaseTitle>{title}</ShowcaseTitle>
        {count !== undefined && (
          <ShowcaseSubtitle>({count.toLocaleString()})</ShowcaseSubtitle>
        )}
        {collectionLink && (
          <Link
            style={{
              marginLeft: 'auto',
            }}
            to={collectionLink}
          >
            <Button>
              <Apps />
              <Typography
                style={{
                  marginLeft: '6px',
                  fontWeight: 'bold',
                }}
              >
                View All
              </Typography>
            </Button>
          </Link>
        )}
      </ShowcaseTitleBox>
      <Box display="flex" position="relative">
        <Grid container spacing={2}>
          {children}
        </Grid>
        {index > 0 && (
          <Fab
            size="small"
            onClick={decIndex}
            className={clsx(classes.pageButton, classes.pageLeft)}
          >
            <ArrowBackIos fontSize="inherit" />
          </Fab>
        )}
        {count && index < count - columns && (
          <Fab
            size="small"
            onClick={incIndex}
            className={clsx(classes.pageButton, classes.pageRight)}
          >
            <ArrowForwardIos fontSize="inherit" />
          </Fab>
        )}
      </Box>
    </BaseShowcase>
  );
}
