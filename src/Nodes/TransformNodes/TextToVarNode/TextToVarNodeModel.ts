import { DeserializeEvent } from "@projectstorm/react-diagrams";
import { NodeTypes, ParentNodeModel, ParentNodeModelOptions } from "../../ParentNode/ParentNodeModel";
import { VariableNodeModel } from "../../VariableNode/VariableNodeModel";

export interface TextToVarNodeOptions extends ParentNodeModelOptions {
    var_name: string;
}

export class TextToVarNodeModel extends ParentNodeModel<TextToVarNodeOptions> {
    constructor(var_name: string) {
        super("lr", {
            type: NodeTypes.Text2Var,
            color: 'rgb(20,60,200)',
            var_name: var_name,
        })
    }

    serialize() : any {
        return {
            ...super.serialize(),
            var_name: this.options.var_name
        }
    }

    deserialize(event: DeserializeEvent<this>): void {
        super.deserialize(event);
        this.options.var_name = event.data.var_name;
    }

    execute(flow_data: { type: string; data: any; }[], currentGen: { [param_name: string]: number; }, next_nodes: ParentNodeModel<ParentNodeModelOptions>[], variables: VariableNodeModel[]): Promise<number> {
        const choosen_next_node = 0;

        next_nodes[choosen_next_node].addVirtualVariableNode(this.getOptions().var_name, [flow_data.slice(-1)[0].data.content])
        currentGen[this.getOptions().var_name] = 0;

        this.addInUseVariable(this.getOptions().var_name);

        flow_data.splice(0, flow_data.length);

        return Promise.resolve(0);
    }


    updateVarName(var_name: string) {
        this.options.var_name = var_name;
    }
}