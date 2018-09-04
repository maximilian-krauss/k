# k

Just like James Bond's Q, but for `kubectl`

![Q](https://media.giphy.com/media/1jkV4Ruc4bm7hUn262/giphy.gif)

k is a `kubectl` helper to deal with different kubernetes envionments

## Installation

```bash
npm install -g the-k
```

## Usage

```bash
k [environment name] ... commands/shorthands
```

```bash
# Without k
kubectl --kubeconfig /Users/max/.bluemix/plugins/container-service/clusters/moo-dev/moo-dev.yml exec -it mypod-abcdef -- /bin/sh

# With k
k dev exec -it mypod-abcdef -- /bin/sh

# With k on steroids
k dev e mypod-abcdef -- /bin/sh
```

## Configuration

### The kFile

That what's all about. You need to place a `.kfile.json` inside your home directory. See below for an example config.

#### Example .kfile.json

```json
{
  "shorthands": {
    "gp": ["get", "pods"],
    "gs": ["get", "services"],
    "e": ["exec", "-it"]
  },
  "environments": {
    "dev": {
      "kubeconfig": "/Users/max/.bluemix/plugins/container-service/clusters/moo-dev/moo-dev.yml"
    },
    "int": {
      "kubeconfig": "/Users/max/.bluemix/plugins/container-service/clusters/moo-int/moo-int.yml"
    }
  }
}
```
