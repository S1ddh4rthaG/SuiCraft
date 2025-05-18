import {
  GizmoHelper,
  GizmoViewport,
  OrbitControls,
  Outlines,
  Sphere,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useContext, useRef, useState } from "react";
import Swal from "sweetalert2";
import * as THREE from "three";
import { GlobalContext, GlobalContextProvider } from "./GlobalContext.jsx";

import WalletAssetDisplay from "../WalletAssetDisplay.tsx";
import EnvironmentControls from "./EnvironmentControls.jsx";
import LightControls from "./LightControls.jsx";
import LocationDisplay from "./LocationDisplay.jsx";
import Model from "./Model.jsx";
import ObjectControls from "./ObjectControls.jsx";
import PlayerControls from "./PlayerControls.jsx";
import TaskControls from "./TaskControls.jsx";
import objJSON from "./objectMaster.json";

import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useNetworkVariable } from "../networkConfig.ts";

import "./engine.css";
import logo from "./logo.png";

import { Grid } from "@react-three/drei";
import { GAME_FACTORY } from "../constants.ts";

export default function App() {
  return (
    <GlobalContextProvider>
      <Scene />
    </GlobalContextProvider>
  );
}

function Scene() {
  const client = useSuiClient();
  const suiCraftPackageId = useNetworkVariable("suiCraftPackageId");
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const [height, setHeight] = useState("30%");
  const [panelClass, setPanelClass] = useState("col-3");

  const fileInputRef = useRef(null);
  const { state, dispatch } = useContext(GlobalContext);
  const { objectMaster, currentObjectIdentifer, assetMaster } = state;

  const [showModal, setShowModal] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleAddAsset = async (id) => {
    setShowModal(true);
    setProgress(0);
    try {
      const resp = await fetch(`https://api.tusky.io/files/${id}/data`, {
        headers: { "Api-Key": import.meta.env.VITE_TUSKY_API_KEY },
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const contentLength = resp.headers.get("Content-Length");
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      const reader = resp.body.getReader();
      let received = 0;
      const chunks = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
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

  // Load Object Master
  const loadScene = (file) => {
    file.map((object) => {
      if (object.type === "object") {
        const AddAction = {
          type: "ADD_OBJECT",
          payload: {
            // Asset Information
            assetIdentifier: object.assetIdentifier,
            assetLink: object.assetLink,

            // Location and Orientation
            position: new THREE.Vector3(
              object.position.x,
              object.position.y,
              object.position.z
            ),
            quaternion: new THREE.Quaternion(
              object.quaternion.x,
              object.quaternion.y,
              object.quaternion.z,
              object.quaternion.w
            ),
            scale: new THREE.Vector3(
              object.scale.x,
              object.scale.y,
              object.scale.z
            ),
            worldMatrix: new THREE.Matrix4().fromArray(
              object.worldMatrix.elements
            ),
            initialVelocity: object.initialVelocity,
            followPlayer: object.followPlayer,
            scaleFactor: object.scaleFactor,
            scaleFactorPivot: object.scaleFactorPivot,

            // State
            fixed: object.fixed,
            mass: object.mass,
            colliders: object.colliders,

            // Methods
            OnClick: object.OnClick,
            OnHover: object.OnHover,
            OnCollision: object.OnCollision,
          },
        };

        dispatch(AddAction);
      } else if (object.type === "light") {
        const AddAction = {
          type: "ADD_LIGHT",
          payload: {
            assetIdentifier: object.assetIdentifier,
            position: new THREE.Vector3(
              object.position.x,
              object.position.y,
              object.position.z
            ),
            intensity: object.intensity,
            color: object.color,
          },
        };

        dispatch(AddAction);
      } else if (object.type === "task") {
        const AddAction = {
          type: "ADD_TASK",
          payload: {
            assetIdentifier: object.assetIdentifier,
          },
        };
        dispatch(AddAction);
      } else if (object.type === "environment") {
        const ChangeAction = {
          type: "CHANGE_ENVIRONMENT",
          payload: {
            assetIdentifier: object.assetIdentifier,
            gravity: object.gravity,
            sky_color: object.sky_color,
            ambient_light: object.ambient_light,
            player_speed: object.player_speed,
            player_mass: object.player_mass,
            player_size: object.player_size,
            player_jump: object.player_jump,
            player_flycontrol: object.player_flycontrol,
            stars: object.stars,
            env_music: object.env_music,
            player_music: object.player_music,
          },
        };
        dispatch(ChangeAction);
      }
    });
  };

  // Download Scene
  const downloadScene = () => {
    const a = document.createElement("a");
    const file = new Blob([JSON.stringify(objectMaster)], {
      type: "application/json",
    });
    a.href = URL.createObjectURL(file);
    a.download = "objectMaster.json";
    a.click();
  };

  // Import Scene
  const importScene = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const fileContent = e.target.result;
      try {
        const worldData = JSON.parse(fileContent);
        loadScene(worldData);
        console.log("World data loaded:", worldData);
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    };

    reader.readAsText(file);
  };

  // Publish Game
  const publishGame = async () => {
    try {
      // Prompt for game details
      const { value: gameName } = await Swal.fire({
        title: "Enter Game Name",
        input: "text",
        inputPlaceholder: "Enter your game name",
        showCancelButton: true,
        background: "#2b2b2b",
        color: "#fff",
        inputValidator: (value) => {
          if (!value) {
            return "You need to enter a game name!";
          }
        },
      });

      if (!gameName) return;

      const { value: gamePrice } = await Swal.fire({
        title: "Enter Game Price",
        input: "number",
        inputPlaceholder: "Enter the price of your game",
        inputAttributes: { min: 0 },
        showCancelButton: true,
        background: "#2b2b2b",
        color: "#fff",
        inputValidator: (value) => {
          if (!value) {
            return "You need to enter a game price!";
          }
        },
      });

      if (!gamePrice) return;

      const { value: gameThumbnail } = await Swal.fire({
        title: "Enter Game Thumbnail",
        input: "text",
        inputLabel: "Game Thumbnail",
        inputPlaceholder: "Enter the thumbnail link of your game",
        showCancelButton: true,
        background: "#2b2b2b",
        color: "#fff",
        inputValidator: (value) => {
          if (!value) {
            return "You need to enter a game thumbnail!";
          }
        },
      });

      if (!gameThumbnail) return;

      // Upload scene JSON to Tusky
      const tusky = new (await import("@tusky-io/ts-sdk/web")).Tusky({
        apiKey: import.meta.env.VITE_TUSKY_API_KEY,
      });
      const vaultName = "sui-craft-vault";
      let vaults = await tusky.vault.listAll();
      let vault = vaults.find((v) => v.name === vaultName);
      if (!vault)
        vault = await tusky.vault.create(vaultName, { encrypted: false });
      const sceneBlob = new Blob([JSON.stringify(objectMaster)], {
        type: "application/json",
      });
      const tuskyFileId = await tusky.file.upload(vault.id, sceneBlob);
      const tuskySceneUrl = `https://api.tusky.io/files/${tuskyFileId}/data`;

      // Prepare tasks
      const tasks = objectMaster.filter((object) => object.type === "task");
      let taskNames = tasks.map((task) => task.assetIdentifier);
      console.log("taskNames:", taskNames);

      const tx = new Transaction();

      tx.moveCall({
        arguments: [
          tx.object(GAME_FACTORY),
          tx.pure.string(gameName),
          tx.pure.string(gameThumbnail),
          tx.pure.u64(gamePrice),
          tx.pure.string(tuskySceneUrl),
          tx.pure.vector("string", taskNames),
        ],
        target: `${suiCraftPackageId}::game::new_game`,
      });

      console.log("Transaction: ", tx);

      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: async ({ digest }) => {
            const { effects } = await client.waitForTransaction({
              digest: digest,
              options: {
                showEffects: true,
              },
            });

            Swal.fire({
              title: "Game Published!",
              html:
                `<div>Scene uploaded to Tusky:<br/><a href='${tuskySceneUrl}' target='_blank'>${tuskySceneUrl}</a></div>` +
                `<div class='mt-2'>Game Name: <b>${gameName}</b><br/>Price: <b>${gamePrice}</b><br/>Thumbnail: <b>${gameThumbnail}</b></div>`,
              icon: "success",
              confirmButtonText: "OK",
              background: "#2b2b2b",
              color: "#fff",
            });
          },
        }
      );
    } catch (error) {
      console.error("Error in publishGame:", error);
      Swal.fire({
        title: "Error",
        text: error.message || "Failed to publish game.",
        icon: "error",
        background: "#2b2b2b",
        color: "#fff",
      });
    }
  };

  return (
    <div className="d-flex flex-column vh-100">
      <div className="row m-0 w-100 overflow-auto">
        <div
          className={
            "d-flex flex-column p-0 m-0 vh-100 " +
            (panelClass == "col-3" ? "col-9" : "col-12")
          }
        >
          <div className="d-flex flex-row standard-background justify-content-between align-items-center pt-1 pb-1 m-0">
            <div className="col-3">
              <img
                src={logo}
                alt="logo"
                width="40"
                className="me-1 align-middle bg-light rounded-2"
              />
            </div>
            <div className="col-3"></div>
            <div className="col-6 text-end">
              <div className="m-0">
                <input
                  type="file"
                  accept=".json"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={importScene}
                />
                <button
                  className="mx-1 px-2 p-1 my-0 standard-button"
                  onClick={() => fileInputRef.current.click()}
                >
                  <span className="me-1 bi bi-upload align-text-top"></span>
                  Upload
                </button>
                <button
                  className="mx-1 px-2 p-1 my-0 standard-button"
                  onClick={() => {
                    loadScene(objJSON);
                  }}
                >
                  <span className="me-1 bi bi-folder-symlink align-text-top"></span>
                  Load
                </button>
                <button
                  className="mx-1 px-2 p-1 my-0 standard-button"
                  onClick={() => downloadScene()}
                >
                  <span className="me-1 bi bi-cloud-arrow-down align-text-top"></span>
                  Export
                </button>
                <button
                  className="mx-1 px-2 p-1 my-0 standard-button"
                  onClick={() => {
                    console.log("redirect to debug enabled testing page");
                  }}
                >
                  <span className="me-1 bi bi-play-circle align-text-top"></span>
                  Test
                </button>
                <button
                  className="mx-1 px-2 p-1 my-0 standard-button"
                  onClick={() => {
                    publishGame();
                  }}
                >
                  <span className="me-1 bi bi-cloud-arrow-up align-text-top"></span>
                  Publish
                </button>
                <button
                  className="ms-3 me-1 px-2 p-1 rounded-5 my-0 standard-fbutton"
                  onClick={() => {
                    if (panelClass === "col-3") setPanelClass("d-none");
                    else setPanelClass("col-3");
                  }}
                >
                  {panelClass == "col-3" ? (
                    <span className="bi bi-chevron-double-right"></span>
                  ) : (
                    <span className="bi bi-chevron-double-left"></span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Scene */}
          <div style={{ height: height === "30%" ? "70%" : "100%" }}>
            <Canvas
              shadows
              raycaster={{ params: { Line: { threshold: 0.15 } } }}
              camera={{ position: [-10, 10, 10], fov: 30 }}
              id="objectScene"
            >
              <color attach="background" args={[objectMaster[0].sky_color]} />
              <>
                <Grid
                  args={[500, 500]}
                  cellSize={1}
                  sectionSize={5}
                  cellColor={"yellow"}
                  sectionThickness={1}
                  cellThickness={0.5}
                />
                <mesh position={[0, 1, 0]}>
                  <cylinderGeometry args={[0.5, 0.5, 1.5]} />
                  <Outlines thickness={0.05} color="hotpink" />
                  <meshNormalMaterial color={"green"} />
                </mesh>

                <ambientLight intensity={objectMaster[0].ambient_light} />
                {objectMaster.map((object) => {
                  if (object.type === "object")
                    return (
                      <Model
                        assetIdentifer={object.assetIdentifier}
                        assetLink={object.assetLink}
                        collision={object.collision}
                        fixed={object.fixed}
                        worldMatrix={object.worldMatrix}
                        scaleFactor={object.scaleFactor}
                        scaleFactorPivot={object.scaleFactorPivot}
                      />
                    );
                  else return <></>;
                })}
              </>

              {objectMaster.map((object) => {
                if (object.type === "light")
                  return (
                    <>
                      <Sphere
                        scale={0.2}
                        position={[
                          object.position.x,
                          object.position.y,
                          object.position.z,
                        ]}
                      >
                        <meshStandardMaterial color={object.color} />
                      </Sphere>
                      <pointLight
                        key={object.assetIdentifier}
                        position={[
                          object.position.x,
                          object.position.y,
                          object.position.z,
                        ]}
                        intensity={object.intensity}
                        color={object.color}
                      />
                    </>
                  );
                else return <></>;
              })}

              <mesh scale={30} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry />
                <shadowMaterial transparent opacity={0.2} />
              </mesh>

              <GizmoHelper alignment="bottom-right" margin={[100, 100]}>
                <GizmoViewport labelColor="white" axisHeadScale={1} />
              </GizmoHelper>
              <OrbitControls makeDefault />
            </Canvas>
          </div>

          {/* Asset Panel */}
          <div
            className="standard-background overflow-auto w-100"
            style={{ height: height }}
          >
            <div className="row m-0 pb-1">
              <button
                className="m-0 p-0 border-0 text-light"
                style={{ borderRadius: "0px" }}
                onClick={() => {
                  if (height === "30%") setHeight("3.4%");
                  else setHeight("30%");
                }}
              >
                {height === "30%" ? (
                  <span className="bi bi-chevron-double-down"></span>
                ) : (
                  <span className="bi bi-chevron-double-up"></span>
                )}
              </button>
            </div>
            <div className="row m-0 p-0">
              {assetMaster.map((object, index) => {
                let objectName =
                  object.metadata?.name || object.name || object.id || "";
                let objectNameWithoutTimeStamp = objectName.split("_")[0];
                // Only show .glb files
                if (objectNameWithoutTimeStamp.split(".").pop() !== "glb")
                  return;

                let url = object.ipfs_pin_hash
                  ? `https://gateway.pinata.cloud/ipfs/${object.ipfs_pin_hash}`
                  : object.link ||
                    object.assetLink ||
                    (object.id
                      ? `https://api.tusky.io/files/${object.id}/data`
                      : "");
                if (!url) return;
                return (
                  <div
                    key={index}
                    className="col-2 m-0 p-0 card text-light border-0 bg-transparent"
                  >
                    <div className="d-flex flex-column card-body bg-dark m-1 rounded-2 shadow-">
                      <h6 className="card-title">
                        {objectNameWithoutTimeStamp}
                      </h6>
                      <div className="flex-fill"></div>
                      <div className="d-flex justify-content-between">
                        <a href={url} className="btn btn-primary">
                          <span className="bi bi-download"></span>
                        </a>
                        <button
                          className="btn btn-primary"
                          onClick={() => {
                            navigator.clipboard.writeText(url);
                            handleAddAsset(object.id);
                          }}
                        >
                          <span className="bi bi-plus"></span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div
          className={
            "text-light shadow standard-background vh-100 p-0 overflow-auto " +
            panelClass
          }
        >
          <div className="accordion accordion-flush" id="accordionFlushExample">
            <div className="p-1 shadow-sm pb-2 rounded-2">
              <h4 className="text-start standard-fbutton rounded-2 px-2 p-1 px-2 py-2">
                Wallet Controls
              </h4>
              <WalletAssetDisplay />
            </div>
            <div className="m-1 shadow-sm pb-2 rounded-2 mt-3">
              <h4 className="text-start standard-fbutton rounded-2 px-2 py-2">
                Engine Controls
              </h4>
              <EnvironmentControls />
              <PlayerControls />
              <ObjectControls />
              <LocationDisplay />
              <LightControls />
              <TaskControls />
            </div>
          </div>
        </div>

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
      </div>
    </div>
  );
}
