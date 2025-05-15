import React, { useContext, useState } from "react";
import * as THREE from "three";
import { GlobalContext, GlobalContextProvider } from "./GlobalContext.jsx";

const EnvironmentControls = () => {
  const { state, dispatch } = useContext(GlobalContext);
  const { objectMaster } = state;

  // Initialize state for environment using object in global context
  const [currentEnv, setCurrentEnv] = useState(
    objectMaster.find((object) => object.type === "environment")
  );

  const handleEnvChange = (e) => {
    const { name, value } = e.target;
    setCurrentEnv({
      ...currentEnv,
      [name]: value,
    });
  };

  const handleSave = () => {
    dispatch({
      type: "CHANGE_ENVIRONMENT",
      payload: {
        assetIdentifier: currentEnv.assetIdentifier,
        gravity: currentEnv.gravity,
        sky_color: currentEnv.sky_color,
        ambient_light: currentEnv.ambient_light,
        stars: currentEnv.stars,
        env_music: currentEnv.env_music,
      },
    });
  };

  return (
    <div className="accordion-item standard-fbutton">
      <h2 className="accordion-header">
        <button
          className="accordion-button standard-background collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#flush-collapseOne"
          aria-expanded="false"
          aria-controls="flush-collapseOne"
        >
          <span className="bi bi-clouds-fill me-2 align-middle text-success"></span>{" "}
          Environment
        </button>
      </h2>
      <div
        id="flush-collapseOne"
        className="accordion-collapse collapse"
        data-bs-parent="#accordionFlushExample"
      >
        <div className="accordion-body">
          <div className="row m-0 p-0">
            <div className="col-6 mb-2">
              <label htmlFor="gravity" className="form-label">
                Gravity
              </label>
              <input
                type="number"
                className="form-control"
                id="gravity"
                placeholder={currentEnv.gravity}
                value={currentEnv.gravity}
                onChange={handleEnvChange}
                name="gravity"
              />
            </div>
            <div className="col-6 mb-2">
              <label htmlFor="sky_color" className="form-label">
                Sky Color
              </label>
              <input
                type="color"
                className="form-control"
                id="sky_color"
                placeholder={currentEnv.sky_color}
                value={currentEnv.sky_color}
                onChange={handleEnvChange}
                name="sky_color"
              />
            </div>
            <div className="col-6">
              <label htmlFor="ambient_light" className="form-label">
                Ambient Light
              </label>
              <input
                type="number"
                className="form-control"
                id="ambient_light"
                placeholder={currentEnv.ambient_light}
                value={currentEnv.ambient_light}
                onChange={handleEnvChange}
                name="ambient_light"
              />
            </div>
            <div className="col-12 mt-2">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="stars"
                  defaultChecked={currentEnv.stars}
                  onChange={(e) =>
                    handleEnvChange({
                      target: { name: "stars", value: e.target.checked },
                    })
                  }
                />
                <label className="form-check-label" htmlFor="stars">
                  Stars
                </label>
              </div>
            </div>
            <div className="col-12 mt-2">
              <label htmlFor="env_music" className="form-label">
                Environment Music
              </label>
              <input
                type="text"
                className="form-control"
                id="env_music"
                placeholder={currentEnv.env_music}
                value={currentEnv.env_music}
                onChange={(e) =>
                  handleEnvChange({
                    target: { name: "env_music", value: e.target.value },
                  })
                }
                name="env_music"
              />
            </div>
            <div className="col-12 text-end">
              <button
                type="button"
                className="btn btn-primary mt-2"
                onClick={handleSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentControls;
