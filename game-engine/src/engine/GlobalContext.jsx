import React, { createContext, useReducer } from "react";
import * as THREE from "three";

const GlobalContext = createContext();

const initialEnvironment = {
  type: "environment",
  assetIdentifier: "world_settings",
  gravity: 1,
  sky_color: "black",
  ambient_light: 0.5,

  player_speed: 10,
  player_mass: 50,
  player_size: 1,
  player_jump: 0.5,
  player_flycontrol: false,

  stars: true,
  env_music: "",
  player_music: "",
};

const initialState = {
  objectMaster: [initialEnvironment],
  currentObjectIdentifier: "",
  assetMaster: [],
};

// asset is redundant :(, only worldMatrix, assetID, assetLink are enough
const reducer = (state, action) => {
  switch (action.type) {
    // CASE: OBJECT
    case "ADD_OBJECT":
      if (
        state.objectMaster.some(
          (object) => object.assetIdentifier === action.payload.assetIdentifier
        )
      ) {
        console.log("Object with the same identifier already exists!");
        return state;
      }

      return {
        ...state,
        objectMaster: [
          ...state.objectMaster,
          {
            // Asset Information
            type: "object",
            assetIdentifier: action.payload.assetIdentifier,
            assetLink: action.payload.assetLink,

            // Location and Orientation
            position: action.payload.position,
            quaternion: action.payload.quaternion,
            scale: action.payload.scale,
            worldMatrix: action.payload.worldMatrix,
            initialVelocity: action.payload.initialVelocity,
            followPlayer: action.payload.followPlayer,
            scaleFactor: action.payload.scaleFactor,
            scaleFactorPivot: action.payload.scaleFactorPivot,

            // State
            fixed: action.payload.fixed,
            mass: action.payload.mass,
            colliders: action.payload.colliders,
            sensor: action.payload.sensor,

            // Methods
            OnClick: action.payload.OnClick,
            OnHover: action.payload.OnHover,
            OnCollision: action.payload.OnCollision,

            OnSensorEnter: action.payload.OnSensorEnter,
            OnSensorExit: action.payload.OnSensorExit,
          },
        ],
      };

    case "DELETE_OBJECT":
      // If the object does not exist, do nothing
      if (
        !state.objectMaster.some(
          (object) => object.assetIdentifier === action.payload.assetIdentifier
        )
      ) {
        console.log("Object with the given identifier does not exist!");
        return state;
      }
      // set currentObjectIdentifier to "" if the object being deleted is the currentObject
      if (state.currentObjectIdentifier === action.payload.assetIdentifier) {
        return {
          ...state,
          objectMaster: state.objectMaster.filter(
            (object) =>
              object.assetIdentifier !== action.payload.assetIdentifier
          ),
          currentObjectIdentifier: "",
        };
      }
      return {
        ...state,
        objectMaster: state.objectMaster.filter(
          (object) => object.assetIdentifier !== action.payload.assetIdentifier
        ),
      };

    case "CHANGE_OBJECT":
      if (
        !state.objectMaster.some(
          (object) => object.assetIdentifier === action.payload.assetIdentifier
        )
      ) {
        console.log("Object with the given identifier does not exist!");
        return state;
      }

      return {
        ...state,
        objectMaster: state.objectMaster.map((object) => {
          if (
            object.assetIdentifier === action.payload.assetIdentifier &&
            object.type === "object"
          ) {
            return {
              ...object,
              // Asset Information
              assetIdentifier:
                action.payload.assetIdentifier || object.assetIdentifier,
              assetLink: action.payload.assetLink || object.assetLink,

              // Location and Orientation
              position: action.payload.position || object.position,
              quaternion: action.payload.quaternion || object.quaternion,
              scale: action.payload.scale || object.scale,
              worldMatrix: action.payload.worldMatrix || object.worldMatrix,
              initialVelocity:
                action.payload.initialVelocity || object.initialVelocity,
              followPlayer:
                action.payload.followPlayer != undefined
                  ? action.payload.followPlayer
                  : object.followPlayer,
              scaleFactor: action.payload.scaleFactor || object.scaleFactor,
              scaleFactorPivot:
                action.payload.scaleFactorPivot || object.scaleFactorPivot,

              // State
              fixed:
                action.payload.fixed != undefined
                  ? action.payload.fixed
                  : object.fixed,
              mass: action.payload.mass || object.mass,
              colliders: action.payload.colliders || object.colliders,

              // Methods
              OnClick:
                action.payload.OnClick || action.payload.OnClick === ""
                  ? action.payload.OnClick
                  : object.OnClick,
              OnHover: action.payload.OnHover || object.OnHover,
              OnCollision:
                action.payload.OnCollision || action.payload.OnCollision === ""
                  ? action.payload.OnCollision
                  : object.OnCollision,

              sensor: action.payload.sensor || object.sensor,
              OnSensorEnter:
                action.payload.OnSensorEnter || object.OnSensorEnter,
              OnSensorExit: action.payload.OnSensorExit || object.OnSensorExit,
            };
          }

          return object;
        }),
      };

    // CASE: ENVIRONMENT
    case "CHANGE_ENVIRONMENT":
      return {
        ...state,
        objectMaster: state.objectMaster.map((object) => {
          if (
            object.assetIdentifier === "world_settings" &&
            object.type === "environment"
          ) {
            return {
              ...object,
              gravity: action.payload.gravity || object.gravity,
              sky_color: action.payload.sky_color || object.sky_color,
              ambient_light:
                action.payload.ambient_light || object.ambient_light,
              player_speed: action.payload.player_speed || object.player_speed,
              player_mass: action.payload.player_mass || object.player_mass,
              player_size: action.payload.player_size || object.player_size,
              player_jump: action.payload.player_jump || object.player_jump,
              player_flycontrol:
                action.payload.player_flycontrol || object.player_flycontrol,
              stars: action.payload.stars || object.stars,
              env_music: action.payload.env_music || object.env_music,
              player_music: action.payload.player_music || object.player_music,
            };
          }

          return object;
        }),
      };

    // CASE: LIGHT
    case "ADD_LIGHT":
      return {
        ...state,
        objectMaster: [
          ...state.objectMaster,
          {
            type: "light",
            assetIdentifier: action.payload.assetIdentifier,
            position: action.payload.position,
            color: action.payload.color,
            intensity: action.payload.intensity,
          },
        ],
      };

    case "DELETE_LIGHT":
      return {
        ...state,
        objectMaster: state.objectMaster.filter(
          (object) => object.assetIdentifier !== action.payload.assetIdentifier
        ),
      };

    case "CHANGE_LIGHT":
      return {
        ...state,
        objectMaster: state.objectMaster.map((object) => {
          if (
            object.assetIdentifier === action.payload.assetIdentifier &&
            object.type === "light"
          ) {
            return {
              ...object,
              position: action.payload.position || object.position,
              color: action.payload.color || object.color,
              intensity: action.payload.intensity || object.intensity,
            };
          }

          return object;
        }),
      };

    // CASE: TASK
    case "ADD_TASK":
      // console.log("Adding task", action.payload.assetIdentifer);
      return {
        ...state,
        objectMaster: [
          ...state.objectMaster,
          {
            type: "task",
            assetIdentifier: action.payload.assetIdentifier,
          },
        ],
      };

    case "CHANGE_TASK":
      return {
        ...state,
        objectMaster: state.objectMaster.map((object) => {
          if (
            object.assetIdentifier === action.payload.oldIdentifier &&
            object.type === "task"
          ) {
            return {
              ...object,
              assetIdentifier:
                action.payload.assetIdentifier || object.assetIdentifier,
            };
          }

          return object;
        }),
      };

    case "DELETE_TASK":
      return {
        ...state,
        objectMaster: state.objectMaster.filter(
          (object) => object.assetIdentifier !== action.payload.assetIdentifier
        ),
      };

    case "SET_CURRENT_OBJECT":
      return {
        ...state,
        currentObjectIdentifier: action.payload.assetIdentifier,
      };

    default:
      return state;

    case "SET_ASSETS":
      return {
        ...state,
        assetMaster: action.payload.assetMaster,
      };

    case "GET_ASSETS":
      return state.assetMaster;
  }
};

const GlobalContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <GlobalContext.Provider value={{ state, dispatch }}>
      {children}
    </GlobalContext.Provider>
  );
};

export { GlobalContext, GlobalContextProvider };
