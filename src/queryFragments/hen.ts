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
  query henCollected(
    $wallets: [String!]!
    $order: order_by = desc
    $offset: Int
    $limit: Int
  ) {
    hic_et_nunc_token_holder(
      where: {
        holder_id: {_in: $wallets}
        quantity: {_gt: "0"}
        token: {supply: {_gt: "0"}, creator: {address: {_nin: $wallets}}}
      }
      order_by: {token: {timestamp: $order}}
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
        token: {supply: {_gt: "0"}, creator: {address: {_nin: $wallets}}}
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
  query henCreated(
    $wallets: [String!]!
    $order: order_by = desc
    $offset: Int
    $limit: Int
  ) {
    hic_et_nunc_token(
      where: {creator_id: {_in: $wallets}, supply: {_gt: "0"}}
      order_by: {id: $order}
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

export const HEN_LESSER_PRICE_QUERY = gql`
  ${HEN_TOKEN_FIELDS}
  query lesserPrice($price: bigint!) {
    hic_et_nunc_token(
      where: {
        title: {_neq: ""}
        swaps: {amount_left: {_gt: "0"}, price: {_lte: $price}}
      }
      limit: 20
      order_by: {trades_aggregate: {max: {timestamp: desc_nulls_last}}}
    ) {
      ...HenTokenFields
    }
  }
`;

export const HEN_GREATER_PRICE_QUERY = gql`
  ${HEN_TOKEN_FIELDS}
  query greaterPrice($price: bigint!) {
    hic_et_nunc_token(
      where: {
        title: {_neq: ""}
        swaps: {amount_left: {_gt: "0"}, price: {_gte: $price}}
      }
      limit: 20
      order_by: {trades_aggregate: {max: {timestamp: desc_nulls_last}}}
    ) {
      ...HenTokenFields
    }
  }
`;

export const HEN_LOW_EDITIONS_REMAINING_QUERY = gql`
  ${HEN_TOKEN_FIELDS}
  query lowEditionsRemaining($amountLeft: smallint = "3") {
    hic_et_nunc_token(
      where: {
        title: {_neq: ""}
        swaps: {amount_left: {_gt: "0", _lte: $amountLeft}, status: {_eq: "0"}}
        supply: {_gte: "10"}
      }
      limit: 20
      order_by: {trades_aggregate: {max: {timestamp: desc_nulls_last}}}
    ) {
      ...HenTokenFields
    }
  }
`;

export const HEN_UNIQUE_EDITIONS_QUERY = gql`
  ${HEN_TOKEN_FIELDS}
  query uniqueEditions {
    hic_et_nunc_token(
      where: {title: {_neq: ""}, supply: {_eq: "1"}}
      limit: 20
      order_by: {trades_aggregate: {max: {timestamp: desc_nulls_last}}}
    ) {
      ...HenTokenFields
    }
  }
`;

export const HEN_TOP_SOLD_SINCE_QUERY = gql`
  ${HEN_TOKEN_FIELDS}
  query topSoldSince($date: timestamptz!) {
    hic_et_nunc_trade(
      order_by: {swap: {trades_aggregate: {max: {timestamp: desc_nulls_last}}}}
      limit: 20
      where: {token: {title: {_neq: ""}}, timestamp: {_gte: $date}}
    ) {
      timestamp
      swap {
        price
      }
      token {
        ...HenTokenFields
      }
    }
  }
`;
