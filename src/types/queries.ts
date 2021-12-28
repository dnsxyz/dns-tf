// This is the result from hic_et_nunc_token_holder queries that can also have
// a holder in the root. We are using the same fragment to pull the fields
// for Token below so 9it should not be a problem
export interface TokenHolderRes {
    token: Token;
  }
  export interface TokenDetailRes {
    token: DetailToken;
  }
  export interface Creator {
    __typename: 'hic_et_nunc_holder';
    address: string;
    name?: string;
  }
  
  export interface Holder extends Creator {}
  export interface Swap {
    __typename: string;
    amount: number;
    amount_left: number;
    creator: Creator;
    price: number;
    status: number;
    timestamp: Date;
  }
  export interface TokenHolder {
    __typename: 'hic_et_nunc_token_holder';
    holder: Holder;
    quantity: number;
  }
  
  export interface Tag {
    __typename: 'hic_et_nunc_tag';
    tag: string;
  }
  
  export interface TokenTag {
    __typename: 'hic_et_nunc_token_tag';
    tag: Tag;
  }
  
  export interface Token {
    __typename: 'hic_et_nunc_token';
    id: number;
    artifact_uri: string;
    display_uri: string;
    thumbnail_uri?: string;
    timestamp: string;
    mime: string;
    title: string;
    description: string;
    supply: number;
    token_tags?: TokenTag[] | null;
    creator: Creator;
    swaps?: Swap[] | null;
  }
  export interface DetailToken extends Token {
    level: number;
    metadata: string;
    royalties: number;
    token_holders: TokenHolder[];
  }
  export type PaginationVars = {offset: number; limit: number};
  