import "./App.css";
import createEngine, {
  CanvasWidget,
  DiagramModel,
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
import { ParentNodeModel } from "./Nodes/ParentNode/ParentNodeModel";
import { useState } from "react";

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

function App() {
  var current_graph_name = useState("default");
  var engine = createEngine();

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

  // var dagre_engine = new DagreEngine({
  //   graph: {
  //     rankdir: "TD",
  //     ranker: "shortest-path",
  //     marginx: 50,
  //     marginy: 50,
  //   },
  //   includeLinks: true,
  //   nodeMargin: 50,
  // });

  // const reroute = () => {
  //   engine
  //     .getLinkFactories()
  //     .getFactory<PathFindingLinkFactory>(PathFindingLinkFactory.NAME)
  //     .calculateRoutingMatrix();
  // };

  // const autoDistribute = () => {
  //   /*setTimeout(() => {
  //     dagre_engine.redistribute(model);

  //     reroute();
  //     engine.repaintCanvas();
  //   }, 1000);*/
  // };

  // const autoRefreshLinks = () => {
  //   /*setTimeout(() => {
  //     dagre_engine.refreshLinks(model);

  //     reroute();
  //     engine.repaintCanvas();
  //   }, 1000);*/
  // };

  var model = new DiagramModel();

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

  const AddChild = (prompt_type = PromptType.User, content?: string) => {
    var selected_node = model.getSelectedEntities()[0] as ParentNodeModel;
    if (!selected_node) {
      toast("You need to select a node", { type: "error" });
      return;
    }
    var new_node;

    switch (selected_node_type) {
      case "var":
        new_node = new VariableNodeModel("", []);
        break;
      case "data":
        new_node = new DataNodeModel(PromptType.System);
        break;
      case "chat":
        new_node = new ChatCompletionNodeModel();
        break;
      case "t2var":
        new_node = new TextToVarNodeModel("");
        break;
    }

    if (prompt_type !== "assistant")
      new_node = new DataNodeModel(PromptType.User);
    else new_node = new ChatCompletionNodeModel(PromptType.Assistant);
    new_node.setPosition(
      selected_node.getX(),
      selected_node.getY() + (selected_node.getOptions().height || 0) + 200
    );
    new_node.setContent(content || "");
    var link = (selected_node.getPort("bottom") as SimplePortModel).link(
      new_node.getPort("top") as SimplePortModel
    );

    (
      selected_node.getPort("bottom") as SimplePortModel
    ).getOptions().connected += 1;
    (new_node.getPort("top") as SimplePortModel).getOptions().connected += 1;

    model.addAll(new_node, link);
    model.getSelectedEntities().forEach((element) => {
      element.setSelected(false);
    });
    new_node.setSelected(true);
    engine.repaintCanvas();
    console.log(selected_node);

    saveNowGraph();
    // autoDistribute();
  };

  const saveNowGraph = () => {
    // TODO: unlock every nodes

    axios.post("http://localhost:5000/save_graph", {
      path: "../saves/default.json",
      content: model.serialize(),
    });
  };

  const loadGraph = async () => {
    var data = (
      await axios.post("http://localhost:5000/load_graph", {
        path: "../saves/default.json",
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

  const getPreviousNode = (node: ParentNodeModel) => {
    return node
      .getPorts()
      ["top"].getLinks()
      [Object.keys(node.getPorts()["top"].getLinks())[0]].getSourcePort()
      .getParent() as ParentNodeModel;
  };

  const RunGraph = async () => {
    var cache: {
      [tag: string]: {
        flow_data: { type: string; data: any }[];
        skip?: number;
      };
    } = {};
    const var_nodes = (model.getNodes() as ParentNodeModel[]).filter(
      (node: ParentNodeModel) => {
        return node.getOptions().type === "variable";
      }
    ) as VariableNodeModel[];
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

    while (true) {
      current_generation_it = variable_generator.next();

      // reset all currently used var, contents and virutal varws
      (model.getNodes() as ParentNodeModel[]).forEach(
        (node: ParentNodeModel) => {
          node.resetUsedVariable();
          node.leftPort()?.resetResolved();
          node.topPort()?.resetResolved();
          node.bottomPort()?.resetResolved();
          node.rightPort()?.resetResolved();
          node._resetGraph();
        }
      );

      engine.repaintCanvas();

      if (current_generation_it.done) break;
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
        return node.isRoot();
      });

      if (graph_heads.length < 1) {
        toast("No root node in the graph", { type: "error" });
        return;
      }

      for (let index = 0; index < graph_heads.length; index++) {
        const head = graph_heads[index];
        head.updateCurrentlyUsedVariable();
        cache[head.getTag(current_generation)] = {
          flow_data: [],
          skip: -1,
        };
      }

      while (graph_heads.length) {
        console.log(graph_heads);
        current_node = graph_heads[0];
        current_node.updateCurrentlyUsedVariable();
        tag = current_node.getTag(current_generation);
        ({ flow_data, skip } = cache[tag]);
        if (skip === -1) {
          try {
            skip = await current_node._execute(flow_data, current_generation);
          } catch (error) {
            console.log(error);
            toast((error as Error)["message"], { type: "error" });
            failed = true;
            break;
          }
          cache[tag] = { flow_data: structuredClone(flow_data), skip: skip };
        }
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
        fail_in_row = 0;
      }
      engine.repaintCanvas();
    }
    engine.repaintCanvas();
  };

  const completePath = async () => {
    var selected_node = model.getSelectedEntities()[0] as
      | DataNodeModel
      | ChatCompletionNodeModel;
    var messagePath: {
      content: string;
      role: string;
    }[] = [];
    var parent: DataNodeModel | ChatCompletionNodeModel = selected_node;

    if (!selected_node) {
      toast("You need to select a node", { type: "error" });
      return;
    }

    messagePath.push({
      content: selected_node.getOptions().content || "",
      role: selected_node.getOptions().prompt_type || "user",
    });

    try {
      while (true) {
        parent = getPreviousNode(parent) as
          | DataNodeModel
          | ChatCompletionNodeModel;
        messagePath.push({
          content: parent.getOptions().content || "",
          role: parent.getOptions().prompt_type || "",
        });
      }
    } catch (error) {}

    var data = (
      await axios.post("http://localhost:5000/complete", {
        messages: messagePath.reverse(),
      })
    ).data;
    AddChild("assistant" as PromptType, data["response"]);
  };

  engine.setModel(model);
  loadGraph();

  var _mouseX = 0;
  var _mouseY = 0;

  var selected_node_type = "var";

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === "a" && e.ctrlKey) {
      e.preventDefault();
      switch (selected_node_type) {
        case "var":
          AddVarNode(_mouseX, _mouseY);
          break;
        case "data":
          AddDataNode(_mouseX, _mouseY);
          break;
        case "chat":
          AddAPINode(_mouseX, _mouseY);
          break;
        case "t2var":
          AddTransformNode(_mouseX, _mouseY);
          break;
      }
      e.stopPropagation();
    }

    if (e.key === "s" && e.ctrlKey) {
      e.preventDefault();
      saveNowGraph();
    }
    console.log(`Key pressed: ${e.key}`);
    console.log(e);
    saveNowGraph();
  };

  document.addEventListener("keydown", handleKeyPress);

  return (
    <div
      className="App"
      onMouseUp={(e) => {
        saveNowGraph();
      }}
      onKeyUp={(e) => {
        saveNowGraph();
      }}
      onMouseMove={(e) => {
        _mouseX = engine.getRelativeMousePoint(e).x - 100;
        _mouseY = engine.getRelativeMousePoint(e).y - 20;
      }}
    >
      <ToastContainer />
      <div
        style={{
          width: "20%",
          height: "4vh",
          padding: 0,
          display: "inline-block",
        }}
      >
        <select
          style={{
            textAlign: "center",
            width: "60%",
            height: "100%",
          }}
          onChange={(e) => {
            selected_node_type = e.currentTarget.value;
          }}
        >
          <option value={"var"}>Variable node</option>
          <option value={"data"}>Data node</option>
          <option value={"chat"}>Chat GPT node</option>
          <option value={"t2var"}>TextToVariable node</option>
        </select>
        <input
          type="button"
          onClick={(e) => {
            console.log(selected_node_type);
            switch (selected_node_type) {
              case "var":
                AddVarNode(0, 0);
                break;
              case "data":
                AddDataNode(0, 0);
                break;
              case "chat":
                AddAPINode(0, 0);
                break;
              case "t2var":
                AddTransformNode(0, 0);
                break;
            }
          }}
          value={"new node"}
          style={{
            height: "100%",
          }}
        />
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
        onClick={saveNowGraph}
        value={"save graph"}
        style={{ width: "10%", height: "5vh" }}
      />
      <input
        type="button"
        onClick={loadGraph}
        value={"load graph"}
        style={{ width: "10%", height: "5vh" }}
      />
      <input
        type="button"
        onClick={completePath}
        value={"Complete"}
        style={{ width: "10%", height: "5vh" }}
      />
      <input
        type="button"
        onClick={RunGraph}
        value={"Run Graph"}
        style={{ width: "10%", height: "5vh" }}
      />
      <input
        type="button"
        onClick={clearGraph}
        value={"clear graph"}
        style={{ width: "5%", height: "5vh", background: "red" }}
      />
      <div id="application" className="canvas" style={{ height: "95vh" }}>
        <CanvasWidget engine={engine} />
      </div>
    </div>
  );
}

export default App;
