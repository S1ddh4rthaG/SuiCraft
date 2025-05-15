import React, { useEffect } from "react";
import { useContext, useState } from "react";
import { GlobalContext } from "./GlobalContext.jsx";

const ObjectControls = ({ stateEnv, setStateEnv }) => {
  const { state, dispatch } = useContext(GlobalContext);

  const { objectMaster, currentObjectIdentifier } = state;
  const [currentObjectState, setCurrentObjectState] = useState(
    objectMaster.find(
      (object) => object.assetIdentifier === currentObjectIdentifier
    )
  );

  let tasks = objectMaster.filter((object) => object.type === "task");
  useEffect(() => {
    if (currentObjectIdentifier) {
      let current = objectMaster.find(
        (object) => object.assetIdentifier === currentObjectIdentifier
      );
      setCurrentObjectState(current);
    } else {
      setCurrentObjectState(null);
    }
  }, [currentObjectIdentifier, objectMaster]);

  const handleObjectChange = (e) => {
    const { name, value } = e.target;
    setCurrentObjectState({
      ...currentObjectState,
      [name]: value,
    });
  };

  const handleDeleteObject = (value) => {
    dispatch({
      type: "DELETE_OBJECT",
      payload: {
        assetIdentifier: value,
      },
    });
  };

  const handleUpdateObject = (value) => {
    // console.log("Updating object with identifier: ", currentObjectState);
    dispatch({
      type: "CHANGE_OBJECT",
      payload: currentObjectState,
    });
  };

  return (
    <div className="accordion-item standard-fbutton">
      <h2 className="accordion-header">
        <button
          className="accordion-button standard-background collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#flush-collapseThree"
          aria-expanded="false"
          aria-controls="flush-collapseThree"
        >
          <span className="me-2 align-middle bi bi-box text-primary"></span>
          Object{" "}
          {"(" +
            (currentObjectIdentifier
              ? currentObjectIdentifier
              : "None Selected") +
            ")"}
        </button>
      </h2>
      <div
        id="flush-collapseThree"
        className="accordion-collapse collapse"
        data-bs-parent="#accordionFlushExample"
      >
        <div className="accordion-body">
          {currentObjectState ? (
            <>
              {/* Create htmlFor assetLink, fixed, mass, colliders, [col-12] OnClick, OnHover, OnCollision */}
              <div className="row m-0 p-0">
                <div className="col-12">
                  <label htmlFor="assetLink" className="form-label">
                    Asset Link
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="assetLink"
                    placeholder={currentObjectState.assetLink}
                    value={currentObjectState.assetLink}
                    onChange={handleObjectChange}
                    name="assetLink"
                  />
                </div>
                {/* [TODO: Global Context is not changing for switches] */}
                <div className="col-12 pt-3 text-start m-auto">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="fixed"
                      defaultChecked={currentObjectState.fixed}
                      onChange={(e) =>
                        handleObjectChange({
                          target: { name: "fixed", value: e.target.checked },
                        })
                      }
                    />
                    <label className="form-check-label" htmlFor="fixObject">
                      Fix The Object
                    </label>
                  </div>
                </div>
                <div className="col-12 pt-2 mb-1 text-start m-auto">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="followPlayer"
                      defaultChecked={currentObjectState.followPlayer}
                      onChange={(e) =>
                        handleObjectChange({
                          target: {
                            name: "followPlayer",
                            value: e.target.checked,
                          },
                        })
                      }
                    />
                    <label className="form-check-label" htmlFor="followPlayer">
                      Follow the player?
                    </label>
                  </div>
                </div>
                <div className="col-6 pt-1">
                  <label htmlFor="initialVelocity" className="form-label">
                    Initial Velocity
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="initialVelocity"
                    placeholder={currentObjectState.initialVelocity}
                    value={currentObjectState.initialVelocity}
                    onChange={handleObjectChange}
                    name="initialVelocity"
                  />
                </div>
                <div className="col-6">
                  <label htmlFor="mass" className="form-label">
                    Mass
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="mass"
                    placeholder={currentObjectState.mass}
                    value={currentObjectState.mass}
                    onChange={handleObjectChange}
                    name="mass"
                  />
                </div>
                <div className="col-12 pt-2 mb-2">
                  <label htmlFor="colliders" className="form-label">
                    Colliders
                  </label>
                  <select
                    className="form-select"
                    id="colliders"
                    value={currentObjectState.colliders}
                    onChange={handleObjectChange}
                    name="colliders"
                  >
                    <option value="no">No</option>
                    <option value="cuboid">Cuboid</option>
                    <option value="hull">Hull</option>
                    <option value="ball">Ball</option>
                    <option value="trimesh">Trimesh</option>
                  </select>
                </div>
                <div className="col-12">
                  <label htmlFor="OnClick" className="form-label">
                    OnClick
                  </label>
                  <select
                    className="form-select"
                    id="OnClick"
                    value={currentObjectState.OnClick}
                    onChange={handleObjectChange}
                    name="OnClick"
                  >
                    <option value="">Select a task</option>
                    <option value="death">Death</option>
                    {tasks.map((task) => (
                      <option
                        key={task.assetIdentifier}
                        value={task.assetIdentifier}
                      >
                        {task.assetIdentifier}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-12">
                  <label htmlFor="OnHover" className="form-label">
                    OnHover
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="OnHover"
                    placeholder=""
                    value={currentObjectState.OnHover}
                    onChange={handleObjectChange}
                    name="OnHover"
                  />
                </div>
                <div className="col-12">
                  <label htmlFor="OnCollision" className="form-label">
                    OnCollision
                  </label>
                  <select
                    className="form-select"
                    id="OnCollision"
                    value={currentObjectState.OnCollision}
                    onChange={handleObjectChange}
                    name="OnCollision"
                  >
                    <option value="">Select a task</option>
                    <option value="death">Death</option>
                    {tasks.map((task) => (
                      <option
                        key={task.assetIdentifier}
                        value={task.assetIdentifier}
                      >
                        {task.assetIdentifier}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="row m-0 p-0 mt-2 text-center">
                  <div className="col-6">
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() =>
                        handleDeleteObject(currentObjectIdentifier)
                      }
                    >
                      Delete
                    </button>
                  </div>

                  <div className="col-6">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() =>
                        handleUpdateObject(currentObjectIdentifier)
                      }
                    >
                      Update
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center">
              <p>No object selected!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ObjectControls;
