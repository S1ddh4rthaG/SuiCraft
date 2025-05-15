<button onClick={() => setIsGreenVisible(!isGreenVisible)}>
Import from Greenfield
</button>
{isGreenVisible && <Green />}
<div className='panel' style={{ height: "10vh" }}>
<div style={{ display: 'flex', flexDirection: 'column' }}>
  {/* Add Panel */}
  <div style={{ border: '1px solid black', padding: '10px', marginBottom: "10px" }}>
    <h2>Add Object</h2>
    <input type='text' placeholder='Asset Identifier' onChange={(e) => setAssetIdentifer(e.target.value)} value={assetIdentifer} />
    <input type='text' placeholder='Asset Link' onChange={(e) => setAssetLink(e.target.value)} value={assetLink} />
    <button onClick={AddAction}>Add</button>
  </div>

  {/* Delete Panel */}
  <div style={{ border: '1px solid black', padding: '10px', marginBottom: "10px" }}>
    <h2>Delete Object</h2>
    <input type='text' placeholder='Asset Identifier' onChange={(e) => setAssetIdentifer(e.target.value)} value={assetIdentifer} />
    <button onClick={() => DeleteAction(assetIdentifer)}>Delete</button>
  </div>

  {/* Object Master */}
  <div style={{ border: '1px solid black', padding: '10px', marginBottom: "10px" }}>
    <h2>Object Master</h2>
    <button onClick={LoadObjectMaster}>Load</button>
    <button
      onClick={() => {
        const a = document.createElement("a");
        const file = new Blob([JSON.stringify(objectMaster)], { type: 'application/json' });
        a.href = URL.createObjectURL(file);
        a.download = 'objectMaster.json';
        a.click();
      }}
    >Download</button>
    <h3>Object Count: {objectMaster.length}</h3>
    <ul style={{ overflowY: "scroll", height: "40vh" }}>
      {
        objectMaster.map((object) => {
          if (object.type === "object")
            return <div style={{ padding: "4px", border: "2px solid white" }}>
              <li>Asset: <span style={{ color: "red" }}>{object.assetIdentifier}</span></li>
              <li>Position: <ul>
                <li>x: <span style={{ color: "blue" }}>{object.position.x}</span></li>
                <li>y: <span style={{ color: "blue" }}>{object.position.y}</span></li>
                <li>z: <span style={{ color: "blue" }}>{object.position.z}</span></li>
              </ul>
              </li>
              <li>Quaternion: <ul>
                <li>x: <span style={{ color: "blue" }}>{object.quaternion.x}</span></li>
                <li>y: <span style={{ color: "blue" }}>{object.quaternion.y}</span></li>
                <li>z: <span style={{ color: "blue" }}>{object.quaternion.z}</span></li>
                <li>w: <span style={{ color: "blue" }}>{object.quaternion.w}</span></li>
              </ul>
              </li>
              <li>Scale:  <ul>
                <li>x: <span style={{ color: "blue" }}>{object.scale.x}</span></li>
                <li>y: <span style={{ color: "blue" }}>{object.scale.y}</span></li>
                <li>z: <span style={{ color: "blue" }}>{object.scale.z}</span></li>
              </ul>
              </li>
            </div>
        })
      }
    </ul>
  </div>
</div>
</div>