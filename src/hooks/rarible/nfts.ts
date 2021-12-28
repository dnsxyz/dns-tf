import {Blockchain, Items} from '@rarible/api-client';
import {useEffect, useMemo} from 'react';
import {
  QueryFunctionContext,
  QueryKey,
  useInfiniteQuery,
  useQuery,
} from 'react-query';
import {FUNCTIONAL_BLOCKCHAINS, sdk} from '../../../state/clients/rarible';
import {UICryptoAddress} from '../../util/caip10';

export interface Sorting {
  date?: 'new' | 'old';
}
interface InternalSorting extends Sorting {
  date: 'new' | 'old';
}
export type Filters =
  | {
      collections?: undefined;
      creators?: undefined;
      owners?: undefined;
    }
  | {
      collections: string | string[];
      creators?: undefined;
      owners?: undefined;
    }
  | {
      collections?: undefined;
      creators: UICryptoAddress[] | undefined;
      owners?: undefined;
    }
  | {
      collections?: undefined;
      creators?: undefined;
      owners: UICryptoAddress[] | undefined;
    };

type InternalFilters =
  | {
      collections?: undefined;
      creators?: undefined;
      owners?: undefined;
    }
  | {
      collections: string | string[];
      creators?: undefined;
      owners?: undefined;
    }
  | {
      collections?: undefined;
      creators: string | string[];
      owners?: undefined;
    }
  | {
      collections?: undefined;
      creators?: undefined;
      owners: string | string[];
    };
export interface Options {
  pageSize?: number;
  skip?: boolean;
}

interface InternalOptions extends Options {
  pageSize: number;
}

const DEFAULT_SORTING: InternalSorting = {
  date: 'new',
};
const DEFAULT_FILTERS: Filters = {};
const DEFAULT_OPTIONS: InternalOptions = {
  pageSize: 30,
};

function sortingString(sorting: InternalSorting): string[] {
  return [sorting.date];
}

function filtersString(filters: InternalFilters): (string | string[])[] {
  const key = Object.keys(filters)[0] as keyof InternalFilters;
  if (key === undefined) {
    return [''];
  }

  const value = filters[key];
  if (value === undefined) {
    return [''];
  }

  if (Array.isArray(value)) {
    value.sort();
  }

  return [key, value];
}

function optionsString(options: Options): string[] {
  return [
    options.pageSize ? `pageSize=${options.pageSize}` : '',
    options.skip ? 'skip=true' : '',
  ];
}

function throwError<T>(error: any): T {
  console.log(error);
  throw error;
}

function isItemRecord(record: any): record is Record<string, Items> {
  return (
    typeof record === 'object' &&
    record !== null &&
    !Array.isArray(record) &&
    Object.values(record).every(value => Array.isArray((value as any).items))
  );
}

function isRecord(
  record: any
): record is Record<string, string | undefined | false> {
  return (
    typeof record === 'object' &&
    record !== null &&
    !Array.isArray(record) &&
    Object.values(record).every(
      value =>
        typeof value === 'string' || value === undefined || value === false
    )
  );
}

const EMPTY_ITEMS: Items = {total: 0, items: []};

function getQuery(
  sorting: InternalSorting,
  filters: InternalFilters,
  pageSize?: number,
  skip?: boolean
): (
  context: QueryFunctionContext<
    QueryKey,
    string | undefined | Record<string, string | undefined | false>
  >
) => Promise<Items | Record<string, Items> | undefined> {
  if (skip) {
    return () => Promise.resolve(undefined);
  }
  if (
    filters.collections?.length === 0 ||
    filters.creators?.length === 0 ||
    filters.owners?.length === 0
  ) {
    console.warn('NFT Filter is empty');
    return () => Promise.resolve(EMPTY_ITEMS);
  }
  if (filters.collections) {
    return async context =>
      typeof filters.collections === 'string'
        ? sdk.apis.item.getItemsByCollection({
            collection: filters.collections,
            continuation: isRecord(context.pageParam)
              ? throwError(new Error('page param should not be an object'))
              : context.pageParam,
            size: pageSize,
          })
        : (
            await Promise.all(
              filters.collections.map(async value =>
                isRecord(context.pageParam) || context.pageParam === undefined
                  ? context.pageParam?.[value] !== false
                    ? {
                        collection: value,
                        items: await sdk.apis.item.getItemsByCollection({
                          collection: value,
                          continuation: context.pageParam?.[value] as
                            | string
                            | undefined,
                          size: pageSize,
                        }),
                      }
                    : {collection: value, items: EMPTY_ITEMS}
                  : throwError(new Error('page param should be an object'))
              )
            )
          ).reduce(
            (acc, {collection, items}) => ({
              ...acc,
              [collection]: items,
            }),
            {}
          );
  }

  if (filters.creators) {
    return async context =>
      typeof filters.creators === 'string'
        ? sdk.apis.item.getItemsByCreator({
            creator: filters.creators,
            continuation: isRecord(context.pageParam)
              ? throwError(new Error('page param should not be an object'))
              : context.pageParam,
            size: pageSize,
          })
        : (
            await Promise.all(
              filters.creators.map(async value =>
                isRecord(context.pageParam) || context.pageParam === undefined
                  ? context.pageParam?.[value] !== false
                    ? {
                        creator: value,
                        items: await sdk.apis.item.getItemsByCreator({
                          creator: value,
                          continuation: context.pageParam?.[value] as
                            | string
                            | undefined,
                          size: pageSize,
                        }),
                      }
                    : {creator: value, items: EMPTY_ITEMS}
                  : throwError(new Error('page param should be an object'))
              )
            )
          ).reduce(
            (acc, {creator, items}) => ({
              ...acc,
              [creator]: items,
            }),
            {}
          );
  }

  if (filters.owners) {
    return async context =>
      typeof filters.owners === 'string'
        ? sdk.apis.item.getItemsByOwner({
            owner: filters.owners,
            continuation: isRecord(context.pageParam)
              ? throwError(new Error('page param should not be an object'))
              : context.pageParam,
            size: pageSize,
          })
        : (
            await Promise.all(
              filters.owners.map(async value =>
                isRecord(context.pageParam) || context.pageParam === undefined
                  ? context.pageParam?.[value] !== false
                    ? {
                        owner: value,
                        items: await sdk.apis.item.getItemsByOwner({
                          owner: value,
                          continuation: context.pageParam?.[value] as
                            | string
                            | undefined,
                          size: pageSize,
                        }),
                      }
                    : {owner: value, items: EMPTY_ITEMS}
                  : throwError(new Error('page param should be an object'))
              )
            )
          ).reduce(
            (acc, {owner, items}) => ({
              ...acc,
              [owner]: items,
            }),
            {}
          );
  }

  return context =>
    sdk.apis.item.getAllItems({
      showDeleted: false,
      continuation: isRecord(context.pageParam)
        ? throwError(new Error('page param should not be an object'))
        : context.pageParam,
      size: pageSize,
      blockchains: FUNCTIONAL_BLOCKCHAINS,
    });
}

