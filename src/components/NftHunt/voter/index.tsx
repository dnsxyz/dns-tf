import { useState, useCallback } from 'react';
import { useCeramic } from '../../../../../controller/hooks/ceramic';
import {
    useHuntState,
    useNFTItem,
    useNFTUserActions,
} from '../../../hooks/nftHunt';
import { HuntItem } from '../../../clients/nftHunt';
import { HuntedProps, NotHuntedProps, VoterProps } from './types';
import * as Bubble from './VoteBubble';
import * as Block from './VoteBlock';
import * as Mobile from './VoteMobile';

export const foo = 'bar';

enum VoteState {
    UNHUNTED,
    UNVOTED,
    VOTING,
    VOTED,
    HUNTING,
    HUNTED,
}

type LoadedProps = {
    huntId: string;
    nftId: string;
    item: HuntItem;
    notHuntedComponent(props: NotHuntedProps): JSX.Element;
    huntedComponent(props: HuntedProps): JSX.Element;
    loadingComponent(): JSX.Element;
};

function Loaded({
    huntId,
    nftId,
    item,
    notHuntedComponent: NotHunted,
    huntedComponent: Hunted,
    loadingComponent: Loading,
}: LoadedProps) {
    //createJWS will create JWS signed payload using the DID of the currently signed in user
    //createJWS is directly exported from Ceramics DIDs
    const { createJWS } = useCeramic();
    const { upvoteNFTItem, huntNFTItem } = useNFTUserActions(createJWS);
    const { userRemainingHunts } = useHuntState(); //Gets remaining hunts of the currently signed in user
    const [voteState, setVoteState] = useState(
        item.status === 'unassigned' ? VoteState.UNHUNTED : VoteState.UNVOTED
    ); //Vote status of the NFT in the current hunt. Unassigned means it has not been submitted/hunted in the current hunt. If it has been assigned we will assume it has not been voted yet.

    const upvoteHandler = useCallback(async () => {
        setVoteState(VoteState.VOTING);
        try {
            await upvoteNFTItem(huntId, nftId);
            setVoteState(VoteState.VOTED);
        } catch (e) {
            setVoteState(VoteState.UNVOTED);
        }
    }, [huntId, nftId, upvoteNFTItem]);

    const huntHandler = useCallback(async () => {
        setVoteState(VoteState.HUNTING);
        try {
            await huntNFTItem(huntId, nftId);
            setVoteState(VoteState.HUNTED);
        } catch (e) {
            setVoteState(VoteState.UNHUNTED);
        }
    }, [huntId, nftId, huntNFTItem]);
    switch (voteState) {
        case VoteState.UNHUNTED:
            return <NotHunted remaining={userRemainingHunts} onHunt={huntHandler} />;
        case VoteState.UNVOTED:
            return (
                <Hunted
                    upvotes={item.content.upvotes}
                    alreadyVoted={item.alreadyVoted}
                    onUpvote={upvoteHandler}
                />
            );
        case VoteState.VOTING:
        case VoteState.HUNTING:
            return <Loading />;
        case VoteState.VOTED:
            return (
                <Hunted
                    upvotes={item.content.upvotes + 1}
                    alreadyVoted
                    onUpvote={upvoteHandler}
                />
            );
        case VoteState.HUNTED:
            return <Hunted upvotes={1} alreadyVoted onUpvote={upvoteHandler} />;
    }
}


export function UpvoteBubble({ huntId, nftId }: VoterProps) {
    //The DID of the currently signed in user. useCeramicc() is an internal hook that handles Ceramic and Ceramic identity.
    const { userDid } = useCeramic();
    const { nftItem } = useNFTItem(huntId, nftId, userDid);
    //const matches = useMediaQuery(theme.breakpoints.down('sm'));

    return nftItem ? (
        <Loaded
            huntId={huntId}
            nftId={nftId}
            item={nftItem}
            notHuntedComponent={Bubble.NotHunted}
            huntedComponent={Bubble.Hunted}
            loadingComponent={Bubble.Loading}
        />
    ) : (
        <Bubble.Loading />
    );
}

export function UpvoteBlock({ huntId, nftId }: VoterProps) {
    //The DID of the currently signed in user
    const { userDid } = useCeramic();
    const { nftItem } = useNFTItem(huntId, nftId, userDid);
    return nftItem ? (
        <Loaded
            huntId={huntId}
            nftId={nftId}
            item={nftItem}
            notHuntedComponent={Block.NotHunted}
            huntedComponent={Block.Hunted}
            loadingComponent={Block.Loading}
        />
    ) : (
        <Block.Loading />
    );
}
export function UpvoteMobile({ huntId, nftId }: VoterProps) {
    //The DID of the currently signed in user
    const { userDid } = useCeramic();
    const { nftItem } = useNFTItem(huntId, nftId, userDid);
    return nftItem ? (
        <Loaded
            huntId={huntId}
            nftId={nftId}
            item={nftItem}
            notHuntedComponent={Mobile.NotHunted}
            huntedComponent={Mobile.Hunted}
            loadingComponent={Mobile.Loading}
        />
    ) : (
        <Mobile.Loading />
    );
}
