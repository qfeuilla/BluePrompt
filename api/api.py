from flask import Flask, request
import openai
import os
from typing import List, Optional
import json
from threading import Lock
from flask_cors import CORS
import pandas as pd
import tiktoken
from platform import uname


def in_wsl() -> bool:
    return 'microsoft-standard' in uname().release

price_table = {
    "gpt-4" : [0.03, 0.06],
    "gpt-4-32k": [0.06, 0.12],
    "gpt-3.5-turbo": [0.002, 0.002],
    "text-davinci-003": [0.02, 0.02],
    "text-davinci-002": [0.02, 0.02],
    "davinci": [0.02, 0.02],
}

is_chat = {
    "gpt-4" : True,
    "gpt-4-32k": True,
    "gpt-3.5-turbo": True,
    "text-davinci-003": False,
    "text-davinci-002": False,
    "davinci": False,
}

assert os.getenv("OPENAI_API_KEY") is not None, "You must export OPENAI_API_KEY as your OpenAI API key (https://beta.openai.com/account/api-keys)"
openai.api = os.getenv("OPENAI_API_KEY")

save_Lock = Lock()
save_exp_Lock = Lock()

class ChatNode:
    def __init__(self, role: str, content: str):
        self.role = role # either "system", "user", or "assistant"
        self.content = content # the content of the message
        self.children: List[ChatNode] = [] # a list of ChatNode objects
        self.parent: Optional[ChatNode] = None # the parent node

    def complete(self, model: str = "gpt-3.5-turbo", temperature: float = 0.7, max_tokens=512, is_chat: bool = True, **kwargs):
        # append the completion of the current branch to the child
        messages = self.get_messages() # get the messages from the root to this node
        retry = 3
        while (retry):
            try:
                if (is_chat):
                    response = openai.ChatCompletion.create(
                        model=model,
                        messages=messages,
                        temperature=temperature,
                        max_tokens=max_tokens,
                        **kwargs
                    )
                    retry = 0
                    message = response["choices"][0]["message"]
                    child = ChatNode(message["role"], message["content"])
                else:
                    response = openai.Completion.create(
                        model=model,
                        prompt="\n".join([m["content"] for m in messages]),
                        temperature=temperature,
                        max_tokens=max_tokens,
                        **kwargs
                    )
                    retry = 0
                    message = response["choices"][0]["text"]
                    child = ChatNode("assistant", message)
            except Exception as e:
                # If last pass then raise the error.
                if (retry == 1):
                    raise e
                retry -= 1
        self.children.append(child)
        child.parent = self
        return child

    def get_messages(self) -> List[dict]:
        # get the messages from the root to this node
        messages: List[dict] = []
        node = self
        while node:
            messages.append({
                "role": node.role,
                "content": node.content
            })
            node = node.parent
        messages.reverse()
        return messages

app = Flask(__name__)

cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route('/estimate_price', methods=['POST'])
def estimate_price():
    request.get_json(force=True)
    messages = request.json['messages']
    max_tokens = request.json['max_tokens'] if 'max_tokens' in request.json else 512
    model = request.json["model"]
    encoding = tiktoken.encoding_for_model(model)
    count = 0

    for message in messages:
        count += len(encoding.encode(message["content"]))

    return {"price": ((count / 1000) * price_table[model][0]) + ((max_tokens / 1000) * price_table[model][1])}


@app.route('/complete_chat', methods=['POST'])
def complete():
    request.get_json(force=True)
    messages = request.json['messages']
    max_tokens = request.json['max_tokens'] if 'max_tokens' in request.json else 512
    model = request.json["model"]
    prev_node = None
    encoding = tiktoken.encoding_for_model(model)
    count = 0

    for message in messages:
        content = message["content"]
        node = ChatNode(message["role"], content)
        if prev_node:
            prev_node.children.append(node)
            node.parent = prev_node
        prev_node = node
        count += len(encoding.encode(content))

    child = prev_node.complete(model=model, temperature=request.json["temperature"], max_tokens=max_tokens, is_chat=is_chat[model])
    return {"price": ((count / 1000) * price_table[model][0]) + ((len(encoding.encode(child.content)) / 1000) * price_table[model][1]), "completion": child.content}

@app.route("/load_graph", methods=['POST'])
def load_graph():
    request.get_json(force=True)
    path = request.json["path"]
    save_Lock.acquire(True)
    data = json.load(open(path, "r+"))
    save_Lock.release()
    return data

@app.route("/save_graph", methods=['POST'])
def save_graph():
    request.get_json(force=True)
    path = request.json["path"]
    _dir = "/".join(path.split("/")[:-1])
    if not os.path.exists(_dir):
        os.makedirs(_dir)
    content = request.json["content"]
    save_Lock.acquire(True)
    json.dump(content, open(path, "w+"), indent=4)
    save_Lock.release()
    return {"status": "done"}

@app.route("/save_experiment", methods=['POST'])
def save_experiment():
    request.get_json(force=True)
    path = request.json["path"]
    content = request.json["content"]["collections"]
    data = pd.DataFrame.from_records(content)
    save_exp_Lock.acquire(True)
    data.to_csv(path)
    file_abspath = os.path.abspath(path)
    if (in_wsl()):
        file_abspath = "//wsl.localhost/Ubuntu" + file_abspath
    file_abspath = "file:///" + file_abspath

    save_exp_Lock.release()
    return {"status": "done", "abs_path": file_abspath}

@app.route("/list_saves", methods=['POST'])
def list_saves():
    request.get_json(force=True)
    paths = [i.split(".")[0] for i in os.listdir("../saves/")]
    return {"paths": paths}

if __name__ == '__main__':
    app.run(debug=True)