const fetchMarketplaceDynamicObject = async (client, marketplaceID) => {
  console.log("Fetching marketplace dynamic object with ID:", marketplaceID);
  const MPID = marketplaceID;

  if (MPID) {
    const res = await client.getObject({
      id: MPID,
      options: { showType: true, showContent: true },
    });

    console.log("Marketplace dynamic object response:", res);

    const dynamicObject = await client.getObject({
      id: res.data?.content?.fields?.value,
      options: { showType: true, showContent: true },
    });

    console.log("Dynamic object response:", dynamicObject);
    return dynamicObject;
  } else {
    return null;
  }
};


export { fetchMarketplaceDynamicObject };