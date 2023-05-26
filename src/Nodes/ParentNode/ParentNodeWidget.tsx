import {
  DiagramEngine,
  PortModelAlignment,
  PortWidget,
} from "@projectstorm/react-diagrams";
import { ParentNodeModel } from "./ParentNodeModel";
import styled from "@emotion/styled";
import { anyToRGB, hsvToRgb, rgbToHsv, RGBToString } from "../../utils/colors";
import React from "react";
import { Checkbox, capitalize } from "@mui/material";

// #region useful color stuff
function contrastColor(color: string): string {
  const rgb = anyToRGB(color);
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;

  return luminance > 0.5 ? "black" : "white";
}

function borderColor(color: string): string {
  const rgb = anyToRGB(color);
  let hsv = rgbToHsv(rgb);
  hsv.s *= 0.9;
  hsv.v *= 0.6;
  return RGBToString(hsvToRgb(hsv));
}

function borderColorSelected(color: string): string {
  const rgb = anyToRGB(color);
  let hsv = rgbToHsv(rgb);
  hsv.s *= 0.9;
  hsv.v *= 2;

  if (hsv.v > 1) {
    hsv.v = 1; // Ensure value doesn't exceed 1
  }
  return RGBToString(hsvToRgb(hsv));
}

// #endregion

export class ParentVisualProps {
  public Port = styled.div`
    width: 14px;
    height: 14px;
    z-index: 10;
    background: rgba(0, 0, 0, 0.8);
    border-radius: 7px;
    cursor: pointer;

    &:hover {
      background: rgba(0, 0, 0, 1);
    }
  `;

  public Node = styled.div<{ background: string; selected: boolean }>`
    background-color: ${(p) => p.background};
    border-radius: 5px;
    font-family: sans-serif;
    color: ${(p) => contrastColor(p.background)};
    font-size: 16px;
    border: solid 3px
      ${(p) =>
        p.selected
          ? borderColorSelected(p.background)
          : borderColor(p.background)};
    overflow: visible;
  `;

  public Head = styled.div<{ background: string }>`
    border-radius: 2px;
    padding: 5px;
    border-bottom: solid 1px ${(p) => borderColor(p.background)};
    font-family: sans-serif;
  `;
}

export interface RenderContentProps<
  M extends ParentNodeModel = ParentNodeModel,
  V extends ParentVisualProps = ParentVisualProps
> {
  node: M;
  visual_props: V;
}

// // Example of render content for parent
// export class ParentRenderContent extends React.Component<RenderContentProps> {
//   render(): React.ReactNode {
//     return <div>Hello</div>;
//   }
// }

export interface GlobalWidgetProps<
  M extends ParentNodeModel = ParentNodeModel,
  V extends ParentVisualProps = ParentVisualProps
> {
  node: M;
  engine: DiagramEngine;
  visual_props: V;
  RenderContent: React.ComponentType<RenderContentProps<M, V>>;
}

export class GlobalNodeWidget<
  M extends ParentNodeModel = ParentNodeModel,
  V extends ParentVisualProps = ParentVisualProps
> extends React.Component<GlobalWidgetProps<M, V>> {
  render() {
    const Node = this.props.visual_props.Node;
    const Head = this.props.visual_props.Head;
    const Port = this.props.visual_props.Port;
    const Content: React.ComponentType<RenderContentProps<M, V>> =
      this.props.RenderContent;

    return (
      <div>
        <Node
          background={this.props.node.getOptions().color}
          selected={this.props.node.isSelected()}
        >
          <Head background={this.props.node.getOptions().color}>
            <div
              style={{
                paddingBottom: 3,
              }}
            >
              {capitalize(this.props.node.getOptions().type!)}
            </div>
            <input
              style={{
                textAlign: "center",
                width: "75%",
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
              defaultValue={this.props.node.getOptions().name}
              onChange={(e) => {
                this.props.node.setName(e.currentTarget.value);
              }}
            />
            <Checkbox
              style={{
                textAlign: "center",
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
              defaultChecked={this.props.node.getOptions().collect}
              onChange={(e) => {
                this.props.node.setCollectData(e.target.checked);
              }}
            />
          </Head>
          <Content
            node={this.props.node}
            visual_props={this.props.visual_props}
          />
          {this.props.node.getPort(PortModelAlignment.TOP) && (
            <PortWidget
              style={{
                left: "50%",
                marginLeft: -7,
                top: -15,
                position: "absolute",
              }}
              port={this.props.node.getPort(PortModelAlignment.TOP)!}
              engine={this.props.engine}
            >
              <Port />
            </PortWidget>
          )}
          {this.props.node.getPort(PortModelAlignment.BOTTOM) && (
            <PortWidget
              style={{
                left: "50%",
                marginLeft: -7,
                paddingTop: 1,
                top: "100%",
                position: "absolute",
              }}
              port={this.props.node.getPort(PortModelAlignment.BOTTOM)!}
              engine={this.props.engine}
            >
              <Port />
            </PortWidget>
          )}
          {this.props.node.getPort(PortModelAlignment.LEFT) && (
            <PortWidget
              style={{
                top: "50%",
                marginTop: -7,
                left: -15,
                position: "absolute",
              }}
              port={this.props.node.getPort(PortModelAlignment.LEFT)!}
              engine={this.props.engine}
            >
              <Port />
            </PortWidget>
          )}
          {this.props.node.getPort(PortModelAlignment.RIGHT) && (
            <PortWidget
              style={{
                top: "50%",
                marginTop: -7,
                paddingLeft: 1,
                left: "100%",
                position: "absolute",
              }}
              port={this.props.node.getPort(PortModelAlignment.RIGHT)!}
              engine={this.props.engine}
            >
              <Port />
            </PortWidget>
          )}
        </Node>
      </div>
    );
  }
}
