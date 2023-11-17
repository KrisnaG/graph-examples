export function createNodesAndLinksWithJunction(data: any, nodeValue?: number): Object {
    const NODE_VALUE = nodeValue ?? 10;
    const graphData: any = {
        "nodes": [],
        "links": []
    }

    graphData.links = data.links;

    const createNodesAndLinks = (node: any, group: string) => {
        graphData.nodes.push({
          "id": node.name,
          "name": node.name,
          "group": group,
          "val": NODE_VALUE
        });

        if (node.children && node.children.length > 0) {
          // create junction node between child and parent
          graphData.nodes.push({
            "id": `Junction:${node.name}`,
            "name": `Junction:${node.name}`,
            "group": group,
            "val": NODE_VALUE
          });

          // point junction to parent
          graphData.links.push({
            "source": `Junction:${node.name}`,
            "target": node.name,
            "name": "Junction"
          });

          // point all children to junction
          for (const child of node.children) {
            graphData.links.push({
              "source": child.name,
              "target": `Junction:${node.name}`,
              "name": "Junction"
            });
            createNodesAndLinks(child, group);
          }
        }
    }

    for (const node of data.nodes) {
        createNodesAndLinks(node, node.name);
    }

    return graphData;
}


export function createNodesAndLinksInHierarchy(data: any, nodeValue?: number): Object {
  const NODE_VALUE = nodeValue ?? 10;
  const graphData: any = {
      "name": 'root',
      "children": [],
      "links": []
  }

  graphData.links = data.links;
  graphData.children = data.nodes;

  const updateNodes = (node: any, group: string) => {
      node.group = group;
      node.value = NODE_VALUE;

      if (node.children && node.children.length > 0) {
        // update all child nodes
        for (const child of node.children) {
          updateNodes(child, group);
        }
      }
  }

  for (const node of data.nodes) {
      updateNodes(node, node.name);
  }

  return graphData;
}

export function createCytoscapeNodesAndEdges(data: any): Object {
  const graphData: any = {
      "nodes": [],
      "edges": []
  }

  for (const link of data.links) {
    graphData.edges.push({
        "data": {
            "label": link.name,
            "source": link.source,
            "target": link.target
        }
    });
  }

  const createNodesAndEdges = (node: any, group: string, parent?: string) => {
      graphData.nodes.push({
        "data": {
          "id": node.name,
          "name": node.name,
          "parent": node.name === parent ? '' : parent,
          "group": group
        }
      });

      if (node.children && node.children.length > 0) {
        for (const child of node.children) {
          createNodesAndEdges(child, group, node.name);
        }
      }
  }

  for (const node of data.nodes) {
      createNodesAndEdges(node, node.name);
  }

  return graphData;
}


export function createInputOutputNodesAndLinks(data: any, nodeValue?: number): Object {
  const NODE_VALUE = nodeValue ?? 10;
  const graphData: any = {
      "nodes": [],
      "links": []
  }

  for(const node of data.nodes) {
    graphData.nodes.push({
      id: node.name,
      val: NODE_VALUE,
      name: node.name,
      group: node.group
    });

    graphData.nodes.push({
      id: `Input-${node.name}`,
      val: NODE_VALUE,
      name: `Input-${node.name}`,
      group: node.group
    });

    graphData.nodes.push({
      id: `Output-${node.name}`,
      val: NODE_VALUE,
      name: `Output-${node.name}`,
      group: node.group
    });

    graphData.links.push({
      name: '',
      source: node.name,
      target: `Input-${node.name}`
    });

    graphData.links.push({
      name: '',
      source: `Input-${node.name}`,
      target: `Output-${node.name}`
    });
  }

  for (const link of data.links) {
    graphData.links.push({
      name: '',
      source: link.source,
      target: `Input-${link.target}`
    });
  }

  return graphData;
}
