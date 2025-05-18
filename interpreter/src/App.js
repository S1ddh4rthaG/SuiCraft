import { Canvas, useFrame, useLoader } from "@react-three/fiber"
import { Loader, PointerLockControls, KeyboardControls, Cylinder, Box, Stars } from "@react-three/drei"
import { Debug, Physics, RigidBody, CapsuleCollider } from "@react-three/rapier"
import { Player } from "./Player"
import { Suspense, useEffect, useState, useRef } from "react"
import { utils, ethers } from "ethers"
import PlayerStatus from "./contracts/PlayerStatus.json"
import GameAbi from "./contracts/Game.json"
import { useSharedState } from "./sharedState"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import Swal from "sweetalert2"

import GameFactoryMarketplace from "./GameFactoryMarketplace"
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit"
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit"
import { Transaction } from "@mysten/sui/transactions"
import { useNetworkVariable } from "./networkConfig.js"
import { GAME_FACTORY } from "./constants.js"

const VITE_TUSKY_API_KEY = "5902acd4-38ee-410a-a23e-1674d025bec5"

// Custom hook to fetch & parse GLTF from a remote URL
function useGLTFFromUrl(url) {
  const [gltf, setGltf] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function fetchAndParse() {
      try {
        const resp = await fetch(url, {
          headers: { "Api-Key": VITE_TUSKY_API_KEY },
        })
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
        const arrayBuffer = await resp.arrayBuffer()
        const loader = new GLTFLoader()
        loader.parse(arrayBuffer, "", (parsed) => {
          if (!cancelled) setGltf(parsed)
        })
      } catch (e) {
        console.error("Failed to load model:", e)
      }
    }
    fetchAndParse()
    return () => {
      cancelled = true
    }
  }, [url])

  return gltf
}

function Model({ file, object }) {
  const gltf = useGLTFFromUrl(file)
  const blobUrlRef = useRef(null)

  // Create & revoke blob URL if needed
  useEffect(() => {
    if (gltf) {
      // nothing to do here if parsing directly
      return
    }
  }, [gltf])

  if (!gltf) return null

  const { scale, position, assetIdentifier } = object
  return <primitive key={assetIdentifier} object={gltf.scene.clone()} scale={[scale.x, scale.y, scale.z]} position={[position.x, position.y, position.z]} />
}

