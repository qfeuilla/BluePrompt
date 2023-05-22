import {
  AbstractReactFactory,
  DiagramEngine,
  GenerateModelEvent,
  GenerateWidgetEvent,
} from "@projectstorm/react-diagrams";
import { ChatCompletionNodeModel } from "./ChatCompletionNodeModel";
import { GlobalNodeWidget } from "../../ParentNode/ParentNodeWidget";
import {
  ChatCompletionRenderContent,
  ChatCompletionVisualProps,
} from "./ChatCompletionNodeWidget";
import { NodeTypes } from "../../ParentNode/ParentNodeModel";

export class ChatCompletionNodeFactory extends AbstractReactFactory<
  ChatCompletionNodeModel,
  DiagramEngine
> {
  constructor() {
    super(NodeTypes.ChatCompletion);
  }

  generateReactWidget(
    event: GenerateWidgetEvent<ChatCompletionNodeModel>
  ): JSX.Element {
    return (
      <GlobalNodeWidget
        engine={this.engine}
        node={event.model}
        visual_props={new ChatCompletionVisualProps()}
        RenderContent={ChatCompletionRenderContent}
      />
    );
  }

  generateModel(event: GenerateModelEvent) {
    return new ChatCompletionNodeModel();
  }
}
