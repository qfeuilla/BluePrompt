# Getting started

## Installation

1\) Start by creating a venv for the api:

```bash
cd api
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

2\) Add your API key to your environment

```bash
export OPENAI_API_KEY="XXXXXXXXX" # You didn't leak the key, positive reward 👍
```

(💡 you should add this to your `.zshrc` / `.bashrc` / `.whateverrc`, or else your will have to do this each time you want to run the app 😉)

3\) Then in the root of the folder

```bash
yarn install
```

## Run

```bash
yarn start-api
# Then in a new bash
yarn start
```