const EMPTY_ARRAY: string[] = [];

function parseFilters(filters: Filters): InternalFilters {
  if (filters.creators) {
    return {
      creators: Array.isArray(filters.creators)
        ? filters.creators.map(
            value => `${value.name.toUpperCase()}:${value.address}`
          )
        : EMPTY_ARRAY,
    };
  }
  if (filters.owners) {
    return {
      owners: Array.isArray(filters.owners)
        ? filters.owners.map(
            value => `${value.name.toUpperCase()}:${value.address}`
          )
        : EMPTY_ARRAY,
    };
  }
  if (filters.collections) {
    return filters;
  }
  return {};
}

const EMPTY_CONTINUATION: Record<string, string | undefined | boolean> = {};

export function useNFTs({
  sorting,
  filters,
  options,
}: {sorting?: Sorting; filters?: Filters; options?: Options} = {}) {
  if (!sorting) {
    sorting = DEFAULT_SORTING;
  }
  const internalSorting: InternalSorting = {
    ...DEFAULT_SORTING,
    ...sorting,
  };
  if (!filters) {
    filters = DEFAULT_FILTERS;
  }
  if (!options) {
    options = DEFAULT_OPTIONS;
  }

  const parsedFilters: InternalFilters = parseFilters(filters);

  const query = useInfiniteQuery<Items | Record<string, Items> | undefined>(
    [
      'rarible',
      'nfts',
      sortingString(internalSorting),
      filtersString(parsedFilters),
      optionsString(options),
    ],
    getQuery(internalSorting, parsedFilters, options.pageSize, options.skip),
    {
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      getNextPageParam(lastPage, pages) {
        // debugger;
        if (lastPage === undefined) {
          return undefined;
        }
        if (!isItemRecord(lastPage)) {
          return lastPage.continuation;
        }
        const result = Object.entries(lastPage).reduce(
          (acc, [key, items]) => ({
            ...acc,
            [key]: items.continuation || false,
          }),
          EMPTY_CONTINUATION
        );
        if (
          result === EMPTY_CONTINUATION ||
          Object.values(result).every(v => v === false)
        ) {
          return undefined;
        }
        return result;
      },
    }
  );

  const count = useMemo(
    () =>
      query.data?.pages?.reduce?.(
        (acc, page) =>
          acc +
          (Array.isArray(page?.items)
            ? (page?.total as number)
            : Object.values((page || {}) as Record<string, Items>).reduce(
                (acc, value) => acc + value.total,
                0
              )),
        0
      ),
    [query]
  );

  const newestData = useMemo(
    () =>
      (
        query.data?.pages?.flatMap(value =>
          value !== undefined
            ? Array.isArray(value.items)
              ? value.items
              : Object.values(value as Record<string, Items>).flatMap(
                  value => value.items
                )
            : []
        ) ?? []
      )
        .filter(
          item =>
            item.meta &&
            (item.meta?.content?.length || 0) !== 0 &&
            !item.deleted &&
            !(item.meta?.attributes || []).some(
              ({key, value}) => key === value && key === 'Hidden'
            )
        )
        .map(item => {
          if (item.meta && item.meta.content.length) {
            item.meta.content = item.meta.content.filter(
              // ignore empty content
              content => content.url !== 'https://rarible.mypinata.cloud/'
            );
            item.meta.content.forEach(content => {
              content.url = content.url.replace(
                'https://rarible.mypinata.cloud/ipfs/',
                'ipfs://'
              );
              content.url = content.url.replace('ipfs://ipfs/', 'ipfs://');
            });
          }
          return item;
        }),
    [query.data]
  );

  const oldestData = useMemo(() => newestData.slice().reverse(), [newestData]);

  return {
    ...query,
    data: internalSorting.date === 'new' ? newestData : oldestData,
    length: count,
  };
}

export function useNFT(id: string | undefined) {
  return useQuery(['rarible', 'nfts', 'id', id], async () => {
    if (id === undefined) {
      return undefined;
    }
    return sdk.apis.item.getItemById({
      itemId: id,
    });
  });
}
