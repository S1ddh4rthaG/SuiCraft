// @ts-nocheck
import { client, selectSp } from '@/client';
import { getOffchainAuthKeys } from '@/utils/offchainAuth';
import { useContext, useState } from 'react';
import { useAccount } from 'wagmi';
import { ReedSolomon } from '@bnb-chain/reed-solomon';
import { GlobalContext } from '../../engine/GlobalContext.jsx';
import * as THREE from 'three'
import axios from 'axios';

const JWT = import.meta.env.VITE_PINATA_JWT;

export const AssetUploadAndFetch = () => {
  const { address, connector } = useAccount();
  const [ipfsURL, setIpfsURL] = useState('');
  const [objectList, setObjectList] = useState([]);
  const [info, setInfo] = useState<{
    bucketName: string;
    objectName: string;
    file: File | null;
  }>({
    bucketName: 'hackathon',
    objectName: '',
    file: null,
  });
  const [txnHash, setTxnHash] = useState('');
  const { state, dispatch } = useContext(GlobalContext);
  const { assetMaster } = state

  const fetchAssets = async () => {
    try {
      const res = await fetch("https://api.pinata.cloud/data/pinList?status=pinned", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${JWT}`,
        },
      });
      const resData = await res.json();
      console.log(resData);
      if (resData?.rows) {
        setObjectList(resData?.rows);
        dispatch({
          type: "SET_ASSETS",
          payload: {
            assetMaster: resData?.rows
          }
        })
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className="accordion-item standard-fbutton">
        <h2 className="accordion-header">
          <button className="accordion-button standard-background collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseSeven" aria-expanded="false" aria-controls="flush-collapseSeven">
            <span className="me-2 align-middle bi bi-bucket-fill text-success"></span>

            Game Assets
          </button>
        </h2>
        <div id="flush-collapseSeven" className="accordion-collapse collapse" data-bs-parent="#accordionFlushExample">
          <div className="accordion-body">
            <div className='row m-0 p-0 mb-2'>

              <div className='box shadow-sm border border-success'>
                <div className="field is-horizontal">
                  <div className="file w-100">
                    <label className="file-label">
                      <input className="file-input w-100" type="file" name="resume" onChange={(e) => {
                        if (e.target.files) {
                          setInfo({
                            ...info,
                            file: e.target.files[0],
                            objectName: e.target.files[0].name
                          })
                        }
                      }} />
                      <span className="file-cta">
                        <span className="file-icon">
                          <i className="fas fa-upload"></i>
                        </span>
                        <span className="file-label">
                          Choose a GLB model
                        </span>
                      </span>
                    </label>
                  </div>
                  <button
                    className="button is-primary me-1"
                    onClick={async () => {
                      if (!address || !info.file) return;

                      const spInfo = await selectSp();
                      // console.log('spInfo', spInfo);

                      try {
                        const file = new Blob([info.file], {
                          type: "application/json",
                        });
                        const formData = new FormData();
                        formData.append("file", file);

                        const pinataMetadata = JSON.stringify({
                          name: `${info.objectName}_${Date.now()}`,
                        });
                        formData.append("pinataMetadata", pinataMetadata);

                        const pinataOptions = JSON.stringify({
                          cidVersion: 0,
                        });
                        formData.append("pinataOptions", pinataOptions);

                        const res = await axios.post(
                          "https://api.pinata.cloud/pinning/pinFileToIPFS",
                          formData,
                          {
                            maxBodyLength: "Infinity",
                            headers: {
                              "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
                              Authorization: `Bearer ${JWT}`,
                            },
                          }
                        );

                        if (res.data && res.data.IpfsHash) {
                          console.log(
                            `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`
                          );
                          // return `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
                          setTxnHash(res.data.IpfsHash);
                          alert('create object success');
                          setIpfsURL(`https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`);
                        } else {
                          console.error("Failed to get IPFS link");
                        }
                      } catch (error) {
                        console.error(
                          "Error uploading glb file:",
                          error
                        );
                      }
                    }}
                  >
                    Upload
                  </button>
                </div>

                {/* create object */}
                <div className="field d-flex justify-content-between">


                  <button
                    disabled={txnHash === ''}
                    className="button is-primary me-1"
                    onClick={async () => {
                      if (!address || !info.file || !ipfsURL) return;

                      dispatch({
                        type: "ADD_OBJECT",
                        payload: {
                          link: ipfsURL,
                          assetIdentifier: info.objectName.concat('_').concat(Date.now().toString()),
                          assetLink: ipfsURL,
                          position: new THREE.Vector3(0, 0, 0),
                          quaternion: new THREE.Quaternion(0, 0, 0, 0),
                          scale: new THREE.Vector3(1, 1, 1),
                          worldMatrix: new THREE.Matrix4(),
                          collision: 'no', // no, yes, box, hull, trimesh (yes=box)
                          fixed: false // true, false
                        }
                      })
                    }}
                  >
                    Add to Scene
                  </button>
                  <button
                    className="button is-primary"
                    onClick={fetchAssets}
                  >
                    My Assets
                  </button>
                </div>
              </div >
            </div>
          </div>
        </div>
      </div>
    </>
  );
};