import { DeserializeEvent } from "@projectstorm/react-diagrams";
import { NodeTypes, OtherNodeTypes, ParentNodeModel, ParentNodeModelOptions } from "../ParentNode/ParentNodeModel";
import {Point} from "@projectstorm/geometry"
import axios from "axios";
import { VariableNodeModel } from "../VariableNode/VariableNodeModel";

export enum PromptType {
	Assistant = "assistant",
	User = "user",
	System = "system",
}

export interface DataNodeOptions extends ParentNodeModelOptions {
    content?: string;
    content_sizes?: Point;
    prompt_type?: PromptType;
}

export class DataNodeModel extends ParentNodeModel<DataNodeOptions> {
    constructor(prompt_type: PromptType = PromptType.User) {
        super("ltb", {
            type: OtherNodeTypes.Data,
            color: 'rgb(60,110,40)',
            prompt_type: prompt_type
        })
    }

    serialize() : any {
        return {
            ...super.serialize(),
            content: this.options.content,
            content_sizes: this.options.content_sizes,
            prompt_type: this.options.prompt_type,
        }
    }

    deserialize(event: DeserializeEvent<this>): void {
        super.deserialize(event);
        this.options.content = event.data.content;
        this.options.content_sizes = event.data.content_sizes;
        this.options.prompt_type = event.data.prompt_type;
    }

    async execute(flow_data: { type: string; data: any; }[], currentGen: { [param_name: string]: number; }, next_nodes: ParentNodeModel<ParentNodeModelOptions>[], variables: VariableNodeModel[]): Promise<number | undefined> {
        let processed_content = this.options.content!;
        
        this.getAttachedVariableNodes().forEach((_var: VariableNodeModel) => {
            processed_content = processed_content ? processed_content.replace(new RegExp("{" + _var.getOptions().var_name + "}", "g"), _var.getOptions().choices[currentGen[_var.getOptions().var_name]]) : processed_content;
        });

        flow_data.push({
            type: this.options.prompt_type || PromptType.Assistant,
            data: {
                content: processed_content
            }
        })

        return undefined;
    }

    collectData?(
        flow_data: { type: string; data: any }[],
        current_collection: { [collect_name: string] : string},
        currentGen: { [param_name: string]: number }
      ) {
        current_collection[this.getOptions().name!] = flow_data.slice(-1)[0].data.content || "";
    }

    onSkip(flow_data: { type: string; data: any; }[], currentGen: { [param_name: string]: number; }, next_nodes: ParentNodeModel<ParentNodeModelOptions>[], variables: VariableNodeModel[], previous_skip: number | undefined): Promise<number | undefined> {
        this.getOptions().content = flow_data.slice(-1)[0].data.content;

        return Promise.resolve(previous_skip);
    }

    setContent(content: string): void {
        this.options.content = content;
    }

    setContentSizes(sizes: Point) {
        this.options.content_sizes = sizes;
    }

    setPromptType(prompt_type: PromptType) {
        this.options.prompt_type = prompt_type;
    }

}