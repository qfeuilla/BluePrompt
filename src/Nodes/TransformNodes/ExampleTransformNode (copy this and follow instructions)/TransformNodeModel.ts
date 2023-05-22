import { DeserializeEvent } from "@projectstorm/react-diagrams";
import { NodeTypes, ParentNodeModel, ParentNodeModelOptions } from "../../ParentNode/ParentNodeModel";

//
// Important: transform node take in (previous flow_data, active variable, next nodes)
//            and must return which next node to flow to, empty data and apply the transform 
//            from the data to the child node 
//
// If you create useful transform node, don't hesitate to do a merge request
//
// TODO: replace "Transform" and "transform" by the name of your transformation


export interface TransformNodeOptions extends ParentNodeModelOptions {
    // TODO: Here add any option needed for execution your function
}

export class TransformNodeModel extends ParentNodeModel<TransformNodeOptions> {
    constructor() {
        super("lr", {
            type: NodeTypes.DefaultTransform,
            color: 'rgb(20,60,200)',
        })
    }

    serialize() : any {
        return {
            ...super.serialize(),
            // TODO: Add all of your options (see already implemented transform for an example)
        }
    }

    deserialize(event: DeserializeEvent<this>): void {
        super.deserialize(event);
    }

    // TODO: execute function

    // TODO: Add your function to edit the options
}