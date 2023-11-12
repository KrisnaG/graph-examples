import {
  AfterViewInit,
  Component
} from '@angular/core';
import {
  CommonModule
} from '@angular/common';

import * as d3 from 'd3';
import * as fg from 'force-graph';

@Component({
  selector: 'app-force-graph',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './force-graph.component.html',
  styleUrl: './force-graph.component.scss'
})
export class ForceGraphComponent implements AfterViewInit {
  private graphData: any = {
    "nodes": [],
    "links": []
  }
  private nodeValue = 10;
  private height = 800;
  private width = 1000;

  ngAfterViewInit(): void {
    const graph = fg.default();

    d3.json('../../data/dummy.json').then((data: any) => {
      // 
      this.graphData.links = data.links;
      for (const node of data.nodes) {
        this.createNodesAndLinks(node, node.name)
      }

      // 
      graph(document.getElementById('graph') !)
        .width(this.width)
        .height(this.height)  
        .backgroundColor('#101020')
        .linkColor(() => 'rgba(255, 255, 255, 0.5)')
        .linkDirectionalArrowLength(6)
        .linkDirectionalArrowRelPos(1)
        .nodeLabel((node: any) => `${node.id}:${node.group}`)
        .nodeAutoColorBy('group')
        .nodeRelSize(2)
        .nodeVal('val')
        .cooldownTicks(100)
        // Add collision and bounding box forces
        .d3Force('collide', d3.forceCollide(20))
        .d3Force('box', () => {
          const SQUARE_HALF_SIDE = graph.nodeRelSize() * 80 * 0.5;
  
          this.graphData.nodes.forEach((node: any) => {
            const x = node.x || 0, y = node.y || 0;
  
            // bounce on box walls
            if (Math.abs(x) > SQUARE_HALF_SIDE) { node.vx *= -1; }
            if (Math.abs(y) > SQUARE_HALF_SIDE) { node.vy *= -1; }
          });
        })
        .graphData(this.graphData);
      
      graph.d3Force('center', null);

      // fit to canvas when engine stops
      graph.onEngineStop(() => graph.zoomToFit(400));
    })
  }

  private createNodesAndLinks(node: any, group: string) {
    this.graphData.nodes.push({
      "id": node.name,
      "name": node.name,
      "group": group,
      "val": this.nodeValue
    });

    if (node.children && node.children.length > 0) {
      // create junction node between child and parent
      this.graphData.nodes.push({
        "id": `Junction:${node.name}`,
        "name": `Junction:${node.name}`,
        "group": group,
        "val": this.nodeValue
      });

      // point junction to parent
      this.graphData.links.push({
        "source": `Junction:${node.name}`,
        "target": node.name
      });

      // point all children to junction
      for (const child of node.children) {
        this.graphData.links.push({
          "source": child.name,
          "target": `Junction:${node.name}`
        });
        this.createNodesAndLinks(child, group);
      }
    }
  }
}
