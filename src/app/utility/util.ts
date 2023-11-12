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
            "target": node.name
          });
    
          // point all children to junction
          for (const child of node.children) {
            graphData.links.push({
              "source": child.name,
              "target": `Junction:${node.name}`
            });
            createNodesAndLinks(child, group);
          }
        }
    }

    for (const node of data.nodes) {
        createNodesAndLinks(node, node.name)
    }

    return graphData;
}