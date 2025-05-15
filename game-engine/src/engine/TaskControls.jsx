import React, { useState, useContext } from 'react';
import * as THREE from 'three';

import { GlobalContext, GlobalContextProvider } from './GlobalContext.jsx'


const TaskControls = ({ stateEnv, setStateEnv }) => {
  const { state, dispatch } = useContext(GlobalContext);
  const { objectMaster } = state;

  const [addTask, setAddTask] = useState({
    type: "task",
    assetIdentifier: "",
  });
  const [currentTask, setCurrentTask] = useState(
    {
      type: "task",
      assetIdentifier: "",
    }
  );
  const [currentTaskIdentifer, setCurrentTaskIdentifer] = useState(null);

  const handleCurrentTaskChange = (value) => {
    setCurrentTaskIdentifer(value);

    setCurrentTask({
      ...currentTask,
      assetIdentifier: value,
    })
  }

  const handleDeleteTask = () => {
    dispatch({
      type: "DELETE_TASK", payload: {
        assetIdentifier: currentTaskIdentifer,
      }
    });
  }

  const handleSaveTask = () => {
    dispatch({
      type: "CHANGE_TASK", payload: {
        oldIdentifier: currentTaskIdentifer,
        assetIdentifier: currentTask.assetIdentifier,
      }
    });
  }

  return (
    <div className="aaccordion-item standard-fbutton">
      <h2 className="accordion-header">
        <button className="accordion-button standard-background collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseSix" aria-expanded="false" aria-controls="flush-collapseSix">
        <span className="me-2 align-middle bi bi-check2-all text-success"></span>
          Tasks
        </button>
      </h2>
      <div id="flush-collapseSix" className="accordion-collapse collapse" data-bs-parent="#accordionFlushExample">
        <div className="accordion-body">
          <div className='row m-0 p-0 mb-2'>
            <div className='col-12 mb-2 text-end border border-success p-2 px-3 rounded shadow-sm'>
              <h6 className="mt-1 w-100 text-start">Create Task</h6>
              <input type="text" className="form-control" id="taskAssetIdentifier" placeholder="Task Identifier" value={addTask.assetIdentifier} onChange={(e) => setAddTask({ ...addTask, assetIdentifier: e.target.value })} />
              <button type="button" className="btn btn-primary mt-2" onClick={() => dispatch({ type: "ADD_TASK", payload: addTask })}>Add Task</button>

              <div className="form-text text-start">Note: Change Values through dropdown </div>
            </div>
          </div>
          <div className='col-12 mb-2'>
            <label htmlFor="taskType" className="form-label">Task Objects</label>
            <select
              className="form-select mb-3"
              id="taskType"
              value={currentTaskIdentifer}
              onChange={(e) => handleCurrentTaskChange(e.target.value)}
            >
              <option value={""}>None Selected</option>
              {
                objectMaster.map((object) => {
                  if (object.type === "task") {
                    return <option value={object.assetIdentifier}>{object.assetIdentifier}</option>
                  }
                })
              }
            </select>

            <div className='col-12 mb-2'>
              <div className='row m-0 p-0'>
                <div className='col-12 mb-2 text-end border border-success p-2 px-3 rounded shadow-sm'>
                  <h6 className="mt-1 w-100 text-start">Task Controls</h6>
                  <input type="text" className="form-control" id="taskAssetIdentifier" placeholder="Task Identifier" value={currentTask.assetIdentifier} onChange={(e) => setCurrentTask({ ...currentTask, assetIdentifier: e.target.value })} />
                  <button type="button" className="btn btn-danger mt-2 mx-2" onClick={() => handleDeleteTask()}>Delete Task</button>
                  <button type="button" className="btn btn-warning mt-2 mx-2" onClick={() => handleSaveTask()}>Save Task</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskControls;
