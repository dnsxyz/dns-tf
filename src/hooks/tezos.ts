import {useCallback, useEffect} from 'react';
import Axios from 'axios';

import {getTezProfileAsProfile} from '../clients/tezos';
import {useSocials} from './socials'; //Internal hook for handling socials
import {useTextile} from './textile'; //Internal hook for handling adding/removing/listing files from textile
import {useProfile} from './profile'; //Internal hook for handling profile data

export function useTzprofileSync() {
  const {addSocial, commit: commitSocials} = useSocials();
  const {uploadFile} = useTextile();
  const {setField, commit: commitProfile} = useProfile();

  const triggerSync = useCallback(
    async tezAddr => {
      const profileInfo = await getTezProfileAsProfile(tezAddr);
      if (!profileInfo) {
        return;
      }
      const {basicProfile, socials, logoUrl} = profileInfo;

      for (let [key, value] of Object.entries(basicProfile)) {
        if (value) {
          setField(key as any, value);
        }
      }

      for (let socio of socials) {
        try {
          addSocial(socio);
        } catch (ignore) {} // throws an exception if the social already exists
      }

      if (logoUrl) {
        const data = await (await fetch(logoUrl)).blob();
        const ipfsCid = await uploadFile(data);
        const image = new Image();
        image.src = (window.URL as any).createObjectURL(data);
        const [width, height] = await new Promise((resolve, fail) => {
          image.onload = () => {
            resolve([image.naturalWidth, image.naturalHeight]);
          };
        });
        setField('image', {
          original: {
            src: `ipfs://${ipfsCid}`,
            mimeType: data.type,
            width,
            height,
          },
        });
        URL.revokeObjectURL(image.src);
      }
      await commitProfile();
      await commitSocials();
    },
    [addSocial, commitProfile, commitSocials, setField, uploadFile]
  );

  return {
    triggerSync,
  };
}
