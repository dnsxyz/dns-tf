import {useEffect, useMemo, useState} from 'react';
import {addrToCaip} from '../../../util/caip10';
import {useReverseLookupDid} from '../../username';
import {useCaip10Link} from '../caip10Link';
// import {useReverseLookupDid} from '../../username';
import {useTezosDomains} from './tezosDomains';

export * from './tezosDomains';

// export function useTezosWalletToName(wallet: string) {
// }

// function arrayEquals<T>(a: T[], b: T[]) {
//   return Array.isArray(a) &&
//     Array.isArray(b) &&
//     a.length === b.length &&
//     a.every((val, index) => val === b[index]);
// }

export function useTezosWalletToName(
  wallet: string | undefined,
  defaultValue?: string
) {
  const [accounts, setAccounts] = useState<
    Parameters<typeof useTezosDomains>[0]
  >({
    tzWallets: wallet ? [wallet] : [],
  });
  const [caipAccounts, setCaipAccounts] = useState<
    Parameters<typeof useCaip10Link>[0]
  >({
    wallets: wallet ? [addrToCaip.xtz(wallet)] : [],
  });

  useEffect(() => {
    setAccounts({
      tzWallets: wallet ? [wallet] : [],
    });
  }, [wallet]);

  useEffect(() => {
    setCaipAccounts({
      wallets: wallet ? [addrToCaip.xtz(wallet)] : [],
    });
  }, [wallet]);

  const {loading: caip10Loading, links, errors} = useCaip10Link(caipAccounts);

  const {loading, domains, error} = useTezosDomains(accounts);

  const verifiedDomain = useMemo(() => {
    if (domains && domains.length > 0) {
      return domains.find(domain => domain.addressVerified) || domains[0];
    }
    return null;
  }, [domains]);

  const [result, setResult] = useState<string>();

  const did = useMemo(() => {
    if (!caip10Loading) {
      for (const link of links) {
        if (link) {
          return link;
        }
      }
    }
    return undefined;
  }, [caip10Loading, links]);

  const {name: username, done: didResolutionDone} = useReverseLookupDid(did);

  useEffect(() => {
    if (!username) {
      if (verifiedDomain) {
        const domainName = verifiedDomain.name;
        if (domainName && !loading && !error) {
          setResult(domainName);
        } else {
          setResult(defaultValue);
        }
      } else {
        setResult(defaultValue);
      }
    }
  }, [error, defaultValue, loading, verifiedDomain, username]);

  useEffect(() => {
    if (didResolutionDone && username) {
      setResult(username);
    }
  }, [didResolutionDone, username]);

  return {
    result,
    loading,
    error,
  };
}
