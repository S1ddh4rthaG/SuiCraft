import React, { useEffect, useState, useContext } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { Center } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { PivotControls } from "./pivotControls/index.tsx";
import { GlobalContext } from "./GlobalContext.jsx";

const Model = ({
  assetLink,
  assetIdentifer,
  collision,
  fixed,
  worldMatrix,
  scaleFactor,
  scaleFactorPivot,
}) => {
  const { state, dispatch } = useContext(GlobalContext);
  const { currentObjectIdentifier } = state;

  const gltf = useLoader(GLTFLoader, assetLink);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    document.body.style.cursor = hovered ? "grab" : "auto";
  }, [hovered]);

  return (
    <PivotControls
      assetIdentifier={assetIdentifer}
      collision={collision}
      fixedM={fixed}
      worldMatrix={worldMatrix}
      scale={scaleFactorPivot}
    >
      <Center top position={[2, 0, 2]}
        scale={scaleFactor}
      >
        <primitive
          object={gltf.scene.clone()}
          onClick={(e) => {
            e.stopPropagation()
            dispatch({
              type: "SET_CURRENT_OBJECT",
              payload: {
                assetIdentifier: assetIdentifer,
              },
            });

            dispatch({
              type: "SET_CURRENT_OBJECT_IDENTIFIER",
              payload: assetIdentifer,
            });

            // console.log(currentObjectIdentifier, "currentObjectIdentifier")
          }}
          onPointerEnter={() => setHovered(true)}
          onPointerOut={() => setHovered(false)} >
        </primitive>
      </Center>
    </PivotControls>)
};

export default Model;
