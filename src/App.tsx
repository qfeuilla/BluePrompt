import "./App.css";
import createEngine, {
  CanvasWidget,
  DiagramModel,
  LinkModel,
  PortModelAlignment,
} from "@projectstorm/react-diagrams";
// import { Point } from "@projectstorm/geometry";
import { SimplePortFactory } from "./Port/SimplePortFactory";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { ArrowedLinkFactory } from "./ArrowedLink/ArrowedLinkFactory";
import { SimplePortModel } from "./Port/SimplePortModel";
import { VariableNodeFactory } from "./Nodes/VariableNode/VariableNodeFactory";
import { VariableNodeModel } from "./Nodes/VariableNode/VariableNodeModel";
import { DataNodeModel, PromptType } from "./Nodes/DataNode/DataNodeModel";
import { DataNodeFactory } from "./Nodes/DataNode/DataNodeFactory";
import { TextToVarNodeFactory } from "./Nodes/TransformNodes/TextToVarNode/TextToVarNodeFactory";
import { TextToVarNodeModel } from "./Nodes/TransformNodes/TextToVarNode/TextToVarNodeModel";
import { ChatCompletionNodeModel } from "./Nodes/APINodes/ChatCompletionNode/ChatCompletionNodeModel";
import { ChatCompletionNodeFactory } from "./Nodes/APINodes/ChatCompletionNode/ChatCompletionNodeFactory";
import {
  NodeTypes,
  OtherNodeTypes,
  ParentNodeModel,
  TransformNodeTypes,
} from "./Nodes/ParentNode/ParentNodeModel";
import { useState } from "react";
import CreatableSelect from "react-select/creatable";
import LinearProgress from "@mui/joy/LinearProgress";

// TODO: prevent unliked link
// TODO: delete link
// TODO: reload experiment from previous saved file if possible
// TODO: CTRL+Z

function permuteArray(_array: any[]): any[][] {
  if (_array.length > 2) _array[1] = permuteArray(_array.slice(1));
  return _array[0].flatMap((a: any) =>
    _array[1].map((b: any) => [a, ...(typeof b === typeof [] ? b : [b])])
  );
}

function* generateAllCombinations(variable_nodes: VariableNodeModel[]) {
  var one_choice: { [parameter: string]: number };

  if (
    variable_nodes.length === 0 ||
    variable_nodes[0].getOptions().choices.length === 0
  ) {
    yield {};
  } else if (variable_nodes.length === 1) {
    for (
      let index = 0;
      index < variable_nodes[0].getOptions().choices.length;
      index++
    ) {
      one_choice = {};
      one_choice[variable_nodes[0].getOptions().var_name] = index;
      yield one_choice;
    }
  } else {
    const every_choices: any[][] = [];
    variable_nodes.forEach((node: VariableNodeModel) => {
      every_choices.push(node.getOptions().choices);
    });

    const perms = permuteArray(every_choices);

    for (let index = 0; index < perms.length; index++) {
      const choice_combination = perms[index];
      one_choice = {};
      for (let index2 = 0; index2 < choice_combination.length; index2++) {
        const value = variable_nodes[index2]
          .getOptions()
          .choices.indexOf(choice_combination[index2]);
        one_choice[variable_nodes[index2].getOptions().var_name] = value;
      }

      yield one_choice;
    }
  }
}
interface Option {
  readonly label: string;
  readonly value: string;
}

const createOption = (label: string) => ({
  label,
  value: label.toLowerCase().replace(/\W/g, ""),
});

function SavesComponent(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState<Option[]>([]);
  const [value, setValue] = useState<Option | null>();

  const handleCreate = (inputValue: string) => {
    setIsLoading(true);
    const newOption = createOption(inputValue);
    setIsLoading(false);
    setOptions((prev) => [...prev, newOption]);
    props.onCreate(inputValue);
    props.onChange(inputValue);
    setValue(newOption);
  };

  const listSaves = async () => {
    setIsLoading(true);
    setOptions([]);
    (
      (await axios.post("http://localhost:5000/list_saves", {})).data[
        "paths"
      ] as string[]
    ).forEach((path: string) => {
      setOptions((prev) => [...prev, createOption(path)]);
    });
    setIsLoading(false);
  };

  return (
    <CreatableSelect
      onFocus={listSaves}
      isLoading={isLoading}
      onChange={(newValue) => {
        props.onChange(newValue!.label);
        setValue(newValue);
      }}
      onCreateOption={handleCreate}
      options={options}
      defaultValue={{ label: "default", value: "default" }}
      value={value}
    />
  );
}

