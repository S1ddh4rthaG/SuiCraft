import { Canvas, useFrame } from "@react-three/fiber"
import { Loader, PointerLockControls, KeyboardControls, Cylinder, Box, Stars } from "@react-three/drei"
import { Debug, Physics, RigidBody, CapsuleCollider } from "@react-three/rapier"
import { Player } from "./Player"
// import { Model } from "./Show2"
import { Suspense, useEffect } from "react"
import { utils } from "ethers"
import { useState } from "react"
import { ethers } from "ethers"
import PlayerStatus from "./contracts/PlayerStatus.json"
import GameAbi from "./contracts/Game.json"
import { useSharedState } from "./sharedState"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { useLoader } from "@react-three/fiber"
import { BigNumber } from "ethers"
import { useRef } from "react"
import data from "./test.json"
import { Scene } from "three"
import Swal from "sweetalert2"
import MarketPlace from "./MarketPlace"


const networkMap = {
  BOTANIX_TESTNET: {
    chainId: utils.hexValue(3636), // '0xe2c'
    chainName: "Botanix Testnet",
    nativeCurrency: { name: "BTC", symbol: "BTC", decimals: 18 },
    rpcUrls: ["https://node.botanixlabs.dev"],
    blockExplorerUrls: ["https://blockscout.botanixlabs.dev/"],
  },
};

// Controls: WASD + left click

const Model = ({ file, object }) => {
  // console.log("loading model", object.assetIdentifier)
  // console.log(object)

  //once the model is loaded, console that it is loaded
  const gltf = useLoader(GLTFLoader, file, (loader) => {
    // console.log("loaded model", object.assetIdentifier)
  })

  return (
    <primitive
      key={object.assetIdentifier}
      object={gltf.scene.clone()}
      scale={[object.scale.x * object.scaleFactor, object.scale.y * object.scaleFactor, object.scale.z * object.scaleFactor]}
      position={[object.position.x, object.position.y, object.position.z]}
    />
  )
}

