import {
  AbstractReactFactory,
  DiagramEngine,
  GenerateModelEvent,
  GenerateWidgetEvent,
} from "@projectstorm/react-diagrams";
import { DataNodeModel, PromptType } from "./DataNodeModel";
import { GlobalNodeWidget } from "../ParentNode/ParentNodeWidget";
import { DataRenderContent, DataVisualProps } from "./DataNodeWidget";

export class DataNodeFactory extends AbstractReactFactory<
  DataNodeModel,
  DiagramEngine
> {
  constructor() {
    super("data");
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
