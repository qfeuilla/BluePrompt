import {
  AbstractReactFactory,
  DiagramEngine,
  GenerateModelEvent,
  GenerateWidgetEvent,
} from "@projectstorm/react-diagrams";
import { DataNodeModel, PromptType } from "./DataNodeModel";
import { GlobalNodeWidget } from "../ParentNode/ParentNodeWidget";
import { DataRenderContent, DataVisualProps } from "./DataNodeWidget";
import { NodeTypes, OtherNodeTypes } from "../ParentNode/ParentNodeModel";

export class DataNodeFactory extends AbstractReactFactory<
  DataNodeModel,
  DiagramEngine
> {
  constructor() {
    super(OtherNodeTypes.Data);
  }

  generateReactWidget(event: GenerateWidgetEvent<DataNodeModel>): JSX.Element {
    return (
      <GlobalNodeWidget
        engine={this.engine}
        node={event.model}
        visual_props={new DataVisualProps()}
        RenderContent={DataRenderContent}
      />
    );
  }

  generateModel(event: GenerateModelEvent) {
    return new DataNodeModel("user" as PromptType);
  }
}
