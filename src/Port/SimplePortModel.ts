import {
  LinkModel,
  PortModel,
  PortModelGenerics,
  PortModelAlignment,
  AbstractModelFactory,
  PortModelOptions,
  DeserializeEvent,
  LinkModelGenerics,
} from "@projectstorm/react-diagrams";
import { ArrowedLinkModel } from "../ArrowedLink/ArrowedLinkModel";

export interface SimplePortModelOptions extends PortModelOptions {
  flow_in: boolean; // Wether the port is a flow_in or a flow_out
  connected: number; // Number of connections
  resolved: number; // Number of connections resolved (if resolved < connected when flowing, then stop flowing and wait for other flows)
  type?: string;
}

export interface SimplePortModelGenerics extends PortModelGenerics {
  OPTIONS: SimplePortModelOptions;
}

export class SimplePortModel extends PortModel<SimplePortModelGenerics> {
  constructor(alignment: PortModelAlignment) {
    super({
      type: "simple",
      name: alignment,
      alignment: alignment,
      flow_in: alignment === "top" || alignment === "left",
      connected: 0,
      resolved: 0,
    });
  }

  deserialize(event: DeserializeEvent<this>) {
    super.deserialize(event);
    this.options.flow_in = event.data.flow_in;
    this.options.connected = event.data.connected;
    this.options.resolved = event.data.resolved;
  }

  serialize() {
    return {
      ...super.serialize(),
      flow_in: this.options.flow_in,
      connected: this.options.connected,
      resolved: this.options.resolved,
    };
  }

  createLinkModel(factory?: AbstractModelFactory<LinkModel>): LinkModel {
    return new ArrowedLinkModel();
  }

  link<T extends LinkModel>(
    port: PortModel,
    factory?: AbstractModelFactory<T>
  ): T {
    let link = this.createLinkModel(factory);
    link.setSourcePort(this);
    link.setTargetPort(port);

    return link as T;
  }

  canLinkToPort(port: SimplePortModel): boolean {
    // TODO: Check infinite loop

    if (
      port.getOptions().flow_in === this.getOptions().flow_in ||
      this.getOptions().flow_in ||
      (Object.keys(port.links).length >= 1 &&
        port.getOptions().alignment === "top")
    )
      return false;

    if (this.getParent().getOptions().type === "variable") {
      if (port.getOptions().alignment === "top")
        return false;
    }

    if (this.getParent().getOptions().type === "data") {
      if (port.getOptions().alignment === "left" && port.getOptions().type === "data")
        return false;
    }


    const res = super.canLinkToPort(port);
    if (res) {
      this.getOptions().connected += 1;
      port.getOptions().connected += 1;
    }
    console.log(this.getOptions().name + ":" + this.getOptions().connected);
    console.log(port.getOptions().name + ":" + port.getOptions().connected);

    return res;
  }

  removeLink(link: LinkModel<LinkModelGenerics>): void {
      super.removeLink(link);
      this.getOptions().connected -= 1;
  }

  listLinks(): LinkModel<LinkModelGenerics>[] {
    var _links : LinkModel<LinkModelGenerics>[] = [];
    Object.keys(this.getLinks()).forEach((id: string) => {
      _links.push(this.getLinks()[id]);
    })
    return _links;
  }

  isResolved(): boolean {
    return this.getOptions().resolved >= this.getOptions().connected;
  }
  
  resetResolved(): void {
    this.getOptions().resolved = 0;
  }
}
