/**
 *
 * Handles user Google Authentication, uses the code model.
 *
 */

import { useGoogleLogin } from "@react-oauth/google";
import { useContext } from "react";
import { Button } from "@mui/material";

import { AuthContext } from "../../context/auth";

import authAPI from "../../api/auth";
import sheetAPI from "../../api/sheets";

export default function GoogleAuth() {
	const { dispatch } = useContext(AuthContext);

	//Once the user is done interacting with the Google Auth context, the reducer is called to update the app Auth Context
	const login = useGoogleLogin({
		onSuccess: async (response) => {
			let loginInfo = await authAPI.loginUser(response.code);
			if (!loginInfo.data.success) {
				//Display error message saying login failure
				return;
			}
                        let payload = loginInfo.data;
                        localStorage.setItem("user", payload.token);
                        try {
                                const globalDevList = await sheetAPI.inGlobalDevList();
                                payload.globalDev = globalDevList.data.success === true;
                        } catch (e) {
                                payload.globalDev = false;
                        }
			dispatch({ type: "LOGIN", payload: payload });
			window.location.reload();
		},
		flow: "auth-code",
		//scope: "https://www.googleapis.com/auth/spreadsheets","https://www.googleapis.com/auth/drive.file",
	});
	return (
		<div
			style={{
				width: "100vw",
				height: "100vh",
				display: "flex",
				alignItems: "center" /* vertical */,
				justifyContent: "center" /* horizontal */,
			}}
		>
			<Button
				variant="contained"
				onClick={() => login()}
			>
				Sign in with Google
			</Button>
		</div>
	);
}