function App() {
  var engine = createEngine();
  var current_graph = "default";

  var running: number = 0;
  var total_experiments: number = 0;
  var stop = false;
  var kill = false;

  engine
    .getPortFactories()
    .registerFactory(
      new SimplePortFactory(
        "simple",
        (config) => new SimplePortModel(PortModelAlignment.TOP)
      )
    );
  engine.getNodeFactories().registerFactory(new VariableNodeFactory());
  engine.getNodeFactories().registerFactory(new DataNodeFactory());
  engine.getNodeFactories().registerFactory(new TextToVarNodeFactory());
  engine.getNodeFactories().registerFactory(new ChatCompletionNodeFactory());
  engine.getLinkFactories().registerFactory(new ArrowedLinkFactory());

  var model = new DiagramModel();

  var selected_node_type: NodeTypes = OtherNodeTypes.Variable;
  var hidden_selected_node_type: NodeTypes = OtherNodeTypes.Variable;

  const resetGraph = () => {
    // reset all currently used var, contents and virutal varws
    (model.getNodes() as ParentNodeModel[]).forEach((node: ParentNodeModel) => {
      node.resetUsedVariable();
      node.leftPort()?.resetResolved();
      node.topPort()?.resetResolved();
      node.bottomPort()?.resetResolved();
      node.rightPort()?.resetResolved();
      node._resetGraph();
      node.fixPortConnections();
    });
  };

  const ChangeSelectedGraph = (selected_graph: string) => {
    current_graph = selected_graph;
    console.log(current_graph);
    loadGraph(current_graph);
  };

  const CreateGraph = (new_graph: string) => {
    current_graph = new_graph;
    model = new DiagramModel();
    engine.setModel(model);
    engine.repaintCanvas();
    saveNowGraph();
    engine.repaintCanvas();
  };

  const AddVarNode = (mouseX: number, mouseY: number) => {
    const new_node = new VariableNodeModel("", []);
    new_node.setPosition(mouseX, mouseY);
    model.addAll(new_node);
    console.log(new_node);
    engine.repaintCanvas();
  };

  const AddDataNode = (mouseX: number, mouseY: number) => {
    const new_node = new DataNodeModel(PromptType.System);
    new_node.setPosition(mouseX, mouseY);
    model.addAll(new_node);
    console.log(new_node);
    engine.repaintCanvas();
  };

  const AddTransformNode = (mouseX: number, mouseY: number) => {
    const new_node = new TextToVarNodeModel("");
    new_node.setPosition(mouseX, mouseY);
    model.addAll(new_node);
    console.log(new_node);
    engine.repaintCanvas();
  };

  const AddAPINode = (mouseX: number, mouseY: number) => {
    const new_node = new ChatCompletionNodeModel();
    new_node.setPosition(mouseX, mouseY);
    model.addAll(new_node);
    console.log(new_node);
    engine.repaintCanvas();
  };

  const changeSelectedNodeType = (e: any) => {
    console.log(e);
    if (e.target.className !== "node") return;

    var selected_node: ParentNodeModel =
      model.getSelectedEntities()[0] as ParentNodeModel;
    if (!selected_node) {
      return;
    }
    switch (selected_node.getOptions().type) {
      case OtherNodeTypes.Variable:
        hidden_selected_node_type = OtherNodeTypes.Data;
        break;
      case OtherNodeTypes.Data:
        hidden_selected_node_type = OtherNodeTypes.ChatCompletion;
        break;
      case OtherNodeTypes.ChatCompletion:
        hidden_selected_node_type = TransformNodeTypes.Text2Var;
        break;
      case TransformNodeTypes.Text2Var:
        hidden_selected_node_type = OtherNodeTypes.Data;
        break;
      default:
        break;
    }
  };

  const AddChild = (
    shortcut: boolean = false,
    prompt_type = PromptType.User,
    content?: string
  ) => {
    var selected_node: ParentNodeModel =
      model.getSelectedEntities()[0] as ParentNodeModel;
    if (!selected_node) {
      // toast("You need to select a node", { type: "error" });
      return;
    }
    var new_node: ParentNodeModel;
    var link: LinkModel;

    if (content !== undefined) {
      if (prompt_type !== PromptType.Assistant)
        new_node = new DataNodeModel(PromptType.User);
      else new_node = new ChatCompletionNodeModel(PromptType.Assistant);
      new_node.setPosition(
        selected_node.getX(),
        selected_node.getY() + (selected_node.getOptions().height || 0) + 200
      );
      (new_node as DataNodeModel | ChatCompletionNodeModel).setContent(content);
      link = (selected_node.bottomPort() as SimplePortModel).link(
        new_node.topPort() as SimplePortModel
      );
    } else {
      switch (shortcut ? hidden_selected_node_type : selected_node_type) {
        case OtherNodeTypes.Variable:
          if (selected_node.getOptions().type === OtherNodeTypes.Variable) {
            // toast("you can't add a VariableNode as a child to a VariableNode", {
            //   type: "error",
            // });
            return;
          }
          new_node = new VariableNodeModel("", []);
          link = (new_node.rightPort() as SimplePortModel).link(
            selected_node.leftPort() as SimplePortModel
          );
          new_node.setPosition(
            selected_node.getX() - 300,
            selected_node.getY()
          );
          break;
        case OtherNodeTypes.Data:
          new_node = new DataNodeModel(PromptType.User);
          if (
            selected_node.getOptions().type === OtherNodeTypes.Data ||
            selected_node.getOptions().type === OtherNodeTypes.ChatCompletion
          ) {
            link = (selected_node.bottomPort() as SimplePortModel).link(
              new_node.topPort() as SimplePortModel
            );
            new_node.setPosition(
              selected_node.getX(),
              selected_node.getY() +
                (selected_node.getOptions().height || 0) +
                300
            );
          } else {
            link = (selected_node.rightPort() as SimplePortModel).link(
              new_node.leftPort() as SimplePortModel
            );
            new_node.setPosition(
              selected_node.getX() + 300,
              selected_node.getY()
            );
          }
          break;
        case OtherNodeTypes.ChatCompletion:
          new_node = new ChatCompletionNodeModel();
          if (
            selected_node.getOptions().type === OtherNodeTypes.Data ||
            selected_node.getOptions().type === OtherNodeTypes.ChatCompletion
          ) {
            link = (selected_node.bottomPort() as SimplePortModel).link(
              new_node.topPort() as SimplePortModel
            );
            new_node.setPosition(
              selected_node.getX(),
              selected_node.getY() +
                (selected_node.getOptions().height || 0) +
                300
            );
          } else {
            link = (selected_node.rightPort() as SimplePortModel).link(
              new_node.leftPort() as SimplePortModel
            );
            new_node.setPosition(
              selected_node.getX() + 300,
              selected_node.getY()
            );
          }
          break;
        case TransformNodeTypes.Text2Var:
          new_node = new TextToVarNodeModel("");
          if (
            selected_node.getOptions().type === OtherNodeTypes.Data ||
            selected_node.getOptions().type === OtherNodeTypes.ChatCompletion
          ) {
            link = (selected_node.bottomPort() as SimplePortModel).link(
              new_node.leftPort() as SimplePortModel
            );
            new_node.setPosition(
              selected_node.getX() +
                ((
                  (selected_node as ChatCompletionNodeModel) || DataNodeModel
                ).getOptions().content_sizes?.x || 0) +
                300,
              selected_node.getY()
            );
          } else {
            link = (selected_node.rightPort() as SimplePortModel).link(
              new_node.leftPort() as SimplePortModel
            );
            new_node.setPosition(
              selected_node.getX() + 300,
              selected_node.getY()
            );
          }
          break;
        default:
          toast(`Can't add child, uncorrect type ${selected_node_type}`, {
            type: "error",
          });
          throw new Error(
            `Can't add child, uncorrect type ${selected_node_type}`
          );
      }
    }

    // register connections
    (link!.getTargetPort() as SimplePortModel).getOptions().connected += 1;
    (link!.getSourcePort() as SimplePortModel).getOptions().connected += 1;

    model.addAll(new_node, link!);

    model.getSelectedEntities().forEach((element) => {
      element.setSelected(false);
    });
    new_node.setSelected(true);
    engine.repaintCanvas();
    console.log(selected_node);
    saveNowGraph();
    // autoDistribute();
  };

  const saveNowGraph = (graph_name = current_graph) => {
    // TODO: unlock every nodes

    axios.post("http://localhost:5000/save_graph", {
      path: `../saves/${graph_name}.json`,
      content: model.serialize(),
    });
  };

  const loadGraph = async (name: string) => {
    var data = (
      await axios.post("http://localhost:5000/load_graph", {
        path: `../saves/${name}.json`,
      })
    ).data;

    model = new DiagramModel();
    model.deserializeModel(data, engine);
    engine.setModel(model);
    engine.repaintCanvas();
  };

  const clearGraph = () => {
    model = new DiagramModel();
    engine.setModel(model);
    engine.repaintCanvas();
  };

  const RunGraph = async (estimate_price: boolean = false) => {
    // TODO: fix bug by recalculating connected node each loops
    // prevent action on the running graph
    document.getElementById("toolbar")!.hidden = true;

    var cache: {
      [tag: string]: {
        flow_data: { type: string; data: any }[];
        skip?: number;
      };
    } = {};

    total_experiments = 1;

    const var_nodes = (model.getNodes() as ParentNodeModel[]).filter(
      (node: ParentNodeModel) => {
        return node.getOptions().type === "variable";
      }
    ) as VariableNodeModel[];

    var_nodes.forEach((node: VariableNodeModel) => {
      total_experiments *= node.getOptions().choices.length;
    });

    const variable_generator = generateAllCombinations(var_nodes);

    var flow_data: { type: string; data: any }[] = [];
    var skip: number | undefined;
    var current_generation_it;
    var current_generation: {
      [parameter: string]: number;
    };
    var current_node: ParentNodeModel;
    var tag: string;
    var fail_in_row: number = 0;
    var failed: boolean = false;

    var price = 0;

    var total_price: number | undefined = undefined;
    var global_price: number = 0;

    var current_collection: { [collect_name: string]: string };
    const run_name = current_graph + "_run_" + crypto.randomUUID();
    var experimentation_saves: {
      collections: { [collect_name: string]: string }[];
    } = { collections: [] };

    // display the experiment toolbar
    document.getElementById("experiment_bar")!.hidden = false;

    while (true) {
      running += 1;
      // trick to reload the bar
      document.getElementById(
        "progress"
      )!.innerHTML = `${running}/${total_experiments} Price : ${global_price}$`;

      current_generation_it = variable_generator.next();

      resetGraph();

      current_collection = {};

      engine.repaintCanvas();

      if (
        current_generation_it.done ||
        kill ||
        stop ||
        (estimate_price && total_price !== undefined)
      )
        break;
      total_price = 0;

      if (fail_in_row >= 3) {
        toast(
          "Please review the toasted error (you can also access them logged in the terminal), the graph is now stopped with your previous result saved",
          { type: "error", autoClose: false }
        );
        break;
      }
      current_generation = current_generation_it.value;

      // get every root nodes
      // TODO: implement a deep copy and only search one time for the roots
      var graph_heads: ParentNodeModel[] = (
        model.getNodes() as ParentNodeModel[]
      ).filter((node: ParentNodeModel) => {
        return node.isChatRoot();
      });

      for (let index = 0; index < graph_heads.length; index++) {
        const head = graph_heads[index];
        head.updateCurrentlyUsedVariable();
        cache[head.getTag(current_generation)] = {
          flow_data: [],
          skip: -1,
        };
      }

      // Only keep the flow root
      graph_heads = graph_heads.filter((node: ParentNodeModel) => {
        return node.isFlowRoot();
      });

      if (graph_heads.length < 1) {
        toast("No root node in the graph", { type: "error" });
        return;
      }

      while (graph_heads.length) {
        if (kill) break;
        current_node = graph_heads[0];
        current_node.updateCurrentlyUsedVariable();
        tag = current_node.getTag(current_generation);
        ({ flow_data, skip } = cache[tag]);
        if (skip === -1) {
          try {
            ({ price, skip } = await current_node._execute(
              flow_data,
              current_generation,
              estimate_price
            ));
            total_price += price;
          } catch (error) {
            console.log(error);
            toast((error as Error)["message"], { type: "error" });
            failed = true;
            break;
          }
          cache[tag] = { flow_data: structuredClone(flow_data), skip: skip };
        } else {
          // TODO: add the estimation for the skip price if necessary
          current_node._onSkip(flow_data, current_generation, skip);
        }
        current_node._collectData(
          flow_data,
          current_collection,
          current_generation
        );
        if (current_node.isLeaf()) graph_heads.splice(0, 1);
        else {
          current_node.flow(
            skip,
            current_generation,
            graph_heads,
            cache,
            flow_data
          );
        }
        engine.repaintCanvas();
      }
      if (failed) {
        fail_in_row += 1;
      } else {
        current_collection["graph_id"] = `${running}.json`;
        experimentation_saves.collections.push(current_collection);
        console.log(experimentation_saves);
        // save the current experiment
        axios.post("http://localhost:5000/save_experiment", {
          path: `../experiments/${run_name}.csv`,
          content: experimentation_saves,
        });
        saveNowGraph(`../experiments/${run_name}/${running}`);
        fail_in_row = 0;
      }
      global_price += total_price;
      engine.repaintCanvas();
    }
    if (estimate_price) {
      toast(
        `The maximum total cost of the run will be : ${
          total_price! * total_experiments
        }$.
        At ${total_price!}$ / runs`,
        { autoClose: false, type: "info" }
      );
      toast(
        `Calculated with the maximum amount of token at each of the nodes, and without caching, in reality you can expect 50%/70% lower cost for tasks that doesn't require a lot of tokens completions.
        You can expect even way more if your grah loop through variable later on the graph.
        If you want a more accurate reading, set the maximum tokens of each api call as close as possible as your average run, estimate the price again and then put it back to original.`,
        {}
      );
    }
    running = 0;
    kill = false;
    stop = false;
    engine.repaintCanvas();
    document.getElementById("toolbar")!.hidden = false;
    document.getElementById("experiment_bar")!.hidden = true;
  };

  // const getPreviousNode = (node: ParentNodeModel) => {
  //   return node
  //     .getPorts()
  //     ["top"].getLinks()
  //     [Object.keys(node.getPorts()["top"].getLinks())[0]].getSourcePort()
  //     .getParent() as ParentNodeModel;
  // };

  // const completePath = async () => {
  //   var selected_node = model.getSelectedEntities()[0] as
  //     | DataNodeModel
  //     | ChatCompletionNodeModel;
  //   var messagePath: {
  //     content: string;
  //     role: string;
  //   }[] = [];
  //   var parent: DataNodeModel | ChatCompletionNodeModel = selected_node;

  //   if (!selected_node) {
  //     toast("You need to select a node", { type: "error" });
  //     return;
  //   }

  //   messagePath.push({
  //     content: selected_node.getOptions().content || "",
  //     role: selected_node.getOptions().prompt_type || "user",
  //   });

  //   try {
  //     while (true) {
  //       parent = getPreviousNode(parent) as
  //         | DataNodeModel
  //         | ChatCompletionNodeModel;
  //       messagePath.push({
  //         content: parent.getOptions().content || "",
  //         role: parent.getOptions().prompt_type || "",
  //       });
  //     }
  //   } catch (error) {}

  //   var data = (
  //     await axios.post("http://localhost:5000/complete_chat", {
  //       messages: messagePath.reverse(),
  //     })
  //   ).data;
  //   AddChild("assistant" as PromptType, data["response"]);
  // };

  engine.setModel(model);
  loadGraph(current_graph);

  var _mouseX = 0;
  var _mouseY = 0;

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === "a" && e.ctrlKey) {
      e.preventDefault();
      switch (selected_node_type) {
        case OtherNodeTypes.Variable:
          AddVarNode(_mouseX, _mouseY);
          break;
        case OtherNodeTypes.Data:
          AddDataNode(_mouseX, _mouseY);
          break;
        case OtherNodeTypes.ChatCompletion:
          AddAPINode(_mouseX, _mouseY);
          break;
        case TransformNodeTypes.Text2Var:
          AddTransformNode(_mouseX, _mouseY);
          break;
      }
      e.stopPropagation();
    }
    if (e.key === "p" && e.ctrlKey) {
      e.preventDefault();
      AddChild(true);
      e.stopPropagation();
    }

    if (e.key === "s" && e.ctrlKey) {
      e.preventDefault();
      saveNowGraph();
    }
    console.log(`Key pressed: ${e.key}`);
    console.log(e);
  };

  document.addEventListener("keydown", handleKeyPress);
  window.addEventListener("beforeunload", (ev) => {
    resetGraph();
    saveNowGraph();
  });
  return (
    <div
      className="App"
      onMouseUp={(e) => {
        changeSelectedNodeType(e);
        // saveNowGraph();
      }}
      onKeyUp={(e) => {
        // saveNowGraph();
      }}
      onMouseMove={(e) => {
        _mouseX = engine.getRelativeMousePoint(e).x - 100;
        _mouseY = engine.getRelativeMousePoint(e).y - 20;
      }}
    >
      <ToastContainer />
      <div id="toolbar">
        <div>
          <div
            style={{
              width: "15%",
              height: "4vh",
              padding: 0,
              display: "inline-block",
            }}
          >
            <SavesComponent
              onChange={ChangeSelectedGraph}
              onCreate={CreateGraph}
            />
          </div>
          <div
            style={{
              width: "15%",
              height: "4vh",
              padding: 0,
              display: "inline-block",
            }}
            id="node_type_select"
          >
            <select
              style={{
                textAlign: "center",
                width: "90%",
                height: "100%",
              }}
              onChange={(e) => {
                selected_node_type = e.currentTarget.value as NodeTypes;
              }}
              defaultValue={selected_node_type}
            >
              <option value={OtherNodeTypes.Variable}>Variable node</option>
              <option value={OtherNodeTypes.Data}>Data node</option>
              <option value={OtherNodeTypes.ChatCompletion}>
                Chat GPT node
              </option>
              <option value={TransformNodeTypes.Text2Var}>
                TextToVariable node
              </option>
            </select>
          </div>
          <input
            type="button"
            onClick={() => {
              AddChild();
            }}
            value={"add child"}
            style={{ width: "10%", height: "5vh" }}
          />
          <input
            type="button"
            onClick={() => {
              saveNowGraph();
            }}
            value={"save graph"}
            style={{ width: "10%", height: "5vh" }}
          />
          <input
            type="button"
            onClick={() => loadGraph(current_graph)}
            value={"load graph"}
            style={{ width: "10%", height: "5vh" }}
          />
          <input
            type="button"
            onClick={() => {
              RunGraph(true);
            }}
            value={"estimate price"}
            style={{ width: "7%", height: "5vh", background: "gold" }}
          />
          <input
            type="button"
            onClick={clearGraph}
            value={"clear graph"}
            style={{ width: "5%", height: "5vh", background: "red" }}
          />
        </div>
        <input
          type="button"
          onClick={() => RunGraph()}
          value={"Run Graph"}
          style={{
            width: 250,
            height: "5vh",
            background: "greenyellow",
            marginTop: 10,
            marginLeft: -125,
            position: "absolute",
            zIndex: 1000,
          }}
        />
      </div>
      <div
        hidden
        id="experiment_bar"
        onChange={(e) => {
          console.log("change");
        }}
      >
        <LinearProgress
          id="progress"
          determinate
          thickness={10}
          value={((running - 1) / total_experiments) * 100}
        />
        <input
          type="button"
          onClick={() => {
            kill = true;
          }}
          value={"KILL"}
          style={{ width: "30%", height: "3vh", background: "red" }}
        />
        <input
          type="button"
          onClick={() => {
            stop = true;
          }}
          value={"clean stop"}
          style={{ width: "30%", height: "3vh", background: "orange" }}
        />
      </div>
      <div id="application" className="canvas" style={{ height: "95vh" }}>
        <CanvasWidget engine={engine} />
      </div>
    </div>
  );
}

export default App;
