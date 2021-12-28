   
import {
  Button,
  Typography,
  Box,
  TextField,
  MenuItem,
  Divider,
  Grid,
  Autocomplete,
  Chip,
  createFilterOptions,
  useAutocomplete,
} from '@mui/material';
import CircularProgress from '@material-ui/core/CircularProgress';
import {makeStyles} from '@material-ui/core/styles';
import {useState, useEffect, useCallback} from 'react';
import {
  ApolloClient,
  ApolloError,
  gql,
  InMemoryCache,
  useQuery,
  useLazyQuery,
} from '@apollo/client';
import {
  Context,
  NavbarItem,
} from '../../components/blocks/Navbar/VerticalNavbar';
import {NftCard} from '../../components/NftThumb';
import {
  HEN_COLLECTED_QUERY,
  HEN_CREATED_QUERY,
} from '../../../controller/queryFragments/hen';
import {
  Creator,
  PaginationVars,
  SortVars,
  Swap,
  Token,
  TokenHolderRes,
  TokenTag,
} from '../../../types/queries';

const currencies = [
  {
    value: 'XTZ',
    label: 'TEZ',
  },
  /*{
    value: 'USD',
    label: '$',
  },
  {
    value: 'EUR',
    label: '€',
  },
  {
    value: 'BTC',
    label: '฿',
  },
  {
    value: 'JPY',
    label: '¥',
  },*/
];
const PAGE_SIZE = 30;

type HENToken = {
  hic_et_nunc_token: Token[];
};

type HENTags = {
  hic_et_nunc_tag: TokenTag[];
};

