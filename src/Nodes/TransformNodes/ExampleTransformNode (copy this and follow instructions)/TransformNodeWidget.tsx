import React from "react";
import {
  ParentVisualProps,
  RenderContentProps,
} from "../../ParentNode/ParentNodeWidget";
import { TransformNodeModel } from "./TransformNodeModel";

// TODO: replace "Transform" by the name of your transformation

export class TransformVisualProps extends ParentVisualProps {}

export class TransformRenderContent extends React.Component<
  RenderContentProps<TransformNodeModel, TransformVisualProps>
> {
  render() {
    return (
      <div>
        {/* TODO: Here write the render of your node (that will be displayed to the user) */}
      </div>
    );
  }
}
