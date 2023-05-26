from flask import Flask, request
import openai
import os
from typing import List, Optional
import json
from threading import Lock
from flask_cors import CORS

assert os.getenv("OPENAI_API_KEY") is not None, "You must export OPENAI_API_KEY as your OpenAI API key (https://beta.openai.com/account/api-keys)"
openai.api = os.getenv("OPENAI_API_KEY")

save_Lock = Lock()

openai.Model.list()
class ChatNode:
    def __init__(self, role: str, content: str):
        self.role = role # either "system", "user", or "assistant"
        self.content = content # the content of the message
        self.children: List[ChatNode] = [] # a list of ChatNode objects
        self.parent: Optional[ChatNode] = None # the parent node

    def complete(self, model: str = "gpt-3.5-turbo", temperature: float = 0.7, **kwargs):
        # append the completion of the current branch to the child
        messages = self.get_messages() # get the messages from the root to this node
        retry = 3
        while (retry):
            try:
                response = openai.ChatCompletion.create(
                    model=model,
                    messages=messages,
                    temperature=temperature,
                    **kwargs
                )
                retry = 0
            except Exception as e:
                # If last pass then raise the error.
                if (retry == 1):
                    raise e
                retry -= 1


        message = response["choices"][0]["message"]
        child = ChatNode(message["role"], message["content"])
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

@app.route('/complete', methods=['POST'])
def complete():
    request.get_json(force=True)
    messages = request.json['messages']
    prev_node = None
    
    for message in messages:
        node = ChatNode(message["role"], message["content"])
        if prev_node:
            prev_node.children.append(node)
            node.parent = prev_node
        prev_node = node

    child = prev_node.complete(model=request.json["model"], temperature=request.json["temperature"])
    return {"response": child.content}

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
    content = request.json["content"]
    save_Lock.acquire(True)
    json.dump(content, open(path, "w+"), indent=4)
    save_Lock.release()
    return {"status": "done"}

@app.route("/list_saves", methods=['POST'])
def list_saves():
    request.get_json(force=True)
    paths = [i.split(".")[0] for i in os.listdir("../saves/")]
    return {"paths": paths}

if __name__ == '__main__':
    app.run(debug=True)