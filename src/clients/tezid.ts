async function fetchTezProofs(
    wallets: string[]
  ): Promise<{email: boolean; phone: boolean; gov: boolean}> {
    const promises = wallets.map(async wallet => {
      const res = await fetch(
        `https://tezid.net/api/tez/getproofs/${wallet}`
      );
      return res.json();
    });
    const proofs = (await Promise.all(promises)).flat();
    const result = {
      email: false,
      phone: false,
      gov: false,
    };
  
    for (const proof of proofs) {
      if (!proof.verified) {
        continue;
      }
      if (proof.id === 'email') {
        result.email = true;
      } else if (proof.id === 'phone') {
        result.phone = true;
      } else if (proof.id === 'gov') {
        result.gov = true;
      }
    }
  
    return result;
  }
  