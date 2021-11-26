import {Caip10Link} from '@ceramicnetwork/stream-caip10-link';
import {useMemo} from 'react';
import {useQuery} from 'react-query';
import crm from '../../../state/clients/ceramic';

async function walletToDid(wallet: string) {
  return (await Caip10Link.fromAccount(crm.ceramic, wallet)).did;
}

export function useCaip10Lookup(wallet: string) {
  return useQuery(['caip10-link', wallet], () => walletToDid(wallet));
}

export function useCaip10Link({wallets}: {wallets: string[]}) {
  const queries = wallets.map(useCaip10Lookup);

  const loading = useMemo(() => {
    for (const query of queries) {
      if (query.isLoading) {
        return true;
      }
    }
    return false;
  }, [queries]);

  return {
    loading,
    links: queries.map(query => query.data),
    errors: queries.map(query => query.error),
  };
}
