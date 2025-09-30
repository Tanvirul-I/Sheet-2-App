/**
 *
 * Currently mainly focuses on the switch between the user being logged
 * in and logged out.
 *
 */

import { useContext } from 'react';

import GoogleAuth from './GoogleAuth';
import ResponsiveAppBar from './AppBar';
import MakeApp from '../App/MakeApp';

//import ReadSheets from "../readSheets/ReadSheets";
import { AuthContext } from '../../context/auth';

export default function Home() {
	const { user } = useContext(AuthContext);

	if (user)
		return (
			<div>
				<ResponsiveAppBar />
				<MakeApp user={user} />
			</div>
		);
	else
		return (
			<div>
				<GoogleAuth />
			</div>
		);
}
