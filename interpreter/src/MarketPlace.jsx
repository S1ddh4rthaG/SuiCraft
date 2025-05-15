import { Input, Grid, Card, CardContent, CardMedia, Typography, Button, ThemeProvider, createTheme } from "@mui/material"
import { useEffect, useState } from "react"
import { utils } from "ethers"
import { ethers } from "ethers"
import ContractAddress from "./contracts/contract-address.json"
import GameFactory from "./contracts/GameFactory.json"
import Game from "./contracts/Game.json"
import { Center } from "@react-three/drei"

const networkMap = {
  BOTANIX_TESTNET: {
    chainId: utils.hexValue(3636), // '0xe2c'
    chainName: "Botanix Testnet",
    nativeCurrency: { name: "BTC", symbol: "BTC", decimals: 18 },
    rpcUrls: ["https://node.botanixlabs.dev"],
    blockExplorerUrls: ["https://blockscout.botanixlabs.dev/"],
  },
};

const MarketPlace = () => {
  const [account, setAccount] = useState("")
  const [gameAddress, setGameAddress] = useState([])
  const [searchInput, setSearchInput] = useState("") // State for the search input

  const darkTheme = createTheme({
    palette: {
      mode: "dark",
    },
  })

  useEffect(() => {
    web3Handler()
  }, [])

  const web3Handler = async () => {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
    setAccount(accounts[0])
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: networkMap.BOTANIX_TESTNET.chainId }],
    })
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setAccount(accounts[0])

    const signer = provider.getSigner()

    window.ethereum.on("chainChanged", (chainId) => {
      window.location.reload()
    })

    window.ethereum.on("accountsChanged", async function (accounts) {
      setAccount(accounts[0])
      await web3Handler()
    })
    loadContracts(signer, accounts[0])
  }

  const loadContracts = async (signer, account) => {
    try {
      const gameFactory = new ethers.Contract(ContractAddress.GameFactory, GameFactory.abi, signer)
      const gameAddresses = await gameFactory.getGameAddresses()
      setGameAddress(gameAddresses)
    } catch (error) {
      console.error("Error loading contracts:", error)
    }
  }

  const DisplayGames = () => {
    const filteredGames = gameAddress.filter((game) => game.toLowerCase().includes(searchInput.toLowerCase()))

    return (
      <Grid container spacing={1} sx={{
        justifyContent: "start", padding: 2
        , height: "100vh", overflowY: "auto", backgroundColor: "#202124"
      }}>
        {filteredGames.map((game, index) => (
          <Grid item key={index}>
            <GameCard gameAddress={game} />
          </Grid>
        ))}
      </Grid>
    )
  }

  const playGame = async (gameAddress) => {
    window.location.href = `?game=${gameAddress}`
  }

  const GameCard = ({ gameAddress }) => {
    const [game, setGame] = useState({ name: "", price: 0 })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
      const loadGame = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const gameContract = new ethers.Contract(gameAddress, Game.abi, signer)

        const name = await gameContract.name()
        const price = await gameContract.price()
        const thumbnail = await gameContract.thumbnail()

        setGame({
          name,
          price: ethers.utils.formatEther(price),
          address: gameAddress,
          thumbnail: thumbnail,
        })
        setLoading(false)
      }
      loadGame()
    }, [gameAddress])

    return (
      <Card
        sx={{
          width: 275,
          margin: 1,
          background: "#303134",
          color: "white",
          borderRadius: 2,
          border: "1px solid #303134",
          shadow: 0,
          "&:hover": { background: "black", color: "white", scale: "1.05" },
        }}>
        <CardMedia component="img" height="140" image={game.thumbnail} alt="Random Image" />
        <CardContent>
          {loading ? (
            <Typography variant="body1">Loading...</Typography>
          ) : (
            <div>
              <Typography variant="h6">
                <b>{game.name}</b>
              </Typography>
              <Typography variant="body2" sx={{ fontSize: "14px", color: "gray" }}>
                {game.address.slice(0, 6) + "..." + game.address.slice(-7, -1)}
              </Typography>
              <Typography variant="body1" sx={{ color: "lightgreen", fontSize: "14px", marginTop: "5px" }}>
                {game.price * 10 ** 18} BTC
              </Typography>
              <Button
                sx={{ bgcolor: "primary", borderRadius: 3, width: "100%", marginTop: "12px", "&:hover": { bgcolor: "green", color: "white", scale: "1" } }}
                variant="contained"
                style={{ backgroundColor: "green" }}
                color="primary"
                onClick={() => playGame(game.address)}>
                <b>Play</b>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card sx={{ borderRadius: 0, background: "#202124", color: "white", height: "100vh" }}>
      <Card sx={{ borderRadius: 0, background: "#303134", color: "white", height: 60, padding: 2, fontSize: 20 }}>
        <b style={{ position: "absolute", left: "20px", top: "15px" }}>
          SpiderCraft <b style={{ color: "lightgreen" }}>Store</b>{" "}
        </b>
        <Input
          style={{ position: "absolute", top: "10px", left: "160px" }}
          disableUnderline={true}
          sx={{
            marginLeft: "250px",
            color: "white",
            disableUnderline: true,
            height: 30,
            width: "600px",
            padding: 2,
            background: "#202124",
            borderRadius: "20px",
            marginTop: "0px",
          }}
          type="text"
          placeholder="🔎 Search Address"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </Card>
      <DisplayGames />
    </Card>
  )
}

export default MarketPlace
