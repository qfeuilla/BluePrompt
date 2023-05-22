import { DefaultLinkModel } from "@projectstorm/react-diagrams";

export class ArrowedLinkModel extends DefaultLinkModel {
	constructor() {
		super({
			type: 'arrow',
			width: 4
		});
	}
}