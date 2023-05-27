import { DeserializeEvent } from "@projectstorm/react-diagrams";
import { NodeTypes, OtherNodeTypes, ParentNodeModel, ParentNodeModelOptions } from "../../ParentNode/ParentNodeModel";

//
// Important: API node take in (previous flow_data, active variable, next nodes)
//            and must return which next node to flow to and previous data enriched by API call 
//
// If you create useful API node, don't hesitate to do a merge request
//
// TODO: replace "API" and "api" by the name of your API call


export type APINodeOptions = ParentNodeModelOptions

export class APINodeModel extends ParentNodeModel<APINodeOptions> {
    constructor() {
        super("tdl", {
            type: OtherNodeTypes.DefaultAPI,
            color: 'rgb(255, 140, 0)',
        })
    }

    serialize() : any {
        return {
            ...super.serialize(),
            // TODO: Add all of your options (see already implemented APIs for an example)
        }
    }

    deserialize(event: DeserializeEvent<this>): void {
        super.deserialize(event);
    }

    // TODO: execute function

    // TODO: Add your function to edit the options
}