const TAGS_QUERY = gql`
  query PriceHistory {
    hic_et_nunc_tag(
      limit: 50
      order_by: {tag_tokens_aggregate: {count: desc}}
      where: {tag: {_neq: ""}}
    ) {
      id
      tag
    }
  }
`;
const filter = createFilterOptions();
export function BrowsePage(props: any) {
  const [state, setState] = useState({navItem: null}) as any;
  const [saleStatus, setSaleStatus] = useState<'all' | 'forsale'>('all');

  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');

  const [tags, setTags] = useState<string[]>([]);

  const [currency, setCurrency] = useState('XTZ');

  const handleChange = (event: any) => {
    setCurrency(event.target.value);
  };

  const handleSort = (event: any) => {
    setSort(event.target.value);
  };

  const [reloadAvail, setReloadAvail] = useState<boolean>(false);
  const [priceMin, setPriceMin] = useState<null | number>(null);
  const [priceMax, setPriceMax] = useState<null | number>(null);

  const [edsMin, setEdsMin] = useState<null | number>(null);
  const [edsMax, setEdsMax] = useState<null | number>(null);

  const queryInfo = gql`
  query PriceHistory {
    hic_et_nunc_token(
      where: {
        ${
          tags.length > 0
            ? `token_tags: {
              tag: {
                tag: {
                  _in: [${tags.map(e => `,"${e}"`)}]
            }
          }
        }`
            : ''
        }
        display_uri: {_neq: ""}, 
        swaps: {
          price: {
            ${priceMin !== null ? `_gte: "${priceMin * 1000000}"` : ''}
            ${priceMax !== null ? `, _lte: "${priceMax * 1000000}"` : ''}
          },  
          ${saleStatus === 'forsale' ? `status: { _eq: "0" },` : ''}
        } 
        supply: {
          ${edsMin !== null ? `_gte: "${edsMin}"` : ''}
          ${edsMax !== null ? `, _lte: "${edsMax}"` : ''}
        }
      }
      limit: 50, 
      order_by: {timestamp: ${sort === 'newest' ? 'desc' : 'asc'}}
    ) {
      id
      title
      display_uri
      creator {
        address
        name
      }
      swaps {
        price
      }
    }
  }
  `;

  const {
    loading: loading2,
    data: tagsData,
    error: error2,
  } = useQuery<HENTags, PaginationVars>(TAGS_QUERY, {
    variables: {
      offset: 0,
      limit: PAGE_SIZE,
    },

    skip: reloadAvail,
  });

  const {loading, data, previousData, error, fetchMore, refetch} =
    useQuery<HENToken>(queryInfo, {
      variables: {
        offset: 0,
        limit: PAGE_SIZE,
      },

      skip: reloadAvail,
    });

  const handleReload = useCallback(() => {
    refetch();
    setReloadAvail(false);
  }, [refetch]);

  useEffect(() => {
    setReloadAvail(true);
  }, [priceMin, priceMax, edsMax, edsMin]);

  useEffect(() => {
    refetch();
    setReloadAvail(false);
  }, [saleStatus]);

  useEffect(() => {
    refetch();
  }, [sort, tags]);

  useEffect(() => {
    refetch();
  }, []);

  const tokens: Token[] = (data || previousData)?.hic_et_nunc_token || [];

  return (
    <div>
      <NavbarItem>
        <Box>
          <Divider style={{marginTop: '16px', marginBottom: '16px'}} />
          <Typography
            style={{
              fontWeight: 'bold',
              textTransform: 'uppercase',
              fontSize: '16px',
            }}
            gutterBottom
          >
            Filters
          </Typography>
          <Typography
            style={{
              textTransform: 'uppercase',
              fontFamily: 'Roboto',
              fontWeight: 700,
              fontSize: '14px',
            }}
            gutterBottom
          >
            Sale status
          </Typography>

          <Box>
            <Button
              variant="contained"
              style={{
                borderRadius: '0%',
                ...(saleStatus === 'all'
                  ? {
                      backgroundColor: '#313536',
                      color: 'white',
                    }
                  : {
                      backgroundColor: 'white',
                      color: 'black',
                    }),
              }}
              onClick={() => setSaleStatus('all')}
            >
              All
            </Button>
            <Button
              variant="contained"
              style={{
                borderRadius: '0%',
                ...(saleStatus === 'forsale'
                  ? {
                      backgroundColor: '#313536',
                      color: 'white',
                    }
                  : {
                      backgroundColor: 'white',
                      color: 'black',
                    }),
              }}
              onClick={() => setSaleStatus('forsale')}
            >
              For Sale
            </Button>
          </Box>

          <Box
            style={{
              marginBottom: '16px',
            }}
          >
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                marginTop: '15px',
              }}
            >
              {/* <Typography
                style={{
                  textTransform: 'uppercase',
                  fontFamily: 'Roboto',
                  fontWeight: 700,
                }}
                gutterBottom
              >
                Currency
              </Typography> */}

              {/*<TextField
                select
                label=""
                value={currency}
                onChange={handleChange}
                style={{
                  width: '50%',
                  borderRadius: '0px',
                  height: '56px',
                }}
                InputProps={{
                  style: {
                    height: '56px',
                    borderRadius: '0px',
                  },
                }}
              >
                {currencies.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
                </TextField>*/}
            </Box>
            <Typography
              style={{
                textTransform: 'uppercase',
                fontFamily: 'Roboto',
                fontWeight: 700,
              }}
              gutterBottom
            >
              Price (XTZ)
            </Typography>
            <Box
              style={{
                display: 'flex',
                paddingRight: '10px',
              }}
            >
              <TextField
                required
                id="filled-required"
                label="Min"
                defaultValue="Hello World"
                variant="filled"
                type="number"
                style={{
                  borderRadius: '0%',
                  borderRightColor: 'black',
                  borderRightStyle: 'solid',
                  borderRightWidth: '2px',
                  width: '50%',
                }}
                InputProps={{
                  style: {
                    borderRadius: '0px',
                  },
                  inputProps: {min: 0, max: 9223372036854.774},
                }}
                onChange={e =>
                  Number(e.target.value) > 9223372036854.774
                    ? (e.target.value = '9223372036854.774')
                    : setPriceMin(Number(e.target.value))
                }
              />
              <TextField
                required
                id="filled-required"
                label="Max"
                defaultValue="Hello World"
                variant="filled"
                type="number"
                style={{
                  width: '50%',
                }}
                InputProps={{
                  style: {
                    borderRadius: '0px',
                  },
                  inputProps: {min: 0, max: 9223372036854.774},
                }}
                onChange={e =>
                  Number(e.target.value) > 9223372036854.774
                    ? (e.target.value = '9223372036854.774')
                    : setPriceMax(Number(e.target.value))
                }
              />
            </Box>
          </Box>
          <Box
            style={{
              marginBottom: '30px',
            }}
          >
            <Typography
              style={{
                textTransform: 'uppercase',
                fontFamily: 'Roboto',
                fontWeight: 700,
              }}
              gutterBottom
            >
              Quantity of Editions
            </Typography>

            <Box
              style={{
                display: 'flex',
                paddingRight: '10px',
              }}
            >
              <TextField
                required
                label="Min"
                variant="filled"
                type="number"
                style={{
                  borderRadius: '0%',
                  borderRightColor: 'black',
                  borderRightStyle: 'solid',
                  borderRightWidth: '2px',
                  width: '50%',
                }}
                InputProps={{
                  style: {
                    borderRadius: '0px',
                  },
                  inputProps: {min: 0, max: 32767},
                }}
                onChange={e =>
                  Number(e.target.value) > 32767
                    ? (e.target.value = '32767')
                    : setEdsMin(Number(e.target.value))
                }
              />
              <TextField
                required
                label="Max"
                variant="filled"
                type="number"
                style={{
                  width: '50%',
                }}
                InputProps={{
                  style: {
                    borderRadius: '0px',
                  },
                  inputProps: {min: 0, max: 32767},
                }}
                onChange={e =>
                  Number(e.target.value) > 32767
                    ? (e.target.value = '32767')
                    : setEdsMax(Number(e.target.value))
                }
              />
            </Box>
            <Box style={{marginTop: '16px', paddingRight: '10px'}}>
              <Autocomplete
                multiple
                id="tags-filled"
                options={(tagsData?.hic_et_nunc_tag || []).map(
                  (option: any) => option.tag
                )}
                defaultValue={[]}
                freeSolo
                onChange={(event, newValue) => {
                  setTags(
                    newValue.map((e: any) =>
                      typeof e === 'string' ? e : e.inputValue
                    )
                  );
                }}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={
                        typeof option === 'string'
                          ? option
                          : (option as any).inputValue
                      }
                      {...getTagProps({index})}
                    />
                  ))
                }
                filterOptions={(options, params): any => {
                  const filtered = filter(options, params as any);

                  if (params.inputValue !== '') {
                    filtered.push({
                      inputValue: params.inputValue,
                      title: `Add "${params.inputValue}"`,
                    });
                  }

                  return filtered;
                }}
                getOptionLabel={(option: any) => {
                  // e.g value selected with enter, right from the input
                  if (typeof option === 'string') {
                    return option;
                  }
                  if (option.inputValue) {
                    return option.inputValue;
                  }
                  return option.title;
                }}
                renderOption={(props, option) => (
                  <li {...props}>
                    {typeof option === 'string'
                      ? option
                      : (option as any).title}
                  </li>
                )}
                renderInput={params => (
                  <TextField
                    {...params}
                    InputProps={{
                      ...params.InputProps,
                      style: {
                        borderRadius: '0px',
                      },
                    }}
                    variant="filled"
                    label="Tags"
                    placeholder="Example: Art"
                  />
                )}
              />
            </Box>
            <Button
              onClick={handleReload}
              disabled={!reloadAvail}
              variant="contained"
              style={{
                marginTop: '16px',
              }}
            >
              Apply
              {loading ? (
                <CircularProgress
                  style={{
                    width: '1.2em',
                    height: '1.2em',
                    marginLeft: '0.5em',
                  }}
                />
              ) : null}
            </Button>
          </Box>
          <Divider style={{marginTop: '16px', marginBottom: '16px'}} />
        </Box>
      </NavbarItem>
      <Box style={{padding: '32px'}}>
        <Box
          style={{
            marginBottom: '32px',
          }}
        >
          <Typography
            variant="h3"
            style={{
              fontFamily: 'Roboto',
              fontWeight: 700,
              textTransform: 'none',
            }}
            gutterBottom
          >
            Browse
          </Typography>
        </Box>
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}
        >
          <Typography
            variant="h6"
            style={{fontFamily: 'Roboto', fontWeight: 700}}
          >
            RECENT
          </Typography>
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              maxWidth: '250px',
              width: '80%',
            }}
          >
            <Typography
              style={{
                fontFamily: 'Roboto',
                fontWeight: 700,
              }}
            >
              Sort By
            </Typography>
            <TextField
              select
              label=""
              value={sort}
              onChange={handleSort}
              style={{
                width: '50%',
                borderRadius: '0px',
                height: '56px',
              }}
              InputProps={{
                style: {
                  height: '56px',
                  borderRadius: '0px',
                },
              }}
            >
              <MenuItem value={'newest'}>Newest</MenuItem>
              <MenuItem value={'oldest'}>Oldest</MenuItem>
            </TextField>
          </Box>
        </Box>
        <Box>
          <Grid
            container
            spacing={{xs: 2, md: 3}}
            columns={{xs: 4, sm: 8, md: 12}}
          >
            {tokens.map(token => (
              <Grid item xs={2} sm={4} md={4} key={token.id}>
                <NftCard market="hen" token={token} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </div>
  );
}