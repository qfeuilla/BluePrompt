import {
  AbstractReactFactory,
  DiagramEngine,
  GenerateModelEvent,
  GenerateWidgetEvent,
} from "@projectstorm/react-diagrams";
import { TextToVarNodeModel } from "./TextToVarNodeModel";
import { GlobalNodeWidget } from "../../ParentNode/ParentNodeWidget";
import {
  TextToVarRenderContent,
  TextToVarVisualProps,
} from "./TextToVarNodeWidget";
import {
  NodeTypes,
  TransformNodeTypes,
} from "../../ParentNode/ParentNodeModel";

export class TextToVarNodeFactory extends AbstractReactFactory<
  TextToVarNodeModel,
  DiagramEngine
> {
  constructor() {
    super(TransformNodeTypes.Text2Var);
  }

  generateReactWidget(
    event: GenerateWidgetEvent<TextToVarNodeModel>
  ): JSX.Element {
    return (
      <GlobalNodeWidget
        engine={this.engine}
        node={event.model}
        visual_props={new TextToVarVisualProps()}
        RenderContent={TextToVarRenderContent}
      />
    );
  }

  generateModel(event: GenerateModelEvent) {
    return new TextToVarNodeModel(""); // TODO: here, edit the argument to send if needed
  }
}