export default function App() {
  const queryParams = new URLSearchParams(window.location.search)
  const gameAddress = queryParams.get("game") || "loading..."
  const testmode = queryParams.get("testmode") || false

  const [account, setAccount] = useState(null)
  const { user, setUser, setText } = useSharedState()
  const [playerContract, setPlayerContract] = useState(null)
  const [gameContract, setGameContract] = useState(null)
  let [objects, setObjects] = useState([])
  const [world_settings, setWorldSettings] = useState({})
  const [light, setLight] = useState([])
  const [gameReady, setGameReady] = useState(false)
  const [data, setData] = useState()

  // takes whole JSON data and classifies it into world settings, light, and objects
  const load = (data) => {
    // console.log("loading data", data)
    setWorldSettings({})
    setObjects([])
    setLight([])
    const song = new Audio(world_settings.env_music)
    song.play()
    data.map((object) => {
      if (object.type === "environment") {
        // console.log("setting world settings")
        setWorldSettings(object)
      } else if (object.type === "light") {
        // console.log("setting light")
        light.push(object)
      } else if (object.type === "object" && objects.includes(object) === false) {
        // console.log("setting object", object)
        setObjects((objects) => [...objects, object])
      }
    }
    )
  }

  // gets the user's account and sets the account and user
  const web3Handler = async () => {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
    setAccount(accounts[0])

    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: networkMap.BOTANIX_TESTNET.chainId }],
    })

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setAccount(accounts[0])
    setUser(String(accounts[0])) // displaying user address

    const signer = provider.getSigner()

    window.ethereum.on("chainChanged", (chainId) => {
      window.location.reload()
    })

    window.ethereum.on("accountsChanged", async function (accounts) {
      setAccount(accounts[0])
      setUser(accounts[0])
      await web3Handler()
    })

    return signer
  }

  // to display "You Won" or "Welcome to the game" when the game starts or ends
  const menu = async (isStart, playerContract, data) => {
    const message = !isStart ? "You Won" : "Welcome to the game"
    Swal.fire({
      title: "Menu",
      text: message,
      icon: "success",
      confirmButtonText: "New Game",
    }).then(async (result) => {
      if (result.isConfirmed) {
        if (playerContract) {
          await playerContract.reset().then((tx) => {
            // console.log("Reseting PlayerContract data ", tx)
            load(data)
          })
        } else {
          console.log(playerContract)
          console.log("no contract")
        }
      }
    })
  }

  // to buy the game
  const buy = async (game_contract, price) => {
    await game_contract.name().then((name) => {
      Swal.fire({
        title: name,
        text: "Please buy the game to continue",
        icon: "info",
        confirmButtonText: price + " BTC",
      }).then((result) => {
        if (result.isConfirmed) {
          game_contract.buyGame({ value: price }).then((tx) => {
            console.log("Bought game ", tx)
          })
        }
      })
    })
  }

  // load the GameContract
  const loadContracts = async (signer) => {
    try {
      const Gamecontract = new ethers.Contract(gameAddress, GameAbi.abi, signer)

      const greenfield = await Gamecontract.greenfield()
      // console.log("greenfield json file : ", greenfield)

      // download the json file from the greenfield
      // data is the local variable that stores the json data
      // therefore data is not accessible outside this function unless passed as a parameter
      const response = await fetch(greenfield)
      const cur_data = await response.json()
      // console.log(cur_data)

      // populates the environment, light, and objects array with the data from the json file

      // setting [data] state to the json data , can be used after this cycle
      setData(cur_data)

      // check if player owns the game or not
      await Gamecontract.getPlayerContract().then((address) => {
        if (address === "0x0000000000000000000000000000000000000000") {
          Gamecontract.price().then((price) => {
            // display the buy screen
            buy(Gamecontract, price)
          })
        } else {
          // player owns the game : load the player contract
          const cur_playerContract = new ethers.Contract(address, PlayerStatus.abi, signer)
          console.log("Player Contract : ", cur_playerContract)
          setPlayerContract(cur_playerContract) // changed playerContract state
          menu(true, cur_playerContract, cur_data)
        }
      })
    } catch (error) {
      console.error("Error loading contracts:", error)
    }
  }

  // test screen shown if testmode is true
  const test = async () => {
    const { value: text } = await Swal.fire({
      title: "Test Mode",
      input: "textarea",
      inputLabel: "Import JSON",
      inputPlaceholder: "Paste the JSON here",
    })
    if (text) {
      setData(JSON.parse(text))
      load(JSON.parse(text))
    }
  }

  useEffect(() => {
    web3Handler().then((signer) => {
      if (testmode) test()
      else
        loadContracts(signer).then(() => {
          setGameReady(true)
        })
    })
  }, [])

  useEffect(() => {
    if (data) {
      load(data)
    }
  }, [data])

  if (gameAddress === "loading...") return <MarketPlace />
  else
    return (
      <>
        {gameReady ? (
          <KeyboardControls
            map={[
              { name: "forward", keys: ["ArrowUp", "w", "W"] },
              { name: "backward", keys: ["ArrowDown", "s", "S"] },
              { name: "left", keys: ["ArrowLeft", "a", "A"] },
              { name: "right", keys: ["ArrowRight", "d", "D"] },
              { name: "jump", keys: ["Space"] },
            ]}>
            <Suspense>
              <Canvas camera={{ fov: 45 }} shadows>
                <Stars />
                <ambientLight intensity={world_settings.ambient_light} />
                <color attach="background" args={[world_settings.sky_color]} />
                {world_settings.stars && <Stars depth={100} />}
                {light &&
                  light.map((light) => {
                    return (
                      <pointLight
                        key={light.assetIdentifier}
                        position={[light.position.x, light.position.y, light.position.z]}
                        intensity={light.intensity}
                        color={light.color}
                      />
                    )
                  })}
                <Physics gravity={[0, -world_settings.gravity, 0]}>
                  {/* <Debug /> */}
                  {objects &&
                    objects.map((object) => {
                      if (object.colliders !== "no") {
                        return (
                          <RigidBody
                            onPointerEnter={() => {
                              setText(object.onHover)
                            }}
                            onPointerLeave={() => {
                              setText("")
                            }}
                            onClick={async () => {
                              if (object.OnClick != "")
                                await playerContract.completeTask(object.OnClick).then((tx) => {
                                  console.log("1 task completed ", tx)
                                  if (tx) {
                                    menu(false, playerContract)
                                  }
                                })
                            }}
                            // onCollisionEnter={async () => {
                            //   if (object.OnCollision != "") await playerContract.completeTask((object.onCollision))
                            // }}
                            // onIntersectionEnter={async () => {
                            //   if (object.onSensorEnter != "") await playerContract.completeTask((object.onSensorEnter))
                            // }}
                            // onIntersectionExit={async () => {
                            //   if (object.onSensorExit != "") await playerContract.completeTask((object.onSensorExit))
                            // }}
                            sensor={object.sensor}
                            key={object.assetIdentifier}
                            type={object.fixed ? "fixed" : "dynamic"}
                            colliders={object.colliders}
                            mass={1}>
                            <Model key={object.assetIdentifier} object={object} file={object.assetLink} />
                          </RigidBody>
                        )
                      } else {
                        return <Model key={object.assetIdentifier} object={object} file={object.assetLink} />
                      }
                    })}
                  <Player
                    speed={world_settings.player_speed}
                    mass={world_settings.player_mass}
                    jump={world_settings.player_jump}
                    size={world_settings.player_size}
                    flycontrol={world_settings.flycontrol}
                    music={world_settings.player_music}
                  />
                </Physics>

                <PointerLockControls />
              </Canvas>
            </Suspense>
          </KeyboardControls>
        ) : (
          <Loader />
        )}
      </>
    )
}
