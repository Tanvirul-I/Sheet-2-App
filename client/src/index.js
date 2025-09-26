import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthContextProvider } from "./context/auth";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
	<React.StrictMode>
		<AuthContextProvider>
			<GoogleOAuthProvider clientId="79643311935-q6nhuqkvod9r7l2sgflmrp5uuf3582sa.apps.googleusercontent.com">
				<App />
			</GoogleOAuthProvider>
		</AuthContextProvider>
	</React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
