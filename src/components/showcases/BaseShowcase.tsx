import {Box, Paper, Typography} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import clsx from 'clsx';
import React from 'react';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    // fab size is not in theme :(
    padding: '20px', // half of fab size=small
    paddingTop: '14px',
  },
  titleBox: {
    display: 'flex',
    paddingBottom: theme.spacing(1),
    '& > *': {
      marginTop: 'auto',
      marginBottom: 'auto',
      marginRight: theme.spacing(0.5),
    },
  },
  title: {
    fontWeight: 'bold',
    fontSize: theme.typography.h6.fontSize,
  },
}));

/**
 * Basic container for showcases
 */
type BaseProps = React.ComponentPropsWithoutRef<typeof Paper>;
export function BaseShowcase({children, ...props}: BaseProps) {
  const classes = useStyles();
  return (
    <Paper className={clsx(classes.root, props.className)} elevation={10}>
      {children}
    </Paper>
  );
}

type TitleBoxProps = React.ComponentPropsWithoutRef<typeof Box>;
export function ShowcaseTitleBox({children, className}: TitleBoxProps) {
  const classes = useStyles();
  return <Box className={clsx(classes.titleBox, className)}>{children}</Box>;
}

type TitleProps = React.ComponentPropsWithoutRef<typeof Typography>;
export function ShowcaseTitle({children, className}: TitleProps) {
  const classes = useStyles();
  return (
    <Typography
      variant="body1"
      component="span"
      className={clsx(classes.title, className)}
    >
      {children}
    </Typography>
  );
}

export function ShowcaseSubtitle({children, className}: TitleProps) {
  return (
    <Typography variant="body1" component="span" className={className}>
      {children}
    </Typography>
  );
}

export function ShowcaseRight({children}: TitleProps) {}
