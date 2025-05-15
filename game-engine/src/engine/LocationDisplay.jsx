import React, { useState, useContext, useEffect } from "react";
import * as THREE from "three";

import { GlobalContext, GlobalContextProvider } from "./GlobalContext.jsx";

const LocationDisplay = () => {
  const { state, dispatch } = useContext(GlobalContext);
  const { objectMaster, currentObjectIdentifier } = state;
  const [scaleFactor, setScaleFactor] = useState(1);
  const [scaleFactorPivot, setScaleFactorPivot] = useState(1);

  let currentObject = objectMaster.find(
    (object) => object.assetIdentifier === currentObjectIdentifier
  );

  useEffect(() => {
    if (currentObject) {
      setScaleFactor(currentObject.scaleFactor);
      setScaleFactorPivot(currentObject.scaleFactorPivot);
    }
  }, [currentObject]);

  const handleScaleFactorChange = (event) => {
    const value = parseFloat(event.target.value);
    setScaleFactor(value);
  };

  const handleScaleFactorPivotChange = (event) => {
    const value = parseFloat(event.target.value);
    setScaleFactorPivot(value);
  };

  const applyScale = () => {
    if (currentObject) {
      currentObject.scaleFactor = scaleFactor;
      currentObject.scaleFactorPivot = scaleFactorPivot;
      dispatch({ type: "CHANGE_OBJECT", payload: currentObject });
    }
  };

  return (
    <div className="accordion-item standard-fbutton">
      <h2 className="accordion-header">
        <button
          className="accordion-button standard-background collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#flush-collapseFour"
          aria-expanded="false"
          aria-controls="flush-collapseFour"
        >
          <span className="me-2 align-middle bi bi-compass text-primary"></span>
          Location & Orientation{" "}
          {"(" +
            (currentObjectIdentifier
              ? currentObjectIdentifier
              : "None Selected") +
            ")"}
        </button>
      </h2>
      <div
        id="flush-collapseFour"
        className="accordion-collapse collapse"
        data-bs-parent="#accordionFlushExample"
      >
        <div className="accordion-body">
          <div className="row m-0 p-0">
            <div className="col-12">
              <h6>Scale Object</h6>
            </div>
            <div className="col-8">
              <input
                type="number"
                step="0.1"
                className="form-control"
                id="scaleFactor"
                placeholder={currentObject ? currentObject.scaleFactor : 1}
                value={scaleFactor}
                onChange={handleScaleFactorChange}
              />
            </div>
            <div className="col-4">
              <button className="btn btn-primary" onClick={applyScale}>
                Save
              </button>
            </div>
          </div>
          <div className="row m-0 p-0">
            <div className="col-12">
              <h6>Scale Pivot</h6>
            </div>
            <div className="col-8">
              <input
                type="number"
                step="0.1"
                className="form-control"
                id="scaleFactorPivot"
                placeholder={currentObject ? currentObject.scaleFactorPivot : 1}
                value={scaleFactorPivot}
                onChange={handleScaleFactorPivotChange}
              />
            </div>
            <div className="col-4">
              <button className="btn btn-primary" onClick={applyScale}>
                Save
              </button>
            </div>
          </div>
          <div className="row m-0 p-0  mt-3">
            <div className="col-12">
              <h6>Position</h6>
            </div>
            <div className="col-4">
              <label htmlFor="x" className="form-label">
                X
              </label>
              <input
                type="text"
                className="form-control"
                id="x"
                placeholder="0"
                disabled
                value={currentObject ? currentObject.position.x : 0}
              />
            </div>
            <div className="col-4">
              <label htmlFor="y" className="form-label">
                Y
              </label>
              <input
                type="text"
                className="form-control"
                id="y"
                placeholder="0"
                disabled
                value={currentObject ? currentObject.position.y : 0}
              />
            </div>
            <div className="col-4">
              <label htmlFor="z" className="form-label">
                Z
              </label>
              <input
                type="text"
                className="form-control"
                id="z"
                placeholder="0"
                disabled
                value={currentObject ? currentObject.position.z : 0}
              />
            </div>
          </div>
          <div className="row m-0 p-0 mt-3">
            <div className="col-12">
              <h6>Quaternion</h6>
            </div>
            <div className="col-3">
              <label
                htmlFor="quaternion_x"
                className="form-label
            "
              >
                Q_X
              </label>
              <input
                type="text"
                className="form-control"
                id="quaternion_x"
                placeholder="0"
                disabled
                value={currentObject ? currentObject.quaternion.x : 0}
              />
            </div>
            <div className="col-3">
              <label
                htmlFor="quaternion_y"
                className="form-label
            "
              >
                Q_Y
              </label>
              <input
                type="text"
                className="form-control"
                id="quaternion_y"
                placeholder="0"
                disabled
                value={currentObject ? currentObject.quaternion.y : 0}
              />
            </div>
            <div className="col-3">
              <label
                htmlFor="quaternion_z"
                className="form-label
            "
              >
                Q_Z
              </label>
              <input
                type="text"
                className="form-control"
                id="quaternion_z"
                placeholder="0"
                disabled
                value={currentObject ? currentObject.quaternion.z : 0}
              />
            </div>
            <div className="col-3">
              <label
                htmlFor="quaternion_w"
                className="form-label
            "
              >
                Q_W
              </label>
              <input
                type="text"
                className="form-control"
                id="quaternion_w"
                placeholder="0"
                disabled
                value={currentObject ? currentObject.quaternion.w : 0}
              />
            </div>
          </div>


        </div>
      </div>
    </div>
  );
};

export default LocationDisplay;
