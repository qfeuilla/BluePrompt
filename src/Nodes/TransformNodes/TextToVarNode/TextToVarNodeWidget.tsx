import React from "react";
import {
  ParentVisualProps,
  RenderContentProps,
} from "../../ParentNode/ParentNodeWidget";
import { TextToVarNodeModel } from "./TextToVarNodeModel";
import styled from "@emotion/styled";

export class TextToVarVisualProps extends ParentVisualProps {
  public VarName = styled.input`
    margin: 10px;
    text-align: center;
  `;
}

export class TextToVarRenderContent extends React.Component<
  RenderContentProps<TextToVarNodeModel, TextToVarVisualProps>
> {
  render() {
    const visual = this.props.visual_props;

    return (
      <div>
        <visual.VarName
          placeholder="variable name"
          defaultValue={this.props.node.getOptions().var_name}
          onKeyDown={(e) => {
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          onChange={(e) => {
            this.props.node.updateVarName(e.currentTarget.value);
            e.stopPropagation();
          }}
        />
        {/* TODO: Here write the render of your node (that will be displayed to the user) */}
      </div>
    );
  }
}
