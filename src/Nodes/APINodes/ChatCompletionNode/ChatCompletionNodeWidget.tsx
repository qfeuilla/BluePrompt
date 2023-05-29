import React from "react";
import {
  ParentVisualProps,
  RenderContentProps,
} from "../../ParentNode/ParentNodeWidget";
import { ChatCompletionNodeModel, ModelType } from "./ChatCompletionNodeModel";
import { PromptType } from "../../DataNode/DataNodeModel";
import { Point } from "@projectstorm/geometry";

export class ChatCompletionVisualProps extends ParentVisualProps {}

export class ChatCompletionRenderContent extends React.Component<
  RenderContentProps<ChatCompletionNodeModel, ChatCompletionVisualProps>
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
          <select
            defaultValue={this.props.node.getOptions().model}
            onMouseUp={(e) => {
              this.props.node.setModel(e.currentTarget.value as ModelType);
            }}
          >
            <option value={ModelType.GPT3}>turbo gpt3.5</option>
            <option value={ModelType.GPT4}>gpt4</option>
            <option value={ModelType.GPT4_32k}>gpt4 32k</option>
          </select>
          <input
            style={{
              textAlign: "end",
              width: "10%",
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
            type="text"
            defaultValue={this.props.node.getOptions().temperature}
            onChange={(e) => {
              this.props.node.setTemperature(e.currentTarget.value);
            }}
          />
          <input
            style={{
              textAlign: "end",
              width: "20%",
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
            type="text"
            defaultValue={this.props.node.getOptions().max_tokens}
            onChange={(e) => {
              this.props.node.setMaxTokens(e.currentTarget.value);
            }}
          />
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