export default function App() {
  const queryParams = new URLSearchParams(window.location.search)
  const gameAddress = queryParams.get("game") || null
  const testmode = queryParams.get("testmode") === "true"
  const client = useSuiClient()
  const currentAccount = useCurrentAccount()
  const { setText } = useSharedState()
  const suiCraftPackageId = useNetworkVariable("suiCraftPackageId")
  const { mutate: signAndExecute } = useSignAndExecuteTransaction()

  const [worldSettings, setWorldSettings] = useState(null)
  const [lights, setLights] = useState([])
  const [objects, setObjects] = useState([])
  const [gameReady, setGameReady] = useState(false)
  const [playerGameObj, setPlayerGameObj] = useState(null)
  const [data, setData] = useState(null)

  // Parse the JSON payload into our React state
  const load = (json) => {
    const env = json.find((o) => o.type === "environment") || {}
    const lightObjs = json.filter((o) => o.type === "light")
    const objList = json.filter((o) => o.type === "object")

    setWorldSettings(env)
    setLights(lightObjs)
    setObjects(objList)
    setGameReady(true)
  }

  // Show start/end menu
  const menu = (isStart) => {
    Swal.fire({
      title: "Menu",
      text: isStart ? "Welcome to the game" : "You Won",
      icon: "success",
      confirmButtonText: "New Game",
    }).then((result) => {
      console.log("isConfirmed:", result.isConfirmed, "playerGameObj:", playerGameObj)
      if (result.isConfirmed && playerGameObj) {
        const tx = new Transaction()
        tx.setGasBudget(100000000)

        tx.moveCall({
          target: `${suiCraftPackageId}::game::reset_status`,
          arguments: [tx.object(playerGameObj)],
        })

        signAndExecute(
          { transaction: tx },
          {
            onSuccess: async ({ digest }) => {
              alert("Game reset successfully!")
              await client.waitForTransaction({ digest, options: { showEffects: true } })
            },
            onError: (error) => {
              alert("Game reset failed!")
              console.error("Transaction Error:", error)
            },
          },
        )
      }
    })
  }

  // Load the on-chain Game configuration and JSON
  const loadGame = async () => {
    if (!gameAddress) return
    try {
      const res = await client.getObject({
        id: gameAddress,
        options: { showContent: true },
      })

      console.log("Game loaded:", res)

      const playersTableID = res.data.content.fields.players.fields.id.id
      const resPlayers = await client.getDynamicFields({ parentId: playersTableID })
      const playerAddresses = resPlayers.data.map((p) => {
        return p.name.value
      })

      const gameDetails = res.data.content.fields

      console.log("playerAddresses:", playerAddresses)
      console.log("currentAccount:", currentAccount.address)

      if (!playerAddresses.includes(currentAccount.address)) {
        const tx = new Transaction()

        const price = gameDetails.price
        console.log("[buyGame] price value:", price, "type:", typeof price)
        const priceStr = typeof price === "bigint" ? price.toString() : String(price)

        const payment = tx.splitCoins(tx.gas, [
          (() => {
            console.log("[buyGame] priceStr:", priceStr, "type:", typeof priceStr)
            return tx.pure.u64(priceStr)
          })(),
        ])

        console.log("[buyGame] payment:", payment)
        tx.setGasBudget(100000000)

        tx.moveCall({
          arguments: [tx.object(gameAddress), payment],
          target: `${suiCraftPackageId}::game::buy_game`,
        })

        signAndExecute(
          { transaction: tx },
          {
            onSuccess: async ({ digest }) => {
              alert("Game Purchased Successfully!")
              await client.waitForTransaction({ digest, options: { showEffects: true } })
            },
            onError: (error) => {
              alert("Game Purchase Failed!")
              console.error("Transaction Error:", error)
            },
          },
        )
      }
      const resPlayersv2 = await client.getDynamicFields({ parentId: playersTableID })
      console.log("resPlayersv2:", resPlayers)
      const playerGameObjID = resPlayersv2.data.find((p) => p.name.value === currentAccount.address).objectId
      console.log("playerGameObjID:", playerGameObjID)
      const playerDynamicObj = await client.getObject({
        id: playerGameObjID,
        options: { showContent: true },
      })
      console.log("playerDynamicObj:", playerDynamicObj)
      const playerDynamicObjID = playerDynamicObj.data.content.fields.value
      console.log("playerDynamicObjID:", playerDynamicObjID)
      setPlayerGameObj(playerDynamicObjID)

      const configUrl = res.data.content.fields.configuration
      const resp = await fetch(configUrl, {
        headers: { "Api-Key": VITE_TUSKY_API_KEY },
      })
      const gameData = await resp.json()
      setData(gameData)
      load(gameData)
      menu(true)
    } catch (e) {
      console.error("Error loading game:", e)
    }
  }

  // If in test mode, prompt user to paste JSON
  const promptTestJson = async () => {
    const { value: text } = await Swal.fire({
      title: "Test Mode JSON",
      input: "textarea",
      inputPlaceholder: "Paste JSON here",
    })
    if (text) {
      const parsed = JSON.parse(text)
      setData(parsed)
      load(parsed)
    }
  }

  // Kick things off
  useEffect(() => {
    if (testmode) {
      promptTestJson()
    } else {
      if (currentAccount) loadGame()
    }
  }, [currentAccount])

  if (!gameAddress) {
    return <GameFactoryMarketplace />
  }

  if (!gameReady || !worldSettings) {
    return <Loader />
  }

  return (
    <KeyboardControls
      map={[
        { name: "forward", keys: ["w", "W", "ArrowUp"] },
        { name: "backward", keys: ["s", "S", "ArrowDown"] },
        { name: "left", keys: ["a", "A", "ArrowLeft"] },
        { name: "right", keys: ["d", "D", "ArrowRight"] },
        { name: "jump", keys: ["Space"] },
      ]}>
      <Suspense fallback={null}>
        <Canvas camera={{ fov: 45 }} shadows>
          <color attach="background" args={[worldSettings.sky_color]} />
          {worldSettings.stars && <Stars depth={100} />}
          <ambientLight intensity={worldSettings.ambient_light} />
          {lights.map((l) => (
            <pointLight key={l.assetIdentifier} position={[l.position.x, l.position.y, l.position.z]} intensity={l.intensity} color={l.color} />
          ))}

          <Physics gravity={[0, -worldSettings.gravity, 0]}>
            {objects.map((obj) =>
              obj.colliders !== "no" ? (
                <RigidBody
                  key={obj.assetIdentifier}
                  type={obj.fixed ? "fixed" : "dynamic"}
                  colliders={obj.colliders}
                  sensor={obj.sensor}
                  onPointerEnter={() => setText(obj.onHover)}
                  onPointerLeave={() => setText("")}
                  onClick={async () => {
                    if (obj.OnClick && playerGameObj) {
                      const tx = new Transaction()
                      tx.setGasBudget(100000000)

                      tx.moveCall({
                        target: `${suiCraftPackageId}::game::complete_task`,
                        arguments: [tx.object(playerGameObj), tx.pure.string(obj.OnClick)],
                      })

                      signAndExecute(
                        { transaction: tx },
                        {
                          onSuccess: async ({ digest }) => {
                            alert("Action executed successfully!")
                            await client.waitForTransaction({ digest, options: { showEffects: true } })
                          },
                          onError: (error) => {
                            alert("Action execution failed!")
                            console.error("Transaction Error:", error)
                          },
                        },
                      )
                    }
                  }}>
                  <Model file={obj.assetLink} object={obj} />
                </RigidBody>
              ) : (
                <Model key={obj.assetIdentifier} file={obj.assetLink} object={obj} />
              ),
            )}

            {/* Your Player component */}
            <Player
              speed={worldSettings.player_speed}
              mass={worldSettings.player_mass}
              jump={worldSettings.player_jump}
              size={worldSettings.player_size}
              flycontrol={worldSettings.flycontrol}
              music={worldSettings.player_music}
            />
          </Physics>

          <PointerLockControls />
        </Canvas>
      </Suspense>
    </KeyboardControls>
  )
}
