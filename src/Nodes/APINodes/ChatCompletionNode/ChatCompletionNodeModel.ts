import { DeserializeEvent } from "@projectstorm/react-diagrams";
import { NodeTypes, ParentNodeModel, ParentNodeModelOptions } from "../../ParentNode/ParentNodeModel";
import {Point} from "@projectstorm/geometry"
import { PromptType } from "../../DataNode/DataNodeModel";
import { VariableNodeModel } from "../../VariableNode/VariableNodeModel";
import axios, { AxiosError } from "axios";


export enum ModelType {
	GPT4 = "gpt-4", 
    GPT4_32k = "gpt-4-32k", 
    GPT3 = "gpt-3.5-turbo"
}

export interface ChatCompletionNodeOptions extends ParentNodeModelOptions {
    content?: string;
    content_sizes?: Point;
    prompt_type?: PromptType;
    model?: ModelType;
}

export class ChatCompletionNodeModel extends ParentNodeModel<ChatCompletionNodeOptions> {
    constructor(prompt_type: PromptType = PromptType.Assistant, model: ModelType = ModelType.GPT3) {
        super("tbl", {
            type: NodeTypes.ChatCompletion,
            color: 'rgb(255, 140, 0)',
            prompt_type: prompt_type,
            model: model
        }) 
    }

    serialize() : any {
        return {
            ...super.serialize(),
            content: this.options.content,
            content_sizes: this.options.content_sizes,
            prompt_type: this.options.prompt_type,
            model: this.options.model
        }
    }

    deserialize(event: DeserializeEvent<this>): void {
        super.deserialize(event);
        this.options.content = event.data.content;
        this.options.content_sizes = event.data.content_sizes;
        this.options.prompt_type = event.data.prompt_type;
        this.options.model = event.data.model
    }

    async execute(flow_data: { type: string; data: any; }[], currentGen: { [param_name: string]: number; }, next_nodes: ParentNodeModel<ParentNodeModelOptions>[], variables: VariableNodeModel[]): Promise<number | undefined> {
        var messagePath: {
            content: string;
            role: string;
          }[] = [];

        flow_data.forEach((val) => {
            if (["assistant", "user", "system"].includes(val.type))
                messagePath.push({
                    content: val.data.content,
                    role: val.type
                })
        })

        const completion = (await axios.post("http://localhost:5000/complete", {
            messages: messagePath,
            model: this.getOptions().model
        }).catch((error : AxiosError) => {
            throw new Error(JSON.stringify(error.toJSON()))
        })).data["response"];
        
        this.getOptions().content = completion;

        flow_data.push({
            type: this.options.prompt_type || PromptType.Assistant,
            data: {
                content: completion
            }
        })

        return undefined;
    }

    onSkip(flow_data: { type: string; data: any; }[], currentGen: { [param_name: string]: number; }, next_nodes: ParentNodeModel<ParentNodeModelOptions>[], variables: VariableNodeModel[], previous_skip: number | undefined): Promise<number | undefined> {
        this.getOptions().content = flow_data.slice(-1)[0].data.content;

        return Promise.resolve(previous_skip);
    }

    resetGraph() {
        this.getOptions().content = "";
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

    setModel(model: ModelType) {
        this.options.model = model;
    }
}