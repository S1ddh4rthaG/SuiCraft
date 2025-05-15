import React from "react";
import { useContext, useState } from "react";
import { GlobalContext } from "./GlobalContext.jsx";

const PlayerControls = () => {
  const { state, dispatch } = useContext(GlobalContext);
  const { objectMaster } = state;

  // Initialize state for environment using object in global context
  const [currentEnv, setCurrentEnv] = useState(
    objectMaster.find((object) => object.type === "environment")
  );

  const handlePlayerChange = (e) => {
    const { name, value } = e.target;
    setCurrentEnv({
      ...currentEnv,
      [name]: value,
    });
  };

  const handleSave = () => {
    // console.log(currentEnv);
    dispatch({
      type: "CHANGE_ENVIRONMENT",
      payload: {
        player_speed: currentEnv.player_speed,
        player_mass: currentEnv.player_mass,
        player_size: currentEnv.player_size,
        player_jump: currentEnv.player_jump,
        player_flycontrol: currentEnv.player_flycontrol,
        player_music: currentEnv.player_music,
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
          data-bs-target="#flush-collapseTwo"
          aria-expanded="false"
          aria-controls="flush-collapseTwo"
        >
          <span className="me-2 align-middle bi bi-person-fill text-primary"></span>
          Player Controls
        </button>
      </h2>
      <div
        id="flush-collapseTwo"
        className="accordion-collapse collapse"
        data-bs-parent="#accordionFlushExample"
      >
        <div className="accordion-body">
          {/* Create htmlFor player speed, mass, size, jump */}
          <div className="row m-0 p-0">
            <div className="col-6 mb-2">
              <label htmlFor="player_speed" className="form-label">
                Speed
              </label>
              <input
                type="number"
                className="form-control"
                id="player_speed"
                placeholder={currentEnv.player_speed}
                value={currentEnv.player_speed}
                onChange={handlePlayerChange}
                name="player_speed"
              />
            </div>
            <div className="col-6 mb-2">
              <label htmlFor="player_mass" className="form-label">
                Mass
              </label>
              <input
                type="number"
                className="form-control"
                id="player_mass"
                placeholder={currentEnv.player_mass}
                value={currentEnv.player_mass}
                onChange={handlePlayerChange}
                name="player_mass"
              />
            </div>
            <div className="col-6 mb-2">
              <label htmlFor="player_size" className="form-label">
                Size
              </label>
              <input
                type="number"
                className="form-control"
                id="player_size"
                placeholder={currentEnv.player_size}
                value={currentEnv.player_size}
                onChange={handlePlayerChange}
                name="player_size"
              />
            </div>
            <div className="col-6 mb-2">
              <label htmlFor="player_jump" className="form-label">
                Jump
              </label>
              <input
                type="number"
                className="form-control"
                id="player_jump"
                placeholder={currentEnv.player_jump}
                value={currentEnv.player_jump}
                onChange={handlePlayerChange}
                name="player_jump"
              />
            </div>
            <div className="col-6">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="player_flycontrol"
                  defaultChecked={currentEnv.player_flycontrol}
                  onChange={(e) =>
                    handlePlayerChange({
                      target: {
                        name: "player_flycontrol",
                        value: e.target.checked,
                      },
                    })
                  }
                />
                <label className="form-check-label" htmlFor="player_flycontrol">
                  Fly Control
                </label>
              </div>
            </div>
            <div className="col-12">
              <label htmlFor="player_music" className="form-label">
                Player Music
              </label>
              <input
                type="text"
                className="form-control"
                id="player_music"
                placeholder={currentEnv.player_music}
                value={currentEnv.player_music}
                onChange={(e) =>
                  handlePlayerChange({
                    target: { name: "player_music", value: e.target.value },
                  })
                }
                name="player_music"
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

export default PlayerControls;
