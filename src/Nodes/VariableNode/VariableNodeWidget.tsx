import styled from "@emotion/styled";
import {
  ParentVisualProps,
  RenderContentProps,
} from "../ParentNode/ParentNodeWidget";
import { VariableNodeModel } from "./VariableNodeModel";
import React from "react";

export class VariableVisualProps extends ParentVisualProps {
  public VarName = styled.input`
    margin: 10px;
    text-align: center;
  `;

  public Options = styled.li`
    list-style-type: none;
    max-height: 200px;
    overflow: auto;
  `;

  public Option = styled.ul`
    text-align: center;
    list-style-type: none;
    margin: 2px;
    padding: 0px;
  `;
}

export class VariableRenderContent extends React.Component<
  RenderContentProps<VariableNodeModel, VariableVisualProps>
> {
  render(): React.ReactNode {
    const visual = this.props.visual_props;

    return (
      <div style={{ overflow: "hidden" }}>
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
        <visual.Options>
          {this.props.node
            .getOptions()
            .choices.map((_option: any, index: number) => {
              return (
                <visual.Option key={"option_" + index}>
                  <input
                    type="text"
                    tabIndex={-1}
                    value={_option}
                    readOnly
                    onKeyDown={(e) => {
                      e.stopPropagation();
                      if (e.key === "Backspace") {
                        console.log("delete " + index);
                        this.props.node.removeChoice(index);
                      }
                      this.forceUpdate();
                    }}
                    key={"input_" + index}
                  />
                </visual.Option>
              );
            })}
          <br />
        </visual.Options>
        <input
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.currentTarget.value = "";
              this.props.node.addChoice();
              this.props.node.updateNewVarName("");
              this.forceUpdate();
            }
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          onChange={(e) => {
            this.props.node.updateNewVarName(e.currentTarget.value);
          }}
          style={{ width: "85%", height: "100%", marginBottom: 6 }}
          defaultValue={this.props.node.getOptions().newVar}
          placeholder="new variable"
        />
      </div>
    );
  }
}
