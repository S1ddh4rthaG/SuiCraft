import React, { useState, useContext } from "react";
import * as THREE from "three";

import { GlobalContext, GlobalContextProvider } from "./GlobalContext.jsx";
import { useEffect } from "react";

const LightControls = () => {
  const { state, dispatch } = useContext(GlobalContext);
  const { objectMaster } = state;

  const [currentLightIdentifer, setCurrentLightIdentifer] = useState(null);
  const [currentLight, setCurrentLight] = useState(null);

  const [addLight, setAddLight] = useState({
    type: "light",
    assetIdentifier: "",
    position: new THREE.Vector3(0, 0, 0),
    color: "#ffffff",
    intensity: 1,
  });

  useEffect(() => {
    setCurrentLightIdentifer(null);
    setCurrentLight(null);
  }, [objectMaster]);

  const handleCurrentLightChange = (value) => {
    setCurrentLightIdentifer(value);

    const light = objectMaster.find(
      (object) => object.assetIdentifier === value
    );
    setCurrentLight(light);
  };

  const handleLightChange = (name, value) => {
    // Update the currentLight state. Note position is Three.js Vector3
    switch (name) {
      case "assetIdentifier":
        setCurrentLight({
          ...currentLight,
          assetIdentifier: value,
        });
        break;

      case "positionX":
        setCurrentLight({
          ...currentLight,
          position: new THREE.Vector3(
            Number(value),
            currentLight.position.y,
            currentLight.position.z
          ),
        });
        break;

      case "positionY":
        setCurrentLight({
          ...currentLight,
          position: new THREE.Vector3(
            currentLight.position.x,
            Number(value),
            currentLight.position.z
          ),
        });
        break;

      case "positionZ":
        setCurrentLight({
          ...currentLight,
          position: new THREE.Vector3(
            currentLight.position.x,
            currentLight.position.y,
            Number(value)
          ),
        });
        break;

      case "color":
        setCurrentLight({
          ...currentLight,
          color: value,
        });
        break;

      case "intensity":
        setCurrentLight({
          ...currentLight,
          intensity: value,
        });
        break;

      default:
        break;
    }
  };

  const handleDeleteLight = (value) => {
    const deleteAction = {
      type: "DELETE_LIGHT",
      payload: {
        assetIdentifier: currentLightIdentifer,
      },
    };

    dispatch(deleteAction);

    setCurrentLightIdentifer(null);
    setCurrentLight(null);
  };

  const handleSaveLight = (value) => {
    const saveAction = {
      type: "CHANGE_LIGHT",
      payload: {
        assetIdentifier: currentLightIdentifer,
        position: currentLight.position,
        color: currentLight.color,
        intensity: currentLight.intensity,
      },
    };

    dispatch(saveAction);
  };

  return (
    <div className="accordion-item standard-fbutton">
      <h2 className="accordion-header">
        <button
          className="accordion-button standard-background collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#flush-collapseFive"
          aria-expanded="false"
          aria-controls="flush-collapseFive"
        >
          <span className="me-2 align-middle bi bi-lightbulb-fill text-warning"></span>
          Light{" "}
          {"(" +
            (currentLightIdentifer ? currentLightIdentifer : "None Selected") +
            ")"}
        </button>
      </h2>
      <div
        id="flush-collapseFive"
        className="accordion-collapse collapse"
        data-bs-parent="#accordionFlushExample"
      >
        <div className="accordion-body">
          <div className="row m-0 p-0 mb-2">
            <div className="col-12 mb-2 text-end border border-success p-2 px-3 rounded shadow-sm">
              <h6 className="mt-1 w-100 text-start">Create Light</h6>
              <input
                type="text"
                className="form-control"
                id="lightAssetIdentifier"
                placeholder="Asset Identifier"
                value={addLight.assetIdentifier}
                onChange={(e) =>
                  setAddLight({ ...addLight, assetIdentifier: e.target.value })
                }
              />
              <button
                type="button"
                className="btn btn-primary mt-2"
                onClick={() =>
                  dispatch({ type: "ADD_LIGHT", payload: addLight })
                }
              >
                Add Light
              </button>
              <div className="form-text text-start">
                Note: Change Values through dropdown{" "}
              </div>
            </div>
          </div>

          <div className="col-12 mb-2">
            <label htmlFor="lightType" className="form-label">
              Light Objects
            </label>
            <select
              className="form-select"
              id="lightType"
              value={currentLightIdentifer}
              onChange={(e) => handleCurrentLightChange(e.target.value)}
            >
              <option value={""}>None Selected</option>
              {objectMaster.map((object) => {
                if (object.type === "light") {
                  return (
                    <option value={object.assetIdentifier}>
                      {object.assetIdentifier}
                    </option>
                  );
                }
              })}
            </select>
          </div>

          <div className="col-12">
            {/* Input AssetIdentifier */}
            <label htmlFor="lightAssetIdentifier" className="form-label">
              Asset Identifier
            </label>
            <input
              type="text"
              className="form-control"
              id="lightAssetIdentifier"
              name="assetIdentifier"
              value={currentLight ? currentLight.assetIdentifier : ""}
              disabled={currentLightIdentifer ? true : false}
              onChange={(e) =>
                handleLightChange("assetIdentifier", e.target.value)
              }
            />
          </div>

          <div className="col-12 mb-2">
            <h6 className="mt-3">Position</h6>
            <div className="row m-0 p-0">
              <div className="col-4">
                <label
                  htmlFor="lightPositionX"
                  className="form-label
                  "
                >
                  X
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="lightPositionX"
                  name="positionX"
                  value={currentLight ? currentLight.position.x : ""}
                  onChange={(e) =>
                    handleLightChange("positionX", e.target.value)
                  }
                />
              </div>
              <div className="col-4">
                <label
                  htmlFor="lightPositionY"
                  className="form-label
                  "
                >
                  Y
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="lightPositionY"
                  name="positionY"
                  value={currentLight ? currentLight.position.y : ""}
                  onChange={(e) =>
                    handleLightChange("positionY", e.target.value)
                  }
                />
              </div>
              <div className="col-4">
                <label
                  htmlFor="lightPositionZ"
                  className="form-label
                  "
                >
                  Z
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="lightPositionZ"
                  name="positionZ"
                  value={currentLight ? currentLight.position.z : ""}
                  onChange={(e) =>
                    handleLightChange("positionZ", e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          <div className="col-12">
            <label htmlFor="lightColor" className="form-label">
              Color
            </label>
            <input
              type="color"
              className="form-control"
              id="lightColor"
              name="color"
              value={currentLight ? currentLight.color : ""}
              onChange={(e) => handleLightChange("color", e.target.value)}
            />
          </div>

          <div className="col-12">
            <label htmlFor="lightIntensity" className="form-label">
              Intensity
            </label>
            <input
              type="number"
              className="form-control"
              id="lightIntensity"
              name="intensity"
              value={currentLight ? currentLight.intensity : ""}
              onChange={(e) => handleLightChange("intensity", e.target.value)}
            />
          </div>

          <div className="row m-0 p-0 mt-2 text-center">
            <div className="col-6">
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => handleDeleteLight(currentLightIdentifer)}
              >
                Delete Light
              </button>
            </div>

            <div className="col-6">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleSaveLight(currentLightIdentifer)}
              >
                Save Light
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LightControls;
