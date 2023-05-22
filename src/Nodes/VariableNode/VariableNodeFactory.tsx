import {
  AbstractReactFactory,
  DiagramEngine,
  GenerateModelEvent,
  GenerateWidgetEvent,
} from "@projectstorm/react-diagrams";
import { VariableNodeModel } from "./VariableNodeModel";
import { GlobalNodeWidget } from "../ParentNode/ParentNodeWidget";
import {
  VariableRenderContent,
  VariableVisualProps,
} from "./VariableNodeWidget";

export class VariableNodeFactory extends AbstractReactFactory<
  VariableNodeModel,
  DiagramEngine
> {
  constructor() {
    super("variable");
  }

  generateReactWidget(
    event: GenerateWidgetEvent<VariableNodeModel>
  ): JSX.Element {
    return (
      <GlobalNodeWidget
        engine={this.engine}
        node={event.model}
        visual_props={new VariableVisualProps()}
        RenderContent={VariableRenderContent}
      />
    );
  }

  generateModel(event: GenerateModelEvent) {
    return new VariableNodeModel("", []);
  }
}
