/**
 *
 * Auth Context handler, uses React context and reducer.
 * https://react.dev/reference/react/useReducer
 * https://react.dev/reference/react/createContext
 *
 */

import React, { createContext, useReducer, useEffect } from "react";
import authAPI from "../api/auth";
import sheetsAPI from "../api/sheets";

export const AuthContext = createContext();

// THESE ARE ALL THE TYPES OF UPDATES TO OUR AUTH STATE THAT CAN BE PROCESSED
export const AuthActionType = {
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
};

/**
 *
 * Reducer used by the context to maintain the authenticated state. This also interacts with the local storage
 * to set the user's JWT token.
 *
 * @param {obj} state Current state of Auth
 * @param {obj} action Holds information regarding the action type and updates that must be made to the state
 * @return {obj} New state of the Auth context
 */

export const authReducer = (state, action) => {
  const { type, payload } = action;

  switch (type) {
    case AuthActionType.LOGIN: {
      localStorage.setItem("user", payload.token);
      return {
        user: payload.data,
        token: payload.token,
        globalDev: payload.globalDev,
      };
    }
    case AuthActionType.LOGOUT: {
      localStorage.removeItem("user");
      return {
        user: null,
      };
    }
    default:
      return state;
  }
};

export function AuthContextProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, { user: null });

  //Checks to see if user has a valid JWT that they previously used to login
  const checkLogin = async () => {
    let userToken = localStorage.getItem("user");
    if (userToken) {
      let userInfo = await authAPI.getUserInfo(userToken);

      if (userInfo.data.success === false) {
        dispatch({ type: "LOGOUT", payload: {} });
      } else {
        let payload = userInfo.data;
        try {
          const globalDevList = await sheetsAPI.inGlobalDevList();
          payload.globalDev = globalDevList.data.success === true;
        } catch (err) {
          if (err?.unauthorized) {
            dispatch({ type: "LOGOUT", payload: {} });
            return;
          }
          payload.globalDev = false;
        }
        dispatch({ type: "LOGIN", payload: payload });
      }
    }
  };

  useEffect(() => {
    checkLogin();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        dispatch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
