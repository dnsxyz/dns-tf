export type NotHuntedProps = {
    onHunt: () => Promise<any>;
    remaining: number;
  };
  export type HuntedProps = {
    upvotes: number;
    alreadyVoted?: boolean;
    onUpvote: () => Promise<any>;
  };
  
  export type VoterProps = {
    huntId: string;
    nftId: string;
  };
  