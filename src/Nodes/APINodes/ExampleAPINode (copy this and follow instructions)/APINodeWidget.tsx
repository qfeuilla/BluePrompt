import React from "react";
import {
  ParentVisualProps,
  RenderContentProps,
} from "../../ParentNode/ParentNodeWidget";
import { APINodeModel } from "./APINodeModel";

// TODO: replace "API" by the name of your transformation

export class APIVisualProps extends ParentVisualProps {}

export class APIRenderContent extends React.Component<
  RenderContentProps<APINodeModel, APIVisualProps>
> {
  render() {
    return (
      <div>
        {/* TODO: Here write the render of your node (that will be displayed to the user) */}
      </div>
    );
  }
}
