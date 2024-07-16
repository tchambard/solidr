import AutoGraphIcon from '@mui/icons-material/AutoGraph';

import ActionsMenu from '@/components/ActionsMenu';
import { BN } from '@coral-xyz/anchor';

interface IProps {
	currentView: 'list' | 'edit' | 'detail';
	sessionId: BN;
}

export interface IActionMenuItem {
	title: string;
	url: string;
	color: string;
	icon: any;
	hidden?: boolean;
	description?: string;
	onClick?: () => void;
}

export default ({ sessionId, currentView }: IProps) => {
	const menuItems: IActionMenuItem[] = [
		{
			title: 'Details',
			description: 'View session details',
			url: `/sessions/${sessionId}`,
			color: 'primary',
			icon: <AutoGraphIcon fontSize={'small'} />,
			hidden: currentView === 'detail',
		},
	];

	return (
		<>
			<ActionsMenu items={menuItems} />
		</>
	);
};
