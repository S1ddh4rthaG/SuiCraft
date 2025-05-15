import { useState } from "react"
import { createRoot } from "react-dom/client"
import { useSharedState } from "./sharedState"
import "./styles.css"
import App from "./App"
import { SharedStateProvider } from "./sharedState"
// import { Route } from "react-router-dom"

function Overlay() {
  const { text, desc, price, user } = useSharedState();

  return (
    <>
      <div className="dot" />
      <p className="hovertext">{text}</p>
      <p className="useraddress" 
      style={{ color: "white", marginTop: "-5px", marginLeft: "2px", fontSize: "14px", fontWeight: "bold", cursor: "pointer"}}
      > {(user)? ("✅" + user?.slice(0, 6) + "..." + user?.slice(-7, -1)): ("🔴" + "Connect Wallet")}
      </p>
      <App />
    </>
  );
}


createRoot(document.getElementById("root")).render(

  <SharedStateProvider>
    <Overlay />
  </SharedStateProvider>

)
