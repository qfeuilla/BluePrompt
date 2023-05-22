import {
  AbstractReactFactory,
  DiagramEngine,
  GenerateModelEvent,
  GenerateWidgetEvent,
} from "@projectstorm/react-diagrams";
import { APINodeModel } from "./APINodeModel";
import { GlobalNodeWidget } from "../../ParentNode/ParentNodeWidget";
import { APIRenderContent, APIVisualProps } from "./APINodeWidget";
import { NodeTypes } from "../../ParentNode/ParentNodeModel";

// TODO: replace "API" by the name of your API

export class APINodeFactory extends AbstractReactFactory<
  APINodeModel,
  DiagramEngine
> {
  constructor() {
    super(NodeTypes.DefaultAPI);
  }

  generateReactWidget(event: GenerateWidgetEvent<APINodeModel>): JSX.Element {
    return (
      <GlobalNodeWidget
        engine={this.engine}
        node={event.model}
        visual_props={new APIVisualProps()}
        RenderContent={APIRenderContent}
      />
    );
  }

  generateModel(event: GenerateModelEvent) {
    return new APINodeModel(); // TODO: here, edit the argument to send if needed
  }
}
