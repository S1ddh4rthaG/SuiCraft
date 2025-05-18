import React from "react"
import ReactDOM from "react-dom/client"

import { ConnectButton, SuiClientProvider, WalletProvider } from "@mysten/dapp-kit"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import "@mysten/dapp-kit/dist/index.css"
import App from "./App.js"
import { SharedStateProvider, useSharedState } from "./sharedState.js"
import "./styles.css"
// import { Route } from "react-router-dom"
import { networkConfig } from "./networkConfig.js"

function Overlay() {
  const { text } = useSharedState()

  return (
    <>
      <div className="dot" />
      <p className="hovertext">{text}</p>
      <App />
    </>
  )
}

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider autoConnect>
          <SharedStateProvider>
            <Overlay />
          </SharedStateProvider>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
