# Dns Tezos Foundation 


### Project structure

- `src`
    - `/hooks` - Contains react hooks for various actions/state management 
        - `/walletToName` - Code for resolving a tezos address --> Tezos domain name 
    - `/components` - Contains UI components 
        - `/blocks` - Complete UI components typically used in layout or large elements on screen.
        - `/partials` - Small incomplete components typically used incombination with other components to create a full
        - `/showcases` - UI components related to nft showcases
    - `/widgets` - Small use-anywhere UI components
    - `/pages`- Complete pages
        - `/NftPlaylist` - A full page displaying a user's NFTs/tezos domains

#### Milestone 2 (new)
- `src`
   - `pages`
      - `NftBrowse` - New discovery page
      - `NftWaitlist` - Page for the NFT invites & claiming. Source code for the collection of addreses is available [here](https://github.com/mailscript/nft-invite-backend)
   -  `clients`
      - `tezid.ts` - TezId integration
   - 



