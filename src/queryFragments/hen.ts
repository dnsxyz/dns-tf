import {gql} from '@apollo/client';
import {DetailToken, Token, TokenHolderRes} from '../../types/queries';

export const HEN_TOKEN_FIELDS = gql`
  fragment HenTokenFields on hic_et_nunc_token {
    id
    artifact_uri
    display_uri
    timestamp
    mime
    title
    description
    supply
    creator {
      address
      name
    }
    token_tags {
      tag {
        tag
      }
    }
    swaps(where: {status: {_eq: "0"}}, order_by: {price: asc}) {
      amount
      amount_left
      creator_id
      price
    }
  }
`;

export const HEN_DETAIL_TOKEN_FIELDS = gql`
  fragment HenDetailTokenFields on hic_et_nunc_token {
    artifact_uri
    creator {
      address
      name
    }
    description
    display_uri
    id
    level
    mime
    royalties
    supply
    thumbnail_uri
    metadata
    timestamp
    title
    token_tags(order_by: {id: asc}) {
      tag {
        tag
      }
    }
    swaps(order_by: {id: asc}) {
      price
      timestamp
      status
      amount
      amount_left
      creator {
        address
        name
      }
    }
    trades(order_by: {timestamp: asc}) {
      amount
      buyer {
        address
        name
      }
      seller {
        address
        name
      }
      swap {
        price
      }
      timestamp
    }
    token_holders(where: {quantity: {_gt: "0"}}, order_by: {id: asc}) {
      quantity
      holder {
        address
        name
      }
    }
    hdao_balance
    extra
  }
`;

export type HENCollectedResult = {
  hic_et_nunc_token_holder: TokenHolderRes[];
  hic_et_nunc_token_holder_aggregate: {aggregate: {count: number}};
};

export const HEN_COLLECTED_QUERY = gql`
  ${HEN_TOKEN_FIELDS}
  query henCollected($wallets: [String!]!, $offset: Int, $limit: Int) {
    hic_et_nunc_token_holder(
      where: {
        holder_id: {_in: $wallets}
        quantity: {_gt: "0"}
        token: {supply: {_gt: "0"}, creator: {address: {_nin: $wallets}}}
      }
      order_by: {token: {timestamp: desc}}
      limit: $limit
      offset: $offset
    ) {
      token {
        ...HenTokenFields
      }
    }
    hic_et_nunc_token_holder_aggregate(
      where: {
        holder_id: {_in: $wallets}
        quantity: {_gt: "0"}
        token: {supply: {_gt: "0"}}
      }
    ) {
      aggregate {
        count(columns: token_id)
      }
    }
  }
`;

export type HENTokenResult = {
  hic_et_nunc_token: Token[];
};

export type HENCreatedResult = HENTokenResult & {
  hic_et_nunc_token_aggregate: {aggregate: {count: number}};
};

export const HEN_CREATED_QUERY = gql`
  ${HEN_TOKEN_FIELDS}
  query henCreated($wallets: [String!]!, $offset: Int, $limit: Int) {
    hic_et_nunc_token(
      where: {creator_id: {_in: $wallets}, supply: {_gt: "0"}}
      order_by: {id: desc}
      limit: $limit
      offset: $offset
    ) {
      ...HenTokenFields
    }
    hic_et_nunc_token_aggregate(
      where: {creator_id: {_in: $wallets}, supply: {_gt: "0"}}
    ) {
      aggregate {
        count(columns: id)
      }
    }
  }
`;

// token details
// TODO: find more specific stuff to query for in different contexts
export type HENObjktListResult = {
  hic_et_nunc_token: DetailToken[];
};

export const HEN_OBJKT_LIST = gql`
  ${HEN_DETAIL_TOKEN_FIELDS}
  query Objkts($id: [bigint!]) {
    hic_et_nunc_token(where: {id: {_in: $id}}) {
      ...HenDetailTokenFields
    }
  }
`;
