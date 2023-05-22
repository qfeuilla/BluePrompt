import { DefaultLinkFactory } from "@projectstorm/react-diagrams";
import { ArrowedLinkModel } from "./ArrowedLinkModel";
import { ArrowedLinkWidget } from "./ArrowedLinkWidget";

export class ArrowedLinkFactory extends DefaultLinkFactory {
  constructor() {
    super("arrow");
  }

  generateModel(): ArrowedLinkModel {
    return new ArrowedLinkModel();
  }

  generateReactWidget(event: any): JSX.Element {
    return <ArrowedLinkWidget link={event.model} diagramEngine={this.engine} />;
  }
}
