import {
  AbstractReactFactory,
  DiagramEngine,
  GenerateModelEvent,
  GenerateWidgetEvent,
} from "@projectstorm/react-diagrams";
import { TransformNodeModel } from "./TransformNodeModel";
import { GlobalNodeWidget } from "../../ParentNode/ParentNodeWidget";
import {
  TransformRenderContent,
  TransformVisualProps,
} from "./TransformNodeWidget";
import { NodeTypes } from "../../ParentNode/ParentNodeModel";

// TODO: replace "Transform" by the name of your transformation

export class TransformNodeFactory extends AbstractReactFactory<
  TransformNodeModel,
  DiagramEngine
> {
  constructor() {
    super(NodeTypes.DefaultTransform);
  }

  generateReactWidget(
    event: GenerateWidgetEvent<TransformNodeModel>
  ): JSX.Element {
    return (
      <GlobalNodeWidget
        engine={this.engine}
        node={event.model}
        visual_props={new TransformVisualProps()}
        RenderContent={TransformRenderContent}
      />
    );
  }

  generateModel(event: GenerateModelEvent) {
    return new TransformNodeModel(); // TODO: here, edit the argument to send if needed
  }
}
