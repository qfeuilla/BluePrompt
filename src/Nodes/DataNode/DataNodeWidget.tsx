import React from "react";
import {
  ParentVisualProps,
  RenderContentProps,
} from "../ParentNode/ParentNodeWidget";
import { DataNodeModel, PromptType } from "./DataNodeModel";
import { Point } from "@projectstorm/geometry";

export class DataVisualProps extends ParentVisualProps {}

export class DataRenderContent extends React.Component<
  RenderContentProps<DataNodeModel, DataVisualProps>
> {
  render() {
    return (
      <div>
        <div
          style={{
            textAlign: "left",
            paddingTop: "5px",
            paddingLeft: "6px",
          }}
        >
          <select
            defaultValue={this.props.node.getOptions().prompt_type}
            onMouseUp={(e) => {
              this.props.node.setPromptType(
                e.currentTarget.value as PromptType
              );
            }}
          >
            <option value={"system"}>System</option>
            <option value={"user"}>User</option>
            <option value={"assistant"}>Assistant</option>
          </select>
        </div>
        <div style={{ margin: 5 }}>
          <textarea
            id={"text_area_" + this.props.node.getID()}
            style={{
              textAlign: "justify",
              minHeight: 100,
              width: this.props.node.getOptions().content_sizes?.x,
              height: this.props.node.getOptions().content_sizes?.y,
              minWidth: 400,
            }}
            onKeyUp={(e) => {
              this.props.node.setContent(e.currentTarget.value);
            }}
            defaultValue={this.props.node.getOptions().content}
            onMouseLeave={(e) => {
              this.props.node.setContentSizes({
                x: e.currentTarget.offsetWidth - 6,
                y: e.currentTarget.offsetHeight - 6,
              } as Point);
            }}
            onPointerUp={(e) => {
              this.props.node.setContentSizes({
                x: e.currentTarget.offsetWidth - 6,
                y: e.currentTarget.offsetHeight - 6,
              } as Point);
            }}
            onKeyDown={(e) => {
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
          />
        </div>
      </div>
    );
  }
}
