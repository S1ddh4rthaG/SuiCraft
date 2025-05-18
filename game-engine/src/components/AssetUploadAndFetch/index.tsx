/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck
import { selectSp } from "@/client";
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { Tusky } from "@tusky-io/ts-sdk/web";
import { useContext, useEffect, useState } from "react";
import * as THREE from "three";
import { GlobalContext } from "../../engine/GlobalContext.jsx";

// Initialize Tusky client
const tusky = new Tusky({ apiKey: import.meta.env.VITE_TUSKY_API_KEY });

export const AssetUploadAndFetch = () => {
  const client = useSuiClient();
  const currentAccount = useCurrentAccount();

  const [showModal, setShowModal] = useState(false);
  const [progress, setProgress] = useState(0);

  const [address, setAddress] = useState("");
  useEffect(() => {
    if (currentAccount) setAddress(currentAccount.address);
  }, [currentAccount]);

  const [fileId, setFileId] = useState("");
  const [fileURL, setFileURL] = useState("");
  const [objectList, setObjectList] = useState([]);
  const [info, setInfo] = useState({ objectName: "", file: null });
  // const { dispatch } = useContext(GlobalContext);

  const [txnHash, setTxnHash] = useState("");
  const { state, dispatch } = useContext(GlobalContext);
  const { assetMaster } = state;

  const [isUploading, setIsUploading] = useState(false);

  // Upload GLB to Tusky vault
  const handleTuskyUpload = async () => {
    if (!address || !info.file) return;
    setIsUploading(true);
    try {
      const vaultName = "sui-craft-vault";
      const vaults = await tusky.vault.listAll();
      let vault = vaults.find((v) => v.name === vaultName);
      if (!vault)
        vault = await tusky.vault.create(vaultName, { encrypted: false });

      const uploadedId = await tusky.file.upload(vault.id, info.file);
      setFileId(uploadedId);
      alert("Upload to Tusky successful");
      // Immediately add to scene after upload
      const resp = await fetch(
        `https://api.tusky.io/files/${uploadedId}/data`,
        { headers: { "Api-Key": import.meta.env.VITE_TUSKY_API_KEY } }
      );
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      dispatch({
        type: "ADD_OBJECT",
        payload: {
          link: url,
          assetIdentifier: `${uploadedId}_${Date.now()}`,
          assetLink: url,
          position: new THREE.Vector3(0, 0, 0),
          quaternion: new THREE.Quaternion(0, 0, 0, 0),
          scale: new THREE.Vector3(1, 1, 1),
          worldMatrix: new THREE.Matrix4(),
          collision: "no",
          fixed: false,
        },
      });
    } catch (error) {
      console.error("Tusky upload error:", error);
      alert("Tusky upload failed");
    }
    setIsUploading(false);
  };

  // Download a specific Tusky file as blob and dispatch into scene
  const handleTuskyDownload = async (id) => {
    setShowModal(true);
    setProgress(0);
    try {
      const resp = await fetch(`https://api.tusky.io/files/${id}/data`, {
        headers: { "Api-Key": import.meta.env.VITE_TUSKY_API_KEY },
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const contentLength = resp.headers.get("Content-Length");
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      const reader = resp.body!.getReader();
      let received = 0;
      const chunks: Uint8Array[] = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value!);
        received += value!.length;
        if (total > 0) {
          setProgress(Math.floor((received / total) * 100));
        }
      }

      const blob = new Blob(chunks);
      const url = URL.createObjectURL(blob);
      dispatch({
        type: "ADD_OBJECT",
        payload: {
          link: url,
          assetIdentifier: `${id}_${Date.now()}`,
          assetLink: `https://api.tusky.io/files/${id}/data`,
          position: new THREE.Vector3(0, 0, 0),
          quaternion: new THREE.Quaternion(0, 0, 0, 0),
          scale: new THREE.Vector3(1, 1, 1),
          worldMatrix: new THREE.Matrix4(),
          collision: "no",
          fixed: false,
        },
      });
    } catch (error) {
      console.error("Tusky download error:", error);
      alert("Download failed");
    } finally {
      setShowModal(false);
      setProgress(0);
    }
  };

  // List files in Tusky vault
  const fetchTuskyAssets = async () => {
    try {
      const vaultName = "sui-craft-vault";
      const vaults = await tusky.vault.listAll();
      const vault = vaults.find((v) => v.name === vaultName);
      console.log("Tusky vault:", vault);
      if (!vault) return;
      const files = await tusky.file.list(vault.id);
      console.log("Tusky files:", files);
      const assets = files.items.map((f) => ({
        id: f.id,
        name: f.name || f.id,
      }));
      console.log("Tusky assets:", assets);
      setObjectList(assets);

      dispatch({ type: "SET_ASSETS", payload: { assetMaster: assets } });
    } catch (error) {
      console.error("Tusky fetch error:", error);
    }
  };

  useEffect(() => {
    if (address) {
      fetchTuskyAssets();
    }
  }, [address]);

  return (
    <>
      {/* Progress Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content standard-background">
              <div className="modal-header standard-background border-0">
                <h5 className="modal-title">Downloading asset</h5>
              </div>
              <div className="modal-body">
                <div className="progress">
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{ width: `${progress}%` }}
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    {progress}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="accordion-item standard-fbutton">
        <h2 className="accordion-header">
          <button
            className="accordion-button standard-background collapsed"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#assetCollapse"
            aria-expanded="false"
          >
            <span className="me-2 align-middle bi bi-bucket-fill text-success" />{" "}
            Game Assets
          </button>
        </h2>
        <div
          id="assetCollapse"
          className="accordion-collapse collapse"
          data-bs-parent="#accordionFlushExample"
        >
          <div className="accordion-body w-100 p-0">
            <div className="row m-0 p-0">
              <div className="box shadow-sm border-0 standard-background p-2 pt-2 pb-2">
                <div className="field is-horizontal align-items-center justify-content-between">
                  <div className="file">
                    <label className="file-label">
                      <input
                        className="file-input"
                        type="file"
                        accept=".glb"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setInfo({ objectName: file.name, file });
                        }}
                      />
                      <span className="file-cta">
                        <span className="file-icon">
                          <i className="fas fa-upload" />
                        </span>
                        <span className="file-label">Choose a GLB model</span>
                      </span>
                    </label>
                  </div>
                  <button
                    className="standard-button is-primary m-1 p-2"
                    onClick={handleTuskyUpload}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <span>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Uploading...
                      </span>
                    ) : (
                      <span>
                        {"Upload"} <span className="bi bi-upload ms-1" />
                      </span>
                    )}
                  </button>
                </div>

                <div className="field d-flex flex-column w-100">
                  <div style={{ maxHeight: 150, overflowY: "auto" }}>
                    {objectList.map((asset) => (
                      <div
                        key={asset.id}
                        className="d-flex justify-content-between align-items-center border border-dark p-2"
                      >
                        <span>{asset.name}</span>
                        <button
                          className="standard-button is-primary"
                          onClick={() => handleTuskyDownload(asset.id)}
                        >
                          <span className="bi bi-download" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    className="standard-button is-secondary mt-2"
                    onClick={fetchTuskyAssets}
                  >
                    Reload Assets <span className="bi bi-arrow-clockwise" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AssetUploadAndFetch;
