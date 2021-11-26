import {ApolloClient, gql, InMemoryCache, useQuery} from '@apollo/client';
import {offsetLimitPagination} from '@apollo/client/utilities';
import {useEffect, useMemo} from 'react';

const client = new ApolloClient({
  uri: 'https://api.tezos.domains/graphql',
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only',
    },
    query: {
      fetchPolicy: 'network-only',
      // nextFetchPolicy: 'cache-first',
    },
  },
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          hic_et_nunc_token_holder: offsetLimitPagination(),
          hic_et_nunc_token: offsetLimitPagination(),
        },
      },
    },
  }),
});

const USER_DOMAINS_QUERY = gql`
  query userDomains($wallets: [Address!]) {
    domains(where: {validity: VALID, owner: {in: $wallets}}) {
      items {
        name
        owner
        address
        ownerReverseRecord {
          address
        }
      }
    }
  }
`;
type UserDomainsQueryResult = {
  domains: {
    items: {
      name: string;
      owner: string;
      address: string;
      ownerReverseRecord: {
        address: string;
      };
    }[];
  };
};

const DOMAIN_NAME_QUERY = gql`
  query domainInfo($domain: String!) {
    domain(validity: VALID, name: $domain) {
      name
      owner
      address
      data {
        key
        rawValue
        value
      }
      tokenId
      expiresAtUtc
    }
  }
`;
type DomainNameQueryResult = {
  domain: null | {
    name: string;
    owner: string;
    address: string | null;
    data: {
      key: string;
      rawValue: string;
      value: object | null;
    }[];
    tokenId: number;
    expiresAtUtc: Date;
  };
};

type WalletsVars = {wallets: string[]};
export function useTezosDomains({tzWallets}: {tzWallets: string[]}) {
  const {loading, data, error, fetchMore} = useQuery<
    UserDomainsQueryResult,
    WalletsVars
  >(USER_DOMAINS_QUERY, {
    variables: {
      wallets: tzWallets,
    },
    client,
  });

  useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);

  useEffect(() => {
    fetchMore({
      variables: {
        owners: tzWallets,
      },
      updateQuery: (prev, {fetchMoreResult}) => {
        if (!fetchMoreResult) {
          return prev;
        }
        return fetchMoreResult;
      },
    });
  }, [tzWallets, fetchMore]);

  const domains = useMemo(() => {
    if (!data?.domains) {
      return [];
    }
    return data.domains.items.map(
      ({name, owner, address, ownerReverseRecord}) => ({
        name,
        owner,
        address,
        addressVerified: ownerReverseRecord.address === address,
        ownerVerified: ownerReverseRecord.address === owner,
      })
    );
  }, [data]);

  return {
    loading,
    domains,
    error,
  };
}

type DomainVars = {domain: string | null};
export function useResolveTezosDomain(domain: string | null) {
  const {loading, data, error, fetchMore} = useQuery<
    DomainNameQueryResult | undefined,
    DomainVars
  >(DOMAIN_NAME_QUERY, {
    variables: {
      domain,
    },
    client,
    skip: !domain,
  });

  console.log(data?.domain?.expiresAtUtc);

  useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (domain) {
      fetchMore({
        variables: {
          domain,
        },
        updateQuery: (_prev, {fetchMoreResult}) => {
          return fetchMoreResult;
        },
      });
    }
  }, [domain, fetchMore]);

  return {
    loading,
    domain: data,
    error,
  };
}
