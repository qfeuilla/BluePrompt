import {
  BasePositionModelOptions,
  DeserializeEvent,
  LinkModel,
  LinkModelGenerics,
  NodeModel,
  NodeModelGenerics,
  PortModelAlignment,
} from "@projectstorm/react-diagrams";
import { SimplePortModel } from "../../Port/SimplePortModel";
import { VariableNodeModel } from "../VariableNode/VariableNodeModel";

export enum NodeTypes {
  Data = "data",
  Parent = "parent",
  Text2Var = "text to variable",
  ChatCompletion = "chat completion",
  Variable = "variable",
  DefaultTransform = "default transform",
  DefaultAPI = "default API",
}

export interface ParentNodeModelOptions extends BasePositionModelOptions {
  name?: string;
  color: string;
  width?: number;
  height?: number;
  type?: NodeTypes;
  in_use_variables?: string[];
  port_map?: string;
  collect?: boolean;
  virtual_variables?: LinkModel<LinkModelGenerics>[];
}

export interface ParentNodeModelGenerics<
  O extends ParentNodeModelOptions = ParentNodeModelOptions
> extends NodeModelGenerics {
  OPTIONS: O;
}

export class ParentNodeModel<
  O extends ParentNodeModelOptions = ParentNodeModelOptions
> extends NodeModel<ParentNodeModelGenerics<O>> {
  constructor(port_map: string, options?: O) {
    super({
      type: NodeTypes.Parent,
      name: "node_" + crypto.randomUUID(),
      color: "rgb(150,70,150)",
      in_use_variables: [],
      port_map: port_map,
      virtual_variables: [],
      collect: false,
      ...options,
    } as O);

    if (
      (port_map.includes("b") && port_map.includes("r")) ||
      (!port_map.includes("b") && !port_map.includes("r"))
    ) {
      console.error(
        "You cannot pass a map with port 'bottom' and 'right'. Only one output flow is authorized"
      );
      process.exit();
    }

    if (port_map.includes("t")) {
      const topPort = new SimplePortModel(PortModelAlignment.TOP);
      this.addPort(topPort);
    }

    if (port_map.includes("b")) {
      const bottomPort = new SimplePortModel(PortModelAlignment.BOTTOM);
      this.addPort(bottomPort);
    }

    if (port_map.includes("l")) {
      const leftPort = new SimplePortModel(PortModelAlignment.LEFT);
      this.addPort(leftPort);
    }

    if (port_map.includes("r")) {
      const rightPort = new SimplePortModel(PortModelAlignment.RIGHT);
      this.addPort(rightPort);
    }
  }

  topPort(): SimplePortModel | undefined {
    return this.ports["top"] as SimplePortModel | undefined;
  }
  bottomPort(): SimplePortModel | undefined {
    return this.ports["bottom"] as SimplePortModel | undefined;
  }
  leftPort(): SimplePortModel | undefined {
    return this.ports["left"] as SimplePortModel | undefined;
  }
  rightPort(): SimplePortModel | undefined {
    return this.ports["right"] as SimplePortModel | undefined;
  }
  flowOutPort(): SimplePortModel {
    if (this.getOptions().port_map!.includes("b")) return this.bottomPort()!;
    else return this.rightPort()!;
  }
  flowInPorts(): SimplePortModel[] {
    var flowInPorts: SimplePortModel[] = [];

    if (this.getOptions().port_map!.includes("l"))
      flowInPorts.push(this.leftPort()!);
    if (this.getOptions().port_map!.includes("t"))
      flowInPorts.push(this.topPort()!);

    return flowInPorts;
  }

  serialize(): any {
    return {
      ...super.serialize(),
      name: this.options.name,
      color: this.options.color,
      width: this.options.width,
      height: this.options.height,
      in_use_variables: this.options.in_use_variables,
      port_map: this.options.port_map,
      collect: this.options.collect,
    };
  }

  deserialize(event: DeserializeEvent<this>): void {
    super.deserialize(event);
    this.options.name = event.data.name;
    this.options.color = event.data.color;
    this.options.width = event.data.width;
    this.options.height = event.data.height;
    this.options.in_use_variables = event.data.in_use_variables;
    this.options.port_map = event.data.port_map;
    this.options.collect = event.data.collect;
  }

  addVirtualVariableNode(var_name: string, choices: string[]) {
    if (this.leftPort()) {
      const to_attach = new VariableNodeModel(var_name, choices);
      const link = to_attach.rightPort()!.link(this.leftPort()!);

      // When erasing this variable node, it do connected -1 so this is necessary
      (link.getSourcePort()! as SimplePortModel).getOptions().connected += 1;
      (link.getSourcePort()! as SimplePortModel).getOptions().resolved += 1;
      (link.getTargetPort()! as SimplePortModel).getOptions().connected += 1;
      (link.getTargetPort()! as SimplePortModel).getOptions().resolved += 1;

      this.getOptions().virtual_variables?.push(link);
    }
  }

  resetGraph?();
  _resetGraph() {
    if (this.resetGraph) {
      this.resetGraph();
    }
    this.getOptions().virtual_variables!.forEach((link: LinkModel) => {
      link.getSourcePort().getParent().remove();
      link.remove();
    });
    this.getOptions().virtual_variables = [];
  }

  setWidth(width: number): void {
    this.options.width = width;
  }

  setHeight(height: number): void {
    this.options.height = height;
  }

  addInUseVariable(variable: string): void {
    if (this.options.in_use_variables)
      this.options.in_use_variables.push(variable);
    else this.options.in_use_variables = [variable];
  }

  resetUsedVariable(): void {
    this.options.in_use_variables = [];
  }

  isRoot(): boolean {
    return this.topPort()
      ? Object.keys(this.topPort()!.listLinks()).length < 1
      : false;
  }

  getTag(currentGen: { [param_name: string]: number }): string {
    var tag = this.options.name;
    this.options.in_use_variables!.forEach((element: string) => {
      tag = tag!.concat(element + "_" + currentGen[element]);
    });
    return tag!;
  }

  getChildren(): ParentNodeModel[] {
    var children: ParentNodeModel[] = [];

    this.flowOutPort()
      .listLinks()
      .forEach((link: LinkModel) => {
        children.push(link.getTargetPort().getParent() as ParentNodeModel);
      });

    return children;
  }

  getLeftNodes(): ParentNodeModel[] {
    var left: ParentNodeModel[] = [];

    if (this.leftPort())
      this.leftPort()!
        .listLinks()
        .forEach((link: LinkModel) => {
          const parent = link.getSourcePort().getParent();
          left.push(parent as ParentNodeModel);
        });

    return left;
  }

  getAttachedVariableNodes(): VariableNodeModel[] {
    var nodes: VariableNodeModel[] = [];
    this.getLeftNodes().forEach((node: ParentNodeModel) => {
      if (
        node.getOptions().type === "variable" &&
        !nodes.includes(node as VariableNodeModel)
      )
        nodes.push(node as VariableNodeModel);
    });
    return nodes;
  }

  updateCurrentlyUsedVariable(): void {
    this.getAttachedVariableNodes().forEach((node: VariableNodeModel) => {
      if (
        !this.getOptions().in_use_variables?.includes(
          node.getOptions().var_name
        )
      )
        this.addInUseVariable(node.getOptions().var_name);
    });
  }

  setName(new_name: string) {
    this.options.name = new_name;
  }

  setCollectData(collect: boolean) {
    this.options.collect = collect;
  }

  async _execute(
    flow_data: { type: string; data: any }[],
    currentGen: { [param_name: string]: number },
    estimatePrice: boolean,
  ): Promise<number | undefined | {price: number, skip: number | undefined}> {
    if (this.execute) {
      return await this.execute(
        flow_data,
        currentGen,
        this.getChildren(),
        this.getAttachedVariableNodes(),
        estimatePrice
      );
    } else {
      console.error(
        "You need to implement the execute function for node: " +
          this.options.name +
          " of type " +
          this.options.type
      );
      process.exit();
    }
  }

  async _onSkip(
    flow_data: { type: string; data: any }[],
    currentGen: { [param_name: string]: number },
    previous_skip: number | undefined
  ): Promise<number | undefined> {
    if (this.onSkip) {
      return await this.onSkip(
        flow_data,
        currentGen,
        this.getChildren(),
        this.getAttachedVariableNodes(),
        previous_skip
      );
    } else {
      console.error(
        "You need to implement the onSkip function for node: " +
          this.options.name +
          " of type " +
          this.options.type
      );
      process.exit();
    }
  }


  _collectData(
    flow_data: { type: string; data: any }[],
    current_collection: { [collect_name: string] : string},
    currentGen: { [param_name: string]: number }
  ) {
    this.getAttachedVariableNodes().forEach((val: VariableNodeModel) => {
      if (val.getOptions().collect)
        val.collectData(flow_data, current_collection, currentGen);
    })

    if (this.collectData && this.getOptions().collect)
      this.collectData(flow_data, current_collection, currentGen);
  }
  
  collectData?(
    flow_data: { type: string; data: any }[],
    current_collection: { [collect_name: string] : string},
    currentGen: { [param_name: string]: number }
  );

  async execute?(
    flow_data: { type: string; data: any }[],
    currentGen: { [param_name: string]: number },
    next_nodes: ParentNodeModel[],
    variables: VariableNodeModel[],
    estimatePrice: boolean,
  ): Promise<number | undefined | {price: number, skip: number | undefined}>;

  async onSkip?(
    flow_data: { type: string; data: any }[],
    currentGen: { [param_name: string]: number },
    next_nodes: ParentNodeModel[],
    variables: VariableNodeModel[],
    previous_skip: number | undefined
  ): Promise<number | undefined>;

  // TODO: Fork flow for data node and select flow for function nodes
  flow(
    id: number | undefined,
    current_gen: { [param_name: string]: number },
    current_nodes: ParentNodeModel[],
    cache: {
      [tag: string]: {
        flow_data: { type: string; data: any }[];
        skip?: number;
      };
    },
    current_flow_data: { type: string; data: any }[]
  ) {
    current_nodes.splice(0, 1);

    var toFlowToNodes: ParentNodeModel[] = [];
    if (!id) {
      this.flowOutPort().getOptions().resolved += this.getChildren().length;
      toFlowToNodes = toFlowToNodes.concat(this.getChildren());
      this.flowOutPort()
        .listLinks()
        .forEach((link: LinkModel) => {
          (link.getTargetPort() as SimplePortModel).getOptions().resolved += 1;
        });
    } else {
      this.flowOutPort().getOptions().resolved += 1;
      toFlowToNodes.push(this.getChildren()[id]);
      (
        this.flowOutPort().listLinks()[id].getTargetPort() as SimplePortModel
      ).getOptions().resolved += 1;
    }

    toFlowToNodes.forEach((node: ParentNodeModel) => {
      // Check wether some previous data might be erased
      // If yes, then pass the previous data instead
      var tag: string = node.getTag(current_gen);
      var to_save_data = Object.keys(cache).includes(tag)
        ? cache[tag]["flow_data"]
        : current_flow_data;
      var to_save_skip = Object.keys(cache).includes(tag)
        ? cache[tag]["skip"]
        : -1;

      this.options.in_use_variables!.forEach((variable: string) => {
        if (!node.getOptions().in_use_variables!.includes(variable))
          node.getOptions().in_use_variables!.push(variable);
      });

      // Check wether the actual next step have also already
      // been cached. If yes then keep this
      tag = node.getTag(current_gen);

      to_save_data = Object.keys(cache).includes(tag)
        ? cache[tag]["flow_data"]
        : to_save_data;
      to_save_skip = Object.keys(cache).includes(tag)
        ? cache[tag]["skip"]
        : to_save_skip;

      // If the top flow has already been computed
      if (!node.waitTopFlow()) {
        cache[tag] = {
          flow_data: structuredClone(to_save_data),
          skip: to_save_skip,
        };
      }

      if (!node.waitLeftFlow() && !node.waitTopFlow()) {
        current_nodes.unshift(node);
      }
    });
  }

  isLeaf(): boolean {
    return this.getChildren().length < 1;
  }

  waitTopFlow(): boolean {
    return (this.topPort() && !this.topPort()!.isResolved()) || false;
  }

  waitLeftFlow(): boolean {
    return (this.leftPort() && !this.leftPort()!.isResolved()) || false;
  }
}
