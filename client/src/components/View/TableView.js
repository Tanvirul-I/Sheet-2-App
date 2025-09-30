import { Button } from '@mui/material';

export default function View(props) {
	let elements = props.elements;
	let allowedActions = props.allowedActions;

	// return a simple JSX table containing all the rows
	let borderStyle = {
		border: '1px solid black',
		borderCollapse: 'collapse'
	};

	if (elements) {
		return (
			<div>
				<table style={borderStyle}>
					<tbody>
						<tr>
							<th style={borderStyle}>{props.name}</th>
						</tr>
						{elements.map((element) => {
							return element.tr;
						})}
					</tbody>
				</table>
				{allowedActions.includes('add') ? (
					<Button onClick={() => props.addRecord(props.maxLen)}>+</Button>
				) : (
					''
				)}
			</div>
		);
	}
}
