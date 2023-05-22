import { DeserializeEvent } from "@projectstorm/react-diagrams";
import { NodeTypes, ParentNodeModel, ParentNodeModelOptions } from "../../ParentNode/ParentNodeModel";

//
// Important: API node take in (previous flow_data, active variable, next nodes)
//            and must return which next node to flow to and previous data enriched by API call 
//
// If you create useful API node, don't hesitate to do a merge request
//
// TODO: replace "API" and "api" by the name of your API call


export interface APINodeOptions extends ParentNodeModelOptions {
    // TODO: Here add any option needed for execution your function
}

export class APINodeModel extends ParentNodeModel<APINodeOptions> {
    constructor() {
        super("tdl", {
            type: NodeTypes.DefaultAPI,
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