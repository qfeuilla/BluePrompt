import { DeserializeEvent } from "@projectstorm/react-diagrams";
import {
  OtherNodeTypes,
  ParentNodeModel,
  ParentNodeModelOptions,
} from "../ParentNode/ParentNodeModel";

export interface VariableNodeOptions extends ParentNodeModelOptions {
  var_name: string;
  choices: any[];
  selected_choice?: number;
  newVar: string;
}

export class VariableNodeModel extends ParentNodeModel<VariableNodeOptions> {
  // TODO: check that all the vars in the model have different names. And also t2var nodes.
  constructor(var_name: string, choices: any[]) {
    super("r", {
      type: OtherNodeTypes.Variable,
      color: "rgb(40,40,110)",
      var_name: var_name,
      choices: choices,
      newVar: "",
    });
  }

  serialize(): any {
    return {
      ...super.serialize(),
      var_name: this.options.var_name,
      choices: this.options.choices,
      selected_choice: this.options.selected_choice,
      newVar: this.options.newVar,
    };
  }

  deserialize(event: DeserializeEvent<this>): void {
    super.deserialize(event);
    this.options.var_name = event.data.var_name;
    this.options.choices = event.data.choices;
    this.options.selected_choice = event.data.selected_choice;
    this.options.newVar = event.data.newVar;
  }

  updateVarName(var_name: string) {
    this.options.var_name = var_name;
    this.setName("var_" + var_name);
  }

  collectData?(
    flow_data: { type: string; data: any }[],
    current_collection: { [collect_name: string] : string},
    currentGen: { [param_name: string]: number }
  ) {
    current_collection[this.getOptions().name!] =
      this.getOptions().choices[currentGen[this.getOptions().var_name]];
  }

  updateNewVarName(var_name: string) {
    this.options.newVar = var_name;
  }

  addChoice() {
    this.options.choices.push(this.options.newVar);
  }

  removeChoice(index: number) {
    this.options.choices.splice(index, 1);
  }
}
