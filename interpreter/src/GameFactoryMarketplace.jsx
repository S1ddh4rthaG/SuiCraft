import { Box, AppBar, Toolbar, InputBase, Grid, Card, CardContent, CardMedia, Typography, Button, ThemeProvider, createTheme } from "@mui/material"
import { useEffect, useState } from "react"
import { utils, ethers } from "ethers"
import ContractAddress from "./contracts/contract-address.json"
import GameFactory from "./contracts/GameFactory.json"
import Game from "./contracts/Game.json"

import { ConnectButton } from "@mysten/dapp-kit"
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit"
import { Transaction } from "@mysten/sui/transactions"
import { useNetworkVariable } from "./networkConfig.js"
import { GAME_FACTORY } from "./constants.js"

const networkMap = {
  BOTANIX_TESTNET: {
    chainId: utils.hexValue(3636),
    chainName: "Botanix Testnet",
    nativeCurrency: { name: "BTC", symbol: "BTC", decimals: 18 },
    rpcUrls: ["https://node.botanixlabs.dev"],
    blockExplorerUrls: ["https://blockscout.botanixlabs.dev/"],
  },
}

const GameFactoryMarketplace = () => {
  const darkTheme = createTheme({
    palette: { mode: "dark" },
    components: {
      MuiAppBar: { styleOverrides: { root: { borderBottom: "1px solid #444" } } },
    },
  })

  const client = useSuiClient()
  const [games, setGames] = useState([])
  const [searchInput, setSearchInput] = useState("")

  useEffect(() => {
    loadGames()
  }, [searchInput])

  let gamesList = games.filter((g) => g.toLowerCase().includes(searchInput.toLowerCase()))

  const loadGames = async () => {
    try {
      const res = await client.getObject({
        id: GAME_FACTORY,
        options: { showType: true, showContent: true },
      })

      console.log("GameFactory Object:", res, res.data.content.fields.gameObjects)
      let addresses = res.data.content.fields.gameObjects
      setGames(addresses)
    } catch (err) {
      console.error("[loadGames] Error loading games:", err)
    }
  }

  const playGame = (addr) => {
    window.location.href = `?game=${addr}`
  }

  const GameCard = ({ gameAddress }) => {
    const [game, setGame] = useState({ name: "", price: 0, thumbnail: "" })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
      ;(async () => {
        const res = await client.getObject({
          id: gameAddress,
          options: { showType: true, showContent: true },
        })

        console.log("Game Object:", res)
        const name = res.data.content.fields.name
        const priceRaw = res.data.content.fields.price
        const thumb = res.data.content.fields.thumbnail

        setGame({
          name,
          price: priceRaw,
          thumbnail: thumb,
          address: gameAddress,
        })
        setLoading(false)
      })()
    }, [gameAddress])

    return (
      <Card
        elevation={4}
        sx={{
          width: "100%",
          bgcolor: "#2a2c2e",
          borderRadius: 3,
          overflow: "hidden",
          transition: "transform 0.3s, box-shadow 0.3s",
          "&:hover": {
            transform: "translateY(-5px)",
            boxShadow: "0 8px 16px rgba(0,0,0,0.4)",
          },
        }}>
        <CardMedia component="img" height="140" image={game.thumbnail} alt={game.name} sx={{ objectFit: "cover" }} />
        <CardContent sx={{ px: 2, pt: 2 }}>
          {loading ? (
            <Typography color="gray">Loading...</Typography>
          ) : (
            <>
              <Typography variant="h6" noWrap gutterBottom>
                {game.name}
              </Typography>
              <Typography variant="caption" noWrap color="text.secondary" gutterBottom>
                {`${game.address.slice(0, 4)}...${game.address.slice(-4)}`}
              </Typography>
              <Box
                sx={{
                  mt: 1,
                  px: 1,
                  py: 0.5,
                  bgcolor: "#1f7d1f",
                  borderRadius: 1,
                  display: "block",
                }}>
                <Typography variant="body2" color="white" fontWeight="bold">
                  {game.price} MIST
                </Typography>
              </Box>
            </>
          )}
        </CardContent>
        {!loading && (
          <Box sx={{ px: 2, pb: 2 }}>
            <Button fullWidth variant="contained" color="success" sx={{ borderRadius: 2, py: 1.5 }} onClick={() => playGame(game.address)}>
              Play
            </Button>
          </Box>
        )}
      </Card>
    )
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          bgcolor: "#202124",
        }}>
        <AppBar position="sticky" color="transparent" elevation={0}>
          <Toolbar
            sx={{
              display: "flex",
              justifyContent: "space-between",
              px: { xs: 1, sm: 2, md: 3, lg: 4 },
            }}>
            <Typography variant="h5" color="white">
              SuiCraft Marketplace
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                bgcolor: "#2a2c2e",
                borderRadius: 2,
                px: 2,
                width: { xs: 120, sm: 200, md: 300, lg: 600 },
              }}>
              <InputBase
                fullWidth
                placeholder="🔎 Search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                sx={{ color: "white", py: 0.5 }}
              />
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <ConnectButton />
            </Box>
          </Toolbar>
        </AppBar>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            display: "flex",
            justifyContent: "center",
          }}>
          <Grid container spacing={3} justifyContent="start" sx={{ maxWidth: 1200 }}>
            {gamesList &&
              gamesList.map((addr, i) => (
                <Grid item key={i} xs={12} sm={6} md={4} lg={3}>
                  <GameCard gameAddress={addr} />
                </Grid>
              ))}
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default GameFactoryMarketplace
